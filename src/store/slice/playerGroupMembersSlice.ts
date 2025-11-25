import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PlayerGroupMember } from "../../types";

interface State {
  byId: Record<string, PlayerGroupMember>;
  allIds: string[];
}
const initialState: State = { byId: {}, allIds: [] };

const slicePGM = createSlice({
  name: "playerGroupMembers",
  initialState,
  reducers: {
    add(state, action: PayloadAction<PlayerGroupMember>) {
      const playerGroupMember = action.payload;
      state.byId[playerGroupMember.id] = playerGroupMember;
      if (!state.allIds.includes(playerGroupMember.id)) state.allIds.push(playerGroupMember.id);
    },
    update(state, action: PayloadAction<PlayerGroupMember>) {
      const playerGroupMember = action.payload;
      if (!state.byId[playerGroupMember.id]) return;
      state.byId[playerGroupMember.id] = playerGroupMember;
    },
    remove(state, action: PayloadAction<string>) {
      const id = action.payload;
      delete state.byId[id];
      state.allIds = state.allIds.filter((x) => x !== id);
    },
    bulkUpsert(state, action: PayloadAction<PlayerGroupMember[]>) {
      action.payload.forEach((playerGroupMember) => {
        state.byId[playerGroupMember.id] = playerGroupMember;
        if (!state.allIds.includes(playerGroupMember.id)) state.allIds.push(playerGroupMember.id);
      });
    },
    reset(state) {
      state.byId = {};
      state.allIds = [];
    },
  },
});

export const {
  add: addPlayerGroupMember,
  update: updatePlayerGroupMember,
  remove: removePlayerGroupMember,
  bulkUpsert: bulkUpsertPlayerGroupMembers,
  reset: resetPlayerGroupMembers,
} = slicePGM.actions;
export default slicePGM.reducer;
