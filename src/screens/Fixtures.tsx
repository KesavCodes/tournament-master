import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import React, { useEffect } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { RootState } from "../store";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  selectFixturesByTournament,
} from "../store/helpers/selector";
import { Fixture } from "../types";
import {
  attachTeamNames,
  FixturesWithTeamNames,
} from "./../utils/attachTeamNames";
import { bulkUpsertFixtures } from "../store/slice/fixturesSlice";

type Props = NativeStackScreenProps<RootStackParamList, "Fixtures">;

export default function Fixtures({ navigation, route }: Props) {
  const { id: currTournamentId } = route.params;

  const [showModal, setShowModal] = React.useState(false);
  const [selectedMatch, setSelectedMatch] = React.useState<{
    id: string;
    teamA: string;
    teamB: string;
    teamAId: string;
    teamBId: string;
    teamAScore?: string;
    teamBScore?: string;
  } | null>(null);

  const currTournamentFixtures = useAppSelector(
    (state: RootState): Fixture[] =>
      selectFixturesByTournament(
        state,
        currTournamentId
      ) as unknown as Fixture[]
  );
  const teamsById = useAppSelector((state: RootState) => state.teams.byId);
  const dispatch = useAppDispatch();

  if (!currTournamentFixtures || currTournamentFixtures.length === 0)
    navigation.navigate("Home");

  const matchResultHandler = (matchId: string) => {
    const match = currTournamentFixtures.find((m) => m.id === matchId);
    if (!match) return;
    console.log(match, "--match");
    console.log(teamsById);
    setSelectedMatch({
      id: match.id,
      teamA: teamsById[match.teamAId].name,
      teamB: teamsById[match.teamBId].name,
      teamAId: match.teamAId,
      teamBId: match.teamBId,
      teamAScore: match.teamAScore?.toString() || "",
      teamBScore: match.teamBScore?.toString() || "",
    });

    setShowModal(true);
  };

  // -------------------------
  // SAVE SCORES + DETERMINE WINNER
  // -------------------------
  const submitScore = () => {
    if (!selectedMatch) return;

    const aScore = parseInt(selectedMatch.teamAScore || "0", 10);
    const bScore = parseInt(selectedMatch.teamBScore || "0", 10);

    // validation
    if (isNaN(aScore) || isNaN(bScore)) {
      Alert.alert("Invalid score", "Please enter valid scores.");
      return;
    }

    if (aScore === bScore) {
      Alert.alert("Invalid result", "Scores cannot be equal.");
      return;
    }

    const winner =
      aScore > bScore ? selectedMatch.teamAId : selectedMatch.teamBId;

    const updatedFixtures = currTournamentFixtures.map((match) =>
      match.id === selectedMatch.id
        ? {
            ...match,
            teamAScore: aScore,
            teamBScore: bScore,
            winnerId: winner,
          }
        : match
    );

    dispatch(bulkUpsertFixtures(updatedFixtures));

    setShowModal(false);
  };

  const canNavigateToFinals = currTournamentFixtures.every(
    (match) => match.winnerId !== undefined
  );

  React.useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      e.preventDefault();
      navigation.navigate("Home");
    });

    return unsubscribe;
  }, [navigation]);

  console.log(currTournamentFixtures, "check")
  return (
    <View className="flex-1 bg-white p-5">
      {/* ---------------- MODAL FOR SCORE ENTRY ---------------- */}
      <Modal
        visible={showModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/40 justify-center items-center p-5"
          activeOpacity={1}
          onPress={() => setShowModal(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            className="bg-white w-full rounded-2xl p-4"
          >
            <View className="flex-row justify-between mb-4">
              <Text className="text-2xl font-bold flex-1 text-center">
                Record Result
              </Text>
              <Ionicons
                name="close-circle-outline"
                color="black"
                size={26}
                onPress={() => setShowModal(false)}
              />
            </View>

            {/* TEAM A */}
            <Text className="text-lg font-semibold mb-1">
              {selectedMatch?.teamA}
            </Text>
            <TextInput
              className="border border-gray-400 rounded-xl p-3 text-lg mb-4"
              keyboardType="numeric"
              value={selectedMatch?.teamAScore}
              placeholder="Score"
              onChangeText={(txt) =>
                setSelectedMatch((p) => ({ ...p!, teamAScore: txt }))
              }
            />

            {/* TEAM B */}
            <Text className="text-lg font-semibold mb-1">
              {selectedMatch?.teamB}
            </Text>
            <TextInput
              className="border border-gray-400 rounded-xl p-3 text-lg mb-4"
              keyboardType="numeric"
              value={selectedMatch?.teamBScore}
              placeholder="Score"
              onChangeText={(txt) =>
                setSelectedMatch((p) => ({ ...p!, teamBScore: txt }))
              }
            />

            <TouchableOpacity
              onPress={submitScore}
              className="bg-gray-800 rounded-2xl p-4 mt-2"
            >
              <Text className="text-white text-center font-semibold text-lg">
                Save Result
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* ---------------- ACTION BUTTONS ---------------- */}
      <View className="flex flex-row justify-between pb-4">
        <TouchableOpacity
          className="bg-gray-800 rounded-2xl p-3 mb-3 w-[48%]"
          onPress={() =>
            navigation.navigate("Scoreboard", { id: currTournamentId })
          }
        >
          <Text className="text-white text-center text-lg font-semibold">
            Scoreboard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-gray-800 rounded-2xl p-3 mb-3 w-[48%]"
          onPress={() =>
            navigation.navigate("TeamInfo", { id: currTournamentId })
          }
        >
          <Text className="text-white text-center text-lg font-semibold">
            Team Info
          </Text>
        </TouchableOpacity>
      </View>

      <Text className="text-2xl font-bold mb-4 text-center">Fixtures</Text>

      {/* ---------------- FIXTURE LIST ---------------- */}
      <FlatList
        data={
          (attachTeamNames(currTournamentFixtures, teamsById) ??
            []) as unknown as FixturesWithTeamNames[]
        }
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => {
          const hasResult = item.winnerId !== undefined;
          const teamAWin = hasResult && item.winnerId === item.teamAId;
          const teamBWin = hasResult && item.winnerId === item.teamBId;

          return (
            <TouchableOpacity
              className="border bg-gray-100 border-gray-200 rounded-2xl p-3 mb-3"
              onPress={() => matchResultHandler(item.id)}
              activeOpacity={0.7}
            >
              {/* TEAM ROW */}
              <View className="flex flex-row justify-between mb-2">
                {/* TEAM A */}
                <Text
                  className={`w-[49%] border-0 border-r-2 pr-2 text-base ${
                    teamAWin ? "font-bold text-green-600" : "text-gray-700"
                  }`}
                  numberOfLines={1}
                >
                  {item.teamA} {teamAWin ? "🏆" : ""}
                </Text>

                {/* TEAM B */}
                <Text
                  className={`w-[49%] text-right text-base ${
                    teamBWin ? "font-bold text-green-600" : "text-gray-700"
                  }`}
                  numberOfLines={1}
                >
                  {item.teamB} {teamBWin ? "🏆" : ""}
                </Text>
              </View>

              {/* INLINE SCORE BADGE */}
              {hasResult &&
              item.teamAScore !== undefined &&
              item.teamBScore !== undefined ? (
                <View className="bg-gray-800 rounded-xl px-3 py-2 self-start">
                  <Text className="text-white font-semibold">
                    {item.teamA} {item.teamAScore} - {item.teamBScore}{" "}
                    {item.teamB}
                  </Text>
                </View>
              ) : (
                <Text className="text-gray-500">Tap to record result</Text>
              )}
            </TouchableOpacity>
          );
        }}
      />

      {/* ---------------- PROCEED BUTTON ---------------- */}
      <TouchableOpacity
        className={`rounded-2xl p-3 mt-3 ${
          !canNavigateToFinals ? "bg-gray-400" : "bg-gray-800"
        }`}
        disabled={!canNavigateToFinals}
        onPress={() =>
          navigation.navigate("TeamInfo", { id: currTournamentId })
        }
      >
        <Text className="text-white text-center text-lg font-semibold">
          Proceed to Knockouts
        </Text>
      </TouchableOpacity>
    </View>
  );
}
