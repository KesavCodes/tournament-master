import { FlatList, StyleSheet, Text, View } from "react-native";
import React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { RootState } from "../store";
import { selectPlayersAndTeamByTournamentTeam } from "../store/helpers/selector";
import { useAppSelector } from "../store/hooks";
import { Player, Team, TournamentTeam } from "./../types/index";

type Props = NativeStackScreenProps<RootStackParamList, "TeamInfo">;

type TournamentTeamWithTeamAndPlayers = TournamentTeam & {
  playersData: Player[];
  teamData: Team;
};

const TeamInfo = ({ navigation, route }: Props) => {
  const { id: currTournamentId } = route.params;

  const currTournamentTeamsAndPlayers = useAppSelector((state: RootState) =>
    selectPlayersAndTeamByTournamentTeam(state, currTournamentId)
  );

  React.useEffect(() => {
    if (currTournamentTeamsAndPlayers.length === 0) {
      navigation.navigate("Home");
    }
  }, [currTournamentTeamsAndPlayers.length, navigation]);
  
  return (
    <View className="p-5">
      <FlatList
        data={
          (currTournamentTeamsAndPlayers ||
            []) as unknown as TournamentTeamWithTeamAndPlayers[]
        }
        keyExtractor={(item) => item.id}
        className="mt-3"
        renderItem={({ item }) => {
          const players = item.playersData;
          return (
            <View className="bg-gray-800 border border-gray-200 rounded-2xl p-4 mb-4 shadow-sm">
              {/* TEAM NAME */}
              <Text className="font-bold text-lg text-white mb-4">
                {item.teamData.name}
              </Text>

              {/* PLAYERS */}
              {players.length > 0 ? (
                <View className="">
                  {players.map((player) => (
                    <View
                      key={player.id}
                      className="bg-gray-100 rounded-xl p-2 mb-2"
                    >
                      <Text>{player.name}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text className="text-gray-400 ml-5">No players assigned</Text>
              )}
            </View>
          );
        }}
      />
    </View>
  );
};

export default TeamInfo;

const styles = StyleSheet.create({});
