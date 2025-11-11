import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function Home({ navigation }: Props) {
  return (
    <View className="flex-1 bg-grey-500 justify-center items-center">
      <Text className="text-3xl font-bold text-blue-600 mb-6">
        Tournament Master
      </Text>

      <TouchableOpacity
        className="bg-blue-600 px-8 py-3 rounded-2xl mb-3"
        onPress={() => navigation.navigate("CreateTournament")}
      >
        <Text className="text-white text-lg font-semibold">
          Create Tournament
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-gray-200 px-8 py-3 rounded-2xl"
        onPress={() => navigation.navigate("History")}
      >
        <Text className="text-gray-700 text-lg font-semibold">
          View History
        </Text>
      </TouchableOpacity>
    </View>
  );
}
