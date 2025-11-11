import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "AddTeams">;

export default function AddTeams({ navigation, route }: Props) {
  const { name, type } = route.params;
  const [teamName, setTeamName] = useState("");
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);

  const addTeam = () => {
    if (!teamName.trim()) return;
    setTeams([...teams, { id: Date.now().toString(), name: teamName }]);
    setTeamName("");
  };

  return (
    <View className="flex-1 bg-red-500 p-5">
      <Text className="text-2xl font-bold mb-4">Add Teams</Text>
      <View className="flex-row mb-4">
        <TextInput
          className="flex-1 border border-gray-300 rounded-2xl p-3 mr-2"
          placeholder="Team name"
          value={teamName}
          onChangeText={setTeamName}
        />
        <TouchableOpacity
          className="bg-blue-600 px-4 rounded-2xl justify-center"
          onPress={addTeam}
        >
          <Text className="text-white font-semibold">Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={teams}
        keyExtractor={(t) => t.id}
        renderItem={({ item }) => (
          <View className="bg-gray-100 p-3 mb-2 rounded-2xl">
            <Text>{item.name}</Text>
          </View>
        )}
      />

      <TouchableOpacity
        className="mt-6 bg-blue-600 py-3 rounded-2xl"
        onPress={() => navigation.navigate("Fixtures", { name, type, teams })}
      >
        <Text className="text-center text-white font-semibold">
          Generate Fixtures
        </Text>
      </TouchableOpacity>
    </View>
  );
}
