import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { Tournament } from "../types";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/navigation";
import { useNavigation } from "@react-navigation/native";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import Ionicons from "@expo/vector-icons/Ionicons";
import { removeTournament } from "../store/slice/tournamentsSlice";
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
  const dispatch = useAppDispatch();
  const deleteTournament = (id: string) => {
    Alert.alert(
      "Delete Tournament",
      "Are you sure about deleting this tournament?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => dispatch(removeTournament(id)),
        },
      ]
    );
  };
  return (
    <TouchableOpacity
      className="bg-gray-800 rounded-2xl mx-2 my-1 px-4 py-6"
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
          <Text className="font-semibold text-white text-lg">{item.name} </Text>
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
        <View className="justify-end items-end gap-3">
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => deleteTournament(item.id)}
          >
            <Ionicons name="trash-bin" size={20} color="#ff3838ff" />
          </TouchableOpacity>
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
