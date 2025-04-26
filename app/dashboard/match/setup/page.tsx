"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { BarChart, BarChart2, Eye, LogOut, MailIcon, Play, TrendingUp, UserPlus, Users } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import DarkModeToggle from "@/components/DarkModeToggle"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Tipo en DB
type Category = "MASCULINO" | "FEMENINO"
type DBPlayer = {
  id: number
  name: string
  position: string
  number: number
  category: Category
}

// Extendemos para UI local
type PlayerSelection = DBPlayer & {
  selected: boolean
  starter: boolean
}

export default function MatchSetupPage() {
  const router = useRouter()

  const [categoryFilter, setCategoryFilter] = useState<"ALL" | Category>("ALL")

  const [players, setPlayers] = useState<PlayerSelection[]>([])
  const [matchInfo, setMatchInfo] = useState({
    opponent: "",
    date: "",
    location: "",
  })
  const [error, setError] = useState<string | null>(null)

  // 1) Al montar, obtenemos todos los jugadores de /api/players
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const res = await fetch("/api/players")
        if (!res.ok) {
          console.error("Error al cargar jugadores")
          return
        }
        const data: DBPlayer[] = await res.json()
        // Convertimos en PlayerSelection, agregando las props "selected" y "starter"
        const withSelection = data.map((p) => ({
          ...p,
          selected: false,
          starter: false,
        }))
        
        setPlayers(withSelection)
      } catch (err) {
        console.error(err)
      }
    }
    fetchPlayers()
  }, [])

  // 2) Contadores
  const selectedCount = players.filter((p) => p.selected).length
  const starterCount = players.filter((p) => p.selected && p.starter).length
  const substitutesCount = players.filter((p) => p.selected && !p.starter).length

  // 3) Toggle selección
  const togglePlayerSelection = (playerId: number) => {
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id === playerId) {
          if (p.selected) {
            // Deseleccionar
            return { ...p, selected: false, starter: false }
          }
          // Verificamos límite
          if (selectedCount >= 14) {
            setError("No puedes seleccionar más de 14 jugadores")
            return p
          }
          // Seleccionar
          return { ...p, selected: true }
        }
        return p
      })
    )
    setError(null)
  }

  // 4) Toggle titular
  const togglePlayerStarter = (playerId: number) => {
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id === playerId) {
          if (!p.selected) return p
          if (p.starter) {
            // Quitar titular
            return { ...p, starter: false }
          }
          // Verificamos límite de 5 titulares
          if (starterCount >= 5) {
            setError("No puedes seleccionar más de 5 titulares")
            return p
          }
          // Poner titular
          return { ...p, starter: true }
        }
        return p
      })
    )
    setError(null)
  }

  // 5) Crear partido
  const startMatch = async () => {
    // Validaciones
    if (starterCount !== 5) {
      setError("Debes seleccionar exactamente 5 jugadores titulares")
      return
    }
    if (substitutesCount !== 9) {
      setError("Debes seleccionar exactamente 9 jugadores suplentes")
      return
    }
    if (!matchInfo.opponent || !matchInfo.date || !matchInfo.location) {
      setError("Debes completar toda la información del partido")
      return
    }

    try {
      // Enviamos al endpoint /api/matches
      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opponent: matchInfo.opponent,
          date: matchInfo.date, // "YYYY-MM-DD"
          location: matchInfo.location,
          selectedPlayers: players
            .filter((p) => p.selected)
            .map((p) => ({
              id: p.id,
              starter: p.starter,
            })),
        }),
      })
      if (!res.ok) {
        console.error("Error al crear partido")
        setError("Ocurrió un error al crear el partido")
        return
      }
      const data = await res.json()
      const createdMatch = data.match
      // Redirigimos al live, pasando matchId como query param
      router.push(`/dashboard/match/live?matchId=${createdMatch.id}`)
    } catch (err) {
      console.error(err)
      setError("Error al crear partido")
    }
  }

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

        {/* MAIN */}
        <main className="flex-1 p-4 md:p-6">
          <div className="grid gap-4 md:gap-6">
            {/* Título y botón */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight">Configuración del Partido</h2>
              <Button
                onClick={startMatch}
                disabled={starterCount !== 5 || substitutesCount !== 9}
                size="lg"
                className="text-lg py-6"
              >
                <Play className="mr-2 h-5 w-5" />
                Iniciar Partido
              </Button>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Info del partido */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Información del Partido</CardTitle>
              </CardHeader>
              <CardContent>
              <div className="flex items-center mb-4 gap-2">
               <Label className="whitespace-nowrap">Filtrar:</Label>
               <Select
                 value={categoryFilter}
                 onValueChange={(val: string) =>
                           setCategoryFilter(val as "ALL" | Category)
                         }
               >
                 <SelectTrigger className="w-32 h-10 text-lg">
                   <SelectValue
                     placeholder={
                       categoryFilter === "ALL"
                         ? "Todos"
                         : categoryFilter === "MASCULINO"
                         ? "Masculino"
                         : "Femenino"
                     }
                   />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="ALL">Todos</SelectItem>
                   <SelectItem value="MASCULINO">Masculino</SelectItem>
                   <SelectItem value="FEMENINO">Femenino</SelectItem>
                 </SelectContent>
               </Select>
             </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="opponent" className="text-lg">
                      Oponente
                    </Label>
                    <Input
                      id="opponent"
                      value={matchInfo.opponent}
                      onChange={(e) => setMatchInfo({ ...matchInfo, opponent: e.target.value })}
                      placeholder="Equipo rival"
                      className="h-12 text-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-lg">
                      Fecha
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={matchInfo.date}
                      onChange={(e) => setMatchInfo({ ...matchInfo, date: e.target.value })}
                      className="h-12 text-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-lg">
                      Ubicación
                    </Label>
                    <Input
                      id="location"
                      value={matchInfo.location}
                      onChange={(e) => setMatchInfo({ ...matchInfo, location: e.target.value })}
                      placeholder="Lugar del partido"
                      className="h-12 text-lg"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selección de jugadores */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Selección de Jugadores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between mb-4 text-lg">
                  <div className="bg-muted p-3 rounded-lg">
                    Titulares:{" "}
                    <span className={starterCount === 5 ? "text-green-500 font-bold" : "text-amber-500 font-bold"}>
                      {starterCount}/5
                    </span>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    Suplentes:{" "}
                    <span
                      className={substitutesCount === 9 ? "text-green-500 font-bold" : "text-amber-500 font-bold"}
                    >
                      {substitutesCount}/9
                    </span>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    Total:{" "}
                    <span className={selectedCount === 14 ? "text-green-500 font-bold" : "text-amber-500 font-bold"}>
                      {selectedCount}/14
                    </span>
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px] text-lg">Núm.</TableHead>
                      <TableHead className="text-lg">Jugador</TableHead>
                      <TableHead className="text-lg">Posición</TableHead>
                      <TableHead className="text-center text-lg">Seleccionado</TableHead>
                      <TableHead className="text-center text-lg">Titular</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {players
                  .filter((p) =>
                    categoryFilter === "ALL"
                      ? true
                      : p.category === categoryFilter
                  )
                  .map((player) => (
                      <TableRow key={player.id}>
                        <TableCell className="text-lg font-medium">{player.number}</TableCell>
                        <TableCell className="text-lg font-medium">{player.name}</TableCell>
                        <TableCell className="text-lg">{player.position}</TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={player.selected}
                            onCheckedChange={() => togglePlayerSelection(player.id)}
                            className="h-6 w-6"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={player.starter}
                            disabled={!player.selected}
                            onCheckedChange={() => togglePlayerStarter(player.id)}
                            className="h-6 w-6"
                          />
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
