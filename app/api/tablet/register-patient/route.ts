import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Usiamo la service_role key lato server per bypassare le RLS
// Questa chiave NON viene mai esposta al client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { name, surname, fiscal_code, phone, email, birthdate, address, city, cap, country } = body

    if (!name || !surname) {
      return NextResponse.json(
        { error: "Nome e Cognome sono obbligatori." },
        { status: 400 }
      )
    }

    const payload = {
      name,
      surname,
      fiscal_code: fiscal_code ? fiscal_code.toUpperCase() : "",
      phone: phone || "",
      email: email || "",
      birthdate: birthdate || null,
      address: address || "",
      city: city || "",
      cap: cap || "",
      country: country || "",
    }

    const { data, error } = await supabaseAdmin
      .from("patients")
      .insert([payload])
      .select()

    if (error) {
      console.error("Supabase Admin Insert Error:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
      return NextResponse.json(
        { error: error.message || "Errore durante la registrazione." },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "Paziente creato ma il database non ha restituito l'ID." },
        { status: 500 }
      )
    }

    return NextResponse.json({ id: data[0].id }, { status: 201 })
  } catch (err: any) {
    console.error("API Route Error:", err)
    return NextResponse.json(
      { error: err.message || "Errore interno del server." },
      { status: 500 }
    )
  }
}
