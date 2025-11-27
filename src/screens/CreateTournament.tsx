import React, { useEffect, useLayoutEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  addTournament,
  updateTournament,
} from "../store/slice/tournamentsSlice";

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

    const tournamentData = {
      id: currTournamentId || Date.now().toString(),
      name,
      type: currTournament?.type || "league",
      status: currTournament?.status || "not_started",
      isConfigCompleted: currTournament?.isConfigCompleted || false,
      noOfTeams: teamCount,
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
  const numInputHandler = (value: string) => {
    const cleaned = value.replace(/[^0-9]/g, "");

    if (!cleaned) {
      setNoOfTeams("2");
      return;
    }

    const num = parseInt(cleaned, 10);
    setNoOfTeams(num < 2 ? "2" : num.toString());
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
    <View className="flex-1 bg-white p-5">
      <Text className="mb-2 font-semibold text-gray-600">Tournament Name</Text>
      <TextInput
        className="border border-gray-300 p-3 rounded-2xl mb-5"
        placeholder="Enter tournament name"
        value={name}
        onChangeText={setName}
      />

      <Text className="mb-2 font-semibold text-gray-600">Number of Teams</Text>
      <TextInput
        className="border border-gray-300 p-3 rounded-2xl mb-2"
        value={noOfTeams}
        onChangeText={numInputHandler}
        keyboardType="numeric"
        inputMode="numeric"
      />

      <Text className="text-gray-500 text-sm mb-6">
        Minimum 2 teams required
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
