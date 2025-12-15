import React from "react";
import "./global.css";

import { Provider } from "react-redux";
import { store, persistor } from "./src/store";
import { PersistGate } from "redux-persist/integration/react";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";

import HomeScreen from "./src/screens/Home";
import CreateTournamentScreen from "./src/screens/CreateTournament";
import AddTeamsScreen from "./src/screens/AddTeams";
import AddPlayersScreen from "./src/screens/AddPlayers";
import FixturesScreen from "./src/screens/Fixtures";
import ScoreboardScreen from "./src/screens/Scoreboard";
import TeamInfoScreen from "./src/screens/TeamInfo";
import HistoryScreen from "./src/screens/History";
import SettingsScreen from "./src/screens/Settings";
import PlayerStatsScreen from "./src/screens/PlayerStats";
import KnockoutScreen from "./src/screens/Knockout";

import { RootStackParamList } from "./src/types/navigation";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer>
          <StatusBar style="light" />
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerStyle: { backgroundColor: "#1c2b38" },
              headerTintColor: "#fff",
              headerTitleAlign: "center",
            }}
          >
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: "Tournament Master", headerBackVisible: false }}
            />
            <Stack.Screen
              name="CreateTournament"
              component={CreateTournamentScreen}
              options={{ title: "Create Tournament" }}
            />
            <Stack.Screen
              name="AddTeams"
              component={AddTeamsScreen}
              options={{ title: "Add Teams" }}
            />
            <Stack.Screen
              name="AddPlayers"
              component={AddPlayersScreen}
              options={{ title: "Add Players" }}
            />
            <Stack.Screen
              name="Fixtures"
              component={FixturesScreen}
              options={{ title: "Match Schedule" }}
            />
            <Stack.Screen
              name="Knockout"
              component={KnockoutScreen}
              options={{ title: "Knockouts" }}
            />
            <Stack.Screen
              name="Scoreboard"
              component={ScoreboardScreen}
              options={{ title: "Scoreboard" }}
            />
            <Stack.Screen
              name="TeamInfo"
              component={TeamInfoScreen}
              options={{ title: "Team Info" }}
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
            <Stack.Screen
              name="PlayerStats"
              component={PlayerStatsScreen}
              options={{ title: "Players Stats" }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
}
