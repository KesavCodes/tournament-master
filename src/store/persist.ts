import AsyncStorage from "@react-native-async-storage/async-storage";
import { store } from "./index";

store.subscribe(async () => {
  const state = store.getState();
  try {
    await AsyncStorage.setItem(
      "tournaments",
      JSON.stringify(state.tournaments.list)
    );
  } catch (e) {
    console.error("Error saving tournaments:", e);
  }
});
