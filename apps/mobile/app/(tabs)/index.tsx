import { useState, useEffect, useCallback } from "react"
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, ScrollView, Alert,
} from "react-native"
import { router } from "expo-router"
import * as SecureStore from "expo-secure-store"
import { api } from "@/lib/api"

type DashboardData = {
  user: { name: string; email: string; weightUnit: string }
  stats: { totalRMs: number; totalWods: number; wodsThisWeek: number }
  recentPRs: Array<{
    id: string
    value: number
    reps: number | null
    recordedAt: string
    movement: { name: string; nameEs: string | null; measureType: string }
  }>
  recentWods: Array<{
    id: string
    name: string
    wodType: string
    timeSeconds: number | null
    totalReps: number | null
    scale: string
    performedAt: string
  }>
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-CL", {
    day: "numeric", month: "short",
  })
}

export default function DashboardScreen() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await api.get("/api/dashboard")
      setData(res.data)
    } catch {
      Alert.alert("Error", "No se pudo cargar el dashboard")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchDashboard() }, [fetchDashboard])

  async function handleLogout() {
    await SecureStore.deleteItemAsync("session_token")
    await SecureStore.deleteItemAsync("user")
    router.replace("/(auth)/login")
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#fff" size="large" />
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greeting}>Hola, {data?.user.name?.split(" ")[0]} 👋</Text>
          <Text style={styles.subtitle}>Aquí va tu resumen</Text>
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{data?.stats.wodsThisWeek}</Text>
          <Text style={styles.statLabel}>WODs esta semana</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{data?.stats.totalRMs}</Text>
          <Text style={styles.statLabel}>RMs registrados</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{data?.stats.totalWods}</Text>
          <Text style={styles.statLabel}>WODs totales</Text>
        </View>
      </View>

      {/* Recent PRs */}
      {data?.recentPRs && data.recentPRs.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Últimos PRs</Text>
          {data.recentPRs.map(pr => (
            <View key={pr.id} style={styles.prRow}>
              <View>
                <Text style={styles.prName}>
                  {pr.movement.nameEs || pr.movement.name}
                </Text>
                <Text style={styles.prDate}>{formatDate(pr.recordedAt)}</Text>
              </View>
              <Text style={styles.prValue}>
                {pr.value}{pr.movement.measureType === "WEIGHT" ? " kg" : " reps"}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Recent WODs */}
      {data?.recentWods && data.recentWods.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Últimos WODs</Text>
          {data.recentWods.map(wod => (
            <View key={wod.id} style={styles.wodRow}>
              <View>
                <Text style={styles.wodName}>{wod.name}</Text>
                <Text style={styles.wodDate}>{formatDate(wod.performedAt)}</Text>
              </View>
              <Text style={styles.wodResult}>
                {wod.timeSeconds
                  ? formatTime(wod.timeSeconds)
                  : wod.totalReps
                  ? `${wod.totalReps} reps`
                  : wod.scale}
              </Text>
            </View>
          ))}
        </View>
      )}

      {data?.stats.totalRMs === 0 && data?.stats.totalWods === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>¡Bienvenido!</Text>
          <Text style={styles.emptySubtext}>
            Registra tu primer RM o WOD para ver tu resumen aquí
          </Text>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#000" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, marginTop: 8 },
  greeting: { fontSize: 26, fontWeight: "bold", color: "#fff", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#666" },
  logoutText: { color: "#666", fontSize: 14, marginTop: 4 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 28 },
  statCard: { flex: 1, backgroundColor: "#111", borderRadius: 12, padding: 14, alignItems: "center" },
  statValue: { fontSize: 28, fontWeight: "bold", color: "#FFD700", marginBottom: 4 },
  statLabel: { fontSize: 11, color: "#666", textAlign: "center" },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#fff", marginBottom: 12 },
  prRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#111", borderRadius: 10, padding: 14, marginBottom: 6 },
  prName: { color: "#fff", fontSize: 14, fontWeight: "600", marginBottom: 2 },
  prDate: { color: "#666", fontSize: 12 },
  prValue: { color: "#FFD700", fontSize: 18, fontWeight: "bold" },
  wodRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#111", borderRadius: 10, padding: 14, marginBottom: 6 },
  wodName: { color: "#fff", fontSize: 14, fontWeight: "600", marginBottom: 2 },
  wodDate: { color: "#666", fontSize: 12 },
  wodResult: { color: "#FFD700", fontSize: 16, fontWeight: "bold" },
  empty: { paddingVertical: 40, alignItems: "center" },
  emptyText: { color: "#fff", fontSize: 20, fontWeight: "bold", marginBottom: 8 },
  emptySubtext: { color: "#666", fontSize: 14, textAlign: "center", lineHeight: 20 },
})
