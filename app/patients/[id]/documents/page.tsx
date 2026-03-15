"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "../../../../lib/supabaseClient"
import { PDFDocument, rgb, StandardFonts } from "pdf-lib"
import SignatureCanvas from "react-signature-canvas"
import { 
  FileText, 
  CheckCircle, 
  Search, 
  Download, 
  Trash2, 
  PenTool,
  Clock,
  ArrowLeft,
  Info,
  ExternalLink,
  Loader2
} from "lucide-react"

const BUCKET_URL = "https://zyieuliuxvonvtldyqzk.supabase.co/storage/v1/object/public/MODULI%20X%20APP"

const MODULI = [
  { id: 0, nome: "Scheda Anagrafica", file: "0%20SCHEDA%20ANAGRAFICA%202026.pdf", icon: <FileText size={18} />, quando: "Prima visita" },
  { id: 1, nome: "Cartella Clinica", file: "1%20cartella%20clinica.pdf", icon: <FileText size={18} />, quando: "Prima visita" },
  { id: 2, nome: "Consenso Anestesia", file: "2%20consenso%20anestesia%2C%20liberatoria%2C%20richiesta%20cart%20clin.pdf", icon: <FileText size={18} />, quando: "Pre-intervento" },
  { id: 3, nome: "Consenso Generico", file: "3%20Consenso%20Generico%20.pdf", icon: <FileText size={18} />, quando: "Pre-intervento" },
  { id: 4, nome: "Lettera Dimissioni", file: "4%20Lettera%20Dimissioni%20Pazienti.pdf", icon: <FileText size={18} />, quando: "Post-intervento" },
  { id: 5, nome: "Ricetta Prescrizioni", file: "5%20Ricetta%20PRESCRIZIONE%20medica%20dimissione.pdf", icon: <FileText size={18} />, quando: "Post-intervento" },
  { id: 6, nome: "Tabella Medicazioni", file: "6%20Tabella%20Medicazioni.pdf", icon: <FileText size={18} />, quando: "Follow-up" },
  { id: 7, nome: "Chirurgia Ambulatoriale", file: "7%20Chirurgia%20ambulatoriale.pdf", icon: <FileText size={18} />, quando: "Pre-intervento" },
]

async function sigToBytes(sigRef: any): Promise<ArrayBuffer | null> {
  if (!sigRef.current || sigRef.current.isEmpty()) return null
  const trimmedCanvas = sigRef.current.getTrimmedCanvas()
  return fetch(trimmedCanvas.toDataURL("image/png")).then(r => r.arrayBuffer())
}

