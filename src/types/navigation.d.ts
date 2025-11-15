export type RootStackParamList = {
  Home: undefined;
  CreateTournament: undefined;
  AddTeams: { name: string; type: "knockout" | "league" };
  AddPlayers: { teams: { id: string; name: string }[] };
  Fixtures: {
    name: string;
    type: string;
    teams: { id: string; name: string }[];
  };
  Results: { name: string };
  History: undefined;
  Settings: undefined;
};
