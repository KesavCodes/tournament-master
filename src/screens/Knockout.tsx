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
import { useSelector } from "react-redux";
import { RootState } from "../store";

type Props = NativeStackScreenProps<RootStackParamList, "Knockout">;

export default function Knockout({ navigation, route }: Props) {
  const tournamentId = route.params.id;
  const dispatch = useAppDispatch();

  const currTournament = useSelector((state: RootState) => state.tournaments.byId)[
    tournamentId
  ];
  const fixtures = useAppSelector(
    (s) => selectFixturesByTournament(s, tournamentId) as unknown as Fixture[]
  );
  const teamsById = useAppSelector((s) => s.teams.byId);
  const scoreboard = generateScoreboard(
    (attachTeamNames(fixtures as unknown as any, teamsById) ??
      []) as unknown as FixturesWithTeamNames[]
  );

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<{
    id: string;
    teamAId: string;
    teamBId: string;
    scoreA?: string;
    scoreB?: string;
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
      teamAId: "TBA", // placeholder
      teamBId: "TBA",
      round: 1002,
      matchNumber: ++currentFixturesMatchCount,
      created_at: new Date().toISOString(),
    };

    dispatch(bulkUpsertFixtures([sf1, sf2, finalEmpty]));
  }, []);

  // --- When semifinals winners available, populate final ---
  useEffect(() => {
    if (teamCount <= 4) return; // final only case

    // ensure we have 2 SF
    if (semiFinals.length < 2 || !finalMatch) return;

    const winners = semiFinals.map((m) => m.winnerId).filter(Boolean);

    if (winners.length === 2) {
      const updatedFinal: Fixture = {
        ...finalMatch,
        teamAId: winners[0]!,
        teamBId: winners[1]!,
      };
      dispatch(bulkUpsertFixtures([updatedFinal]));
    }
  }, [semiFinals, finalMatch]);

  // --- Modal open ---
  const openModal = (match: Fixture) => {
    setSelectedMatch({
      id: match.id,
      teamAId: match.teamAId,
      teamBId: match.teamBId,
      scoreA: match.teamAScore?.toString() || "",
      scoreB: match.teamBScore?.toString() || "",
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
    dispatch(bulkUpsertFixtures(updated));
    if (isFinal) {
      updateTournament({
        ...currTournament,
        winnerTeamId: winner,
        status: "completed",
      });
      navigation.navigate("Home");
    }
    setModalVisible(false);
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

  return (
    <View className="flex-1 p-5">
      {semiFinals.length > 0 && (
        <>
          <Text className="text-lg font-semibold mb-2">Semi Finals</Text>
          <FlatList
            data={namedSF}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="bg-gray-200 p-3 rounded-xl mb-3"
                onPress={() => openModal(item)}
              >
                <Text className="font-semibold">
                  {item.teamA} vs {item.teamB}
                </Text>
                {item.teamAScore !== undefined && (
                  <Text className="mt-1 text-gray-700">
                    {item.teamAScore} - {item.teamBScore}
                  </Text>
                )}
              </TouchableOpacity>
            )}
          />
        </>
      )}

      <Text className="text-lg font-semibold mt-6 mb-2">Final</Text>

      {namedFinal && (
        <TouchableOpacity
          className="bg-yellow-200 p-4 rounded-xl"
          onPress={() => openModal(namedFinal)}
        >
          <Text className="font-semibold text-lg text-center">
            🏆{" "}
            {namedFinal.teamA === "TBA" || namedFinal.teamB === "TBA"
              ? `TBA vs TBA`
              : `${namedFinal.teamA}   |   ${namedFinal.teamB}`}{" "}
            🏆
          </Text>
          {namedFinal.teamAScore !== undefined && (
            <Text className="mt-1 font-semibold">
              {namedFinal.teamAScore} - {namedFinal.teamBScore}
            </Text>
          )}
        </TouchableOpacity>
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
            <Text className="text-lg font-semibold mb-1">
              {selectedMatch?.teamAId && teamsById[selectedMatch.teamAId]?.name}
            </Text>
            <TextInput
              className="border border-gray-400 rounded-xl p-3 text-lg mb-4"
              keyboardType="numeric"
              value={selectedMatch?.scoreA}
              placeholder="Score"
              onChangeText={(txt) =>
                setSelectedMatch((p) => ({ ...p!, scoreA: txt }))
              }
            />

            {/* TEAM B */}
            <Text className="text-lg font-semibold mb-1">
              {selectedMatch?.teamBId && teamsById[selectedMatch.teamBId]?.name}
            </Text>
            <TextInput
              className="border border-gray-400 rounded-xl p-3 text-lg mb-4"
              keyboardType="numeric"
              value={selectedMatch?.scoreB}
              placeholder="Score"
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
    </View>
  );
}
