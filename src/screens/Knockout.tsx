import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { selectFixturesByTournament } from "../store/helpers/selector";
import { bulkUpsertFixtures } from "../store/slice/fixturesSlice";
import { Fixture } from "../types";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  attachTeamNames,
  FixturesWithTeamNames,
} from "../utils/attachTeamNames";
import { generateScoreboard } from "../utils/generateScoreboard";
import { updateTournament } from "../store/slice/tournamentsSlice";
import { RootState } from "../store";
import FixtureActions from "../components/FixtureActions";
import FixtureRow from "../components/FixtureRow";

type Props = NativeStackScreenProps<RootStackParamList, "Knockout">;

export default function Knockout({ navigation, route }: Props) {
  const tournamentId = route.params.id;
  const dispatch = useAppDispatch();

  const currTournament = useAppSelector(
    (state: RootState) => state.tournaments.byId
  )[tournamentId];
  const fixtures = useAppSelector(
    (s) => selectFixturesByTournament(s, tournamentId) as unknown as Fixture[]
  );
  const teamsById = useAppSelector((s) => s.teams.byId);
  const scoreboard = generateScoreboard(
    (attachTeamNames(fixtures as unknown as any, teamsById) ??
      []) as unknown as FixturesWithTeamNames[]
  );

  const tournamentTeamsById = useAppSelector((s) => s.tournamentTeams.byId);
  const playersById = useAppSelector((s) => s.players.byId);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<{
    id: string;
    teamAId: string;
    teamBId: string;
    scoreA?: string;
    scoreB?: string;
    teamAColor?: string;
    teamBColor?: string;
  } | null>(null);

  // compute fixture groups
  const semiFinals = fixtures.filter((f) => f.round === 1001);
  const finalMatch = fixtures.find((f) => f.round === 1002);

  const teamCount = scoreboard.length;

  // --- Auto create knockout fixtures if missing ---
  useEffect(() => {
    if (!scoreboard || scoreboard.length < 2) return;

    // if we already have knockout fixtures, skip
    if (semiFinals.length > 0 || finalMatch) return;
    let currentFixturesMatchCount = fixtures.length;

    // ≤4 teams → only final
    if (teamCount <= 4) {
      const m: Fixture = {
        id: `KO-F-${Date.now()}`,
        tournament_id: tournamentId,
        teamAId: scoreboard[0].teamId,
        teamBId: scoreboard[1].teamId,
        round: 1002,
        matchNumber: ++currentFixturesMatchCount,
        created_at: new Date().toISOString(),
      };
      dispatch(bulkUpsertFixtures([m]));
      return;
    }

    // >=4 teams → semifinals + final (TBA)
    // pick top 4, or top N if N<4
    const top4 = scoreboard.slice(0, 4);

    const sf1: Fixture = {
      id: `KO-SF1-${Date.now()}`,
      tournament_id: tournamentId,
      teamAId: top4[0].teamId,
      teamBId: top4[top4.length - 1].teamId,
      round: 1001,
      matchNumber: ++currentFixturesMatchCount,
      created_at: new Date().toISOString(),
    };

    const sf2: Fixture = {
      id: `KO-SF2-${Date.now()}`,
      tournament_id: tournamentId,
      teamAId: top4[1].teamId,
      teamBId: top4[top4.length - 2].teamId,
      round: 1001,
      matchNumber: ++currentFixturesMatchCount,
      created_at: new Date().toISOString(),
    };

    const finalEmpty: Fixture = {
      id: `KO-F-${Date.now()}`,
      tournament_id: tournamentId,
      teamAId: "TBA-1", // placeholder
      teamBId: "TBA-2",
      round: 1002,
      matchNumber: ++currentFixturesMatchCount,
      created_at: new Date().toISOString(),
    };

    dispatch(bulkUpsertFixtures([sf1, sf2, finalEmpty]));
  }, []);

  useEffect(() => {
    if (teamCount <= 4) return; // final-only tournaments skip
    if (semiFinals.length < 2 || !finalMatch) return;

    const winners = semiFinals.map((m) => m.winnerId).filter(Boolean);

    // final already updated → skip
    if (finalMatch.teamAId !== "TBA-1" && finalMatch.teamBId !== "TBA-2") {
      return;
    }

    if (winners.length === 2) {
      dispatch(
        bulkUpsertFixtures([
          {
            ...finalMatch,
            teamAId: winners[0]!,
            teamBId: winners[1]!,
          },
        ])
      );
    }
  }, [semiFinals, finalMatch?.id, finalMatch?.teamAId, finalMatch?.teamBId]);

  // --- Modal open ---
  const openModal = (matchId: string) => {
    const match = fixtures.find((m) => m.id === matchId);
    if (!match) return;
    setSelectedMatch({
      id: match.id,
      teamAId: match.teamAId,
      teamBId: match.teamBId,
      scoreA: match.teamAScore?.toString() || "",
      scoreB: match.teamBScore?.toString() || "",
      teamAColor: teamsById[match.teamAId]?.color ?? "#94ff55ff",
      teamBColor: teamsById[match.teamBId]?.color ?? "#729ff9ff",
    });
    setModalVisible(true);
  };

  const onSave = () => {
    if (!selectedMatch) return;

    const a = parseInt(selectedMatch.scoreA || "0", 10);
    const b = parseInt(selectedMatch.scoreB || "0", 10);

    if (a === b) {
      Alert.alert("Invalid", "Tie not allowed in knockout");
      return;
    }

    const winner = a > b ? selectedMatch.teamAId : selectedMatch.teamBId;

    const updated = fixtures.map((m) =>
      m.id === selectedMatch.id
        ? {
            ...m,
            teamAScore: a,
            teamBScore: b,
            winnerId: winner,
          }
        : m
    );
    const isFinal = finalMatch && finalMatch.id === selectedMatch.id;
    const proceedSave = () => {
      dispatch(bulkUpsertFixtures(updated));
      if (isFinal) {
        dispatch(
          updateTournament({
            ...currTournament,
            winnerTeamId: winner,
            status: "completed",
          })
        );
      }
      setModalVisible(false);
    };
    if (isFinal) {
      Alert.alert(
        "Finals Result",
        "Make sure the entries are correct. This cannot be changed.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Save",
            style: "default",
            onPress: () => proceedSave(),
          },
        ]
      );
    } else proceedSave();
  };

  // attach names for UI
  const namedSF = attachTeamNames(
    semiFinals,
    teamsById
  ) as unknown as FixturesWithTeamNames[];
  const namedFinal = finalMatch
    ? (
        attachTeamNames(
          [finalMatch],
          teamsById
        ) as unknown as FixturesWithTeamNames[]
      )[0]
    : null;

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
    ? teamLeaders(tournamentId, selectedMatch.teamAId)
    : [];
  const selectedTeamBLeaders = selectedMatch
    ? teamLeaders(tournamentId, selectedMatch.teamBId)
    : [];
  console.log(fixtures);
  return (
    <View className="py-4 px-3 bg-white flex-1">
      <FixtureActions id={tournamentId} />
      {!!namedFinal?.winnerId && (
        <View className="mb-6">
          <Text className="text-2xl font-bold mb-4 text-center text-green-600">
            🏆 {teamsById[namedFinal?.winnerId].name} 🏆
          </Text>
          <Text className="text-xl font-bold mb-4 text-center text-gray-800">
            ✨ Won the Tournament ✨
          </Text>
        </View>
      )}
      {semiFinals.length > 0 && (
        <View className="mb-6">
          <Text className="text-2xl font-bold mb-4 text-center">
            Semi Finals
          </Text>
          <FlatList
            data={namedSF}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <FixtureRow
                item={item}
                handler={openModal}
                activeOpacity={1}
                disabled={!!namedFinal?.winnerId}
                teamALeaders={teamLeaders(tournamentId, item.teamAId)}
                teamBLeaders={teamLeaders(tournamentId, item.teamBId)}
              />
            )}
          />
        </View>
      )}
      {namedFinal && Object.keys(namedFinal).length > 0 && (
        <>
          <Text className="text-2xl font-bold mb-4 text-center">Finals</Text>
          <FlatList
            data={[namedFinal]}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <FixtureRow
                item={item}
                handler={openModal}
                activeOpacity={1}
                disabled={!!namedFinal.winnerId}
                teamALeaders={teamLeaders(tournamentId, item.teamAId)}
                teamBLeaders={teamLeaders(tournamentId, item.teamBId)}
              />
            )}
          />
        </>
      )}

      <Modal visible={modalVisible} animationType="fade" transparent>
        <TouchableOpacity
          className="flex-1 bg-black/40 justify-center items-center p-5"
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
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
                onPress={() => setModalVisible(false)}
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
                  {selectedMatch?.teamAId &&
                    teamsById[selectedMatch.teamAId]?.name}
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
              value={selectedMatch?.scoreA}
              placeholder="Score"
              placeholderTextColor="#595a5aff"
              onChangeText={(txt) =>
                setSelectedMatch((p) => ({ ...p!, scoreA: txt }))
              }
            />

            {/* TEAM B */}
            <View className="mb-1">
              <View className="flex-row gap-2 items-center">
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
                  {selectedMatch?.teamBId &&
                    teamsById[selectedMatch.teamBId]?.name}
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
              value={selectedMatch?.scoreB}
              placeholder="Score"
              placeholderTextColor="#595a5aff"
              onChangeText={(txt) =>
                setSelectedMatch((p) => ({ ...p!, scoreB: txt }))
              }
            />

            <TouchableOpacity
              onPress={onSave}
              className="bg-gray-800 rounded-2xl p-4 mt-2"
            >
              <Text className="text-white text-center font-semibold text-lg">
                Save Result
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
      {/* {fixtures.filter((item: any) => item.round <= 1000).length > 1 && (
        <View className="pb-24 mb-24">
          <Text className="text-2xl font-bold text-center mt-4">
            League Matches Results
          </Text>
          <Text className="text-sm mt-2 mb-4 text-center">
            Note: The league match results cannot be edited
          </Text>
          <FlatList
            data={
              (attachTeamNames(
                fixtures.filter((item: any) => item.round <= 1000),
                teamsById
              ) ?? []) as unknown as FixturesWithTeamNames[]
            }
            keyExtractor={(m) => m.id}
            renderItem={({ item }) => (
              <FixtureRow
                item={item}
                handler={() => {}}
                activeOpacity={0.7}
                disabled={true}
                teamALeaders={teamLeaders(tournamentId, item.teamAId)}
                teamBLeaders={teamLeaders(tournamentId, item.teamBId)}
              />
            )}
          />
        </View>
      )} */}
    </View>
  );
}
