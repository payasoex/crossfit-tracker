import axios from "axios"
import * as SecureStore from "expo-secure-store"

// En desarrollo apunta a tu máquina local
// El emulador Android usa 10.0.2.2 para acceder al localhost del host
const BASE_URL = __DEV__
  ? "http://10.0.2.2:3000"
  : "https://tu-dominio-en-vercel.vercel.app"

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Interceptor para agregar el token en cada request
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("session_token")
  if (token) {
    config.headers.Cookie = `authjs.session-token=${token}`
  }
  return config
})
