"use client"

import { useActionState } from "react"
import { loginAction } from "@/lib/actions/auth"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, {})
  const searchParams = useSearchParams()
  const registered = searchParams.get("registered")

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Bienvenido</h1>
        <p className="text-gray-500 text-sm mb-6">Ingresa a tu cuenta</p>

        {registered && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
            Cuenta creada exitosamente. Inicia sesión.
          </div>
        )}

        {state.error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {state.error}
          </div>
        )}

        <form action={action} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              name="password"
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-black text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {pending ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="text-black font-medium hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  )
}
