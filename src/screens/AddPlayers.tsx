import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  // addPlayer,
  bulkUpsertPlayers,
} from "../store/slice/playersSlice";
import {
  updateTournamentTeam,
  // addTournamentTeam,
} from "../store/slice/tournamentTeamsSlice";
import Ionicons from "@expo/vector-icons/Ionicons";

type Props = NativeStackScreenProps<RootStackParamList, "AddPlayers">;

interface LocalPlayer {
  id: string;
  name: string;
  teamId?: string | undefined;
}

export default function AddPlayersScreen({ navigation, route }: Props) {
  const { id: tournamentId } = route.params;
  const dispatch = useAppDispatch();

  // selectors
  const tournamentsById = useAppSelector((s) => s.tournaments.byId);
  const tournament = tournamentsById[tournamentId];
  const tournamentTeamsById = useAppSelector((s) => s.tournamentTeams.byId);
  const teamsById = useAppSelector((s) => s.teams.byId);
  const playersById = useAppSelector((s) => s.players.byId);

  // tournament teams (only those for this tournament)
  const tournamentTeams = useMemo(
    () =>
      Object.values(tournamentTeamsById).filter(
        (tt) => tt.tournament_id === tournamentId
      ),
    [tournamentTeamsById, tournamentId]
  );

  // build initial local players from tournamentTeams players arrays OR empty
  const initialLocalPlayers: LocalPlayer[] = useMemo(() => {
    // if there are players referenced in tournamentTeams, expand them into player objects
    const pIds = new Set<string>();
    tournamentTeams.forEach((tt) => {
      (tt.players || []).forEach((pid) => pIds.add(pid));
    });

    if (pIds.size > 0) {
      return Array.from(pIds).map((pid) => {
        const p = playersById[pid];
        return {
          id: pid,
          name: p?.name ?? "Unknown",
          teamId: (() => {
            // find which tournamentTeam contains this pid
            const winnerTT = tournamentTeams.find((tt) =>
              (tt.players || []).includes(pid)
            );
            return winnerTT?.id;
          })(),
        };
      });
    }

    // no pre-existing players -> start empty
    return [];
  }, [tournamentTeams, playersById]);

  const [localPlayers, setLocalPlayers] =
    useState<LocalPlayer[]>(initialLocalPlayers);
  const [playerName, setPlayerName] = useState("");
  const [errorPlayerEmpty, setErrorPlayerEmpty] = useState(false);

  // ensure local players update when tournamentTeams change externally
  useEffect(() => {
    setLocalPlayers(initialLocalPlayers);
  }, [initialLocalPlayers]);

  // helpers
  const addLocalPlayer = () => {
    if (!playerName.trim()) {
      setErrorPlayerEmpty(true);
      return;
    }
    const p: LocalPlayer = {
      id: Date.now().toString(),
      name: playerName.trim(),
      teamId: undefined,
    };
    setLocalPlayers((s) => [...s, p]);
    setPlayerName("");
    setErrorPlayerEmpty(false);
  };

  const updateLocalPlayer = (id: string, patch: Partial<LocalPlayer>) => {
    setLocalPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch } : p))
    );
  };

  const removeLocalPlayer = (id: string) => {
    Alert.alert("Delete player", "Delete this player?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => setLocalPlayers((p) => p.filter((x) => x.id !== id)),
      },
    ]);
  };

  // round-robin randomize players to teams
  const randomizeTeams = () => {
    if (!tournamentTeams.length || !localPlayers.length) return;
    // shuffle players
    const shuffled = [...localPlayers].sort(() => Math.random() - 0.5);
    const assigned = shuffled.map((p, i) => ({
      ...p,
      teamId: tournamentTeams[i % tournamentTeams.length].id,
    }));
    // keep original order by id insertion time (optional)
    setLocalPlayers(assigned);
  };

  const playerGroups = useAppSelector((s) => s.playerGroups.byId);

  // import from player group (example: get first group and populate)
  // Replace with your real player group selection UI
  const importFromGroup = (groupId: string) => {
    // selector for group members not provided here; assume you have playerGroupMembers slice
    const groupMembers = useAppSelector((s) =>
      Object.values(s.playerGroupMembers.byId).filter(
        (m) => m.group_id === groupId
      )
    );
    const playersToImport = groupMembers.map((m) => {
      const p = playersById[m.player_id];
      return {
        id: Date.now().toString() + "-" + m.player_id,
        name: p?.name ?? "Unknown",
        teamId: undefined,
      } as LocalPlayer;
    });
    setLocalPlayers((prev) => [...prev, ...playersToImport]);
  };

  // proceed: persist players (global) and update tournamentTeam.players arrays
  const proceed = () => {
    // validate: at least one player and every player has teamId
    if (localPlayers.length === 0) {
      Alert.alert("Add players", "Please add at least 1 player.");
      return;
    }
    const unassigned = localPlayers.some((p) => !p.teamId);
    if (unassigned) {
      Alert.alert(
        "Assign teams",
        "Please assign a team to every player (or use Randomize Teams)."
      );
      return;
    }

    // 1. create player records (global players)
    const playersToCreate = localPlayers.map((p) => ({
      id: p.id,
      name: p.name,
      logo_url: null,
      created_at: new Date().toISOString(),
    }));
    dispatch(bulkUpsertPlayers(playersToCreate));

    // 2. update each tournamentTeam players[] with assigned player ids
    // We'll build a mapping ttId -> playerIds[]
    const ttMap: Record<string, string[]> = {};
    localPlayers.forEach((p) => {
      const ttid = p.teamId!;
      if (!ttMap[ttid]) ttMap[ttid] = [];
      ttMap[ttid].push(p.id);
    });

    // For each tournamentTeam record, we will set players to the mapped array
    tournamentTeams.forEach((tt) => {
      const newPlayers = ttMap[tt.id] ?? [];
      // use updateTournamentTeam action to set players
      dispatch(updateTournamentTeam({ ...tt, players: newPlayers }));
    });

    // Mark tournament as config completed
    // dispatch(updateTournament(...)) // if you have a tournament update action; otherwise handle elsewhere

    navigation.navigate("Fixtures", { id: tournamentId });
  };

  const allAssigned =
    localPlayers.length > 0 && localPlayers.every((p) => !!p.teamId);

  return (
    <View className="flex-1 bg-gray-100 p-4">
      <Text className="text-2xl font-bold mb-3">Add Players</Text>

      {/* add player input */}
      <View className="flex-row mb-4 items-center">
        <TextInput
          className="flex-1 border p-2 rounded-xl mr-3"
          placeholder="Enter player name"
          value={playerName}
          onChangeText={(t) => {
            setPlayerName(t);
            setErrorPlayerEmpty(false);
          }}
        />
        <TouchableOpacity
          activeOpacity={1}
          className="bg-gray-800 px-4 py-2 rounded-xl"
          onPress={addLocalPlayer}
        >
          <Text className="text-white font-semibold">Add</Text>
        </TouchableOpacity>
      </View>
      {errorPlayerEmpty && (
        <Text className="text-red-500 mb-2">Player name cannot be empty</Text>
      )}

      {/* actions */}
      <View className="flex-row justify-between mb-4">
        <TouchableOpacity
          onPress={randomizeTeams}
          activeOpacity={1}
          className={`px-4 py-2 rounded-xl ${tournamentTeams.length === 0 || localPlayers.length === 0 ? "bg-gray-400" : "bg-gray-800"}`}
          disabled={tournamentTeams.length === 0 || localPlayers.length === 0}
        >
          <Text className="text-white font-semibold">Randomize Teams</Text>
        </TouchableOpacity>

        {/* placeholder for import group — replace with a proper modal/selector as needed */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            // open group picker — here we call importFromGroup with an example group id
            Alert.alert(
              "Import group",
              "This will import players from a saved group. Implement group picker UI.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Demo import (first group)",
                  onPress: () => {
                    // demo: get first group id and import
                    const firstGroup = Object.values(playerGroups)[0];
                    if (firstGroup) {
                      importFromGroup(firstGroup.id);
                    } else
                      Alert.alert("No groups", "No player groups available.");
                  },
                },
              ]
            );
          }}
          className="px-4 py-2 rounded-xl bg-gray-500"
        >
          <Text className="text-white font-semibold">Import From Group</Text>
        </TouchableOpacity>
      </View>

      {/* players list */}
      <FlatList
        data={localPlayers}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => (
          <View className="bg-white rounded-2xl p-3 mb-3">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="font-semibold text-gray-800">{item.name}</Text>
              <TouchableOpacity activeOpacity={1} onPress={() => removeLocalPlayer(item.id)}>
                <Ionicons name="trash-bin" size={20} color="#ff3838ff" />
              </TouchableOpacity>
            </View>

            <View className="border border-gray-300 rounded-xl p-2">
              <Text className="text-sm text-gray-600 mb-1">Assign Team</Text>
              <View>
                <FlatList
                  data={tournamentTeams}
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(tt) => tt.id}
                  numColumns={2}
                  renderItem={({ item: tt }) => (
                    <TouchableOpacity
                      activeOpacity={1}
                      onPress={() =>
                        updateLocalPlayer(item.id, { teamId: tt.id })
                      }
                      className={`px-3 py-2 rounded-xl mr-2 ${item.teamId === tt.id ? "bg-gray-800" : "bg-gray-200"}`}
                    >
                      <Text
                        className={`${item.teamId === tt.id ? "text-white" : "text-black"}`}
                      >
                        {teamsById[tt.global_team_id]?.name ?? "Team"}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text className="text-gray-400 text-center mt-6">No players yet</Text>
        }
      />

      <TouchableOpacity
        activeOpacity={1}
        className={`py-3 rounded-2xl mt-4 ${allAssigned ? "bg-gray-800" : "bg-gray-400"}`}
        disabled={!allAssigned}
        onPress={proceed}
      >
        <Text className="text-white text-center font-semibold">
          Confirm and Start Tournament
        </Text>
      </TouchableOpacity>
    </View>
  );
}
