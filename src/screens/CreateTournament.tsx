import React, { useEffect, useLayoutEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  addTournament,
  updateTournament,
} from "../store/slice/tournamentsSlice";
import Ionicons from "@expo/vector-icons/Ionicons";

type Props = NativeStackScreenProps<RootStackParamList, "CreateTournament">;

export default function CreateTournament({ navigation, route }: Props) {
  const { id: currTournamentId } = route.params ?? { id: "" };

  const tournamentsById = useAppSelector((state) => state.tournaments.byId);

  const currTournament = currTournamentId
    ? tournamentsById[currTournamentId]
    : null;

  const [name, setName] = useState(currTournament?.name || "");
  const [noOfTeams, setNoOfTeams] = useState(
    currTournament?.noOfTeams?.toString() || "2"
  );
  const [noOfPlayersPerTeam, setNoOfPlayersPerTeam] = useState(
    currTournament?.noOfPlayersPerTeam?.toString() || "1"
  );

  const dispatch = useAppDispatch();

  const handleSubmit = () => {
    if (!name.trim()) {
      alert("Please enter a tournament name.");
      return;
    }

    const teamCount = parseInt(noOfTeams, 10);
    if (isNaN(teamCount) || teamCount < 2) {
      alert("At least 2 teams required.");
      return;
    }
    const playersPerTeam = parseInt(noOfPlayersPerTeam, 10);
    if (isNaN(playersPerTeam) || playersPerTeam < 1) {
      alert("At least 1 player per team required.");
      return;
    }

    const tournamentData = {
      id: currTournamentId || Date.now().toString(),
      name,
      type: currTournament?.type || "league",
      status: currTournament?.status || "not_started",
      isConfigCompleted: currTournament?.isConfigCompleted || false,
      noOfTeams: teamCount,
      noOfPlayersPerTeam: playersPerTeam,
      winnerTeamId: null,
      created_at: currTournament?.created_at || new Date().toISOString(),
    };

    if (currTournamentId) {
      dispatch(updateTournament(tournamentData));
    } else {
      dispatch(addTournament(tournamentData));
    }

    navigation.navigate("AddTeams", {
      id: tournamentData.id,
    });
  };

  /** input sanitization for team count */
  const numInputHandler = (value: string, type: "team" | "player") => {
    const cleaned = value.replace(/[^0-9]/g, "");
    const num = parseInt(cleaned, 10);

    if (type === "team") {
      if (!cleaned) {
        setNoOfTeams("");
        return;
      }
      setNoOfTeams(num < 2 ? "2" : num.toString());
    } else if (type === "player") {
      if (!cleaned) {
        setNoOfPlayersPerTeam("");
        return;
      }
      setNoOfPlayersPerTeam(num < 1 ? "1" : num.toString());
    }
  };

  /** Back button override */
  useEffect(() => {
    const sub = navigation.addListener("beforeRemove", (e) => {
      e.preventDefault();
      navigation.navigate("Home");
    });

    return sub;
  }, [navigation]);

  /** Dynamic header title */
  useLayoutEffect(() => {
    navigation.setOptions({
      title: currTournamentId ? "Edit Tournament" : "Create Tournament",
    });
  }, [navigation, currTournamentId]);

  return (
    <View className="flex-1 bg-white py-5 px-3">
      <Text className="mb-2 font-semibold text-gray-600">Tournament Name</Text>
      <TextInput
        className="border border-gray-300 p-3 rounded-2xl mb-5"
        placeholder="Enter tournament name"
        placeholderTextColor="#595a5aff"
        value={name}
        onChangeText={setName}
      />

      <Text className="mb-2 font-semibold text-gray-600">Number of Teams</Text>
      <TextInput
        className="border border-gray-300 p-3 rounded-2xl mb-2"
        value={noOfTeams}
        onChangeText={(value) => numInputHandler(value, "team")}
        keyboardType="numeric"
        inputMode="numeric"
        placeholderTextColor="#595a5aff"
      />

      <Text className="text-gray-500 text-sm mb-6">
        {" "}
        <Ionicons name="information-circle" size={14} /> Minimum 2 teams
        required
      </Text>
      <Text className="mb-2 font-semibold text-gray-600">
        Number of Players Per Team
      </Text>
      <TextInput
        className="border border-gray-300 p-3 rounded-2xl mb-2"
        value={noOfPlayersPerTeam}
        onChangeText={(value) => numInputHandler(value, "player")}
        keyboardType="numeric"
        inputMode="numeric"
        placeholderTextColor="#595a5aff"
      />

      <Text className="text-gray-500 text-sm mb-6">
        {" "}
        <Ionicons name="information-circle" size={14} /> Minimum 1 player
        required
      </Text>

      <TouchableOpacity
        className="bg-gray-800 py-3 rounded-2xl"
        onPress={handleSubmit}
        activeOpacity={1}
      >
        <Text className="text-center text-white text-lg font-semibold">
          Next: Add Teams
        </Text>
      </TouchableOpacity>
    </View>
  );
}
