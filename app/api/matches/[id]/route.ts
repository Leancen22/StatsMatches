// app/api/matches/[id]/route.ts

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/matches/[id]
export async function GET(request: Request, { params }: any) {
  const matchId = parseInt(params.id)
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      matchPlayers: {
        include: { player: true },
      },
    },
  })
  if (!match) {
    return new NextResponse('Partido no encontrado', { status: 404 })
  }
  return NextResponse.json({ match })
}

// PATCH /api/matches/[id]
export async function PATCH(request: Request, { params }: any) {
  const matchId = parseInt(params.id)
  const { updatedStats, opponentScore } = await request.json()

  await Promise.all(
    updatedStats.map((mp: any) =>
      prisma.matchPlayer.update({
        where: { id: mp.matchPlayerId },
        data: {
          goals: mp.goals,
          assists: mp.assists,
          saves: mp.saves,
          turnovers: mp.turnovers,
          shotsOnGoal: mp.shotsOnGoal,
          shotsOffTarget: mp.shotsOffTarget,
          recoveries: mp.recoveries,
          foulsCommitted: mp.foulsCommitted,
          foulsReceived: mp.foulsReceived,
          yellowCards: mp.yellowCards,
          redCards: mp.redCards,
          playTime: mp.playTime,
        },
      })
    )
  )

  await prisma.match.update({
    where: { id: matchId },
    data: { opponentScore },
  })

  return NextResponse.json({ message: 'Partido actualizado correctamente' })
}
