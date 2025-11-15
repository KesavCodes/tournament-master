import { View, Text, FlatList } from "react-native";
import React from "react";

export default function History() {
  const tournaments: any = [];

  return (
    <View className="flex-1 bg-white p-5">
      <FlatList
        data={tournaments}
        keyExtractor={(t) => t.id}
        renderItem={({ item }) => (
          <View className="bg-gray-100 p-4 mb-3 rounded-2xl">
            <Text className="font-semibold">{item.name}</Text>
            <Text className="text-gray-500">{item.winner}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text className="text-gray-400 text-center mt-20">
            No tournaments found
          </Text>
        }
      />
    </View>
  );
}
