
// "use client";

// import { useState, useEffect, useRef } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Pause, Play, Save, RefreshCw } from "lucide-react";
// import { Volleyball, Hand, Shield, XCircle } from "lucide-react";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// type MatchInfo = {
//   id: number;
//   opponent: string;
//   date: string;
//   location: string;
// };

// type PlayerDB = {
//   id: number;
//   name: string;
//   position: string;
//   number: number;
// };

// type MatchPlayerDB = {
//   id: number;
//   goals: number;
//   assists: number;
//   saves: number;
//   turnovers: number;
//   playTime: number;
//   starter: boolean;
//   player: PlayerDB;
// };

// type LivePlayer = {
//   matchPlayerId: number;
//   playing: boolean;
//   stats: {
//     goals: number;
//     assists: number;
//     saves: number;
//     turnovers: number;
//     playTime: number;
//   };
// } & PlayerDB;

// export default function LiveClientComponent() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const matchId = searchParams.get("matchId");

//   const [matchInfo, setMatchInfo] = useState<MatchInfo | null>(null);
//   const [players, setPlayers] = useState<LivePlayer[]>([]);
//   const [elapsedTime, setElapsedTime] = useState(0);
//   const [isRunning, setIsRunning] = useState(false);
//   const intervalRef = useRef<NodeJS.Timeout | null>(null);

//   // Estados para sustituciones
//   const [substitutionDialogOpen, setSubstitutionDialogOpen] = useState(false);
//   const [playerOut, setPlayerOut] = useState<number | null>(null);
//   const [playerIn, setPlayerIn] = useState<number | null>(null);

//   // Función para reproducir sonido de clic (archivo en public/audio/click.mp3)
//   const playClickSound = () => {
//     const audio = new Audio("/click.mp3");
//     audio.volume = 0.3; // Volumen bajo
//     audio.play();
//   };

//   // 1) Cargar data del partido
//   useEffect(() => {
//     if (!matchId) {
//       router.push("/dashboard/match/setup");
//       return;
//     }

//     const fetchMatch = async () => {
//       try {
//         const res = await fetch(`/api/matches/${matchId}`);
//         if (!res.ok) {
//           console.error("Error al obtener partido");
//           router.push("/dashboard/match/setup");
//           return;
//         }
//         const data = await res.json();
//         const match = data.match as {
//           id: number;
//           opponent: string;
//           date: string;
//           location: string;
//           matchPlayers: MatchPlayerDB[];
//         };

//         setMatchInfo({
//           id: match.id,
//           opponent: match.opponent,
//           date: match.date,
//           location: match.location || "",
//         });

//         // Transformar los MatchPlayers a nuestra estructura local
//         const livePlayers: LivePlayer[] = match.matchPlayers.map((mp) => ({
//           matchPlayerId: mp.id,
//           id: mp.player.id,
//           name: mp.player.name,
//           position: mp.player.position,
//           number: mp.player.number,
//           playing: mp.starter,
//           stats: {
//             goals: mp.goals,
//             assists: mp.assists,
//             saves: mp.saves,
//             turnovers: mp.turnovers,
//             playTime: mp.playTime,
//           },
//         }));
//         setPlayers(livePlayers);
//       } catch (err) {
//         console.error(err);
//         router.push("/dashboard/match/setup");
//       }
//     };

//     fetchMatch();

//     // Cleanup del timer
//     return () => {
//       if (intervalRef.current) clearInterval(intervalRef.current);
//     };
//   }, [matchId, router]);

//   // 2) Cronómetro
//   const toggleTimer = () => {
//     if (isRunning) {
//       if (intervalRef.current) {
//         clearInterval(intervalRef.current);
//         intervalRef.current = null;
//       }
//     } else {
//       const startTime = Date.now() - elapsedTime * 1000;
//       intervalRef.current = setInterval(() => {
//         const current = Math.floor((Date.now() - startTime) / 1000);
//         setElapsedTime(current);
//         // Actualiza el tiempo de juego para los jugadores que están en cancha
//         setPlayers((prev) =>
//           prev.map((pl) =>
//             pl.playing
//               ? { ...pl, stats: { ...pl.stats, playTime: pl.stats.playTime + 1 } }
//               : pl
//           )
//         );
//       }, 1000);
//     }
//     setIsRunning(!isRunning);
//   };

