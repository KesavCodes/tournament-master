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
import { updateTournament } from "../store/tournamentsSlice";
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
            className="bg-gray-200 rounded-2xl w-full border overflow-hidden"
          >
            <View className="mb-4 bg-gray-800 pt-4 px-3">
              <View className="flex flex-row justify-between items-center">
                <Text className="text-2xl font-bold text-white text-center flex-1">
                  Record Result
                </Text>
                <Ionicons
                  name="close-circle-outline"
                  color="white"
                  size={24}
                  onPress={() => setShowModal(false)}
                />
              </View>
              <View className="flex flex-row items-center gap-4 my-4">
                <Text
                  className="text-white text-lg font-semibold w-[42%]"
                  numberOfLines={1}
                >
                  {selectedMatch?.teamA}
                </Text>
                <Text className="text-lg font-semibold text-red-500">vs</Text>
                <Text
                  className="text-white text-lg font-semibold w-[42%]"
                  numberOfLines={1}
                >
                  {selectedMatch?.teamB}
                </Text>
              </View>
            </View>
            <View className="flex flex-row justify-between pb-4 px-3">
              <TouchableOpacity
                className="bg-gray-800 rounded-2xl p-3 mb-3 w-[48%]"
                onPress={() => onResultRecorded(selectedMatch?.teamA!!)}
              >
                <Text className="text-white text-center" numberOfLines={1}>
                  {selectedMatch?.teamA}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-gray-800 rounded-2xl p-3 mb-3 w-[48%]"
                onPress={() => onResultRecorded(selectedMatch?.teamB!!)}
              >
                <Text className="text-white text-center" numberOfLines={1}>
                  {selectedMatch?.teamB}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
      <View className="flex flex-row justify-between pb-4">
        <TouchableOpacity
          className="bg-gray-800 rounded-2xl p-3 mb-3 w-[48%]"
          onPress={() =>
            navigation.navigate("Scoreboard", { id: currTournamentId })
          }
        >
          <Text
            className="text-white text-center text-lg font-semibold"
            numberOfLines={1}
          >
            Scoreboard
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-gray-800 rounded-2xl p-3 mb-3 w-[48%]"
                    onPress={() =>
            navigation.navigate("TeamInfo", { id: currTournamentId })
          }
        >
          <Text
            className="text-white text-center text-lg font-semibold"
            numberOfLines={1}
          >
            Teams Info
          </Text>
        </TouchableOpacity>
      </View>
      <Text className="text-2xl font-bold mb-4 text-center">Fixtures</Text>
      <FlatList
        data={currTournament?.fixtures ?? []}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="border bg-gray-100 border-gray-200 rounded-2xl p-3 mb-3 flex flex-row items-center justify-between"
            onPress={() => matchResultHandler(item.id)}
            activeOpacity={0.4}
            // disabled
          >
            <View className="gap-2">
              <View className="flex flex-row gap-2 mb-2">
                <Text className="font-semibold w-[42%]" numberOfLines={1}>
                  {item.teamA}
                </Text>
                <Text className="font-bold text-red-500">vs</Text>
                <Text
                  className="font-semibold w-[42%] truncate ml-4"
                  numberOfLines={1}
                >
                  {item.teamB}
                </Text>
              </View>
              <Text className="text-gray-500 w-[85%]" numberOfLines={1} >
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
    </View>
  );
}
