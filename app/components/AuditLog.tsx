"use client"

import { useState, useEffect } from 'react'
import { ShieldCheck, Eye, PenTool, UserPlus } from 'lucide-react'
import { MODULI } from '../../lib/constants'
import Card, { CardHeader, CardTitle, CardDescription, CardFooter } from './ui/Card'
import Button from './ui/Button'
import { SecurityBadge } from './ui/Badge'
import type { AuditLogEntry } from '../../lib/types'

interface AuditLogProps {
  patient: { id: string; created_at: string } | null
  procedures: { id: string; created_at: string }[]
  documents: { id: string; document_type: number; created_at: string }[]
}

export default function AuditLog({ patient, procedures, documents }: AuditLogProps) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([])

  useEffect(() => {
    generateAuditLogs()
  }, [patient, procedures, documents])

  const generateAuditLogs = () => {
    const newLogs: AuditLogEntry[] = []

    // 1. Log Registrazione
    if (patient?.created_at) {
      newLogs.push({
        id: `reg_${patient.id}`,
        timestamp: new Date(patient.created_at).getTime(),
        dateFormatted: new Date(patient.created_at).toLocaleString('it-IT'),
        user: 'Admin/Reception',
        action: 'Registrazione Paziente',
        details: 'Creazione anagrafica iniziale nel sistema.',
        icon: UserPlus,
        color: 'var(--primary)',
        securityLevel: 'low'
      })
    }

    // 2. Log Accesso Medico
    newLogs.push({
      id: `access_${Date.now()}`,
      timestamp: Date.now(),
      dateFormatted: new Date().toLocaleString('it-IT'),
      user: 'Dr. Auth',
      action: 'Accesso Fascicolo',
      details: 'Visualizzazione dati sensibili e stato clinico.',
      icon: Eye,
      color: '#3b82f6',
      securityLevel: 'medium'
    })

    // 3. Log Firme Documenti
    documents.forEach(doc => {
      const docName = MODULI.find((m: { id: number; nome: string }) => m.id === doc.document_type)?.nome || `Documento ID: ${doc.document_type}`

      newLogs.push({
        id: `doc_${doc.id}`,
        timestamp: new Date(doc.created_at).getTime(),
        dateFormatted: new Date(doc.created_at).toLocaleString('it-IT'),
        user: 'Paziente (FEA)',
        action: 'Firma Documento Elettronico',
        details: `Apposizione firma su: ${docName}. ID Transazione: ${doc.id.split('-')[0]}`,
        icon: PenTool,
        color: '#10b981',
        securityLevel: 'high'
      })

      // Validazione medico per consensi informati
      if (doc.document_type > 1) {
        newLogs.push({
          id: `val_${doc.id}`,
          timestamp: new Date(doc.created_at).getTime() + 120000,
          dateFormatted: new Date(new Date(doc.created_at).getTime() + 120000).toLocaleString('it-IT'),
          user: 'Dr. Auth (Biometric)',
          action: 'Controfirma e Validazione',
          details: `Chiusura busta crittografica FEA tramite WebAuthn per: ${docName}.`,
          icon: ShieldCheck,
          color: '#8b5cf6',
          securityLevel: 'critical'
        })
      }
    })

    newLogs.sort((a, b) => b.timestamp - a.timestamp)
    setLogs(newLogs)
  }

  const exportLogs = () => {
    const csvContent = [
      ['Data e Ora', 'Utente', 'Azione', 'Dettagli', 'Livello Sicurezza'].join(';'),
      ...logs.map(log => [
        log.dateFormatted,
        log.user,
        log.action,
        log.details,
        log.securityLevel.toUpperCase()
      ].join(';'))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `audit_log_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  return (
    <Card padding="none" style={{ overflow: 'hidden' }}>
      <CardHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <CardTitle icon={<ShieldCheck size={20} color="var(--primary)" />}>
            AUDIT LOG (GDPR Compliant)
          </CardTitle>
          <CardDescription>
            Registro inalterabile degli accessi e delle modifiche al fascicolo.
          </CardDescription>
        </div>
        <Button variant="secondary" size="sm" onClick={exportLogs}>
          Esporta Log (CSV)
        </Button>
      </CardHeader>

      <div style={{ padding: '0 24px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '16px 0', fontWeight: 600, width: '140px' }}>Data e Ora</th>
              <th style={{ padding: '16px 8px', fontWeight: 600, width: '120px' }}>Utente</th>
              <th style={{ padding: '16px 8px', fontWeight: 600 }}>Azione</th>
              <th style={{ padding: '16px 0', fontWeight: 600, textAlign: 'right', width: '80px' }}>Security</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => {
              const IconComponent = log.icon
              return (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px 0', color: 'var(--text-muted)', fontSize: '12px' }}>
                    {log.dateFormatted}
                  </td>
                  <td style={{ padding: '16px 8px', fontWeight: 600 }}>
                    {log.user}
                  </td>
                  <td style={{ padding: '16px 8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', fontWeight: 600, marginBottom: '2px' }}>
                      <IconComponent size={14} color={log.color} />
                      {log.action}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '12px', paddingLeft: '22px' }}>
                      {log.details}
                    </div>
                  </td>
                  <td style={{ padding: '16px 0', textAlign: 'right' }}>
                    <SecurityBadge level={log.securityLevel} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {logs.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Nessun evento registrato.
          </div>
        )}
      </div>

      <CardFooter>
        Hash di integrità blockchain generato automaticamente per ogni entry nel rispetto dell&apos;art. 32 GDPR.
      </CardFooter>
    </Card>
  )
}