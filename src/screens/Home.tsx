import React from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { useSelector } from "react-redux";
import { RootState } from "../store";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function Home({ navigation }: Props) {
  const tournaments = useSelector((state: RootState) => state.tournaments.list);
  console.log(tournaments);
  return (
    <View className="flex-1 bg-grey-500 items-center">
      <TouchableOpacity
        className="bg-blue-600 px-8 py-3 rounded-2xl mb-3 mt-6"
        onPress={() => navigation.navigate("CreateTournament")}
      >
        <Text className="text-white text-lg font-semibold">
          Create Tournament
        </Text>
      </TouchableOpacity>
      <View>
        <TouchableOpacity
          className="bg-gray-200 px-8 py-3 rounded-2xl"
          onPress={() => navigation.navigate("History")}
        >
          <Text className="text-gray-700 text-lg font-semibold">History</Text>
        </TouchableOpacity>
        <FlatList
          data={tournaments}
          keyExtractor={(tournament) => tournament.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="border border-gray-200 rounded-2xl p-3 mb-3"
              onPress={() => navigation.navigate("Fixtures", { id: item.id })}
            >
              <Text className="font-semibold">{item.name}</Text>
              <Text className="text-gray-500">Tap to view Tournament</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
}
