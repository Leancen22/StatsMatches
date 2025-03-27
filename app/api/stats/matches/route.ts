// app/api/stats/matches/route.ts
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Suponiendo que 'result' no está en la DB, podrías construirlo en base al score 
    // o si lo guardas en la tabla Match, lo devuelves directamente
    const matches = await prisma.match.findMany({
      orderBy: { date: 'desc' },
      // Podrías include: { matchPlayers: true }, si necesitas detalles
    })

    // Si 'result' no está en la DB, un ejemplo de "construir" un result:
    // (Esto es opcional, depende de tu lógica real)
    const data = matches.map((m: any) => {
      // Ejemplo: si no tienes 'result' en la BD, pones "???".
      return {
        id: m.id,
        opponent: m.opponent,
        date: m.date,
        location: m.location,
        result: '???',
      }
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error en GET /api/stats/matches:', error)
    return new NextResponse('Error al obtener partidos', { status: 500 })
  }
}
