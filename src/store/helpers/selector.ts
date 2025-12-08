import { createSelector } from "@reduxjs/toolkit";
import { TournamentTeam } from "../../types";
import { RootState } from "..";

export const selectTournamentById = (state: any, id: string) =>
  state.tournaments.byId[id];

export const selectTournamentTeams = createSelector(
  [
    (state: any) => state.tournamentTeams.byId,
    (_: any, tournamentId: string) => tournamentId,
  ],
  (tournamentTeamsById, tournamentId) =>
    Object.values(tournamentTeamsById).filter(
      (tt: any) => tt.tournament_id === tournamentId
    )
);

export const selectFixturesByTournament = createSelector(
  [
    (state: any) => state.fixtures.byId,
    (_: any, tournamentId: string) => tournamentId,
  ],
  (fixturesById, tournamentId) =>
    Object.values(fixturesById).filter(
      (f: any) => f.tournament_id === tournamentId
    )
);

export const selectPlayersAndTeamByTournamentTeam = createSelector(
  [
    (state: any) => state.tournamentTeams.byId,
    (state: any) => state.players.byId,
    (state: any) => state.teams.byId,
    (_: any, tournamentId: string) => tournamentId,
  ],
  (ttById, playersById, teamsById, tournamentId) => {
    const tts = Object.values(ttById).filter(
      (tt: any) => tt.tournament_id === tournamentId
    );

    return tts.map((item: any) => ({
      ...item,
      teamData: teamsById[item.global_team_id],
      playersData: item.players.map((pid: string) => playersById[pid]),
    }));
  }
);

export const selectPlayerStats = createSelector(
  [
    (state: RootState) => state.players.byId,
    (state: RootState) => state.tournamentTeams.byId,
    (state: RootState) => state.fixtures.byId,
  ],

  (playersById, ttById, fixturesById) => {
    const stats: Record<
      string,
      {
        playerId: string;
        name: string;
        played: number;
        won: number;
        lost: number;
        winRate: number;
      }
    > = {};
    Object.values(playersById).forEach((p: any) => {
      stats[p.id] = {
        playerId: p.id,
        name: p.name,
        played: 0,
        won: 0,
        lost: 0,
        winRate: 0,
      };
    });
    const playersPlayedMatches: any = {};
    Object.values(ttById as unknown as TournamentTeam).forEach(
      (tt: TournamentTeam) => {
        tt.players.forEach((pId: string) => {
          if (!playersPlayedMatches[pId]) playersPlayedMatches[pId] = [];
          playersPlayedMatches[pId].push({
            tournament_id: tt.tournament_id,
            team_id: tt.global_team_id,
          });
        });
      }
    );

    const groupFixturesByTournament = Object.values(fixturesById).reduce(
      (acc: any, curr: any) => {
        if (!acc[curr.tournament_id]) acc[curr.tournament_id] = [];
        acc[curr.tournament_id].push(curr);
        return acc;
      },
      {}
    );

    Object.entries(playersPlayedMatches).forEach(([key, value]: [any, any]) => {
      value.forEach((item: any) => {
        const playedTournament = groupFixturesByTournament[item.tournament_id];
        playedTournament.forEach((fixtures: any) => {
          if ([fixtures.teamAId, fixtures.teamBId].includes(item.team_id)) {
            if (fixtures.winnerId) {
              stats[key].played += 1;
              if (fixtures.winnerId === item.team_id) {
                stats[key].won += 1;
              } else {
                stats[key].lost += 1;
              }
            }
          }
        });
      });
    });
    return Object.values(stats).map((item) => ({
      ...item,
      winRate: item.played > 0 ? (item.won / item.played) * 100 : 0,
    }));
  }
);
