import React, { useState } from "react";
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

type Props = NativeStackScreenProps<RootStackParamList, "AddTeams">;

export default function AddTeams({ navigation, route }: Props) {
  const { name, type } = route.params;
  const [teamName, setTeamName] = useState("");
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState(false);
  // TODO: Need to store the store and show it on subsequent use.
  // const existingTeams = [];
  const addTeam = () => {
    if (!teamName.trim()) {
      setError(true);
      return;
    }
    setTeams([...teams, { id: Date.now().toString(), name: teamName }]);
    setTeamName("");
  };

  const updateTeamName = (text: string) => {
    setTeamName(text);
    setError(false);
  };

  const removeTeam = (id: string, name: string) => {
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

  return (
    <View className="flex-1 bg-white p-5">
      <View className="flex-row">
        <TextInput
          className={`flex-1 border rounded-2xl p-3 mr-2 ${error ? "border-red-500" : "border-gray-300"}`}
          placeholder="Team Name"
          value={teamName}
          onChangeText={updateTeamName}
          maxLength={20}
        />
        <TouchableOpacity
          className="bg-blue-600 px-4 rounded-2xl justify-center"
          onPress={addTeam}
          activeOpacity={1}
        >
          <Text className="text-white font-semibold">Add</Text>
        </TouchableOpacity>
      </View>
      {error && (
        <Text className="text-red-500 mt-2">Team name cannot be empty</Text>
      )}
      <FlatList
        data={teams}
        keyExtractor={(team) => team.id}
        className="mt-4"
        renderItem={({ item }) => (
          <View className="bg-gray-100 p-3 mb-2 rounded-2xl d-flex flex-row justify-between items-center">
            <Text>{item.name}</Text>
            <TouchableOpacity onPress={() => removeTeam(item.id, item.name)}>
              <Ionicons name="trash-bin" size={24} color="#ff3838ff" />
            </TouchableOpacity>
          </View>
        )}
      />
      <TouchableOpacity
        className="mt-6 mb-6 bg-blue-600 py-3 rounded-2xl"
        onPress={() => navigation.navigate("AddPlayers", { teams })}
      >
        <Text className="text-center text-white font-semibold">
          Add Players
        </Text>
      </TouchableOpacity>
    </View>
  );
}
