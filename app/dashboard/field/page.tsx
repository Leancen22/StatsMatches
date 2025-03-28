"use client";

import React from "react";
import FieldBoard from "../field/FieldBoard"; // Asegúrate de que la ruta sea la correcta
import { Button } from "@/components/ui/button";
import { LogOut, BarChart2, Users, TrendingUp, BarChart } from "lucide-react";
import Link from "next/link";

export default function FieldPage() {
  return (
    <div className="flex flex-col h-screen">
      
      {/* MAIN: Tablero que ocupa todo el espacio */}
      <main className="flex-1">
        <FieldBoard />
      </main>
    </div>
  );
}
