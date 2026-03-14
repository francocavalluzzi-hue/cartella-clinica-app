"use client"

import { useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient"
import { 
  Users, 
  Plus, 
  UserPlus
} from "lucide-react"
import Link from "next/link"

export default function PatientsPage() {
  const [patients, setPatients] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name:"", surname:"", birthdate:"", fiscal_code:"", phone:"", email:"", address:"", city:"", cap:"", country:"" })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadPatients() }, [])

  async function loadPatients() {
    setLoading(true)
    const { data } = await supabase.from("patients").select("*").order("created_at", {ascending:false})
    setPatients(data || [])
    setLoading(false)
  }

  async function savePatient() {
    if (!form.name || !form.surname) return alert("Nome e cognome obbligatori")
    setSaving(true)
    await supabase.from("patients").insert([form])
    setForm({ name:"", surname:"", birthdate:"", fiscal_code:"", phone:"", email:"", address:"", city:"", cap:"", country:"" })
    setShowForm(false)
    setSaving(false)
    loadPatients()
  }

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
          <h1 style={{ fontSize: "24px", marginBottom: "4px" }}>Gestione Pazienti</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Aggiungi e visualizza i pazienti della clinica</p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <div style={{ 
            background: "white", 
            border: "1px solid var(--border)", 
            borderRadius: "8px",
            padding: "8px 16px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "13px",
            color: "var(--text-muted)"
          }}>
            <Users size={16} />
            {patients.length} Pazienti
          </div>
        </div>
      </header>

      {/* Form Card */}
      <div className="card" style={{ marginBottom: "32px", border: showForm ? "2px solid var(--primary)" : "1px solid var(--border)" }}>
        <div 
          onClick={() => setShowForm(!showForm)}
          style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            cursor: "pointer" 
          }}
        >
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
              <UserPlus size={20} />
            </div>
            <h2 style={{ fontSize: "16px" }}>Nuovo Paziente</h2>
          </div>
          <button style={{ 
            background: showForm ? "var(--sidebar-hover)" : "var(--primary)", 
            color: "white", 
            border: "none", 
            borderRadius: "50%", 
            width: "32px", 
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            {showForm ? "✕" : <Plus size={20} />}
          </button>
        </div>

        {showForm && (
          <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid var(--border)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" }}>
              {[
                {label:"Nome", key:"name", type:"text", placeholder:"Inserisci nome"},
                {label:"Cognome", key:"surname", type:"text", placeholder:"Inserisci cognome"},
                {label:"Email", key:"email", type:"email", placeholder:"email@esempio.com"},
                {label:"Telefono", key:"phone", type:"text", placeholder:"3331234567"},
                {label:"Data di Nascita", key:"birthdate", type:"date"},
                {label:"Codice Fiscale", key:"fiscal_code", type:"text", placeholder:"Codice Fiscale"},
                {label:"Indirizzo", key:"address", type:"text", placeholder:"Via..."},
                {label:"Città", key:"city", type:"text", placeholder:"Città"},
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-main)", marginBottom: "8px" }}>{f.label}</label>
                  <input
                    type={f.type}
                    placeholder={f.placeholder}
                    value={(form as any)[f.key]}
                    onChange={e => setForm({...form, [f.key]: e.target.value})}
                    style={{
                      width: "100%",
                      background: "#f9fafb",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      padding: "12px 16px",
                      fontSize: "14px",
                      outline: "none"
                    }}
                  />
                </div>
              ))}
            </div>
            <div style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
              <button 
                onClick={savePatient} 
                disabled={saving}
                className="btn-primary"
                style={{ padding: "12px 24px" }}
              >
                {saving ? "Salvataggio..." : "Aggiungi Paziente"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* List Card */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "12px" }}>
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
          <h2 style={{ fontSize: "16px" }}>Elenco Pazienti</h2>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb", borderBottom: "1px solid var(--border)" }}>
              <th style={{ padding: "12px 24px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>ID</th>
              <th style={{ padding: "12px 24px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>Nome Completo</th>
              <th style={{ padding: "12px 24px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>Email</th>
              <th style={{ padding: "12px 24px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>Telefono</th>
              <th style={{ padding: "12px 24px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>Data di Nascita</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>Caricamento pazienti...</td></tr>
            ) : (
              patients.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "16px 24px", fontSize: "13px", fontWeight: 500, color: "var(--primary)" }}>P00{i+1}</td>
                  <td style={{ padding: "16px 24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ 
                        width: "32px", 
                        height: "32px", 
                        borderRadius: "50%", 
                        background: i % 2 === 0 ? "#0d9488" : "#3b82f6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "13px",
                        fontWeight: "bold"
                      }}>{p.name[0]}{p.surname[0]}</div>
                      <Link href={`/patients/${p.id}`} style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-main)", textDecoration: "none" }}>
                        {p.name} {p.surname}
                      </Link>
                    </div>
                  </td>
                  <td style={{ padding: "16px 24px", fontSize: "13px", color: "var(--text-muted)" }}>{p.email || "—"}</td>
                  <td style={{ padding: "16px 24px", fontSize: "13px", color: "var(--text-muted)" }}>{p.phone || "—"}</td>
                  <td style={{ padding: "16px 24px", fontSize: "13px", color: "var(--text-muted)" }}>{p.birthdate || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
