import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { FixturesWithTeamNames } from "../utils/attachTeamNames";

const FixtureRow = ({
  item,
  handler,
  activeOpacity = 0.7,
  disabled = false,
  teamALeaders,
  teamBLeaders,
}: {
  item: FixturesWithTeamNames;
  handler: (matchId: string) => void;
  activeOpacity: number;
  disabled: boolean;
  teamALeaders: { name: string; role: string[] | undefined }[];
  teamBLeaders: { name: string; role: string[] | undefined }[];
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
        <View className="w-[49%] border-0 border-r-2 pr-2">
          <Text
            className={`text-base font-bold mb-1 ${
              teamAWin ? "font-bold text-green-600" : "text-gray-700"
            }`}
            numberOfLines={1}
          >
            {teamAWin ? "🏆 " : ""}
            {item.teamA}
          </Text>
          {teamALeaders.length > 0 && teamALeaders[0] && (
            <Text className="text-sm text-gray-700">
              {teamALeaders[0].name} (C)
            </Text>
          )}
          {teamALeaders.length > 0 && teamALeaders[1] && (
            <Text className="text-sm text-gray-700">
              {teamALeaders[1].name} (VC)
            </Text>
          )}
        </View>
        <View className="w-[49%]">
          {/* TEAM B */}
          <Text
            className={`text-right text-base font-bold mb-1 ${
              teamBWin ? "font-bold text-green-600" : "text-gray-700"
            }`}
            numberOfLines={1}
          >
            {teamBWin ? "🏆 " : ""}
            {item.teamB}
          </Text>
          {teamBLeaders.length > 0 && teamBLeaders[0] && (
            <Text className="text-sm text-right text-gray-700">
              {teamBLeaders[0].name} (C)
            </Text>
          )}
          {teamBLeaders.length > 0 && teamBLeaders[1] && (
            <Text className="text-sm text-right text-gray-700">
              {teamBLeaders[1].name} (VC)
            </Text>
          )}
        </View>
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
      ) : !disabled ? (
        <Text className="text-gray-500 text-center text-sm font-medium">
          Tap to record result
        </Text>
      ) : null}
    </TouchableOpacity>
  );
};

export default FixtureRow;

const styles = StyleSheet.create({});
