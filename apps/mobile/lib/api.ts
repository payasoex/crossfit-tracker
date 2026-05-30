import axios from "axios"
import * as SecureStore from "expo-secure-store"

const BASE_URL = __DEV__
  ? "http://10.0.2.2:3000"
  : "https://crossfit-tracker-tau.vercel.app"

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
})

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("session_token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
