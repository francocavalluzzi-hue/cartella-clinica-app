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
  Download,
  Stethoscope,
  Check,
  CheckCircle2
} from "lucide-react"
import { MODULI } from "../../../../lib/constants"


export default function TabletDoctorPatientDetails() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const [patient, setPatient] = useState<any>(null)
  const [procedures, setProcedures] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedModules, setSelectedModules] = useState<number[]>([0, 1]) // Default selective items
  const [signedDocuments, setSignedDocuments] = useState<number[]>([])


  useEffect(() => {
    if (id) { 
      loadPatient(); 
      loadProcedures();
      loadSignedDocuments();
      
      const channel = supabase
        .channel(`patient_docs_${id}`)
        .on("postgres_changes", {
          event: "INSERT",
          schema: "public",
          table: "documents",
          filter: `patient_id=eq.${id}`
        }, (payload: any) => {
          setSignedDocuments(prev => [...prev, payload.new.document_type])
        })
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    }
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

  async function loadSignedDocuments() {
    const { data } = await supabase.from("documents").select("document_type").eq("patient_id", id)
    if (data) setSignedDocuments(data.map(d => d.document_type))
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

        {/* Selective Module Assignment */}
        <div style={{ background: "white", borderRadius: "16px", padding: "24px", marginBottom: "24px", border: "1px solid #e2e8f0" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <ClipboardList size={18} /> SELEZIONA DOCUMENTI DA FIRMARE
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px" }}>
            {MODULI.map((m: any) => (
              <label key={m.id} style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "12px", 
                padding: "12px", 
                borderRadius: "10px", 
                background: selectedModules.includes(m.id) ? "var(--primary-light)" : "#f8fafc",
                border: "1px solid",
                borderColor: selectedModules.includes(m.id) ? "var(--primary)" : "#e2e8f0",
                cursor: "pointer",
                transition: "all 0.2s"
              }}>
                <input 
                  type="checkbox" 
                  checked={selectedModules.includes(m.id)}
                  onChange={() => {
                    setSelectedModules(prev => 
                      prev.includes(m.id) ? prev.filter(id => id !== m.id) : [...prev, m.id]
                    )
                  }}
                  style={{ width: "20px", height: "20px", accentColor: "var(--primary)" }}
                />
                <span style={{ fontSize: "14px", fontWeight: 600, color: selectedModules.includes(m.id) ? "var(--primary)" : "#475569" }}>
                  {m.nome} <span style={{ fontSize: "11px", fontWeight: 400, color: "#94a3b8" }}>({m.quando})</span>
                </span>
                {signedDocuments.includes(m.id) ? (
                  <div style={{ marginLeft: "auto", background: "#f0fdf4", color: "#16a34a", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 800, display: "flex", alignItems: "center", gap: "4px", border: "1px solid #bbf7d0" }}>
                    <CheckCircle2 size={12} /> FIRMATO
                  </div>
                ) : selectedModules.includes(m.id) && (
                  <Check size={16} style={{ marginLeft: "auto", color: "var(--primary)" }} />
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Action: Send to Signature Tablet */}
        <button 
          onClick={() => {
            if (selectedModules.length === 0) return alert("Seleziona almeno un documento")
            router.push(`/tablet/patient/${id}?modules=${selectedModules.join(",")}`)
          }}
          style={{ 
            width: "100%", 
            padding: "22px", 
            borderRadius: "16px", 
            background: "var(--primary)", 
            color: "white", 
            border: "none", 
            fontWeight: 800, 
            fontSize: "16px",
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            gap: "12px",
            marginBottom: "32px",
            boxShadow: "0 10px 15px -3px rgba(15, 118, 110, 0.3)",
            cursor: "pointer"
          }}>
          <PenTool size={22} />
          CONSEGNA TABLET PER FIRMA ({selectedModules.length})
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
