import { useState, useEffect, useCallback } from "react"
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
  Modal, TextInput, Dimensions, ScrollView,
} from "react-native"
import { useLocalSearchParams, router } from "expo-router"
import { LineChart } from "react-native-chart-kit"
import { api } from "@/lib/api"

const SCREEN_WIDTH = Dimensions.get("window").width

type RMRecord = {
  id: string
  value: number
  reps: number | null
  isPR: boolean
  notes: string | null
  recordedAt: string
  movement: {
    id: string
    name: string
    nameEs: string | null
    measureType: "WEIGHT" | "REPS"
  }
}

export default function MovementDetailScreen() {
  const { id, name, nameEs, measureType } = useLocalSearchParams<{
    id: string
    name: string
    nameEs: string
    measureType: string
  }>()

  const [records, setRecords] = useState<RMRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [value, setValue] = useState("")
  const [reps, setReps] = useState("1")
  const [saving, setSaving] = useState(false)

  const displayName = nameEs || name

  const fetchRecords = useCallback(async () => {
    try {
      const res = await api.get(`/api/rm?movementId=${id}`)
      setRecords(res.data)
    } catch {
      Alert.alert("Error", "No se pudo cargar el historial")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  async function handleSave() {
    if (!value) {
      Alert.alert("Error", "Ingresa el valor")
      return
    }
    setSaving(true)
    try {
      const res = await api.post("/api/rm", {
        movementId: id,
        value: parseFloat(value),
        reps: measureType === "WEIGHT" ? parseInt(reps) : undefined,
        recordedAt: new Date().toISOString(),
      })

      const isPR = res.data.isPR
      Alert.alert(
        isPR ? "🎉 ¡Nuevo PR!" : "✅ Registrado",
        isPR
          ? `Nuevo récord: ${value}${measureType === "WEIGHT" ? " kg" : " reps"}`
          : "RM registrado correctamente",
        [{ text: "OK", onPress: () => {
          setShowForm(false)
          setValue("")
          setReps("1")
          fetchRecords()
        }}]
      )
    } catch {
      Alert.alert("Error", "No se pudo guardar")
    } finally {
      setSaving(false)
    }
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr)
    return date.toLocaleDateString("es-CL", {
      day: "numeric",
      month: "short",
    })
  }

  const pr = records.find(r => r.isPR)

  // Datos para la gráfica — ordenados cronológicamente
  const chartData = [...records]
    .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())
    .slice(-10) // últimos 10 registros

  const hasChartData = chartData.length >= 2

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>← Volver</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{displayName}</Text>
      <Text style={styles.subtitle}>{name}</Text>

      {pr && (
        <View style={styles.prCard}>
          <Text style={styles.prLabel}>🏆 PR Actual</Text>
          <Text style={styles.prValue}>
            {pr.value}{measureType === "WEIGHT" ? " kg" : " reps"}
            {pr.reps && pr.reps > 1 ? ` × ${pr.reps}` : ""}
          </Text>
          <Text style={styles.prDate}>{formatDate(pr.recordedAt)}</Text>
        </View>
      )}

      {hasChartData && (
        <View style={styles.chartContainer}>
          <Text style={styles.sectionTitle}>Progresión</Text>
          <LineChart
            data={{
              labels: chartData.map(r => formatDate(r.recordedAt)),
              datasets: [{ data: chartData.map(r => r.value) }],
            }}
            width={SCREEN_WIDTH - 40}
            height={180}
            chartConfig={{
              backgroundColor: "#111",
              backgroundGradientFrom: "#111",
              backgroundGradientTo: "#111",
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(255, 215, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
              propsForDots: { r: "4", strokeWidth: "2", stroke: "#FFD700" },
            }}
            bezier
            style={{ borderRadius: 10, marginTop: 8 }}
            withInnerLines={false}
          />
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.sectionTitle}>
          Historial ({records.length})
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowForm(true)}
        >
          <Text style={styles.addButtonText}>+ Nuevo RM</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color="#fff" style={{ marginTop: 40 }} />
      ) : records.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Sin registros aún</Text>
          <Text style={styles.emptySubtext}>
            Toca "+ Nuevo RM" para registrar tu primer RM
          </Text>
        </View>
      ) : (
        records.map(item => (
          <View key={item.id} style={[styles.recordRow, item.isPR && styles.recordRowPR]}>
            <View>
              <View style={styles.recordValueRow}>
                <Text style={styles.recordValue}>
                  {item.value}{measureType === "WEIGHT" ? " kg" : " reps"}
                </Text>
                {item.reps && item.reps > 1 && (
                  <Text style={styles.recordReps}>× {item.reps} reps</Text>
                )}
                {item.isPR && (
                  <View style={styles.prBadge}>
                    <Text style={styles.prBadgeText}>PR</Text>
                  </View>
                )}
              </View>
              {item.notes && (
                <Text style={styles.recordNotes}>{item.notes}</Text>
              )}
            </View>
            <Text style={styles.recordDate}>{formatDate(item.recordedAt)}</Text>
          </View>
        ))
      )}

      <View style={{ height: 40 }} />

      <Modal visible={showForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nuevo RM — {displayName}</Text>

            {measureType === "WEIGHT" ? (
              <>
                <Text style={styles.label}>Peso (kg)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: 100"
                  placeholderTextColor="#666"
                  value={value}
                  onChangeText={setValue}
                  keyboardType="decimal-pad"
                  autoFocus
                />
                <Text style={styles.label}>Repeticiones</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: 1"
                  placeholderTextColor="#666"
                  value={reps}
                  onChangeText={setReps}
                  keyboardType="number-pad"
                />
              </>
            ) : (
              <>
                <Text style={styles.label}>Repeticiones</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: 10"
                  placeholderTextColor="#666"
                  value={value}
                  onChangeText={setValue}
                  keyboardType="number-pad"
                  autoFocus
                />
              </>
            )}

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={saving}
            >
              {saving
                ? <ActivityIndicator color="#000" />
                : <Text style={styles.saveButtonText}>Guardar</Text>
              }
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => { setShowForm(false); setValue(""); setReps("1") }}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#000" },
  back: { marginBottom: 16, marginTop: 8 },
  backText: { color: "#888", fontSize: 15 },
  title: { fontSize: 28, fontWeight: "bold", color: "#fff", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#666", marginBottom: 20 },
  prCard: { backgroundColor: "#1a1a00", borderWidth: 1, borderColor: "#444400", borderRadius: 12, padding: 16, marginBottom: 20 },
  prLabel: { fontSize: 12, color: "#888", marginBottom: 4 },
  prValue: { fontSize: 32, fontWeight: "bold", color: "#FFD700" },
  prDate: { fontSize: 12, color: "#666", marginTop: 4 },
  chartContainer: { marginBottom: 24 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: "#fff", marginBottom: 8 },
  addButton: { backgroundColor: "#fff", borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  addButtonText: { color: "#000", fontWeight: "bold", fontSize: 13 },
  empty: { paddingVertical: 40, alignItems: "center" },
  emptyText: { color: "#666", fontSize: 16, marginBottom: 8 },
  emptySubtext: { color: "#444", fontSize: 13, textAlign: "center" },
  recordRow: { backgroundColor: "#111", borderRadius: 10, padding: 14, marginBottom: 6, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  recordRowPR: { borderWidth: 1, borderColor: "#444400", backgroundColor: "#111100" },
  recordValueRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  recordValue: { color: "#fff", fontSize: 18, fontWeight: "600" },
  recordReps: { color: "#888", fontSize: 14 },
  prBadge: { backgroundColor: "#FFD700", borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  prBadgeText: { color: "#000", fontSize: 10, fontWeight: "bold" },
  recordNotes: { color: "#666", fontSize: 12, marginTop: 4 },
  recordDate: { color: "#666", fontSize: 13 },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.7)" },
  modalContent: { backgroundColor: "#111", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#fff", marginBottom: 20 },
  label: { color: "#888", fontSize: 13, marginBottom: 6 },
  input: { backgroundColor: "#222", borderWidth: 1, borderColor: "#333", borderRadius: 10, padding: 14, color: "#fff", fontSize: 16, marginBottom: 14 },
  saveButton: { backgroundColor: "#fff", borderRadius: 12, padding: 16, alignItems: "center", marginTop: 4 },
  saveButtonText: { color: "#000", fontSize: 16, fontWeight: "bold" },
  cancelButton: { padding: 16, alignItems: "center" },
  cancelButtonText: { color: "#666", fontSize: 15 },
})
