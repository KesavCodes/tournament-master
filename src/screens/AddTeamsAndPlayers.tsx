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

type Props = NativeStackScreenProps<RootStackParamList, "AddTeamsAndPlayers">;

interface Player {
  id: string;
  name: string;
  teamId?: string;
}

export default function AddTeamsAndPlayers({ navigation, route }: Props) {
  const { id: currTournamentId, action } = route.params;
  const dispatch = useDispatch();

  const tournaments = useSelector((state: RootState) => state.tournaments.list);

  const currTournament = tournaments.find(
    (tournament) => tournament.id === currTournamentId
  );

  if (!currTournament) navigation.navigate("Home");

  const [teams, setTeams] = useState<{ id: string; name: string }[]>(
    action === "edit"
      ? currTournament?.teams || []
      : new Array(currTournament?.noOfTeams || 0).fill("").map((_, index) => ({
          id: Date.now().toString() + index,
          name: `Team ${index + 1}`,
        }))
  );
  // const [teamCount, setTeamCount] = useState(0);
  const [players, setPlayers] = useState<Player[]>(
    action === "edit" ? currTournament?.players || [] : []
  );
  const [playerName, setPlayerName] = useState("");
  const [teamName, setTeamName] = useState("");
  const [error, setError] = useState({ team: false, player: false });
  // TODO: Need to store the store and show it on subsequent use.
  // const existingTeams = [];

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

  const addTeam = () => {
    if (!teamName.trim()) {
      setError({ ...error, team: true });
      return;
    }
    setTeams([...teams, { id: Date.now().toString(), name: teamName }]);
    setTeamName("");
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

  const updateTeamName = (text: string) => {
    setTeamName(text);
    setError({ ...error, team: false });
  };

  const updatePlayerName = (text: string) => {
    setPlayerName(text);
    setError({ ...error, player: false });
  };

  const removeTeam = (id: string, name: string) => {
    if (teams.length <= 2) {
      Alert.alert(
        `Cannot Delete - ${name}`,
        "At least two teams are required in a tournament.",
        [{ text: "OK", style: "cancel" }]
      );
      return;
    }
    Alert.alert(
      `Delete Team - ${name}`,
      "Are you sure you want to delete this team?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setTeams(teams.filter((team) => team.id !== id));
          },
        },
      ]
    );
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
    };
    dispatch(updateTournament(updatedTournament));
    navigation.navigate("Fixtures", { id: currTournamentId });
  };

  return (
    <View className="flex-1 bg-gray-200 p-5">
      {/* <View className="p-3 flex-row rounded-2xl h-[5%] bg-white shadow-black drop-shadow-md mb-6">
        <Text className="text-2xl font-bold text-gray-800">
          Enter Teams Count
        </Text>
        <TextInput
          className={`flex-1 border-b-2 p-3 mr-4 ${error.team ? "border-red-500" : "border-blue-600"}`}
          value={teamCount !==0 ? teamCount.toString() : ""}
          onChangeText={(num) => setTeamCount(Number(num))}
          maxLength={20}
          keyboardType="number-pad"
        />
      </View> */}
      <View className="p-3 rounded-2xl h-[40%] bg-white shadow-black drop-shadow-md">
        <Text className="text-2xl font-bold text-gray-800 mb-4">Teams</Text>
        {/* <View className="flex-row">
          <TextInput
            className={`flex-1 border-b-2 p-3 mr-4 ${error.team ? "border-red-500" : "border-gray-800"}`}
            placeholder="Team Name"
            value={teamName}
            onChangeText={updateTeamName}
            maxLength={20}
          />
          <TouchableOpacity
            className="bg-gray-800 px-4 rounded-2xl justify-center"
            onPress={addTeam}
            activeOpacity={1}
          >
            <Text className="text-white font-semibold">Add</Text>
          </TouchableOpacity>
        </View>
        {error.team && (
          <Text className="text-red-500 mt-2">Team name cannot be empty</Text>
        )} */}
        <FlatList
          data={teams}
          keyExtractor={(team) => team.id}
          className="mt-1 rounded-2xl py-2"
          renderItem={({ item }) => (
            <View className="bg-gray-100 p-3 mb-2 rounded-2xl d-flex flex-row justify-between items-center">
              <Text>{item.name}</Text>
              <View className="flex flex-row gap-4 items-center">
                <TouchableOpacity onPress={() => {}}>
                  <Ionicons name="create-outline" size={20} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => removeTeam(item.id, item.name)}
                >
                  <Ionicons name="trash-bin" size={20} color="#ff3838ff" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text className="text-gray-400 text-center mt-10">
              No Teams added yet.
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
        className={`mt-4 py-4 rounded-2xl ${
          allAssigned ? "bg-gray-800" : "bg-gray-400"
        }`}
      >
        <Text className="text-center text-white font-semibold text-lg">
          Proceed
        </Text>
      </TouchableOpacity>
    </View>
  );
}
