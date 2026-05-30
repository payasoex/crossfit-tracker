import { useState, useEffect, useCallback } from "react"
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, Modal, TextInput,
  ScrollView, FlatList,
} from "react-native"
import { api } from "@/lib/api"

type WodLog = {
  id: string
  name: string
  wodType: string
  description: string | null
  timeSeconds: number | null
  totalReps: number | null
  roundsCompleted: number | null
  loadKg: number | null
  scale: string
  notes: string | null
  performedAt: string
}

const WOD_TYPES = [
  { value: "FOR_TIME", label: "For Time" },
  { value: "AMRAP", label: "AMRAP" },
  { value: "EMOM", label: "EMOM" },
  { value: "LOAD", label: "Load" },
  { value: "CHIPPER", label: "Chipper" },
  { value: "CUSTOM", label: "Custom" },
]

const SCALE_OPTIONS = [
  { value: "RX", label: "RX" },
  { value: "SCALED", label: "Scaled" },
  { value: "RX_PLUS", label: "RX+" },
]

function formatResult(wod: WodLog): string {
  if (wod.timeSeconds) {
    const m = Math.floor(wod.timeSeconds / 60)
    const s = wod.timeSeconds % 60
    return `${m}:${s.toString().padStart(2, "0")}`
  }
  if (wod.totalReps) return `${wod.totalReps} reps`
  if (wod.roundsCompleted) return `${wod.roundsCompleted} rondas`
  if (wod.loadKg) return `${wod.loadKg} kg`
  return "—"
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-CL", {
    day: "numeric", month: "short", year: "numeric",
  })
}

