import { z } from 'zod'

// Italian Fiscal Code regex (simplified)
const FISCAL_CODE_REGEX = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/

// Patient validation schema
export const PatientSchema = z.object({
  name: z.string()
    .min(1, 'Il nome è obbligatorio')
    .max(100, 'Il nome non può superare 100 caratteri'),

  surname: z.string()
    .min(1, 'Il cognome è obbligatorio')
    .max(100, 'Il cognome non può superare 100 caratteri'),

  birthdate: z.string()
    .optional()
    .refine(val => {
      if (!val) return true
      const date = new Date(val)
      return !isNaN(date.getTime()) && date < new Date()
    }, 'Data di nascita non valida'),

  birth_place: z.string()
    .max(100, 'Il luogo di nascita non può superare 100 caratteri')
    .optional(),

  fiscal_code: z.string()
    .optional()
    .refine(val => {
      if (!val) return true
      return FISCAL_CODE_REGEX.test(val.toUpperCase())
    }, 'Codice fiscale non valido (formato: RSSMRA85M01H501Z)')
    .transform(val => val?.toUpperCase()),

  phone: z.string()
    .optional()
    .refine(val => {
      if (!val) return true
      return /^[0-9+]{6,15}$/.test(val)
    }, 'Numero di telefono non valido'),

  email: z.string()
    .email('Email non valida')
    .optional()
    .or(z.literal('')),

  address: z.string()
    .max(200, 'L\'indirizzo non può superare 200 caratteri')
    .optional(),

  city: z.string()
    .max(100, 'La città non può superare 100 caratteri')
    .optional(),
})

export type Patient = z.infer<typeof PatientSchema>

// Patient with ID (from database)
export const PatientWithIdSchema = PatientSchema.extend({
  id: z.string().uuid(),
  created_at: z.string().or(z.date()),
  updated_at: z.string().or(z.date()).optional(),
})

export type PatientWithId = z.infer<typeof PatientWithIdSchema>

// Document validation schema
export const DocumentSchema = z.object({
  id: z.string().uuid(),
  patient_id: z.string().uuid(),
  document_type: z.number().int().min(0),
  file_url: z.string().url(),
  created_at: z.string().or(z.date()),
})

export type Document = z.infer<typeof DocumentSchema>

// Procedure validation schema
export const ProcedureSchema = z.object({
  id: z.string().uuid().optional(),
  patient_id: z.string().uuid(),
  name: z.string().min(1, 'Il nome procedura è obbligatorio'),
  date: z.string().or(z.date()),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']).default('scheduled'),
  notes: z.string().optional(),
})

export type Procedure = z.infer<typeof ProcedureSchema>

// Form validation helper
export function validatePatient(data: unknown) {
  return PatientSchema.safeParse(data)
}

// Error formatting helper
export function formatZodErrors(errors: z.ZodError) {
  return errors.issues.reduce((acc, error) => {
    const field = error.path.join('.')
    acc[field] = error.message
    return acc
  }, {} as Record<string, string>)
}

// Italian error messages helper
export function getErrorMessage(field: string, error: z.ZodIssue): string {
  const messages: Record<string, string> = {
    'name': 'Il nome è obbligatorio',
    'surname': 'Il cognome è obbligatorio',
    'email': 'Inserisci una email valida',
    'phone': 'Inserisci un numero di telefono valido',
    'fiscal_code': 'Il codice fiscale deve essere di 16 caratteri e nel formato corretto',
    'birthdate': 'Inserisci una data di nascita valida',
  }
  return messages[field] || error.message
}