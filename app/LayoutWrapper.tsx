"use client"

import { usePathname } from "next/navigation"
import Sidebar from "./Sidebar"
import CommandPalette from "./components/CommandPalette"

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Se siamo nella landing page o nel percorso tablet, non mostriamo la sidebar desktop
  const isTablet = pathname?.startsWith("/tablet")
  const isLanding = pathname === "/"

  if (isTablet || isLanding) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--content-bg)" }}>
        <CommandPalette />
        {children}
      </div>
    )
  }

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <main style={{ 
        flex: 1, 
        marginLeft: "260px", 
        minHeight: "100vh",
        background: "var(--content-bg)"
      }}>
        <CommandPalette />
        {children}
      </main>
    </div>
  )
}
