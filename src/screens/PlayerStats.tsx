import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppSelector } from "../store/hooks";
import { selectPlayerStats } from "../store/helpers/selector";
import Ionicons from "@expo/vector-icons/Ionicons";
import MatchRecords from "../components/MatchRecords";

const topPlayersEmojis = {
  won: ["🥇 ", "🥈 ", "🥉 "],
  winRate: ["🏆 ", "🥵 ", "😤 "],
  lost: ["💔 ", "😭 ", "🤕 "],
  played: ["🎯 ", "🔥 ", "💪 "],
};

const PlayerStats = () => {
  const insets = useSafeAreaInsets();
  const [sortBy, setSortBy] = useState<"played" | "won" | "lost" | "winRate" | "streak">(
    "winRate"
  );
  const playerStats = useAppSelector((state) => selectPlayerStats(state));

  const sortedPlayerStats = [...playerStats].sort((a, b) => {
    if (sortBy === "streak") {
      const bucket = (s: number) => (s > 0 ? 0 : s === 0 ? 1 : 2);
      const bucketDiff = bucket(a.streak) - bucket(b.streak);
      if (bucketDiff !== 0) return bucketDiff;

      if (a.streak > 0 && b.streak > 0) {
        return b.streak - a.streak;
      }
      if (a.streak < 0 && b.streak < 0) {

        return Math.abs(b.streak) - Math.abs(a.streak);
      }
      return b.streak - a.streak;
    }

    return b[sortBy] - a[sortBy];
  });
  if(playerStats.length === 0) return <Text className="font-semibold text-lg mt-16 text-center">No player added yet!</Text>
  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={sortedPlayerStats}
        keyExtractor={(item) => item.playerId}
        contentContainerStyle={{
          padding: 12,
          paddingTop: 16,
          paddingBottom: Math.max(insets.bottom, 12),
        }}
        ListHeaderComponent={
          <>
            <View className="flex-row gap-2 mb-4">
              <Ionicons name="information-circle" size={18} />
              <Text className="w-[90%]">
                You can change the sort order by clicking on the column header. You
                can sort based on the matches played, won, lost and by win percentage.
              </Text>
            </View>
            <View className="flex flex-row items-center bg-gray-800 px-4 rounded-t-2xl">
              <TouchableOpacity
                activeOpacity={1}
                className="border-0 border-r border-r-white py-4 w-[28%]"
              >
                <Text className="font-semibold text-white text-lg" numberOfLines={1}>Player</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={1}
                className="border-0 border-r border-r-white py-4 w-[14%]"
                onPress={() => setSortBy("played")}
              >
                <Text className="font-medium text-white text-md text-center" numberOfLines={1}>
                  {sortBy === "played" && "↕️ "}
                  Played
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={1}
                className="border-0 border-r border-r-white py-4 w-[14%]"
                onPress={() => setSortBy("won")}
              >
                <Text className="font-medium text-white text-md text-center" numberOfLines={1}>
                  {sortBy === "won" && "↕️ "}
                  Won
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={1}
                className="border-0 border-r border-r-white py-4 w-[14%]"
                onPress={() => setSortBy("lost")}
              >
                <Text className="font-medium text-white text-md text-center" numberOfLines={1}>
                  {sortBy === "lost" && "↕️ "}
                  Lost
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={1}
                className="border-0 border-r border-r-white py-4 w-[15%]"
                onPress={() => setSortBy("streak")}
              >
                <Text
                  className="font-medium text-white text-md text-center"
                  numberOfLines={1}
                >
                  {sortBy === "streak" && "↕️ "}
                  Streak
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={1}
                className="py-4 w-[15%]"
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
          </>
        }
        ListFooterComponent={<MatchRecords />}
        renderItem={({ item: stats, index }) => (
          <View className="flex flex-row items-center bg-gray-200 px-4" style={{
            borderBottomLeftRadius: index === sortedPlayerStats.length - 1 ? 16 : 0,
            borderBottomRightRadius: index === sortedPlayerStats.length - 1 ? 16 : 0,
          }}>
            <Text
              className="font-semibold text-md border-0 border-r py-4 w-[28%]"
              numberOfLines={1}
            >
              {sortBy !== "streak"
                ? topPlayersEmojis[sortBy][index] ?? "      "
                : "      "}
              {stats.name}
            </Text>

            <Text
              className="font-medium text-md border-0 border-r py-4 text-center pr-3 w-[14%]"
            >
              {stats.played}
            </Text>

            <Text
              className="font-medium text-md border-0 border-r py-4 text-center w-[14%]"
            >
              {stats.won}
            </Text>
            <Text
              className="font-medium text-md border-0 border-r py-4 text-center w-[14%]"
            >
              {stats.lost}
            </Text>

            <Text
              className="font-medium text-md border-0 border-r py-4 text-center w-[15%]"
              numberOfLines={1}
            >
              {stats.streak === 0
                ? "-"
                : `${Math.abs(stats.streak)}${stats.streak > 0 ? "W" : "L"}`}
            </Text>
            <Text
              className="font-medium text-md py-4 text-right w-[15%]"
              numberOfLines={1}
            >
              {Number(stats.winRate).toFixed(2)}%
            </Text>
          </View>
        )}
      />
    </View>
  );
};

export default PlayerStats;

const styles = StyleSheet.create({});
