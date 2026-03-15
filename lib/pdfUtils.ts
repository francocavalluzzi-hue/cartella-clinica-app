import { PDFDocument, rgb, StandardFonts } from "pdf-lib"

export async function sigToBytes(sigRef: any): Promise<ArrayBuffer | null> {
  if (!sigRef.current || sigRef.current.isEmpty()) return null
  const trimmedCanvas = sigRef.current.getTrimmedCanvas()
  return fetch(trimmedCanvas.toDataURL("image/png")).then(r => r.arrayBuffer())
}

export async function embedSig(pdfDoc: PDFDocument, bytes: ArrayBuffer) {
  return pdfDoc.embedPng(bytes)
}

export async function fillSchedaAnagrafica(pdfDoc: PDFDocument, patient: any, patB: ArrayBuffer | null, docB: ArrayBuffer | null) {
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

export async function fillCartellaClinica(pdfDoc: PDFDocument, patient: any, patB: ArrayBuffer | null, docB: ArrayBuffer | null) {
  const pages = pdfDoc.getPages(); const font = await pdfDoc.embedStandardFont(StandardFonts.HelveticaBold); const black = rgb(0, 0, 0); const fs = 11.5; const p1 = pages[0]; const { height: H } = p1.getSize()
  const draw = (text: string, x: number, y_top: number) => { if (text) p1.drawText(text, { x, y: H - y_top - 0.5, size: fs, font, color: black }) }
  draw(patient.surname || "", 102, 160); draw(patient.name || "", 332, 160)
}

export async function fillConsensoAnestesia(pdfDoc: PDFDocument, patient: any, patB: ArrayBuffer | null, docB: ArrayBuffer | null, anestB: ArrayBuffer | null) {
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

export async function fillGenericPDF(pdfDoc: PDFDocument, patient: any, patB: ArrayBuffer | null, docB: ArrayBuffer | null) {
  const pages = pdfDoc.getPages(); const font = await pdfDoc.embedStandardFont(StandardFonts.HelveticaBold); const fs = 10; const black = rgb(0, 0, 0)
  if (pages.length > 0) { const p1 = pages[0]; const { height: H1 } = p1.getSize(); p1.drawText(`${patient.name || ""} ${patient.surname || ""}`, { x: 138, y: H1 - 107.5, size: fs, font, color: black }) }
  const lp = pages[pages.length - 1]; const sw = 80, sh = 18; if (patB) lp.drawImage(await embedSig(pdfDoc, patB), { x: 130, y: 346, width: sw, height: sh })
  if (docB) lp.drawImage(await embedSig(pdfDoc, docB), { x: 130, y: 303, width: sw, height: sh })
}

export async function fillLetteraDimissioni(pdfDoc: PDFDocument, patient: any, patB: ArrayBuffer | null, docB: ArrayBuffer | null) {
  const pages = pdfDoc.getPages(); const font = await pdfDoc.embedStandardFont(StandardFonts.HelveticaBold); const fs = 11; const black = rgb(0, 0, 0); const p1 = pages[0]; const { height: H } = p1.getSize()
  if (patient) { p1.drawText(`${patient.name || ""} ${patient.surname || ""}`, { x: 280, y: H - 138, size: fs, font, color: black }) }
  const sw = 100, sh = 18; if (patB) p1.drawImage(await embedSig(pdfDoc, patB), { x: 135, y: 163, width: sw, height: sh })
  if (docB) p1.drawImage(await embedSig(pdfDoc, docB), { x: 388, y: 163, width: sw, height: sh })
}

export async function fillRicettaPrescrizioni(pdfDoc: PDFDocument, patient: any, docB: ArrayBuffer | null) {
  const pages = pdfDoc.getPages(); const font = await pdfDoc.embedStandardFont(StandardFonts.HelveticaBold); const fs = 10; const black = rgb(0, 0, 0); const p1 = pages[0]; const { height: H } = p1.getSize()
  if (patient) { p1.drawText(`${patient.name || ""} ${patient.surname || ""}`, { x: 182, y: H - 215, size: fs, font, color: black }) }
  const sw = 100, sh = 18; if (docB) p1.drawImage(await embedSig(pdfDoc, docB), { x: 400, y: 115, width: sw, height: sh })
}

export async function fillTabellaMedicazioni(pdfDoc: PDFDocument, patient: any) {
  const pages = pdfDoc.getPages(); const font = await pdfDoc.embedStandardFont(StandardFonts.HelveticaBold); const fs = 11; const black = rgb(0, 0, 0); const p1 = pages[0]; const { height: H } = p1.getSize()
  if (patient) { p1.drawText(`${patient.name || ""} ${patient.surname || ""}`, { x: 132, y: H - 86, size: fs, font, color: black }) }
}

export async function fillChirurgiaAmbulatoriale(pdfDoc: PDFDocument, patient: any, docB: ArrayBuffer | null) {
  const pages = pdfDoc.getPages(); const font = await pdfDoc.embedStandardFont(StandardFonts.HelveticaBold); const fs = 11; const black = rgb(0, 0, 0); const p1 = pages[0]; const { height: H } = p1.getSize()
  if (patient) { p1.drawText(`${patient.name || ""} ${patient.surname || ""}`, { x: 152, y: H - 193, size: fs, font, color: black }) }
  const sw = 100, sh = 18; if (docB) p1.drawImage(await embedSig(pdfDoc, docB), { x: 380, y: 188, width: sw, height: sh })
}

export async function generatePrivacyConsentPDF(patient: any, patB: ArrayBuffer | null, idPhotoB: ArrayBuffer | null) {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595.28, 841.89]) // A4
  const font = await pdfDoc.embedStandardFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedStandardFont(StandardFonts.HelveticaBold)
  const { width, height } = page.getSize()

  const centerX = (text: string, size: number, f: any) => {
    const tw = f.widthOfTextAtSize(text, size)
    return (width - tw) / 2
  }

  // Header
  const title = "Modulo di Adesione al servizio di Firma Elettronica Avanzata (“FEA”)"
  page.drawText(title, { x: centerX(title, 16, fontBold), y: height - 50, size: 16, font: fontBold })

  // Section A
  page.drawText("A) Condizioni relative al servizio di Firma Elettronica Avanzata (“FEA”)", { x: 50, y: height - 90, size: 12, font: fontBold })
  
  const sections = [
    { t: "1. Premesse", c: "Lo Studio COSMEDIC SRL (di seguito, “STUDIO”), per il tramite del partner realizzatore tecnologico B&B SOLUTIONS, ha introdotto un’innovativa soluzione informatica che consente al Cliente di sottoscrivere elettronicamente la documentazione Medica e contrattuale. La sottoscrizione dei documenti avviene mediante l’utilizzo di firma elettronica avanzata (FEA) cioè una modalità di firma che possiede i requisiti giuridici e informatici previsti dal Decreto Legislativo n. 82/2005 (CAD) e dal DPCM del 22 Febbraio 2013." },
    { t: "2. Definizioni", c: "Ai fini delle Condizioni, si intendono qui integralmente riportate e trascritte le definizioni contenute nel CAD, nonché quelle di cui alle Regole Tecniche." },
    { t: "3. Soggetto erogatore", c: "Lo STUDIO è l’erogatore della soluzione di Firma Elettronica Avanzata (art 55, comma 2, lettera a del DPCM 22-02-2013)." },
    { t: "4. Oggetto del Servizio", c: "Le presenti condizioni disciplinano l’erogazione gratuita e facoltativa di una “FEA” da parte dello STUDIO ai propri Pazienti. La Firma Elettronica FEA garantisce l'identificazione del firmatario, la connessione univoca della firma, il controllo esclusivo e l’integrità del documento." },
    { t: "5. Attivazione del servizio", c: "L’attivazione è subordinata all’adesione del Paziente, identificato dallo STUDIO mediante lo scatto di una foto dal cliente munito di un suo documento d’identità valido." },
    { t: "6. Descrizione sistema", c: "La soluzione adottata garantisce l'immodificabilità tramite hash del documento e certificato tecnico PAdES. Una copia completa sarà recapitiata via Mail." }
  ]

  let currY = height - 120
  sections.forEach(s => {
    page.drawText(s.t, { x: 60, y: currY, size: 10, font: fontBold })
    currY -= 12
    page.drawText(s.c, { x: 60, y: currY, size: 9, font, maxWidth: width - 110, lineHeight: 11 })
    const lines = font.widthOfTextAtSize(s.c, 9) / (width - 110)
    currY -= (Math.ceil(lines) * 11) + 8
  })

  // Identification Photo (Added)
  if (idPhotoB) {
    try {
      const idImg = await pdfDoc.embedJpg(idPhotoB)
      const imgW = 120, imgH = 90
      page.drawText("Foto Identificativa (Riconoscimento de Visu):", { x: 60, y: currY - 10, size: 10, font: fontBold })
      page.drawImage(idImg, { x: 60, y: currY - 110, width: imgW, height: imgH })
      currY -= 125
    } catch (e) { console.error("Error embedding photo:", e) }
  }

  // Remaining Sections A
  const restA = [
    { t: "7. Copertura assicurativa", c: "Lo STUDIO dispone di adeguata polizza assicurativa stipulata con primaria assicurazione abilitata." },
    { t: "8. Limiti d'uso", c: "La FEA può essere utilizzata solo per i rapporti giuridici che intercorrono tra il Paziente ed il Soggetto Erogatore." },
    { t: "9. Foro Competente", c: "Si individua quale Foro Esclusivo quello di MILANO." }
  ]
  restA.forEach(s => {
    page.drawText(s.t, { x: 60, y: currY, size: 10, font: fontBold })
    currY -= 12
    page.drawText(s.c, { x: 60, y: currY, size: 9, font, maxWidth: width - 110, lineHeight: 11 })
    const lines = font.widthOfTextAtSize(s.c, 9) / (width - 110)
    currY -= (Math.ceil(lines) * 11) + 8
  })

  // Section B
  currY -= 10
  page.drawText("B) Adesione al servizio di Firma Elettronica Avanzata (a cura del Cliente)", { x: 50, y: currY, size: 12, font: fontBold })
  currY -= 25

  page.drawText("Il sottoscritto", { x: 50, y: currY, size: 10, font })
  const nameText = `${patient.surname?.toUpperCase()} ${patient.name?.toUpperCase()}`
  page.drawText(nameText, { x: 120, y: currY, size: 10, font: fontBold })
  page.drawLine({ start: { x: 120, y: currY - 2 }, end: { x: 300, y: currY - 2 }, thickness: 0.5 })

  currY -= 20
  page.drawText("Nato a", { x: 50, y: currY, size: 10, font })
  page.drawText(patient.birth_place || "", { x: 90, y: currY, size: 10, font })
  page.drawLine({ start: { x: 90, y: currY - 2 }, end: { x: 200, y: currY - 2 }, thickness: 0.5 })
  
  page.drawText("il giorno", { x: 210, y: currY, size: 10, font })
  page.drawText(patient.birthdate || "", { x: 260, y: currY, size: 10, font })
  page.drawLine({ start: { x: 260, y: currY - 2 }, end: { x: 350, y: currY - 2 }, thickness: 0.5 })

  currY -= 30
  page.drawRectangle({ x: 55, y: currY - 5, width: 12, height: 12, borderWidth: 1, borderColor: rgb(0,0,0) })
  page.drawText("X", { x: 58, y: currY - 2, size: 10, font: fontBold })
  
  const enrollmentText = "Chiede di poter aderire al servizio di Firma Elettronica avanzata (“FEA”), adottato dallo STUDIO, disciplinato dal presente documento, dal Decreto Legislativo 7 marzo 2005, n. 82, e s.m.i., recante Codice dell’Amministrazione Digitale."
  page.drawText(enrollmentText, { x: 80, y: currY + 4, size: 8.5, font, maxWidth: width - 130, lineHeight: 10 })

  if (patB) {
    const patImg = await pdfDoc.embedPng(patB)
    currY -= 70
    page.drawText("Firma del Paziente per accettazione:", { x: 350, y: currY, size: 10, font: fontBold })
    page.drawImage(patImg, { x: 350, y: currY - 45, width: 150, height: 40 })
    page.drawText(`${patient.name} ${patient.surname}`, { x: 350, y: currY - 58, size: 9, font })
    page.drawText(`Data: ${new Date().toLocaleDateString("it-IT")}`, { x: 50, y: currY - 58, size: 9, font })
  }

  return pdfDoc.save()
}