async function embedSig(pdfDoc: PDFDocument, bytes: ArrayBuffer) {
  return pdfDoc.embedPng(bytes)
}

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
  async function fillSchedaAnagrafica(pdfDoc: PDFDocument, patient: any, patB: ArrayBuffer | null, docB: ArrayBuffer | null) {
    const pages = pdfDoc.getPages(); const font = await pdfDoc.embedStandardFont(StandardFonts.HelveticaBold); const black = rgb(0, 0, 0); const fs = 9; const p1 = pages[0]
    const draw1 = (text: string, x: number, y: number) => { if (text) p1.drawText(text, { x, y, size: fs, font, color: black }) }
    draw1(new Date().toLocaleDateString("it-IT"), 509.9, 757.2); draw1(patient.surname || "", 102.9, 742.2); draw1(patient.name || "", 358.9, 742.2)
    draw1(patient.birthdate || "", 150.9, 727.2); draw1(patient.fiscal_code || "", 389.9, 727.2); draw1(patient.address || "", 82.9, 712.2)
    draw1(patient.phone || "", 102.9, 695.0); draw1(patient.email || "", 369.9, 695.0)
    const patImg1 = patB ? await embedSig(pdfDoc, patB) : null; if (patImg1) p1.drawImage(patImg1, { x: 340.2, y: 316.4, width: 120, height: 12 })
    const docImg1 = docB ? await embedSig(pdfDoc, docB) : null; if (docImg1) p1.drawImage(docImg1, { x: 104.3, y: 99.8, width: 110, height: 12 })
    if (patImg1) p1.drawImage(patImg1, { x: 347.4, y: 99.8, width: 110, height: 12 })
    const p2 = pages[1]; if (patB) p2.drawImage(await embedSig(pdfDoc, patB), { x: 148.7, y: 438.6, width: 115, height: 18 })
    if (docB) p2.drawImage(await embedSig(pdfDoc, docB), { x: 372.7, y: 438.6, width: 115, height: 18 })
    const p4 = pages[3]; const sh = 12; const sw = 90
    if (patB) p4.drawImage(await embedSig(pdfDoc, patB), { x: 393, y: 714.9, width: sw, height: sh })
    if (patB) p4.drawImage(await embedSig(pdfDoc, patB), { x: 390, y: 663.3, width: sw, height: sh })
    if (patB) p4.drawImage(await embedSig(pdfDoc, patB), { x: 393, y: 594.5, width: sw, height: sh })
    if (patB) p4.drawImage(await embedSig(pdfDoc, patB), { x: 393, y: 470.0, width: sw, height: sh })
    if (patB) p4.drawImage(await embedSig(pdfDoc, patB), { x: 393, y: 427.0, width: sw, height: sh })
    if (docB) p4.drawImage(await embedSig(pdfDoc, docB), { x: 152.2, y: 401.4, width: sw, height: sh })
    if (patB) p4.drawImage(await embedSig(pdfDoc, patB), { x: 391.2, y: 101.9, width: sw, height: sh })
  }

  async function fillCartellaClinica(pdfDoc: PDFDocument, patient: any, patB: ArrayBuffer | null, docB: ArrayBuffer | null) {
    const pages = pdfDoc.getPages(); const font = await pdfDoc.embedStandardFont(StandardFonts.HelveticaBold); const black = rgb(0, 0, 0); const fs = 11.5; const p1 = pages[0]; const { height: H } = p1.getSize()
    const draw = (text: string, x: number, y_top: number) => { if (text) p1.drawText(text, { x, y: H - y_top - 0.5, size: fs, font, color: black }) }
    draw(patient.surname || "", 102, 160); draw(patient.name || "", 332, 160)
  }

  async function fillConsensoAnestesia(pdfDoc: PDFDocument, patient: any, patB: ArrayBuffer | null, docB: ArrayBuffer | null, anestB: ArrayBuffer | null) {
    const pages = pdfDoc.getPages(); const font = await pdfDoc.embedStandardFont(StandardFonts.HelveticaBold); const black = rgb(0, 0, 0); const fs = 11.5; const p1 = pages[0]; const { height: H } = p1.getSize()
    const draw = (text: string, x: number, y_top: number) => { if (text) p1.drawText(text, { x, y: H - y_top - 0.5, size: fs, font, color: black }) }
    draw(`${patient.name || ""} ${patient.surname || ""}`, 130, 105)
    const sw = 80, sh = 18; if (patB) p1.drawImage(await embedSig(pdfDoc, patB), { x: 350, y: 402, width: sw, height: sh })
    if (docB) p1.drawImage(await embedSig(pdfDoc, docB), { x: 350, y: 359, width: sw, height: sh })
    if (patB) p1.drawImage(await embedSig(pdfDoc, patB), { x: 300, y: 117, width: sw, height: sh })
    if (pages.length >= 2) {
      const p2 = pages[1]; const { height: H2 } = p2.getSize()
      const drawP2 = (text: string, x: number, y_top: number) => { if (text) p2.drawText(text, { x, y: H2 - y_top - 0.5, size: fs, font, color: black }) }
      drawP2(`${patient.name || ""} ${patient.surname || ""}`, 120, 92)
      const sw2 = 90, sh2 = 16
      if (patB) p2.drawImage(await embedSig(pdfDoc, patB), { x: 129, y: 124, width: sw2, height: sh2 })
      if (anestB) p2.drawImage(await embedSig(pdfDoc, anestB), { x: 370, y: 124, width: sw2, height: sh2 })
    }
  }

  async function fillGenericPDF(pdfDoc: PDFDocument, patient: any, patB: ArrayBuffer | null, docB: ArrayBuffer | null) {
    const pages = pdfDoc.getPages(); const font = await pdfDoc.embedStandardFont(StandardFonts.HelveticaBold); const fs = 10; const black = rgb(0, 0, 0)
    if (pages.length > 0) { const p1 = pages[0]; const { height: H1 } = p1.getSize(); p1.drawText(`${patient.name || ""} ${patient.surname || ""}`, { x: 138, y: H1 - 107.5, size: fs, font, color: black }) }
    const lp = pages[pages.length - 1]; const sw = 80, sh = 18; if (patB) lp.drawImage(await embedSig(pdfDoc, patB), { x: 130, y: 346, width: sw, height: sh })
    if (docB) lp.drawImage(await embedSig(pdfDoc, docB), { x: 130, y: 303, width: sw, height: sh })
  }

  async function fillLetteraDimissioni(pdfDoc: PDFDocument, patient: any, patB: ArrayBuffer | null, docB: ArrayBuffer | null) {
    const pages = pdfDoc.getPages(); const font = await pdfDoc.embedStandardFont(StandardFonts.HelveticaBold); const fs = 11; const black = rgb(0, 0, 0); const p1 = pages[0]; const { height: H } = p1.getSize()
    if (patient) { p1.drawText(`${patient.name || ""} ${patient.surname || ""}`, { x: 280, y: H - 138, size: fs, font, color: black }) }
    const sw = 100, sh = 18; if (patB) p1.drawImage(await embedSig(pdfDoc, patB), { x: 135, y: 163, width: sw, height: sh })
    if (docB) p1.drawImage(await embedSig(pdfDoc, docB), { x: 388, y: 163, width: sw, height: sh })
  }

  async function fillRicettaPrescrizioni(pdfDoc: PDFDocument, patient: any, docB: ArrayBuffer | null) {
    const pages = pdfDoc.getPages(); const font = await pdfDoc.embedStandardFont(StandardFonts.HelveticaBold); const fs = 10; const black = rgb(0, 0, 0); const p1 = pages[0]; const { height: H } = p1.getSize()
    if (patient) { p1.drawText(`${patient.name || ""} ${patient.surname || ""}`, { x: 182, y: H - 215, size: fs, font, color: black }) }
    const sw = 100, sh = 18; if (docB) p1.drawImage(await embedSig(pdfDoc, docB), { x: 400, y: 115, width: sw, height: sh })
  }

  async function fillTabellaMedicazioni(pdfDoc: PDFDocument, patient: any) {
    const pages = pdfDoc.getPages(); const font = await pdfDoc.embedStandardFont(StandardFonts.HelveticaBold); const fs = 11; const black = rgb(0, 0, 0); const p1 = pages[0]; const { height: H } = p1.getSize()
    if (patient) { p1.drawText(`${patient.name || ""} ${patient.surname || ""}`, { x: 132, y: H - 86, size: fs, font, color: black }) }
  }

  async function fillChirurgiaAmbulatoriale(pdfDoc: PDFDocument, patient: any, docB: ArrayBuffer | null) {
    const pages = pdfDoc.getPages(); const font = await pdfDoc.embedStandardFont(StandardFonts.HelveticaBold); const fs = 11; const black = rgb(0, 0, 0); const p1 = pages[0]; const { height: H } = p1.getSize()
    if (patient) { p1.drawText(`${patient.name || ""} ${patient.surname || ""}`, { x: 152, y: H - 193, size: fs, font, color: black }) }
    const sw = 100, sh = 18; if (docB) p1.drawImage(await embedSig(pdfDoc, docB), { x: 380, y: 188, width: sw, height: sh })
  }

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
                    <div style={{ color: isSelected ? "var(--primary)" : "var(--text-muted)" }}>{m.icon}</div>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: isSelected ? "var(--primary)" : "var(--text-main)" }}>{m.nome}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{m.quando}</div>
                    </div>
                  </div>
                  {isSigned && <CheckCircle size={16} color="#16a34a" />}
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
