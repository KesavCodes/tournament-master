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
        streak: number;
        maxWinStreak: number;
        maxLoseStreak: number;
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
        streak: 0,
        maxWinStreak: 0,
        maxLoseStreak: 0,
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
      const matchMap = new Map<string, { created_at: number; result: "W" | "L" }>();

      value.forEach((item: any) => {
        const playedTournament = groupFixturesByTournament[item.tournament_id];
        if (!playedTournament) return;

        playedTournament.forEach((fixture: any) => {
          if (fixture.teamAId === item.team_id || fixture.teamBId === item.team_id) {
            if (fixture.winnerId) {
              stats[key].played += 1;
              if (fixture.winnerId === item.team_id) {
                stats[key].won += 1;
              } else {
                stats[key].lost += 1;
              }

              if (!matchMap.has(fixture.id)) {
                matchMap.set(fixture.id, {
                  created_at: new Date(fixture.created_at).getTime(),
                  result: fixture.winnerId === item.team_id ? "W" : "L",
                });
              }
            }
          }
        });
      });

      if (matchMap.size === 0) {
        stats[key].streak = 0;
        stats[key].maxWinStreak = 0;
        stats[key].maxLoseStreak = 0;
      } else {
        const playerMatches = Array.from(matchMap.values()).sort(
          (a, b) => b.created_at - a.created_at
        );

        const firstResult = playerMatches[0].result;
        let currentCount = 0;
        for (const match of playerMatches) {
          if (match.result === firstResult) {
            currentCount += 1;
          } else {
            break;
          }
        }
        stats[key].streak = firstResult === "W" ? currentCount : -currentCount;

        let maxWinStreak = 0;
        let maxLoseStreak = 0;
        let currentWinStreak = 0;
        let currentLoseStreak = 0;

        for (let i = playerMatches.length - 1; i >= 0; i--) {
          const match = playerMatches[i];
          if (match.result === "W") {
            currentWinStreak += 1;
            currentLoseStreak = 0;
            if (currentWinStreak > maxWinStreak) {
              maxWinStreak = currentWinStreak;
            }
          } else {
            currentLoseStreak += 1;
            currentWinStreak = 0;
            if (currentLoseStreak > maxLoseStreak) {
              maxLoseStreak = currentLoseStreak;
            }
          }
        }

        stats[key].maxWinStreak = maxWinStreak;
        stats[key].maxLoseStreak = maxLoseStreak;
      }
    });
    return Object.values(stats).map((item) => ({
      ...item,
      winRate: item.played > 0 ? (item.won / item.played) * 100 : 0,
    }));
  }
);

export const selectMatchRecords = createSelector(
  [
    (state: RootState) => state.players.byId,
    (state: RootState) => state.tournamentTeams.byId,
    (state: RootState) => state.fixtures.byId,
    selectPlayerStats,
  ],
  (playersById, ttById, fixturesById, playerStats) => {
    const ttByGlobalId = new Map<string, any>();
    Object.values(ttById).forEach((tt: any) => {
      ttByGlobalId.set(tt.global_team_id, tt);
    });

    let longestWinStreak: any = null;
    let longestLoseStreak: any = null;
    let mostLosses: any = null;
    let maxWinStreakValue = 0;
    let maxLoseStreakValue = 0;
    let maxLossesValue = 0;

    for (const player of playerStats) {
      if (player.maxWinStreak > maxWinStreakValue) {
        maxWinStreakValue = player.maxWinStreak;
        longestWinStreak = player;
      }
      if (player.maxLoseStreak > maxLoseStreakValue) {
        maxLoseStreakValue = player.maxLoseStreak;
        longestLoseStreak = player;
      }
      if (player.lost > maxLossesValue) {
        maxLossesValue = player.lost;
        mostLosses = player;
      }
    }

    let mostDominantWin: {
      winnerNames: string[];
      loserNames: string[];
      winnerScore: number;
      loserScore: number;
      pointDiff: number;
    } | null = null;
    let maxDiff = -1;
    const cleanWinsByPlayer: Record<string, number> = {};
    let maxCleanWins = 0;
    let mostCleanWinsPlayer: { playerId: string; name: string; count: number } | null = null;

    Object.values(fixturesById).forEach((fixture: any) => {
      if (!fixture.winnerId) return;

      const winnerGlobalTeamId = fixture.winnerId;
      const winnerTeam = ttByGlobalId.get(winnerGlobalTeamId);
      const loserGlobalTeamId =
        winnerGlobalTeamId === fixture.teamAId
          ? fixture.teamBId
          : fixture.teamAId;
      const loserTeam = ttByGlobalId.get(loserGlobalTeamId);

      if (!winnerTeam || !loserTeam) return;

      if (
        typeof fixture.teamAScore === 'number' &&
        typeof fixture.teamBScore === 'number' &&
        !isNaN(fixture.teamAScore) &&
        !isNaN(fixture.teamBScore)
      ) {
        const diff = Math.abs(fixture.teamAScore - fixture.teamBScore);
        if (diff > maxDiff) {
          maxDiff = diff;
          const winnerNames = winnerTeam.players
            .map((pid: string) => playersById[pid]?.name)
            .filter(Boolean);
          const loserNames = loserTeam.players
            .map((pid: string) => playersById[pid]?.name)
            .filter(Boolean);

          if (winnerNames.length > 0 && loserNames.length > 0) {
            mostDominantWin = {
              winnerNames,
              loserNames,
              winnerScore:
                winnerGlobalTeamId === fixture.teamAId
                  ? fixture.teamAScore
                  : fixture.teamBScore,
              loserScore:
                winnerGlobalTeamId === fixture.teamAId
                  ? fixture.teamBScore
                  : fixture.teamAScore,
              pointDiff: diff,
            };
          }
        }
      }

      const loserScore =
        winnerGlobalTeamId === fixture.teamAId
          ? fixture.teamBScore
          : fixture.teamAScore;

      if (typeof loserScore === 'number' && loserScore === 0) {
        winnerTeam.players.forEach((pid: string) => {
          const count = (cleanWinsByPlayer[pid] || 0) + 1;
          cleanWinsByPlayer[pid] = count;
          if (count > maxCleanWins) {
            maxCleanWins = count;
            mostCleanWinsPlayer = {
              playerId: pid,
              name: playersById[pid]?.name || "Unknown",
              count,
            };
          }
        });
      }
    });

    return {
      longestWinStreak: longestWinStreak
        ? {
            playerName: longestWinStreak.name,
            streak: longestWinStreak.maxWinStreak,
          }
        : null,
      longestLoseStreak: longestLoseStreak
        ? {
            playerName: longestLoseStreak.name,
            streak: longestLoseStreak.maxLoseStreak,
          }
        : null,
      mostLosses: mostLosses
        ? {
            playerName: mostLosses.name,
            count: mostLosses.lost,
          }
        : null,
      mostDominantWin,
      mostCleanWins: mostCleanWinsPlayer,
    };
  }
);
