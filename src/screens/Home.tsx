import React from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { useSelector } from "react-redux";
import { RootState } from "../store";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function Home({ navigation }: Props) {
  const tournaments = useSelector((state: RootState) => state.tournaments.list);
  return (
    <View className="flex-1 bg-gray-100 items-center px-6 ">
      <TouchableOpacity
        className="bg-gray-800 px-12 py-3 rounded-2xl mb-3 mt-6 w-3/4"
        onPress={() => navigation.navigate("CreateTournament")}
      >
        <Text className="text-white text-2xl font-semibold text-center">
          Create Tournament
        </Text>
      </TouchableOpacity>
      <View className="m-4 flex items-start w-full overflow-hidden  border-2 border-gray-700  bg-gray-200 rounded-2xl shadow-slate-600 shadow-lg">
        <View className="flex flex-row items-center justify-between w-full mb-4 bg-gray-800 px-4 py-4">
          <Text className="text-white text-lg font-semibold">
            Recent Tournaments
          </Text>
          <TouchableOpacity
            className="bg-gray-500 px-4 py-2 rounded-2xl"
            onPress={() => navigation.navigate("History")}
          >
            <Text className="text-lg text-white font-semibold">
              Full History
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={tournaments}
          keyExtractor={(tournament) => tournament.id}
          className="w-full mb-4"
          renderItem={({ item }) => (
            <TouchableOpacity
              className="bg-gray-800 rounded-2xl mx-4 my-2 px-4 py-6"
              onPress={() => navigation.navigate("Fixtures", { id: item.id })}
            >
              <View className="flex flex-row justify-between items-center mb-4">
                <Text className="font-semibold text-white text-lg">
                  {item.name}
                </Text>
                <Text className="bg-gray-200 text-black text-md font-medium rounded-2xl px-4 py-1">
                  {item.format.charAt(0).toUpperCase() + item.format.slice(1)}
                </Text>
              </View>
              <Text className="text-white">Tap to view Tournament</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
}
