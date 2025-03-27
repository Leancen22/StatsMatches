"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, BarChart2, LogOut, Users, TrendingUp, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react"
import { Progress } from "@/components/ui/progress"

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

export default function ComparePlayersPage() {
  // Datos de jugadores (normalmente vendrían de una API o base de datos)
  const [allPlayers, setAllPlayers] = useState<PlayerStats[]>([])

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const res = await fetch("/api/stats/players")
        if (!res.ok) throw new Error("Error al obtener jugadores")
        const data = await res.json()
        setAllPlayers(data)
      } catch (err) {
        console.error(err)
      }
    }
    fetchPlayers()
  }, [])

  // Estado para los jugadores seleccionados
  const [player1Id, setPlayer1Id] = useState<number | null>(null)
  const [player2Id, setPlayer2Id] = useState<number | null>(null)

  // Obtener los jugadores seleccionados
  const player1 = allPlayers.find((p) => p.id === player1Id) || null
  const player2 = allPlayers.find((p) => p.id === player2Id) || null

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

  // Función para calcular la eficiencia
  const calculateEfficiency = (player: PlayerStats) => {
    return player.stats.goals + player.stats.assists - player.stats.turnovers
  }

  // Función para calcular el porcentaje de comparación
  const calculatePercentage = (value1: number, value2: number) => {
    if (value1 === 0 && value2 === 0) return 50
    if (value2 === 0) return 100
    return Math.round((value1 / (value1 + value2)) * 100)
  }

  // Función para determinar el ícono de comparación
  const getComparisonIcon = (value1: number, value2: number, isNegativeBetter = false) => {
    if (value1 === value2) return <Minus className="h-5 w-5 text-gray-500" />

    if (!isNegativeBetter) {
      return value1 > value2 ? (
        <ArrowUpRight className="h-5 w-5 text-green-500" />
      ) : (
        <ArrowDownRight className="h-5 w-5 text-red-500" />
      )
    } else {
      return value1 < value2 ? (
        <ArrowUpRight className="h-5 w-5 text-green-500" />
      ) : (
        <ArrowDownRight className="h-5 w-5 text-red-500" />
      )
    }
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
              <Button variant="ghost" className="w-full justify-start">
                <BarChart className="mr-2 h-4 w-4" />
                Estadísticas
              </Button>
            </Link>
            <Link href="/dashboard/stats/compare">
              <Button variant="ghost" className="w-full justify-start font-bold">
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
          </nav>
        </aside>
        <main className="flex-1 p-4 md:p-6">
          <div className="grid gap-4 md:gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight">Comparar Jugadores</h2>
              <div className="flex gap-2">
                <Link href="/dashboard/stats">
                  <Button variant="outline">
                    <BarChart className="mr-2 h-4 w-4" />
                    Ver Estadísticas
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

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Seleccionar Jugadores para Comparar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-lg font-medium">Jugador 1</label>
                    <Select onValueChange={(value) => setPlayer1Id(Number(value))}>
                      <SelectTrigger className="h-12 text-lg">
                        <SelectValue placeholder="Selecciona un jugador" />
                      </SelectTrigger>
                      <SelectContent>
                        {allPlayers.map((player) => (
                          <SelectItem key={player.id} value={player.id.toString()} className="text-lg">
                            {player.number} - {player.name} ({player.position})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-lg font-medium">Jugador 2</label>
                    <Select onValueChange={(value) => setPlayer2Id(Number(value))}>
                      <SelectTrigger className="h-12 text-lg">
                        <SelectValue placeholder="Selecciona un jugador" />
                      </SelectTrigger>
                      <SelectContent>
                        {allPlayers.map((player) => (
                          <SelectItem key={player.id} value={player.id.toString()} className="text-lg">
                            {player.number} - {player.name} ({player.position})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {player1 && player2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Comparación de Estadísticas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-xl font-bold">{player1.name}</div>
                      <div className="text-lg">
                        {player1.position} - #{player1.number}
                      </div>
                    </div>
                    <div className="text-center text-lg font-medium">Estadística</div>
                    <div className="text-center">
                      <div className="text-xl font-bold">{player2.name}</div>
                      <div className="text-lg">
                        {player2.position} - #{player2.number}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Goles */}
                    <div className="grid grid-cols-3 items-center gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold">{player1.stats.goals}</div>
                        <div className="text-lg text-muted-foreground">Total</div>
                        <div className="text-lg font-medium">{player1.averageStats.goals.toFixed(1)} por partido</div>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <div className="text-lg font-medium">Goles</div>
                        <Progress
                          value={calculatePercentage(player1.stats.goals, player2.stats.goals)}
                          className="h-3 w-full"
                        />
                        <div className="flex items-center">
                          {getComparisonIcon(player1.stats.goals, player2.stats.goals)}
                          <span className="text-sm ml-1">
                            {player1.stats.goals > player2.stats.goals
                              ? `+${player1.stats.goals - player2.stats.goals}`
                              : player1.stats.goals < player2.stats.goals
                                ? `-${player2.stats.goals - player1.stats.goals}`
                                : "Igual"}
                          </span>
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="text-2xl font-bold">{player2.stats.goals}</div>
                        <div className="text-lg text-muted-foreground">Total</div>
                        <div className="text-lg font-medium">{player2.averageStats.goals.toFixed(1)} por partido</div>
                      </div>
                    </div>

                    {/* Asistencias */}
                    <div className="grid grid-cols-3 items-center gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold">{player1.stats.assists}</div>
                        <div className="text-lg text-muted-foreground">Total</div>
                        <div className="text-lg font-medium">{player1.averageStats.assists.toFixed(1)} por partido</div>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <div className="text-lg font-medium">Asistencias</div>
                        <Progress
                          value={calculatePercentage(player1.stats.assists, player2.stats.assists)}
                          className="h-3 w-full"
                        />
                        <div className="flex items-center">
                          {getComparisonIcon(player1.stats.assists, player2.stats.assists)}
                          <span className="text-sm ml-1">
                            {player1.stats.assists > player2.stats.assists
                              ? `+${player1.stats.assists - player2.stats.assists}`
                              : player1.stats.assists < player2.stats.assists
                                ? `-${player2.stats.assists - player1.stats.assists}`
                                : "Igual"}
                          </span>
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="text-2xl font-bold">{player2.stats.assists}</div>
                        <div className="text-lg text-muted-foreground">Total</div>
                        <div className="text-lg font-medium">{player2.averageStats.assists.toFixed(1)} por partido</div>
                      </div>
                    </div>

                    {/* Atajadas */}
                    <div className="grid grid-cols-3 items-center gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold">{player1.stats.saves}</div>
                        <div className="text-lg text-muted-foreground">Total</div>
                        <div className="text-lg font-medium">{player1.averageStats.saves.toFixed(1)} por partido</div>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <div className="text-lg font-medium">Atajadas</div>
                        <Progress
                          value={calculatePercentage(player1.stats.saves, player2.stats.saves)}
                          className="h-3 w-full"
                        />
                        <div className="flex items-center">
                          {getComparisonIcon(player1.stats.saves, player2.stats.saves)}
                          <span className="text-sm ml-1">
                            {player1.stats.saves > player2.stats.saves
                              ? `+${player1.stats.saves - player2.stats.saves}`
                              : player1.stats.saves < player2.stats.saves
                                ? `-${player2.stats.saves - player1.stats.saves}`
                                : "Igual"}
                          </span>
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="text-2xl font-bold">{player2.stats.saves}</div>
                        <div className="text-lg text-muted-foreground">Total</div>
                        <div className="text-lg font-medium">{player2.averageStats.saves.toFixed(1)} por partido</div>
                      </div>
                    </div>

                    {/* Pérdidas */}
                    <div className="grid grid-cols-3 items-center gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold">{player1.stats.turnovers}</div>
                        <div className="text-lg text-muted-foreground">Total</div>
                        <div className="text-lg font-medium">
                          {player1.averageStats.turnovers.toFixed(1)} por partido
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <div className="text-lg font-medium">Pérdidas</div>
                        <Progress
                          value={calculatePercentage(player1.stats.turnovers, player2.stats.turnovers)}
                          className="h-3 w-full"
                        />
                        <div className="flex items-center">
                          {getComparisonIcon(player1.stats.turnovers, player2.stats.turnovers, true)}
                          <span className="text-sm ml-1">
                            {player1.stats.turnovers < player2.stats.turnovers
                              ? `${player2.stats.turnovers - player1.stats.turnovers} menos`
                              : player1.stats.turnovers > player2.stats.turnovers
                                ? `${player1.stats.turnovers - player2.stats.turnovers} más`
                                : "Igual"}
                          </span>
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="text-2xl font-bold">{player2.stats.turnovers}</div>
                        <div className="text-lg text-muted-foreground">Total</div>
                        <div className="text-lg font-medium">
                          {player2.averageStats.turnovers.toFixed(1)} por partido
                        </div>
                      </div>
                    </div>

                    {/* Tiempo de Juego */}
                    <div className="grid grid-cols-3 items-center gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold">{formatTime(player1.stats.playTime)}</div>
                        <div className="text-lg text-muted-foreground">Total</div>
                        <div className="text-lg font-medium">
                          {formatTime(player1.averageStats.playTime)} por partido
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <div className="text-lg font-medium">Tiempo de Juego</div>
                        <Progress
                          value={calculatePercentage(player1.stats.playTime, player2.stats.playTime)}
                          className="h-3 w-full"
                        />
                        <div className="flex items-center">
                          {getComparisonIcon(player1.stats.playTime, player2.stats.playTime)}
                          <span className="text-sm ml-1">
                            {player1.stats.playTime > player2.stats.playTime
                              ? `+${formatTime(player1.stats.playTime - player2.stats.playTime)}`
                              : player1.stats.playTime < player2.stats.playTime
                                ? `-${formatTime(player2.stats.playTime - player1.stats.playTime)}`
                                : "Igual"}
                          </span>
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="text-2xl font-bold">{formatTime(player2.stats.playTime)}</div>
                        <div className="text-lg text-muted-foreground">Total</div>
                        <div className="text-lg font-medium">
                          {formatTime(player2.averageStats.playTime)} por partido
                        </div>
                      </div>
                    </div>

                    {/* Eficiencia */}
                    <div className="grid grid-cols-3 items-center gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold">{calculateEfficiency(player1)}</div>
                        <div className="text-lg text-muted-foreground">Goles + Asistencias - Pérdidas</div>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <div className="text-lg font-medium">Eficiencia</div>
                        <Progress
                          value={calculatePercentage(calculateEfficiency(player1), calculateEfficiency(player2))}
                          className="h-3 w-full"
                        />
                        <div className="flex items-center">
                          {getComparisonIcon(calculateEfficiency(player1), calculateEfficiency(player2))}
                          <span className="text-sm ml-1">
                            {calculateEfficiency(player1) > calculateEfficiency(player2)
                              ? `+${calculateEfficiency(player1) - calculateEfficiency(player2)}`
                              : calculateEfficiency(player1) < calculateEfficiency(player2)
                                ? `-${calculateEfficiency(player2) - calculateEfficiency(player1)}`
                                : "Igual"}
                          </span>
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="text-2xl font-bold">{calculateEfficiency(player2)}</div>
                        <div className="text-lg text-muted-foreground">Goles + Asistencias - Pérdidas</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

