import React from "react"
import { Metadata, Viewport } from "next"

export const metadata: Metadata = {
  title: "Chiosco Paziente | Cosmedic"
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function TabletLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "#f8fafc", 
      display: "flex", 
      flexDirection: "column",
      // Questi stili disabilitano la selezione del testo per un'esperienza "app" nativa
      WebkitUserSelect: "none",
      userSelect: "none"
    }}>
      {/* Header Chiosco Minimal */}
      <header style={{
        background: "white",
        padding: "24px 40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid #e2e8f0",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ 
            width: "48px", 
            height: "48px", 
            background: "var(--primary)", 
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
            fontSize: "24px"
          }}>C</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "24px", color: "var(--text-main)", letterSpacing: "1px" }}>COSMEDIC</div>
            <div style={{ fontSize: "14px", color: "var(--primary)", fontWeight: 600 }}>Portale Paziente</div>
          </div>
        </div>
      </header>
      
      {/* Main Content Area */}
      <main style={{ flex: 1, position: "relative" }}>
        {children}
      </main>
    </div>
  )
}
