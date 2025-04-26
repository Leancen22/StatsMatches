"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  BarChart2,
  LogOut,
  Users,
  TrendingUp,
  Eye,
  MailIcon,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import DarkModeToggle from "@/components/DarkModeToggle";

// --- Tipo actualizado con todas las métricas ---
type PlayerStats = {
  id: number;
  name: string;
  position: string;
  number: number;
  matches: number;
  stats: {
    goals: number;
    assists: number;
    saves: number;
    turnovers: number;
    shotsOnGoal: number;
    shotsOffTarget: number;
    recoveries: number;
    foulsCommitted: number;
    foulsReceived: number;
    yellowCards: number;
    redCards: number;
    playTime: number; // en segundos
  };
  averageStats: {
    goals: number;
    assists: number;
    saves: number;
    turnovers: number;
    shotsOnGoal: number;
    shotsOffTarget: number;
    recoveries: number;
    foulsCommitted: number;
    foulsReceived: number;
    yellowCards: number;
    redCards: number;
    playTime: number; // en segundos
  };
};

export default function ComparePlayersPage() {
  const [allPlayers, setAllPlayers] = useState<PlayerStats[]>([]);
  const [player1Id, setPlayer1Id] = useState<number | null>(null);
  const [player2Id, setPlayer2Id] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/stats/players")
      .then((res) => res.json())
      .then(setAllPlayers)
      .catch(console.error);
  }, []);

  const player1 = allPlayers.find((p) => p.id === player1Id) || null;
  const player2 = allPlayers.find((p) => p.id === player2Id) || null;

  const formatTime = (s: number) => {
    const t = Math.floor(s);
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const sec = t % 60;
    return `${h}h ${m}m ${sec}s`;
  };

  const calculateEfficiency = (p: PlayerStats) =>
    p.stats.goals + p.stats.assists - p.stats.turnovers;

  const calculatePercentage = (v1: number, v2: number) => {
    if (v1 + v2 === 0) return 50;
    return Math.round((v1 / (v1 + v2)) * 100);
  };

  const getComparisonIcon = (
    v1: number,
    v2: number,
    isNegativeBetter = false
  ) => {
    if (v1 === v2) return <Minus className="h-5 w-5 text-gray-500" />;
    if (!isNegativeBetter) {
      return v1 > v2 ? (
        <ArrowUpRight className="h-5 w-5 text-green-500" />
      ) : (
        <ArrowDownRight className="h-5 w-5 text-red-500" />
      );
    }
    return v1 < v2 ? (
      <ArrowUpRight className="h-5 w-5 text-green-500" />
    ) : (
      <ArrowDownRight className="h-5 w-5 text-red-500" />
    );
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-lg font-semibold">Handball Stats Tracker</h1>
          <nav className="ml-auto flex gap-4">
            <DarkModeToggle />
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

        <main className="flex-1 p-4 md:p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Comparar Jugadores</h2>
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

          {/* Selección */}
          <Card>
            <CardHeader>
              <CardTitle>Seleccionar Jugadores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {["Jugador 1", "Jugador 2"].map((label, i) => (
                  <div key={i} className="space-y-2">
                    <label className="text-lg font-medium">{label}</label>
                    <Select
                      onValueChange={(v) =>
                        i === 0
                          ? setPlayer1Id(Number(v))
                          : setPlayer2Id(Number(v))
                      }
                    >
                      <SelectTrigger className="h-12 text-lg">
                        <SelectValue placeholder="Selecciona un jugador" />
                      </SelectTrigger>
                      <SelectContent>
                        {allPlayers.map((p) => (
                          <SelectItem
                            key={p.id}
                            value={p.id.toString()}
                            className="text-lg"
                          >
                            #{p.number} – {p.name} ({p.position})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Comparación */}
          {player1 && player2 && (
            <Card>
              <CardHeader>
                <CardTitle>Comparación de Estadísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Encabezados */}
                <div className="grid grid-cols-3 text-center gap-4 mb-4">
                  {[player1.name, "Estadística", player2.name].map((t, i) => (
                    <div key={i} className="text-lg font-medium">
                      {t}
                    </div>
                  ))}
                </div>

                {/* Lista de métricas */}
                {([
                  { key: "goals", label: "Goles", negative: false },
                  { key: "assists", label: "Asistencias", negative: false },
                  { key: "saves", label: "Atajadas", negative: false },
                  { key: "turnovers", label: "Pérdidas", negative: true },
                  { key: "shotsOnGoal", label: "SA", negative: false },
                  { key: "shotsOffTarget", label: "SF", negative: true },
                  { key: "recoveries", label: "Recup.", negative: false },
                  { key: "foulsCommitted", label: "F.C.", negative: true },
                  { key: "foulsReceived", label: "F.R.", negative: true },
                  { key: "yellowCards", label: "Amar.", negative: true },
                  { key: "redCards", label: "Roja", negative: true },
                  { key: "playTime", label: "Tiempo", negative: false },
                  { key: "efficiency", label: "Eficiencia", negative: false },
                ] as const).map(({ key, label, negative }) => {
                  // obtener valores
                  const v1 =
                    key === "efficiency"
                      ? calculateEfficiency(player1)
                      : (player1.stats as any)[key];
                  const v2 =
                    key === "efficiency"
                      ? calculateEfficiency(player2)
                      : (player2.stats as any)[key];
                  const pct = calculatePercentage(v1, v2);
                  const diff = v1 - v2;

                  return (
                    <div
                      key={key}
                      className="grid grid-cols-3 items-center gap-4"
                    >
                      {/* Jugador 1 */}
                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          {key === "playTime" ? formatTime(v1) : v1}
                        </div>
                        <div className="text-sm text-muted-foreground">Total</div>
                        {key !== "efficiency" && (
                          <div className="text-sm">
                            {key !== "playTime"
                              ? `${(
                                  (player1.averageStats as any)[key]
                                ).toFixed(1)} p/p`
                              : formatTime(
                                  (player1.averageStats as any)[key]
                                )}
                          </div>
                        )}
                      </div>

                      {/* Progress + Icon + Diff */}
                      <div className="flex flex-col items-center gap-2">
                        <div className="text-lg font-medium">{label}</div>
                        <Progress value={pct} className="h-3 w-full" />
                        <div className="flex items-center">
                          {getComparisonIcon(v1, v2, negative)}
                          <span className="text-sm ml-1">
                            {diff === 0
                              ? "Igual"
                              : negative
                              ? diff < 0
                                ? `+${-diff}`
                                : `-${diff}`
                              : diff > 0
                              ? `+${diff}`
                              : `-${-diff}`}
                          </span>
                        </div>
                      </div>

                      {/* Jugador 2 */}
                      <div className="text-left">
                        <div className="text-2xl font-bold">
                          {key === "playTime" ? formatTime(v2) : v2}
                        </div>
                        <div className="text-sm text-muted-foreground">Total</div>
                        {key !== "efficiency" && (
                          <div className="text-sm">
                            {key !== "playTime"
                              ? `${(
                                  (player2.averageStats as any)[key]
                                ).toFixed(1)} p/p`
                              : formatTime(
                                  (player2.averageStats as any)[key]
                                )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
