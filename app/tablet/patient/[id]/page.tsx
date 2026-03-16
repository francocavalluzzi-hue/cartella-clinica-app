"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { supabase } from "../../../../lib/supabaseClient"
import SignatureCanvas from "react-signature-canvas"
import { PDFDocument } from "pdf-lib"
import { 
  CheckCircle2, 
  ArrowLeft, 
  PenTool, 
  Download, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  FileText
} from "lucide-react"
import { BUCKET_URL, MODULI } from "../../../../lib/constants"
import { 
  sigToBytes, 
  fillSchedaAnagrafica, 
  fillCartellaClinica, 
  fillConsensoAnestesia, 
  fillGenericPDF, 
  fillLetteraDimissioni, 
  fillRicettaPrescrizioni, 
  fillTabellaMedicazioni, 
  fillChirurgiaAmbulatoriale 
} from "../../../../lib/pdfUtils"

export default function TabletPatientSignaturePage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  
  const [patient, setPatient] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [signing, setSigning] = useState(false)
  const [done, setDone] = useState<number[]>([])

  const searchParams = useSearchParams()
  const modulesParam = searchParams.get("modules")
  
  const filteredModuli = modulesParam 
    ? MODULI.filter(m => modulesParam.split(",").includes(m.id.toString()))
    : MODULI

  const patSigRef = useRef<any>(null)
  const docSigRef = useRef<any>(null)

  useEffect(() => {
    if (id) loadData()
  }, [id])

  async function loadData() {
    const { data } = await supabase.from("patients").select("*").eq("id", id).single()
    setPatient(data)
    setLoading(false)
  }

  const currentModulo = filteredModuli[selectedIdx]

  async function handleSign() {
    if (!patient || signing) return
    setSigning(true)
    try {
      const patB = await sigToBytes(patSigRef)
      const docB = await sigToBytes(docSigRef)
      
      if (!patB) { alert("Firma Paziente obbligatoria"); setSigning(false); return }

      const res = await fetch(`${BUCKET_URL}/${currentModulo.file}`)
      const pdfBytes = await res.arrayBuffer()
      const pdfDoc = await PDFDocument.load(pdfBytes)

      // Logica di riempimento basata sull'ID del modulo
      if (currentModulo.id === 0) await fillSchedaAnagrafica(pdfDoc, patient, patB, docB)
      else if (currentModulo.id === 1) await fillCartellaClinica(pdfDoc, patient, patB, docB)
      else if (currentModulo.id === 2) await fillConsensoAnestesia(pdfDoc, patient, patB, docB, null)
      else if (currentModulo.id === 4) await fillLetteraDimissioni(pdfDoc, patient, patB, docB)
      else if (currentModulo.id === 5) await fillRicettaPrescrizioni(pdfDoc, patient, docB)
      else if (currentModulo.id === 6) await fillTabellaMedicazioni(pdfDoc, patient)
      else if (currentModulo.id === 7) await fillChirurgiaAmbulatoriale(pdfDoc, patient, docB)
      else await fillGenericPDF(pdfDoc, patient, patB, docB)

      const finalPdfBytes = await pdfDoc.save()
      const fileName = `${patient.surname}_${patient.name}_${currentModulo.nome.replace(/ /g, "_")}.pdf`
      
      const { error } = await supabase.storage.from("FIRME_PAZIENTI").upload(fileName, finalPdfBytes, {
        contentType: "application/pdf",
        upsert: true
      })

      if (error) throw error
      
      setDone(prev => [...prev, currentModulo.id])
      
      // Auto-Next logic
      alert("Documento firmato e salvato con successo!")
      patSigRef.current?.clear()
      docSigRef.current?.clear()

      // Find next unsigned document
      const currentDone = [...done, currentModulo.id]
      const nextUnsignedIdx = filteredModuli.findIndex((m) => !currentDone.includes(m.id))
      
      if (nextUnsignedIdx !== -1) {
        setSelectedIdx(nextUnsignedIdx)
      } else {
        alert("Tutti i documenti selezionati sono stati firmati!")
      }

    } catch (err) {
      console.error(err)
      alert("Errore durante il salvataggio")
    } finally {
      setSigning(false)
    }
  }

  if (loading) return <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><Loader2 className="animate-spin" /></div>

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#f8fafc" }}>
      {/* Mini Header Tablet */}
      <div style={{ padding: "16px 24px", background: "white", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={() => router.back()} style={{ border: "none", background: "transparent", color: "#64748b", display: "flex", alignItems: "center", gap: "8px" }}>
          <ArrowLeft size={20} /> Esci
        </button>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Paziente</div>
          <div style={{ fontSize: "16px", fontWeight: 700 }}>{patient.name} {patient.surname}</div>
        </div>
        <div style={{ width: "60px" }}></div> {/* Spacer */}
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Sidebar Moduli Tablet */}
        <div style={{ width: "280px", background: "#f1f5f9", borderRight: "1px solid #e2e8f0", overflowY: "auto", padding: "16px" }}>
          <h3 style={{ fontSize: "13px", color: "#64748b", fontWeight: 700, marginBottom: "16px", padding: "0 8px" }}>DOCUMENTI DA FIRMARE</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {filteredModuli.map((m, idx) => (
              <button 
                key={m.id}
                onClick={() => setSelectedIdx(idx)}
                style={{
                  padding: "16px",
                  borderRadius: "12px",
                  border: "none",
                  background: selectedIdx === idx ? "var(--primary)" : "white",
                  color: selectedIdx === idx ? "white" : "#1e293b",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  textAlign: "left",
                  boxShadow: selectedIdx === idx ? "0 4px 6px -1px rgba(13, 148, 136, 0.2)" : "0 1px 2px rgba(0,0,0,0.05)",
                  cursor: "pointer"
                }}
              >
                <div style={{ 
                  width: "32px", 
                  height: "32px", 
                  borderRadius: "8px", 
                  background: selectedIdx === idx ? "rgba(255,255,255,0.2)" : "#f8fafc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: selectedIdx === idx ? "white" : "var(--primary)"
                }}>
                  {done.includes(m.id) ? <CheckCircle2 size={18} /> : <FileText size={18} />}
                </div>
                <div style={{ flex: 1, fontSize: "14px", fontWeight: 600 }}>{m.nome}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Signature Area Tablet */}
        <div style={{ flex: 1, padding: "32px", display: "flex", flexDirection: "column", gap: "24px", overflowY: "auto" }}>
          <div style={{ textAlign: "center", marginBottom: "8px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a" }}>{currentModulo.nome}</h2>
            <p style={{ color: "#64748b", fontSize: "14px" }}>Leggi il documento sul monitor e apponi la firma qui sotto.</p>
          </div>

          {/* Signature Grid with Custom Responsive Classes */}
          <div className="signature-grid" style={{ 
            display: "grid", 
            gap: "24px",
            // Responsive design will be handled via an injected style block for media queries
          }}>
            <style jsx>{`
              .signature-grid {
                grid-template-columns: 1fr 1fr;
              }
              @media (max-width: 900px) {
                .signature-grid {
                  grid-template-columns: 1fr;
                }
              }
              .sig-container {
                touch-action: none;
              }
            `}</style>
            
            {/* Signature Patient */}
            <div style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#475569" }}>FIRMA DEL PAZIENTE</h4>
                <button onClick={() => patSigRef.current?.clear()} style={{ fontSize: "12px", color: "var(--primary)", border: "none", background: "transparent", fontWeight: 600, cursor: "pointer" }}>CANCELLA</button>
              </div>
              <div className="sig-container" style={{ background: "#f8fafc", borderRadius: "12px", border: "2px dashed #cbd5e1", overflow: "hidden", display: "flex", justifyContent: "center" }}>
                <SignatureCanvas
                  ref={patSigRef}
                  canvasProps={{ width: 400, height: 200, className: "sigCanvas" }}
                  backgroundColor="white"
                />
              </div>
            </div>

            {/* Signature Doctor */}
            <div style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#475569" }}>FIRMA DEL MEDICO</h4>
                <button onClick={() => docSigRef.current?.clear()} style={{ fontSize: "12px", color: "var(--primary)", border: "none", background: "transparent", fontWeight: 600, cursor: "pointer" }}>CANCELLA</button>
              </div>
              <div className="sig-container" style={{ background: "#f8fafc", borderRadius: "12px", border: "2px dashed #cbd5e1", overflow: "hidden", display: "flex", justifyContent: "center" }}>
                <SignatureCanvas
                  ref={docSigRef}
                  canvasProps={{ width: 400, height: 200, className: "sigCanvas" }}
                  backgroundColor="white"
                />
              </div>
            </div>
          </div>

          <div style={{ marginTop: "20px", display: "flex", justifyContent: "center" }}>
            <button 
              onClick={handleSign}
              disabled={signing}
              style={{
                padding: "20px 60px",
                borderRadius: "50px",
                background: "var(--primary)",
                color: "white",
                border: "none",
                fontSize: "18px",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "12px",
                boxShadow: "0 10px 15px -3px rgba(13, 148, 136, 0.3)",
                cursor: "pointer",
                opacity: signing ? 0.7 : 1
              }}
            >
              {signing ? <Loader2 className="animate-spin" /> : <PenTool size={22} />}
              {signing ? "Salvataggio..." : "CONFERMA E SALVA"}
            </button>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "auto", paddingTop: "32px" }}>
            <button 
              disabled={selectedIdx === 0}
              onClick={() => setSelectedIdx(prev => prev - 1)}
              style={{ border: "1px solid #e2e8f0", background: "white", padding: "12px 24px", borderRadius: "12px", color: "#64748b", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", opacity: selectedIdx === 0 ? 0.5 : 1 }}
            >
              <ChevronLeft size={20} /> Precedente
            </button>
            <button 
              disabled={selectedIdx === filteredModuli.length - 1}
              onClick={() => setSelectedIdx(prev => prev + 1)}
              style={{ border: "1px solid #e2e8f0", background: "white", padding: "12px 24px", borderRadius: "12px", color: "#64748b", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", opacity: selectedIdx === filteredModuli.length - 1 ? 0.5 : 1 }}
            >
              Prossimo <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
