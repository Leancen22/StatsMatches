// app/dashboard/match/live/page.tsx
import { Suspense } from "react"
import LiveClientComponent from "./live-client"

export default function Page() {
  return (
    <div>
      <h1 style={{ padding: 16, fontSize: 24 }}>Partido en Vivo</h1>
      <Suspense fallback={<div style={{ padding: 16 }}>Cargando Live Match...</div>}>
        <LiveClientComponent />
      </Suspense>
    </div>
  )
}
