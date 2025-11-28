import React from "react";
import { View, Text, Button, TouchableOpacity } from "react-native";
// import { captureRef } from "react-native-view-shot";
// import * as Sharing from "expo-sharing";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { RootState } from "../store";
import { generateScoreboard } from "../utils/generateScoreboard";
import { selectFixturesByTournament } from "../store/helpers/selector";
import { useAppSelector } from "../store/hooks";
import { Fixture } from "../types";
import {
  attachTeamNames,
  FixturesWithTeamNames,
} from "../utils/attachTeamNames";

type Props = NativeStackScreenProps<RootStackParamList, "Scoreboard">;

export default function Results({ navigation, route }: Props) {
  const { id: currTournamentId } = route.params;

  const currTournamentFixtures = useAppSelector(
    (state: RootState): Fixture[] =>
      selectFixturesByTournament(
        state,
        currTournamentId
      ) as unknown as Fixture[]
  );

  const teamsById = useAppSelector((state: RootState) => state.teams.byId);

  if (currTournamentFixtures.length === 0)
    return (
      <View>
        <Text>No fixtures available.</Text>
      </View>
    );

  const scoreboardData = generateScoreboard(
    (attachTeamNames(currTournamentFixtures, teamsById) ??
      []) as unknown as FixturesWithTeamNames[]
  );

    return (
      <View className="flex-1 bg-white p-5">
        <Text className="text-2xl font-bold mb-4">Scoreboard</Text>
        <View className="flex flex-row justify-between items-center bg-gray-800 px-4 rounded-t-2xl">
          <Text className="font-semibold text-white text-lg w-1/2 border-0 border-r border-r-white py-4">
            Team
          </Text>
          <Text className="font-medium text-white text-md w-1/4 pl-4 border-0 border-r border-r-white py-4">
            Played
          </Text>
          <Text className="font-medium text-white text-md w-1/4 pl-4 py-4">
            Won
          </Text>
        </View>
        <View className="rounded-b-2xl overflow-hidden">
          {scoreboardData.map((team) => (
            <View
              key={team.teamId}
              className="flex flex-row justify-between items-center bg-gray-200 px-4"
            >
              <Text
                className="font-semibold text-md w-1/2 border-0 border-r py-4"
                numberOfLines={1}
              >
                {team.name}
              </Text>
              <Text className="font-medium text-md w-1/4 pl-4 border-0 border-r py-4">
                {team.played}
              </Text>
              <Text className="font-medium text-md w-1/4 pl-4 py-4">
                {team.won}
              </Text>
            </View>
          ))}
        </View>
        <TouchableOpacity
          activeOpacity={1}
          className="bg-gray-800 rounded-2xl p-4 mt-6"
          onPress={() =>
            navigation.navigate("Fixtures", { id: currTournamentId })
          }
        >
          <Text className="text-white text-center font-semibold">
            Go back to Fixtures
          </Text>
        </TouchableOpacity>
      </View>
    );
}
