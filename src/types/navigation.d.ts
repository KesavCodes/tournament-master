export type RootStackParamList = {
  Home: undefined;
  CreateTournament: { id: string};
  AddTeamsAndPlayers: { id: string, action: "create" | "edit" };
  Fixtures: {
    id: string;
  };
  Results: { name: string };
  Scoreboard: { id: string };
  History: undefined;
  Settings: undefined;
};
