import { useLocalSearchParams } from "expo-router"

import RoomScreen from "@/screens/RoomScreen"

export default function RoomRoute() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return <RoomScreen roomId={id} />
}
