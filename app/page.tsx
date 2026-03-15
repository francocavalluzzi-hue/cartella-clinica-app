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
      background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px"
    }}>
      {/* Background Decorative Elements */}
      <div style={{ 
        position: "absolute", 
        top: "-10%", 
        right: "-5%", 
        width: "400px", 
        height: "400px", 
        background: "var(--primary-light)", 
        borderRadius: "50%", 
        filter: "blur(80px)", 
        opacity: 0.4,
        zIndex: 0
      }}></div>
      <div style={{ 
        position: "absolute", 
        bottom: "-10%", 
        left: "-5%", 
        width: "300px", 
        height: "300px", 
        background: "#bae6fd", 
        borderRadius: "50%", 
        filter: "blur(60px)", 
        opacity: 0.4,
        zIndex: 0
      }}></div>

      <div style={{ zIndex: 1, textAlign: "center", marginBottom: "48px" }}>
        <h1 style={{ fontSize: "40px", fontWeight: 800, color: "var(--primary)", marginBottom: "12px", letterSpacing: "-1px" }}>
          COSMEDIC <span style={{ color: "var(--text-main)", fontWeight: 400 }}>Suite</span>
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "18px" }}>Benvenuto nel sistema di gestione clinica integrata</p>
      </div>

      <div style={{ 
        zIndex: 1,
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", 
        gap: "32px", 
        maxWidth: "1000px", 
        width: "100%" 
      }}>
        
        {/* PC PORTAL */}
        <Link href="/dashboard" style={{ textDecoration: "none" }}>
          <div className="card" style={{ 
            height: "100%", 
            padding: "40px", 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center",
            textAlign: "center",
            transition: "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            cursor: "pointer",
            background: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.3)"
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-10px)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
          >
            <div style={{ 
              width: "80px", 
              height: "80px", 
              borderRadius: "20px", 
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
            <h2 style={{ fontSize: "24px", color: "var(--text-main)", marginBottom: "12px" }}>Portale Amministrativo</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "15px", lineHeight: "1.6", marginBottom: "24px" }}>
              Gestione pazienti, statistiche, procedure e controllo completo della clinica. Ottimizzato per PC.
            </p>
            <div style={{ 
              marginTop: "auto",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "var(--primary)",
              fontWeight: 600
            }}>
              Vai alla Dashboard <ArrowRight size={18} />
            </div>
          </div>
        </Link>

        {/* TABLET PORTAL */}
        <div className="card" style={{ 
          height: "100%", 
          padding: "40px", 
          display: "flex", 
          flexDirection: "column", 
          textAlign: "left",
          background: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.3)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
            <div style={{ 
              width: "60px", 
              height: "60px", 
              borderRadius: "15px", 
              background: "#bae6fd", 
              color: "#0369a1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <Tablet size={32} />
            </div>
            <h2 style={{ fontSize: "24px", color: "var(--text-main)" }}>Funzioni Tablet</h2>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <Link href="/tablet/register" style={{ textDecoration: "none" }}>
              <div style={{ 
                padding: "20px", 
                borderRadius: "12px", 
                background: "white", 
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
                  <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--text-main)" }}>Registra Nuovo Paziente</div>
                  <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>Wizard FEA a 5 step con foto</div>
                </div>
              </div>
            </Link>

            <Link href="/tablet/doctor" style={{ textDecoration: "none" }}>
              <div style={{ 
                padding: "20px", 
                borderRadius: "12px", 
                background: "white", 
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--primary)"}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border)"}
              >
                <div style={{ color: "#0369a1" }}><ClipboardList size={24} /></div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--text-main)" }}>Dashboard Medico</div>
                  <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>Consultazione e invio a firma</div>
                </div>
              </div>
            </Link>
          </div>

          <div style={{ 
            marginTop: "24px",
            padding: "12px",
            borderRadius: "8px", 
            background: "#f0fdf4",
            color: "#166534",
            fontSize: "12px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <ShieldCheck size={16} />
            Sistema di Firma Elettronica Avanzata Attivo
          </div>
        </div>

      </div>

      <footer style={{ marginTop: "64px", textAlign: "center", fontSize: "13px", color: "var(--text-muted)", zIndex: 1 }}>
        COSMEDIC SRL — Innovazione e Cura del Paziente
        <div style={{ marginTop: "8px", fontSize: "11px" }}>© 2026 Sistema Software Proprietario</div>
      </footer>
    </div>
  )
}