import { useState } from "react"
import {
  View, Text, TouchableOpacity,
  StyleSheet, ActivityIndicator, TextInput,
  ScrollView,
} from "react-native"
import { router } from "expo-router"
import { useMovements, Movement } from "@/hooks/useMovements"

const CATEGORY_LABELS: Record<string, string> = {
  OLYMPIC_WEIGHTLIFTING: "Levantamiento Olímpico",
  POWERLIFTING: "Powerlifting",
  GYMNASTICS: "Gimnasia",
  MONOSTRUCTURAL: "Monostructural",
  FUNCTIONAL: "Funcional",
}

export default function RMScreen() {
  const { movements, loading } = useMovements()
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

  function handleMovementPress(movement: Movement) {
    router.push({
      pathname: "/movement/[id]",
      params: {
        id: movement.id,
        name: movement.name,
        nameEs: movement.nameEs || movement.name,
        measureType: movement.measureType,
      },
    })
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
                onPress={() => handleMovementPress(movement)}
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
})
