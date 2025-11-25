import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Team } from "../../types";

interface State {
  byId: Record<string, Team>;
  allIds: string[];
}
const initialState: State = { byId: {}, allIds: [] };

const sliceTeams = createSlice({
  name: "teams",
  initialState,
  reducers: {
    addTeam(state, action: PayloadAction<Team>) {
      const team = action.payload;
      state.byId[team.id] = team;
      if (!state.allIds.includes(team.id)) state.allIds.push(team.id);
    },
    updateTeam(state, action: PayloadAction<Team>) {
      const team = action.payload;
      if (!state.byId[team.id]) return;
      state.byId[team.id] = team;
    },
    removeTeam(state, action: PayloadAction<string>) {
      const id = action.payload;
      delete state.byId[id];
      state.allIds = state.allIds.filter((x) => x !== id);
    },
    bulkUpsert(state, action: PayloadAction<Team[]>) {
      action.payload.forEach((team) => {
        state.byId[team.id] = team;
        if (!state.allIds.includes(team.id)) state.allIds.push(team.id);
      });
    },
    reset(state) {
      state.byId = {};
      state.allIds = [];
    },
  },
});

export const {
  addTeam,
  updateTeam,
  removeTeam,
  bulkUpsert: bulkUpsertTeams,
  reset: resetTeams,
} = sliceTeams.actions;
export default sliceTeams.reducer;
