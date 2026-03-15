"use client"

import { usePathname } from "next/navigation"
import Sidebar from "./Sidebar"

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Se siamo nel percorso tablet, non mostriamo la sidebar desktop
  const isTablet = pathname?.startsWith("/tablet")

  if (isTablet) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--content-bg)" }}>
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
        {children}
      </main>
    </div>
  )
}
