import { useRouter } from "expo-router"
import { useCallback, useEffect, useState } from "react"
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native"

import { Icon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { useAuth } from "@/context/AuthContext"
import { api } from "@/services/api"
import type { Message, Room } from "@/services/api/types"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface RoomScreenProps {
  roomId: string
}

export default function RoomScreen({ roomId }: RoomScreenProps) {
  const router = useRouter()
  const { themed, theme } = useAppTheme()
  const { userId, userName, isAuthenticated } = useAuth()

  const [room, setRoom] = useState<Room | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageText, setMessageText] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login")
    }
  }, [isAuthenticated, router])

  // Fetch room and messages
  useEffect(() => {
    if (!roomId) return

    // Log Current Time
    console.log("Current Time:", new Date().toISOString())

    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        // Fetch room details
        console.log("Fetching room details for roomId:", roomId)
        const roomResult = await api.getRoom(roomId)
        if (roomResult.kind === "ok") {
          setRoom(roomResult.room)
        } else {
          setError("Failed to load room")
          return
        }

        // Fetch messages
        const messagesResult = await api.getMessages(roomId)

        if (messagesResult.kind === "ok") {
          console.log("Raw messages from API:", JSON.stringify(messagesResult.messages, null, 2))

          // Map the API response to our Message type
          const mappedMessages = messagesResult.messages.map((msg: any) => {
            console.log("Processing message:", {
              id: msg.id,
              content: msg.content,
              message: msg.message,
              createdAt: msg.createdAt,
            })

            return {
              id: msg.id,
              roomId: msg.RoomId || roomId,
              content: msg.content || msg.message || "",
              senderId: msg.senderId || msg.id,
              senderName: msg.senderName || msg.name || "",
              senderAvatar: msg.senderAvatar || msg.avatar || "",
              type: msg.type || "text",
              status: msg.status || "sent",
              createdAt: msg.createdAt || new Date().toISOString(),
              updatedAt: msg.updatedAt || msg.createdAt || new Date().toISOString(),
            }
          })

          // Sort messages by createdAt timestamp (oldest first)
          const sortedMessages = mappedMessages.sort((a, b) => {
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          })

          console.log(
            "Sorted messages:",
            sortedMessages.map((m) => ({
              id: m.id,
              content: m.content,
              createdAt: m.createdAt,
              time: new Date(m.createdAt).toLocaleTimeString(),
            })),
          )

          setMessages(sortedMessages)
        } else {
          setError("Failed to load messages")
        }
      } catch (e) {
        setError("An error occurred")
        if (__DEV__) {
          console.tron.log(e)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [roomId])

  const sendMessage = useCallback(async () => {
    if (!messageText.trim() || !roomId || !userId || !userName) return

    setSending(true)
    try {
      const result = await api.addMessage(
        {
          content: messageText,
          senderId: userId,
          senderName: userName,
          type: "text",
          status: "sent",
          message: messageText,
          name: userName,
        },
        roomId,
      )

      if (result.kind === "ok") {
        console.log("Message sent, API response:", JSON.stringify(result.message, null, 2))

        // Map the response to our Message type
        const mappedMessage = {
          id: result.message.id,
          roomId: (result.message as any).RoomId || roomId,
          content: result.message.content || (result.message as any).message || messageText,
          senderId: result.message.senderId || userId,
          senderName: result.message.senderName || (result.message as any).name || userName,
          senderAvatar: result.message.senderAvatar || (result.message as any).avatar || "",
          type: result.message.type || "text",
          status: result.message.status || "sent",
          createdAt: result.message.createdAt || new Date().toISOString(),
          updatedAt:
            result.message.updatedAt || result.message.createdAt || new Date().toISOString(),
        }

        console.log("Mapped message to add:", {
          id: mappedMessage.id,
          content: mappedMessage.content,
          createdAt: mappedMessage.createdAt,
          time: new Date(mappedMessage.createdAt).toLocaleTimeString(),
        })

        setMessages((prev) => [...prev, mappedMessage])
        setMessageText("")
      } else {
        setError("Failed to send message")
      }
    } catch (e) {
      setError("Failed to send message")
      if (__DEV__) {
        console.tron.log(e)
      }
    } finally {
      setSending(false)
    }
  }, [messageText, roomId, userId, userName])

  const renderMessage: ListRenderItem<Message> = useCallback(
    ({ item }) => {
      // Check if message is from the current user
      const isOwnMessage = item.senderId === userId

      return (
        <View
          style={[
            themed($messageContainer),
            isOwnMessage ? themed($ownMessage) : themed($otherMessage),
          ]}
        >
          {!isOwnMessage && item.senderName && (
            <Text style={themed($senderName)} size="xs">
              {item.senderName}
            </Text>
          )}
          <Text style={isOwnMessage ? themed($senderMessageText) : themed($messageText)}>
            {item.content}
          </Text>
          <Text style={themed($messageTime)} size="xxs">
            {new Date(item.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      )
    },
    [themed, userId],
  )

  if (loading) {
    return (
      <Screen preset="fixed" safeAreaEdges={["top"]}>
        <View style={themed($loadingContainer)}>
          <ActivityIndicator size="large" color={theme.colors.tint} />
        </View>
      </Screen>
    )
  }

  if (error || !room) {
    return (
      <Screen preset="fixed" safeAreaEdges={["top"]}>
        <View style={themed($errorContainer)}>
          <Text style={themed($errorText)}>{error || "Room not found"}</Text>
          <TouchableOpacity
            style={themed($backButton)}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={themed($backButtonText)}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    )
  }

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]} contentContainerStyle={themed($screenContainer)}>
      {/* Header */}
      <View style={themed($header)}>
        <TouchableOpacity onPress={() => router.back()} style={themed($headerBackButton)}>
          <Icon icon="back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={themed($headerContent)}>
          <Text style={themed($headerTitle)} preset="subheading">
            {room.name}
          </Text>
          {room.description && (
            <Text style={themed($headerSubtitle)} size="xs">
              {room.description}
            </Text>
          )}
        </View>
      </View>

      {/* Messages List */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={themed($messagesList)}
        inverted={false}
        showsVerticalScrollIndicator={false}
      />

      {/* Input Area */}
      <View style={themed($inputContainer)}>
        <TextField
          containerStyle={themed($inputWrapper)}
          style={themed($input)}
          placeholder="Type a message..."
          value={messageText}
          onChangeText={setMessageText}
          multiline
          maxLength={1000}
          editable={!sending}
        />
        <TouchableOpacity
          style={themed($sendButton)}
          onPress={sendMessage}
          disabled={!messageText.trim() || sending}
          activeOpacity={0.7}
        >
          {sending ? (
            <ActivityIndicator size="small" color={theme.colors.palette.neutral100} />
          ) : (
            <Icon
              icon="check"
              size={20}
              color={
                messageText.trim()
                  ? theme.colors.palette.neutral100
                  : theme.colors.palette.neutral400
              }
            />
          )}
        </TouchableOpacity>
      </View>
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

const $backButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  paddingVertical: spacing.xs,
  paddingHorizontal: spacing.md,
  backgroundColor: colors.palette.primary600,
  borderRadius: 8,
})

const $backButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral100,
})

