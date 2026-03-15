import { FileText } from "lucide-react"
import React from "react"

export const BUCKET_URL = "https://zyieuliuxvonvtldyqzk.supabase.co/storage/v1/object/public/MODULI%20X%20APP"

export const MODULI = [
  { id: 0, nome: "Scheda Anagrafica", file: "0%20SCHEDA%20ANAGRAFICA%202026.pdf", quando: "Prima visita" },
  { id: 1, nome: "Cartella Clinica", file: "1%20cartella%20clinica.pdf", quando: "Prima visita" },
  { id: 2, nome: "Consenso Anestesia", file: "2%20consenso%20anestesia%2C%20liberatoria%2C%20richiesta%20cart%20clin.pdf", quando: "Pre-intervento" },
  { id: 3, nome: "Consenso Generico", file: "3%20Consenso%20Generico%20.pdf", quando: "Pre-intervento" },
  { id: 4, nome: "Lettera Dimissioni", file: "4%20Lettera%20Dimissioni%20Pazienti.pdf", quando: "Post-intervento" },
  { id: 5, nome: "Ricetta Prescrizioni", file: "5%20Ricetta%20PRESCRIZIONE%20medica%20dimissione.pdf", quando: "Post-intervento" },
  { id: 6, nome: "Tabella Medicazioni", file: "6%20Tabella%20Medicazioni.pdf", quando: "Follow-up" },
  { id: 7, nome: "Chirurgia Ambulatoriale", file: "7%20Chirurgia%20ambulatoriale.pdf", quando: "Pre-intervento" },
  { id: 8, nome: "Consenso Privacy", file: "", quando: "Registrazione" },
]

export const INTERVENTO_TYPES = [
  "Rinoplastica", "Blefaroplastica", "Lifting facciale", "Otoplastica",
  "Mastoplastica additiva", "Mastoplastica riduttiva", "Mastopexi",
  "Addominoplastica", "Liposuzione", "Lipoaddizione", "BBL",
  "Blefaroplastica superiore", "Blefaroplastica inferiore",
  "Lipofilling viso", "Mentoplastica", "Altro"
]
