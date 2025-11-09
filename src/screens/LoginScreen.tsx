import { FC, useEffect, useRef, useState } from "react"
// eslint-disable-next-line no-restricted-imports
import { TextInput, TextStyle, ViewStyle } from "react-native"
import { useRouter } from "expo-router"

import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { useAuth } from "@/context/AuthContext"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface LoginScreenProps extends AppStackScreenProps<"Login"> {}

export const LoginScreen: FC<LoginScreenProps> = () => {
  const router = useRouter()
  const senderIdInput = useRef<TextInput>(null)

  const [senderId, setSenderId] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [attemptsCount, setAttemptsCount] = useState(0)
  const { setAuthToken, setUserId, setUserName, userName, validationError } = useAuth()

  const { themed } = useAppTheme()

  useEffect(() => {
    // Pre-fill with demo values
    setUserName("John Doe")
    setSenderId("") // Leave sender ID empty by default
  }, [setUserName])

  const error = isSubmitted ? validationError : ""

  function login() {
    setIsSubmitted(true)
    setAttemptsCount(attemptsCount + 1)

    if (validationError) return

    // Make a request to your server to get an authentication token.
    // If successful, reset the fields and set the token.
    setIsSubmitted(false)

    // Generate a random sender ID if not provided
    const finalSenderId =
      senderId.trim() || `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

    // Store user information
    setUserId(finalSenderId)
    setUserName(userName || "User")

    // We'll mock this with a fake token.
    setAuthToken(String(Date.now()))

    // Redirect to rooms after successful login
    router.replace("/rooms")
  }

  return (
    <Screen
      preset="auto"
      contentContainerStyle={themed($screenContentContainer)}
      safeAreaEdges={["top", "bottom"]}
    >
      <Text testID="login-heading" text="Welcome" preset="heading" style={themed($logIn)} />
      <Text
        text="Enter your details to continue"
        preset="subheading"
        style={themed($enterDetails)}
      />
      {attemptsCount > 2 && (
        <Text text="Please check your inputs" size="sm" weight="light" style={themed($hint)} />
      )}

      <TextField
        value={userName}
        onChangeText={setUserName}
        containerStyle={themed($textField)}
        autoCapitalize="words"
        autoComplete="name"
        autoCorrect={false}
        label="Name"
        placeholder="Enter your name"
        helper={error ? error : undefined}
        status={error ? "error" : undefined}
        onSubmitEditing={() => senderIdInput.current?.focus()}
      />

      <TextField
        ref={senderIdInput}
        value={senderId}
        onChangeText={setSenderId}
        containerStyle={themed($textField)}
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect={false}
        label="Sender ID (Optional)"
        placeholder="Leave blank to auto-generate"
        helper="A unique ID will be generated if left empty"
        onSubmitEditing={login}
      />

      <Button
        testID="login-button"
        text="Continue"
        style={themed($tapButton)}
        preset="reversed"
        onPress={login}
      />
    </Screen>
  )
}

const $screenContentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.xxl,
  paddingHorizontal: spacing.lg,
})

const $logIn: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.sm,
})

const $enterDetails: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.lg,
})

const $hint: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.tint,
  marginBottom: spacing.md,
})

const $textField: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.lg,
})

const $tapButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.xs,
})
