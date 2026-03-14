"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "../lib/supabaseClient"
import { 
  Users, 
  TrendingUp, 
  Clock, 
  ArrowUpRight, 
  Plus, 
  MoreHorizontal,
  Search,
  Filter
} from "lucide-react"

export default function Home() {
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadPatients() }, [])

  async function loadPatients() {
    setLoading(true)
    const { data } = await supabase.from("patients").select("*").order("created_at", {ascending:false})
    setPatients(data || [])
    setLoading(false)
  }

  const stats = [
    { name: "Pazienti Totali", value: patients.length, trend: "+12%", icon: Users, color: "#0d9488" },
    { name: "Appuntamenti Oggi", value: "8", detail: "3 in attesa", icon: Clock, color: "#f59e0b" },
    { name: "Nuovi Questa Settimana", value: "12", trend: "+5", icon: TrendingUp, color: "#ef4444" },
  ]

  return (
    <div style={{ padding: "32px" }}>
      {/* Header */}
      <header style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "32px" 
      }}>
        <div>
          <h1 style={{ fontSize: "24px", marginBottom: "4px" }}>Dashboard</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Panoramica completa della tua clinica</p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ 
            background: "white", 
            border: "1px solid var(--border)", 
            borderRadius: "20px",
            padding: "4px 12px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            color: "#0d9488",
            fontWeight: 600
          }}>
            <div style={{ width: "8px", height: "8px", background: "#22c55e", borderRadius: "50%" }}></div>
            Online
          </div>
          <Link href="/patients" style={{ 
            textDecoration: "none", 
            background: "var(--primary)", 
            color: "white", 
            padding: "10px 18px", 
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <Plus size={18} />
            Nuovo Paziente
          </Link>
        </div>
      </header>

      {/* Stats Grid */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(3, 1fr)", 
        gap: "24px", 
        marginBottom: "32px" 
      }}>
        {stats.map((s) => (
          <div key={s.name} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ color: "var(--text-muted)", fontSize: "13px", fontWeight: 500, marginBottom: "4px" }}>{s.name}</div>
              {s.trend && (
                <div style={{ color: "#22c55e", fontSize: "12px", display: "flex", alignItems: "center", gap: "2px", marginBottom: "12px" }}>
                  <ArrowUpRight size={14} /> {s.trend}
                </div>
              )}
              {s.detail && <div style={{ color: "var(--text-muted)", fontSize: "12px", marginBottom: "12px" }}>{s.detail}</div>}
              <div style={{ fontSize: "32px", fontWeight: 700 }}>{s.value}</div>
            </div>
            <div style={{ 
              width: "44px", 
              height: "44px", 
              borderRadius: "10px", 
              background: `${s.color}10`, 
              color: s.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <s.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Patients Table */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ 
          padding: "20px 24px", 
          borderBottom: "1px solid var(--border)", 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center" 
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ 
              width: "36px", 
              height: "36px", 
              background: "var(--primary-light)", 
              color: "var(--primary)", 
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <Users size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: "15px" }}>Pazienti Recenti</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "12px" }}>Ultimi pazienti registrati</p>
            </div>
          </div>
          <Link href="/patients" style={{ 
            color: "var(--text-muted)", 
            fontSize: "13px", 
            textDecoration: "none",
            fontWeight: 500
          }}>Vedi Tutti</Link>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb", borderBottom: "1px solid var(--border)" }}>
              <th style={{ padding: "12px 24px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>ID</th>
              <th style={{ padding: "12px 24px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>Nome</th>
              <th style={{ padding: "12px 24px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>Età</th>
              <th style={{ padding: "12px 24px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>Ultima Visita</th>
              <th style={{ padding: "12px 24px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>Stato</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>Caricamento pazienti...</td></tr>
            ) : patients.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>Nessun paziente trovato</td></tr>
            ) : (
              patients.slice(0, 5).map((p, i) => (
                <tr key={p.id} style={{ borderBottom: i === patients.length - 1 ? "none" : "1px solid var(--border)" }}>
                  <td style={{ padding: "16px 24px", fontSize: "13px", fontWeight: 500, color: "var(--primary)" }}>P00{i+1}</td>
                  <td style={{ padding: "16px 24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ 
                        width: "28px", 
                        height: "28px", 
                        borderRadius: "50%", 
                        background: i % 2 === 0 ? "#0d9488" : "#3b82f6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "12px",
                        fontWeight: "bold"
                      }}>{p.name[0]}{p.surname[0]}</div>
                      <Link href={`/patients/${p.id}`} style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-main)", textDecoration: "none" }}>
                        {p.name} {p.surname}
                      </Link>
                    </div>
                  </td>
                  <td style={{ padding: "16px 24px", fontSize: "13px", color: "#4b5563" }}>
                    {p.birthdate ? `${new Date().getFullYear() - new Date(p.birthdate).getFullYear()} anni` : "—"}
                  </td>
                  <td style={{ padding: "16px 24px", fontSize: "13px", color: "#4b5563" }}>{new Date(p.created_at).toLocaleDateString("it-IT")}</td>
                  <td style={{ padding: "16px 24px" }}>
                    <div style={{ 
                      background: "#f0fdf4", 
                      color: "#166534", 
                      padding: "2px 10px", 
                      borderRadius: "20px", 
                      fontSize: "11px", 
                      fontWeight: 600,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px"
                    }}>
                      <div style={{ width: "4px", height: "4px", background: "#22c55e", borderRadius: "50%" }}></div>
                      Attivo
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <footer style={{ marginTop: "40px", textAlign: "center", fontSize: "11px", color: "var(--text-muted)" }}>
        © 2026 COSMEDIC SW — Gestione clinica intelligente
      </footer>
    </div>
  )
}