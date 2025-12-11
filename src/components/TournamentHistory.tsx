import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { Tournament } from "../types";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/navigation";
import { useNavigation } from "@react-navigation/native";
import { useAppSelector } from "../store/hooks";
type Nav = NativeStackNavigationProp<RootStackParamList, "Home">;

const statusMapping = {
  not_started: "Not started",
  league: "In progress",
  knockout: "In progress",
  completed: "Completed",
};

const TournamentHistory = ({ item }: { item: Tournament }) => {
  const navigation = useNavigation<Nav>();
  const teamsById = useAppSelector((state) => state.teams.byId);
  return (
    <TouchableOpacity
      className="bg-gray-800 rounded-2xl mx-2 my-2 px-4 py-6"
      activeOpacity={1}
      onPress={() =>
        item.isConfigCompleted
          ? item.status === "league"
            ? navigation.navigate("Fixtures", { id: item.id })
            : navigation.navigate("Knockout", { id: item.id })
          : navigation.navigate("CreateTournament", { id: item.id })
      }
    >
      <View className="flex flex-row justify-between">
        <View className="justify-between">
          <Text className="font-semibold text-white text-lg">{item.name}</Text>
          {item.winnerTeamId ? (
            <Text className="text-white opacity-80">
              {teamsById[item.winnerTeamId].name} 🏆
            </Text>
          ) : (
            <Text className="text-white opacity-80">
              Tap to open tournament
            </Text>
          )}
        </View>
        <View>
          <Text className="bg-gray-200 text-black text-md font-medium rounded-2xl px-4 py-1">
            {statusMapping[item.status] ?? ""}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default TournamentHistory;

const styles = StyleSheet.create({});
