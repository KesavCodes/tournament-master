import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { ID, TeamPlayerRole, TournamentTeam } from "../types";
import { updateTournamentTeam } from "../store/slice/tournamentTeamsSlice";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import TeamCard from "../components/TeamCard";
import { generateRoundRobinFixtures } from "../utils/generateFixture";
import { bulkUpsertFixtures } from "../store/slice/fixturesSlice";
import { updateTournament } from "../store/slice/tournamentsSlice";

type Props = NativeStackScreenProps<RootStackParamList, "TeamRoles">;

export default function TeamRoles({ route, navigation }: Props) {
  const { id: tournamentId } = route.params;
  const dispatch = useAppDispatch();
  const tournamentsById = useAppSelector((s) => s.tournaments.byId);
  const tournament = tournamentsById[tournamentId];
  const tournamentTeamsById = useAppSelector((s) => s.tournamentTeams.byId);
  const tournamentTeams = Object.values(tournamentTeamsById).filter(
    (tt) => tt.tournament_id === tournamentId
  );
  const playersById = useAppSelector((s) => s.players.byId);
  const teamsById = useAppSelector((s) => s.teams.byId);

  const updateRoles = (
    team: TournamentTeam,
    playerId: ID,
    role: TeamPlayerRole
  ) => {
    const prevRoles = team.playerRoles ?? {};
    const nextRoles: Record<ID, TeamPlayerRole[]> = {};

    // 1. Clone & clean invalid roles
    for (const pid of team.players) {
      nextRoles[pid] = [...(prevRoles[pid] ?? ["playing"])];
    }

    // 2. If assigning captain or VC → remove from others
    if (role === "captain" || role === "vice_captain") {
      const hasRole = nextRoles[playerId].includes(role);
      nextRoles[playerId] = nextRoles[playerId].filter(
        (item) => !["captain", "vice_captain"].includes(item)
      );
      for (const pid of team.players) {
        nextRoles[pid] = nextRoles[pid].filter((r) => r !== role);
      }

      if (!hasRole) {
        // Ensure playing
        if (!nextRoles[playerId].includes("playing")) {
          nextRoles[playerId].push("playing");
        }
        nextRoles[playerId].push(role);
      }
    }

    // 4. Playing / Sub logic
    if (role === "playing") {
      nextRoles[playerId] = ["playing"];
    }

    if (role === "sub") {
      nextRoles[playerId] = ["sub"];
    }

    dispatch(
      updateTournamentTeam({
        ...team,
        playerRoles: nextRoles,
      })
    );
  };

  const proceed = () => {
    const fixturesRaw = generateRoundRobinFixtures(tournamentTeams);

    dispatch(
      bulkUpsertFixtures(
        fixturesRaw.map((fixture, index) => ({
          ...fixture,
          tournament_id: tournamentId,
          created_at: new Date().toISOString() + index.toString(),
        }))
      )
    );

    // Update config status
    dispatch(
      updateTournament({
        ...tournament,
        status: fixturesRaw.length === 1 ? "knockout" : "league",
        isConfigCompleted: true,
      })
    );

    navigation.navigate(fixturesRaw.length === 1 ? "Knockout" : "Fixtures", {
      id: tournamentId,
    });
  };

  const allAssigned = Object.values(tournamentTeams).every((team) => {
    const roles = team.playerRoles || {};
    const hasCaptain = Object.values(roles).some((roleList) =>
      roleList.includes("captain")
    );
    const hasViceCaptain = Object.values(roles).some((roleList) =>
      roleList.includes("vice_captain")
    );
    return team.players.length === 1
      ? hasCaptain
      : hasCaptain && hasViceCaptain;
  });
  //  tournamentTeams.every((team) =>
  //   Object.values(team.playerRoles || {}).some((roles) =>
  //     roles.length === 1
  //       ? roles.includes("captain")
  //       : roles.includes("captain") || roles.includes("vice_captain")
  //   )

  return (
    <View className="flex-1 bg-gray-100 py-4 px-3">
      <Text className="text-xl font-semibold mb-4 text-center">
        Assign Captain and Vice Captain
      </Text>
      <FlatList
        data={tournamentTeams}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{
          height: "85%",
        }}
        renderItem={({ item: team }) => (
          <TeamCard
            team={team}
            playersById={playersById}
            teamName={teamsById[team.global_team_id]?.name}
            onUpdate={updateRoles}
          />
        )}
      />
      <TouchableOpacity
        activeOpacity={1}
        className={`py-3 rounded-2xl mt-4 mb-10 ${allAssigned ? "bg-gray-800" : "bg-gray-400"}`}
        disabled={!allAssigned}
        onPress={proceed}
      >
        <Text className="text-white text-center font-semibold">
          Confirm and Start Tournament
        </Text>
      </TouchableOpacity>
    </View>
  );
}
