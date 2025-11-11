import { View, Text, TouchableOpacity, FlatList } from "react-native";
import React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Fixtures">;

export default function Fixtures({ navigation, route }: Props) {
  const { name, teams } = route.params;
  const matches = teams.length
    ? teams.map((t, i) => ({
        id: i.toString(),
        teamA: t.name,
        teamB: teams[(i + 1) % teams.length]?.name || "BYE",
      }))
    : [];

  return (
    <View className="flex-1 bg-white p-5">
      <Text className="text-2xl font-bold mb-2">{name}</Text>
      <Text className="text-gray-500 mb-4">Fixtures</Text>
      <FlatList
        data={matches}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="border border-gray-200 rounded-2xl p-3 mb-3"
            onPress={() => navigation.navigate("Results", { name })}
          >
            <Text className="font-semibold">
              {item.teamA} vs {item.teamB}
            </Text>
            <Text className="text-gray-500">Tap to record result</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
