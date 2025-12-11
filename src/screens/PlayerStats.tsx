import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { useAppSelector } from "../store/hooks";
import { selectPlayerStats } from "../store/helpers/selector";
import Ionicons from "@expo/vector-icons/Ionicons";

const topPlayersEmojis = {
  won: ["🥇 ", "🥈 ", "🥉 "],
  winRate: ["🏆 ", "🥵 ", "😤 "],
  lost: ["💔 ", "😭 ", "🤕 "],
  played: ["🎯 ", "🔥 ", "💪 "],
};

const PlayerStats = () => {
  const [sortBy, setSortBy] = useState<"played" | "won" | "lost" | "winRate">(
    "winRate"
  );
  const playerStats = useAppSelector((state) => selectPlayerStats(state)).sort(
    (a, b) => b[sortBy] - a[sortBy]
  );
  if(playerStats.length === 0) return <Text className="font-semibold text-lg mt-16 text-center">No player added yet!</Text>
  return (
    <View className="flex-1 bg-white py-4 px-3">
      <View className="flex-row gap-2">
        <Ionicons name="information-circle" size={18} />
        <Text className="mb-4 w-[90%]">
          You can change the sort order by clicking on the column header. You
          can sort based on the matches played, won, lost and by win percentage.
        </Text>
      </View>
      <View className="flex flex-row items-center bg-gray-800 px-4 rounded-t-2xl">
        <TouchableOpacity
          activeOpacity={1}
          className="w-[30%] border-0 border-r border-r-white py-4"
          // onPress={() => setSortBy("")}
        >
          <Text className="font-semibold text-white text-lg" numberOfLines={1}>Player</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={1}
          className="w-[20%] border-0 border-r border-r-white py-4"
          onPress={() => setSortBy("played")}
        >
          <Text className="font-medium text-white text-md text-center" numberOfLines={1}>
            {sortBy === "played" && "↕️ "}
            Played
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={1}
          className="w-[15%] border-0 border-r border-r-white py-4"
          onPress={() => setSortBy("won")}
        >
          <Text className="font-medium text-white text-md text-center" numberOfLines={1}>
            {sortBy === "won" && "↕️ "}
            Won
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={1}
          className="w-[15%] border-0 border-r border-r-white py-4"
          onPress={() => setSortBy("lost")}
        >
          <Text className="font-medium text-white text-md text-center" numberOfLines={1}>
            {sortBy === "lost" && "↕️ "}
            Lost
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={1}
          className="w-[20%] py-4"
          onPress={() => setSortBy("winRate")}
        >
          <Text
            className="font-medium text-white text-md text-center"
            numberOfLines={1}
          >
            {sortBy === "winRate" && "↕️ "}
            Win %
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={playerStats}
        keyExtractor={(item) => item.playerId}
        renderItem={({ item: stats, index }) => (
          <View className="flex flex-row justify-between items-center bg-gray-200 px-4">
            <Text
              className="font-semibold text-md w-[30%] border-0 border-r py-4"
              numberOfLines={1}
            >
              {topPlayersEmojis[sortBy][index] ?? "      "}
              {stats.name}
            </Text>

            <Text className="font-medium text-md w-[20%] border-0 border-r py-4 text-center pr-3">
              {stats.played}
            </Text>

            <Text className="font-medium text-md w-[15%] border-0 border-r py-4 text-center">
              {stats.won}
            </Text>
            <Text className="font-medium text-md w-[15%] border-0 border-r py-4 text-center">
              {stats.lost}
            </Text>

            <Text
              className="font-medium text-md w-[20%] py-4 text-right"
              numberOfLines={1}
            >
              {Number(stats.winRate).toFixed(2)}%
            </Text>
          </View>
        )}
        contentContainerStyle={{
          borderRadius: 16,
          overflow: "hidden",
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
        }}
      />
    </View>
  );
};

export default PlayerStats;

const styles = StyleSheet.create({});
