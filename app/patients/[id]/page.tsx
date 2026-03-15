"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "../../../lib/supabaseClient"
import jsPDF from "jspdf"
import { 
  ArrowLeft, 
  FileText, 
  Plus, 
  User, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  Fingerprint,
  Stethoscope,
  ClipboardList,
  ChevronRight,
  Download,
  PenTool,
  Edit3,
  Trash2
} from "lucide-react"

export default function PatientPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const [patient, setPatient] = useState<any>(null)
  const [procedures, setProcedures] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [showProcedureForm, setShowProcedureForm] = useState(false)
  const [savingProcedure, setSavingProcedure] = useState(false)
  const [editingProcedureId, setEditingProcedureId] = useState<string | null>(null)
  const [procedureForm, setProcedureForm] = useState({
    procedure_type: "",
    procedure_date: "",
    notes: "",
    anesthesia: "",
    duration: "",
    complications: ""
  })

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

  async function saveProcedure() {
    if (!procedureForm.procedure_type || !procedureForm.procedure_date) return alert("Tipo intervento e data obbligatori")
    setSavingProcedure(true)
    
    if (editingProcedureId) {
      await supabase.from("procedures").update({
        procedure_type: procedureForm.procedure_type,
        procedure_date: procedureForm.procedure_date,
        notes: procedureForm.notes,
      }).eq("id", editingProcedureId)
    } else {
      await supabase.from("procedures").insert([{
        patient_id: id,
        procedure_type: procedureForm.procedure_type,
        procedure_date: procedureForm.procedure_date,
        notes: procedureForm.notes,
      }])
    }
    
    resetProcedureForm()
    loadProcedures()
  }

  async function deleteProcedure(procId: string) {
    if (!confirm("Sei sicuro di voler eliminare questo intervento? Questa azione è irreversibile.")) return
    await supabase.from("procedures").delete().eq("id", procId)
    loadProcedures()
  }

  function startEditProcedure(proc: any) {
    setProcedureForm({
      procedure_type: proc.procedure_type || "",
      procedure_date: proc.procedure_date || "",
      notes: proc.notes || "",
      anesthesia: proc.anesthesia || "",
      duration: proc.duration || "",
      complications: proc.complications || ""
    })
    setEditingProcedureId(proc.id)
    setShowProcedureForm(true)
  }

  function resetProcedureForm() {
    setProcedureForm({ procedure_type:"", procedure_date:"", notes:"", anesthesia:"", duration:"", complications:"" })
    setEditingProcedureId(null)
    setShowProcedureForm(false)
    setSavingProcedure(false)
  }

  async function generatePDF() {
    if (!patient) return
    setGeneratingPdf(true)
    const doc = new jsPDF({ orientation:"portrait", unit:"mm", format:"a4" })
    const pageW = 210
    const margin = 20
    let y = 20

    doc.setFillColor(13, 148, 136) // Cosmedic Teal
    doc.rect(0, 0, pageW, 40, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    doc.text("CARTELLA CLINICA", margin, 18)
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text("COSMEDIC — Gestione Clinica Intelligente", margin, 28)
    doc.text(`Data Documento: ${new Date().toLocaleDateString("it-IT")}`, margin, 35)
    y = 55

    doc.setFillColor(243, 244, 246)
    doc.rect(margin, y, pageW-margin*2, 8, "F")
    doc.setTextColor(13, 148, 136)
    doc.setFontSize(11)
    doc.setFont("helvetica", "bold")
    doc.text("DATI ANAGRAFICI", margin+3, y+5.5)
    y += 14

    const anagrafica = [
      ["Nome", patient.name], ["Cognome", patient.surname],
      ["Data di Nascita", patient.birthdate||"—"], ["Codice Fiscale", patient.fiscal_code||"—"],
      ["Telefono", patient.phone||"—"], ["Email", patient.email||"—"],
      ["Indirizzo", patient.address||"—"], ["Città", patient.city||"—"],
    ]
    anagrafica.forEach(([label, value]) => {
      doc.setFont("helvetica","bold"); doc.setTextColor(107, 114, 128); doc.setFontSize(10)
      doc.text(label+":", margin, y)
      doc.setFont("helvetica","normal"); doc.setTextColor(17, 24, 39)
      doc.text(value, margin+45, y); y += 7
    })
    y += 8

    doc.setFillColor(243, 244, 246)
    doc.rect(margin, y, pageW-margin*2, 8, "F")
    doc.setTextColor(13, 148, 136); doc.setFontSize(11); doc.setFont("helvetica","bold")
    doc.text("INTERVENTI REGISTRATI", margin+3, y+5.5); y += 14

    if (procedures.length === 0) {
      doc.setTextColor(107, 114, 128); doc.setFontSize(10); doc.setFont("helvetica","italic")
      doc.text("Nessun intervento registrato", margin, y); y += 10
    } else {
      procedures.forEach((p) => {
        doc.setFont("helvetica","bold"); doc.setTextColor(17, 24, 39); doc.setFontSize(10)
        doc.text(`• ${p.procedure_type} — ${p.procedure_date}`, margin, y); y += 6
        if (p.notes) {
          doc.setFont("helvetica","normal"); doc.setTextColor(107, 114, 128)
          doc.text(`  Note: ${p.notes}`, margin, y); y += 6
        }
        y += 2
      })
    }
    y += 8

    doc.setFillColor(243, 244, 246)
    doc.rect(margin, y, pageW-margin*2, 8, "F")
    doc.setTextColor(13, 148, 136); doc.setFontSize(11); doc.setFont("helvetica","bold")
    doc.text("FIRME DI VALIDAZIONE", margin+3, y+5.5); y += 20
    doc.setTextColor(107, 114, 128); doc.setFontSize(10); doc.setFont("helvetica","normal")
    doc.line(margin, y, margin+70, y)
    doc.line(pageW-margin-70, y, pageW-margin, y); y += 5
    doc.text("Firma del Paziente", margin, y)
    doc.text("Firma del Medico", pageW-margin-60, y)

    doc.setFillColor(17, 24, 39)
    doc.rect(0, 285, pageW, 12, "F")
    doc.setTextColor(156, 163, 175); doc.setFontSize(8)
    doc.text(`Cosmedic SW — Paziente: ${patient.name} ${patient.surname} — Generata il ${new Date().toLocaleDateString("it-IT")}`, margin, 292)

    doc.save(`cartella-clinica-${patient.surname}-${patient.name}.pdf`)
    setGeneratingPdf(false)
  }

  if (loading) return <div style={{ padding: 40, color: "var(--text-muted)" }}>Caricamento...</div>
  if (!patient) return <div style={{ padding: 40, color: "var(--danger)" }}>Paziente non trovato</div>

  const interventoTypes = [
    "Rinoplastica", "Blefaroplastica", "Lifting facciale", "Otoplastica",
    "Mastoplastica additiva", "Mastoplastica riduttiva", "Mastopexi",
    "Addominoplastica", "Liposuzione", "Lipoaddizione", "BBL",
    "Blefaroplastica superiore", "Blefaroplastica inferiore",
    "Lipofilling viso", "Mentoplastica", "Altro"
  ]

  return (
    <div style={{ padding: "32px" }}>
      {/* Header Info */}
      <header style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "flex-start", 
        marginBottom: "32px" 
      }}>
        <div style={{ display: "flex", gap: "24px" }}>
          <div style={{ 
            width: "80px", 
            height: "80px", 
            borderRadius: "16px", 
            background: "var(--primary)", 
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "32px",
            fontWeight: 700,
            boxShadow: "0 10px 15px -3px rgba(13, 148, 136, 0.2)"
          }}>{patient.name[0]}{patient.surname[0]}</div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <h1 style={{ fontSize: "28px" }}>{patient.name} {patient.surname}</h1>
              <div style={{ 
                background: "#f0fdf4", 
                color: "#166534", 
                padding: "2px 10px", 
                borderRadius: "20px", 
                fontSize: "12px", 
                fontWeight: 600
              }}>Paziente Attivo</div>
            </div>
            <div style={{ display: "flex", gap: "20px", color: "var(--text-muted)", fontSize: "14px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><Fingerprint size={16} /> {patient.fiscal_code || "N/A"}</span>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><Calendar size={16} /> {patient.birthdate || "N/A"}</span>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><MapPin size={16} /> {patient.city || "N/A"}</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={generatePDF} disabled={generatingPdf} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Download size={18} />
            {generatingPdf ? "Generazione..." : "Esporta PDF"}
          </button>
          <button onClick={() => router.push(`/patients/${id}/documents`)} className="btn-primary" style={{ background: "#7c3aed", display: "flex", alignItems: "center", gap: "8px" }}>
            <PenTool size={18} />
            Punto Firme
          </button>
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "32px" }}>
        {/* Main Content: Procedures */}
        <div>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
             <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "36px", height: "36px", background: "var(--primary-light)", color: "var(--primary)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Stethoscope size={20} />
                  </div>
                  <h2 style={{ fontSize: "16px" }}>Interventi e Procedure</h2>
                </div>
                 {!showProcedureForm && (
                  <button onClick={() => { resetProcedureForm(); setShowProcedureForm(true); }} style={{ color: "var(--primary)", background: "transparent", border: "none", fontWeight: 600, fontSize: "14px", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Plus size={18} /> Aggiungi
                  </button>
                )}
             </div>

             {showProcedureForm && (
               <div style={{ padding: "24px", background: "#f9fafb", borderBottom: "1px solid var(--border)" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "16px", color: "var(--text-main)" }}>
                    {editingProcedureId ? "Modifica Intervento" : "Nuovo Intervento"}
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "8px" }}>Tipo Intervento</label>
                      <select 
                        value={procedureForm.procedure_type}
                        onChange={e => setProcedureForm({...procedureForm, procedure_type:e.target.value})}
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)" }}>
                        <option value="">Seleziona...</option>
                        {interventoTypes.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "8px" }}>Data</label>
                      <input type="date" 
                        value={procedureForm.procedure_date}
                        onChange={e => setProcedureForm({...procedureForm, procedure_date:e.target.value})}
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)" }} />
                    </div>
                  </div>
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "8px" }}>Note Cliniche</label>
                    <textarea 
                      value={procedureForm.notes}
                      onChange={e => setProcedureForm({...procedureForm, notes:e.target.value})}
                      placeholder="Inserisci dettagli..."
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", minHeight: "80px" }} />
                  </div>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <button onClick={saveProcedure} disabled={savingProcedure} className="btn-primary">
                      {savingProcedure ? "Salvataggio..." : (editingProcedureId ? "Aggiorna Intervento" : "Salva Intervento")}
                    </button>
                    <button onClick={resetProcedureForm} style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px 20px", fontSize: "14px" }}>Annulla</button>
                  </div>
               </div>
             )}

             <div style={{ padding: "8px 0" }}>
                {procedures.length === 0 ? (
                  <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>Nessun intervento registrato per questo paziente.</div>
                ) : (
                  procedures.map((p) => (
                    <div key={p.id} style={{ padding: "20px 24px", display: "flex", gap: "20px", borderBottom: "1px solid var(--border)", alignItems: "flex-start" }}>
                      <div style={{ width: "48px", height: "48px", borderRadius: "10px", background: "white", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)", flexShrink: 0 }}>
                        <ClipboardList size={22} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                          <h4 style={{ fontSize: "15px", fontWeight: 700 }}>{p.procedure_type}</h4>
                          <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 500 }}>{new Date(p.procedure_date).toLocaleDateString("it-IT")}</span>
                        </div>
                        <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.5", marginBottom: "12px" }}>{p.notes || "Nessuna nota aggiuntiva."}</p>
                        
                        <div style={{ display: "flex", gap: "16px", marginTop: "8px" }}>
                          <button onClick={() => startEditProcedure(p)} style={{ background: "transparent", border: "none", color: "var(--primary)", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px", cursor: "pointer", padding: 0 }}>
                            <Edit3 size={14} /> Modifica
                          </button>
                          <button onClick={() => deleteProcedure(p.id)} style={{ background: "transparent", border: "none", color: "var(--danger)", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px", cursor: "pointer", padding: 0 }}>
                            <Trash2 size={14} /> Elimina
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
             </div>
          </div>
        </div>

        {/* Sidebar Info: Demography */}
        <div>
          <div className="card" style={{ marginBottom: "24px" }}>
             <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                <Edit3 size={18} color="var(--primary)" />
                <h3 style={{ fontSize: "15px" }}>Contatti e Recapiti</h3>
             </div>
             <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", gap: "12px" }}>
                  <div style={{ color: "var(--primary)", width: "32px" }}><Phone size={18} /></div>
                  <div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Telefono</div>
                    <div style={{ fontSize: "14px", fontWeight: 500 }}>{patient.phone || "—"}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <div style={{ color: "var(--primary)", width: "32px" }}><Mail size={18} /></div>
                  <div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Email</div>
                    <div style={{ fontSize: "14px", fontWeight: 500 }}>{patient.email || "—"}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <div style={{ color: "var(--primary)", width: "32px" }}><MapPin size={18} /></div>
                  <div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Indirizzo</div>
                    <div style={{ fontSize: "14px", fontWeight: 500 }}>{patient.address || patient.city ? `${patient.address || ""}, ${patient.city || ""}` : "—"}</div>
                  </div>
                </div>
             </div>
          </div>
          
          <div className="card" style={{ background: "var(--primary)", color: "white" }}>
            <h3 style={{ color: "white", fontSize: "15px", marginBottom: "12px" }}>Prossima Visita</h3>
            <p style={{ opacity: 0.9, fontSize: "13px", marginBottom: "16px" }}>Nessun appuntamento programmato al momento.</p>
            <button style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "none", background: "rgba(255,255,255,0.2)", color: "white", fontWeight: 600, fontSize: "13px" }}>
              Pianifica Ora
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}