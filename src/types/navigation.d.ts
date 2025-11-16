export type RootStackParamList = {
  Home: undefined;
  CreateTournament: undefined;
  AddTeams: { name: string; type: "knockout" | "league" };
  Fixtures: {
    teams: { id: string; name: string }[];
  };
  Results: { name: string };
  History: undefined;
  Settings: undefined;
};
