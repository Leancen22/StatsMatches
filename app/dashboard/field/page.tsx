"use client";
import dynamic from "next/dynamic";
import React from "react";

const FieldBoard = dynamic(() => import("../field/FieldBoard"), {
  ssr: false,
  loading: () => <div>Cargando tablero...</div>,
});

export default function FieldPage() {
  return (
    <div className="flex flex-col h-screen">
     
      {/* CONTENIDO: Tablero ocupando todo el espacio */}
      <main className="flex-1">
        <FieldBoard />
      </main>
    </div>
  );
}
