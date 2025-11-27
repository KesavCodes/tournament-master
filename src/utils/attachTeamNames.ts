import { Fixture, TournamentTeam } from "../types";


export type FixturesWithTeamNames = Fixture & { 
  teamA: string;
  teamB: string;
};
export function attachTeamNames(
  fixtures: Fixture[],
  globalTeamsById: Record<string, { name: string }>
) {
  return fixtures.map((f) => {
    if(!globalTeamsById[f.teamAId] || !globalTeamsById[f.teamBId]) return {}
    return {
      ...f,
      teamA: globalTeamsById[f.teamAId].name,
      teamB: globalTeamsById[f.teamBId].name,
    };
  });
}
