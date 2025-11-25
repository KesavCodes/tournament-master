import { createSelector } from "@reduxjs/toolkit";

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

export const selectPlayersByTournamentTeam = createSelector(
  [
    (state: any) => state.tournamentTeams.byId,
    (state: any) => state.players.byId,
    (_: any, tournamentTeamId: string) => tournamentTeamId,
  ],
  (ttById, playersById, tournamentTeamId) => {
    const tt = ttById[tournamentTeamId];
    if (!tt) return [];
    return tt.players.map((pid: string) => playersById[pid]);
  }
);
