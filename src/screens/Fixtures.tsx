import { View, Text, TouchableOpacity, FlatList } from "react-native";
import React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { Team } from "../store/tournamentsSlice";

type Props = NativeStackScreenProps<RootStackParamList, "Fixtures">;

export default function Fixtures({ navigation, route }: Props) {
  const { id: currTournamentId } = route.params;

  const tournaments = useSelector((state: RootState) => state.tournaments.list);

  const currTournament = tournaments.find(
    (tournament) => tournament.id === currTournamentId
  );

  let teams: Team[] = []
  if (!currTournament) navigation.navigate("Home");
  else teams = currTournament.teams;

  let allMatches: any[] = [];
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      allMatches.push({
        id: `${Number(teams[i].id) + Number(teams[j].id)}`,
        teamA: teams[i].name,
        teamB: teams[j].name,
      });
    }
  }

  // sort matches to alternate between teams
  allMatches = allMatches.sort((a, b) => Number(a.id) - Number(b.id));

  const matchFixtures = [];
  let p1 = 0;
  let p2 = allMatches.length - 1;
  while (p1 < p2) {
    matchFixtures.push(allMatches[p1], allMatches[p2]);
    p1++;
    p2--;
  }
  if (p1 === p2) {
    matchFixtures.push(allMatches[p1]);
  }

  return (
    <View className="flex-1 bg-white p-5">
      <FlatList
        data={matchFixtures}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="border border-gray-200 rounded-2xl p-3 mb-3"
            // onPress={() => navigation.navigate("Results", { name })}
          >
            <Text className="font-semibold">
              {item.teamA} vs {item.teamB}
            </Text>
            <Text className="text-gray-500">Tap to record result</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
