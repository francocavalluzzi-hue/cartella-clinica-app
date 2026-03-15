"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "../../../../lib/supabaseClient"
import SignatureCanvas from "react-signature-canvas"
import { PDFDocument } from "pdf-lib"
import { 
  FileText, 
  Search, 
  ChevronRight, 
  ArrowLeft, 
  PenTool, 
  Download, 
  CheckCircle2, 
  Clock, 
  Info,
  ExternalLink,
  Smartphone,
  Tablet,
  Trash2,
  Loader2
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

export default function DocumentsPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const [patient, setPatient] = useState<any>(null)
  const [selectedModulo, setSelectedModulo] = useState<any>(null)
  const [signedDocs, setSignedDocs] = useState<{type: number, url: string}[]>([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const patientSigRef = useRef<any>(null)
  const doctorSigRef = useRef<any>(null)
  const anestesistaRef = useRef<any>(null)

  useEffect(() => { if (id) { loadPatient(); loadSignedDocs() } }, [id])

  async function loadPatient() {
    const { data } = await supabase.from("patients").select("*").eq("id", id).single()
    setPatient(data)
    setLoading(false)
  }

  async function loadSignedDocs() {
    const { data } = await supabase.from("documents").select("*").eq("patient_id", id)
    setSignedDocs((data || []).map((d: any) => ({ type: d.document_type, url: d.file_url })))
  }

  // PDF Filling functions (Preserved exactly from original)
  // Fine funzioni di riempimento

  async function saveSignedDoc() {
    if (!selectedModulo || !patient) return
    const isCartellaClinica = selectedModulo.id === 1; const isRicetta = selectedModulo.id === 5; const isTabella = selectedModulo.id === 6; const isChirurgia = selectedModulo.id === 7
    if (!isCartellaClinica && !isTabella) {
      if (!isRicetta && !isChirurgia && patientSigRef.current?.isEmpty()) return alert("❌ Firma del paziente obbligatoria")
      if (doctorSigRef.current?.isEmpty()) return alert("❌ Firma del medico obbligatoria")
    }
    setSaving(true)
    try {
      const pdfUrl = `${BUCKET_URL}/${selectedModulo.file}`
      const pdfBytes = await fetch(pdfUrl).then(r => r.arrayBuffer())
      const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true })
      const patB = await sigToBytes(patientSigRef); const docB = await sigToBytes(doctorSigRef); const anestB = await sigToBytes(anestesistaRef)
      if (!isCartellaClinica && !isRicetta && !isTabella && !isChirurgia && (!patB || !docB)) throw new Error("Firme mancanti")
      if ((isRicetta || isChirurgia) && !docB) throw new Error("Firma medico mancante")

      if (selectedModulo.id === 0) await fillSchedaAnagrafica(pdfDoc, patient, patB, docB)
      else if (selectedModulo.id === 1) await fillCartellaClinica(pdfDoc, patient, patB, docB)
      else if (selectedModulo.id === 2) await fillConsensoAnestesia(pdfDoc, patient, patB, docB, anestB)
      else if (selectedModulo.id === 4) await fillLetteraDimissioni(pdfDoc, patient, patB, docB)
      else if (selectedModulo.id === 5) await fillRicettaPrescrizioni(pdfDoc, patient, docB)
      else if (selectedModulo.id === 6) await fillTabellaMedicazioni(pdfDoc, patient)
      else if (selectedModulo.id === 7) await fillChirurgiaAmbulatoriale(pdfDoc, patient, docB)
      else await fillGenericPDF(pdfDoc, patient, patB, docB)

      const out = await pdfDoc.save()
      const fileName = `firme/${id}/${selectedModulo.id}_${Date.now()}.pdf`
      const { error: uploadError } = await supabase.storage.from("FIRME_PAZIENTI").upload(fileName, out, { contentType: "application/pdf", upsert: true })
      if (uploadError) throw new Error("Errore upload PDF: " + uploadError.message)
      const { data: { publicUrl } } = supabase.storage.from("FIRME_PAZIENTI").getPublicUrl(fileName)
      const url = URL.createObjectURL(new Blob([out] as any, { type: "application/pdf" }))
      Object.assign(document.createElement("a"), { href: url, download: `${selectedModulo.nome}-${patient.surname}-${patient.name}-firmato.pdf` }).click()
      URL.revokeObjectURL(url)
      await supabase.from("documents").insert([{ patient_id: id, document_type: selectedModulo.id, file_url: publicUrl }])
      setSignedDocs(prev => [...prev, { type: selectedModulo.id, url: publicUrl }])
      patientSigRef.current?.clear(); doctorSigRef.current?.clear(); anestesistaRef.current?.clear()
      alert(`✅ ${selectedModulo.nome} firmato e salvato su Cloud!`)
    } catch (err: any) { alert("❌ Errore: " + err.message) }
    setSaving(false)
  }

  if (loading) return <div style={{ padding: 40, color: "var(--text-muted)" }}>Caricamento...</div>

  return (
    <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", minHeight: "calc(100vh - 57px)" }}>
      {/* Sidebar Moduli */}
      <aside style={{ background: "white", borderRight: "1px solid var(--border)", padding: "24px 16px", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px", color: "var(--text-muted)" }}>
          <Info size={16} />
          <span style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>Libreria Moduli</span>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {MODULI.map(m => {
            const isSigned = signedDocs.some(s => s.type === m.id)
            const isSelected = selectedModulo?.id === m.id
            return (
              <div key={m.id} onClick={() => setSelectedModulo(m)}
                style={{
                  padding: "12px 16px", borderRadius: "12px", cursor: "pointer",
                  background: isSelected ? "var(--primary-light)" : "transparent",
                  border: isSelected ? "1px solid var(--primary)" : "1px solid transparent",
                  transition: "all 0.2s"
                }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ color: isSelected ? "var(--primary)" : "var(--text-muted)" }}><FileText size={18} /></div>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: isSelected ? "var(--primary)" : "var(--text-main)" }}>{m.nome}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{m.quando}</div>
                    </div>
                  </div>
                  {isSigned && <CheckCircle2 size={16} color="#16a34a" />}
                </div>
              </div>
            )
          })}
        </div>
      </aside>

      {/* Main Area */}
      <main style={{ padding: "32px", overflowY: "auto", background: "var(--content-bg)" }}>
        {!selectedModulo ? (
          <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
            <div style={{ width: "80px", height: "80px", borderRadius: "20px", background: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
              <Search size={40} />
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "10px", color: "var(--text-main)" }}>Seleziona un documento</h2>
            <p style={{ fontSize: "14px" }}>Scegli un modulo dalla lista a sinistra per iniziare la procedura di firma.</p>
          </div>
        ) : (
          <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            {/* Header Modulo */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--primary)", fontWeight: 600, fontSize: "14px", marginBottom: "8px" }}>
                  <Clock size={16} /> {selectedModulo.quando}
                </div>
                <h2 style={{ fontSize: "26px", fontWeight: 800 }}>{selectedModulo.nome}</h2>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <a href={`${BUCKET_URL}/${selectedModulo.file}`} target="_blank" className="sidebar-link" style={{ padding: "8px 16px", background: "white", textDecoration: "none", border: "1px solid var(--border)" }}>
                  <ExternalLink size={16} /> Originale
                </a>
                {signedDocs.find(s => s.type === selectedModulo.id) && (
                  <a href={signedDocs.find(s => s.type === selectedModulo.id)?.url} target="_blank" className="btn-primary" style={{ padding: "8px 20px", textDecoration: "none", background: "#16a34a" }}>
                    <Download size={18} /> Scarica Firmato
                  </a>
                )}
              </div>
            </div>

            {/* Grid Content */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "24px" }}>
              <div>
                {/* Anteprima Card */}
                <div className="card" style={{ padding: "0", overflow: "hidden", marginBottom: "24px", minHeight: "500px" }}>
                   <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", background: "#f9fafb" }}>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Anteprima Modulo</span>
                   </div>
                   <iframe src={`${BUCKET_URL}/${selectedModulo.file}#toolbar=0`} style={{ width: "100%", height: "600px", border: "none" }} />
                </div>
              </div>

              <div>
                {/* Firme Card */}
                <div className="card" style={{ marginBottom: "24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                    <PenTool size={18} color="var(--primary)" />
                    <h3 style={{ fontSize: "15px" }}>Pannello Firme</h3>
                  </div>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {[
                      { label: "Firma Paziente", ref: patientSigRef, show: true },
                      { label: "Firma Medico", ref: doctorSigRef, show: true },
                      { label: "Firma Anestesista", ref: anestesistaRef, show: selectedModulo?.id === 2 },
                    ].filter(s => s.show).map(({ label, ref }) => (
                      <div key={label}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                          <span style={{ fontSize: "13px", fontWeight: 600 }}>{label}</span>
                          <button onClick={() => ref.current?.clear()} style={{ color: "var(--danger)", background: "transparent", border: "none", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}>
                            <Trash2 size={14} /> Cancella
                          </button>
                        </div>
                        <div style={{ background: "#ffffff", borderRadius: "10px", border: "1px solid #cbd5e1", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)", overflow: "hidden" }}>
                          <SignatureCanvas ref={ref} canvasProps={{ style: { width: "100%", height: "80px" } }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={saveSignedDoc} 
                    disabled={saving} 
                    className="btn-primary" 
                    style={{ width: "100%", marginTop: "32px", height: "54px", fontSize: "15px", gap: "10px" }}
                  >
                    {saving ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
                    {saving ? "Generazione PDF..." : "Firma e Salva Documento"}
                  </button>
                </div>

                {/* Info Card */}
                <div className="card" style={{ background: "#f8fafc" }}>
                  <h4 style={{ fontSize: "13px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Info size={16} /> Note sulla compilazione
                  </h4>
                  <ul style={{ paddingLeft: "18px", fontSize: "12px", color: "var(--text-muted)", lineHeight: "1.6" }}>
                    <li>Il PDF verrà compilato automaticamente con i dati anagrafici del paziente.</li>
                    <li>Le firme verranno posizionate esattamente nei campi preposti.</li>
                    <li>Una copia verrà salvata permanentemente su Supabase Storage.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
