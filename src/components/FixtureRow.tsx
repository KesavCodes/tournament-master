import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { FixturesWithTeamNames } from "../utils/attachTeamNames";

const FixtureRow = ({
  item,
  handler,
  activeOpacity = 0.7,
  disabled = false,
}: {
  item: FixturesWithTeamNames;
  handler: (matchId: string) => void;
  activeOpacity: number;
  disabled: boolean;
}) => {
  const hasResult = item.winnerId !== undefined;
  const teamAWin = hasResult && item.winnerId === item.teamAId;
  const teamBWin = hasResult && item.winnerId === item.teamBId;

  return (
    <TouchableOpacity
      className="border bg-gray-100 border-gray-200 rounded-2xl p-3 mb-3"
      onPress={() => handler(item.id)}
      activeOpacity={activeOpacity}
      disabled={disabled}
    >
      {/* TEAM ROW */}
      <View className="flex flex-row justify-between mb-2">
        {/* TEAM A */}
        <Text
          className={`w-[49%] border-0 border-r-2 pr-2 text-base ${
            teamAWin ? "font-bold text-green-600" : "text-gray-700"
          }`}
          numberOfLines={1}
        >
          {teamAWin ? "🏆" : ""} {item.teamA}
        </Text>

        {/* TEAM B */}
        <Text
          className={`w-[49%] text-right text-base ${
            teamBWin ? "font-bold text-green-600" : "text-gray-700"
          }`}
          numberOfLines={1}
        >
          {teamBWin ? "🏆" : ""} {item.teamB} 
        </Text>
      </View>
      {/* INLINE SCORE BADGE */}
      {hasResult &&
      item.teamAScore !== undefined &&
      item.teamBScore !== undefined ? (
        <View className="bg-gray-800 rounded-xl px-3 py-2 self-start w-full">
          <Text className="text-white font-semibold text-center">
            {item.teamA} {item.teamAScore} - {item.teamBScore} {item.teamB}
          </Text>
        </View>
      ) : (
        <Text className="text-gray-500">Tap to record result</Text>
      )}
    </TouchableOpacity>
  );
};

export default FixtureRow;

const styles = StyleSheet.create({});
