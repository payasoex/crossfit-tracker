import { useState } from "react"
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, TextInput,
  Alert, Modal, ScrollView,
} from "react-native"
import { useMovements, Movement } from "@/hooks/useMovements"
import { api } from "@/lib/api"

const CATEGORY_LABELS: Record<string, string> = {
  OLYMPIC_WEIGHTLIFTING: "Levantamiento Olímpico",
  POWERLIFTING: "Powerlifting",
  GYMNASTICS: "Gimnasia",
  MONOSTRUCTURAL: "Monostructural",
  FUNCTIONAL: "Funcional",
}

export default function RMScreen() {
  const { movements, loading } = useMovements()
  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [value, setValue] = useState("")
  const [reps, setReps] = useState("1")
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")

  const filtered = movements.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    (m.nameEs?.toLowerCase().includes(search.toLowerCase()))
  )

  const grouped = filtered.reduce((acc, m) => {
    if (!acc[m.category]) acc[m.category] = []
    acc[m.category].push(m)
    return acc
  }, {} as Record<string, Movement[]>)

  async function handleSaveRM() {
    if (!selectedMovement || !value) {
      Alert.alert("Error", "Ingresa el valor del RM")
      return
    }

    setSaving(true)
    try {
      const res = await api.post("/api/rm", {
        movementId: selectedMovement.id,
        value: parseFloat(value),
        reps: selectedMovement.measureType === "WEIGHT" ? parseInt(reps) : undefined,
        recordedAt: new Date().toISOString(),
      })

      const isPR = res.data.isPR
      Alert.alert(
        isPR ? "🎉 ¡Nuevo PR!" : "✅ Registrado",
        isPR
          ? `Nuevo récord en ${selectedMovement.nameEs || selectedMovement.name}: ${value}${selectedMovement.measureType === "WEIGHT" ? " kg" : " reps"}`
          : `RM registrado correctamente`,
        [{ text: "OK", onPress: () => { setShowForm(false); setValue(""); setReps("1") } }]
      )
    } catch {
      Alert.alert("Error", "No se pudo guardar el RM")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#fff" size="large" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis RMs</Text>

      <TextInput
        style={styles.search}
        placeholder="Buscar movimiento..."
        placeholderTextColor="#666"
        value={search}
        onChangeText={setSearch}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {Object.entries(grouped).map(([category, items]) => (
          <View key={category}>
            <Text style={styles.categoryLabel}>
              {CATEGORY_LABELS[category] || category}
            </Text>
            {items.map(movement => (
              <TouchableOpacity
                key={movement.id}
                style={styles.movementRow}
                onPress={() => { setSelectedMovement(movement); setShowForm(true) }}
              >
                <View>
                  <Text style={styles.movementName}>
                    {movement.nameEs || movement.name}
                  </Text>
                  <Text style={styles.movementSub}>{movement.name}</Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {movement.measureType === "WEIGHT" ? "kg" : "reps"}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>

      <Modal visible={showForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {selectedMovement?.nameEs || selectedMovement?.name}
            </Text>

            {selectedMovement?.measureType === "WEIGHT" ? (
              <>
                <Text style={styles.label}>Peso (kg)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: 100"
                  placeholderTextColor="#666"
                  value={value}
                  onChangeText={setValue}
                  keyboardType="decimal-pad"
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
                />
              </>
            )}

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveRM}
              disabled={saving}
            >
              {saving
                ? <ActivityIndicator color="#000" />
                : <Text style={styles.saveButtonText}>Guardar RM</Text>
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
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#000" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" },
  title: { fontSize: 28, fontWeight: "bold", color: "#fff", marginBottom: 16 },
  search: { backgroundColor: "#111", borderWidth: 1, borderColor: "#333", borderRadius: 10, padding: 12, color: "#fff", marginBottom: 16 },
  categoryLabel: { fontSize: 12, fontWeight: "bold", color: "#666", textTransform: "uppercase", letterSpacing: 1, marginTop: 16, marginBottom: 8 },
  movementRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#111", borderRadius: 10, padding: 14, marginBottom: 6 },
  movementName: { color: "#fff", fontSize: 15, fontWeight: "600" },
  movementSub: { color: "#666", fontSize: 12, marginTop: 2 },
  badge: { backgroundColor: "#222", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { color: "#888", fontSize: 12 },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.7)" },
  modalContent: { backgroundColor: "#111", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#fff", marginBottom: 20 },
  label: { color: "#888", fontSize: 13, marginBottom: 6 },
  input: { backgroundColor: "#222", borderWidth: 1, borderColor: "#333", borderRadius: 10, padding: 14, color: "#fff", fontSize: 16, marginBottom: 14 },
  saveButton: { backgroundColor: "#fff", borderRadius: 12, padding: 16, alignItems: "center", marginTop: 4 },
  saveButtonText: { color: "#000", fontSize: 16, fontWeight: "bold" },
  cancelButton: { padding: 16, alignItems: "center", marginTop: 4 },
  cancelButtonText: { color: "#666", fontSize: 15 },
})
