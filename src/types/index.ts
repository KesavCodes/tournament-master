export type ID = string;

export type TournamentType = "knockout" | "league";
export type TournamentStatus = "not_started" | "ongoing" | "completed";

export interface Tournament {
  id: ID;
  name: string;
  type: TournamentType;
  status: TournamentStatus;
  noOfTeams: number;
  isConfigCompleted: boolean;
  winnerTeamId?: ID | null;
  created_at: string;
}

export interface Team {
  id: ID;
  name: string;
  color?: string | null;
  logo_url?: string | null;
  created_at: string;
}

export interface Player {
  id: ID;
  name: string;
  logo_url?: string | null;
  created_at: string;
}

export interface TournamentTeam {
  id: ID;
  tournament_id: ID;
  global_team_id: ID;
  players: ID[]; // player ids
  created_at: string;
}

export interface Fixture {
  id: ID;
  tournament_id: ID;
  teamAId: ID; // tournament_team id
  teamBId: ID;
  winnerId?: ID | null; // tournament_team id
  teamAScore?: number | null;
  teamBScore?: number | null;
  round?: number | null;
  matchNumber: number;
  created_at: string;
}

export interface PlayerGroup {
  id: ID;
  name: string;
  created_at: string;
  created_by?: ID | null;
}

export interface PlayerGroupMember {
  id: ID;
  group_id: ID;
  player_id: ID;
  created_at: string;
}
