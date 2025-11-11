import React, { useRef } from "react";
import { View, Text, Button } from "react-native";
// import { captureRef } from "react-native-view-shot";
// import * as Sharing from "expo-sharing";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Results">;

export default function Results({ route }: Props) {
  const { name } = route.params;
  const viewRef = useRef<View>(null);

  const shareResults = async () => {
    // const uri = await captureRef(viewRef, { format: "png", quality: 0.9 });
    // await Sharing.shareAsync(uri);
  };

  return (
    <View className="flex-1 bg-white p-5">
      <View ref={viewRef} className="p-5 bg-gray-100 rounded-2xl">
        <Text className="text-2xl font-bold mb-2">{name}</Text>
        <Text className="text-lg">🏆 Winner: Titans</Text>
        <Text className="text-lg">🥈 Runner-up: Blaze</Text>
      </View>

      <View className="mt-6">
        <Button title="Share Results" onPress={shareResults} />
      </View>
    </View>
  );
}
