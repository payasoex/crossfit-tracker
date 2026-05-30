import { useState, useEffect } from "react"
import { api } from "@/lib/api"

export type Movement = {
  id: string
  name: string
  nameEs: string | null
  slug: string
  category: string
  measureType: "WEIGHT" | "REPS"
  isGlobal: boolean
}

export function useMovements() {
  const [movements, setMovements] = useState<Movement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMovements()
  }, [])

  async function fetchMovements() {
    try {
      const res = await api.get("/api/movements")
      setMovements(res.data)
    } catch {
      setError("No se pudieron cargar los movimientos")
    } finally {
      setLoading(false)
    }
  }

  return { movements, loading, error, refetch: fetchMovements }
}
