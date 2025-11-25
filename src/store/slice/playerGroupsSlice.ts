import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PlayerGroup } from "../../types";

interface State {
  byId: Record<string, PlayerGroup>;
  allIds: string[];
}
const initialState: State = { byId: {}, allIds: [] };

const slicePG = createSlice({
  name: "playerGroups",
  initialState,
  reducers: {
    add(state, action: PayloadAction<PlayerGroup>) {
      const playerGroup = action.payload;
      state.byId[playerGroup.id] = playerGroup;
      if (!state.allIds.includes(playerGroup.id)) state.allIds.push(playerGroup.id);
    },
    update(state, action: PayloadAction<PlayerGroup>) {
      const playerGroup = action.payload;
      if (!state.byId[playerGroup.id]) return;
      state.byId[playerGroup.id] = playerGroup;
    },
    remove(state, action: PayloadAction<string>) {
      const id = action.payload;
      delete state.byId[id];
      state.allIds = state.allIds.filter((x) => x !== id);
    },
    bulkUpsert(state, action: PayloadAction<PlayerGroup[]>) {
      action.payload.forEach((playerGroup) => {
        state.byId[playerGroup.id] = playerGroup;
        if (!state.allIds.includes(playerGroup.id)) state.allIds.push(playerGroup.id);
      });
    },
    reset(state) {
      state.byId = {};
      state.allIds = [];
    },
  },
});

export const {
  add: addPlayerGroup,
  update: updatePlayerGroup,
  remove: removePlayerGroup,
  bulkUpsert: bulkUpsertPlayerGroups,
  reset: resetPlayerGroups,
} = slicePG.actions;
export default slicePG.reducer;
