import { View, Text, StyleSheet } from "react-native"

export default function RMScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis RMs</Text>
      <Text style={styles.subtitle}>Próximamente</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#000",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#888",
  },
})
