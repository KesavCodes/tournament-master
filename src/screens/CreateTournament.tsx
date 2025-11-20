import { View, Text, TextInput, TouchableOpacity } from "react-native";
import React, { useLayoutEffect, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { addTournament, updateTournament } from "../store/tournamentsSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";

type Props = NativeStackScreenProps<RootStackParamList, "CreateTournament">;

export default function CreateTournament({ navigation, route }: Props) {
  const { id: currTournamentId } = route.params ?? { id: "" };
  const tournaments = useSelector((state: RootState) => state.tournaments.list);
  const currTournament = tournaments.find(
    (tournament) => tournament.id === currTournamentId
  );

  const [name, setName] = useState(currTournament?.name || "");
  const [noOfTeams, setNoOfTeams] = useState(
    currTournament?.noOfTeams?.toString() || "2"
  );
  // const [tournamentType, setTournamentType] = useState(
  //   currTournament?.format || "knockout"
  // );

  const dispatch = useDispatch();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: currTournamentId ? "Edit Tournament" : "Create Tournament",
    });
  }, [navigation, currTournamentId]);

  const addNewTournament = () => {
    if (!name) {
      alert("Please enter a tournament name.");
      return;
    }
    let tournamentData = {
      id: currTournamentId || Date.now().toString(),
      name,
      format: "league",
      teams: currTournament?.teams || [],
      players: currTournament?.players || [],
      fixtures: currTournament?.fixtures || [],
      configCompleted: currTournament?.configCompleted || false,
      noOfTeams: parseInt(noOfTeams, 10),
    };
    if (currTournamentId) {
      dispatch(updateTournament(tournamentData));
    } else {
      dispatch(addTournament(tournamentData));
    }
    navigation.navigate("AddTeamsAndPlayers", {
      id: tournamentData.id,
      action: currTournamentId ? "edit" : "create",
    });
  };

  const numInputHandler = (numInput: string) => {
    // Only keep digits 0–9
    let num = numInput.replace(/[^0-9]/g, "");
    // Prevent empty string
    if (num === "") {
      setNoOfTeams("");
      return;
    }
    const numberValue = parseInt(num, 10);
    // Enforce min
    if (numberValue < 2) {
      setNoOfTeams("2");
      return;
    }
    setNoOfTeams(numberValue.toString());
  };

  return (
    <View className="flex-1 bg-white p-5">
      <Text className="mb-2 font-semibold text-gray-600">Tournament Name</Text>
      <TextInput
        className="border border-gray-300 p-3 rounded-2xl mb-5"
        placeholder="Enter name"
        value={name}
        onChangeText={setName}
      />
      <Text className="mb-2 font-semibold text-gray-600">Number of Teams</Text>
      <TextInput
        className="border border-gray-300 p-3 rounded-2xl mb-2"
        placeholder="Enter number of teams"
        value={noOfTeams}
        onChangeText={numInputHandler}
        keyboardType="numeric"
        inputMode="numeric"
      />
      <Text className="mb-5 font-medium text-sm text-gray-600">
        Note: At least 2 teams required
      </Text>
      {/* <Text className="mb-2 font-semibold text-gray-600">Select Format</Text> */}
      {/* <View className="flex-row mb-5">
        {["knockout", "league"].map((type) => (
          <TouchableOpacity
            key={type}
            className={`flex-1 mx-1 p-3 rounded-2xl ${
              type === tournamentType ? "bg-gray-800" : "bg-gray-200"
            }`}
            onPress={() => setTournamentType(type)}
            activeOpacity={1}
          >
            <Text
              className={`text-center font-semibold ${
                type === tournamentType ? "text-white" : "text-gray-700"
              }`}
            >
              {type === "knockout" ? "Knockout" : "League"}
            </Text>
          </TouchableOpacity>
        ))}
      </View> */}
      <TouchableOpacity
        className="bg-gray-800 py-3 rounded-2xl"
        onPress={addNewTournament}
        activeOpacity={1}
      >
        <Text className="text-center text-white text-lg font-semibold">
          Next: Add Teams
        </Text>
      </TouchableOpacity>
    </View>
  );
}
