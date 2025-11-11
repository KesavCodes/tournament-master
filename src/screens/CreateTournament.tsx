import { View, Text, TextInput, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "CreateTournament">;

export default function CreateTournament({ navigation }: Props) {
  const [name, setName] = useState("");
  const [type, setType] = useState("knockout");

  return (
    <View className="flex-1 bg-white p-5">
      <Text className="text-2xl font-bold mb-4 text-gray-900">
        Create Tournament
      </Text>

      <Text className="mb-2 text-gray-600">Tournament Name</Text>
      <TextInput
        className="border border-gray-300 p-3 rounded-2xl mb-5"
        placeholder="Enter name"
        value={name}
        onChangeText={setName}
      />

      <Text className="mb-2 text-gray-600">Select Format</Text>
      <View className="flex-row mb-5">
        {["knockout", "league"].map((t) => (
          <TouchableOpacity
            key={t}
            className={`flex-1 mx-1 p-3 rounded-2xl ${
              type === t ? "bg-blue-600" : "bg-gray-200"
            }`}
            onPress={() => setType(t)}
          >
            <Text
              className={`text-center font-semibold ${
                type === t ? "text-white" : "text-gray-700"
              }`}
            >
              {t === "knockout" ? "Knockout" : "League"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        className="bg-blue-600 py-3 rounded-2xl"
        onPress={() =>
          navigation.navigate("AddTeams", {
            name,
            type: type as "knockout" | "league",
          })
        }
      >
        <Text className="text-center text-white text-lg font-semibold">
          Next: Add Teams
        </Text>
      </TouchableOpacity>
    </View>
  );
}
