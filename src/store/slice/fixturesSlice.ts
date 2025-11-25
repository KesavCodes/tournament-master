import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Fixture } from "../../types";

interface State {
  byId: Record<string, Fixture>;
  allIds: string[];
}
const initialState: State = { byId: {}, allIds: [] };

const sliceF = createSlice({
  name: "fixtures",
  initialState,
  reducers: {
    add(state, action: PayloadAction<Fixture>) {
      const fixture = action.payload;
      state.byId[fixture.id] = fixture;
      if (!state.allIds.includes(fixture.id)) state.allIds.push(fixture.id);
    },
    update(state, action: PayloadAction<Fixture>) {
      const fixture = action.payload;
      if (!state.byId[fixture.id]) return;
      state.byId[fixture.id] = fixture;
    },
    remove(state, action: PayloadAction<string>) {
      const id = action.payload;
      delete state.byId[id];
      state.allIds = state.allIds.filter((x) => x !== id);
    },
    bulkUpsert(state, action: PayloadAction<Fixture[]>) {
      action.payload.forEach((fixture) => {
        state.byId[fixture.id] = fixture;
        if (!state.allIds.includes(fixture.id)) state.allIds.push(fixture.id);
      });
    },
    reset(state) {
      state.byId = {};
      state.allIds = [];
    },
  },
});

export const {
  add: addFixture,
  update: updateFixture,
  remove: removeFixture,
  bulkUpsert: bulkUpsertFixtures,
  reset: resetFixtures,
} = sliceF.actions;
export default sliceF.reducer;
