"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { BarChart, BarChart2, Eye, LogOut, MailIcon, TrendingUp, Users } from "lucide-react"
import DarkModeToggle from "@/components/DarkModeToggle"

// Estructura del partido
type Match = {
  id: number
  opponent: string
  date: string
  location: string
  opponentScore: number
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
  shotsOnGoal: number
  shotsOffTarget: number
  recoveries: number
  foulsCommitted: number
  foulsReceived: number
  yellowCards: number
  redCards: number  
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

  const teamScore = useMemo(() => {
    return players.reduce((sum, mp) => sum + mp.goals, 0);
  }, [players]);

  const resultText = useMemo(() => {
    if (!match) return "";
    if (teamScore > match.opponentScore) return "Victoria 🎉";
    if (teamScore < match.opponentScore) return "Derrota 😞";
    return "Empate 🤝";
  }, [match, teamScore]);

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
          opponentScore: data.match.opponentScore ?? 0,
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

            <Link href="/dashboard/mass-email">
              <Button variant="ghost" className="w-full justify-start">
                <MailIcon className="mr-2 h-4 w-4" />
                Convocatoria
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
                <hr />
              <div className="flex items-center space-x-4">
                <span className="text-2xl font-bold">{teamScore}</span>
                <span className="text-2xl">–</span>
                <span className="text-2xl font-bold">{match.opponentScore}</span>
                <span className="ml-4 text-lg">{resultText}</span>
              </div>
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
                      <TableHead className="w-[60px] text-lg">Núm.</TableHead>
                      <TableHead className="w-[100px] text-lg">Jugador</TableHead>
                      <TableHead className="text-center">Goles</TableHead>
                      <TableHead className="text-center">Asist.</TableHead>
                      <TableHead className="text-center">SA</TableHead>
                      <TableHead className="text-center">SF</TableHead>
                      <TableHead className="text-center">Perd.</TableHead>
                      <TableHead className="text-center">Recup.</TableHead>
                      <TableHead className="text-center">F.C.</TableHead>
                      <TableHead className="text-center">F.R.</TableHead>
                      <TableHead className="text-center">Amar.</TableHead>
                      <TableHead className="text-center">Roja</TableHead>
                      <TableHead className="w-[80px] text-center text-lg">Tiempo</TableHead>

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
                        <TableCell className="text-center">{mp.goals}</TableCell>
                        <TableCell className="text-center">{mp.assists}</TableCell>
                        <TableCell className="text-center">
                          {mp.shotsOnGoal}
                        </TableCell>
                        <TableCell className="text-center">
                          {mp.shotsOffTarget}
                        </TableCell>
                        <TableCell className="text-center">
                          {mp.turnovers}
                        </TableCell>
                        <TableCell className="text-center">
                          {mp.recoveries}
                        </TableCell>
                        <TableCell className="text-center">
                          {mp.foulsCommitted}
                        </TableCell>
                        <TableCell className="text-center">
                          {mp.foulsReceived}
                        </TableCell>
                        <TableCell className="text-center">
                          {mp.yellowCards}
                        </TableCell>
                        <TableCell className="text-center">
                          {mp.redCards}
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
