"use client"

import React, { useRef, useState } from "react"
import SignatureCanvas from "react-signature-canvas"
import { Eraser, Pencil, Download, Check, Save } from "lucide-react"

interface DrawingPadProps {
  onSave?: (dataUrl: string) => void
  onClose?: () => void
  bgImage?: string
}

export const DrawingPad = ({ onSave, onClose, bgImage }: DrawingPadProps) => {
  const sigRef = useRef<any>(null)
  const [color, setColor] = useState("#2dd4bf")

  return (
    <div style={{ background: "var(--surface)", borderRadius: "24px", border: "1px solid var(--border)", padding: "24px", display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "800px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ fontSize: "18px", fontWeight: 800 }}>Clinical Planning Pad</h3>
          <p style={{ fontSize: "12px", opacity: 0.6 }}>Disegna le linee di intervento o note grafiche</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => sigRef.current?.clear()} style={{ padding: "8px 12px", borderRadius: "10px", background: "var(--background)", border: "none", color: "var(--foreground)", cursor: "pointer" }}>
            <Eraser size={18} />
          </button>
          <button 
            onClick={() => onSave?.(sigRef.current?.toDataURL())}
            style={{ padding: "8px 24px", borderRadius: "10px", background: "var(--primary)", border: "none", color: "white", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
          >
            <Check size={18} /> SALVA
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: "12px" }}>
        {["#2dd4bf", "#f43f5e", "#3b82f6", "#000000"].map(c => (
          <button 
            key={c}
            onClick={() => setColor(c)}
            style={{ width: "32px", height: "32px", borderRadius: "50%", background: c, border: color === c ? "3px solid white" : "none", cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}
          />
        ))}
      </div>

      <div style={{ 
        position: "relative", 
        background: "white", 
        borderRadius: "16px", 
        overflow: "hidden", 
        border: "1px solid var(--border)",
        height: "400px",
        display: "flex",
        justifyContent: "center"
      }}>
        {bgImage && (
          <img src={bgImage} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", opacity: 0.5 }} />
        )}
        <SignatureCanvas
          ref={sigRef}
          penColor={color}
          canvasProps={{ width: 750, height: 400, className: "sigCanvas" }}
          backgroundColor="transparent"
        />
      </div>
      
      <button onClick={onClose} style={{ border: "none", background: "transparent", color: "var(--foreground)", opacity: 0.4, fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>CHIUDI SENZA SALVARE</button>
    </div>
  )
}
