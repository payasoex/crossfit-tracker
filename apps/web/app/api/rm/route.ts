import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserIdFromRequest } from "@/lib/auth-mobile"
import { z } from "zod"


const CreateRMSchema = z.object({
  movementId: z.string(),
  value: z.number().positive(),
  reps: z.number().int().positive().optional(),
  notes: z.string().optional(),
  recordedAt: z.coerce.date(),
})

export async function GET(req: Request) {
  const userId = await getUserIdFromRequest(req)
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const movementId = searchParams.get("movementId")

  const records = await prisma.rMRecord.findMany({
    where: {
      userId,
      ...(movementId ? { movementId } : {}),
    },
    include: { movement: true },
    orderBy: { recordedAt: "desc" },
  })

  return NextResponse.json(records)
}

export async function POST(req: Request) {
  const userId = await getUserIdFromRequest(req)
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = CreateRMSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { movementId, value, reps, notes, recordedAt } = parsed.data

  const currentPR = await prisma.rMRecord.findFirst({
    where: { userId, movementId, isPR: true },
    orderBy: { value: "desc" },
  })

  const isPR = !currentPR || value > currentPR.value

  if (isPR && currentPR) {
    await prisma.rMRecord.update({
      where: { id: currentPR.id },
      data: { isPR: false },
    })
  }

  const record = await prisma.rMRecord.create({
    data: { userId, movementId, value, reps, notes, recordedAt, isPR },
    include: { movement: true },
  })

  return NextResponse.json(record, { status: 201 })
}