//   // 3) Incrementar stat (con sonido)
//   const incrementStat = (matchPlayerId: number, statKey: "goals" | "assists" | "saves" | "turnovers") => {
//     playClickSound();
//     setPlayers((prev) =>
//       prev.map((pl) =>
//         pl.matchPlayerId === matchPlayerId
//           ? { ...pl, stats: { ...pl.stats, [statKey]: pl.stats[statKey] + 1 } }
//           : pl
//       )
//     );
//   };

//   // 4) Formatear tiempo (MM:SS)
//   const formatTime = (seconds: number) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
//   };

//   // 5) Sustitución
//   const makeSubstitution = () => {
//     if (!playerOut || !playerIn) return;
//     setPlayers((prev) =>
//       prev.map((pl) => {
//         if (pl.matchPlayerId === playerOut) {
//           return { ...pl, playing: false };
//         }
//         if (pl.matchPlayerId === playerIn) {
//           return { ...pl, playing: true };
//         }
//         return pl;
//       })
//     );
//     setSubstitutionDialogOpen(false);
//     setPlayerOut(null);
//     setPlayerIn(null);
//   };

//   // 6) Guardar partido (PATCH)
//   const saveMatch = async () => {
//     if (!matchId) {
//       router.push("/dashboard");
//       return;
//     }
//     try {
//       const updatedStats = players.map((pl) => ({
//         matchPlayerId: pl.matchPlayerId,
//         goals: pl.stats.goals,
//         assists: pl.stats.assists,
//         saves: pl.stats.saves,
//         turnovers: pl.stats.turnovers,
//         playTime: pl.stats.playTime,
//       }));

//       const res = await fetch(`/api/matches/${matchId}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ updatedStats }),
//       });
//       if (!res.ok) {
//         alert("Error al guardar el partido");
//         return;
//       }

//       alert("Partido guardado correctamente");
//       router.push("/dashboard");
//     } catch (err) {
//       console.error(err);
//       alert("Error al guardar el partido");
//     }
//   };

//   const playingPlayers = players.filter((p) => p.playing);
//   const benchPlayers = players.filter((p) => !p.playing);

//   if (!matchInfo) {
//     return (
//       <div className="p-8">
//         <p>Cargando partido...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="flex min-h-screen flex-col bg-background">
//       {/* HEADER */}
//       <header className="border-b bg-background z-10">
//         <div className="container flex h-16 items-center px-4">
//           <h1 className="text-xl font-semibold">Handball Stats Tracker</h1>
//           <div className="ml-auto flex items-center gap-4">
//             <div className="text-lg font-medium">
//               {matchInfo.opponent && `vs ${matchInfo.opponent}`}
//             </div>
//             <Button
//               onClick={toggleTimer}
//               variant={isRunning ? "destructive" : "default"}
//               size="lg"
//               className="text-lg h-12"
//             >
//               {isRunning ? <Pause className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
//               {isRunning ? "Pausar" : "Reanudar"}
//             </Button>
//             <Button onClick={saveMatch} size="lg" className="text-lg h-12">
//               <Save className="mr-2 h-5 w-5" />
//               Finalizar
//             </Button>
//           </div>
//         </div>
//       </header>

//       {/* MAIN */}
//       <main className="flex-1 p-4 overflow-auto">
//         <div className="grid grid-cols-1 gap-4">
//           {/* Cronómetro y Sustituciones */}
//           <div className="grid grid-cols-3 gap-4">
//             <Card className="col-span-1">
//               <CardHeader className="pb-2">
//                 <CardTitle className="text-xl">Cronómetro</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="text-5xl font-bold text-center">
//                   {formatTime(elapsedTime)}
//                 </div>
//               </CardContent>
//             </Card>

