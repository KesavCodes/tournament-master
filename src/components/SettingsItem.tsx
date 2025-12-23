import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, TouchableOpacity, View } from "react-native";

const SettingsItem = ({ icon, title, subtitle, onPress }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle: string;
    onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-row items-center py-4 border-b border-gray-200"
  >
    <Ionicons name={icon} size={22} color="#333" />
    <View className="ml-4">
      <Text className="font-semibold text-lg">{title}</Text>
      <Text className="text-gray-500 text-sm">{subtitle}</Text>
    </View>
  </TouchableOpacity>
);

export default SettingsItem;