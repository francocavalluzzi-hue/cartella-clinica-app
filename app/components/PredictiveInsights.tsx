"use client"

import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { AlertCircle, CheckCircle2, FileWarning, ArrowRight } from 'lucide-react'
import { MAPPATURA_MODULI } from '../../lib/constants'

export default function PredictiveInsights({ patientId, procedures, signedDocs }: { patientId: string, procedures: any[], signedDocs: number[] }) {
  const [insights, setInsights] = useState<any[]>([])

  useEffect(() => {
    generateInsights()
  }, [procedures, signedDocs])

  const generateInsights = () => {
    const newInsights = []

    // Controllo base: Manca la scheda anagrafica?
    if (!signedDocs.includes(0)) {
      newInsights.push({
        id: 'missing_anagrafica',
        type: 'critical',
        title: 'Scheda Anagrafica Mancante',
        desc: 'Il paziente non ha firmato la Scheda Anagrafica.',
        icon: FileWarning,
        color: 'var(--danger)',
        actionTarget: [0]
      })
    }

    // Controllo Consenso Privacy FEA
    if (!signedDocs.includes(8) && !signedDocs.includes(9)) {
      newInsights.push({
        id: 'missing_privacy',
        type: 'warning',
        title: 'Consenso Privacy Mancante',
        desc: 'Necessario acquisire il Modulo FEA e Privacy.',
        icon: AlertCircle,
        color: 'var(--warning)',
        actionTarget: [8, 9]
      })
    }

    // Controllo incrociato: Se c'è un intervento, ci sono i moduli corretti?
    procedures.forEach(proc => {
      const neededDocs = MAPPATURA_MODULI[proc.procedure_type]
      if (neededDocs) {
        const missing = neededDocs.filter((docId: number) => !signedDocs.includes(docId))
        if (missing.length > 0) {
          newInsights.push({
            id: `missing_proc_${proc.id}`,
            type: 'warning',
            title: `Moduli per ${proc.procedure_type} Incompleti`,
            desc: `Mancano ${missing.length} moduli obbligatori per l'intervento programmato.`,
            icon: FileWarning,
            color: 'var(--warning)',
            actionTarget: missing
          })
        } else {
          newInsights.push({
            id: `complete_proc_${proc.id}`,
            type: 'success',
            title: `${proc.procedure_type} Pronto`,
            desc: 'Tutta la documentazione è in regola per questo intervento.',
            icon: CheckCircle2,
            color: 'var(--success)'
          })
        }
      }
    })

    setInsights(newInsights)
  }

  if (insights.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
        AI Predictive Insights
      </div>
      
      {insights.map(ins => (
        <div key={ins.id} style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '16px',
          background: 'var(--surface)',
          border: `1px solid ${ins.color}40`,
          borderLeft: `4px solid ${ins.color}`,
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
        }}>
          <div style={{ color: ins.color, marginTop: '2px' }}>
            <ins.icon size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
              {ins.title}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {ins.desc}
            </div>
            
            {ins.actionTarget && (
              <button 
                onClick={() => alert(`Azione suggerita: Autoseleziona moduli [${ins.actionTarget.join(', ')}] nella lista sottostante.`)}
                style={{
                  marginTop: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'transparent',
                  border: 'none',
                  color: ins.color,
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                APPLICA AZIONE SUGGERITA <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
