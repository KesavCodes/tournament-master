import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { useAppSelector } from "../store/hooks";
import { selectMatchRecords } from "../store/helpers/selector";

type DominantWin = {
  winnerNames: string[];
  loserNames: string[];
  winnerScore: number;
  loserScore: number;
  pointDiff: number;
};

const MatchRecords = () => {
  const records = useAppSelector(selectMatchRecords);
  const mostDominantWin = records.mostDominantWin as DominantWin | null;
  const mostCleanWins = records.mostCleanWins as { name: string; count: number } | null;
  const hasAnyRecords =
    records.longestWinStreak ||
    records.longestLoseStreak ||
    mostDominantWin ||
    mostCleanWins;
    console.log(records)
  return (
    <View className="border-0 bg-gray-200 rounded-2xl mt-6 overflow-hidden">
      <View className="bg-gray-800 px-6 py-4">
        <Text className="text-white text-xl font-bold text-center">
          🏆 Match Records 🏆
        </Text>
      </View>
      {!hasAnyRecords ? (
        <View className="px-6 py-8">
          <Text className="text-gray-600 text-center text-base">
            No records available yet
          </Text>
        </View>
      ) : (
        <View className="px-6 py-5 space-y-4">
        {records.longestWinStreak && (
          <View className="flex-row justify-between items-center rounded-xl px-4 py-3">
            <View className="flex-1">
              <Text className="font-bold text-gray-800 text-base">
                🔥 Longest Winning Streak
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-gray-900 font-semibold text-base">
                {records.longestWinStreak.playerName}
              </Text>
              <Text className="text-green-600 font-bold text-lg">
                {records.longestWinStreak.streak}W
              </Text>
            </View>
          </View>
        )}

        {records.longestLoseStreak && (
          <View className="flex-row justify-between items-center rounded-xl px-4 py-3">
            <View className="flex-1">
              <Text className="font-bold text-gray-800 text-base">
                💔 Longest Losing Streak
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-gray-900 font-semibold text-base">
                {records.longestLoseStreak.playerName}
              </Text>
              <Text className="text-red-600 font-bold text-lg">
                {records.longestLoseStreak.streak}L
              </Text>
            </View>
          </View>
        )}

        {mostDominantWin && (
          <View className="rounded-xl px-4 py-3">
            <Text className="font-bold text-gray-800 text-base mb-2">
              ⚡ Most Dominant Win
            </Text>
            <View className="bg-gray-50 rounded-lg px-3 py-2">
              <Text className="text-gray-900 font-semibold text-base text-center mb-1">
                {mostDominantWin.winnerNames.join(" & ")} vs {mostDominantWin.loserNames.join(" & ")}
              </Text>
              <View className="flex-row justify-center items-center gap-2 mt-1">
                <Text className="text-green-600 font-bold text-lg">
                  {mostDominantWin.winnerScore}
                </Text>
                <Text className="text-gray-500 text-base">—</Text>
                <Text className="text-red-600 font-bold text-lg">
                  {mostDominantWin.loserScore}
                </Text>
                <Text className="text-gray-600 text-sm ml-2">
                  (diff: {mostDominantWin.pointDiff})
                </Text>
              </View>
            </View>
          </View>
        )}

        {mostCleanWins && (
          <View className="flex-row justify-between items-center rounded-xl px-4 py-3">
            <View className="flex-1">
              <Text className="font-bold text-gray-800 text-base">
                ✨ Most Clean Wins
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-gray-900 font-semibold text-base">
                {mostCleanWins.name}
              </Text>
              <Text className="text-blue-600 font-bold text-lg">
                {mostCleanWins.count} clean wins
              </Text>
            </View>
          </View>
        )}
        </View>
      )}
    </View>
  );
};

export default MatchRecords;

const styles = StyleSheet.create({});

