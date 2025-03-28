"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  LogOut,
  BarChart2,
  Users,
  TrendingUp,
  BarChart,
  Eye,
  Mail as MailIcon
} from "lucide-react";
import DarkModeToggle from "@/components/DarkModeToggle"; // Asegúrate de tener este componente

export default function MassEmailPage() {
  // Estados del formulario
  const [toEmail, setToEmail] = useState("");
  const [toName, setToName] = useState("");
  const [subject, setSubject] = useState("");
  const [text, setText] = useState("");
  const [html, setHtml] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Enviando...");
    try {
      const res = await fetch("/api/mass-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toEmails: toEmail, toName, subject, text, html }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("Correo enviado exitosamente!");
      } else {
        setStatus("Error al enviar correo: " + data.error);
      }
    } catch (error: any) {
      console.error("Error al enviar correo:", error);
      setStatus("Error al enviar correo");
    }
  };

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
                Análisis de Campo
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
          <div className="p-8">
            <header className="border-b pb-4 mb-4">
              <h1 className="text-2xl font-bold">Enviar Convocatoria</h1>
              <nav className="mt-2">
                <Link href="/dashboard" className="text-blue-600 hover:underline">
                  ← Volver al Dashboard
                </Link>
              </nav>
            </header>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">
                  Emails de los Jugadores (separados por coma)
                </label>
                <input
                  type="text"
                  value={toEmail}
                  onChange={(e) => setToEmail(e.target.value)}
                  className="border rounded px-2 py-1 w-full"
                  placeholder="email1@example.com, email2@example.com"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Nombre del Jugador</label>
                <input
                  type="text"
                  value={toName}
                  onChange={(e) => setToName(e.target.value)}
                  className="border rounded px-2 py-1 w-full"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Asunto</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="border rounded px-2 py-1 w-full"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Mensaje (Texto)</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="border rounded px-2 py-1 w-full"
                  rows={4}
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Mensaje (HTML)</label>
                <textarea
                  value={html}
                  onChange={(e) => setHtml(e.target.value)}
                  className="border rounded px-2 py-1 w-full"
                  rows={4}
                />
              </div>
              <Button type="submit">Enviar Correo</Button>
            </form>
            {status && <p className="mt-4 font-medium">{status}</p>}
          </div>
        </main>
      </div>
    </div>
  );
}
