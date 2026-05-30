import { useState } from "react"
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from "react-native"
import { router } from "expo-router"
import * as SecureStore from "expo-secure-store"
import { api } from "@/lib/api"

export default function LoginScreen() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert("Error", "Completa todos los campos")
      return
    }
    setLoading(true)
    try {
      const res = await api.post("/api/mobile/login", { email, password })
      await SecureStore.setItemAsync("session_token", res.data.token)
      await SecureStore.setItemAsync("user", JSON.stringify(res.data.user))
      router.replace("/(tabs)")
    } catch (error: any) {
      const msg = error?.response?.data?.error || "No se pudo conectar al servidor"
      Alert.alert("Error", msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CrossFit Tracker</Text>
      <Text style={styles.subtitle}>Inicia sesión</Text>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#666"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#000" />
            : <Text style={styles.buttonText}>Iniciar sesión</Text>
          }
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
          <Text style={styles.link}>¿No tienes cuenta? Regístrate</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#000" },
  title: { fontSize: 32, fontWeight: "bold", color: "#fff", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#888", marginBottom: 40 },
  form: { gap: 12 },
  input: { backgroundColor: "#111", borderWidth: 1, borderColor: "#333", borderRadius: 12, padding: 16, color: "#fff", fontSize: 16 },
  button: { backgroundColor: "#fff", borderRadius: 12, padding: 16, alignItems: "center", marginTop: 8 },
  buttonText: { color: "#000", fontSize: 16, fontWeight: "bold" },
  link: { color: "#888", textAlign: "center", marginTop: 16 },
})
