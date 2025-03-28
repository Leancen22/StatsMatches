// app/dashboard/field/page.tsx
"use client";

import React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import FieldBoard from "./FieldBoard";
import {
  LogOut,
  BarChart2,
  Users,
  TrendingUp,
  BarChart,
} from "lucide-react";

export default function FieldPage() {
  return (
    <div className="flex min-h-screen flex-col">
     

      {/* CONTENIDO */}
      <div className="flex flex-1">
        

        {/* MAIN */}
        <main className="flex-1 p-4 md:p-6 flex items-center justify-center">
          {/* Contenedor del tablero centrado */}
          <div className="w-full h-full">
            <FieldBoard />
          </div>
        </main>
      </div>
    </div>
  );
}
