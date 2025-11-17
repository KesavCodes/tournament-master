import React from "react";
import { StatusBar } from "expo-status-bar";
import "./global.css";

import { Provider } from "react-redux";
import { store } from "./src/store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "./src/store/persist";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { RootStackParamList } from "./src/types/navigation";

import HomeScreen from "./src/screens/Home";
import CreateTournamentScreen from "./src/screens/CreateTournament";
import FixturesScreen from "./src/screens/Fixtures";
import ResultsScreen from "./src/screens/Results";
import HistoryScreen from "./src/screens/History";
import SettingsScreen from "./src/screens/Settings";
import AddTeamsAndPlayers from "./src/screens/AddTeamsAndPlayers";

import { useDispatch } from "react-redux";
import { setTournaments } from "./src/store/tournamentsSlice";

const Stack = createNativeStackNavigator<RootStackParamList>();

const StartupLoader = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch();

  React.useEffect(() => {
    const loadTournaments = async () => {
      try {
        const json = await AsyncStorage.getItem("tournaments");
        dispatch(setTournaments(json ? JSON.parse(json) : []));
      } catch (e) {
        console.error("Error loading tournaments:", e);
      }
    };

    loadTournaments();
  }, [dispatch]);

  return <>{children}</>;
};

export default function App() {
  return (
    <Provider store={store}>
      <StartupLoader>
        <NavigationContainer>
          <StatusBar style="auto" />
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerStyle: { backgroundColor: "#2563EB" },
              headerTintColor: "#fff",
              headerTitleAlign: "center",
            }}
          >
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: "Tournament Master" }}
            />
            <Stack.Screen
              name="CreateTournament"
              component={CreateTournamentScreen}
              options={{ title: "Create Tournament" }}
            />
            <Stack.Screen
              name="AddTeamsAndPlayers"
              component={AddTeamsAndPlayers}
              options={{ title: "Add Teams and Players" }}
            />
            <Stack.Screen
              name="Fixtures"
              component={FixturesScreen}
              options={{ title: "Fixtures" }}
            />
            <Stack.Screen
              name="Results"
              component={ResultsScreen}
              options={{ title: "Results" }}
            />
            <Stack.Screen
              name="History"
              component={HistoryScreen}
              options={{ title: "History" }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ title: "Settings" }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </StartupLoader>
    </Provider>
  );
}
