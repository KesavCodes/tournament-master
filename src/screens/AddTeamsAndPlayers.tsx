import React, { useEffect, useState } from "react";
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
import Ionicons from "@expo/vector-icons/Ionicons";
import RNPickerSelect from "react-native-picker-select";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { updateTournament } from "../store/tournamentsSlice";
import { generateFixture } from "../utils/generateFixture";
import { generateCoolTeamNames } from "../utils/generateRandomTeamName";

type Props = NativeStackScreenProps<RootStackParamList, "AddTeamsAndPlayers">;

interface Player {
  id: string;
  name: string;
  teamId?: string;
}

export default function AddTeamsAndPlayers({ navigation, route }: Props) {
  const { id: currTournamentId } = route.params;
  const dispatch = useDispatch();

  const tournaments = useSelector((state: RootState) => state.tournaments.list);

  const currTournament = tournaments.find(
    (tournament) => tournament.id === currTournamentId
  );

  const [teams, setTeams] = useState<{ id: string; name: string }[]>(
    currTournament?.teams || []
  );
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [teamName, setTeamName] = useState("");
  const [players, setPlayers] = useState<Player[]>(
    currTournament?.players || []
  );
  const [playerName, setPlayerName] = useState("");
  const [error, setError] = useState({ team: false, player: false });

  if (!currTournament) navigation.navigate("Home");

  const randomizeTeams = () => {
    if (!teams.length || !players.length) return;
    // Shuffle players
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    // Distribute players to teams
    // The logic assigns each player to a team in a round-robin fashion after shuffling the players.
    const distributed = shuffled.map((p, i) => ({
      ...p,
      teamId: teams[i % teams.length].id,
    }));
    const playersAddedOrder = distributed.sort(
      (a, b) => Number(a.id) - Number(b.id)
    );
    setPlayers(playersAddedOrder);
  };

  const startEditing = (teamId: string, currentName: string) => {
    setEditingTeamId(teamId);
    setTeamName(currentName);
  };

  const cancelEditing = () => {
    setEditingTeamId(null);
    setTeamName("");
  };

  const saveTeamName = (id: string) => {
    const trimmed = teamName.trim();
    if (!trimmed) return;

    const updatedTeams = teams.map((team) =>
      team.id === id ? { ...team, name: trimmed } : team
    );

    setTeams(updatedTeams);
    if (!currTournament) return;
    const updatedTournament = {
      ...currTournament,
      teams: updatedTeams,
    };
    dispatch(updateTournament(updatedTournament));
    setEditingTeamId(null);
    setTeamName("");
  };

  const generateTeamNames = () => {
    if (!currTournament?.noOfTeams) return;
    const coolTeamNames = generateCoolTeamNames(currTournament.noOfTeams);
    const updatedTeams = teams.map((team, index) => ({
      ...team,
      name: coolTeamNames[index] || team.name,
    }));

    setTeams(updatedTeams);
    if (!currTournament) return;
    const updatedTournament = {
      ...currTournament,
      teams: updatedTeams,
    };
    dispatch(updateTournament(updatedTournament));
  };

  const addPlayer = () => {
    if (!playerName.trim()) {
      setError({ ...error, player: true });
      return;
    }
    setPlayers((prev) => [
      ...prev,
      { id: Date.now().toString(), name: playerName, teamId: undefined },
    ]);
    setPlayerName("");
  };

  const updatePlayerName = (text: string) => {
    setPlayerName(text);
    setError({ ...error, player: false });
  };

  const removePlayer = (id: string, name: string) => {
    Alert.alert(
      `Delete Player - ${name}`,
      "Are you sure you want to delete this player?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setPlayers(players.filter((player) => player.id !== id));
          },
        },
      ]
    );
  };

  const assignTeam = (playerId: string, teamId: string | undefined) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, teamId } : p))
    );
  };

  const allAssigned = players.length > 0 && players.every((p) => !!p.teamId);

  const proceed = () => {
    if (!allAssigned || !currTournament) return;
    const fixtures = generateFixture(teams);
    const updatedTournament = {
      ...currTournament,
      teams,
      players,
      fixtures,
      configCompleted: true,
    };
    dispatch(updateTournament(updatedTournament));
    navigation.navigate("Fixtures", { id: currTournamentId });
  };

  useEffect(() => {
    navigation.addListener("beforeRemove", (e) => {
      e.preventDefault(); // block default back

      navigation.navigate("CreateTournament", {
        id: currTournamentId,
      });
    });
  }, [navigation, currTournamentId]);

  return (
    <View className="flex-1 bg-gray-200 p-5">
      <View className="p-3 rounded-2xl h-[40%] bg-white shadow-black drop-shadow-md">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-bold text-gray-800 mb-4">Teams</Text>
          <TouchableOpacity
            onPress={generateTeamNames}
            className={"px-3 py-2 rounded-xl bg-gray-800"}
            activeOpacity={1}
          >
            <Text className="text-white font-semibold text-sm">
              Generate Cool Team Names
            </Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={teams}
          keyExtractor={(team) => team.id}
          className="mt-1 rounded-2xl py-2"
          renderItem={({ item }) => {
            const isEditing = editingTeamId === item.id;

            return (
              <View className="bg-gray-100 p-3 mb-2 rounded-2xl flex-row justify-between items-center">
                {/* Left Section */}
                {isEditing ? (
                  <TextInput
                    value={teamName}
                    onChangeText={setTeamName}
                    autoFocus
                    className="flex-1 border border-gray-300 px-3 py-2 rounded-xl text-base"
                    placeholder="Enter team name"
                    maxLength={20}
                  />
                ) : (
                  <Text className="flex-1 text-base">{item.name}</Text>
                )}

                {/* Right Section */}
                <View className="flex-row items-center">
                  {isEditing ? (
                    <>
                      {/* Save */}
                      <TouchableOpacity
                        onPress={() => saveTeamName(item.id)}
                        className="mx-2"
                        activeOpacity={1}
                      >
                        <Ionicons
                          name="checkmark-circle-outline"
                          size={24}
                          color="#06b646ff"
                        />
                      </TouchableOpacity>

                      {/* Cancel */}
                      <TouchableOpacity
                        onPress={cancelEditing}
                        activeOpacity={1}
                      >
                        <Ionicons
                          name="close-circle-outline"
                          size={24}
                          color="#ef4444"
                        />
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      {/* Edit */}
                      <TouchableOpacity
                        onPress={() => startEditing(item.id, item.name)}
                        className="mx-2"
                        activeOpacity={1}
                      >
                        <Ionicons
                          name="create-outline"
                          size={20}
                          color="#000"
                        />
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <Text className="text-gray-400 text-center mt-10">
              No teams added yet.
            </Text>
          }
        />
      </View>
      <View className="p-3 rounded-2xl h-[40%] bg-white mt-6 shadow-black drop-shadow-md">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-bold text-gray-800 mb-4">
            Add Players
          </Text>
          <TouchableOpacity
            onPress={randomizeTeams}
            className={` px-3 py-2 rounded-xl ${teams.length === 0 || players.length === 0 ? "bg-gray-400" : "bg-gray-800"}`}
            activeOpacity={1}
            disabled={teams.length === 0 || players.length === 0}
          >
            <Text className="text-white font-semibold text-sm">
              Randomize Teams
            </Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row mb-4">
          <TextInput
            className={`flex-1 border-b-2 p-3 mr-4 ${error.player ? "border-red-500" : "border-gray-800"}`}
            placeholder="Enter player name"
            value={playerName}
            onChangeText={updatePlayerName}
            maxLength={24}
          />
          <TouchableOpacity
            onPress={addPlayer}
            className="bg-gray-800 px-4 justify-center rounded-xl"
            activeOpacity={1}
          >
            <Text className="text-white font-semibold">Add</Text>
          </TouchableOpacity>
        </View>
        {error.player && (
          <Text className="text-red-500">Player name cannot be empty</Text>
        )}
        {/* Player List */}
        <FlatList
          data={players}
          keyExtractor={(player) => player.id}
          className="mt-1 rounded-2xl py-2"
          renderItem={({ item }) => (
            <View className="bg-gray-100 rounded-xl p-3 mb-2">
              <View className="d-flex flex-row justify-between items-center mb-2">
                <Text className="font-semibold text-gray-800 mb-2">
                  {item.name}
                </Text>
                <TouchableOpacity
                  onPress={() => removePlayer(item.id, item.name)}
                  activeOpacity={1}
                >
                  <Ionicons name="trash-bin" size={20} color="#ff3838ff" />
                </TouchableOpacity>
              </View>
              <View className="border border-gray-300 rounded-xl">
                <RNPickerSelect
                  onValueChange={(val) => assignTeam(item.id, val)}
                  value={item.teamId}
                  placeholder={{ label: "Select a team", value: undefined }}
                  items={teams.map((team) => ({
                    label: team.name,
                    value: team.id,
                  }))}
                  style={{
                    inputAndroid: {
                      color: "black",
                    },
                    inputIOS: {
                      color: "black",
                    },
                  }}
                />
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text className="text-gray-400 text-center mt-10">
              No Players added yet.
            </Text>
          }
        />
      </View>
      <TouchableOpacity
        disabled={!allAssigned}
        onPress={proceed}
        activeOpacity={1}
        className={`mt-4 py-4 rounded-2xl ${
          allAssigned ? "bg-gray-800" : "bg-gray-400"
        }`}
      >
        <Text className="text-center text-white font-semibold text-lg">
          Confirm and Start Tournament
        </Text>
      </TouchableOpacity>
    </View>
  );
}
