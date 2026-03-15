"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../../../lib/supabaseClient"
import SignatureCanvas from "react-signature-canvas"
import { PDFDocument } from "pdf-lib"
import { 
  User, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  PenTool, 
  Loader2,
  Phone,
  Mail,
  Home,
  MapPin,
  Calendar,
  Fingerprint,
  Camera,
  RefreshCw,
  Image as ImageIcon
} from "lucide-react"
import { BUCKET_URL, MODULI } from "../../../lib/constants"
import { 
  sigToBytes, 
  fillSchedaAnagrafica,
  generatePrivacyConsentPDF 
} from "../../../lib/pdfUtils"

export default function GuestRegisterWizard() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  
  const [form, setForm] = useState({
    name: "",
    surname: "",
    birthdate: "",
    birth_place: "",
    fiscal_code: "",
    phone: "",
    email: "",
    address: "",
    city: "",
  })

  const [idPhoto, setIdPhoto] = useState<string | null>(null)
  const [feaAccepted, setFeaAccepted] = useState(false)

  const patSigRef = useRef<any>(null)

  const nextStep = () => {
    if (step === 1 && (!form.name || !form.surname)) return alert("Nome e Cognome sono obbligatori")
    if (step === 2 && !idPhoto) return alert("Per favore scatta una foto identificativa prima di procedere")
    if (step === 3 && !feaAccepted) return alert("Devi accettare i termini di adesione FEA per procedere")
    setStep(prev => prev + 1)
  }
  
  const prevStep = () => setStep(prev => prev - 1)

  async function handleSubmit() {
    const patSig = await sigToBytes(patSigRef)
    if (!patSig) return alert("Per favore firma per accettazione")
    
    setSaving(true)
    try {
      // 1. Salva il paziente tramite API sicura
      const regRes = await fetch("/api/tablet/register-patient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })
      const regResult = await regRes.json()
      if (!regRes.ok) throw new Error(regResult.error || "Errore durante la registrazione")
      
      const newPatientId = regResult.id
      const patientData = { ...form, id: newPatientId }

      // 2. Carica Foto Identificativa (Soggetto Erogatore requirement)
      if (idPhoto) {
        const photoBlob = await fetch(idPhoto).then(r => r.blob())
        const photoPath = `ID_DOCS/${form.surname}_${form.name}_ID.jpg`.replace(/\s+/g, "_")
        await supabase.storage.from("FIRME_PAZIENTI").upload(photoPath, photoBlob, { contentType: "image/jpeg", upsert: true })
      }

      // 3. Genera PDF Scheda Anagrafica con Firma
      const modulo = MODULI.find(m => m.id === 0)! // Scheda Anagrafica
      const pdfRes = await fetch(`${BUCKET_URL}/${modulo.file}`)
      const pdfBytes = await pdfRes.arrayBuffer()
      const pdfDoc = await PDFDocument.load(pdfBytes)

      await fillSchedaAnagrafica(pdfDoc, patientData, patSig, null)
      
      const finalPdfBytes = await pdfDoc.save()
      const fileNameAnagrafica = `ANAGRAFICHE/${form.surname}_${form.name}_Scheda_Anagrafica.pdf`.replace(/\s+/g, "_")

      // 4. Genera PDF Modulo FEA (Replica ufficiale)
      const privacyPdfBytes = await generatePrivacyConsentPDF(patientData, patSig)
      const fileNamePrivacy = `CONSENSI/${form.surname}_${form.name}_Modulo_FEA.pdf`.replace(/\s+/g, "_")

      // 5. Upload PDFs
      await Promise.all([
        supabase.storage.from("FIRME_PAZIENTI").upload(fileNameAnagrafica, finalPdfBytes, { contentType: "application/pdf", upsert: true }),
        supabase.storage.from("FIRME_PAZIENTI").upload(fileNamePrivacy, privacyPdfBytes, { contentType: "application/pdf", upsert: true })
      ])

      // 6. Salva i link nel database
      const { data: q1 } = supabase.storage.from("FIRME_PAZIENTI").getPublicUrl(fileNameAnagrafica)
      const { data: q2 } = supabase.storage.from("FIRME_PAZIENTI").getPublicUrl(fileNamePrivacy)
      
      await supabase.from("documents").insert([
        { patient_id: newPatientId, document_type: 0, file_url: q1.publicUrl },
        { patient_id: newPatientId, document_type: 8, file_url: q2.publicUrl } 
      ])

      setStep(5) // Success step
    } catch (err: any) {
      alert("Errore salvataggio: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", flexDirection: "column" }}>
      {/* Wizard Progress Header */}
      <div style={{ padding: "32px 24px", background: "white", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
          <div style={{ position: "absolute", top: "20px", left: "0", right: "0", height: "2px", background: "#e2e8f0", zIndex: 0 }}></div>
          <div style={{ position: "absolute", top: "20px", left: "0", width: `${((step - 1) / 4) * 100}%`, height: "2px", background: "var(--primary)", transition: "all 0.5s", zIndex: 0 }}></div>
          
          {[
            { n: 1, label: "I Tuoi Dati", icon: User },
            { n: 2, label: "Identificazione", icon: Calendar }, // Placeholder for Camera Icon
            { n: 3, label: "Adesione FEA", icon: ShieldCheck },
            { n: 4, label: "Firma", icon: PenTool },
            { n: 5, label: "Completato", icon: CheckCircle2 }
          ].map((s) => (
            <div key={s.n} style={{ zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
              <div style={{ 
                width: "40px", 
                height: "40px", 
                borderRadius: "50%", 
                background: step >= s.n ? "var(--primary)" : "white", 
                color: step >= s.n ? "white" : "#cbd5e1",
                border: step >= s.n ? "none" : "2px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                transition: "all 0.3s"
              }}>
                <s.icon size={20} />
              </div>
              <span style={{ fontSize: "12px", fontWeight: 700, color: step >= s.n ? "#1e293b" : "#94a3b8" }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <main style={{ flex: 1, padding: "40px 24px", display: "flex", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: "800px" }}>
          
          {step === 1 && (
            <div style={{ background: "white", borderRadius: "24px", padding: "40px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", border: "1px solid #e2e8f0" }}>
              <div style={{ textAlign: "center", marginBottom: "40px" }}>
                <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a" }}>Benvenuto in Cosmedic</h1>
                <p style={{ color: "#64748b", fontSize: "16px" }}>Inserisci i tuoi dati per iniziare la registrazione.</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "13px", fontWeight: 700, color: "#475569" }}>NOME <span style={{ color: "red" }}>*</span></label>
                  <div style={{ position: "relative" }}>
                    <User size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Es. Mario" style={{ width: "100%", padding: "16px 16px 16px 48px", borderRadius: "14px", border: "1px solid #e2e8f0", fontSize: "16px", background: "#f8fafc" }} />
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "13px", fontWeight: 700, color: "#475569" }}>COGNOME <span style={{ color: "red" }}>*</span></label>
                  <input type="text" value={form.surname} onChange={e => setForm({...form, surname: e.target.value})} placeholder="Es. Rossi" style={{ width: "100%", padding: "16px", borderRadius: "14px", border: "1px solid #e2e8f0", fontSize: "16px", background: "#f8fafc" }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginTop: "24px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "13px", fontWeight: 700, color: "#475569" }}>DATA DI NASCITA</label>
                  <div style={{ position: "relative" }}>
                    <Calendar size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <input type="date" value={form.birthdate} onChange={e => setForm({...form, birthdate: e.target.value})} style={{ width: "100%", padding: "16px 16px 16px 48px", borderRadius: "14px", border: "1px solid #e2e8f0", fontSize: "16px", background: "#f8fafc" }} />
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "13px", fontWeight: 700, color: "#475569" }}>LUOGO DI NASCITA</label>
                  <input type="text" value={form.birth_place} onChange={e => setForm({...form, birth_place: e.target.value})} placeholder="Es. Milano" style={{ width: "100%", padding: "16px", borderRadius: "14px", border: "1px solid #e2e8f0", fontSize: "16px", background: "#f8fafc" }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px", marginTop: "24px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "13px", fontWeight: 700, color: "#475569" }}>CODICE FISCALE</label>
                  <div style={{ position: "relative" }}>
                    <Fingerprint size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <input type="text" value={form.fiscal_code} onChange={e => setForm({...form, fiscal_code: e.target.value})} placeholder="RSSMRA..." style={{ width: "100%", padding: "16px 16px 16px 48px", borderRadius: "14px", border: "1px solid #e2e8f0", fontSize: "16px", background: "#f8fafc" }} />
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginTop: "24px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "13px", fontWeight: 700, color: "#475569" }}>CELLULARE</label>
                  <div style={{ position: "relative" }}>
                    <Phone size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="333..." style={{ width: "100%", padding: "16px 16px 16px 48px", borderRadius: "14px", border: "1px solid #e2e8f0", fontSize: "16px", background: "#f8fafc" }} />
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "13px", fontWeight: 700, color: "#475569" }}>EMAIL</label>
                  <div style={{ position: "relative" }}>
                    <Mail size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="mario@email.com" style={{ width: "100%", padding: "16px 16px 16px 48px", borderRadius: "14px", border: "1px solid #e2e8f0", fontSize: "16px", background: "#f8fafc" }} />
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", marginTop: "24px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "13px", fontWeight: 700, color: "#475569" }}>INDIRIZZO</label>
                  <div style={{ position: "relative" }}>
                    <Home size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <input type="text" value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Via Roma, 12" style={{ width: "100%", padding: "16px 16px 16px 48px", borderRadius: "14px", border: "1px solid #e2e8f0", fontSize: "16px", background: "#f8fafc" }} />
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "13px", fontWeight: 700, color: "#475569" }}>CITTÀ</label>
                  <div style={{ position: "relative" }}>
                    <MapPin size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <input type="text" value={form.city} onChange={e => setForm({...form, city: e.target.value})} placeholder="Milano" style={{ width: "100%", padding: "16px 16px 16px 48px", borderRadius: "14px", border: "1px solid #e2e8f0", fontSize: "16px", background: "#f8fafc" }} />
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "48px", display: "flex", justifyContent: "flex-end" }}>
                <button 
                  onClick={nextStep}
                  style={{ padding: "18px 48px", borderRadius: "14px", background: "var(--primary)", color: "white", border: "none", fontWeight: 700, fontSize: "16px", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 10px 15px -3px rgba(13, 148, 136, 0.3)", cursor: "pointer" }}
                >
                  Continua <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ background: "white", borderRadius: "24px", padding: "40px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", border: "1px solid #e2e8f0" }}>
              <div style={{ textAlign: "center", marginBottom: "32px" }}>
                <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a" }}>Riconoscimento de Visu</h1>
                <p style={{ color: "#64748b", fontSize: "16px" }}>Scatta una foto tenendo in mano il tuo documento d'identità valido.</p>
              </div>

              {!idPhoto ? (
                <div style={{ position: "relative", borderRadius: "20px", overflow: "hidden", background: "#000", aspectRatio: "4/3", display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <video autoPlay playsInline ref={v => { if (v && !v.srcObject) navigator.mediaDevices.getUserMedia({video:true}).then(s => v.srcObject = s) }} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", bottom: "32px", left: "0", right: "0", display: "flex", justifyContent: "center" }}>
                    <button onClick={() => {
                        const v = document.querySelector("video"); if (!v) return;
                        const c = document.createElement("canvas"); c.width = v.videoWidth; c.height = v.videoHeight;
                        c.getContext("2d")?.drawImage(v, 0, 0); setIdPhoto(c.toDataURL("image/jpeg"));
                        (v.srcObject as MediaStream)?.getTracks().forEach(t => t.stop());
                      }}
                      style={{ width: "70px", height: "70px", borderRadius: "50%", background: "white", border: "5px solid var(--primary)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <Camera size={32} color="var(--primary)" />
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ position: "relative", borderRadius: "20px", overflow: "hidden", background: "#f1f5f9", aspectRatio: "4/3" }}>
                  <img src={idPhoto} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <button onClick={() => setIdPhoto(null)} style={{ position: "absolute", top: "16px", right: "16px", background: "rgba(0,0,0,0.5)", color: "white", border: "none", padding: "10px 20px", borderRadius: "10px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                    <RefreshCw size={16} /> RIPROVA
                  </button>
                </div>
              )}

              <div style={{ marginTop: "40px", display: "flex", justifyContent: "space-between" }}>
                <button onClick={prevStep} style={{ border: "none", background: "transparent", color: "#64748b", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}>
                  <ChevronLeft size={20} /> Indietro
                </button>
                <button onClick={nextStep} style={{ padding: "18px 48px", borderRadius: "14px", background: idPhoto ? "var(--primary)" : "#cbd5e1", color: "white", border: "none", fontWeight: 700, fontSize: "16px", cursor: idPhoto ? "pointer" : "not-allowed" }}>
                  Continua <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ background: "white", borderRadius: "24px", padding: "40px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", border: "1px solid #e2e8f0" }}>
              <div style={{ textAlign: "center", marginBottom: "32px" }}>
                <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a" }}>Modulo di Adesione FEA</h1>
                <p style={{ color: "#64748b", fontSize: "14px" }}>Leggi le condizioni e conferma l'adesione.</p>
              </div>

              <div style={{ height: "300px", overflowY: "auto", background: "#f8fafc", padding: "20px", borderRadius: "14px", border: "1px solid #e2e8f0", fontSize: "13px", lineHeight: "1.6", color: "#475569", marginBottom: "32px" }}>
                <h4 style={{ fontWeight: 700, marginBottom: "8px" }}>A) Condizioni relative al servizio di Firma Elettronica Avanzata (“FEA”)</h4>
                <p><strong>Premesse:</strong> Lo Studio COSMEDIC SRL (di seguito, “STUDIO”), per il tramite del partner tecnologico B&B SOLUTIONS, ha introdotto un’innovativa soluzione informatica che consente al Cliente di sottoscrivere elettronicamente la documentazione Medica e contrattuale...</p>
                <p style={{ marginTop: "8px" }}><strong>Descrizione sistema:</strong> La soluzione adottata garantisce l'identificazione, la connessione univoca e l'integrità del documento...</p>
                {/* Full text can be condensed here or provided in scrollbox */}
                <p style={{ marginTop: "16px", fontWeight: 700 }}>B) Adesione al servizio di Firma Elettronica Avanzata (a cura del Cliente)</p>
                <p>Il sottoscritto <strong>{form.surname} {form.name}</strong>, nato a <strong>{form.birth_place}</strong> il <strong>{form.birthdate}</strong>, chiede di poter aderire al servizio di FEA.</p>
              </div>

              <label style={{ display: "flex", gap: "12px", alignItems: "center", padding: "20px", background: "#f0fdf4", borderRadius: "12px", cursor: "pointer", border: feaAccepted ? "2px solid #22c55e" : "2px solid transparent" }}>
                <input type="checkbox" checked={feaAccepted} onChange={e => setFeaAccepted(e.target.checked)} style={{ width: "24px", height: "24px", accentColor: "#22c55e" }} />
                <span style={{ fontSize: "14px", fontWeight: 600, color: "#166534" }}>Chiedo di poter aderire al servizio di Firma Elettronica Avanzata (“FEA”) di COSMEDIC SRL</span>
              </label>

              <div style={{ marginTop: "40px", display: "flex", justifyContent: "space-between" }}>
                <button onClick={prevStep} style={{ border: "none", background: "transparent", color: "#64748b", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}>
                  <ChevronLeft size={20} /> Indietro
                </button>
                <button onClick={nextStep} style={{ padding: "18px 48px", borderRadius: "14px", background: feaAccepted ? "var(--primary)" : "#cbd5e1", color: "white", border: "none", fontWeight: 700, fontSize: "16px", cursor: feaAccepted ? "pointer" : "not-allowed" }}>
                  Continua <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div style={{ background: "white", borderRadius: "24px", padding: "40px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", border: "1px solid #e2e8f0" }}>
              <div style={{ textAlign: "center", marginBottom: "32px" }}>
                <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a" }}>Apponi la tua firma</h1>
                <p style={{ color: "#64748b", fontSize: "14px" }}>Firma nel riquadro sottostante per completare l'adesione.</p>
              </div>

              <div style={{ background: "white", borderRadius: "16px", padding: "24px", border: "2px dashed #cbd5e1" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#475569" }}>RIQUADRO DI FIRMA</h4>
                  <button onClick={() => patSigRef.current?.clear()} style={{ fontSize: "12px", color: "var(--primary)", border: "none", background: "transparent", fontWeight: 600 }}>CANCELLA</button>
                </div>
                <div style={{ background: "#fff", display: "flex", justifyContent: "center" }}>
                  <SignatureCanvas ref={patSigRef} canvasProps={{ width: 600, height: 250, className: "sigCanvas" }} backgroundColor="white" />
                </div>
              </div>

              <div style={{ marginTop: "40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <button onClick={prevStep} style={{ border: "none", background: "transparent", color: "#64748b", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}>
                  <ChevronLeft size={20} /> Indietro
                </button>
                <button 
                  onClick={handleSubmit} disabled={saving}
                  style={{ padding: "18px 48px", borderRadius: "14px", background: "var(--primary)", color: "white", border: "none", fontWeight: 700, fontSize: "18px", display: "flex", alignItems: "center", gap: "12px", boxShadow: "0 10px 15px -3px rgba(13, 148, 136, 0.3)", cursor: "pointer", opacity: saving ? 0.7 : 1 }}
                >
                  {saving ? <Loader2 className="animate-spin" /> : <ShieldCheck size={22} />}
                  {saving ? "Salvataggio..." : "CONFERMA E TERMINA"}
                </button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div style={{ background: "white", borderRadius: "32px", padding: "60px 40px", textAlign: "center", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", border: "1px solid #e2e8f0" }}>
              <div style={{ width: "100px", height: "100px", borderRadius: "50%", background: "#f0fdf4", color: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 32px" }}>
                <CheckCircle2 size={56} />
              </div>
              <h1 style={{ fontSize: "32px", fontWeight: 800, color: "#0f172a", marginBottom: "16px" }}>Registrazione Completata!</h1>
              <p style={{ color: "#64748b", fontSize: "18px", maxWidth: "400px", margin: "0 auto 48px" }}>Grazie <strong>{form.name}</strong>, i tuoi dati e la tua adesione FEA sono stati salvati correttamente.</p>
              <button onClick={() => router.push("/")} style={{ padding: "16px 32px", borderRadius: "14px", background: "#f1f5f9", color: "#475569", border: "none", fontWeight: 700, fontSize: "16px", cursor: "pointer" }}>Torna alla Home</button>
            </div>
          )}
        </div>
      </main>

      <footer style={{ padding: "24px", textAlign: "center", color: "#94a3b8", fontSize: "12px" }}>
        © 2026 COSMEDIC CLINIC • Procedura di registrazione digitale
      </footer>
    </div>
  )
}
