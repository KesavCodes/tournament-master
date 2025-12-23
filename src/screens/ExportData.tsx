import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";

const ExportData = () => {
  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold mb-2">Export Data</Text>

      <Text className="text-gray-600 mb-6">
        This will export all tournaments on this device. No data will be
        deleted.
      </Text>

      <TouchableOpacity
        onPress={
          // handleShowQR
          () => {}
        }
        className="bg-gray-800 rounded-2xl p-4 mb-4"
      >
        <Text className="text-white text-center font-semibold text-lg">
          Show QR Code
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={
          // handleExportFile
          () => {}
        }
        className="border border-gray-800 rounded-2xl p-4"
      >
        <Text className="text-center font-semibold text-lg">
          Export as File
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ExportData;

const styles = StyleSheet.create({});
