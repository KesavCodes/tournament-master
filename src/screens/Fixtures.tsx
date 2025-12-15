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
import { selectFixturesByTournament } from "../store/helpers/selector";
import { Fixture } from "../types";
import {
  attachTeamNames,
  FixturesWithTeamNames,
} from "./../utils/attachTeamNames";
import { bulkUpsertFixtures } from "../store/slice/fixturesSlice";
import { updateTournament } from "../store/slice/tournamentsSlice";
import FixtureActions from "../components/FixtureActions";
import FixtureRow from "../components/FixtureRow";

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

  let currTournamentFixtures = useAppSelector(
    (state: RootState): Fixture[] =>
      selectFixturesByTournament(
        state,
        currTournamentId
      ) as unknown as Fixture[]
  );
  const currTournament = useAppSelector(
    (state: RootState) => state.tournaments.byId
  )[currTournamentId];

  currTournamentFixtures = currTournamentFixtures.filter(
    (item: any) => item.round <= 1000
  );
  const teamsById = useAppSelector((state: RootState) => state.teams.byId);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!currTournamentFixtures || currTournamentFixtures.length === 0)
      navigation.navigate("Home");
  }, [currTournamentFixtures.length, navigation]);

  const matchResultHandler = (matchId: string) => {
    const match = currTournamentFixtures.find((m) => m.id === matchId);
    if (!match) return;
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

  const proceedToKnockout = () => {
    dispatch(
      updateTournament({
        ...currTournament,
        status: "knockout",
      })
    );
    navigation.navigate("Knockout", { id: currTournamentId });
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      e.preventDefault();
      navigation.navigate("Home");
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <View className="flex-1 bg-white py-4 px-3">
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
      <FixtureActions id={currTournamentId} />
      <Text className="text-2xl font-bold mb-4 text-center">Fixtures</Text>

      {/* ---------------- FIXTURE LIST ---------------- */}
      <FlatList
        data={
          (attachTeamNames(currTournamentFixtures, teamsById) ??
            []) as unknown as FixturesWithTeamNames[]
        }
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => (
          <FixtureRow
            item={item}
            handler={matchResultHandler}
            activeOpacity={0.7}
            disabled={false}
          />
        )}
      />

      {/* ---------------- PROCEED BUTTON ---------------- */}
      {currTournamentFixtures?.length > 1 && (
        <TouchableOpacity
          className={`rounded-2xl p-3 mt-4 mb-10 ${
            !canNavigateToFinals ? "bg-gray-400" : "bg-gray-800"
          }`}
          disabled={!canNavigateToFinals}
          onPress={proceedToKnockout}
        >
          <Text className="text-white text-center text-lg font-semibold">
            Proceed to Knockouts
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
