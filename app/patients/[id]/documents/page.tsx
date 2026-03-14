"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "../../../../lib/supabaseClient"
import { PDFDocument, rgb, StandardFonts } from "pdf-lib"
import SignatureCanvas from "react-signature-canvas"

const BUCKET_URL = "https://zyieuliuxvonvtldyqzk.supabase.co/storage/v1/object/public/MODULI%20X%20APP"

const MODULI = [
  { id: 0, nome: "Scheda Anagrafica", file: "0%20SCHEDA%20ANAGRAFICA%202026.pdf", icon: "📋", quando: "Prima visita" },
  { id: 1, nome: "Cartella Clinica", file: "1%20cartella%20clinica.pdf", icon: "🏥", quando: "Prima visita" },
  { id: 2, nome: "Consenso Anestesia", file: "2%20consenso%20anestesia%2C%20liberatoria%2C%20richiesta%20cart%20clin.pdf", icon: "💉", quando: "Pre-intervento" }, // Aggiornato: coordinate e stili grassetto
  { id: 3, nome: "Consenso Generico", file: "3%20Consenso%20Generico%20.pdf", icon: "📝", quando: "Pre-intervento" },
  { id: 4, nome: "Lettera Dimissioni", file: "4%20Lettera%20Dimissioni%20Pazienti.pdf", icon: "🏠", quando: "Post-intervento" },
  { id: 5, nome: "Ricetta Prescrizioni", file: "5%20Ricetta%20PRESCRIZIONE%20medica%20dimissione.pdf", icon: "💊", quando: "Post-intervento" },
  { id: 6, nome: "Tabella Medicazioni", file: "6%20Tabella%20Medicazioni.pdf", icon: "🩺", quando: "Follow-up" },
  { id: 7, nome: "Chirurgia Ambulatoriale", file: "7%20Chirurgia%20ambulatoriale.pdf", icon: "🔪", quando: "Pre-intervento" },
]

