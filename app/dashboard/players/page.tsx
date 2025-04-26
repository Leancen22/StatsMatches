"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BarChart, BarChart2, LogOut, Plus, TrendingUp, Users, Eye, MailIcon } from "lucide-react"
import DarkModeToggle from "@/components/DarkModeToggle"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


type Category = "MASCULINO" | "FEMENINO"

// Tipo para los jugadores que llegan del backend
type Player = {
  id: number
  name: string
  position: string
  number: number
  category: Category
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [newPlayer, setNewPlayer] = useState({ name: "", position: "", number: "", category: "MASCULINO" as Category, })

  // Al montar, cargamos los jugadores desde la DB:
  useEffect(() => {
    const fetchPlayers = async () => {
      const res = await fetch("/api/players")
      if (!res.ok) {
        console.error("Error al obtener jugadores")
        return
      }
      const data = await res.json()
      setPlayers(data)
    }
    fetchPlayers()
  }, [])

  const handleAddPlayer = async () => {
    if (!newPlayer.name || !newPlayer.position || !newPlayer.number || !newPlayer.category) return

    try {
      const res = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newPlayer.name,
          position: newPlayer.position,
          number: Number(newPlayer.number),
          category: newPlayer.category,
        }),
      })
      if (!res.ok) {
        alert("Error al crear jugador")
        return
      }
      const created = await res.json()
      // Agregamos el nuevo jugador al estado local
      setPlayers((prev) => [...prev, created])
      // Limpiamos el formulario
      setNewPlayer({ name: "", position: "", number: "", category: "MASCULINO" })
    } catch (error) {
      console.error(error)
      alert("Error al crear jugador")
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

      {/* CONTENIDO */}
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
            <Link href="/dashboard/mass-email">
              <Button variant="ghost" className="w-full justify-start">
                <MailIcon className="mr-2 h-4 w-4" />
                Convocatoria
              </Button>
            </Link>
          </nav>
        </aside>

        <main className="flex-1 p-4 md:p-6">
          <div className="grid gap-4 md:gap-8">
            {/* Título y botón de añadir */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight">Gestión de Jugadores</h2>
              {/* Diálogo para crear nuevo jugador */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Añadir Jugador
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Añadir Nuevo Jugador</DialogTitle>
                    <DialogDescription>Completa los datos del nuevo jugador</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Nombre</Label>
                      <Input
                        id="name"
                        value={newPlayer.name}
                        onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="position">Posición</Label>
                      <Input
                        id="position"
                        value={newPlayer.position}
                        onChange={(e) => setNewPlayer({ ...newPlayer, position: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="number">Número</Label>
                      <Input
                        id="number"
                        type="number"
                        value={newPlayer.number}
                        onChange={(e) => setNewPlayer({ ...newPlayer, number: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="category">Categoría</Label>
                      <Select
                        value={newPlayer.category}
                        onValueChange={(val) =>
                          setNewPlayer({ ...newPlayer, category: val as Category })
                        }
                      >
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Selecciona categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MASCULINO">Masculino</SelectItem>
                          <SelectItem value="FEMENINO">Femenino</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddPlayer}>Guardar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Tabla de jugadores */}
            <Card>
              <CardHeader>
                <CardTitle>Lista de Jugadores</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Posición</TableHead>
                      <TableHead>Categoria</TableHead>
                      
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {players.map((player) => (
                      <TableRow key={player.id}>
                        <TableCell>{player.number}</TableCell>
                        <TableCell>{player.name}</TableCell>
                        <TableCell>{player.position}</TableCell>
                        <TableCell>
                          {player.category === "MASCULINO" ? "Masculino" : "Femenino"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">
                            Editar
                          </Button>
                          {/* Ejemplo: Podrías añadir un botón "Eliminar" aquí */}
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
