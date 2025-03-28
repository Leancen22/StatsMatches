// app/dashboard/field/page.tsx
"use client";

import React from "react";
import FieldBoard from "./FieldBoard";


export default function FieldPage() {
  return (
    <div className="flex h-screen flex-col">
     

      {/* CONTENIDO */}
        

        {/* MAIN */}
        <main className="flex-1">
        <FieldBoard />
      </main>
    </div>
  );
}
