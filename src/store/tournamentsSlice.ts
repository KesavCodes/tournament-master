import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Team {
  id: string;
  name: string;
  teamIdx: number;
}

export interface Player {
  id: string;
  name: string;
  teamId?: string;
}

export interface Fixture {
  id: string;
  teamA: string; 
  teamB: string;
  result?: string;
}

export interface Tournament {
  id: string;
  name: string;
  format: string;
  configCompleted: boolean;
  noOfTeams: number;
  teams: Team[];
  players: Player[];
  fixtures: Fixture[];
}

interface TournamentsState {
  list: Tournament[];
  loaded: boolean;
}

const initialState: TournamentsState = {
  list: [],
  loaded: false,
};

const tournamentsSlice = createSlice({
  name: "tournaments",
  initialState,
  reducers: {
    setTournaments: (state, action: PayloadAction<Tournament[]>) => {
      state.list = action.payload;
      state.loaded = true;
    },
    addTournament: (state, action: PayloadAction<Tournament>) => {
      state.list.unshift(action.payload);
    },
    updateTournament: (state, action: PayloadAction<Tournament>) => {
      const idx = state.list.findIndex((t) => t.id === action.payload.id);
      if (idx >= 0) state.list[idx] = action.payload;
    },
    deleteTournament: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter((t) => t.id !== action.payload);
    },
  },
});

export const {
  setTournaments,
  addTournament,
  updateTournament,
  deleteTournament,
} = tournamentsSlice.actions;

export default tournamentsSlice.reducer;
