import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/navigation";

type Nav = NativeStackNavigationProp<RootStackParamList, "TeamInfo">;

const FixtureActions = ({ id }: { id: string }) => {
  const navigation = useNavigation<Nav>();
  return (
    <View className="flex flex-row justify-between pb-4">
      <TouchableOpacity
        className="bg-gray-800 rounded-2xl p-3 mb-3 w-[48%]"
        onPress={() => navigation.navigate("Scoreboard", { id })}
      >
        <Text className="text-white text-center text-lg font-semibold">
          Scoreboard
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-gray-800 rounded-2xl p-3 mb-3 w-[48%]"
        onPress={() => navigation.navigate("TeamInfo", { id })}
      >
        <Text className="text-white text-center text-lg font-semibold">
          Team Info
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default FixtureActions;

const styles = StyleSheet.create({});
