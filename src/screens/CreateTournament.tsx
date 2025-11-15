import { View, Text, TextInput, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "CreateTournament">;

export default function CreateTournament({ navigation }: Props) {
  const [name, setName] = useState("");
  const [tournamentType, setTournamentType] = useState("knockout");

  return (
    <View className="flex-1 bg-white p-5">
      <Text className="mb-2 font-semibold text-gray-600">Tournament Name</Text>
      <TextInput
        className="border border-gray-300 p-3 rounded-2xl mb-5"
        placeholder="Enter name"
        value={name}
        onChangeText={setName}
      />

      <Text className="mb-2 font-semibold text-gray-600">Select Format</Text>
      <View className="flex-row mb-5">
        {["knockout", "league"].map((type) => (
          <TouchableOpacity
            key={type}
            className={`flex-1 mx-1 p-3 rounded-2xl ${
              type === tournamentType ? "bg-blue-600" : "bg-gray-200"
            }`}
            onPress={() => setTournamentType(type)}
            activeOpacity={1}
          >
            <Text
              className={`text-center font-semibold ${
                type === tournamentType ? "text-white" : "text-gray-700"
              }`}
            >
              {type === "knockout" ? "Knockout" : "League"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        className="bg-blue-600 py-3 rounded-2xl"
        onPress={() =>
          navigation.navigate("AddTeams", {
            name,
            type: tournamentType as "knockout" | "league",
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
