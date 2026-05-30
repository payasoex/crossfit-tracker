import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserIdFromRequest } from "@/lib/auth-mobile"


export async function GET(req: Request) {
  const userId = await getUserIdFromRequest(req)
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
