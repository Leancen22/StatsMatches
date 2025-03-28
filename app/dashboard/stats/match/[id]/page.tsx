"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { BarChart, BarChart2, Eye, LogOut, TrendingUp, Users } from "lucide-react"
import DarkModeToggle from "@/components/DarkModeToggle"

// Estructura del partido
type Match = {
  id: number
  opponent: string
  date: string
  location: string
  // Podrías guardar "result" o un campo "finalizado" aquí
  // y la relación con matchPlayers
}

// Estructura de MatchPlayer con el Player
type MatchPlayer = {
  id: number
  goals: number
  assists: number
  saves: number
  turnovers: number
  playTime: number
  player: {
    id: number
    name: string
    position: string
    number: number
  }
}

export default function MatchDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [match, setMatch] = useState<Match | null>(null)
  const [players, setPlayers] = useState<MatchPlayer[]>([])

  useEffect(() => {
    const fetchMatchDetails = async () => {
      // matchId viene de la URL (p.ej. /dashboard/stats/match/123)
      const matchId = params.id  
      try {
        // Supongamos que tu endpoint es /api/matches/[id]
        const res = await fetch(`/api/matches/${matchId}`)
        if (!res.ok) throw new Error("Error al obtener partido")
        const data = await res.json()

        // data.match es un objeto con:
        // {
        //   id, opponent, date, location, ...
        //   matchPlayers: [
        //     { id, goals, assists, saves, turnovers, playTime, player: {...} },
        //     ...
        //   ]
        // }
        setMatch({
          id: data.match.id,
          opponent: data.match.opponent,
          date: data.match.date,
          location: data.match.location || "",
        })
        setPlayers(data.match.matchPlayers)
      } catch (error) {
        console.error(error)
        // Regresar si no hay datos
        router.push("/dashboard/stats")
      }
    }
    fetchMatchDetails()
  }, [params.id, router])

  const formatTime = (seconds: number) => {
    // Horas = total de segundos / 3600
    const hours = Math.floor(seconds / 3600)
    // Minutos = lo que sobra después de quitar las horas, / 60
    const mins = Math.floor((seconds % 3600) / 60)
    // Segundos = lo que sobra después de quitar minutos
    const secs = seconds % 60
  
    // Retorno en formato “HHh MMm SSs”
    return `${hours}h ${mins}m ${secs}s`
  }

  if (!match) {
    return (
      <div className="p-8">
        <p>Cargando detalles del partido...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* HEADER */}
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          <h1 className="text-lg font-semibold">Handball Stats Tracker</h1>
          <nav className="ml-auto flex gap-4">
            <div className="mt-auto">
                        <DarkModeToggle />
                      </div>
            <Link href="/">
              <Button variant="outline" size="icon">
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Cerrar Sesión</span>
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* MAIN */}
      <div className="flex flex-1">
        {/* Podrías reusar tu Sidebar de stats si gustas */}
        <aside className="w-64 border-r bg-muted/40 hidden lg:block">
          <nav className="flex flex-col gap-2 p-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="w-full justify-start">
                <BarChart2 className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link href="/dashboard/players">
              <Button variant="ghost" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Jugadores
              </Button>
            </Link>
            <Link href="/dashboard/match/setup">
              <Button variant="ghost" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Nuevo Partido
              </Button>
            </Link>
            <Link href="/dashboard/stats">
              <Button variant="ghost" className="w-full justify-start font-bold">
                <BarChart className="mr-2 h-4 w-4" />
                Estadísticas
              </Button>
            </Link>
            <Link href="/dashboard/stats/compare">
              <Button variant="ghost" className="w-full justify-start">
                <TrendingUp className="mr-2 h-4 w-4" />
                Comparar Jugadores
              </Button>
            </Link>
            <Link href="/dashboard/stats/best-team">
              <Button variant="ghost" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Mejor Equipo
              </Button>
            </Link>
            <Link href="/dashboard/field">
              <Button variant="ghost" className="w-full justify-start">
                <Eye className="mr-2 h-4 w-4" />
                Analisis de Campo
              </Button>
            </Link>
          </nav>
        </aside>

        <main className="flex-1 p-4 md:p-6">
          <div className="grid gap-4 md:gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">
                  Detalles del Partido #{match.id}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg mb-2">
                  Oponente: <strong>{match.opponent}</strong>
                </p>
                <p className="text-lg mb-2">
                  Fecha:{" "}
                  <strong>
                    {new Date(match.date).toLocaleDateString()}
                  </strong>
                </p>
                <p className="text-lg">
                  Ubicación: <strong>{match.location}</strong>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Jugadores y Estadísticas</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px] text-lg">Núm.</TableHead>
                      <TableHead className="text-lg">Jugador</TableHead>
                      <TableHead className="text-center text-lg">Posición</TableHead>
                      <TableHead className="text-center text-lg">Goles</TableHead>
                      <TableHead className="text-center text-lg">Asistencias</TableHead>
                      <TableHead className="text-center text-lg">Atajadas</TableHead>
                      <TableHead className="text-center text-lg">Pérdidas</TableHead>
                      <TableHead className="text-center text-lg">Tiempo Jugado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {players.map((mp) => (
                      <TableRow key={mp.id}>
                        <TableCell className="text-lg font-bold">
                          {mp.player.number}
                        </TableCell>
                        <TableCell className="text-lg">
                          {mp.player.name}
                        </TableCell>
                        <TableCell className="text-center text-lg">
                          {mp.player.position}
                        </TableCell>
                        <TableCell className="text-center text-lg font-bold">
                          {mp.goals}
                        </TableCell>
                        <TableCell className="text-center text-lg font-bold">
                          {mp.assists}
                        </TableCell>
                        <TableCell className="text-center text-lg font-bold">
                          {mp.saves}
                        </TableCell>
                        <TableCell className="text-center text-lg font-bold">
                          {mp.turnovers}
                        </TableCell>
                        <TableCell className="text-center text-lg">
                          {formatTime(mp.playTime)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
