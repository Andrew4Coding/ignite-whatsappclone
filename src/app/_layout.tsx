import { useEffect, useState } from "react"
// eslint-disable-next-line no-restricted-imports
import { View, ViewStyle, TextStyle, TouchableOpacity, StyleSheet } from "react-native"
import { Slot, SplashScreen, usePathname, useRouter } from "expo-router"
import { useFonts } from "@expo-google-fonts/space-grotesk"
import { KeyboardProvider } from "react-native-keyboard-controller"
import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context"

import { Icon } from "@/components/Icon"
import { Text } from "@/components/Text"
import { AuthProvider, useAuth } from "@/context/AuthContext"
import { initI18n } from "@/i18n"
import { ThemeProvider, useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { customFontsToLoad } from "@/theme/typography"
import { loadDateFnsLocale } from "@/utils/formatDate"

SplashScreen.preventAutoHideAsync()

if (__DEV__) {
  // Load Reactotron configuration in development. We don't want to
  // include this in our production bundle, so we are using `if (__DEV__)`
  // to only execute this in development.
  require("@/devtools/ReactotronConfig")
}

function AppContent() {
  const pathname = usePathname()
  const router = useRouter()
  const { themed, theme } = useAppTheme()
  const { isAuthenticated, userName, logout } = useAuth()

  // Show header only on authenticated routes (not login)
  const showHeader = isAuthenticated && pathname !== "/login"

  const handleLogout = () => {
    logout()
    router.replace("/login")
  }

  return (
    <View style={$container}>
      {showHeader && (
        <View style={themed($header)}>
          <View style={themed($headerContent)}>
            <Text style={themed($headerTitle)} preset="subheading">
              WhatsApp Clone
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
      )}
      <Slot />
    </View>
  )
}

export default function Root() {
  const [fontsLoaded, fontError] = useFonts(customFontsToLoad)
  const [isI18nInitialized, setIsI18nInitialized] = useState(false)

  useEffect(() => {
    initI18n()
      .then(() => setIsI18nInitialized(true))
      .then(() => loadDateFnsLocale())
  }, [])

  const loaded = fontsLoaded && isI18nInitialized

  useEffect(() => {
    if (fontError) throw fontError
  }, [fontError])

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  if (!loaded) {
    return null
  }

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <ThemeProvider>
        <AuthProvider>
          <KeyboardProvider>
            <AppContent />
          </KeyboardProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  )
}

const $header: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
  backgroundColor: colors.background,
  borderBottomWidth: StyleSheet.hairlineWidth,
  borderBottomColor: colors.border,
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

const $container: ViewStyle = {
  flex: 1,
}
