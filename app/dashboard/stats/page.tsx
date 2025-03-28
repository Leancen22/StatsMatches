"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, BarChart2, LogOut, Users, TrendingUp, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Tipos
type PlayerStats = {
  id: number
  name: string
  position: string
  number: number
  matches: number
  stats: {
    goals: number
    assists: number
    saves: number
    turnovers: number
    playTime: number // en segundos
  }
  averageStats: {
    goals: number
    assists: number
    saves: number
    turnovers: number
    playTime: number // en segundos
  }
}

type Match = {
  id: number
  opponent: string
  date: string
  location: string
  result: string
}

export default function StatsPage() {
  // Estado para jugadores y partidos
  const [players, setPlayers] = useState<PlayerStats[]>([])
  const [matches, setMatches] = useState<Match[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1) Cargar jugadores
        const resPlayers = await fetch("/api/stats/players")
        if (!resPlayers.ok) throw new Error("Error al obtener jugadores")
        const playersData = await resPlayers.json()

        console.log("playersData", playersData)
  
        // 2) Cargar partidos
        const resMatches = await fetch("/api/stats/matches")
        if (!resMatches.ok) throw new Error("Error al obtener partidos")
        const matchesData = await resMatches.json()
  
        setPlayers(playersData)
        setMatches(matchesData)
      } catch (err) {
        console.error(err)
      }
    }
    fetchData()
  }, [])
  

  // Estado para filtros
  const [selectedMatch, setSelectedMatch] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("goals")

  // Función para formatear el tiempo (segundos a HH:MM)
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

  // Función para ordenar jugadores según la estadística seleccionada
  const sortedPlayers = [...players].sort((a, b) => {
    if (sortBy === "goals") return b.stats.goals - a.stats.goals
    if (sortBy === "assists") return b.stats.assists - a.stats.assists
    if (sortBy === "saves") return b.stats.saves - a.stats.saves
    if (sortBy === "efficiency")
      return b.stats.goals + b.stats.assists - b.stats.turnovers - (a.stats.goals + a.stats.assists - a.stats.turnovers)
    if (sortBy === "playTime") return b.stats.playTime - a.stats.playTime
    return 0
  })

  // Función para calcular la eficiencia
  const calculateEfficiency = (player: PlayerStats) => {
    return player.stats.goals + player.stats.assists - player.stats.turnovers
  }

  // Función para determinar el color de la eficiencia
  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency > 30) return "text-green-500"
    if (efficiency > 15) return "text-emerald-500"
    if (efficiency > 0) return "text-amber-500"
    return "text-red-500"
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-lg font-semibold">Handball Stats Tracker</h1>
          <nav className="ml-auto flex gap-4">
            <Link href="/">
              <Button variant="outline" size="icon">
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Cerrar Sesión</span>
              </Button>
            </Link>
          </nav>
        </div>
      </header>
      <div className="flex flex-1">
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
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight">Estadísticas de Jugadores</h2>
              <div className="flex gap-2">
                <Link href="/dashboard/stats/compare">
                  <Button>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Comparar Jugadores
                  </Button>
                </Link>
                <Link href="/dashboard/stats/best-team">
                  <Button>
                    <Users className="mr-2 h-4 w-4" />
                    Mejor Equipo
                  </Button>
                </Link>
              </div>
            </div>

            <Tabs defaultValue="general" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="general" className="text-lg">
                  Estadísticas Generales
                </TabsTrigger>
                <TabsTrigger value="matches" className="text-lg">
                  Partidos
                </TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-xl">Rendimiento de Jugadores</CardTitle>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">Ordenar por:</span>
                        <Select defaultValue="goals" onValueChange={setSortBy}>
                          <SelectTrigger className="w-[180px] h-10 text-lg">
                            <SelectValue placeholder="Ordenar por" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="goals" className="text-lg">
                              Goles
                            </SelectItem>
                            <SelectItem value="assists" className="text-lg">
                              Asistencias
                            </SelectItem>
                            <SelectItem value="saves" className="text-lg">
                              Atajadas
                            </SelectItem>
                            <SelectItem value="efficiency" className="text-lg">
                              Eficiencia
                            </SelectItem>
                            <SelectItem value="playTime" className="text-lg">
                              Tiempo de Juego
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[80px] text-lg">Núm.</TableHead>
                          <TableHead className="text-lg">Jugador</TableHead>
                          <TableHead className="text-center text-lg">Partidos</TableHead>
                          <TableHead className="text-center text-lg">Goles</TableHead>
                          <TableHead className="text-center text-lg">Asistencias</TableHead>
                          <TableHead className="text-center text-lg">Atajadas</TableHead>
                          <TableHead className="text-center text-lg">Pérdidas</TableHead>
                          <TableHead className="text-center text-lg">Tiempo</TableHead>
                          <TableHead className="text-center text-lg">Eficiencia</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedPlayers.map((player) => (
                          <TableRow key={player.id}>
                            <TableCell className="text-lg font-bold">{player.number}</TableCell>
                            <TableCell>
                              <div className="text-lg font-medium">{player.name}</div>
                              <div className="text-sm text-muted-foreground">{player.position}</div>
                            </TableCell>
                            <TableCell className="text-center text-lg">{player.matches}</TableCell>
                            <TableCell className="text-center text-lg font-bold">{player.stats.goals}</TableCell>
                            <TableCell className="text-center text-lg font-bold">{player.stats.assists}</TableCell>
                            <TableCell className="text-center text-lg font-bold">{player.stats.saves}</TableCell>
                            <TableCell className="text-center text-lg font-bold">{player.stats.turnovers}</TableCell>
                            <TableCell className="text-center text-lg">{formatTime(player.stats.playTime)}</TableCell>
                            <TableCell className="text-center text-lg">
                              <span className={`font-bold ${getEfficiencyColor(calculateEfficiency(player))}`}>
                                {calculateEfficiency(player)}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Promedios por Partido</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[80px] text-lg">Núm.</TableHead>
                          <TableHead className="text-lg">Jugador</TableHead>
                          <TableHead className="text-center text-lg">Goles</TableHead>
                          <TableHead className="text-center text-lg">Asistencias</TableHead>
                          <TableHead className="text-center text-lg">Atajadas</TableHead>
                          <TableHead className="text-center text-lg">Pérdidas</TableHead>
                          <TableHead className="text-center text-lg">Tiempo</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedPlayers.map((player) => (
                          <TableRow key={player.id}>
                            <TableCell className="text-lg font-bold">{player.number}</TableCell>
                            <TableCell>
                              <div className="text-lg font-medium">{player.name}</div>
                              <div className="text-sm text-muted-foreground">{player.position}</div>
                            </TableCell>
                            <TableCell className="text-center text-lg font-bold">
                              {player.averageStats.goals.toFixed(1)}
                            </TableCell>
                            <TableCell className="text-center text-lg font-bold">
                              {player.averageStats.assists.toFixed(1)}
                            </TableCell>
                            <TableCell className="text-center text-lg font-bold">
                              {player.averageStats.saves.toFixed(1)}
                            </TableCell>
                            <TableCell className="text-center text-lg font-bold">
                              {player.averageStats.turnovers.toFixed(1)}
                            </TableCell>
                            <TableCell className="text-center text-lg">
                              {formatTime(player.averageStats.playTime)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="matches" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Historial de Partidos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-lg">Fecha</TableHead>
                          <TableHead className="text-lg">Oponente</TableHead>
                          <TableHead className="text-lg">Ubicación</TableHead>
                          <TableHead className="text-lg">Resultado</TableHead>
                          <TableHead className="text-right text-lg">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {matches.map((match) => (
                          <TableRow key={match.id}>
                            <TableCell className="text-lg">{new Date(match.date).toLocaleDateString()}</TableCell>
                            <TableCell className="text-lg font-medium">{match.opponent}</TableCell>
                            <TableCell className="text-lg">{match.location}</TableCell>
                            <TableCell className="text-lg">
                              <Badge
                                variant={
                                  match.result.includes("G")
                                    ? "default"
                                    : match.result.includes("P")
                                      ? "destructive"
                                      : "outline"
                                }
                              >
                                {match.result}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                            <Link href={`/dashboard/stats/match/${match.id}`}>
                            <Button variant="outline" size="sm">
          Ver Detalles
        </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}

