import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { decode } from "next-auth/jwt"

async function getUserId(req: Request): Promise<string | null> {
  const authHeader = req.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) return null

  const token = authHeader.slice(7)
  try {
    const decoded = await decode({
      token,
      secret: new TextEncoder().encode(process.env.AUTH_SECRET!),
      salt: "",
    })
    return decoded?.id as string ?? null
  } catch {
    return null
  }
}

export async function GET(req: Request) {
  const userId = await getUserId(req)
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const movements = await prisma.movement.findMany({
    where: {
      OR: [
        { isGlobal: true },
        { createdById: userId },
      ],
    },
    orderBy: [
      { category: "asc" },
      { name: "asc" },
    ],
  })

  return NextResponse.json(movements)
}
