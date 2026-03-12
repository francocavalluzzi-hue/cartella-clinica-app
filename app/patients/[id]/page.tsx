"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "../../../lib/supabaseClient"
import jsPDF from "jspdf"

export default function PatientPage() {
  const { id } = useParams()
  const router = useRouter()
  const [patient, setPatient] = useState<any>(null)
  const [procedures, setProcedures] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [showProcedureForm, setShowProcedureForm] = useState(false)
  const [savingProcedure, setSavingProcedure] = useState(false)
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
    await supabase.from("procedures").insert([{
      patient_id: id,
      procedure_type: procedureForm.procedure_type,
      procedure_date: procedureForm.procedure_date,
      notes: procedureForm.notes,
    }])
    setProcedureForm({ procedure_type:"", procedure_date:"", notes:"", anesthesia:"", duration:"", complications:"" })
    setShowProcedureForm(false)
    setSavingProcedure(false)
    loadProcedures()
  }

  async function generatePDF() {
    if (!patient) return
    setGeneratingPdf(true)
    const doc = new jsPDF({ orientation:"portrait", unit:"mm", format:"a4" })
    const pageW = 210
    const margin = 20
    let y = 20

    doc.setFillColor(15, 23, 42)
    doc.rect(0, 0, pageW, 40, "F")
    doc.setTextColor(56, 189, 248)
    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    doc.text("CARTELLA CLINICA", margin, 18)
    doc.setTextColor(148, 163, 184)
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text("Dr. Franco Cavalluzzi — Chirurgia Estetica", margin, 28)
    doc.text(`Data: ${new Date().toLocaleDateString("it-IT")}`, margin, 35)
    y = 55

    doc.setFillColor(30, 41, 59)
    doc.rect(margin, y, pageW-margin*2, 8, "F")
    doc.setTextColor(56, 189, 248)
    doc.setFontSize(11)
    doc.setFont("helvetica", "bold")
    doc.text("DATI ANAGRAFICI", margin+3, y+5.5)
    y += 14

    const anagrafica = [
      ["Nome", patient.name], ["Cognome", patient.surname],
      ["Data di Nascita", patient.birthdate||"—"], ["Codice Fiscale", patient.fiscal_code||"—"],
      ["Telefono", patient.phone||"—"], ["Email", patient.email||"—"],
      ["Indirizzo", patient.address||"—"],
    ]
    anagrafica.forEach(([label, value]) => {
      doc.setFont("helvetica","bold"); doc.setTextColor(100,116,139); doc.setFontSize(10)
      doc.text(label+":", margin, y)
      doc.setFont("helvetica","normal"); doc.setTextColor(15,23,42)
      doc.text(value, margin+45, y); y += 7
    })
    y += 8

    doc.setFillColor(30,41,59)
    doc.rect(margin, y, pageW-margin*2, 8, "F")
    doc.setTextColor(56,189,248); doc.setFontSize(11); doc.setFont("helvetica","bold")
    doc.text("INTERVENTI CHIRURGICI", margin+3, y+5.5); y += 14

    if (procedures.length === 0) {
      doc.setTextColor(100,116,139); doc.setFontSize(10); doc.setFont("helvetica","italic")
      doc.text("Nessun intervento registrato", margin, y); y += 10
    } else {
      procedures.forEach((p) => {
        doc.setFont("helvetica","bold"); doc.setTextColor(15,23,42); doc.setFontSize(10)
        doc.text(`• ${p.procedure_type} — ${p.procedure_date}`, margin, y); y += 6
        if (p.notes) {
          doc.setFont("helvetica","normal"); doc.setTextColor(100,116,139)
          doc.text(`  Note: ${p.notes}`, margin, y); y += 6
        }
        y += 2
      })
    }
    y += 8

    doc.setFillColor(30,41,59)
    doc.rect(margin, y, pageW-margin*2, 8, "F")
    doc.setTextColor(56,189,248); doc.setFontSize(11); doc.setFont("helvetica","bold")
    doc.text("PRESCRIZIONI POST-OPERATORIE", margin+3, y+5.5); y += 14
    doc.setTextColor(15,23,42); doc.setFontSize(10); doc.setFont("helvetica","normal")
    doc.text("Farmaco: _________________________ Dose: _________ Frequenza: _________", margin, y); y += 7
    doc.text("Farmaco: _________________________ Dose: _________ Frequenza: _________", margin, y); y += 7
    y += 8

    if (y > 230) { doc.addPage(); y = 20 }
    doc.setFillColor(30,41,59)
    doc.rect(margin, y, pageW-margin*2, 8, "F")
    doc.setTextColor(56,189,248); doc.setFontSize(11); doc.setFont("helvetica","bold")
    doc.text("FIRME", margin+3, y+5.5); y += 20
    doc.setTextColor(15,23,42); doc.setFontSize(10); doc.setFont("helvetica","normal")
    doc.line(margin, y, margin+70, y)
    doc.line(pageW-margin-70, y, pageW-margin, y); y += 5
    doc.setTextColor(100,116,139)
    doc.text("Firma del Paziente", margin, y)
    doc.text("Firma del Medico", pageW-margin-60, y)
    doc.setFillColor(15,23,42)
    doc.rect(0, 282, pageW, 15, "F")
    doc.setTextColor(148,163,184); doc.setFontSize(8)
    doc.text(`Cartella Clinica — ${patient.name} ${patient.surname} — Generata il ${new Date().toLocaleDateString("it-IT")}`, margin, 290)

    doc.save(`cartella-clinica-${patient.surname}-${patient.name}.pdf`)
    setGeneratingPdf(false)
  }

  if (loading) return <div style={{background:"#0f172a", minHeight:"100vh", color:"white", padding:40}}>Caricamento...</div>
  if (!patient) return <div style={{background:"#0f172a", minHeight:"100vh", color:"white", padding:40}}>Paziente non trovato</div>

  const interventoTypes = [
    "Rinoplastica", "Blefaroplastica", "Lifting facciale", "Otoplastica",
    "Mastoplastica additiva", "Mastoplastica riduttiva", "Mastopexi",
    "Addominoplastica", "Liposuzione", "Lipoaddizione", "BBL",
    "Blefaroplastica superiore", "Blefaroplastica inferiore",
    "Lipofilling viso", "Mentoplastica", "Altro"
  ]

  return (
    <div style={{minHeight:"100vh", background:"#0f172a", color:"white", fontFamily:"sans-serif"}}>
      <div style={{background:"#1e293b", padding:"16px 32px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:"1px solid #334155"}}>
        <div style={{display:"flex", alignItems:"center", gap:16}}>
          <button onClick={() => router.push("/")}
            style={{background:"#334155", color:"white", border:"none", borderRadius:8, padding:"8px 16px", cursor:"pointer", fontSize:14}}>
            ← Dashboard
          </button>
          <h1 style={{margin:0, fontSize:20, fontWeight:700, color:"#38bdf8"}}>🏥 Cartella Clinica</h1>
        </div>
        <span style={{color:"#94a3b8", fontSize:14}}>Dr. Franco Cavalluzzi</span>
      </div>

      <div style={{padding:32}}>
        <div style={{marginBottom:32}}>
          <div style={{color:"#94a3b8", fontSize:13, marginBottom:4}}>Scheda Paziente</div>
          <h2 style={{margin:0, fontSize:28, fontWeight:700}}>{patient.name} {patient.surname}</h2>
        </div>

        <div style={{background:"#1e293b", borderRadius:12, padding:24, marginBottom:24}}>
          <h3 style={{margin:"0 0 20px", fontSize:15, fontWeight:600, color:"#38bdf8"}}>📋 Dati Anagrafici</h3>
          <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20}}>
            {[
              {label:"Nome", value:patient.name}, {label:"Cognome", value:patient.surname},
              {label:"Data di Nascita", value:patient.birthdate||"—"},
              {label:"Codice Fiscale", value:patient.fiscal_code||"—"},
              {label:"Telefono", value:patient.phone||"—"}, {label:"Email", value:patient.email||"—"},
              {label:"Indirizzo", value:patient.address||"—"},
            ].map(f => (
              <div key={f.label}>
                <div style={{color:"#94a3b8", fontSize:12, marginBottom:4}}>{f.label}</div>
                <div style={{fontSize:15, fontWeight:500}}>{f.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* FORM INTERVENTO */}
        {showProcedureForm && (
          <div style={{background:"#1e293b", borderRadius:12, padding:24, marginBottom:24, border:"1px solid #38bdf8"}}>
            <h3 style={{margin:"0 0 20px", fontSize:15, fontWeight:600, color:"#38bdf8"}}>🔪 Nuovo Intervento</h3>
            <div style={{display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:16}}>
              <div>
                <label style={{display:"block", color:"#94a3b8", fontSize:13, marginBottom:6}}>Tipo Intervento *</label>
                <select
                  value={procedureForm.procedure_type}
                  onChange={e => setProcedureForm({...procedureForm, procedure_type:e.target.value})}
                  style={{width:"100%", background:"#0f172a", border:"1px solid #334155", borderRadius:8, padding:"10px 12px", color:"white", fontSize:14}}>
                  <option value="">— Seleziona —</option>
                  {interventoTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{display:"block", color:"#94a3b8", fontSize:13, marginBottom:6}}>Data Intervento *</label>
                <input type="date"
                  value={procedureForm.procedure_date}
                  onChange={e => setProcedureForm({...procedureForm, procedure_date:e.target.value})}
                  style={{width:"100%", background:"#0f172a", border:"1px solid #334155", borderRadius:8, padding:"10px 12px", color:"white", fontSize:14, boxSizing:"border-box"}}
                />
              </div>
              <div>
                <label style={{display:"block", color:"#94a3b8", fontSize:13, marginBottom:6}}>Tipo Anestesia</label>
                <select
                  value={procedureForm.anesthesia}
                  onChange={e => setProcedureForm({...procedureForm, anesthesia:e.target.value})}
                  style={{width:"100%", background:"#0f172a", border:"1px solid #334155", borderRadius:8, padding:"10px 12px", color:"white", fontSize:14}}>
                  <option value="">— Seleziona —</option>
                  <option>Locale</option>
                  <option>Locale + Sedazione</option>
                  <option>Generale</option>
                </select>
              </div>
              <div>
                <label style={{display:"block", color:"#94a3b8", fontSize:13, marginBottom:6}}>Durata (minuti)</label>
                <input type="number"
                  value={procedureForm.duration}
                  onChange={e => setProcedureForm({...procedureForm, duration:e.target.value})}
                  style={{width:"100%", background:"#0f172a", border:"1px solid #334155", borderRadius:8, padding:"10px 12px", color:"white", fontSize:14, boxSizing:"border-box"}}
                />
              </div>
              <div style={{gridColumn:"span 2"}}>
                <label style={{display:"block", color:"#94a3b8", fontSize:13, marginBottom:6}}>Note Operatorie</label>
                <textarea
                  value={procedureForm.notes}
                  onChange={e => setProcedureForm({...procedureForm, notes:e.target.value})}
                  rows={3}
                  style={{width:"100%", background:"#0f172a", border:"1px solid #334155", borderRadius:8, padding:"10px 12px", color:"white", fontSize:14, boxSizing:"border-box", resize:"vertical"}}
                />
              </div>
              <div style={{gridColumn:"span 2"}}>
                <label style={{display:"block", color:"#94a3b8", fontSize:13, marginBottom:6}}>Complicanze</label>
                <input type="text"
                  value={procedureForm.complications}
                  onChange={e => setProcedureForm({...procedureForm, complications:e.target.value})}
                  placeholder="Nessuna"
                  style={{width:"100%", background:"#0f172a", border:"1px solid #334155", borderRadius:8, padding:"10px 12px", color:"white", fontSize:14, boxSizing:"border-box"}}
                />
              </div>
            </div>
            <div style={{marginTop:20, display:"flex", gap:12}}>
              <button onClick={saveProcedure} disabled={savingProcedure}
                style={{background:"#38bdf8", color:"#0f172a", border:"none", borderRadius:8, padding:"10px 24px", fontWeight:700, cursor:"pointer", fontSize:14}}>
                {savingProcedure ? "Salvataggio..." : "💾 Salva Intervento"}
              </button>
              <button onClick={() => setShowProcedureForm(false)}
                style={{background:"#334155", color:"white", border:"none", borderRadius:8, padding:"10px 24px", fontWeight:600, cursor:"pointer", fontSize:14}}>
                Annulla
              </button>
            </div>
          </div>
        )}

        {/* LISTA INTERVENTI */}
        <div style={{background:"#1e293b", borderRadius:12, overflow:"hidden", marginBottom:24}}>
          <div style={{padding:"20px 24px", borderBottom:"1px solid #334155", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
            <h3 style={{margin:0, fontSize:15, fontWeight:600, color:"#38bdf8"}}>🔪 Interventi Chirurgici</h3>
            <button onClick={() => setShowProcedureForm(!showProcedureForm)}
              style={{background:"#38bdf8", color:"#0f172a", border:"none", borderRadius:8, padding:"8px 16px", fontWeight:600, cursor:"pointer", fontSize:13}}>
              {showProcedureForm ? "✕ Chiudi" : "+ Nuovo Intervento"}
            </button>
          </div>
          {procedures.length === 0 ? (
            <div style={{padding:32, textAlign:"center", color:"#94a3b8"}}>Nessun intervento registrato</div>
          ) : (
            <table style={{width:"100%", borderCollapse:"collapse"}}>
              <thead>
                <tr style={{background:"#0f172a"}}>
                  <th style={{padding:"12px 24px", textAlign:"left", color:"#94a3b8", fontSize:13}}>Tipo Intervento</th>
                  <th style={{padding:"12px 24px", textAlign:"left", color:"#94a3b8", fontSize:13}}>Data</th>
                  <th style={{padding:"12px 24px", textAlign:"left", color:"#94a3b8", fontSize:13}}>Note</th>
                </tr>
              </thead>
              <tbody>
                {procedures.map((p, i) => (
                  <tr key={p.id} style={{borderTop:"1px solid #334155", background:i%2===0?"transparent":"#162032"}}>
                    <td style={{padding:"16px 24px", fontWeight:500}}>{p.procedure_type}</td>
                    <td style={{padding:"16px 24px", color:"#94a3b8"}}>{p.procedure_date}</td>
                    <td style={{padding:"16px 24px", color:"#94a3b8"}}>{p.notes||"—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{display:"flex", gap:12}}>
          <button onClick={generatePDF} disabled={generatingPdf}
            style={{background:generatingPdf?"#334155":"#1d4ed8", color:"white", border:"none", borderRadius:8, padding:"12px 24px", fontWeight:600, cursor:"pointer", fontSize:14}}>
            {generatingPdf ? "⏳ Generazione..." : "📄 Genera Cartella Clinica PDF"}
          </button>
          <button onClick={() => router.push(`/patients/${id}/consent`)} style={{background:"#7c3aed", color:"white", border:"none", borderRadius:8, padding:"12px 24px", fontWeight:600, cursor:"pointer", fontSize:14}}>
            📋 Consenso Informato
          </button>
          <button style={{background:"#334155", color:"white", border:"none", borderRadius:8, padding:"12px 24px", fontWeight:600, cursor:"pointer", fontSize:14}}>
            ✏️ Modifica Dati</button><button onClick={() => router.push(`/patients/${id}/documents`)} style={{background:"#0d9488", color:"white", border:"none", borderRadius:8, padding:"12px 24px", fontWeight:600, cursor:"pointer", fontSize:14}}>📄 Documenti
          </button>
        </div>
      </div>
    </div>
  )
}