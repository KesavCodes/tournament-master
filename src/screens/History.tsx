import React from "react";
import { View, Text, FlatList } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { useAppSelector } from "../store/hooks";
import TournamentHistory from "../components/TournamentHistory";

type Props = NativeStackScreenProps<RootStackParamList, "History">;

export default function History({ navigation }: Props) {
  const tournamentIds = useAppSelector((state) => state.tournaments.allIds);
  const tournamentsById = useAppSelector((state) => state.tournaments.byId);

  const tournaments = tournamentIds
    .map((id) => tournamentsById[id])
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  return (
    <View className="flex-1 bg-white py-4 px-3">
      <FlatList
        data={tournaments}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <Text className="text-center text-lg my-12">
            No Tournaments found
          </Text>
        }
        renderItem={({ item }) => <TournamentHistory item={item} />}
      />
    </View>
  );
}
