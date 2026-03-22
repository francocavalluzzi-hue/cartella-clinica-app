// Database types for COSMEDIC Suite
// These types should be kept in sync with the Supabase schema

export interface DatabasePatient {
  id: string
  name: string
  surname: string
  birthdate: string | null
  birth_place: string | null
  fiscal_code: string | null
  phone: string | null
  email: string | null
  address: string | null
  city: string | null
  created_at: string
  updated_at: string | null
}

export interface DatabaseDocument {
  id: string
  patient_id: string
  document_type: number
  file_url: string
  created_at: string
}

export interface DatabaseProcedure {
  id: string
  patient_id: string
  name: string
  description: string | null
  date: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  notes: string | null
  created_at: string
}

// Frontend types
export interface PatientWithDocuments extends DatabasePatient {
  documents: DatabaseDocument[]
  procedures: DatabaseProcedure[]
}

// Audit Log types
export interface AuditLogEntry {
  id: string
  timestamp: number
  dateFormatted: string
  user: string
  action: string
  details: string
  icon: React.ComponentType<{ size?: number; color?: string }>
  color: string
  securityLevel: 'low' | 'medium' | 'high' | 'critical'
}

// Module types
export interface Module {
  id: number
  nome: string
  descrizione: string
  file: string
  required: boolean
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// Form state types
export interface FormState<T> {
  data: T
  errors: Partial<Record<keyof T, string>>
  isSubmitting: boolean
}