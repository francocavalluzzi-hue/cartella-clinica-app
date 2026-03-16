"use client"

import React from 'react'
import { Calendar, CheckCircle2, FileText, UserPlus, PenTool } from 'lucide-react'

interface TimelineEvent {
  id: string
  date: string
  type: 'registration' | 'signature' | 'planning' | 'document'
  title: string
  description: string
  icon: any
  color: string
}

export default function ClinicalTimeline({ patient, documents }: { patient: any, documents: any[] }) {
  // Build timeline events from real data
  const events: TimelineEvent[] = [
    {
      id: 'reg',
      date: patient.created_at ? new Date(patient.created_at).toLocaleString('it-IT') : 'Data non disponibile',
      type: 'registration',
      title: 'Paziente Registrato',
      description: `Registrazione iniziale di ${patient.name} ${patient.surname}`,
      icon: UserPlus,
      color: 'var(--primary)'
    }
  ]

  // Add documents to events
  documents.forEach((doc, idx) => {
    events.push({
      id: `doc-${idx}`,
      date: new Date(doc.created_at).toLocaleString('it-IT'),
      type: 'signature',
      title: 'Documento Firmato',
      description: `Completata firma per: ${doc.document_type === 0 ? 'Scheda Anagrafica' : 'Modulo Consenso'}`,
      icon: doc.document_type === 8 ? ShieldCheck : FileText,
      color: doc.document_type === 8 ? '#10b981' : '#3b82f6'
    })
  })

  // Sort events by date
  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div style={{ position: 'relative', padding: '20px 0' }}>
      {/* Central Line */}
      <div style={{ 
        position: 'absolute', 
        left: '20px', 
        top: '0', 
        bottom: '0', 
        width: '2px', 
        background: 'var(--border)', 
        opacity: 0.5 
      }}></div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {events.map((event) => (
          <div key={event.id} style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', position: 'relative' }}>
            {/* Icon Circle */}
            <div style={{ 
              width: '42px', 
              height: '42px', 
              borderRadius: '50%', 
              background: 'var(--surface)', 
              border: `2px solid ${event.color}`, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              zIndex: 1,
              color: event.color,
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
            }}>
              <event.icon size={20} />
            </div>

            {/* Content */}
            <div style={{ flex: 1, background: 'var(--surface)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)' }}>{event.title}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'var(--background)', padding: '2px 8px', borderRadius: '10px' }}>
                  {event.date}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.4' }}>{event.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

import { ShieldCheck } from 'lucide-react'
