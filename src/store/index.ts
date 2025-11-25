import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Slices
import tournaments from "./slice/tournamentsSlice";
import teams from "./slice/teamsSlice";
import players from "./slice/playersSlice";
import tournamentTeams from "./slice/tournamentTeamsSlice";
import fixtures from "./slice/fixturesSlice";
import playerGroups from "./slice/playerGroupsSlice";
import playerGroupMembers from "./slice/playerGroupMembersSlice";

// Root reducer
const rootReducer = combineReducers({
  tournaments,
  teams,
  players,
  tournamentTeams,
  fixtures,
  playerGroups,
  playerGroupMembers,
});

// Persist config
const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: [
    "tournaments",
    "teams",
    "players",
    "tournamentTeams",
    "fixtures",
    "playerGroups",
    "playerGroupMembers",
  ],
};

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // required for redux-persist
    }),
});

// Persistor
export const persistor = persistStore(store);

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
