"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "../../../lib/supabaseClient"
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Fingerprint, 
  MapPin, 
  Phone, 
  Mail,
  ClipboardList,
  PenTool,
  Plus,
  ChevronRight,
  Download,
  Stethoscope
} from "lucide-react"

export default function TabletDoctorPatientDetails() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const [patient, setPatient] = useState<any>(null)
  const [procedures, setProcedures] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) { loadPatient(); loadProcedures() }
  }, [id])

  async function loadPatient() {
    const { data } = await supabase.from("patients").select("*").eq("id", id).single()
    setPatient(data)
    setLoading(false)
  }

  async function loadProcedures() {
    const { data } = await supabase.from("procedures").select("*").eq("patient_id", id).order("procedure_date", {ascending:false})
    setProcedures(data || [])
  }

  if (loading) return <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Caricamento...</div>
  if (!patient) return <div style={{ padding: "40px", color: "red" }}>Paziente non trovato</div>

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#f8fafc" }}>
      {/* Header */}
      <div style={{ padding: "16px 24px", background: "white", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "16px" }}>
        <button onClick={() => router.push("/tablet/doctor")} style={{ border: "none", background: "transparent", color: "#64748b" }}>
          <ArrowLeft size={24} />
        </button>
        <h1 style={{ fontSize: "18px", fontWeight: 700 }}>Dettaglio Paziente</h1>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
        {/* Patient Info Card */}
        <div style={{ background: "white", borderRadius: "16px", padding: "20px", marginBottom: "24px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "14px", background: "var(--primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: 700 }}>
              {patient.name[0]}{patient.surname[0]}
            </div>
            <div>
              <h2 style={{ fontSize: "20px", fontWeight: 800 }}>{patient.name} {patient.surname}</h2>
              <p style={{ fontSize: "13px", color: "#64748b" }}>{patient.fiscal_code || "Codice Fiscale N/D"}</p>
            </div>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "12px" }}>
              <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>Telefono</div>
              <div style={{ fontSize: "14px", fontWeight: 600 }}>{patient.phone || "—"}</div>
            </div>
            <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "12px" }}>
              <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>Nascita</div>
              <div style={{ fontSize: "14px", fontWeight: 600 }}>{patient.birthdate || "—"}</div>
            </div>
          </div>
        </div>

        {/* Action: Send to Signature Tablet */}
        <button 
          onClick={() => router.push(`/tablet/patient/${id}`)}
          style={{ 
            width: "100%", 
            padding: "20px", 
            borderRadius: "16px", 
            background: "#7c3aed", 
            color: "white", 
            border: "none", 
            fontWeight: 700, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            gap: "12px",
            marginBottom: "32px",
            boxShadow: "0 4px 6px -1px rgba(124, 58, 237, 0.2)"
          }}>
          <PenTool size={22} />
          PREPARA FIRME (CONSEGNA TABLET)
        </button>

        {/* Procedures List */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b" }}>Interventi e Procedure</h3>
            <button style={{ color: "var(--primary)", fontSize: "14px", fontWeight: 600, border: "none", background: "transparent" }}>+ Aggiungi</button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {procedures.map(p => (
              <div key={p.id} style={{ background: "white", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>
                  <Stethoscope size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontWeight: 700, fontSize: "15px" }}>{p.procedure_type}</span>
                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>{new Date(p.procedure_date).toLocaleDateString("it-IT")}</span>
                  </div>
                  <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>{p.notes || "Nessuna nota."}</p>
                </div>
              </div>
            ))}
            {procedures.length === 0 && <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>Nessuna procedura.</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
