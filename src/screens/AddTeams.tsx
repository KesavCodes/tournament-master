import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  Pressable,
  Alert,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  addTeam,
  updateTeam as updateTeamAction,
  bulkUpsertTeams,
} from "../store/slice/teamsSlice";
import {
  addTournamentTeam,
  updateTournamentTeam,
  bulkUpsertTournamentTeams,
} from "../store/slice/tournamentTeamsSlice";
import { generateCoolTeamNames } from "../utils/generateRandomTeamName";
import {
  Team as TeamType,
  TournamentTeam as TournamentTeamType,
} from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "AddTeams">;

const DEFAULT_PALETTE = [
  // RED
  "#FCA5A5", // red-300
  "#EF4444", // red-500
  "#B91C1C", // red-700

  // BLUE
  "#93C5FD", // blue-300
  "#3B82F6", // blue-500
  "#1D4ED8", // blue-700

  // GREEN (EMERALD)
  "#6EE7B7", // emerald-300
  "#10B981", // emerald-500
  "#047857", // emerald-700

  // AMBER
  "#FCD34D", // amber-300
  "#F59E0B", // amber-500
  "#B45309", // amber-700

  // VIOLET
  "#C4B5FD", // violet-300
  "#8B5CF6", // violet-500
  "#6D28D9", // violet-700

  // PINK
  "#F9A8D4", // pink-300
  "#EC4899", // pink-500
  "#BE185D", // pink-700

  // ORANGE
  "#FDBA74", // orange-300
  "#F97316", // orange-500
  "#C2410C", // orange-700

  // CYAN
  "#67E8F9", // cyan-300
  "#06B6D4", // cyan-500
  "#0E7490", // cyan-700

  // TEAL
  "#5EEAD4", // teal-300
  "#0EA5A4", // teal-500
  "#115E59", // teal-700

  // GRAY (NEUTRAL)
  "#D1D5DB", // gray-300
  "#6B7280", // gray-500
  "#374151", // gray-700

  // INDIGO
  "#A5B4FC", // indigo-300
  "#6366F1", // indigo-500
  "#4338CA", // indigo-700

  // LIME
  "#BEF264", // lime-300
  "#84CC16", // lime-500
  "#4D7C0F", // lime-700

  // ROSE
  "#FDA4AF", // rose-300
  "#F43F5E", // rose-500
  "#BE123C", // rose-700

  // SKY
  "#7DD3FC", // sky-300
  "#0EA5E9", // sky-500
  "#0369A1", // sky-700

  // FUCHSIA
  "#F0ABFC", // fuchsia-300
  "#D946EF", // fuchsia-500
  "#A21CAF", // fuchsia-700
];

