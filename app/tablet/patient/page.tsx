"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { UserPlus, ArrowRight, ShieldCheck } from "lucide-react"
import { supabase } from "../../../lib/supabaseClient"

export default function TabletChioscoNewPatient() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    fiscal_code: "",
    phone: "",
    email: "",
    birthdate: "",
    address: "",
    city: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    // Validazione base
    if (!formData.name || !formData.surname) {
      setError("Nome e Cognome sono obbligatori.")
      return
    }
    
    if (formData.fiscal_code && formData.fiscal_code.length !== 16) {
      setError("Il Codice Fiscale deve essere di 16 caratteri.")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Inserimento nuovo paziente in Supabase
      const { data, error: insertError } = await supabase
        .from("patients")
        .insert([
          {
            name: formData.name,
            surname: formData.surname,
            fiscal_code: formData.fiscal_code.toUpperCase(),
            phone: formData.phone,
            email: formData.email,
            birthdate: formData.birthdate || null,
            address: formData.address,
            city: formData.city,
            cap: "", // Inseriamo campi vuoti presenti nell'app desktop per sicurezza
            country: ""
          }
        ])
        .select()
        .single()

      if (insertError) throw insertError

      // Se l'inserimento è andato a buon fine, navighiamo verso il riepilogo consensi
      if (data && data.id) {
        router.push(`/tablet/patient/${data.id}`)
      }
    } catch (err: any) {
      console.error("Full Error:", err)
      const msg = err.message || err.details || "Errore sconosciuto"
      setError(`Errore: ${msg}`)
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      minHeight: "calc(100vh - 100px)",
      padding: "40px"
    }}>
      <div style={{
        background: "white",
        borderRadius: "24px",
        padding: "60px 48px",
        width: "100%",
        maxWidth: "800px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
      }}>
        
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ 
            width: "80px", 
            height: "80px", 
            background: "var(--primary-light)", 
            borderRadius: "50%", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            margin: "0 auto 24px",
            color: "var(--primary)"
          }}>
            <UserPlus size={40} />
          </div>

          <h1 style={{ fontSize: "36px", fontWeight: 800, color: "var(--text-main)", marginBottom: "16px" }}>
            Nuovo Paziente
          </h1>
          <p style={{ fontSize: "20px", color: "var(--text-muted)", lineHeight: "1.5" }}>
            Compila i campi sottostanti per creare la tua Scheda Anagrafica.
          </p>
        </div>

        {error && (
          <div style={{ color: "var(--danger)", fontSize: "16px", marginBottom: "24px", fontWeight: 600, background: "#fef2f2", padding: "16px", borderRadius: "12px", textAlign: "center" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <div>
              <label style={{ display: "block", fontSize: "16px", fontWeight: 700, color: "var(--text-main)", marginBottom: "12px" }}>Nome <span style={{color:"var(--danger)"}}>*</span></label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                style={{ width: "100%", padding: "20px", fontSize: "18px", borderRadius: "12px", border: "2px solid var(--border)", outline: "none" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "16px", fontWeight: 700, color: "var(--text-main)", marginBottom: "12px" }}>Cognome <span style={{color:"var(--danger)"}}>*</span></label>
              <input 
                type="text" 
                name="surname"
                value={formData.surname}
                onChange={handleChange}
                required
                style={{ width: "100%", padding: "20px", fontSize: "18px", borderRadius: "12px", border: "2px solid var(--border)", outline: "none" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <div>
              <label style={{ display: "block", fontSize: "16px", fontWeight: 700, color: "var(--text-main)", marginBottom: "12px" }}>Codice Fiscale</label>
              <input 
                type="text" 
                name="fiscal_code"
                value={formData.fiscal_code}
                onChange={(e) => setFormData({...formData, fiscal_code: e.target.value.toUpperCase()})}
                maxLength={16}
                style={{ width: "100%", padding: "20px", fontSize: "18px", borderRadius: "12px", border: "2px solid var(--border)", outline: "none", textTransform: "uppercase" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "16px", fontWeight: 700, color: "var(--text-main)", marginBottom: "12px" }}>Data di Nascita</label>
              <input 
                type="date" 
                name="birthdate"
                value={formData.birthdate}
                onChange={handleChange}
                style={{ width: "100%", padding: "20px", fontSize: "18px", borderRadius: "12px", border: "2px solid var(--border)", outline: "none" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <div>
              <label style={{ display: "block", fontSize: "16px", fontWeight: 700, color: "var(--text-main)", marginBottom: "12px" }}>Telefono</label>
              <input 
                type="tel" 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                style={{ width: "100%", padding: "20px", fontSize: "18px", borderRadius: "12px", border: "2px solid var(--border)", outline: "none" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "16px", fontWeight: 700, color: "var(--text-main)", marginBottom: "12px" }}>Email</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={{ width: "100%", padding: "20px", fontSize: "18px", borderRadius: "12px", border: "2px solid var(--border)", outline: "none" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
            <div>
              <label style={{ display: "block", fontSize: "16px", fontWeight: 700, color: "var(--text-main)", marginBottom: "12px" }}>Indirizzo</label>
              <input 
                type="text" 
                name="address"
                value={formData.address}
                onChange={handleChange}
                style={{ width: "100%", padding: "20px", fontSize: "18px", borderRadius: "12px", border: "2px solid var(--border)", outline: "none" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "16px", fontWeight: 700, color: "var(--text-main)", marginBottom: "12px" }}>Città</label>
              <input 
                type="text" 
                name="city"
                value={formData.city}
                onChange={handleChange}
                style={{ width: "100%", padding: "20px", fontSize: "18px", borderRadius: "12px", border: "2px solid var(--border)", outline: "none" }}
              />
            </div>
          </div>

          <div style={{ marginTop: "32px", display: "flex", justifyContent: "center" }}>
            <button 
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                maxWidth: "400px",
                padding: "24px",
                background: "var(--primary)",
                color: "white",
                border: "none",
                borderRadius: "16px",
                fontSize: "22px",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                cursor: "pointer",
                boxShadow: "0 10px 15px -3px rgba(15, 118, 110, 0.3)",
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? "Registrazione..." : "Registra e Prosegui"}
              {!loading && <ArrowRight size={28} />}
            </button>
          </div>
        </form>
        
        <div style={{ marginTop: "40px", fontSize: "16px", color: "var(--text-muted)", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
          <ShieldCheck size={20} color="var(--success)" /> I tuoi dati sono protetti e trattati secondo la normativa Privacy GDPR.
        </div>
      </div>
    </div>
  )
}
