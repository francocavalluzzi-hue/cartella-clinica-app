"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "../../../lib/supabaseClient"
import { 
  ArrowLeft, 
  Search, 
  User, 
  Calendar, 
  Phone, 
  ClipboardList,
  PenTool,
  ChevronRight,
  Plus,
  ArrowRight,
  Filter
} from "lucide-react"

export default function TabletDoctorDashboard() {
  const router = useRouter()
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  
  // State for Registration Modal
  const [showRegModal, setShowRegModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: "",
    surname: "",
    birthdate: "",
    fiscal_code: "",
    phone: "",
    email: "",
    address: "",
    city: "",
  })

  useEffect(() => {
    loadPatients()
  }, [])

  async function loadPatients() {
    setLoading(true)
    const { data } = await supabase.from("patients").select("*").order("surname")
    setPatients(data || [])
    setLoading(false)
  }

  async function handleRegister() {
    if (!form.name || !form.surname) return alert("Nome e Cognome sono obbligatori")
    setSaving(true)
    try {
      const res = await fetch("/api/tablet/register-patient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || "Errore durante il salvataggio")
      
      alert("Paziente registrato con successo!")
      setShowRegModal(false)
      setForm({ name: "", surname: "", birthdate: "", fiscal_code: "", phone: "", email: "", address: "", city: "" })
      loadPatients()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  const filtered = patients.filter(p => 
    `${p.name} ${p.surname}`.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>Caricamento...</div>

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#f8fafc" }}>
      {/* Tablet Dr Header */}
      <header style={{ padding: "20px 24px", background: "white", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a" }}>Doctor Panel</h1>
          <p style={{ fontSize: "12px", color: "#64748b" }}>Gestione Pazienti Mobile</p>
        </div>
        <button onClick={() => router.push("/")} style={{ padding: "10px 16px", borderRadius: "10px", background: "#f1f5f9", border: "none", fontSize: "13px", fontWeight: 600, color: "#475569" }}>
          Versione Desktop
        </button>
      </header>

      {/* Search Bar - Big for Tablet */}
      <div style={{ padding: "20px 24px" }}>
        <div style={{ position: "relative" }}>
          <Search size={22} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input 
            type="text"
            placeholder="Cerca paziente per nome o cognome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: "100%", 
              padding: "18px 18px 18px 54px", 
              borderRadius: "16px", 
              border: "1px solid #e2e8f0", 
              fontSize: "16px",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
              outline: "none"
            }}
          />
        </div>
      </div>

      {/* Patient List Table-Card Style */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 40px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filtered.map(p => (
            <div key={p.id} 
              onClick={() => router.push(`/tablet/doctor/${p.id}`)}
              style={{ 
                background: "white", 
                padding: "20px", 
                borderRadius: "16px", 
                display: "flex", 
                alignItems: "center", 
                gap: "16px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
              }}>
              <div style={{ 
                width: "56px", 
                height: "56px", 
                borderRadius: "12px", 
                background: "var(--primary-light)", 
                color: "var(--primary)", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                fontSize: "20px",
                fontWeight: 700
              }}>
                {p.name[0]}{p.surname[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b", marginBottom: "4px" }}>{p.name} {p.surname}</div>
                <div style={{ display: "flex", gap: "16px", fontSize: "13px", color: "#64748b" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Calendar size={14} /> {p.birthdate || "N/D"}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Phone size={14} /> {p.phone || "N/D"}</span>
                </div>
              </div>
              <ChevronRight size={20} color="#cbd5e1" />
            </div>
          ))}

          {filtered.length === 0 && (
            <div style={{ padding: "60px", textAlign: "center", color: "#64748b" }}>
              Nessun paziente trovato.
            </div>
          )}
        </div>
      </div>

      {/* Mobile Footer Actions */}
      <div style={{ padding: "16px 24px", background: "white", borderTop: "1px solid #e2e8f0", display: "flex", gap: "12px" }}>
        <button 
          onClick={() => setShowRegModal(true)}
          style={{ flex: 1, padding: "16px", borderRadius: "12px", background: "var(--primary)", color: "white", border: "none", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
          <Plus size={20} /> Nuovo Paziente
        </button>
        <button style={{ padding: "16px", borderRadius: "12px", background: "#f1f5f9", border: "none", color: "#475569" }}>
          <Filter size={20} />
        </button>
      </div>

      {/* Registration Modal Tablet */}
      {showRegModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "white", width: "100%", maxWidth: "600px", borderRadius: "24px", overflow: "hidden", display: "flex", flexDirection: "column", maxHeight: "90vh", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
            <div style={{ padding: "24px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 800 }}>Nuovo Paziente</h2>
              <button onClick={() => setShowRegModal(false)} style={{ border: "none", background: "transparent", fontSize: "24px", color: "#64748b" }}>×</button>
            </div>
            
            <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", marginBottom: "6px", display: "block" }}>NOME</label>
                  <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "16px" }} placeholder="Es. Mario" />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", marginBottom: "6px", display: "block" }}>COGNOME</label>
                  <input type="text" value={form.surname} onChange={e => setForm({...form, surname: e.target.value})} style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "16px" }} placeholder="Es. Rossi" />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", marginBottom: "6px", display: "block" }}>DATA NASCITA</label>
                  <input type="date" value={form.birthdate} onChange={e => setForm({...form, birthdate: e.target.value})} style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "16px" }} />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", marginBottom: "6px", display: "block" }}>CODICE FISCALE</label>
                  <input type="text" value={form.fiscal_code} onChange={e => setForm({...form, fiscal_code: e.target.value})} style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "16px" }} placeholder="RSSMRA..." />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", marginBottom: "6px", display: "block" }}>TELEFONO</label>
                <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "16px" }} placeholder="333..." />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", marginBottom: "6px", display: "block" }}>EMAIL</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "16px" }} placeholder="mario@email.com" />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", marginBottom: "6px", display: "block" }}>INDIRIZZO</label>
                  <input type="text" value={form.address} onChange={e => setForm({...form, address: e.target.value})} style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "16px" }} placeholder="Via..." />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", marginBottom: "6px", display: "block" }}>CITTÀ</label>
                  <input type="text" value={form.city} onChange={e => setForm({...form, city: e.target.value})} style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "16px" }} placeholder="Milano" />
                </div>
              </div>
            </div>

            <div style={{ padding: "24px", borderTop: "1px solid #e2e8f0", display: "flex", gap: "12px" }}>
              <button onClick={() => setShowRegModal(false)} style={{ flex: 1, padding: "16px", borderRadius: "12px", background: "#f1f5f9", color: "#475569", border: "none", fontWeight: 700 }}>ANNULLA</button>
              <button 
                onClick={handleRegister}
                disabled={saving}
                style={{ flex: 2, padding: "16px", borderRadius: "12px", background: "var(--primary)", color: "white", border: "none", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", opacity: saving ? 0.7 : 1 }}>
                {saving ? "REGISTRAZIONE..." : "AGGIUNGI PAZIENTE"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
