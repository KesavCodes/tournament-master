import { View, Text, TouchableOpacity, Switch } from "react-native";
import React, { useState } from "react";

export default function Settings() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <View className="flex-1 bg-white p-5">
      <Text className="text-2xl font-bold mb-4">Settings</Text>

      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg text-gray-700">Dark Mode</Text>
        <Switch value={darkMode} onValueChange={setDarkMode} />
      </View>

      <TouchableOpacity
        className="bg-red-500 py-3 rounded-2xl"
        activeOpacity={1}
      >
        <Text className="text-center text-white font-semibold">
          Clear All Data
        </Text>
      </TouchableOpacity>
    </View>
  );
}
