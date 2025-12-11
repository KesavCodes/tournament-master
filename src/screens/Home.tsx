import React from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { useAppSelector } from "../store/hooks";
import TournamentHistory from "../components/TournamentHistory";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function Home({ navigation }: Props) {
  const tournamentsById = useAppSelector((state) => state.tournaments.byId);
  const tournamentIds = useAppSelector((state) => state.tournaments.allIds);

  const tournaments = tournamentIds
    .map((id) => tournamentsById[id])
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 6);

  return (
    <View className="flex-1 bg-gray-100 px-3 pt-6">
      {/* Create Tournament Button */}
      <View className="flex-row justify-between">
        <TouchableOpacity
          className="bg-gray-800 border-2 py-3 rounded-2xl mb-5 self-center w-[49%]"
          onPress={() => navigation.navigate("CreateTournament", { id: "" })}
          activeOpacity={1}
        >
          <Text className="text-white text-xl font-semibold text-center">
            Create Tournament
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="border-2 border-gray-800 py-3 rounded-2xl mb-5 self-center w-[49%]"
          onPress={() => navigation.navigate("PlayerStats")}
          activeOpacity={1}
        >
          <Text className="text-black text-xl font-semibold text-center">
            Players Stats
          </Text>
        </TouchableOpacity>
      </View>

      {/* Container */}
      <View className="border-2  border-gray-700 bg-gray-200 rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <View className="flex flex-row items-center justify-between w-full bg-gray-800 px-4 py-4">
          <Text className="text-white text-lg font-semibold">
            Recent Tournaments
          </Text>

          <TouchableOpacity
            activeOpacity={1}
            className="bg-gray-500 px-4 py-2 rounded-2xl"
            onPress={() => navigation.navigate("History")}
          >
            <Text className="text-lg text-white font-semibold">
              Full History
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tournament List */}
        <FlatList
          data={tournaments}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <Text className="text-center text-lg my-12">
              No Tournaments found
            </Text>
          }
          renderItem={({ item }) => <TournamentHistory item={item} />}
        />
      </View>
    </View>
  );
}
