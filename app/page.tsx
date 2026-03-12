"use client"

import { useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient"

export default function Home() {
  const [patients, setPatients] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name:"", surname:"", birthdate:"", phone:"", email:"", address:"" })
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadPatients() }, [])

  async function loadPatients() {
    const { data } = await supabase.from("patients").select("*").order("created_at", {ascending:false})
    setPatients(data || [])
  }

  async function savePatient() {
    if (!form.name || !form.surname) return alert("Nome e cognome obbligatori")
    setSaving(true)
    await supabase.from("patients").insert([form])
    setForm({ name:"", surname:"", birthdate:"", phone:"", email:"", address:"" })
    setShowForm(false)
    setSaving(false)
    loadPatients()
  }

  return (
    <div style={{minHeight:"100vh", background:"#0f172a", color:"white", fontFamily:"sans-serif"}}>

      <div style={{background:"#1e293b", padding:"16px 32px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:"1px solid #334155"}}>
        <h1 style={{margin:0, fontSize:20, fontWeight:700, color:"#38bdf8"}}>🏥 Cartella Clinica</h1>
        <span style={{color:"#94a3b8", fontSize:14}}>Dr. Franco Cavalluzzi</span>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, padding:"32px 32px 0"}}>
        <div style={{background:"#1e293b", borderRadius:12, padding:24, borderLeft:"4px solid #38bdf8"}}>
          <div style={{color:"#94a3b8", fontSize:13}}>Pazienti Totali</div>
          <div style={{fontSize:36, fontWeight:700}}>{patients.length}</div>
        </div>
        <div style={{background:"#1e293b", borderRadius:12, padding:24, borderLeft:"4px solid #22c55e"}}>
          <div style={{color:"#94a3b8", fontSize:13}}>Interventi Questo Mese</div>
          <div style={{fontSize:36, fontWeight:700}}>0</div>
        </div>
        <div style={{background:"#1e293b", borderRadius:12, padding:24, borderLeft:"4px solid #f59e0b"}}>
          <div style={{color:"#94a3b8", fontSize:13}}>Documenti Generati</div>
          <div style={{fontSize:36, fontWeight:700}}>0</div>
        </div>
      </div>

      {showForm && (
        <div style={{margin:"32px 32px 0", background:"#1e293b", borderRadius:12, padding:24, border:"1px solid #38bdf8"}}>
          <h2 style={{margin:"0 0 20px", fontSize:16, fontWeight:600, color:"#38bdf8"}}>+ Nuovo Paziente</h2>
          <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16}}>
            {[
              {label:"Nome *", key:"name", type:"text"},
              {label:"Cognome *", key:"surname", type:"text"},
              {label:"Data di Nascita", key:"birthdate", type:"date"},
              {label:"Telefono", key:"phone", type:"text"},
              {label:"Email", key:"email", type:"email"},
              {label:"Indirizzo", key:"address", type:"text"},
            ].map(f => (
              <div key={f.key}>
                <label style={{display:"block", color:"#94a3b8", fontSize:13, marginBottom:6}}>{f.label}</label>
                <input
                  type={f.type}
                  value={(form as any)[f.key]}
                  onChange={e => setForm({...form, [f.key]: e.target.value})}
                  style={{width:"100%", background:"#0f172a", border:"1px solid #334155", borderRadius:8, padding:"10px 12px", color:"white", fontSize:14, boxSizing:"border-box"}}
                />
              </div>
            ))}
          </div>
          <div style={{marginTop:20, display:"flex", gap:12}}>
            <button onClick={savePatient} disabled={saving}
              style={{background:"#38bdf8", color:"#0f172a", border:"none", borderRadius:8, padding:"10px 24px", fontWeight:700, cursor:"pointer", fontSize:14}}>
              {saving ? "Salvataggio..." : "💾 Salva Paziente"}
            </button>
            <button onClick={() => setShowForm(false)}
              style={{background:"#334155", color:"white", border:"none", borderRadius:8, padding:"10px 24px", fontWeight:600, cursor:"pointer", fontSize:14}}>
              Annulla
            </button>
          </div>
        </div>
      )}

      <div style={{margin:"32px", background:"#1e293b", borderRadius:12, overflow:"hidden"}}>
        <div style={{padding:"20px 24px", borderBottom:"1px solid #334155", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <h2 style={{margin:0, fontSize:16, fontWeight:600}}>Lista Pazienti</h2>
          <button onClick={() => setShowForm(!showForm)}
            style={{background:"#38bdf8", color:"#0f172a", border:"none", borderRadius:8, padding:"8px 16px", fontWeight:600, cursor:"pointer"}}>
            {showForm ? "✕ Chiudi" : "+ Nuovo Paziente"}
          </button>
        </div>
        <table style={{width:"100%", borderCollapse:"collapse"}}>
          <thead>
            <tr style={{background:"#0f172a"}}>
              <th style={{padding:"12px 24px", textAlign:"left", color:"#94a3b8", fontSize:13, fontWeight:500}}>Nome</th>
              <th style={{padding:"12px 24px", textAlign:"left", color:"#94a3b8", fontSize:13, fontWeight:500}}>Cognome</th>
              <th style={{padding:"12px 24px", textAlign:"left", color:"#94a3b8", fontSize:13, fontWeight:500}}>Data di Nascita</th>
              <th style={{padding:"12px 24px", textAlign:"left", color:"#94a3b8", fontSize:13, fontWeight:500}}>Telefono</th>
              <th style={{padding:"12px 24px", textAlign:"left", color:"#94a3b8", fontSize:13, fontWeight:500}}>Email</th>
              <th style={{padding:"12px 24px", textAlign:"left", color:"#94a3b8", fontSize:13, fontWeight:500}}>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p, i) => (
              <tr key={p.id} style={{borderTop:"1px solid #334155", background: i%2===0?"transparent":"#162032"}}>
                <td style={{padding:"16px 24px"}}>{p.name}</td>
                <td style={{padding:"16px 24px"}}>{p.surname}</td>
                <td style={{padding:"16px 24px", color:"#94a3b8"}}>{p.birthdate || "—"}</td>
                <td style={{padding:"16px 24px", color:"#94a3b8"}}>{p.phone || "—"}</td>
                <td style={{padding:"16px 24px", color:"#94a3b8"}}>{p.email || "—"}</td>
                <td style={{padding:"16px 24px"}}>
                  <button onClick={() => window.location.href=`/patients/${p.id}`}
                    style={{background:"#1d4ed8", color:"white", border:"none", borderRadius:6, padding:"6px 12px", fontSize:13, cursor:"pointer", marginRight:8}}>
                    Apri
                  </button>
                  <button style={{background:"#334155", color:"white", border:"none", borderRadius:6, padding:"6px 12px", fontSize:13, cursor:"pointer"}}>
                    PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}