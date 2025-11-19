import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
} from "react-native";
import React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { Team, updateTournament } from "../store/tournamentsSlice";
import Ionicons from "@expo/vector-icons/Ionicons";

type Props = NativeStackScreenProps<RootStackParamList, "Fixtures">;

export default function Fixtures({ navigation, route }: Props) {
  const { id: currTournamentId } = route.params;

  const [showModal, setShowModal] = React.useState(false);
  const [selectedMatch, setSelectedMatch] = React.useState<{
    id: string;
    teamA: string;
    teamB: string;
  } | null>(null);

  const tournaments = useSelector((state: RootState) => state.tournaments.list);
  const dispatch = useDispatch();

  const currTournament = tournaments.find(
    (tournament) => tournament.id === currTournamentId
  );
  if (!currTournament) navigation.navigate("Home");
  const matchResultHandler = (matchId: string) => {
    // TODO: I want to give user two teams and wait for their input to record result
    const matchIndex = currTournament?.fixtures.findIndex(
      (m) => m.id === matchId
    );
    if (matchIndex === undefined || matchIndex < 0 || !currTournament) return;
    setShowModal(true);
    setSelectedMatch(currTournament.fixtures[matchIndex]);
  };

  const onResultRecorded = (winningTeam: string) => {
    const currMatchIndex = currTournament?.fixtures.findIndex(
      (m) => m.id === selectedMatch?.id
    );
    if (currMatchIndex === undefined || currMatchIndex < 0 || !currTournament)
      return;
    const updatedFixtures = [...currTournament.fixtures];
    updatedFixtures[currMatchIndex] = {
      ...updatedFixtures[currMatchIndex],
      result: winningTeam,
    };
    dispatch(
      updateTournament({
        ...currTournament,
        fixtures: updatedFixtures,
      })
    );
    setShowModal(false);
  };
  return (
    <View className="flex-1 bg-white p-5">
      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onDismiss={() => setShowModal(false)}
        statusBarTranslucent
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableOpacity
          className="flex-1 justify-center items-center p-5"
          onPress={() => setShowModal(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => {
              e.stopPropagation();
            }}
            className="bg-gray-200 rounded-2xl p-5 py-8 w-full border"
          >
            <View className="flex flex-row justify-between items-center mb-6">
              <Text className="text-lg font-semibold">
                Record result for {selectedMatch?.teamA} vs{" "}
                {selectedMatch?.teamB}
              </Text>
              <Ionicons
                name="close-circle-outline"
                color="black"
                size={24}
                onPress={() => setShowModal(false)}
              />
            </View>
            <View className="flex flex-row justify-between">
              <TouchableOpacity
                className="bg-gray-800 rounded-2xl p-3 mb-3 w-[48%]"
                onPress={() => onResultRecorded(selectedMatch?.teamA!!)}
              >
                <Text className="text-white text-center">
                  {selectedMatch?.teamA} Wins
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-gray-800 rounded-2xl p-3 mb-3 w-[48%]"
                onPress={() => onResultRecorded(selectedMatch?.teamB!!)}
              >
                <Text className="text-white text-center">
                  {selectedMatch?.teamB} Wins
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
      <FlatList
        data={currTournament?.fixtures ?? []}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="border border-gray-200 rounded-2xl p-3 mb-3 flex flex-row items-center justify-between"
            onPress={() => matchResultHandler(item.id)}
            activeOpacity={0.4}
            // disabled
          >
            <View>
              <Text className="font-semibold">
                {item.teamA} vs {item.teamB}
              </Text>
              <Text className="text-gray-500">
                {item.result
                  ? `${item.result} Wins 🏆`
                  : "Tap to record result"}
              </Text>
            </View>
            <View>
              <Ionicons name="chevron-forward-outline" size={20} color="gray" />
            </View>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity
        className="bg-blue-600 rounded-2xl p-4 mt-4"
        onPress={() =>
          navigation.navigate("Scoreboard", { id: currTournamentId })
        }
      >
        <Text className="text-white text-center font-semibold">
          View Scoreboard
        </Text>
      </TouchableOpacity>
    </View>
  );
}
