import Link from "next/link"
import { Button } from "@/components/ui/button"
import DarkModeToggle from "@/components/DarkModeToggle"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-lg font-semibold">Handball Stats Tracker</h1>
          
          <nav className="ml-auto flex gap-4">
          <div className="mt-auto">
                      <DarkModeToggle />
                    </div>
            <Link href="/login">
              <Button>Iniciar Sesión</Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Estadísticas de Handball
                </h2>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                  Registra y analiza el rendimiento de tus jugadores en tiempo real. Accede al historial de partidos y
                  estadísticas individuales.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/login">
                  <Button size="lg">Comenzar</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-center gap-4 px-4 text-center md:px-6">
          <p className="text-sm text-gray-500">© 2025 Handball Stats Tracker. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}

