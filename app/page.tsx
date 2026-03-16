"use client"

import Link from "next/link"
import { 
  Monitor, 
  Tablet, 
  UserPlus, 
  ClipboardList, 
  ShieldCheck,
  ArrowRight
} from "lucide-react"

export default function LandingPage() {
  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "var(--background)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Background Decorative Elements */}
      <div style={{ 
        position: "absolute", 
        top: "-10%", 
        right: "-5%", 
        width: "600px", 
        height: "600px", 
        background: "var(--primary)", 
        borderRadius: "50%", 
        filter: "blur(120px)", 
        opacity: 0.1,
        zIndex: 0
      }}></div>

      <div style={{ zIndex: 1, textAlign: "center", marginBottom: "48px" }}>
        <h1 style={{ fontSize: "42px", fontWeight: 800, color: "var(--primary)", marginBottom: "12px", letterSpacing: "-1px" }}>
          COSMEDIC <span style={{ color: "var(--text-main)", fontWeight: 400 }}>Suite</span>
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "18px", fontWeight: 500 }}>Sistema di gestione clinica intelligente e integrata</p>
      </div>

      <div style={{ 
        zIndex: 1,
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", 
        gap: "32px", 
        maxWidth: "1100px", 
        width: "100%" 
      }}>
        
        {/* PORTALE PC */}
        <Link href="/dashboard" style={{ textDecoration: "none" }}>
          <div className="card" style={{ 
            height: "100%", 
            padding: "48px 40px", 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center",
            textAlign: "center",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            cursor: "pointer",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-8px)"
            e.currentTarget.style.borderColor = "var(--primary)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)"
            e.currentTarget.style.borderColor = "var(--border)"
          }}
          >
            <div style={{ 
              width: "80px", 
              height: "80px", 
              borderRadius: "24px", 
              background: "var(--primary)", 
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "24px",
              boxShadow: "0 10px 20px rgba(13, 148, 136, 0.2)"
            }}>
              <Monitor size={40} />
            </div>
            <h2 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-main)", marginBottom: "12px" }}>Portale Amministrativo</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "15px", lineHeight: "1.6", marginBottom: "24px" }}>
              Gestione pazienti, statistiche, procedure e controllo completo della clinica. Ottimizzato per uso desktop.
            </p>
            <div style={{ 
              marginTop: "auto",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "var(--primary)",
              fontWeight: 700
            }}>
              Vai alla Dashboard <ArrowRight size={18} />
            </div>
          </div>
        </Link>

        {/* FUNZIONI TABLET */}
        <div className="card" style={{ 
          height: "100%", 
          padding: "48px 40px", 
          display: "flex", 
          flexDirection: "column", 
          textAlign: "left",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
            <div style={{ 
              width: "60px", 
              height: "60px", 
              borderRadius: "18px", 
              background: "var(--primary-light)", 
              color: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <Tablet size={32} />
            </div>
            <h2 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-main)" }}>Funzioni Tablet</h2>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Link href="/tablet/register" style={{ textDecoration: "none" }}>
              <div style={{ 
                padding: "20px", 
                borderRadius: "16px", 
                background: "var(--background)", 
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--primary)"}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border)"}
              >
                <div style={{ color: "var(--primary)" }}><UserPlus size={24} /></div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: "15px", color: "var(--text-main)" }}>Registra Nuovo Paziente</div>
                  <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>Wizard FEA con acquisizione foto</div>
                </div>
              </div>
            </Link>

            <Link href="/tablet/doctor" style={{ textDecoration: "none" }}>
              <div style={{ 
                padding: "20px", 
                borderRadius: "16px", 
                background: "var(--background)", 
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--primary)"}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border)"}
              >
                <div style={{ color: "var(--primary)" }}><ClipboardList size={24} /></div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: "15px", color: "var(--text-main)" }}>Dashboard Medico</div>
                  <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>Firma moduli e planning chirurgico</div>
                </div>
              </div>
            </Link>
          </div>

          <div style={{ 
            marginTop: "32px",
            padding: "14px",
            borderRadius: "12px", 
            background: "var(--primary-light)",
            color: "var(--primary)",
            fontSize: "12px",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            border: "1px solid var(--primary-hover)22"
          }}>
            <ShieldCheck size={18} />
            Sistema di Firma Elettronica Avanzata Attivo
          </div>
        </div>

      </div>

      <footer style={{ marginTop: "64px", textAlign: "center", fontSize: "13px", color: "var(--text-muted)", zIndex: 1 }}>
        <div>COSMEDIC SRL — Innovazione e Cura del Paziente</div>
        <div style={{ marginTop: "4px", fontSize: "11px", opacity: 0.6 }}>© 2026 Sistema di Gestione Clinica Proprietario</div>
      </footer>
    </div>
  )
}