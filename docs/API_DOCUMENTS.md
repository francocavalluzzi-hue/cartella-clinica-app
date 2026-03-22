# API - Documenti

Questo documento descrive l'API per la gestione dei documenti (upload, fetch, list, delete) utilizzando le route API di Next.js (app/api) e Supabase Storage.

Principi generali
- Validazione server-side per tutti i payload.
- Risposte coerenti: JSON con `{ success: boolean, data?: any, error?: string }`.
- Codici HTTP significativi: 200, 201, 400, 401, 403, 404, 500.
- Autenticazione: Bearer token (JWT) o sessione gestita tramite Supabase; operazioni sensibili richiedono permessi di ruolo.

Endpoints proposti

1) `POST /api/documents` — Carica un documento
- Request: multipart/form-data con campi:
  - `file` (required): file binario
  - `patient_id` (required): string/number
  - `document_type` (optional): int
- Validation:
  - Verificare dimensione massima (es. 10MB)
  - Estensioni consentite (pdf, jpg, png)
  - `patient_id` formato valido
- Processing:
  - Salvare file in Supabase Storage (bucket `documents`) con path `documents/{patient_id}/{timestamp}_{filename}`
  - Inserire record nella tabella `documents` con `patient_id`, `document_type`, `file_url`, `created_at`
- Response: 201 + `{ success: true, data: { id, file_url } }`

2) `GET /api/documents?patient_id=...` — Lista documenti per paziente
- Query params: `patient_id` (required), `limit`, `offset`
- Validation: `patient_id` presente e autorizzazione
- Response: 200 + `{ success: true, data: [ { id, document_type, file_url, created_at } ] }`

3) `GET /api/documents/:id` — Ottieni metadati singolo documento
- Validation: esistenza e permessi
- Response: 200 + `{ success: true, data: { id, patient_id, file_url, document_type, created_at } }`

4) `DELETE /api/documents/:id` — Elimina documento
- Authorization: solo ruoli con permesso (admin, staff)
- Processing:
  - Rimuovere file da Storage
  - Rimuovere record DB (o segnare `deleted_at`)
- Response: 200 + `{ success: true }`

Error handling
- Restituire errori con messaggi utili ma non esporre stack in produzione.
- Loggare errori server-side (Sentry/Log service) per investigazione.

Security notes
- Non esporre chiavi del service-role al client.
- Per download privati usare URL firmati (Supabase `createSignedUrl`) con expiration breve.

Esempio minimal route handler (concetto)
```
// app/api/documents/route.ts
import { NextResponse } from 'next/server'
export async function POST(req) {
  // validate, authorize, parse multipart, upload to storage, persist record
  return NextResponse.json({ success: true, data: { id, file_url } }, { status: 201 })
}
```

Questa progettazione è pensata per essere implementata attraverso route TypeScript con validazione (zod/joi) e accesso a Supabase client server-side.