export default function AddTeamsScreen({ navigation, route }: Props) {
  const { id: tournamentId } = route.params;
  const dispatch = useAppDispatch();

  // sources
  const tournamentsById = useAppSelector((s) => s.tournaments.byId);
  const tournament = tournamentsById[tournamentId];
  const teamsById = useAppSelector((s) => s.teams.byId);
  const tournamentTeamsById = useAppSelector((s) => s.tournamentTeams.byId);

  // number of teams expected (from tournament record)
  const expectedCount = tournament?.noOfTeams ?? 2;

  // local editable state for teams (we keep Team objects locally before saving)
  const [localTeams, setLocalTeams] = useState<TeamType[]>([]);

  // color picker modal state
  const [colorModalVisible, setColorModalVisible] = useState(false);
  const [colorModalTargetIndex, setColorModalTargetIndex] = useState<
    number | null
  >(null);
  const [hexInput, setHexInput] = useState<string>("");
  const uniqueColors = useRef<string[]>([]);

  function randomColorFromPalette(palette: string[]) {
    if (uniqueColors.current.length >= palette.length / 2) {
      uniqueColors.current = [];
    }
    let randomizedColor = palette[Math.floor(Math.random() * palette.length)];
    while (uniqueColors.current.includes(randomizedColor))
      randomizedColor = palette[Math.floor(Math.random() * palette.length)];
    uniqueColors.current.push(randomizedColor);
    return randomizedColor;
  }

  function makeDummyTeam(index: number, color?: string): TeamType {
    return {
      id: Date.now().toString() + "-" + index,
      name: `Team ${index + 1}`,
      color: color ?? randomColorFromPalette(DEFAULT_PALETTE),
      logo_url: null,
      created_at: new Date().toISOString(),
    };
  }

  // on mount: build initial localTeams from existing tournamentTeams or create dummies
  useEffect(() => {
    const existingTTs = Object.values(tournamentTeamsById).filter(
      (tt) => tt.tournament_id === tournamentId
    );

    // prefer tournamentTeams -> resolve their global_team_id to full team object
    if (existingTTs.length > 0) {
      const resolved = existingTTs.slice(0, expectedCount).map((tt, idx) => {
        const global = teamsById[tt.global_team_id];
        if (global) return { ...global };
        // fallback dummy
        return makeDummyTeam(idx);
      });

      // if tournament was expanded after creation, add more
      while (resolved.length < expectedCount) {
        resolved.push(makeDummyTeam(resolved.length));
      }

      setLocalTeams(resolved);
      return;
    }

    // No existing tournament teams -> create dummy teams of expectedCount
    const dummies: TeamType[] = [];
    for (let i = 0; i < expectedCount; i++) {
      dummies.push(makeDummyTeam(i));
    }
    setLocalTeams(dummies);
  }, [expectedCount, teamsById, tournamentId, tournamentTeamsById]);

  // helper: update local team fields
  const updateLocalTeam = (index: number, patch: Partial<TeamType>) => {
    setLocalTeams((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...patch };
      return copy;
    });
  };

  // generate cool names
  const onGenerateCoolNames = () => {
    const names = generateCoolTeamNames(localTeams.length);
    setLocalTeams((prev) =>
      prev.map((t, i) => ({ ...t, name: names[i] ?? t.name }))
    );
  };

  // open color modal
  const openColorModal = (index: number) => {
    setColorModalTargetIndex(index);
    setHexInput(localTeams[index]?.color ?? "");
    setColorModalVisible(true);
  };

  const applyColorFromModal = (colorHex: string) => {
    if (colorModalTargetIndex === null) return;
    updateLocalTeam(colorModalTargetIndex, { color: colorHex });
    setColorModalVisible(false);
    setColorModalTargetIndex(null);
    setHexInput("");
  };

  // Save: create global team records and tournamentTeam records (one-to-one)
  const saveTeams = () => {
    if (!tournament) {
      Alert.alert("Error", "Tournament not found.");
      return;
    }

    if (localTeams.length !== expectedCount) {
      Alert.alert(
        "Error",
        `Expected ${expectedCount} teams. Current: ${localTeams.length}`
      );
      return;
    }

    // 1️⃣ Normalize & upsert all teams into teamsSlice
    const normalizedTeams = localTeams.map((team) => {
      const existing = teamsById[team.id];
      return {
        id: existing ? existing.id : team.id, // stable id
        name: team.name.trim(),
        color: team.color,
        logo_url: team.logo_url ?? null,
        created_at: existing?.created_at ?? new Date().toISOString(),
      };
    });

    // Bulk upsert teams into global slice
    dispatch(bulkUpsertTeams(normalizedTeams));

    // 2️⃣ Create TournamentTeam records (one per team)
    const ttRecords: TournamentTeamType[] = normalizedTeams.map((t, index) => {
      // Check if TT already exists for this team
      const existingTT = Object.values(tournamentTeamsById).find(
        (tt) => tt.tournament_id === tournamentId && tt.global_team_id === t.id
      );

      return {
        id: existingTT ? existingTT.id : Date.now().toString() + "-tt-" + index,
        tournament_id: tournamentId,
        global_team_id: t.id,
        players: existingTT?.players ?? [],
        created_at: existingTT?.created_at ?? new Date().toISOString(),
      };
    });

    dispatch(bulkUpsertTournamentTeams(ttRecords));

    // 3️⃣ Navigate to the next screen
    navigation.navigate("AddPlayers", { id: tournamentId });
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      e.preventDefault();
      navigation.navigate("CreateTournament", { id: tournamentId });
    });

    return unsubscribe;
  }, [navigation]);

  // When user goes back and changes number in CreateTournament, we must reconcile.
  // Since CreateTournament updates tournament.noOfTeams, AddTeams is remounted and localTeams effect runs again.
  // So reconciliation (increase/decrease) is already handled in effect above.

  return (
    <View className="flex-1 bg-gray-100 py-4 px-3">
      <Text className="text-2xl font-bold mb-4">
        Setup Teams ({expectedCount})
      </Text>

      <View className="flex-row justify-between mb-3">
        <TouchableOpacity
          activeOpacity={1}
          className="bg-gray-800 px-3 py-2 rounded-2xl mr-2"
          onPress={onGenerateCoolNames}
        >
          <Text className="text-white font-semibold">
            Generate Cool Team Names
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="border border-1 border-gray-800 px-3 py-2 rounded-2xl"
          activeOpacity={1}
          onPress={() => {
            // refill with new random colors while keeping names
            setLocalTeams((prev) =>
              prev.map((t) => ({
                ...t,
                color: randomColorFromPalette(DEFAULT_PALETTE),
              }))
            );
          }}
        >
          <Text className="text-gray-800 font-semibold">Randomize Colors</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={localTeams}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View className="bg-white rounded-2xl p-3 mb-3 flex-row items-start justify-between">
            <View className="flex-1 pr-3">
              <TextInput
                value={item.name}
                onChangeText={(text) => updateLocalTeam(index, { name: text })}
                className="border p-2 rounded-xl mb-2"
                placeholder={`Team ${index + 1}`}
                placeholderTextColor="#595a5aff"
                maxLength={30}
              />
              <Text className="text-sm text-gray-500">Team #{index + 1}</Text>
            </View>

            <View className="items-end">
              <TouchableOpacity
                onPress={() => openColorModal(index)}
                className="w-14 h-14 rounded-xl items-center justify-center border border-1"
                style={{ backgroundColor: item.color ?? "#ddd" }}
              />
            </View>
          </View>
        )}
        ListEmptyComponent={<Text>No teams to show</Text>}
      />

      <TouchableOpacity
        className="bg-gray-800 py-3 rounded-2xl mt-4 mb-10"
        onPress={saveTeams}
        activeOpacity={1}
      >
        <Text className="text-white text-center font-semibold">Save Teams</Text>
      </TouchableOpacity>

      {/* COLOR MODAL */}
      <Modal visible={colorModalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/40 items-center justify-center p-6">
          <View className="bg-white w-full rounded-2xl p-4">
            <Text className="text-lg font-semibold mb-3">Pick a color</Text>

            <View className="flex-row flex-wrap mb-4">
              {DEFAULT_PALETTE.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => applyColorFromModal(c)}
                  style={{
                    backgroundColor: c,
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    margin: 6,
                  }}
                />
              ))}
            </View>

            <Text className="text-sm text-gray-500 mb-2">Or enter HEX</Text>
            <TextInput
              value={hexInput}
              onChangeText={setHexInput}
              placeholder="#FF0000"
              className="border p-2 rounded-xl mb-4"
              placeholderTextColor="#595a5aff"
            />

            <View className="flex-row justify-end">
              <TouchableOpacity
                onPress={() => setColorModalVisible(false)}
                className="px-4 py-2 rounded-2xl mr-2 bg-gray-200"
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  let hex = hexInput.startsWith("#")
                    ? hexInput
                    : `#${hexInput}`;
                  applyColorFromModal(hex);
                }}
                className="px-4 py-2 rounded-2xl bg-gray-800"
              >
                <Text className="text-white">Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
