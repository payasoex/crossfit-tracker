import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserIdFromRequest } from "@/lib/auth-mobile"
import { z } from "zod"


const CreateWodSchema = z.object({
  name: z.string().min(1),
  wodType: z.enum(["FOR_TIME", "AMRAP", "EMOM", "LOAD", "CHIPPER", "CUSTOM"]),
  description: z.string().optional(),
  timeCap: z.number().int().positive().optional(),
  rounds: z.number().int().positive().optional(),
  timeSeconds: z.number().int().positive().optional(),
  totalReps: z.number().int().positive().optional(),
  roundsCompleted: z.number().int().positive().optional(),
  loadKg: z.number().positive().optional(),
  scale: z.enum(["RX", "SCALED", "RX_PLUS"]).default("RX"),
  notes: z.string().optional(),
  performedAt: z.coerce.date(),
})

export async function GET(req: Request) {
  const userId = await getUserIdFromRequest(req)
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const wods = await prisma.wodLog.findMany({
    where: { userId },
    orderBy: { performedAt: "desc" },
  })

  return NextResponse.json(wods)
}

export async function POST(req: Request) {
  const userId = await getUserIdFromRequest(req)
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = CreateWodSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const wod = await prisma.wodLog.create({
    data: { userId, ...parsed.data },
  })

  return NextResponse.json(wod, { status: 201 })
}
