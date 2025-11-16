import React from "react";
import { StatusBar } from "expo-status-bar";
import "./global.css";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { RootStackParamList } from "./src/types/navigation";

import HomeScreen from "./src/screens/Home";
import CreateTournamentScreen from "./src/screens/CreateTournament";
import FixturesScreen from "./src/screens/Fixtures";
import ResultsScreen from "./src/screens/Results";
import HistoryScreen from "./src/screens/History";
import SettingsScreen from "./src/screens/Settings";
import AddPlayersScreen from "./src/screens/AddPlayers";
import AddTeamsAndPlayers from "./src/screens/AddTeamsAndPlayers";

// 👇 Add the type here:
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
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
          options={{
            title: "Tournament Master",
          }}
        />
        <Stack.Screen
          name="CreateTournament"
          component={CreateTournamentScreen}
          options={{ title: "Create Tournament" }}
        />
        <Stack.Screen
          name="AddTeams"
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
  );
}
