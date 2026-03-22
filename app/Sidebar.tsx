"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from 'react'
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
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const s = typeof window !== 'undefined' ? localStorage.getItem('theme') : null
      if (s === 'dark' || s === 'light') return s as 'dark' | 'light'
      return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    } catch (e) { return 'light' }
  })

  useEffect(() => {
    try {
      if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark')
        localStorage.setItem('theme', 'dark')
      } else {
        document.documentElement.removeAttribute('data-theme')
        localStorage.setItem('theme', 'light')
      }
    } catch (e) {}
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

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
      padding: "20px 12px"
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
                gap: "14px",
                padding: "14px",
                minHeight: '48px',
                borderRadius: "var(--radius-sm)",
                textDecoration: "none",
                color: isActive ? "white" : "var(--sidebar-text)",
                background: isActive ? "var(--sidebar-hover)" : "transparent",
                marginBottom: "6px",
                fontSize: "15px",
                fontWeight: isActive ? 700 : 500,
                transition: "transform 0.12s, background 0.12s",
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
                opacity: item.comingSoon ? 0.6 : 1
              }}
            >
              <item.icon size={22} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Footer / User info */}
      <div style={{ 
        borderTop: "1px solid #1f2937", 
        paddingTop: "18px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        justifyContent: 'space-between'
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
        {/* Theme toggle */}
        <button onClick={toggleTheme} aria-label="Toggle theme" style={{
          background: 'transparent',
          border: '1px solid var(--border)',
          color: 'var(--sidebar-text)',
          padding: '8px',
          borderRadius: '8px',
          cursor: 'pointer'
        }}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </aside>
  )
}
