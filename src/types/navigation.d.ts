export type RootStackParamList = {
  Home: undefined;
  CreateTournament: undefined;
  AddTeamsAndPlayers: { id: string };
  Fixtures: {
    id: string;
  };
  Results: { name: string };
  Scoreboard: { id: string };
  History: undefined;
  Settings: undefined;
};
