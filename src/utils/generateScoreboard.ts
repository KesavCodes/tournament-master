import { FixturesWithTeamNames } from "./attachTeamNames";

export const generateScoreboard = (matches: FixturesWithTeamNames[]) => {
  const scoreboard: {
    [key: string]: {
      played: number;
      won: number;
      name: string;
      points: number;
    };
  } = {};

  matches.forEach((match: FixturesWithTeamNames) => {
    const { teamA, teamAId, teamB, teamBId, winnerId } = match;
    if (!scoreboard[teamAId]) {
      scoreboard[teamAId] = {
        played: 0,
        won: 0,
        name: teamA,
        points: 0,
      };
    }
    if (!scoreboard[teamBId]) {
      scoreboard[teamBId] = {
        played: 0,
        won: 0,
        name: teamB,
        points: 0,
      };
    }
    if (winnerId) {
      scoreboard[teamAId].played += 1;
      scoreboard[teamBId].played += 1;
      let scoreDiff = 0;
      if (winnerId === teamAId) {
        scoreboard[teamAId].won += 1;
        scoreDiff = match.teamAScore! - match.teamBScore!;
        scoreboard[teamAId].points += scoreDiff;
        scoreboard[teamBId].points -= scoreDiff;
      } else if (winnerId === teamBId) {
        scoreboard[teamBId].won += 1;
        scoreDiff = match.teamBScore! - match.teamAScore!;
        scoreboard[teamBId].points += scoreDiff;
        scoreboard[teamAId].points -= scoreDiff;
      }
    }
  });

  return Object.entries(scoreboard)
    .map(([teamId, stats]) => ({
      teamId,
      ...stats,
    }))
    .sort((a, b) => {
      if (b.won !== a.won) return b.won - a.won;
      return b.points - a.points;
    });
};
