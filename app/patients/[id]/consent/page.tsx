"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "../../../../lib/supabaseClient"
import jsPDF from "jspdf"
import SignatureCanvas from "react-signature-canvas"

export default function ConsentPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const [patient, setPatient] = useState<any>(null)
  const [procedureType, setProcedureType] = useState("")
  const [consents, setConsents] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<"form"|"history">("form")
  const patientSigRef = useRef<any>(null)
  const doctorSigRef = useRef<any>(null)

  const [declarations, setDeclarations] = useState({
    read: false,
    health: false,
    fasting: false,
    noMeds: false,
    noAllergies: false,
    risks: false,
    withdraw: false,
  })

  const risksByType: Record<string, string[]> = {
    "Rinoplastica": ["Edema prolungato", "Asimmetria residua", "Difficoltà respiratoria temporanea", "Revisione necessaria"],
    "Mastoplastica additiva": ["Contrattura capsulare", "Rottura protesi", "Perdita sensibilità", "Revisione posizione"],
    "Liposuzione": ["Irregolarità contorno", "Siero/ematoma", "Perdita sensibilità cutanea", "Revisione necessaria"],
    "Blefaroplastica": ["Secchezza oculare", "Asimmetria palpebrale", "Cicatrice visibile", "Lagoftalmo temporaneo"],
    "Addominoplastica": ["Cicatrice estesa", "Siero/ematoma", "Necrosi cutanea parziale", "TVP rischio aumentato"],
  }

  const interventoTypes = [
    "Rinoplastica", "Blefaroplastica", "Lifting facciale", "Otoplastica",
    "Mastoplastica additiva", "Mastoplastica riduttiva", "Mastopexi",
    "Addominoplastica", "Liposuzione", "Lipoaddizione", "BBL",
    "Lipofilling viso", "Mentoplastica", "Altro"
  ]

  useEffect(() => { if (id) { loadPatient(); loadConsents() } }, [id])

  async function loadPatient() {
    const { data } = await supabase.from("patients").select("*").eq("id", id).single()
    setPatient(data)
  }

  async function loadConsents() {
    const { data } = await supabase.from("consents").select("*").eq("patient_id", id).order("created_at", {ascending:false})
    setConsents(data || [])
  }

  async function saveConsent() {
    if (!procedureType) return alert("Seleziona il tipo di intervento")
    if (!declarations.read || !declarations.risks) return alert("Il paziente deve confermare di aver letto il consenso e compreso i rischi")
    if (patientSigRef.current?.isEmpty()) return alert("La firma del paziente è obbligatoria")
    if (doctorSigRef.current?.isEmpty()) return alert("La firma del medico è obbligatoria")

    setSaving(true)
    const patientSig = patientSigRef.current.toDataURL()
    const doctorSig = doctorSigRef.current.toDataURL()

    await supabase.from("consents").insert([{
      patient_id: id,
      procedure_type: procedureType,
      patient_signature: patientSig,
      doctor_signature: doctorSig,
      signed_at: new Date().toISOString(),
      declarations: declarations,
    }])

    generateConsentPDF(patientSig, doctorSig)
    setSaving(false)
    loadConsents()
    setActiveTab("history")
    alert("Consenso salvato e PDF generato!")
  }

  function generateConsentPDF(patientSig: string, doctorSig: string) {
    if (!patient) return
    const doc = new jsPDF({ orientation:"portrait", unit:"mm", format:"a4" })
    const pageW = 210
    const margin = 20
    let y = 20

    doc.setFillColor(15,23,42)
    doc.rect(0,0,pageW,40,"F")
    doc.setTextColor(56,189,248); doc.setFontSize(18); doc.setFont("helvetica","bold")
    doc.text("CONSENSO INFORMATO", margin, 18)
    doc.setTextColor(148,163,184); doc.setFontSize(10); doc.setFont("helvetica","normal")
    doc.text("Dr. Franco Cavalluzzi — Chirurgia Estetica", margin, 28)
    doc.text(`Data: ${new Date().toLocaleDateString("it-IT")} ore ${new Date().toLocaleTimeString("it-IT")}`, margin, 35)
    y = 50

    doc.setFillColor(30,41,59); doc.rect(margin,y,pageW-margin*2,8,"F")
    doc.setTextColor(56,189,248); doc.setFontSize(11); doc.setFont("helvetica","bold")
    doc.text("DATI PAZIENTE", margin+3, y+5.5); y += 12
    doc.setTextColor(15,23,42); doc.setFontSize(10); doc.setFont("helvetica","normal")
    doc.text(`Nome: ${patient.name} ${patient.surname}`, margin, y); y += 6
    doc.text(`Data di nascita: ${patient.birthdate||"—"}`, margin, y); y += 6
    doc.text(`Intervento: ${procedureType}`, margin, y); y += 10

    doc.setFillColor(30,41,59); doc.rect(margin,y,pageW-margin*2,8,"F")
    doc.setTextColor(56,189,248); doc.setFontSize(11); doc.setFont("helvetica","bold")
    doc.text("DICHIARAZIONI", margin+3, y+5.5); y += 12
    doc.setTextColor(15,23,42); doc.setFontSize(10); doc.setFont("helvetica","normal")
    const decl = [
      [declarations.read, "Ho letto e compreso il consenso informato"],
      [declarations.health, "Dichiaro di essere in buono stato di salute"],
      [declarations.fasting, "Confermo il digiuno pre-operatorio"],
      [declarations.noMeds, "Non assumo farmaci controindicati"],
      [declarations.noAllergies, "Non ho allergie note ai farmaci"],
      [declarations.risks, "Sono stato informato sui rischi specifici"],
      [declarations.withdraw, "Sono consapevole del diritto di recesso"],
    ]
    decl.forEach(([checked, text]) => {
      doc.text(`${checked ? "☑" : "☐"} ${text}`, margin, y); y += 7
    })
    y += 5

    if (risksByType[procedureType]) {
      doc.setFillColor(30,41,59); doc.rect(margin,y,pageW-margin*2,8,"F")
      doc.setTextColor(56,189,248); doc.setFontSize(11); doc.setFont("helvetica","bold")
      doc.text("RISCHI SPECIFICI", margin+3, y+5.5); y += 12
      doc.setTextColor(15,23,42); doc.setFontSize(10); doc.setFont("helvetica","normal")
      risksByType[procedureType].forEach(r => {
        doc.text(`• ${r}`, margin, y); y += 6
      })
      y += 5
    }

    if (y > 200) { doc.addPage(); y = 20 }
    doc.setFillColor(30,41,59); doc.rect(margin,y,pageW-margin*2,8,"F")
    doc.setTextColor(56,189,248); doc.setFontSize(11); doc.setFont("helvetica","bold")
    doc.text("FIRME", margin+3, y+5.5); y += 15

    try {
      doc.addImage(patientSig, "PNG", margin, y, 70, 30)
      doc.addImage(doctorSig, "PNG", pageW-margin-70, y, 70, 30)
    } catch(e) {}
    y += 35
    doc.setTextColor(100,116,139); doc.setFontSize(9)
    doc.text("Firma del Paziente", margin, y)
    doc.text("Firma del Medico", pageW-margin-60, y)

    doc.setFillColor(15,23,42); doc.rect(0,282,pageW,15,"F")
    doc.setTextColor(148,163,184); doc.setFontSize(8)
    doc.text(`Consenso Informato — ${patient.name} ${patient.surname} — ${procedureType} — ${new Date().toLocaleDateString("it-IT")}`, margin, 290)

    doc.save(`consenso-${patient.surname}-${procedureType.replace(/ /g,"-")}.pdf`)
  }

  if (!patient) return <div style={{background:"#0f172a", minHeight:"100vh", color:"white", padding:40}}>Caricamento...</div>

  const inputStyle = {width:"100%", background:"#0f172a", border:"1px solid #334155", borderRadius:8, padding:"10px 12px", color:"white", fontSize:14, boxSizing:"border-box" as const}
  const tabStyle = (active: boolean) => ({
    padding:"10px 24px", border:"none", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:14,
    background: active ? "#38bdf8" : "#334155", color: active ? "#0f172a" : "white"
  })

  return (
    <div style={{minHeight:"100vh", background:"#0f172a", color:"white", fontFamily:"sans-serif"}}>
      <div style={{background:"#1e293b", padding:"16px 32px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:"1px solid #334155"}}>
        <div style={{display:"flex", alignItems:"center", gap:16}}>
          <button onClick={() => router.push(`/patients/${id}`)}
            style={{background:"#334155", color:"white", border:"none", borderRadius:8, padding:"8px 16px", cursor:"pointer", fontSize:14}}>
            ← Scheda Paziente
          </button>
          <h1 style={{margin:0, fontSize:20, fontWeight:700, color:"#38bdf8"}}>📋 Consenso Informato</h1>
        </div>
        <span style={{color:"#94a3b8", fontSize:14}}>{patient.name} {patient.surname}</span>
      </div>

      <div style={{padding:32}}>
        <div style={{display:"flex", gap:12, marginBottom:24}}>
          <button style={tabStyle(activeTab==="form")} onClick={() => setActiveTab("form")}>+ Nuovo Consenso</button>
          <button style={tabStyle(activeTab==="history")} onClick={() => setActiveTab("history")}>
            📁 Storico ({consents.length})
          </button>
        </div>

        {activeTab === "form" && (
          <div>
            {/* TIPO INTERVENTO */}
            <div style={{background:"#1e293b", borderRadius:12, padding:24, marginBottom:24}}>
              <h3 style={{margin:"0 0 16px", color:"#38bdf8", fontSize:15}}>🔪 Tipo di Intervento</h3>
              <select value={procedureType} onChange={e => setProcedureType(e.target.value)} style={inputStyle}>
                <option value="">— Seleziona intervento —</option>
                {interventoTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* RISCHI SPECIFICI */}
            {procedureType && risksByType[procedureType] && (
              <div style={{background:"#1e293b", borderRadius:12, padding:24, marginBottom:24, border:"1px solid #f59e0b"}}>
                <h3 style={{margin:"0 0 16px", color:"#f59e0b", fontSize:15}}>⚠️ Rischi Specifici — {procedureType}</h3>
                {risksByType[procedureType].map(r => (
                  <div key={r} style={{color:"#94a3b8", fontSize:14, marginBottom:6}}>• {r}</div>
                ))}
              </div>
            )}

            {/* DICHIARAZIONI */}
            <div style={{background:"#1e293b", borderRadius:12, padding:24, marginBottom:24}}>
              <h3 style={{margin:"0 0 16px", color:"#38bdf8", fontSize:15}}>☑️ Dichiarazioni del Paziente</h3>
              {[
                {key:"read", label:"Ho letto e compreso il consenso informato"},
                {key:"health", label:"Dichiaro di essere in buono stato di salute"},
                {key:"fasting", label:"Confermo il digiuno pre-operatorio (8 ore)"},
                {key:"noMeds", label:"Non assumo farmaci anticoagulanti o controindicati"},
                {key:"noAllergies", label:"Non ho allergie note ai farmaci anestetici"},
                {key:"risks", label:"Sono stato informato sui rischi e le complicanze specifiche"},
                {key:"withdraw", label:"Sono consapevole del diritto di recesso entro 24 ore"},
              ].map(d => (
                <label key={d.key} style={{display:"flex", alignItems:"center", gap:12, marginBottom:14, cursor:"pointer"}}>
                  <input type="checkbox"
                    checked={(declarations as any)[d.key]}
                    onChange={e => setDeclarations({...declarations, [d.key]:e.target.checked})}
                    style={{width:18, height:18, cursor:"pointer"}}
                  />
                  <span style={{fontSize:14, color:"#e2e8f0"}}>{d.label}</span>
                </label>
              ))}
            </div>

            {/* FIRME */}
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:24, marginBottom:24}}>
              <div style={{background:"#1e293b", borderRadius:12, padding:24}}>
                <h3 style={{margin:"0 0 16px", color:"#38bdf8", fontSize:15}}>✍️ Firma Paziente</h3>
                <div style={{background:"white", borderRadius:8, overflow:"hidden"}}>
                  <SignatureCanvas
                    ref={patientSigRef}
                    canvasProps={{width:320, height:150, style:{display:"block"}}}
                    backgroundColor="white"
                  />
                </div>
                <button onClick={() => patientSigRef.current?.clear()}
                  style={{marginTop:8, background:"#334155", color:"white", border:"none", borderRadius:6, padding:"6px 12px", fontSize:12, cursor:"pointer"}}>
                  Cancella
                </button>
              </div>
              <div style={{background:"#1e293b", borderRadius:12, padding:24}}>
                <h3 style={{margin:"0 0 16px", color:"#38bdf8", fontSize:15}}>✍️ Firma Medico</h3>
                <div style={{background:"white", borderRadius:8, overflow:"hidden"}}>
                  <SignatureCanvas
                    ref={doctorSigRef}
                    canvasProps={{width:320, height:150, style:{display:"block"}}}
                    backgroundColor="white"
                  />
                </div>
                <button onClick={() => doctorSigRef.current?.clear()}
                  style={{marginTop:8, background:"#334155", color:"white", border:"none", borderRadius:6, padding:"6px 12px", fontSize:12, cursor:"pointer"}}>
                  Cancella
                </button>
              </div>
            </div>

            <button onClick={saveConsent} disabled={saving}
              style={{background:saving?"#334155":"#1d4ed8", color:"white", border:"none", borderRadius:8, padding:"14px 32px", fontWeight:700, cursor:"pointer", fontSize:16}}>
              {saving ? "⏳ Salvataggio..." : "💾 Salva Consenso e Genera PDF"}
            </button>
          </div>
        )}

        {activeTab === "history" && (
          <div style={{background:"#1e293b", borderRadius:12, overflow:"hidden"}}>
            <div style={{padding:"20px 24px", borderBottom:"1px solid #334155"}}>
              <h3 style={{margin:0, fontSize:15, fontWeight:600, color:"#38bdf8"}}>📁 Storico Consensi</h3>
            </div>
            {consents.length === 0 ? (
              <div style={{padding:32, textAlign:"center", color:"#94a3b8"}}>Nessun consenso registrato</div>
            ) : (
              <table style={{width:"100%", borderCollapse:"collapse"}}>
                <thead>
                  <tr style={{background:"#0f172a"}}>
                    <th style={{padding:"12px 24px", textAlign:"left", color:"#94a3b8", fontSize:13}}>Intervento</th>
                    <th style={{padding:"12px 24px", textAlign:"left", color:"#94a3b8", fontSize:13}}>Data Firma</th>
                    <th style={{padding:"12px 24px", textAlign:"left", color:"#94a3b8", fontSize:13}}>Stato</th>
                  </tr>
                </thead>
                <tbody>
                  {consents.map((c, i) => (
                    <tr key={c.id} style={{borderTop:"1px solid #334155", background:i%2===0?"transparent":"#162032"}}>
                      <td style={{padding:"16px 24px", fontWeight:500}}>{c.procedure_type}</td>
                      <td style={{padding:"16px 24px", color:"#94a3b8"}}>{new Date(c.signed_at).toLocaleDateString("it-IT")}</td>
                      <td style={{padding:"16px 24px"}}>
                        <span style={{background:"#166534", color:"#86efac", padding:"4px 10px", borderRadius:20, fontSize:12, fontWeight:600}}>
                          ✓ Firmato
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  )
}