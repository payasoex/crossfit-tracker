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

  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  const [
    user,
    totalRMs,
    totalWods,
    wodsThisWeek,
    recentPRs,
    recentWods,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, weightUnit: true, createdAt: true },
    }),
    prisma.rMRecord.count({ where: { userId } }),
    prisma.wodLog.count({ where: { userId } }),
    prisma.wodLog.count({
      where: { userId, performedAt: { gte: startOfWeek } },
    }),
    prisma.rMRecord.findMany({
      where: { userId, isPR: true },
      include: { movement: true },
      orderBy: { recordedAt: "desc" },
      take: 3,
    }),
    prisma.wodLog.findMany({
      where: { userId },
      orderBy: { performedAt: "desc" },
      take: 3,
    }),
  ])

  return NextResponse.json({
    user,
    stats: { totalRMs, totalWods, wodsThisWeek },
    recentPRs,
    recentWods,
  })
}
