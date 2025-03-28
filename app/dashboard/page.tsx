"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart2, LogOut, Users, TrendingUp, BarChart, Eye } from "lucide-react"
import DarkModeToggle from "@/components/DarkModeToggle"

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
}

type MatchData = {
  id: number
  opponent: string
  date: string
  location: string
  result: string
}

export default function DashboardPage() {
  // States
  const [players, setPlayers] = useState<PlayerStats[]>([])
  const [matches, setMatches] = useState<MatchData[]>([])

  // Cargar data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1) Jugadores
        const resPlayers = await fetch("/api/stats/players")
        if (!resPlayers.ok) throw new Error("Error al obtener jugadores")
        const playersData = await resPlayers.json()

        // 2) Partidos
        const resMatches = await fetch("/api/stats/matches")
        if (!resMatches.ok) throw new Error("Error al obtener partidos")
        const matchesData = await resMatches.json()

        setPlayers(playersData)
        setMatches(matchesData)
      } catch (error) {
        console.error(error)
      }
    }
    fetchData()
  }, [])

  // Cálculo de resumen local
  const totalPartidos = matches.length
  const totalJugadores = players.length
  const totalGoles = players.reduce((acc, p) => acc + p.stats.goals, 0)

  // Podrías crear un array de cards
  const summary = [
    {
      label: "Total de Partidos",
      value: totalPartidos,
    },
    {
      label: "Jugadores Activos",
      value: totalJugadores,
    },
    {
      label: "Total de Goles",
      value: totalGoles,
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      {/* HEADER */}
      <header className="border-b">
        <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
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

      <div className="flex flex-1">
        {/* SIDEBAR */}
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

        {/* MAIN */}
        <main className="flex-1 p-4 md:p-6">
          <div className="grid gap-4 md:gap-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight">
                Dashboard
              </h2>
            </div>
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Resumen</TabsTrigger>
                <TabsTrigger value="history">Historial</TabsTrigger>
              </TabsList>

              {/* Sección "overview" con cards dinámicas */}
              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {summary.map((item, index) => (
                    <Card key={index}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          {item.label}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{item.value}</div>
                        {/* <p className="text-xs text-muted-foreground">
                          {item.subtext}
                        </p> */}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Sección "history" con lista de partidos */}
              <TabsContent value="history" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Historial de Partidos</CardTitle>
                    <CardDescription>
                      Visualiza los últimos partidos registrados
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {matches.map((match) => (
                        <div
                          key={match.id}
                          className="flex items-center justify-between border-b pb-2"
                        >
                          <div>
                            <p className="font-medium">
                              Partido #{match.id}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(match.date).toLocaleDateString()}
                            </p>
                          </div>
                          <Link href={`/dashboard/stats/match/${match.id}`}>
                            <Button variant="outline" size="sm">
                              Ver detalles
                            </Button>
                          </Link>
                        </div>
                      ))}
                    </div>
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
