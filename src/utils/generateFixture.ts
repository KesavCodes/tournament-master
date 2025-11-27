import { TournamentTeam } from "../types";

export function generateRoundRobinFixtures(teams: TournamentTeam[]) {
  let teamList = [...teams];

  const isOdd = teamList.length % 2 !== 0;
  if (isOdd) {
    // Add bye team
    teamList.push({
      id: "BYE",
      global_team_id: "BYE",
      players: [],
      tournament_id: teams[0].tournament_id,
      created_at: new Date().toISOString(),
    });
  }

  const n = teamList.length;
  const rounds = n - 1;
  const half = n / 2;

  let schedule: {
    teamAId: string;
    teamBId: string;
    matchNumber: number;
    round: number;
    id: string;
  }[] = [];

  let arr = [...teamList];

  for (let round = 1; round <= rounds; round++) {
    for (let i = 0; i < half; i++) {
      const teamA = arr[i];
      const teamB = arr[n - 1 - i];

      // ignore BYE matches
      if (teamA.id !== "BYE" && teamB.id !== "BYE") {
        schedule.push({
          id: `fix-${round}-${i}-${Date.now()}`,
          teamAId: teamA.global_team_id,
          teamBId: teamB.global_team_id,
          matchNumber: schedule.length + 1,
          round,
        });
      }
    }

    // rotate except first element
    const fixed = arr[0];
    const rotated = arr.slice(1);
    rotated.unshift(rotated.pop()!);
    arr = [fixed, ...rotated];
  }

  return schedule;
}