//             <Card className="col-span-2">
//               <CardHeader className="pb-2">
//                 <CardTitle className="text-xl">Sustituciones</CardTitle>
//               </CardHeader>
//               <CardContent className="flex justify-between items-center">
//                 <div className="text-lg">
//                   <div>
//                     Jugadores en cancha:{" "}
//                     <span className="font-bold">{playingPlayers.length}</span>
//                   </div>
//                   <div>
//                     Jugadores en banca:{" "}
//                     <span className="font-bold">{benchPlayers.length}</span>
//                   </div>
//                 </div>
//                 <Dialog open={substitutionDialogOpen} onOpenChange={setSubstitutionDialogOpen}>
//                   <DialogTrigger asChild>
//                     <Button size="lg" className="text-lg h-12">
//                       <RefreshCw className="mr-2 h-5 w-5" />
//                       Realizar Sustitución
//                     </Button>
//                   </DialogTrigger>
//                   <DialogContent className="sm:max-w-md">
//                     <DialogHeader>
//                       <DialogTitle className="text-xl">Realizar Sustitución</DialogTitle>
//                       <DialogDescription className="text-lg">
//                         Selecciona el jugador que sale y el que entra
//                       </DialogDescription>
//                     </DialogHeader>
//                     <div className="grid gap-6 py-4">
//                       <div className="grid gap-2">
//                         <Label className="text-lg">Jugador que Sale</Label>
//                         <Select onValueChange={(value) => setPlayerOut(Number(value))}>
//                           <SelectTrigger className="h-12 text-lg">
//                             <SelectValue placeholder="Selecciona un jugador" />
//                           </SelectTrigger>
//                           <SelectContent>
//                             {playingPlayers.map((player) => (
//                               <SelectItem
//                                 key={player.matchPlayerId}
//                                 value={player.matchPlayerId.toString()}
//                                 className="text-lg"
//                               >
//                                 {player.number} - {player.name}
//                               </SelectItem>
//                             ))}
//                           </SelectContent>
//                         </Select>
//                       </div>
//                       <div className="grid gap-2">
//                         <Label className="text-lg">Jugador que Entra</Label>
//                         <Select onValueChange={(value) => setPlayerIn(Number(value))}>
//                           <SelectTrigger className="h-12 text-lg">
//                             <SelectValue placeholder="Selecciona un jugador" />
//                           </SelectTrigger>
//                           <SelectContent>
//                             {benchPlayers.map((player) => (
//                               <SelectItem
//                                 key={player.matchPlayerId}
//                                 value={player.matchPlayerId.toString()}
//                                 className="text-lg"
//                               >
//                                 {player.number} - {player.name}
//                               </SelectItem>
//                             ))}
//                           </SelectContent>
//                         </Select>
//                       </div>
//                     </div>
//                     <DialogFooter>
//                       <Button onClick={makeSubstitution} size="lg" className="text-lg">
//                         Confirmar Sustitución
//                       </Button>
//                     </DialogFooter>
//                   </DialogContent>
//                 </Dialog>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Jugadores en cancha */}
//           <Card>
//             <CardHeader className="pb-2">
//               <CardTitle className="text-xl">Jugadores en Cancha</CardTitle>
//             </CardHeader>
//             <CardContent className="overflow-x-auto">
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead className="w-[80px] text-lg">Núm.</TableHead>
//                     <TableHead className="text-lg">Jugador</TableHead>
//                     <TableHead className="text-center text-lg">Tiempo</TableHead>
//                     <TableHead className="text-center text-lg">Goles</TableHead>
//                     <TableHead className="text-center text-lg">Asistencias</TableHead>
//                     <TableHead className="text-center text-lg">Atajadas</TableHead>
//                     <TableHead className="text-center text-lg">Pérdidas</TableHead>
//                     <TableHead className="text-center text-lg">Acciones</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {playingPlayers.map((player) => (
//                     <TableRow key={player.matchPlayerId}>
//                       <TableCell className="text-lg font-bold">{player.number}</TableCell>
//                       <TableCell>
//                         <div className="text-lg font-medium">{player.name}</div>
//                         <div className="text-sm text-muted-foreground">{player.position}</div>
//                       </TableCell>
//                       <TableCell className="text-center text-lg">{formatTime(player.stats.playTime)}</TableCell>
//                       <TableCell className="text-center text-lg font-bold">{player.stats.goals}</TableCell>
//                       <TableCell className="text-center text-lg font-bold">{player.stats.assists}</TableCell>
//                       <TableCell className="text-center text-lg font-bold">{player.stats.saves}</TableCell>
//                       <TableCell className="text-center text-lg font-bold">{player.stats.turnovers}</TableCell>
//                       <TableCell>
//                         <div className="flex justify-center space-x-3">
//                           <Button
//                             variant="outline"
//                             size="icon"
//                             className="h-12 w-12 rounded-full active:scale-95 transition-transform duration-150"
//                             onClick={() =>
//                               incrementStat(player.matchPlayerId, "goals")
//                             }
//                           >
//                             <span className="sr-only">Gol</span>
//                             <Volleyball className="h-6 w-6" />
//                           </Button>
//                           <Button
//                             variant="outline"
//                             size="icon"
//                             className="h-12 w-12 rounded-full active:scale-95 transition-transform duration-150"
//                             onClick={() =>
//                               incrementStat(player.matchPlayerId, "assists")
//                             }
//                           >
//                             <span className="sr-only">Asistencia</span>
//                             <Hand className="h-6 w-6" />
//                           </Button>
//                           <Button
//                             variant="outline"
//                             size="icon"
//                             className="h-12 w-12 rounded-full active:scale-95 transition-transform duration-150"
//                             onClick={() =>
//                               incrementStat(player.matchPlayerId, "saves")
//                             }
//                           >
//                             <span className="sr-only">Atajada</span>
//                             <Shield className="h-6 w-6" />
//                           </Button>
//                           <Button
//                             variant="outline"
//                             size="icon"
//                             className="h-12 w-12 rounded-full active:scale-95 transition-transform duration-150"
//                             onClick={() =>
//                               incrementStat(player.matchPlayerId, "turnovers")
//                             }
//                           >
//                             <span className="sr-only">Pérdida</span>
//                             <XCircle className="h-6 w-6" />
//                           </Button>
//                         </div>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </CardContent>
//           </Card>

