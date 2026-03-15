"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  BarChart3, 
  Settings,
  LogOut,
  UserCircle
} from "lucide-react"

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/" },
  { name: "Pazienti", icon: Users, href: "/patients" },
  { name: "Appuntamenti", icon: Calendar, href: "#", comingSoon: true },
  { name: "Report", icon: BarChart3, href: "#", comingSoon: true },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside style={{
      width: "260px",
      background: "var(--sidebar-bg)",
      color: "white",
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      position: "fixed",
      left: 0,
      top: 0,
      padding: "24px 16px"
    }}>
      {/* Logo */}
      <div style={{ padding: "0 12px", marginBottom: "40px", display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ 
          width: "32px", 
          height: "32px", 
          background: "var(--primary)", 
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold",
          fontSize: "18px"
        }}>C</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: "16px", letterSpacing: "0.5px" }}>COSMEDIC</div>
          <div style={{ fontSize: "10px", color: "var(--sidebar-text)" }}>Clinic Management</div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1 }}>
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
          return (
            <Link 
              key={item.name} 
              href={item.href} 
              onClick={(e) => {
                if (item.comingSoon) {
                  e.preventDefault()
                  alert("Funzionalità in arrivo presto!")
                }
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px",
                borderRadius: "8px",
                textDecoration: "none",
                color: isActive ? "white" : "var(--sidebar-text)",
                background: isActive ? "var(--sidebar-hover)" : "transparent",
                marginBottom: "4px",
                fontSize: "14px",
                fontWeight: isActive ? 600 : 400,
                transition: "all 0.2s",
                opacity: item.comingSoon ? 0.6 : 1
              }}
            >
              <item.icon size={20} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Footer / User info */}
      <div style={{ 
        borderTop: "1px solid #1f2937", 
        paddingTop: "24px",
        display: "flex",
        alignItems: "center",
        gap: "12px"
      }}>
        <div style={{ 
          width: "36px", 
          height: "36px", 
          background: "#0d9488", 
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontWeight: "bold",
          fontSize: "14px"
        }}>DC</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "13px", fontWeight: 600 }}>Dr. Cosmedic</div>
          <div style={{ fontSize: "11px", color: "var(--sidebar-text)" }}>Amministratore</div>
        </div>
      </div>
    </aside>
  )
}
