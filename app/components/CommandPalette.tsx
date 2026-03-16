"use client"

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, User, FileText, ClipboardList, ShieldAlert, X } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  // Ascolta Ctrl+K o Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    } else {
      setQuery('')
      setResults([])
    }
  }, [isOpen])

  // Esegui la ricerca
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      return
    }

    const search = async () => {
      setLoading(true)
      // Cerca nei pazienti (Nome o Cognome)
      const { data: patients } = await supabase
        .from('patients')
        .select('id, name, surname, fiscal_code')
        .or(`name.ilike.%${query}%,surname.ilike.%${query}%`)
        .limit(5)

      const formattedResults = []

      // Aggiungi azioni rapide se matchano (es. "nuovo")
      if ("nuovo paziente".includes(query.toLowerCase()) || "registra".includes(query.toLowerCase())) {
        formattedResults.push({
          id: 'action_new_patient',
          type: 'action',
          title: 'Registra Nuovo Paziente',
          subtitle: 'Avvia il wizard FEA',
          icon: User,
          path: '/tablet/register',
          color: 'var(--primary)'
        })
      }

      if ("dashboard".includes(query.toLowerCase()) || "medico".includes(query.toLowerCase())) {
        formattedResults.push({
          id: 'action_dashboard',
          type: 'action',
          title: 'Dashboard Medico',
          subtitle: 'Visualizza lista clinica',
          icon: ClipboardList,
          path: '/tablet/doctor',
          color: '#0369a1'
        })
      }

      // Aggiungi i pazienti trovati
      if (patients) {
        patients.forEach((p: any) => {
          formattedResults.push({
            id: p.id,
            type: 'patient',
            title: `${p.name} ${p.surname}`,
            subtitle: `CF: ${p.fiscal_code || 'N/D'}`,
            icon: FileText,
            path: `/tablet/doctor/${p.id}`,
            color: 'var(--text-main)'
          })
        })
      }

      setResults(formattedResults)
      setLoading(false)
    }

    const delayDebounceFn = setTimeout(() => {
      search()
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [query])

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(4px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: '10vh 20px',
      animation: 'fadeIn 0.2s ease-out'
    }} onClick={() => setIsOpen(false)}>
      
      <div style={{
        background: 'var(--surface)',
        width: '100%',
        maxWidth: '600px',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideDown 0.2s ease-out'
      }} onClick={e => e.stopPropagation()}>
        
        {/* Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
          <Search size={24} color="var(--primary)" style={{ opacity: 0.7 }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca un paziente o un'azione... (es. 'Mario' o 'nuovo')"
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              fontSize: '18px',
              color: 'var(--text-main)',
              padding: '0 16px',
              outline: 'none'
            }}
          />
          <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '12px' }}>
          {query.trim().length > 0 && query.trim().length < 2 && (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
              Digita almeno 2 caratteri...
            </div>
          )}
          
          {loading && (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
              Ricerca in corso...
            </div>
          )}

          {!loading && query.trim().length >= 2 && results.length === 0 && (
            <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <ShieldAlert size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
              <div style={{ fontSize: '16px', fontWeight: 600 }}>Nessun risultato trovato</div>
              <div style={{ fontSize: '13px', marginTop: '4px' }}>Prova con termini diversi per '{query}'</div>
            </div>
          )}

          {!loading && results.map((res) => (
            <div
              key={res.id}
              onClick={() => {
                setIsOpen(false)
                router.push(res.path)
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--background)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: res.type === 'action' ? `${res.color}22` : 'var(--border)',
                color: res.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <res.icon size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>{res.title}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{res.subtitle}</div>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'var(--background)', padding: '4px 8px', borderRadius: '6px', fontWeight: 600 }}>
                Vai
              </div>
            </div>
          ))}
        </div>

        {/* Footer Shortcut Hint */}
        <div style={{ padding: '12px 24px', background: 'var(--background)', borderTop: '1px solid var(--border)', fontSize: '11px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
          <span>Ricerca Globale Attiva</span>
          <span>Premi <kbd style={{ background: 'var(--border)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-main)' }}>ESC</kbd> per chiudere</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideDown { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  )
}
