// app/api/players/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma' // tu instancia global de PrismaClient

// GET /api/players
export async function GET() {
  try {
    const players = await prisma.player.findMany({
      orderBy: { id: 'asc' }, // opcional, para verlos en orden
    })
    return NextResponse.json(players)
  } catch (error) {
    console.error(error)
    return new NextResponse('Error al obtener jugadores', { status: 500 })
  }
}

// POST /api/players
export async function POST(request: Request) {
  try {
    const { name, position, number, category } = await request.json()

    if (!name || !position || !number || !category) {
      return new NextResponse('Datos incompletos', { status: 400 })
    }

    const created = await prisma.player.create({
      data: {
        name,
        position,
        number: Number(number),
        category
      },
    })
    return NextResponse.json(created)
  } catch (error) {
    console.error(error)
    return new NextResponse('Error al crear jugador', { status: 500 })
  }
}
