import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const movements = await prisma.movement.findMany({
    where: {
      OR: [
        { isGlobal: true },
        { createdById: session.user.id },
      ],
    },
    orderBy: [
      { category: "asc" },
      { name: "asc" },
    ],
  })

  return NextResponse.json(movements)
}
