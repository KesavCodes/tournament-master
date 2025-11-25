import AsyncStorage from "@react-native-async-storage/async-storage";

export const PERSIST_KEY = "tournament_master_redux_v1";

export async function saveState(state: any) {
  try {
    await AsyncStorage.setItem(PERSIST_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save state", e);
  }
}

export async function loadState() {
  try {
    const raw = await AsyncStorage.getItem(PERSIST_KEY);
    if (!raw) return undefined;
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load state", e);
    return undefined;
  }
}