//           {/* Jugadores en banca */}
//           <Card>
//             <CardHeader className="pb-2">
//               <CardTitle className="text-xl">Jugadores en Banca</CardTitle>
//             </CardHeader>
//             <CardContent className="overflow-x-auto">
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead className="w-[80px] text-lg">Núm.</TableHead>
//                     <TableHead className="text-lg">Jugador</TableHead>
//                     <TableHead className="text-center text-lg">Tiempo</TableHead>
//                     <TableHead className="text-center text-lg">Goles</TableHead>
//                     <TableHead className="text-center text-lg">Asistencias</TableHead>
//                     <TableHead className="text-center text-lg">Atajadas</TableHead>
//                     <TableHead className="text-center text-lg">Pérdidas</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {benchPlayers.map((player) => (
//                     <TableRow key={player.matchPlayerId}>
//                       <TableCell className="text-lg font-bold">{player.number}</TableCell>
//                       <TableCell>
//                         <div className="text-lg font-medium">{player.name}</div>
//                         <div className="text-sm text-muted-foreground">{player.position}</div>
//                       </TableCell>
//                       <TableCell className="text-center text-lg">{formatTime(player.stats.playTime)}</TableCell>
//                       <TableCell className="text-center text-lg font-bold">{player.stats.goals}</TableCell>
//                       <TableCell className="text-center text-lg font-bold">{player.stats.assists}</TableCell>
//                       <TableCell className="text-center text-lg font-bold">{player.stats.saves}</TableCell>
//                       <TableCell className="text-center text-lg font-bold">{player.stats.turnovers}</TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </CardContent>
//           </Card>
//         </div>
//       </main>
//     </div>
//   );
// }

"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pause, Play, Save, RefreshCw, Frown, Smile, AlertTriangle, AlertOctagon } from "lucide-react";
import { Volleyball, Hand, Target, Slash, XCircle, Shield } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Tipos actualizados para nuevos stats

type MatchInfo = {
  id: number;
  opponent: string;
  date: string;
  location: string;
  opponentScore: number;
};

type PlayerDB = {
  id: number;
  name: string;
  position: string;
  number: number;
};

type MatchPlayerDB = {
  id: number;
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
  starter: boolean
  player: PlayerDB;
};

type LivePlayer = {
  matchPlayerId: number;
  playing: boolean;
  stats: {
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
  }
} & PlayerDB;

