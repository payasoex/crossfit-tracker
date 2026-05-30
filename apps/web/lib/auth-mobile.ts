import { decode } from "next-auth/jwt"

export async function getUserIdFromRequest(req: Request): Promise<string | null> {
  const authHeader = req.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) return null
  const token = authHeader.slice(7)
  try {
    const decoded = await decode({
      token,
      secret: process.env.AUTH_SECRET!,
      salt: "",
    })
    return decoded?.id as string ?? null
  } catch {
    return null
  }
}
