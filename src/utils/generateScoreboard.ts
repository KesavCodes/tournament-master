import { FixturesWithTeamNames } from "./attachTeamNames";

export const generateScoreboard = (matches: FixturesWithTeamNames[]) => {
  const scoreboard: {
    [key: string]: {
      played: number;
      won: number;
      name: string;
    };
  } = {};

  matches.forEach((match: FixturesWithTeamNames) => {
    const { teamA, teamAId, teamB, teamBId, winnerId } = match;
    if (!scoreboard[teamAId]) {
      scoreboard[teamAId] = {
        played: 0,
        won: 0,
        name: teamA,
      };
    }
    if (!scoreboard[teamBId]) {
      scoreboard[teamBId] = {
        played: 0,
        won: 0,
        name: teamB,
      };
    }
    if (winnerId) {
      scoreboard[teamAId].played += 1;
      scoreboard[teamBId].played += 1;
      if (winnerId === teamAId) scoreboard[teamAId].won += 1;
      else if (winnerId === teamBId) scoreboard[teamBId].won += 1;
    }
  });

  return Object.entries(scoreboard)
    .map(([teamId, stats]) => ({
      teamId,
      ...stats,
    }))
    .sort((a, b) => b.won - a.won);
};
