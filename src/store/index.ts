import { configureStore } from "@reduxjs/toolkit";
import tournamentsReducer from "./tournamentsSlice";

export const store = configureStore({
  reducer: {
    tournaments: tournamentsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
