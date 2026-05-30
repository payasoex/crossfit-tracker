import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { router } from "expo-router"
import * as SecureStore from "expo-secure-store"

export default function DashboardScreen() {
  async function handleLogout() {
    await SecureStore.deleteItemAsync("session_token")
    await SecureStore.deleteItemAsync("user")
    router.replace("/(auth)/login")
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.subtitle}>Bienvenido al tracker</Text>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#000" },
  title: { fontSize: 28, fontWeight: "bold", color: "#fff", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#888", marginBottom: 40 },
  logoutButton: { marginTop: "auto", padding: 16, borderWidth: 1, borderColor: "#333", borderRadius: 12, alignItems: "center" },
  logoutText: { color: "#888", fontSize: 15 },
})
