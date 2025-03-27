// app/api/stats/players/route.ts
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET /api/stats/players
export async function GET() {
  try {
    // Tomamos todos los jugadores y su relación con MatchPlayer
    const players = await prisma.player.findMany({
      include: {
        matches: true, // "matches" es la relación con MatchPlayer[]
      },
    })

    // Transformamos
    const data = players.map((p: any) => {
      const totalMatches = p.matches.length
      let totalGoals = 0
      let totalAssists = 0
      let totalSaves = 0
      let totalTurnovers = 0
      let totalPlayTime = 0

      p.matches.forEach((mp: any) => {
        totalGoals += mp.goals
        totalAssists += mp.assists
        totalSaves += mp.saves
        totalTurnovers += mp.turnovers
        totalPlayTime += mp.playTime
        console.log(
          `stats-players: PlayerId=${p.id}, MatchPlayerId=${mp.id}, playTime=${mp.playTime}`
        )
      })

      // Promedios (evitar /0)
      const avgGoals = totalMatches ? totalGoals / totalMatches : 0
      const avgAssists = totalMatches ? totalAssists / totalMatches : 0
      const avgSaves = totalMatches ? totalSaves / totalMatches : 0
      const avgTurnovers = totalMatches ? totalTurnovers / totalMatches : 0
      const avgPlayTime = totalMatches ? totalPlayTime / totalMatches : 0

      return {
        id: p.id,
        name: p.name,
        position: p.position,
        number: p.number,
        matches: totalMatches, // número de partidos jugados
        stats: {
          goals: totalGoals,
          assists: totalAssists,
          saves: totalSaves,
          turnovers: totalTurnovers,
          playTime: totalPlayTime,
        },
        averageStats: {
          goals: avgGoals,
          assists: avgAssists,
          saves: avgSaves,
          turnovers: avgTurnovers,
          playTime: avgPlayTime,
        },
      }
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error en GET /api/stats/players:', error)
    return new NextResponse('Error al obtener jugadores', { status: 500 })
  }
}
