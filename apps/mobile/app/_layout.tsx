import { useEffect, useState } from "react"
import { Stack, router } from "expo-router"
import { StatusBar } from "expo-status-bar"
import * as SecureStore from "expo-secure-store"

export default function RootLayout() {
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    checkSession()
  }, [])

  async function checkSession() {
    const token = await SecureStore.getItemAsync("session_token")
    if (token) {
      router.replace("/(tabs)")
    } else {
      router.replace("/(auth)/login")
    }
    setChecking(false)
  }

  if (checking) return null

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="auto" />
    </>
  )
}
