import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Tournament } from "../../types";

interface State {
  byId: Record<string, Tournament>;
  allIds: string[];
}

const initialState: State = { byId: {}, allIds: [] };

const slice = createSlice({
  name: "tournaments",
  initialState,
  reducers: {
    addTournament(state, action: PayloadAction<Tournament>) {
      const tournament = action.payload;
      state.byId[tournament.id] = tournament;
      if (!state.allIds.includes(tournament.id)) state.allIds.push(tournament.id);
    },
    updateTournament(state, action: PayloadAction<Tournament>) {
      const tournament = action.payload;
      if (!state.byId[tournament.id]) return;
      state.byId[tournament.id] = tournament;
    },
    removeTournament(state, action: PayloadAction<string>) {
      const id = action.payload;
      delete state.byId[id];
      state.allIds = state.allIds.filter((x) => x !== id);
    },
    bulkUpsert(state, action: PayloadAction<Tournament[]>) {
      action.payload.forEach((tournament) => {
        state.byId[tournament.id] = tournament;
        if (!state.allIds.includes(tournament.id)) state.allIds.push(tournament.id);
      });
    },
    reset(state) {
      state.byId = {};
      state.allIds = [];
    },
  },
});

export const {
  addTournament,
  updateTournament,
  removeTournament,
  bulkUpsert,
  reset,
} = slice.actions;
export default slice.reducer;
