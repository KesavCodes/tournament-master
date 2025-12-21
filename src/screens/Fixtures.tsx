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
    teamAColor: string;
    teamBColor: string;
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

  const tournamentTeamsById = useAppSelector((s) => s.tournamentTeams.byId);
  const playersById = useAppSelector((s) => s.players.byId);

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
      teamAColor: teamsById[match.teamAId].color ?? "#94ff55ff",
      teamBColor: teamsById[match.teamBId].color ?? "#729ff9ff",
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

  const teamLeaders = (tournamentId: string, teamId: string) => {
    const tournamentTeam = Object.values(tournamentTeamsById).find(
      (tt) => tt.tournament_id === tournamentId && tt.global_team_id === teamId
    );
    return Object.entries(tournamentTeam?.playerRoles || {})
      .map(([key, roles]) => ({ key, roles }))
      .filter(
        ({ roles }) =>
          roles.includes("captain") || roles.includes("vice_captain")
      )
      .map(({ key, roles }) => ({ name: playersById[key]?.name, role: roles }))
      .sort((a, _) => (a.role.includes("captain") ? 1 : -1));
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      e.preventDefault();
      navigation.navigate("Home");
    });

    return unsubscribe;
  }, [navigation]);

  const selectedTeamALeaders = selectedMatch
    ? teamLeaders(currTournamentId, selectedMatch.teamAId)
    : [];
  const selectedTeamBLeaders = selectedMatch
    ? teamLeaders(currTournamentId, selectedMatch.teamBId)
    : [];
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
            <View className="mb-1">
              <View className="flex-row gap-2 items-center">
                <View
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    borderWidth: 1,
                    borderColor: "#00000055",
                    backgroundColor: selectedMatch?.teamAColor,
                  }}
                />
                <Text className="text-lg font-semibold mb-1">
                  {selectedMatch?.teamA}
                </Text>
              </View>
              <View className="flex-row mb-1 pl-1">
                {selectedTeamALeaders.length > 0 && selectedTeamALeaders[0] && (
                  <Text className="text-sm text-gray-700">
                    {selectedTeamALeaders[0].name} (c)
                  </Text>
                )}
                {selectedTeamALeaders.length > 0 && selectedTeamALeaders[1] && (
                  <Text className="text-sm text-gray-700">
                    , {selectedTeamALeaders[1].name} (vc)
                  </Text>
                )}
              </View>
            </View>
            <TextInput
              className="border border-gray-400 rounded-xl p-3 text-lg mb-4"
              keyboardType="numeric"
              value={selectedMatch?.teamAScore}
              placeholder="Score"
              placeholderTextColor="#595a5aff"
              onChangeText={(txt) =>
                setSelectedMatch((p) => ({ ...p!, teamAScore: txt }))
              }
            />

            {/* TEAM B */}
            <View className="mb-1">
              <View className="flex-row gap-2 items-center ">
                <View
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    borderWidth: 1,
                    borderColor: "#00000055",
                    backgroundColor: selectedMatch?.teamBColor,
                  }}
                />
                <Text className="text-lg font-semibold mb-1">
                  {selectedMatch?.teamB}
                </Text>
              </View>
              <View className="flex-row mb-1 pl-1">
                {selectedTeamBLeaders.length > 0 && selectedTeamBLeaders[0] && (
                  <Text className="text-sm text-gray-700">
                    {selectedTeamBLeaders[0].name} (c)
                  </Text>
                )}
                {selectedTeamBLeaders.length > 0 && selectedTeamBLeaders[1] && (
                  <Text className="text-sm text-gray-700">
                    , {selectedTeamBLeaders[1].name} (vc)
                  </Text>
                )}
              </View>
            </View>
            <TextInput
              className="border border-gray-400 rounded-xl p-3 text-lg mb-4"
              keyboardType="numeric"
              value={selectedMatch?.teamBScore}
              placeholder="Score"
              placeholderTextColor="#595a5aff"
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
            teamALeaders={teamLeaders(currTournamentId, item.teamAId)}
            teamBLeaders={teamLeaders(currTournamentId, item.teamBId)}
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
