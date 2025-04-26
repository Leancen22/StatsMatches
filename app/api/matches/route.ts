// app/api/matches/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/matches
// Crea un partido, con sus MatchPlayers en 0
export async function POST(request: Request) {
  try {
    type ReqBody = {
      opponent: string
      date: string // "YYYY-MM-DD"
      location: string
      selectedPlayers: {
        id: number
        starter: boolean
      }[]
    }

    const { opponent, date, location, selectedPlayers } = (await request.json()) as ReqBody

    if (!opponent || !date || !location) {
      return new NextResponse('Datos incompletos', { status: 400 })
    }

    // Creamos el partido
    const match = await prisma.match.create({
      data: {
        opponent,
        date: new Date(date),
        location,
        // Creamos la relación con MatchPlayers para cada jugador seleccionado
        matchPlayers: {
          create: selectedPlayers.map((p: any) => ({
            playerId: p.id, // asumimos que el Player ya existe en DB
            // Estadísticas iniciales en 0
            goals: 0,
            assists: 0,
            saves: 0,
            turnovers: 0,
            playTime: 0,
            starter: p.starter,
            shotsOnGoal:     0,
            shotsOffTarget:  0,
            recoveries:      0,
            foulsCommitted:  0,
            foulsReceived:   0,
            yellowCards:     0,
            redCards:        0,
            // Podríamos guardar también un campo "starter" si quisieras
          })),
        },
        opponentScore: 0, // Inicialmente 0
      },
      include: {
        matchPlayers: true,
      },
    })

    return NextResponse.json({ match })
  } catch (error) {
    console.error(error)
    return new NextResponse('Error al crear partido', { status: 500 })
  }
}