export default function LiveClientComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const matchId = searchParams.get("matchId");

  const [matchInfo, setMatchInfo] = useState<MatchInfo | null>(null);
  const [opponentScore, setOpponentScore] = useState(0);
  const [players, setPlayers] = useState<LivePlayer[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sustituciones
  const [substitutionDialogOpen, setSubstitutionDialogOpen] = useState(false);
  const [playerOut, setPlayerOut] = useState<number | null>(null);
  const [playerIn, setPlayerIn] = useState<number | null>(null);

  const playClickSound = () => {
    const audio = new Audio("/click.mp3");
    audio.volume = 0.3;
    audio.play();
  };

  useEffect(() => {
    if (!matchId) {
      router.push("/dashboard/match/setup");
      return;
    }

    const fetchMatch = async () => {
      try {
        const res = await fetch(`/api/matches/${matchId}`);
        if (!res.ok) {
          router.push("/dashboard/match/setup");
          return;
        }
        const data = await res.json();
        const m = data.match as MatchInfo & { matchPlayers: MatchPlayerDB[] };

        setMatchInfo({
          id: m.id,
          opponent: m.opponent,
          date: m.date,
          location: m.location || "",
          opponentScore: m.opponentScore,
        });
        setOpponentScore(m.opponentScore);

        const livePlayers: LivePlayer[] = m.matchPlayers.map(mp => ({
          matchPlayerId: mp.id,
          id: mp.player.id,
          name: mp.player.name,
          position: mp.player.position,
          number: mp.player.number,
          playing: mp.starter,
          stats: {
            goals:           mp.goals,
            assists:         mp.assists,
            saves:           mp.saves,
            turnovers:       mp.turnovers,
            shotsOnGoal:     mp.shotsOnGoal,
            shotsOffTarget:  mp.shotsOffTarget,
            recoveries:      mp.recoveries,
            foulsCommitted:  mp.foulsCommitted,
            foulsReceived:   mp.foulsReceived,
            yellowCards:     mp.yellowCards,
            redCards:        mp.redCards,
            playTime:        mp.playTime,
          },
        }));
        setPlayers(livePlayers);
      } catch (err) {
        router.push("/dashboard/match/setup");
      }
    };

    fetchMatch();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [matchId, router]);

  const teamScore = useMemo(
    () => players.reduce((sum, p) => sum + p.stats.goals, 0),
    [players]
  );

  // Cronómetro
  const toggleTimer = () => {
    if (isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } else {
      const startTime = Date.now() - elapsedTime * 1000;
      intervalRef.current = setInterval(() => {
        const current = Math.floor((Date.now() - startTime) / 1000);
        setElapsedTime(current);
        setPlayers(prev =>
          prev.map(pl =>
            pl.playing
              ? { ...pl, stats: { ...pl.stats, playTime: pl.stats.playTime + 1 } }
              : pl
          )
        );
      }, 1000);
    }
    setIsRunning(!isRunning);
  };

  // Incrementar stat
  const incrementStat = (
    matchPlayerId: number,
    statKey:
      | "goals"
      | "assists"
      | "saves"
      | "turnovers"
      | "shotsOnGoal"
      | "shotsOffTarget"
      | "recoveries"
      | "foulsCommitted"
      | "foulsReceived"
      | "yellowCards"
      | "redCards"
  ) => {
    // sonido…
    setPlayers(prev =>
      prev.map(pl =>
        pl.matchPlayerId === matchPlayerId
          ? { ...pl, stats: { ...pl.stats, [statKey]: pl.stats[statKey] + 1 } }
          : pl
      )
    )
  }

  const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
      };

  const makeSubstitution = () => {
    if (!playerOut || !playerIn) return;
    setPlayers(prev =>
      prev.map(pl => {
        if (pl.matchPlayerId === playerOut) return { ...pl, playing: false };
        if (pl.matchPlayerId === playerIn) return { ...pl, playing: true };
        return pl;
      })
    );
    setSubstitutionDialogOpen(false);
    setPlayerOut(null);
    setPlayerIn(null);
  };

  const saveMatch = async () => {
    if (!matchId) {
      router.push("/dashboard");
      return;
    }
    try {
      const updatedStats = players.map(pl => ({
        matchPlayerId: pl.matchPlayerId,
        goals: pl.stats.goals,
        assists: pl.stats.assists,
        shotsOnGoal: pl.stats.shotsOnGoal,
        shotsOffTarget: pl.stats.shotsOffTarget,
        turnovers: pl.stats.turnovers,
        recoveries: pl.stats.recoveries,
        playTime: pl.stats.playTime,
      }));

      const res = await fetch(`/api/matches/${matchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updatedStats, opponentScore }),
      });
      if (!res.ok) {
        alert("Error al guardar el partido");
        return;
      }
      alert("Partido guardado correctamente");
      router.push("/dashboard");
    } catch (err) {
      alert("Error al guardar el partido");
    }
  };

  const playingPlayers = players.filter(p => p.playing);
  const benchPlayers = players.filter(p => !p.playing);

  if (!matchInfo) {
    return (
      <div className="p-8">
        <p>Cargando partido...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* HEADER */}
      <header className="border-b bg-background z-10">
        <div className="container flex h-16 items-center px-4">
          <h1 className="text-xl font-semibold">Handball Stats Tracker</h1>
          <div className="ml-auto flex items-center gap-6">
            {/* Marcador */}
            <div className="flex items-center space-x-3">
              <span className="text-2xl font-bold">{teamScore}</span>
              <span className="text-2xl">–</span>
              <Button
                size="icon"
                variant="outline"
                onClick={() => setOpponentScore((s) => Math.max(0, s - 1))}
                disabled={opponentScore === 0}
              >
                –  
              </Button>
              <span className="text-2xl font-bold">{opponentScore}</span>
              <Button
                size="icon"
                variant="outline"
                onClick={() => setOpponentScore((s) => s + 1)}
              >
                +  
              </Button>
            </div>
            {/* Timer y finalizar */}
            <Button
              onClick={toggleTimer}
              variant={isRunning ? "destructive" : "default"}
              size="lg"
              className="text-lg h-12"
            >
              {isRunning ? <Pause className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
              {isRunning ? "Pausar" : "Reanudar"}
            </Button>
            <Button onClick={saveMatch} size="lg" className="text-lg h-12">
              <Save className="mr-2 h-5 w-5" />
              Finalizar
            </Button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 p-4 overflow-auto">
        <div className="grid grid-cols-1 gap-4">
          {/* Cronómetro y Sustituciones */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Cronómetro</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold text-center">{formatTime(elapsedTime)}</div>
              </CardContent>
            </Card>

            <Card className="col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Sustituciones</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-between items-center">
                <div className="text-lg">
                  <div>Jugadores en cancha: <span className="font-bold">{playingPlayers.length}</span></div>
                  <div>Jugadores en banca: <span className="font-bold">{benchPlayers.length}</span></div>
                </div>
                <Dialog open={substitutionDialogOpen} onOpenChange={setSubstitutionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="text-lg h-12">
                      <RefreshCw className="mr-2 h-5 w-5" />
                      Realizar Sustitución
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-xl">Realizar Sustitución</DialogTitle>
                      <DialogDescription className="text-lg">Selecciona el jugador que sale y el que entra</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                      <div className="grid gap-2">
                        <Label className="text-lg">Jugador que Sale</Label>
                        <Select onValueChange={value => setPlayerOut(Number(value))}>
                          <SelectTrigger className="h-12 text-lg">
                            <SelectValue placeholder="Selecciona un jugador" />
                          </SelectTrigger>
                          <SelectContent>
                            {playingPlayers.map(player => (
                              <SelectItem key={player.matchPlayerId} value={player.matchPlayerId.toString()} className="text-lg">
                                {player.number} - {player.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-lg">Jugador que Entra</Label>
                        <Select onValueChange={value => setPlayerIn(Number(value))}>
                          <SelectTrigger className="h-12 text-lg">
                            <SelectValue placeholder="Selecciona un jugador" />
                          </SelectTrigger>
                          <SelectContent>
                            {benchPlayers.map(player => (
                              <SelectItem key={player.matchPlayerId} value={player.matchPlayerId.toString()} className="text-lg">
                                {player.number} - {player.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={makeSubstitution} size="lg" className="text-lg">
                        Confirmar Sustitución
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>

          {/* Jugadores en Cancha */}
          <Card>
            <CardHeader className="p-2">
              <CardTitle className="text-xl">Jugadores en Cancha</CardTitle>
            </CardHeader>
            
           <CardContent className="overflow-x-auto">
    <Table  className="min-w-full divide-y divide-border">
      {/* 1) Encabezados */}
      <TableHeader className="bg-muted/70">
        <TableRow>
          <TableHead className="w-[60px] text-lg p-2">Núm.</TableHead>
          <TableHead className="w-[100px] text-lg p-2">Jugador</TableHead>
          <TableHead className="w-[80px] text-center text-lg p-2" >Tiempo</TableHead>
          <TableHead className="text-center p-2">Goles</TableHead>
          <TableHead className="text-center p-2">Asist.</TableHead>
          <TableHead className="text-center p-2">SA</TableHead>
          <TableHead className="text-center p-2">SF</TableHead>
          <TableHead className="text-center p-2">Perd.</TableHead>
          <TableHead className="text-center p-2">Recup.</TableHead>
          <TableHead className="text-center p-2">F.C.</TableHead>
          <TableHead className="text-center p-2">F.R.</TableHead>
          <TableHead className="text-center p-2">Amar.</TableHead>
          <TableHead className="text-center p-2">Roja</TableHead>
        </TableRow>
      </TableHeader>

      {/* 2) Filas */}
      <TableBody>
        {playingPlayers.map((player) => (
          <TableRow key={player.matchPlayerId}>
            {/* Núm. */}
            <TableCell className="text-lg font-bold">
              {player.number}
            </TableCell>

            {/* Jugador (más estrecho) */}
            <TableCell className="text-sm font-medium">
              {player.name}
            </TableCell>

            {/* Tiempo */}
            <TableCell className="text-center text-lg ">
              {formatTime(player.stats.playTime)}
            </TableCell>

            {/* Estadísticas: ícono + valor debajo */}
            {[
              ["goals",           <Volleyball />],
              ["assists",         <Hand />],
              ["shotsOnGoal",     <Target />],
              ["shotsOffTarget",  <Slash />],
              ["turnovers",       <XCircle />],
              ["recoveries",      <Shield />],
              ["foulsCommitted",  <Frown />],
              ["foulsReceived",   <Smile />],
              ["yellowCards",     <AlertTriangle />],
              ["redCards",        <AlertOctagon />],
            ].map(([key, icon]) => (
              <TableCell key={key as string} className="text-center">
                <div className="flex flex-col items-center space-y-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="p-2 active:scale-95 transition-transform duration-150"
                    onClick={() =>
                      incrementStat(player.matchPlayerId, key as any)
                    }
                  >
                    {icon}
                  </Button>
                  <span className="text-sm">
                    {/* @ts-ignore */}
                    {player.stats[key as keyof typeof player.stats]}
                  </span>
                </div>
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </CardContent>
          </Card>

          {/* Jugadores en Banca */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Jugadores en Banca</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px] text-lg">Núm.</TableHead>
                    <TableHead className="text-lg">Jugador</TableHead>
                    <TableHead className="text-center text-lg">Tiempo</TableHead>
                    <TableHead className="text-center text-lg">Goles</TableHead>
                    <TableHead className="text-center text-lg">Asistencias</TableHead>
                    <TableHead className="text-center text-lg">SA (Arco)</TableHead>
                    <TableHead className="text-center text-lg">SF (Fuera)</TableHead>
                    <TableHead className="text-center text-lg">Pérdidas</TableHead>
                    <TableHead className="text-center text-lg">Recuperos</TableHead>
                    <TableHead className="text-center text-lg">Faltas C.</TableHead>
                    <TableHead className="text-center text-lg">Faltas R.</TableHead>
                    <TableHead className="text-center text-lg">Amarilla</TableHead>
                    <TableHead className="text-center text-lg">Roja</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {benchPlayers.map((player) => (
                    <TableRow key={player.matchPlayerId}>
                      <TableCell className="text-lg font-bold">{player.number}</TableCell>
                      <TableCell>
                        <div className="text-lg font-medium">{player.name}</div>
                        <div className="text-sm text-muted-foreground">{player.position}</div>
                      </TableCell>
                      <TableCell className="text-center text-lg">
                        {formatTime(player.stats.playTime)}
                      </TableCell>
                      <TableCell className="text-center text-lg font-bold">
                        {player.stats.goals}
                      </TableCell>
                      <TableCell className="text-center text-lg font-bold">
                        {player.stats.assists}
                      </TableCell>
                      <TableCell className="text-center text-lg font-bold">
                        {player.stats.shotsOnGoal}
                      </TableCell>
                      <TableCell className="text-center text-lg font-bold">
                        {player.stats.shotsOffTarget}
                      </TableCell>
                      <TableCell className="text-center text-lg font-bold">
                        {player.stats.turnovers}
                      </TableCell>
                      <TableCell className="text-center text-lg font-bold">
                        {player.stats.recoveries}
                      </TableCell>
                      <TableCell className="text-center text-lg font-bold">
                        {player.stats.foulsCommitted}
                      </TableCell>
                      <TableCell className="text-center text-lg font-bold">
                        {player.stats.foulsReceived}
                      </TableCell>
                      <TableCell className="text-center text-lg font-bold">
                        {player.stats.yellowCards}
                      </TableCell>
                      <TableCell className="text-center text-lg font-bold">
                        {player.stats.redCards}
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
  );
}
