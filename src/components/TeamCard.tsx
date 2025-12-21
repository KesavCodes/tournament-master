import { Text, TouchableOpacity, View } from "react-native";
import { ID, Player, TeamPlayerRole, TournamentTeam } from "../types";

export default function TeamCard({
  team,
  playersById,
  teamName,
  onUpdate,
}: {
  team: TournamentTeam;
  playersById: Record<ID, Player>;
  teamName?: string;
  onUpdate: (team: TournamentTeam, playerId: ID, roles: TeamPlayerRole) => void;
}) {
  const roles = team.playerRoles ?? {};

  const captainId = team.players.find((id) => roles[id]?.includes("captain"));
  const viceCaptainId = team.players.find((id) =>
    roles[id]?.includes("vice_captain")
  );

  return (
    <View className="bg-white rounded-2xl py-2 mb-3 border border-gray-400">
      <Text className="text-xl font-bold mb-1 px-3">{teamName}</Text>
      <View className="flex-row mb-2 bg-gray-800 py-1 px-3">
        <Text className="w-[40%] font-semibold text-white">Players</Text>
        {/* <Text className="w-[22%] text-center font-semibold text-white">
          Playing / Sub
        </Text> */}
        <View className="flex-row items-center justify-end flex-1 gap-6">
          <Text className=" text-center font-semibold text-white">Cap</Text>
          <Text className=" text-center font-semibold text-white">
            Vice Cap
          </Text>
        </View>
      </View>
      {team.players.map((pid) => {
        const player = playersById[pid];
        // const r = roles[pid] ?? [];

        // const isPlaying = r.includes("playing");

        return (
          <View
            key={pid}
            className="flex-row justify-between items-center mb-2 px-3"
          >
            <Text className="font-medium w-[40%]" numberOfLines={1}>
              {player?.name}
            </Text>

            {/* Playing / Sub */}
            {/* <TouchableOpacity
              activeOpacity={1}
              onPress={() => onUpdate(team, pid, isPlaying ? "sub" : "playing")}
              className={`px-3 py-1 rounded-lg w-[22%] ${
                isPlaying ? "bg-green-600" : "bg-gray-300"
              }`}
            >
              <Text
                className={isPlaying ? "text-white" : "text-black"}
                numberOfLines={1}
              >
                {isPlaying ? "Playing" : "Sub"}
              </Text>
            </TouchableOpacity> */}

            <View className="flex-row items-center justify-end flex-1 gap-2">
              {/* Captain */}
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => onUpdate(team, pid, "captain")}
                className={`px-3 py-1 rounded-lg w-[20%] ${
                  captainId === pid ? "bg-green-600" : "bg-gray-300"
                }`}
              >
                <Text
                  className={captainId === pid ? "font-bold text-white" : ""}
                >
                  C
                </Text>
              </TouchableOpacity>

              {/* Vice Captain */}
              <TouchableOpacity
                activeOpacity={1}
                className={`px-3 py-1 rounded-lg w-[20%] ${
                  viceCaptainId === pid ? "bg-green-600" : "bg-gray-300"
                }`}
                onPress={() => onUpdate(team, pid, "vice_captain")}
              >
                <Text
                  className={
                    viceCaptainId === pid ? "font-bold text-white" : ""
                  }
                >
                  VC
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </View>
  );
}