export default function WODsScreen() {
  const [wods, setWods] = useState<WodLog[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  // Form state
  const [name, setName] = useState("")
  const [wodType, setWodType] = useState("FOR_TIME")
  const [description, setDescription] = useState("")
  const [scale, setScale] = useState("RX")
  const [timeMinutes, setTimeMinutes] = useState("")
  const [timeSecondsInput, setTimeSecondsInput] = useState("")
  const [totalReps, setTotalReps] = useState("")
  const [roundsCompleted, setRoundsCompleted] = useState("")
  const [loadKg, setLoadKg] = useState("")
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)

  const fetchWods = useCallback(async () => {
    try {
      const res = await api.get("/api/wods")
      setWods(res.data)
    } catch {
      Alert.alert("Error", "No se pudieron cargar los WODs")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchWods() }, [fetchWods])

  function resetForm() {
    setName(""); setWodType("FOR_TIME"); setDescription("")
    setScale("RX"); setTimeMinutes(""); setTimeSecondsInput("")
    setTotalReps(""); setRoundsCompleted(""); setLoadKg(""); setNotes("")
  }

  async function handleSave() {
    if (!name) { Alert.alert("Error", "Ingresa el nombre del WOD"); return }

    let timeSeconds: number | undefined
    if (wodType === "FOR_TIME" || wodType === "CHIPPER") {
      const m = parseInt(timeMinutes || "0")
      const s = parseInt(timeSecondsInput || "0")
      if (m > 0 || s > 0) timeSeconds = m * 60 + s
    }

    setSaving(true)
    try {
      await api.post("/api/wods", {
        name,
        wodType,
        description: description || undefined,
        scale,
        timeSeconds,
        totalReps: totalReps ? parseInt(totalReps) : undefined,
        roundsCompleted: roundsCompleted ? parseInt(roundsCompleted) : undefined,
        loadKg: loadKg ? parseFloat(loadKg) : undefined,
        notes: notes || undefined,
        performedAt: new Date().toISOString(),
      })

      Alert.alert("✅ Guardado", "WOD registrado correctamente", [
        { text: "OK", onPress: () => { setShowForm(false); resetForm(); fetchWods() } }
      ])
    } catch {
      Alert.alert("Error", "No se pudo guardar el WOD")
    } finally {
      setSaving(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>WODs</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowForm(true)}>
          <Text style={styles.addButtonText}>+ Registrar</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color="#fff" style={{ marginTop: 40 }} />
      ) : wods.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Sin WODs registrados</Text>
          <Text style={styles.emptySubtext}>Toca "+ Registrar" para agregar tu primer WOD</Text>
        </View>
      ) : (
        <FlatList
          data={wods}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.wodCard}>
              <View style={styles.wodHeader}>
                <Text style={styles.wodName}>{item.name}</Text>
                <View style={styles.scaleBadge}>
                  <Text style={styles.scaleBadgeText}>{item.scale}</Text>
                </View>
              </View>
              <View style={styles.wodMeta}>
                <Text style={styles.wodType}>{item.wodType}</Text>
                <Text style={styles.wodResult}>{formatResult(item)}</Text>
              </View>
              {item.description && (
                <Text style={styles.wodDescription} numberOfLines={2}>
                  {item.description}
                </Text>
              )}
              <Text style={styles.wodDate}>{formatDate(item.performedAt)}</Text>
            </View>
          )}
        />
      )}

      <Modal visible={showForm} animationType="slide">
        <ScrollView style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Registrar WOD</Text>

          <Text style={styles.label}>Nombre del WOD</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Fran, Cindy, Thursday WOD"
            placeholderTextColor="#666"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Tipo</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
            {WOD_TYPES.map(t => (
              <TouchableOpacity
                key={t.value}
                style={[styles.typeChip, wodType === t.value && styles.typeChipActive]}
                onPress={() => setWodType(t.value)}
              >
                <Text style={[styles.typeChipText, wodType === t.value && styles.typeChipTextActive]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.label}>Descripción (movimientos)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Ej: 21-15-9 Thrusters 43kg / Pull-ups"
            placeholderTextColor="#666"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />

          {(wodType === "FOR_TIME" || wodType === "CHIPPER") && (
            <>
              <Text style={styles.label}>Tiempo (min : seg)</Text>
              <View style={styles.timeRow}>
                <TextInput
                  style={[styles.input, styles.timeInput]}
                  placeholder="Min"
                  placeholderTextColor="#666"
                  value={timeMinutes}
                  onChangeText={setTimeMinutes}
                  keyboardType="number-pad"
                />
                <Text style={styles.timeSep}>:</Text>
                <TextInput
                  style={[styles.input, styles.timeInput]}
                  placeholder="Seg"
                  placeholderTextColor="#666"
                  value={timeSecondsInput}
                  onChangeText={setTimeSecondsInput}
                  keyboardType="number-pad"
                />
              </View>
            </>
          )}

          {wodType === "AMRAP" && (
            <>
              <Text style={styles.label}>Total repeticiones</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 245"
                placeholderTextColor="#666"
                value={totalReps}
                onChangeText={setTotalReps}
                keyboardType="number-pad"
              />
            </>
          )}

          {wodType === "EMOM" && (
            <>
              <Text style={styles.label}>Rondas completadas</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 20"
                placeholderTextColor="#666"
                value={roundsCompleted}
                onChangeText={setRoundsCompleted}
                keyboardType="number-pad"
              />
            </>
          )}

          {wodType === "LOAD" && (
            <>
              <Text style={styles.label}>Carga máxima (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 100"
                placeholderTextColor="#666"
                value={loadKg}
                onChangeText={setLoadKg}
                keyboardType="decimal-pad"
              />
            </>
          )}

          <Text style={styles.label}>Escala</Text>
          <View style={styles.scaleRow}>
            {SCALE_OPTIONS.map(s => (
              <TouchableOpacity
                key={s.value}
                style={[styles.scaleChip, scale === s.value && styles.scaleChipActive]}
                onPress={() => setScale(s.value)}
              >
                <Text style={[styles.scaleChipText, scale === s.value && styles.scaleChipTextActive]}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Notas (opcional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Cómo te sentiste, modificaciones..."
            placeholderTextColor="#666"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={2}
          />

          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
            {saving
              ? <ActivityIndicator color="#000" />
              : <Text style={styles.saveButtonText}>Guardar WOD</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => { setShowForm(false); resetForm() }}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#000" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  title: { fontSize: 28, fontWeight: "bold", color: "#fff" },
  addButton: { backgroundColor: "#fff", borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  addButtonText: { color: "#000", fontWeight: "bold", fontSize: 13 },
  empty: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { color: "#666", fontSize: 16, marginBottom: 8 },
  emptySubtext: { color: "#444", fontSize: 13, textAlign: "center" },
  wodCard: { backgroundColor: "#111", borderRadius: 12, padding: 16, marginBottom: 10 },
  wodHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  wodName: { color: "#fff", fontSize: 16, fontWeight: "bold", flex: 1 },
  scaleBadge: { backgroundColor: "#222", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  scaleBadgeText: { color: "#888", fontSize: 11, fontWeight: "bold" },
  wodMeta: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  wodType: { color: "#666", fontSize: 13 },
  wodResult: { color: "#FFD700", fontSize: 15, fontWeight: "bold" },
  wodDescription: { color: "#666", fontSize: 12, marginBottom: 6 },
  wodDate: { color: "#444", fontSize: 12 },
  modalContainer: { flex: 1, padding: 24, backgroundColor: "#000" },
  modalTitle: { fontSize: 24, fontWeight: "bold", color: "#fff", marginBottom: 24, marginTop: 16 },
  label: { color: "#888", fontSize: 13, marginBottom: 6, marginTop: 4 },
  input: { backgroundColor: "#111", borderWidth: 1, borderColor: "#333", borderRadius: 10, padding: 14, color: "#fff", fontSize: 16, marginBottom: 12 },
  textArea: { height: 80, textAlignVertical: "top" },
  typeScroll: { marginBottom: 12 },
  typeChip: { borderWidth: 1, borderColor: "#333", borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8, marginRight: 8 },
  typeChipActive: { backgroundColor: "#fff", borderColor: "#fff" },
  typeChipText: { color: "#666", fontWeight: "600" },
  typeChipTextActive: { color: "#000" },
  timeRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  timeInput: { flex: 1 },
  timeSep: { color: "#fff", fontSize: 24, fontWeight: "bold", marginBottom: 12 },
  scaleRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  scaleChip: { flex: 1, borderWidth: 1, borderColor: "#333", borderRadius: 8, padding: 12, alignItems: "center" },
  scaleChipActive: { backgroundColor: "#fff", borderColor: "#fff" },
  scaleChipText: { color: "#666", fontWeight: "600" },
  scaleChipTextActive: { color: "#000" },
  saveButton: { backgroundColor: "#fff", borderRadius: 12, padding: 16, alignItems: "center", marginTop: 8 },
  saveButtonText: { color: "#000", fontSize: 16, fontWeight: "bold" },
  cancelButton: { padding: 16, alignItems: "center" },
  cancelButtonText: { color: "#666", fontSize: 15 },
})
