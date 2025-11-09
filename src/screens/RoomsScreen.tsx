import { useCallback, useEffect, useState } from "react"
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native"
import { useRouter } from "expo-router"

import { Icon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useAuth } from "@/context/AuthContext"
import { api } from "@/services/api"
import type { Room } from "@/services/api/types"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"

export default function RoomsScreen() {
  const router = useRouter()
  const { themed, theme } = useAppTheme()
  const { isAuthenticated, userName, logout } = useAuth()

  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const $bottomContainerInsets = useSafeAreaInsetsStyle(["bottom"])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login")
    }
  }, [isAuthenticated, router])

  const handleLogout = useCallback(() => {
    logout()
    router.replace("/login")
  }, [logout, router])

  const fetchRooms = useCallback(async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true)
    setError(null)

    try {
      const result = await api.getRooms()
      if (result.kind === "ok") {
        setRooms(result.rooms)
      } else {
        setError("Failed to load rooms")
      }
    } catch (e) {
      setError("An error occurred")
      if (__DEV__) {
        console.tron.log(e)
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchRooms()
  }, [fetchRooms])

  const handleRefresh = useCallback(() => {
    setRefreshing(true)
    fetchRooms(true)
  }, [fetchRooms])

  const navigateToRoom = useCallback(
    (roomId: string) => {
      router.push(`/room/${roomId}`)
    },
    [router],
  )

  const renderRoom: ListRenderItem<Room> = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={themed($roomItem)}
        onPress={() => navigateToRoom(item.id)}
        activeOpacity={0.7}
      >
        <View style={themed($roomAvatar)}>
          {item.imageUrl ? (
            <Icon icon="view" size={32} color={theme.colors.palette.primary300} />
          ) : (
            <Text style={themed($roomAvatarText)} preset="heading">
              {item.name.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
        <View style={themed($roomContent)}>
          <View style={themed($roomHeader)}>
            <Text style={themed($roomName)} preset="subheading">
              {item.name}
            </Text>
            {item.lastMessageTime && (
              <Text style={themed($roomTime)} size="xs">
                {new Date(item.lastMessageTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            )}
          </View>
          {item.lastMessage && (
            <View style={themed($roomFooter)}>
              <Text style={themed($roomLastMessage)} numberOfLines={1} size="sm">
                {item.lastMessage}
              </Text>
              {item.unreadCount !== undefined && item.unreadCount > 0 && (
                <View style={themed($unreadBadge)}>
                  <Text style={themed($unreadText)} size="xxs">
                    {item.unreadCount}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    ),
    [themed, theme, navigateToRoom],
  )

  const renderEmptyState = () => (
    <View style={themed($emptyState)}>
      <Icon icon="view" size={64} color={theme.colors.textDim} />
      <Text style={themed($emptyText)} preset="subheading">
        No rooms yet
      </Text>
      <Text style={themed($emptySubtext)}>Start a conversation to get started</Text>
    </View>
  )

  if (loading) {
    return (
      <Screen preset="fixed" safeAreaEdges={["top"]}>
        <View style={themed($header)}>
          <View style={themed($headerContent)}>
            <Text style={themed($headerTitle)} preset="heading">
              Chats
            </Text>
            {userName && (
              <Text style={themed($headerSubtitle)} size="xs">
                {userName}
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={themed($logoutButton)}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Icon icon="x" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
        <View style={themed($loadingContainer)}>
          <ActivityIndicator size="large" color={theme.colors.tint} />
        </View>
      </Screen>
    )
  }

  if (error && rooms.length === 0) {
    return (
      <Screen preset="fixed" safeAreaEdges={["top"]}>
        <View style={themed($header)}>
          <View style={themed($headerContent)}>
            <Text style={themed($headerTitle)} preset="heading">
              Chats
            </Text>
            {userName && (
              <Text style={themed($headerSubtitle)} size="xs">
                {userName}
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={themed($logoutButton)}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Icon icon="x" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
        <View style={themed($errorContainer)}>
          <Text style={themed($errorText)}>{error}</Text>
          <TouchableOpacity
            style={themed($retryButton)}
            onPress={() => fetchRooms()}
            activeOpacity={0.7}
          >
            <Text style={themed($retryButtonText)}>Retry</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    )
  }

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]} contentContainerStyle={themed($screenContainer)}>
      <View style={themed($header)}>
        <View style={themed($headerContent)}>
          <Text style={themed($headerTitle)} preset="heading">
            Chats
          </Text>
          {userName && (
            <Text style={themed($headerSubtitle)} size="xs">
              {userName}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={themed($logoutButton)}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Icon icon="x" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id}
        renderItem={renderRoom}
        contentContainerStyle={[themed($roomsList), $bottomContainerInsets]}
        ListEmptyComponent={renderEmptyState}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  )
}

const $screenContainer: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $loadingContainer: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
})

const $errorContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  padding: spacing.lg,
})

const $errorText: ThemedStyle<TextStyle> = ({ spacing, colors }) => ({
  marginBottom: spacing.md,
  color: colors.error,
  textAlign: "center",
})

const $retryButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  paddingVertical: spacing.xs,
  paddingHorizontal: spacing.md,
  backgroundColor: colors.palette.primary600,
  borderRadius: 8,
})

const $retryButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral100,
})

const $header: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
  backgroundColor: colors.background,
})

const $headerContent: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $headerTitle: ThemedStyle<TextStyle> = () => ({})

const $headerSubtitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
})

const $logoutButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.xs,
})

const $roomsList: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.md,
})

const $roomItem: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.xs,
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
})

const $roomAvatar: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  width: 56,
  height: 56,
  borderRadius: 28,
  backgroundColor: colors.palette.neutral300,
  justifyContent: "center",
  alignItems: "center",
  marginRight: spacing.md,
})

const $roomAvatarText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral100,
})

const $roomContent: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $roomHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: spacing.xxxs,
})

const $roomName: ThemedStyle<TextStyle> = () => ({})

const $roomTime: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
})

const $roomFooter: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
})

const $roomLastMessage: ThemedStyle<TextStyle> = ({ colors }) => ({
  flex: 1,
  color: colors.textDim,
})

const $unreadBadge: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  backgroundColor: colors.palette.primary600,
  borderRadius: 10,
  paddingHorizontal: spacing.xs,
  paddingVertical: 2,
  minWidth: 20,
  justifyContent: "center",
  alignItems: "center",
  marginLeft: spacing.xs,
})

const $unreadText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral100,
  fontWeight: "600",
})

const $emptyState: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingVertical: spacing.xxxl,
})

const $emptyText: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginTop: spacing.md,
  marginBottom: spacing.xs,
})

const $emptySubtext: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
})
