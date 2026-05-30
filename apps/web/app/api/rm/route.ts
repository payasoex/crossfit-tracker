import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const CreateRMSchema = z.object({
  movementId: z.string(),
  value: z.number().positive(),
  reps: z.number().int().positive().optional(),
  notes: z.string().optional(),
  recordedAt: z.coerce.date(),
})

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const movementId = searchParams.get("movementId")

  const records = await prisma.rMRecord.findMany({
    where: {
      userId: session.user.id,
      ...(movementId ? { movementId } : {}),
    },
    include: { movement: true },
    orderBy: { recordedAt: "desc" },
  })

  return NextResponse.json(records)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
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

  // Verificar si es PR comparando contra el historial
  const currentPR = await prisma.rMRecord.findFirst({
    where: {
      userId: session.user.id,
      movementId,
      isPR: true,
    },
    orderBy: { value: "desc" },
  })

  const isPR = !currentPR || value > currentPR.value

  // Si es PR, desmarcar el anterior
  if (isPR && currentPR) {
    await prisma.rMRecord.update({
      where: { id: currentPR.id },
      data: { isPR: false },
    })
  }

  const record = await prisma.rMRecord.create({
    data: {
      userId: session.user.id,
      movementId,
      value,
      reps,
      notes,
      recordedAt,
      isPR,
    },
    include: { movement: true },
  })

  return NextResponse.json(record, { status: 201 })
}