const $header: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  backgroundColor: colors.background,
  borderBottomWidth: StyleSheet.hairlineWidth,
  borderBottomColor: colors.border,
})

const $headerBackButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginRight: spacing.sm,
})

const $headerContent: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $headerTitle: ThemedStyle<TextStyle> = () => ({})

const $headerSubtitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
})

const $messagesList: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
})

const $messageContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  maxWidth: "75%",
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  borderRadius: 12,
  marginVertical: spacing.xxs,
})

const $ownMessage: ThemedStyle<ViewStyle> = ({ colors }) => ({
  alignSelf: "flex-end",
  backgroundColor: colors.palette.primary600,
})

const $otherMessage: ThemedStyle<ViewStyle> = ({ colors }) => ({
  alignSelf: "flex-start",
  backgroundColor: colors.palette.neutral300,
})

const $senderName: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.palette.primary300,
  marginBottom: spacing.xxxs,
  fontWeight: "600",
})

const $messageText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
})

const $senderMessageText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral100,
})

const $messageTime: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  marginTop: spacing.xxxs,
  alignSelf: "flex-end",
})

const $inputContainer: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flexDirection: "row",
  alignItems: "flex-end",
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  backgroundColor: colors.background,
  borderTopWidth: StyleSheet.hairlineWidth,
  borderTopColor: colors.border,
})

const $inputWrapper: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  marginRight: spacing.xs,
})

const $input: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: colors.text,
  fontSize: 16,
  fontFamily: typography.primary.normal,
})

const $sendButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: colors.palette.primary600,
  justifyContent: "center",
  alignItems: "center",
})
