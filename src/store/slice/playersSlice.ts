import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Player } from "../../types";

interface State {
  byId: Record<string, Player>;
  allIds: string[];
}
const initialState: State = { byId: {}, allIds: [] };

const slicePlayers = createSlice({
  name: "players",
  initialState,
  reducers: {
    addPlayer(state, action: PayloadAction<Player>) {
      const player = action.payload;
      state.byId[player.id] = player;
      if (!state.allIds.includes(player.id)) state.allIds.push(player.id);
    },
    updatePlayer(state, action: PayloadAction<Player>) {
      const player = action.payload;
      if (!state.byId[player.id]) return;
      state.byId[player.id] = player;
    },
    removePlayer(state, action: PayloadAction<string>) {
      const id = action.payload;
      delete state.byId[id];
      state.allIds = state.allIds.filter((x) => x !== id);
    },
    bulkUpsert(state, action: PayloadAction<Player[]>) {
      action.payload.forEach((player) => {
        state.byId[player.id] = player;
        if (!state.allIds.includes(player.id)) state.allIds.push(player.id);
      });
    },
    reset(state) {
      state.byId = {};
      state.allIds = [];
    },
  },
});

export const {
  addPlayer,
  updatePlayer,
  removePlayer,
  bulkUpsert: bulkUpsertPlayers,
  reset: resetPlayers,
} = slicePlayers.actions;
export default slicePlayers.reducer;
