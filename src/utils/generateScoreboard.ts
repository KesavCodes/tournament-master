import { Fixture } from "../store/tournamentsSlice";

export const generateScoreboard = (matches: Fixture[]) => {
  const scoreboard: {
    [key: string]: {
      played: number;
      won: number;
    };
  } = {};

  matches.forEach((match: Fixture) => {
    const { teamA, teamB, result } = match;
    if (!scoreboard[teamA]) {
      scoreboard[teamA] = {
        played: 0,
        won: 0,
      };
    }
    if (!scoreboard[teamB]) {
      scoreboard[teamB] = {
        played: 0,
        won: 0,
      };
    }
    if (result) {
      scoreboard[teamA].played += 1;
      scoreboard[teamB].played += 1;
      if (result === teamA) scoreboard[teamA].won += 1;
      else if (result === teamB) scoreboard[teamB].won += 1;
    }
  });

  return Object.entries(scoreboard).map(([team, stats]) => ({
    team,
    ...stats,
  })).sort((a, b) => b.won - a.won);
};
