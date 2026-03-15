"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "../../../../lib/supabaseClient"
import SignatureCanvas from "react-signature-canvas"
import { ArrowRight, ArrowLeft, CheckCircle, ShieldAlert, Loader2 } from "lucide-react"

export default function PatientTabletWizard() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  
  const [patient, setPatient] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(1) // 1: Conferma Info, 2: Consensi, 3: Firma
  const [saving, setSaving] = useState(false)
  const sigPad = useRef<any>(null)

  useEffect(() => {
    if (id) loadPatient()
  }, [id])

  async function loadPatient() {
    const { data } = await supabase.from("patients").select("*").eq("id", id).single()
    if (!data) {
      alert("Errore caricamento dati paziente")
      return router.push("/tablet/patient")
    }
    setPatient(data)
    setLoading(false)
  }

  async function handleFinish() {
    if (sigPad.current?.isEmpty()) {
      alert("La firma è obbligatoria per proseguire.")
      return
    }
    
    setSaving(true)
    try {
      // In un caso d'uso reale, qui salveremmo l'immagine della firma su Supabase
      // e segneremmo lo stato del paziente come "Ha completato il desk reception".
      // Per il momento simuliamo l'operazione.
      await new Promise(resolve => setTimeout(resolve, 1500))
      setStep(4) // Display Thank You screen
    } catch (e) {
      alert("Si è verificato un errore durante il salvataggio.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh", color: "var(--primary)" }}><Loader2 className="animate-spin" size={48} /></div>

  // Schermata finale di ringraziamento
  if (step === 4) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", padding: "40px", textAlign: "center" }}>
        <CheckCircle size={80} color="var(--success)" style={{ marginBottom: "24px" }} />
        <h1 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "16px", color: "var(--text-main)" }}>Grazie, {patient?.name}!</h1>
        <p style={{ fontSize: "20px", color: "var(--text-muted)", maxWidth: "600px", lineHeight: "1.5", marginBottom: "40px" }}>
          Abbiamo registrato correttamente i tuoi consensi e la tua firma. Puoi restituire il tablet in segreteria e attendere il tuo turno.
        </p>
        <button 
          onClick={() => router.push("/tablet/patient")}
          style={{ padding: "16px 40px", background: "var(--primary)", color: "white", borderRadius: "12px", fontSize: "18px", fontWeight: "bold", border: "none" }}
        >
          Torna alla Home
        </button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>
      {/* Progress Bar Minimal */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "40px", position: "relative" }}>
        <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: "4px", background: "var(--border)", zIndex: 0, transform: "translateY(-50%)" }}>
          <div style={{ height: "100%", background: "var(--primary)", width: `${((step - 1) / 2) * 100}%`, transition: "width 0.3s ease" }} />
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ 
            width: "36px", height: "36px", borderRadius: "50%", 
            background: step >= i ? "var(--primary)" : "white", 
            border: step >= i ? "none" : "2px solid var(--border)",
            color: step >= i ? "white" : "var(--text-muted)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: "bold", zIndex: 1, transition: "all 0.3s ease"
          }}>{i}</div>
        ))}
      </div>

      <div style={{ background: "white", borderRadius: "24px", padding: "40px", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}>
        
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "12px" }}>Verifica i tuoi dati</h2>
            <p style={{ fontSize: "18px", color: "var(--text-muted)", marginBottom: "32px" }}>Controlla che le informazioni anagrafiche di base siano corrette.</p>
            
            <div style={{ display: "grid", gap: "24px" }}>
              {[
                { label: "Nome e Cognome", value: `${patient?.name} ${patient?.surname}` },
                { label: "Codice Fiscale", value: patient?.fiscal_code },
                { label: "Data di Nascita", value: patient?.birthdate || "Non inserita" },
                { label: "Residenza", value: patient?.city ? `${patient?.address || ""}, ${patient?.city}` : "Non inserita" },
              ].map(f => (
                <div key={f.label} style={{ background: "#f8fafc", padding: "20px", borderRadius: "12px", border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px" }}>{f.label}</div>
                  <div style={{ fontSize: "20px", fontWeight: 600, color: "var(--text-main)" }}>{f.value}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "32px", padding: "20px", background: "#fef2f2", color: "#991b1b", borderRadius: "12px", display: "flex", gap: "12px" }}>
              <ShieldAlert size={24} style={{ flexShrink: 0 }} />
              <p style={{ fontSize: "15px", lineHeight: "1.5" }}>Se trovi degli errori nei tuoi dati, ti preghiamo di avvisare immediatamente il personale in segreteria prima di proseguire.</p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "12px" }}>Consenso al Trattamento Dati</h2>
            <p style={{ fontSize: "18px", color: "var(--text-muted)", marginBottom: "32px" }}>Leggere e accettare l'informativa sulla privacy.</p>
            
            <div style={{ background: "#f8fafc", padding: "24px", borderRadius: "12px", border: "1px solid var(--border)", height: "300px", overflowY: "auto", fontSize: "15px", lineHeight: "1.7", color: "var(--text-muted)" }}>
              <p style={{ marginBottom: "16px" }}>Ai sensi e per gli effetti del Regolamento UE 2016/679 (GDPR), il paziente dichiara di essere stato informato sulle modalità e finalità del trattamento dei propri dati personali, inclusi quelli inerenti lo stato di salute (dati particolari).</p>
              <p style={{ marginBottom: "16px" }}>I dati raccolti saranno utilizzati esclusivamente per finalità di cura, diagnosi e riabilitazione, nonché per adempimenti amministrativi e contabili legati alla prestazione medica richiesta.</p>
              <p>Il conferimento dei dati è obbligatorio per l'erogazione della prestazione medica. La base giuridica del trattamento è rappresentata dalla necessità di erogare la prestazione sanitaria richiesta e, per i dati particolari, dalla tutela della salute e dell'incolumità fisica dell'interessato.</p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "12px" }}>Firma Elettronica</h2>
            <p style={{ fontSize: "18px", color: "var(--text-muted)", marginBottom: "32px" }}>Apponi la tua firma all'interno del riquadro utilizzando il dito o il pennino fornito.</p>
            
            <div style={{ background: "white", border: "2px solid var(--border)", borderRadius: "16px", padding: "8px", marginBottom: "16px", boxShadow: "inset 0 2px 10px rgba(0,0,0,0.02)" }}>
              <SignatureCanvas 
                ref={sigPad} 
                canvasProps={{ 
                  style: { width: "100%", height: "300px", background: "transparent" } 
                }} 
              />
            </div>
            
            <button 
              onClick={() => sigPad.current?.clear()} 
              style={{ background: "transparent", color: "var(--danger)", border: "none", fontSize: "16px", fontWeight: 600, padding: "8px 0" }}
            >
              Cancella e riprova
            </button>
          </div>
        )}

      </div>

      {/* Navigation Buttons */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "40px" }}>
        {step > 1 ? (
          <button 
            onClick={() => setStep(s => s - 1)}
            style={{ padding: "20px 32px", fontSize: "18px", fontWeight: "bold", background: "white", border: "2px solid var(--border)", borderRadius: "16px", display: "flex", alignItems: "center", gap: "12px", color: "var(--text-main)" }}
          >
            <ArrowLeft size={24} /> Indietro
          </button>
        ) : <div />}

        {step < 3 ? (
          <button 
            onClick={() => setStep(s => s + 1)}
            style={{ padding: "20px 32px", fontSize: "18px", fontWeight: "bold", background: "var(--primary)", border: "none", color: "white", borderRadius: "16px", display: "flex", alignItems: "center", gap: "12px", boxShadow: "0 10px 15px -3px rgba(15, 118, 110, 0.3)" }}
          >
            Conferma e Prosegui <ArrowRight size={24} />
          </button>
        ) : (
          <button 
            onClick={handleFinish}
            disabled={saving}
            style={{ padding: "20px 32px", fontSize: "18px", fontWeight: "bold", background: "var(--success)", border: "none", color: "white", borderRadius: "16px", display: "flex", alignItems: "center", gap: "12px", boxShadow: "0 10px 15px -3px rgba(22, 163, 74, 0.3)", opacity: saving ? 0.7 : 1 }}
          >
            {saving ? <Loader2 className="animate-spin" size={24} /> : <CheckCircle size={24} />}
            {saving ? "Salvataggio..." : "Salva e Concludi"}
          </button>
        )}
      </div>

    </div>
  )
}
