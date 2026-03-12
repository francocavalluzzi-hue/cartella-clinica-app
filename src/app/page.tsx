"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function Home() {
  const [patients, setPatients] = useState<any[]>([])

  useEffect(() => {
    loadPatients()
  }, [])

  async function loadPatients() {
    const { data } = await supabase
      .from("patients")
      .select("*")
    setPatients(data || [])
  }

  return (
    <div style={{padding:40}}>
      <h1>Cartella Clinica</h1>
      {patients.map((p) => (
        <div key={p.id}>
          {p.name} {p.surname}
        </div>
      ))}
    </div>
  )
}
