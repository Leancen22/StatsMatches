// app/api/matches/[id]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface Context {
  params: { id: string }
}

// GET /api/matches/[id]
export async function GET(request: Request, { params }: Context) {
  try {
    const matchId = Number(params.id)
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        matchPlayers: {
          include: {
            player: true, // para obtener name, position, number, etc.
          },
        },
      },
    })
    if (!match) {
      return new NextResponse('Partido no encontrado', { status: 404 })
    }
    return NextResponse.json({ match })
  } catch (error) {
    console.error(error)
    return new NextResponse('Error al obtener partido', { status: 500 })
  }
}

// PATCH /api/matches/[id]
export async function PATCH(request: Request, { params }: Context) {
  try {
    const matchId = Number(params.id)
    const { updatedStats } = await request.json()
    // updatedStats es un array de objetos con { matchPlayerId, goals, assists, saves, turnovers, playTime }

    // Actualizamos cada matchPlayer
    const promises = updatedStats.map((mp: any) =>
      prisma.matchPlayer.update({
        where: { id: mp.matchPlayerId },
        data: {
          goals: mp.goals,
          assists: mp.assists,
          saves: mp.saves,
          turnovers: mp.turnovers,
          playTime: mp.playTime,
        },
      })
    )
    await Promise.all(promises)

    // (Opcional) Podríamos marcar un campo "finalizado = true" en la tabla Match
    // await prisma.match.update({ where: { id: matchId }, data: { ... } })

    return NextResponse.json({ message: 'Partido actualizado correctamente' })
  } catch (error) {
    console.error(error)
    return new NextResponse('Error al actualizar partido', { status: 500 })
  }
}
