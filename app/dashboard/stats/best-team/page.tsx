"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, BarChart2, LogOut, Users, TrendingUp, Trophy, Star, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Tipo para la data que retorna el endpoint /api/stats/players
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
    playTime: number
  }
  averageStats: {
    goals: number
    assists: number
    saves: number
    turnovers: number
    playTime: number
  }
  score: number // lo calcularemos en el front
}

export default function BestTeamPage() {
  // Estado para jugadores (vaciamos el array inicial)
  const [players, setPlayers] = useState<PlayerStats[]>([])
  // Estado para el criterio de selección
  const [criteria, setCriteria] = useState("balanced")

  // 1. Al montar, buscamos los jugadores desde la API
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const res = await fetch("/api/stats/players")
        if (!res.ok) {
          throw new Error("Error al obtener jugadores")
        }
        const data = await res.json()

        // data es un array de jugadores con stats y averageStats
        // Les añadimos `score: 0` inicial
        const withScore = data.map((p: PlayerStats) => ({ ...p, score: 0 }))
        setPlayers(withScore)
      } catch (error) {
        console.error(error)
      }
    }
    fetchPlayers()
  }, [])

  // 2. Calcular puntuaciones en base al criterio
  useEffect(() => {
    const updatedPlayers = players.map((player) => {
      let score = 0

      if (criteria === "offensive") {
        // Prioriza goles y asistencias
        score = player.stats.goals * 2 + player.stats.assists * 1.5 - player.stats.turnovers * 0.5
      } else if (criteria === "defensive") {
        // Prioriza atajadas y menos pérdidas
        score = player.stats.saves * 2 - player.stats.turnovers * 2 + player.stats.assists
      } else if (criteria === "efficient") {
        // Prioriza eficiencia (menos pérdidas, más goles por tiempo jugado)
        const timeHours = player.stats.playTime / 3600
        score = ((player.stats.goals + player.stats.assists) / (player.stats.turnovers || 1)) * 10
        score += (player.stats.goals / (timeHours || 1)) * 2
      } else {
        // "balanced": mezcla
        score = player.stats.goals + player.stats.assists + player.stats.saves * 0.5 - player.stats.turnovers
      }

      // Ajustar por posición (Portero con bonus si es 'defensive', penal si no)
      if (player.position === "Portero") {
        score = criteria === "defensive" ? score * 1.5 : score * 0.8
      }

      return {
        ...player,
        score: Math.round(score * 10) / 10,
      }
    })

    setPlayers(updatedPlayers)
  }, [criteria])

  // 3. Función para formatear tiempo
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const hours = Math.floor(mins / 60)
    const remainingMins = mins % 60
    return `${hours}h ${remainingMins}m`
  }

  // 4. Obtener el mejor equipo
  function getBestTeam() : PlayerStats[] {
    // Necesitamos 1 portero, 2 laterales, 1 central y 1 pivote
    const sortedByPosition = {
      Portero: players.filter((p) => p.position === "Portero").sort((a, b) => b.score - a.score),
      Lateral: players.filter((p) => p.position === "Lateral").sort((a, b) => b.score - a.score),
      Central: players.filter((p) => p.position === "Central").sort((a, b) => b.score - a.score),
      Pivote: players.filter((p) => p.position === "Pivote").sort((a, b) => b.score - a.score),
      Extremo: players.filter((p) => p.position === "Extremo").sort((a, b) => b.score - a.score),
    }

    const bestTeam: (PlayerStats | undefined)[] = [
      sortedByPosition.Portero[0],
      sortedByPosition.Lateral[0],
      sortedByPosition.Lateral[1],
      sortedByPosition.Central[0],
      sortedByPosition.Pivote[0],
    ]

    // Si no hay suficientes jugadores en alguna posición, completamos con los mejores globales
    for (let i = 0; i < bestTeam.length; i++) {
      if (!bestTeam[i]) {
        const allSorted = [...players].sort((a, b) => b.score - a.score)
        // find(...) puede retornar undefined también
        const candidate = allSorted.find((p) => !bestTeam.includes(p))
        // Asignamos solo si candidate existe
        if (candidate) {
          bestTeam[i] = candidate
        }
      }
    }

    // Filtramos nulos por si alguna posición ni con backup
    return bestTeam.filter(Boolean) as PlayerStats[];
  }

  const bestTeam = getBestTeam()

  return (
    <div className="flex min-h-screen flex-col">
      {/* HEADER */}
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

      {/* MAIN */}
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
              <Button variant="ghost" className="w-full justify-start">
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
              <Button variant="ghost" className="w-full justify-start font-bold">
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
            {/* Título y acciones */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight">Mejor Equipo</h2>
              <div className="flex gap-2">
                <Link href="/dashboard/stats">
                  <Button variant="outline">
                    <BarChart className="mr-2 h-4 w-4" />
                    Ver Estadísticas
                  </Button>
                </Link>
                <Link href="/dashboard/stats/compare">
                  <Button variant="outline">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Comparar Jugadores
                  </Button>
                </Link>
              </div>
            </div>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl">Criterio de Selección</CardTitle>
                  <Select defaultValue="balanced" onValueChange={setCriteria}>
                    <SelectTrigger className="w-[200px] h-10 text-lg">
                      <SelectValue placeholder="Seleccionar criterio" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="balanced" className="text-lg">
                        Equilibrado
                      </SelectItem>
                      <SelectItem value="offensive" className="text-lg">
                        Ofensivo
                      </SelectItem>
                      <SelectItem value="defensive" className="text-lg">
                        Defensivo
                      </SelectItem>
                      <SelectItem value="efficient" className="text-lg">
                        Eficiencia
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <CardDescription className="text-lg">
                  {criteria === "balanced" && "Selección equilibrada basada en todas las estadísticas"}
                  {criteria === "offensive" && "Prioriza jugadores con más goles y asistencias"}
                  {criteria === "defensive" && "Prioriza jugadores con más atajadas y menos pérdidas"}
                  {criteria === "efficient" && "Prioriza jugadores con mejor relación entre goles y tiempo jugado"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* 1) Cartas del mejor equipo */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                  {bestTeam.map((player) => (
                    <Card key={player.id} className="overflow-hidden">
                      <div className="bg-primary h-2"></div>
                      <CardHeader className="p-4">
                        <div className="flex justify-between items-start">
                          <Badge variant="outline" className="mb-2">
                            {player.position}
                          </Badge>
                          <div className="flex items-center">
                            <Trophy className="h-5 w-5 text-yellow-500 mr-1" />
                            <span className="font-bold">{player.score}</span>
                          </div>
                        </div>
                        <CardTitle className="text-lg">{player.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="text-3xl font-bold text-center mb-2">#{player.number}</div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex flex-col items-center">
                            <span className="text-muted-foreground">Goles</span>
                            <span className="font-bold text-lg">{player.stats.goals}</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-muted-foreground">Asist.</span>
                            <span className="font-bold text-lg">{player.stats.assists}</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-muted-foreground">Ataj.</span>
                            <span className="font-bold text-lg">{player.stats.saves}</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-muted-foreground">Pérd.</span>
                            <span className="font-bold text-lg">{player.stats.turnovers}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* 2) Tabla de todos los jugadores, ordenados por puntuación */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Todos los Jugadores por Puntuación</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[80px] text-lg">Núm.</TableHead>
                          <TableHead className="text-lg">Jugador</TableHead>
                          <TableHead className="text-lg">Posición</TableHead>
                          <TableHead className="text-center text-lg">Goles</TableHead>
                          <TableHead className="text-center text-lg">Asist.</TableHead>
                          <TableHead className="text-center text-lg">Ataj.</TableHead>
                          <TableHead className="text-center text-lg">Pérd.</TableHead>
                          <TableHead className="text-center text-lg">Puntuación</TableHead>
                          <TableHead className="text-center text-lg">Titular</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[...players]
                          .sort((a, b) => b.score - a.score)
                          .map((player) => {
                            // Ver si forma parte del bestTeam
                            const isInBestTeam = bestTeam.some((p) => p.id === player.id)
                            return (
                              <TableRow key={player.id} className={isInBestTeam ? "bg-primary/10" : ""}>
                                <TableCell className="text-lg font-bold">{player.number}</TableCell>
                                <TableCell className="text-lg font-medium">{player.name}</TableCell>
                                <TableCell className="text-lg">{player.position}</TableCell>
                                <TableCell className="text-center text-lg">{player.stats.goals}</TableCell>
                                <TableCell className="text-center text-lg">{player.stats.assists}</TableCell>
                                <TableCell className="text-center text-lg">{player.stats.saves}</TableCell>
                                <TableCell className="text-center text-lg">{player.stats.turnovers}</TableCell>
                                <TableCell className="text-center text-lg font-bold">{player.score}</TableCell>
                                <TableCell className="text-center">
                                  {isInBestTeam && <Star className="h-5 w-5 text-yellow-500 mx-auto" />}
                                </TableCell>
                              </TableRow>
                            )
                          })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
