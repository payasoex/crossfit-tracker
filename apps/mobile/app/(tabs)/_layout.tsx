import { Tabs } from "expo-router"

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      tabBarStyle: { backgroundColor: "#000" },
      tabBarActiveTintColor: "#fff",
      tabBarInactiveTintColor: "#666",
      headerStyle: { backgroundColor: "#000" },
      headerTintColor: "#fff",
    }}>
      <Tabs.Screen name="index" options={{ title: "Dashboard" }} />
      <Tabs.Screen name="rm" options={{ title: "Mis RMs" }} />
      <Tabs.Screen name="wods" options={{ title: "WODs" }} />
    </Tabs>
  )
}
