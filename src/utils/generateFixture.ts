export const generateFixture = (teams: { id: string; name: string }[]) => {
  let allMatches: any[] = [];
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      allMatches.push({
        id: `${Number(teams[i].id) + Number(teams[j].id)}`,
        teamA: teams[i].name,
        teamB: teams[j].name,
      });
    }
  }
  // sort matches to alternate between teams
  allMatches = allMatches.sort((a, b) => Number(a.id) - Number(b.id));
  const matchFixtures = [];
  let p1 = 0;
  let p2 = allMatches.length - 1;
  while (p1 < p2) {
    matchFixtures.push(allMatches[p1], allMatches[p2]);
    p1++;
    p2--;
  }
  if (p1 === p2) {
    matchFixtures.push(allMatches[p1]);
  }
  return matchFixtures;
};
