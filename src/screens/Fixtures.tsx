import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
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
  if (!currTournament) navigation.navigate("Home");
  const matchResultHandler = (matchId: string) => {
    // TODO: I want to give user two teams and wait for their input to record result
    const matchIndex = currTournament?.fixtures.findIndex(
      (m) => m.id === matchId
    );
    if (matchIndex === undefined || matchIndex < 0 || !currTournament) return;
    Alert.alert(
      `Record result for ${currTournament.fixtures[matchIndex].teamA} vs ${currTournament.fixtures[matchIndex].teamB}`,
      "Select the winning team",
      [
        {
          text: currTournament.fixtures[matchIndex].teamA,
          onPress: () => Alert.alert("Cancel Pressed"),
          style: "cancel"
        },
        {
          text: currTournament.fixtures[matchIndex].teamB,
          onPress: () => Alert.alert("Cancel Pressed"),
          style:"destructive"
        },
      ],
      {
        cancelable: true,
      }
    );
  };
  return (
    <View className="flex-1 bg-white p-5">
      <FlatList
        data={currTournament?.fixtures ?? []}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="border border-gray-200 rounded-2xl p-3 mb-3"
            onPress={() => matchResultHandler(item.id)}
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
