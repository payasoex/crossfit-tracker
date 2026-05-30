import axios from "axios"
import * as SecureStore from "expo-secure-store"

const BASE_URL = __DEV__
  ? "http://10.0.2.2:3000"
  : "https://tu-dominio.vercel.app"

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
})

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("session_token")
  console.log("Token exists:", !!token)
  console.log("Request URL:", config.url)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
    console.log("Authorization header set")
  }
  return config
})
