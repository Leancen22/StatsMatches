"use client";

import React, { useState, useEffect, useRef } from "react";
import { Stage, Layer, Rect, Circle, Line, Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import { Button } from "@/components/ui/button";

// Jugadores iniciales (cada uno con color asignado)
const initialPlayers = [
  { id: 1, x: 20, y: 50, name: "Jugador 1", color: "blue" },
  { id: 2, x: 20, y: 120, name: "Jugador 2", color: "black" },
  { id: 3, x: 20, y: 190, name: "Jugador 3", color: "orange" },
  { id: 4, x: 20, y: 260, name: "Jugador 4", color: "purple" },
  { id: 5, x: 20, y: 330, name: "Jugador 5", color: "red" },
];

// Definición del tipo para las líneas dibujadas
type DrawnLine = {
  points: number[];
  color: string;
  thickness: number;
};

export default function FieldBoard() {
  // Ref del contenedor para medir dimensiones
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Actualiza dimensiones al montar y en resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Las dimensiones del Stage serán las del contenedor
  const stageWidth = dimensions.width;
  const stageHeight = dimensions.height;

  // En este ejemplo, el "tablero" es el Stage completo, y la imagen de fondo lo cubre
  const boardX = 0;
  const boardY = 0;
  const boardWidth = stageWidth;
  const boardHeight = stageHeight;

  // Cargamos la imagen de fondo (colócala en public/campo.jpg o ajusta la ruta)
  const backgroundUrl = "/campo.jpg";
  const [bgImage] = useImage(backgroundUrl);

  // Estados para jugadores, líneas dibujadas y herramienta actual
  const [players, setPlayers] = useState(initialPlayers);
  // tool: "select" para mover jugadores, "pencil" para dibujar
  const [tool, setTool] = useState<"select" | "pencil">("select");
  // Líneas ya dibujadas (cada línea guarda su color y grosor)
  const [lines, setLines] = useState<DrawnLine[]>([]);
  // Línea en dibujo actual, con puntos, color y grosor
  const [currentLine, setCurrentLine] = useState<DrawnLine | null>(null);
  // Configuración del pincel (para la herramienta lápiz)
  const [brushThickness, setBrushThickness] = useState(4);
  const [brushColor, setBrushColor] = useState("red");

  // Actualiza la posición de un jugador tras arrastrarlo
  const handleDragEnd = (e: any, id: number) => {
    const { x, y } = e.target.position();
    setPlayers((prev) =>
      prev.map((player) => (player.id === id ? { ...player, x, y } : player))
    );
  };

  // Funciones para modo lápiz (compatible con mouse y touch)
  const startDrawing = (e: any) => {
    if (tool !== "pencil") return;
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    if (pos) {
      setCurrentLine({ points: [pos.x, pos.y], color: brushColor, thickness: brushThickness });
    }
  };

  const continueDrawing = (e: any) => {
    if (tool !== "pencil" || !currentLine) return;
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    if (pos) {
      setCurrentLine({
        ...currentLine,
        points: [...currentLine.points, pos.x, pos.y],
      });
    }
  };

  const finishDrawing = () => {
    if (tool !== "pencil" || !currentLine) return;
    setLines([...lines, currentLine]);
    setCurrentLine(null);
  };

  return (
    <div ref={containerRef} className="w-full h-screen bg-gray-100">
      {/* Barra de herramientas (puedes personalizarla) */}
      <div className="p-4 flex flex-wrap gap-4 justify-center">
        <Button
          onClick={() => setTool("select")}
          variant={tool === "select" ? "default" : "outline"}
        >
          Mover Jugadores
        </Button>
        <Button
          onClick={() => setTool("pencil")}
          variant={tool === "pencil" ? "default" : "outline"}
        >
          Lápiz
        </Button>
        <Button onClick={() => setLines([])} variant="outline">
          Borrar Dibujo
        </Button>
        <div className="flex items-center gap-2">
          <span>Grosor:</span>
          <Button onClick={() => setBrushThickness(2)}>2</Button>
          <Button onClick={() => setBrushThickness(4)}>4</Button>
          <Button onClick={() => setBrushThickness(6)}>6</Button>
        </div>
        <div className="flex items-center gap-2">
          <span>Color:</span>
          <Button
            onClick={() => setBrushColor("red")}
            style={{ backgroundColor: "red", color: "white" }}
          >
            Rojo
          </Button>
          <Button
            onClick={() => setBrushColor("blue")}
            style={{ backgroundColor: "blue", color: "white" }}
          >
            Azul
          </Button>
          <Button
            onClick={() => setBrushColor("black")}
            style={{ backgroundColor: "black", color: "white" }}
          >
            Negro
          </Button>
        </div>
      </div>

      {/* Stage que ocupa todo el contenedor */}
      <Stage
        width={stageWidth}
        height={stageHeight}
        // Soporte para eventos táctiles y de mouse
        onMouseDown={startDrawing}
        onTouchStart={startDrawing}
        onMouseMove={continueDrawing}
        onTouchMove={continueDrawing}
        onMouseUp={finishDrawing}
        onTouchEnd={finishDrawing}
        pixelRatio={window.devicePixelRatio || 1}
        style={{ border: "1px solid #ddd" }}
      >
        {/* Capa 1: Fondo del tablero (imagen de fondo o rectángulo de respaldo) */}
        <Layer>
          {bgImage ? (
            <KonvaImage
              image={bgImage}
              x={boardX}
              y={boardY}
              width={boardWidth}
              height={boardHeight}
            />
          ) : (
            <Rect x={boardX} y={boardY} width={boardWidth} height={boardHeight} fill="#f0f0f0" />
          )}
        </Layer>

        {/* Capa 2: Líneas dibujadas */}
        <Layer>
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke={line.color}
              strokeWidth={line.thickness}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
            />
          ))}
          {currentLine && (
            <Line
              points={currentLine.points}
              stroke={currentLine.color}
              strokeWidth={currentLine.thickness}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
            />
          )}
        </Layer>

        {/* Capa 3: Jugadores */}
        <Layer>
          {players.map((player) => (
            <Circle
              key={player.id}
              x={player.x}
              y={player.y}
              radius={30}
              fill={player.color}
              draggable={tool === "select"}
              onDragEnd={(e) => handleDragEnd(e, player.id)}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}
