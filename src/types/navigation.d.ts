export type RootStackParamList = {
  Home: undefined;
  CreateTournament: { id: string};
  AddTeams: { id: string};
  Fixtures: {
    id: string;
  };
  AddPlayers: { id: string};
  Results: { name: string };
  Scoreboard: { id: string };
  History: undefined;
  Settings: undefined;
  TeamInfo: { id: string };
  PlayerStats: undefined;
};
