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
