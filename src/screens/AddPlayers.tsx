import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "AddPlayers">;

interface Player {
  id: string;
  name: string;
  teamId?: string;
}

export default function AddPlayersScreen({ navigation, route }: Props) {
  const { teams } = route.params;
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayer, setNewPlayer] = useState("");

  const addPlayer = () => {
    if (!newPlayer.trim()) return;
    setPlayers((prev) => [
      ...prev,
      { id: Date.now().toString(), name: newPlayer, teamId: undefined },
    ]);
    setNewPlayer("");
  };

  const assignTeam = (playerId: string, teamId: string | undefined) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, teamId } : p))
    );
  };

  const randomizeTeams = () => {
    if (!teams.length || !players.length) return;
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    const distributed = shuffled.map((p, i) => ({
      ...p,
      teamId: teams[i % teams.length].id,
    }));
    setPlayers(distributed);
  };

  const allAssigned = players.length > 0 && players.every((p) => !!p.teamId);

  const proceed = () => {
    if (!allAssigned) return;
    // navigation.navigate("Fixtures", { teams, players });
  };

  return (
    <View className="flex-1 bg-white p-5">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-2xl font-bold text-gray-800">Add Players</Text>
        <TouchableOpacity
          onPress={randomizeTeams}
          className="bg-blue-600 px-3 py-2 rounded-xl"
        >
          <Text className="text-white font-semibold text-sm">
            Randomize Teams
          </Text>
        </TouchableOpacity>
      </View>

      {/* Player Input */}
      <View className="flex-row mb-4">
        <TextInput
          className="flex-1 border border-gray-300 rounded-xl p-3 mr-2"
          placeholder="Enter player name"
          value={newPlayer}
          onChangeText={setNewPlayer}
        />
        <TouchableOpacity
          onPress={addPlayer}
          className="bg-blue-600 px-4 justify-center rounded-xl"
        >
          <Text className="text-white font-semibold">Add</Text>
        </TouchableOpacity>
      </View>

      {/* Player List */}
      <FlatList
        data={players}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => (
          <View className="bg-gray-100 rounded-xl p-3 mb-3">
            <Text className="font-semibold text-gray-800 mb-2">
              {item.name}
            </Text>
            <View className="border border-gray-300 rounded-xl overflow-hidden">
              <RNPickerSelect
                onValueChange={(val) => assignTeam(item.id, val)}
                value={item.teamId}
                placeholder={{ label: "Select a team", value: undefined }}
                items={teams.map((t) => ({ label: t.name, value: t.id }))}
                style={{
                  inputAndroid: { color: "black" },
                  inputIOS: { color: "black" },
                }}
              />
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text className="text-gray-400 text-center mt-10">
            No players added yet.
          </Text>
        }
      />

      {/* Proceed Button */}
      <TouchableOpacity
        disabled={!allAssigned}
        onPress={proceed}
        className={`mt-4 py-4 rounded-2xl ${
          allAssigned ? "bg-blue-600" : "bg-gray-400"
        }`}
      >
        <Text className="text-center text-white font-semibold text-lg">
          Proceed
        </Text>
      </TouchableOpacity>
    </View>
  );
}