async function sigToBytes(sigRef: any): Promise<ArrayBuffer | null> {
  if (!sigRef.current || sigRef.current.isEmpty()) return null
  return fetch(sigRef.current.toDataURL("image/png")).then(r => r.arrayBuffer())
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
  const [signedDocs, setSignedDocs] = useState<number[]>([])
  const [saving, setSaving] = useState(false)
  const patientSigRef = useRef<any>(null)
  const doctorSigRef = useRef<any>(null)
  const anestesistaRef = useRef<any>(null)

  useEffect(() => { if (id) { loadPatient(); loadSignedDocs() } }, [id])

  async function loadPatient() {
    const { data } = await supabase.from("patients").select("*").eq("id", id).single()
    setPatient(data)
  }

  async function loadSignedDocs() {
    const { data } = await supabase.from("documents").select("*").eq("patient_id", id)
    setSignedDocs((data || []).map((d: any) => d.document_type))
  }

  async function fillSchedaAnagrafica(
    pdfDoc: PDFDocument, patient: any,
    patB: ArrayBuffer | null, docB: ArrayBuffer | null
  ) {
    const pages = pdfDoc.getPages()
    const font = await pdfDoc.embedStandardFont(StandardFonts.HelveticaBold)
    const black = rgb(0, 0, 0)
    const fs = 9

    // ── PAGINA 1 ──────────────────────────────────────────────────────
    // Coordinate misurate con pymupdf: y_pdf = 841.9 - y1_doc + 1
    // Ogni riga testo ha y1 (bordo inferiore) → y_pdf = H - y1 + 1
    const p1 = pages[0]
    const draw1 = (text: string, x: number, y: number) => {
      if (text) p1.drawText(text, { x, y, size: fs, font, color: black })
    }
    draw1(new Date().toLocaleDateString("it-IT"), 509.9, 757.2)
    draw1(patient.surname || "", 102.9, 742.2)
    draw1(patient.name || "", 358.9, 742.2)
    draw1(patient.birthdate || "", 150.9, 727.2)
    draw1(patient.fiscal_code || "", 389.9, 727.2)
    draw1(patient.address || "", 82.9, 712.2)
    draw1(patient.phone || "", 102.9, 695.0)
    draw1(patient.email || "", 369.9, 695.0)

    // Firma paziente p1 — riga "Firma____" y0_doc=525.52 → y_pdf_top=316.4
    // Immagine alta 20pt, la posiziono a y = 316.4 - 20 = 296.4
    const patImg1 = patB ? await embedSig(pdfDoc, patB) : null
    if (patImg1) p1.drawImage(patImg1, { x: 340.2, y: 316.4, width: 120, height: 12 })

    // Firma medico p1 riga bassa "Firma medico____" y0_doc=742.13 → y_img=81.8
    const docImg1 = docB ? await embedSig(pdfDoc, docB) : null
    if (docImg1) p1.drawImage(docImg1, { x: 104.3, y: 99.8, width: 110, height: 12 })
    // Firma paziente p1 riga bassa "Firma del paziente____" campo a x=347.4
    if (patImg1) p1.drawImage(patImg1, { x: 347.4, y: 99.8, width: 110, height: 12 })

    // ── PAGINA 2 ──────────────────────────────────────────────────────
    // Riga firma: y0_doc=403.28 → y_pdf_top = 841.9 - 403.28 = 438.6
    // Immagine alta 18pt → y_img = 438.6 - 18 = 420.6
    const p2 = pages[1]
    // "Firma del paziente____" x0=74.80, la scritta finisce a x≈133
    if (patB) p2.drawImage(await embedSig(pdfDoc, patB), { x: 148.7, y: 438.6, width: 115, height: 18 })
    // "Firma del medico____" la parola "Firma" a x0=303.3, finisce a x≈357
    if (docB) p2.drawImage(await embedSig(pdfDoc, docB), { x: 372.7, y: 438.6, width: 115, height: 18 })

    // ── PAGINA 4 ──────────────────────────────────────────────────────
    // y_img = H - y0_doc - img_h  (immagine occupa lo spazio sopra la riga)
    const p4 = pages[3]
    const sh = 12  // signature height
    const sw = 90  // signature width
    // Firma A: y0_doc=127.02 → y_img = 841.9 - 127.02 - 14 = 700.9, x=393.65
    if (patB) p4.drawImage(await embedSig(pdfDoc, patB), { x: 393, y: 714.9, width: sw, height: sh })
    // Firma B: y0_doc=178.63 → y_img=649.3, x=390.15
    if (patB) p4.drawImage(await embedSig(pdfDoc, patB), { x: 390, y: 663.3, width: sw, height: sh })
    // Firma C: y0_doc=247.42 → y_img=580.5, x=393.65
    if (patB) p4.drawImage(await embedSig(pdfDoc, patB), { x: 393, y: 594.5, width: sw, height: sh })
    // Firma D: y0_doc=371.88 → y_img=456.0, x=393.65
    if (patB) p4.drawImage(await embedSig(pdfDoc, patB), { x: 393, y: 470.0, width: sw, height: sh })
    // Firma E: y0_doc=414.88 → y_img=413.0, x=393.65
    if (patB) p4.drawImage(await embedSig(pdfDoc, patB), { x: 393, y: 427.0, width: sw, height: sh })
    // Il Responsabile: y0_doc=440.47 → y_img=387.4, x=189 (dopo "Il Responsabile____")
    if (docB) p4.drawImage(await embedSig(pdfDoc, docB), { x: 152.2, y: 401.4, width: sw, height: sh })
    // Firma paziente finale: y0_doc=739.98 → y_img=87.9, x=460 (dopo "Firma paziente:____")
    if (patB) p4.drawImage(await embedSig(pdfDoc, patB), { x: 391.2, y: 101.9, width: sw, height: sh })
  }

  async function fillCartellaClinica(
    pdfDoc: PDFDocument, patient: any,
    patB: ArrayBuffer | null, docB: ArrayBuffer | null
  ) {
    const pages = pdfDoc.getPages()
    const font = await pdfDoc.embedStandardFont(StandardFonts.HelveticaBold)
    const black = rgb(0, 0, 0)
    const fs = 11.5
    const p1 = pages[0]
    const { height: H } = p1.getSize()

    const draw = (text: string, x: number, y_top: number) => {
      if (text) p1.drawText(text, { x, y: H - y_top - 0.5, size: fs, font, color: black })
    }

    draw(patient.surname || "", 102, 160)
    draw(patient.name || "", 332, 160)
  }

  async function fillConsensoAnestesia(
    pdfDoc: PDFDocument, patient: any,
    patB: ArrayBuffer | null, docB: ArrayBuffer | null,
    anestB: ArrayBuffer | null
  ) {
    const pages = pdfDoc.getPages()
    const font = await pdfDoc.embedStandardFont(StandardFonts.HelveticaBold)
    const black = rgb(0, 0, 0)
    const fs = 11.5
    const p1 = pages[0]
    const { height: H } = p1.getSize()

    const draw = (text: string, x: number, y_top: number) => {
      if (text) p1.drawText(text, { x, y: H - y_top - 0.5, size: fs, font, color: black })
    }

    // Nome e Cognome
    draw(`${patient.name || ""} ${patient.surname || ""}`, 130, 105)

    // Firme pagina 1
    const sw = 100, sh = 25
    if (patB) p1.drawImage(await embedSig(pdfDoc, patB), { x: 350, y: 407, width: sw, height: sh }) // Firma paziente
    if (docB) p1.drawImage(await embedSig(pdfDoc, docB), { x: 350, y: 359, width: sw, height: sh }) // Firma medico
    // Firma finale in fondo alla pagina 1
    if (patB) p1.drawImage(await embedSig(pdfDoc, patB), { x: 380, y: 110, width: sw, height: sh })

    // Firme pagina 2: "Firma Paziente" e "Firma Anestesista"
    if (pages.length >= 2) {
      const p2 = pages[1]
      const { height: H2 } = p2.getSize()
      const sw2 = 110, sh2 = 20
      // Riga "Firma Paziente / Firma Anestesista" — alzate rispetto al footer
      if (patB) p2.drawImage(await embedSig(pdfDoc, patB), { x: 65, y: 115, width: sw2, height: sh2 })       // Firma Paziente p2
      if (anestB) p2.drawImage(await embedSig(pdfDoc, anestB), { x: 340, y: 115, width: sw2, height: sh2 }) // Firma Anestesista p2
    }

    // Pagina 3: "CONSENSO INFORMATO ALL'ANESTESIA" — campo "Io sottoscritto"
    if (pages.length >= 3) {
      const p3 = pages[2]
      const { height: H3 } = p3.getSize()
      const drawP3 = (text: string, x: number, y_top: number) => {
        if (text) p3.drawText(text, { x, y: H3 - y_top - 0.5, size: fs, font, color: black })
      }
      drawP3(`${patient.name || ""} ${patient.surname || ""}`, 110, 118) // "Io sottoscritto ___"
    }
  }


  async function fillGenericPDF(
    pdfDoc: PDFDocument, patient: any,
    patB: ArrayBuffer | null, docB: ArrayBuffer | null
  ) {
    const pages = pdfDoc.getPages()
    const font = await pdfDoc.embedStandardFont(StandardFonts.Helvetica)
    const gray = rgb(0.4, 0.4, 0.4)
    const lp = pages[pages.length - 1]
    const { width: lw } = lp.getSize()
    if (patB) lp.drawImage(await embedSig(pdfDoc, patB), { x: 50, y: 80, width: 130, height: 35 })
    if (docB) lp.drawImage(await embedSig(pdfDoc, docB), { x: lw - 190, y: 80, width: 130, height: 35 })
    lp.drawText("Firma Paziente", { x: 50, y: 70, size: 7, font, color: gray })
    lp.drawText("Firma Medico", { x: lw - 190, y: 70, size: 7, font, color: gray })
    lp.drawText(`Data: ${new Date().toLocaleDateString("it-IT")}`, { x: 50, y: 60, size: 7, font, color: gray })
  }

  async function saveSignedDoc() {
    if (!selectedModulo || !patient) return
    const isCartellaClinica = selectedModulo.id === 1
    if (!isCartellaClinica) {
      if (patientSigRef.current?.isEmpty()) return alert("❌ Firma del paziente obbligatoria")
      if (doctorSigRef.current?.isEmpty()) return alert("❌ Firma del medico obbligatoria")
    }
    setSaving(true)
    try {
      const pdfUrl = `${BUCKET_URL}/${selectedModulo.file}`
      const pdfBytes = await fetch(pdfUrl).then(r => r.arrayBuffer())
      const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true })
      const patB = await sigToBytes(patientSigRef)
      const docB = await sigToBytes(doctorSigRef)
      const anestB = await sigToBytes(anestesistaRef)
      if (!isCartellaClinica && (!patB || !docB)) throw new Error("Firme mancanti")
      if (selectedModulo.id === 0) {
        await fillSchedaAnagrafica(pdfDoc, patient, patB, docB)
      } else if (selectedModulo.id === 1) {
        await fillCartellaClinica(pdfDoc, patient, patB, docB)
      } else if (selectedModulo.id === 2) {
        await fillConsensoAnestesia(pdfDoc, patient, patB, docB, anestB)
      } else {
        await fillGenericPDF(pdfDoc, patient, patB, docB)
      }
      const out = await pdfDoc.save()
      const url = URL.createObjectURL(new Blob([out] as any, { type: "application/pdf" }))
      Object.assign(document.createElement("a"), {
        href: url,
        download: `${selectedModulo.nome}-${patient.surname}-${patient.name}-firmato.pdf`
      }).click()
      URL.revokeObjectURL(url)
      await supabase.from("documents").insert([{ patient_id: id, document_type: selectedModulo.id, file_url: pdfUrl }])
      setSignedDocs(prev => [...prev, selectedModulo.id])
      patientSigRef.current?.clear()
      doctorSigRef.current?.clear()
      anestesistaRef.current?.clear()
      alert(`✅ ${selectedModulo.nome} firmato e scaricato!`)
    } catch (err: any) {
      console.error(err)
      alert("❌ Errore: " + err.message)
    }
    setSaving(false)
  }

  if (!patient) return (
    <div style={{ background: "#0f172a", minHeight: "100vh", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontSize: 18, color: "#94a3b8" }}>⏳ Caricamento...</div>
    </div>
  )

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "white", fontFamily: "sans-serif" }}>

      <div style={{ background: "#1e293b", padding: "14px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #334155" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={() => router.push(`/patients/${id}`)}
            style={{ background: "#334155", color: "white", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13 }}>
            ← Scheda Paziente
          </button>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#38bdf8" }}>📄 Documenti Clinici</h1>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ background: "#0f172a", borderRadius: 20, padding: "4px 14px", fontSize: 13, color: "#e2e8f0", fontWeight: 600 }}>
            {patient.name} {patient.surname}
          </div>
          <div style={{ background: "#1d4ed8", borderRadius: 20, padding: "4px 14px", fontSize: 12, color: "white" }}>
            {signedDocs.length}/{MODULI.length} firmati
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "270px 1fr", minHeight: "calc(100vh - 57px)" }}>

        <div style={{ background: "#1e293b", borderRight: "1px solid #334155", padding: "16px 12px", overflowY: "auto" }}>
          <div style={{ color: "#64748b", fontSize: 10, fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>
            Moduli disponibili
          </div>
          {MODULI.map(m => (
            <div key={m.id} onClick={() => setSelectedModulo(m)}
              style={{
                padding: "10px 12px", borderRadius: 10, marginBottom: 5, cursor: "pointer",
                background: selectedModulo?.id === m.id ? "#0f172a" : "transparent",
                border: selectedModulo?.id === m.id ? "1px solid #38bdf8" : "1px solid transparent",
              }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{m.icon}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: selectedModulo?.id === m.id ? "#38bdf8" : "#e2e8f0" }}>{m.nome}</div>
                    <div style={{ fontSize: 10, color: "#64748b", marginTop: 1 }}>{m.quando}</div>
                  </div>
                </div>
                {signedDocs.includes(m.id) && (
                  <span style={{ background: "#14532d", color: "#86efac", padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700 }}>✓</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: 24, overflowY: "auto" }}>
          {!selectedModulo ? (
            <div style={{ textAlign: "center", paddingTop: 100, color: "#64748b" }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>📄</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#94a3b8", marginBottom: 8 }}>Seleziona un modulo</div>
              <div style={{ fontSize: 14 }}>Clicca su un modulo a sinistra per visualizzarlo e firmarlo</div>
            </div>
          ) : (
            <div style={{ maxWidth: 900 }}>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{selectedModulo.icon} {selectedModulo.nome}</h2>
                <a href={`${BUCKET_URL}/${selectedModulo.file}`} target="_blank"
                  style={{ background: "#334155", color: "#94a3b8", padding: "8px 16px", borderRadius: 8, fontSize: 12, textDecoration: "none" }}>
                  🔍 Vedi originale
                </a>
              </div>

              <div style={{ background: "#1e293b", borderRadius: 12, padding: 16, marginBottom: 20, border: "1px solid #334155" }}>
                <div style={{ color: "#38bdf8", fontSize: 11, fontWeight: 700, marginBottom: 12, textTransform: "uppercase" }}>
                  📋 Dati che verranno inseriti nel PDF
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
                  {[
                    { label: "Cognome", value: patient.surname },
                    { label: "Nome", value: patient.name },
                    { label: "Data nascita", value: patient.birthdate || "—" },
                    { label: "Codice Fiscale", value: patient.fiscal_code || "—" },
                    { label: "Telefono", value: patient.phone || "—" },
                    { label: "Email", value: patient.email || "—" },
                    { label: "Indirizzo", value: patient.address || "—" },
                    { label: "Data firma", value: new Date().toLocaleDateString("it-IT") },
                  ].map(f => (
                    <div key={f.label} style={{ background: "#0f172a", borderRadius: 8, padding: "8px 10px" }}>
                      <div style={{ color: "#64748b", fontSize: 10, marginBottom: 3 }}>{f.label}</div>
                      <div style={{ fontSize: 12, fontWeight: 500, color: f.value === "—" ? "#475569" : "#e2e8f0" }}>{f.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: "#1e293b", borderRadius: 12, padding: 16, marginBottom: 20, border: "1px solid #334155" }}>
                <div style={{ color: "#38bdf8", fontSize: 11, fontWeight: 700, marginBottom: 10, textTransform: "uppercase" }}>
                  🔍 Anteprima documento originale
                </div>
                <iframe src={`${BUCKET_URL}/${selectedModulo.file}`}
                  style={{ width: "100%", height: 480, border: "none", borderRadius: 8 }} />
              </div>

              <div style={{ background: "#1e293b", borderRadius: 12, padding: 20, marginBottom: 20, border: "1px solid #334155" }}>
                <div style={{ color: "#38bdf8", fontSize: 11, fontWeight: 700, marginBottom: 16, textTransform: "uppercase" }}>
                  ✍️ Firme digitali
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  {[
                    { label: "Firma Paziente", ref: patientSigRef, show: true },
                    { label: "Firma Medico", ref: doctorSigRef, show: true },
                    { label: "Firma Anestesista", ref: anestesistaRef, show: selectedModulo?.id === 2 },
                  ].filter(s => s.show).map(({ label, ref }) => (
                    <div key={label}>
                      <div style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                        🖊️ {label} {selectedModulo?.id !== 1 && <span style={{ color: "#ef4444" }}>*</span>}
                      </div>
                      <div style={{ background: "white", borderRadius: 10, border: "2px solid #38bdf8", overflow: "hidden" }}>
                        <SignatureCanvas ref={ref}
                          canvasProps={{ style: { width: "100%", height: "100px", display: "block" } }}
                          backgroundColor="white" />
                      </div>
                      <button onClick={() => ref.current?.clear()}
                        style={{ marginTop: 8, background: "#374151", color: "#94a3b8", border: "none", borderRadius: 6, padding: "6px 14px", fontSize: 12, cursor: "pointer" }}>
                        🗑️ Cancella
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={saveSignedDoc} disabled={saving}
                style={{
                  width: "100%",
                  background: saving ? "#334155" : "linear-gradient(135deg, #1d4ed8, #2563eb)",
                  color: "white", border: "none", borderRadius: 12, padding: "18px",
                  fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontSize: 16,
                  boxShadow: saving ? "none" : "0 4px 20px rgba(37,99,235,0.4)"
                }}>
                {saving ? "⏳ Generazione PDF in corso..." : `💾 Firma e Scarica PDF — ${selectedModulo.nome}`}
              </button>

            </div>
          )}
        </div>
      </div>
    </div>
  )
}
