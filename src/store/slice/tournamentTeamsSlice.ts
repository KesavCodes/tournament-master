import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TournamentTeam } from "../../types";

interface State {
  byId: Record<string, TournamentTeam>;
  allIds: string[];
}
const initialState: State = { byId: {}, allIds: [] };

const sliceTT = createSlice({
  name: "tournamentTeams",
  initialState,
  reducers: {
    add(state, action: PayloadAction<TournamentTeam>) {
      const tournamentTeam = action.payload;
      state.byId[tournamentTeam.id] = tournamentTeam;
      if (!state.allIds.includes(tournamentTeam.id)) state.allIds.push(tournamentTeam.id);
    },
    update(state, action: PayloadAction<TournamentTeam>) {
      const tournamentTeam = action.payload;
      if (!state.byId[tournamentTeam.id]) return;
      state.byId[tournamentTeam.id] = tournamentTeam;
    },
    remove(state, action: PayloadAction<string>) {
      const id = action.payload;
      delete state.byId[id];
      state.allIds = state.allIds.filter((x) => x !== id);
    },
    bulkUpsert(state, action: PayloadAction<TournamentTeam[]>) {
      action.payload.forEach((tournamentTeam) => {
        state.byId[tournamentTeam.id] = tournamentTeam;
        if (!state.allIds.includes(tournamentTeam.id)) state.allIds.push(tournamentTeam.id);
      });
    },
    reset(state) {
      state.byId = {};
      state.allIds = [];
    },
  },
});

export const {
  add: addTournamentTeam,
  update: updateTournamentTeam,
  remove: removeTournamentTeam,
  bulkUpsert: bulkUpsertTournamentTeams,
  reset: resetTournamentTeams,
} = sliceTT.actions;
export default sliceTT.reducer;
