"use client";

import React, { useState, useEffect, useRef } from "react";
import { Stage, Layer, Rect, Circle, Line, Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import { Button } from "@/components/ui/button";

// Jugadores iniciales (cada uno con su color)
const initialPlayers = [
  { id: 1, x: 50, y: 50, name: "Jugador 1", color: "blue" },
  { id: 2, x: 50, y: 120, name: "Jugador 2", color: "black" },
  { id: 3, x: 50, y: 190, name: "Jugador 3", color: "orange" },
  { id: 4, x: 50, y: 260, name: "Jugador 4", color: "purple" },
  { id: 5, x: 50, y: 330, name: "Jugador 5", color: "red" },
];

export default function FieldBoard() {
  // Referencia al contenedor para medir dimensiones
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [pixelRatio, setPixelRatio] = useState(1);

  // Actualizamos las dimensiones del contenedor (ideal para tablet horizontal)
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
    setPixelRatio(window.devicePixelRatio || 1);
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // El Stage ocupará todo el espacio disponible del contenedor
  const stageWidth = dimensions.width;
  const stageHeight = dimensions.height;

  // En este ejemplo, el "tablero" (campo) ocupará todo el Stage
  const boardX = 0;
  const boardY = 0;
  const boardWidth = stageWidth;
  const boardHeight = stageHeight;

  // Cargamos la imagen de fondo (colócala en public/campo.jpg o ajusta la ruta)
  const backgroundUrl = "/campo.jpg";
  const [bgImage] = useImage(backgroundUrl);

  // Estados locales para jugadores, líneas y herramienta
  const [players, setPlayers] = useState(initialPlayers);
  const [tool, setTool] = useState<"select" | "pencil">("select");
  const [lines, setLines] = useState<number[][]>([]);
  const [currentLine, setCurrentLine] = useState<number[]>([]);
  const [brushThickness, setBrushThickness] = useState(4);
  const [brushColor, setBrushColor] = useState("red");

  // Actualiza la posición de un jugador al terminar de arrastrarlo
  const handleDragEnd = (e: any, id: number) => {
    const { x, y } = e.target.position();
    setPlayers((prev) =>
      prev.map((player) =>
        player.id === id ? { ...player, x, y } : player
      )
    );
  };

  // Funciones para el modo lápiz
  const handleMouseDown = (e: any) => {
    if (tool !== "pencil") return;
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    if (pos) setCurrentLine([pos.x, pos.y]);
  };

  const handleMouseMove = (e: any) => {
    if (tool !== "pencil" || currentLine.length === 0) return;
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    if (pos) setCurrentLine([...currentLine, pos.x, pos.y]);
  };

  const handleMouseUp = () => {
    if (tool !== "pencil") return;
    if (currentLine.length > 0) {
      setLines([...lines, currentLine]);
      setCurrentLine([]);
    }
  };

  // Función para borrar todas las líneas dibujadas
  const clearLines = () => {
    setLines([]);
  };

  return (
    <div ref={containerRef} className="w-full h-full bg-gray-100">
      {/* Barra de herramientas */}
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
        <Button onClick={clearLines} variant="outline">
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
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
        pixelRatio={pixelRatio}
        className="border"
      >
        {/* Capa 1: Fondo del tablero */}
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
            <Rect
              x={boardX}
              y={boardY}
              width={boardWidth}
              height={boardHeight}
              fill="#f0f0f0"
            />
          )}
        </Layer>

        {/* Capa 2: Líneas dibujadas */}
        <Layer>
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line}
              stroke={brushColor}
              strokeWidth={brushThickness}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
            />
          ))}
          {currentLine.length > 0 && (
            <Line
              points={currentLine}
              stroke={brushColor}
              strokeWidth={brushThickness}
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
              radius={20}
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
