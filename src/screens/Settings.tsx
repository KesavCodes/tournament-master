import { View, Text, TouchableOpacity, Switch } from "react-native";
import React, { useState } from "react";
import SettingsItem from "../components/SettingsItem";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Settings">;

export default function Settings({ navigation }: Props) {
  return (
    <View className="flex-1 bg-white px-3 pv-4">
      <Text className="text-2xl font-bold mb-6">Settings</Text>
      <SettingsItem
        icon="share-social-outline"
        title="Export Data"
        subtitle="Share all tournaments with friends"
        onPress={() => {}}
      />
      <SettingsItem
        icon="download-outline"
        title="Import Data"
        subtitle="Add tournaments from another device"
        onPress={() => {}}
      />
    </View>
  );
}
