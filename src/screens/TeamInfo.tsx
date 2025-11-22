import { FlatList, StyleSheet, Text, View } from "react-native";
import React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { useSelector } from "react-redux";
import { RootState } from "../store";

type Props = NativeStackScreenProps<RootStackParamList, "TeamInfo">;

const TeamInfo = ({ navigation, route }: Props) => {
  const { id: currTournamentId } = route.params;
  const tournaments = useSelector((state: RootState) => state.tournaments.list);

  const currTournament = tournaments.find(
    (tournament) => tournament.id === currTournamentId
  );
  if (!currTournament) navigation.navigate("Home");

  const teamAndPlayers = (currTournament?.players || []).reduce(
    (acc, item) => {
      if (!acc[item.teamId ?? ""]) acc[item.teamId!] = [];
      acc[item.teamId!].push(item.name);
      return acc;
    },
    {} as Record<string, string[]>
  );
  return (
    <View className="p-5">
      <FlatList
        data={currTournament?.teams || []}
        keyExtractor={(item) => item.id}
        className="mt-3"
        renderItem={({ item }) => {
          const players = teamAndPlayers[item.id] || [];
          return (
            <View className="bg-gray-800 border border-gray-200 rounded-2xl p-4 mb-4 shadow-sm">
              {/* TEAM NAME */}
              <Text className="font-bold text-lg text-white mb-4">
                {item.name}
              </Text>

              {/* PLAYERS */}
              {players.length > 0 ? (
                <View className="">
                  {players.map((player) => (
                    <View
                      key={player}
                      className="bg-gray-100 rounded-xl p-2 mb-2"
                    >
                      <Text>{player}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text className="text-gray-400 ml-5">No players assigned</Text>
              )}
            </View>
          );
        }}
      />
    </View>
  );
};

export default TeamInfo;

const styles = StyleSheet.create({});
