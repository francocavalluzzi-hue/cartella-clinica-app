"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Fingerprint, ShieldCheck, Loader2, ArrowRight } from 'lucide-react'

export default function BiometricLogin() {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle')
  const router = useRouter()

  const handleBiometricAuth = () => {
    setStatus('scanning')
    
    // Simulate biometric scan process
    setTimeout(() => {
      // Simulate 90% success rate
      if (Math.random() > 0.1) {
        setStatus('success')
        setTimeout(() => {
          router.push('/tablet/doctor')
        }, 1200)
      } else {
        setStatus('error')
        setTimeout(() => {
          setStatus('idle')
        }, 2000)
      }
    }, 2000)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--background)',
      color: 'var(--text-main)',
      padding: '24px'
    }}>
      <div style={{
        background: 'var(--surface)',
        padding: '48px',
        borderRadius: '32px',
        border: '1px solid var(--border)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        width: '100%',
        maxWidth: '480px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        
        {/* Decorative background glow */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: `radial-gradient(circle at center, ${status === 'success' ? '#10b98133' : status === 'error' ? '#ef444433' : 'var(--primary-light)'} 0%, transparent 50%)`,
          opacity: 0.5,
          zIndex: 0,
          pointerEvents: 'none',
          transition: 'all 0.5s ease-out'
        }}></div>

        <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.5px' }}>
              MED-OS <span style={{ color: 'var(--primary)' }}>SECURE</span>
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--text-muted)' }}>
              Area medica con accesso riservato.
            </p>
          </div>

          {/* Biometric Scanner */}
          <div 
            onClick={status === 'idle' ? handleBiometricAuth : undefined}
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: status === 'success' ? '#10b981' : status === 'error' ? '#ef4444' : 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: status === 'idle' ? 'pointer' : 'default',
              boxShadow: status === 'success' 
                ? '0 0 40px rgba(16, 185, 129, 0.4)' 
                : status === 'error'
                ? '0 0 40px rgba(239, 68, 68, 0.4)'
                : '0 20px 40px rgba(13, 148, 136, 0.3)',
              position: 'relative',
              transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              transform: status === 'scanning' ? 'scale(0.95)' : 'scale(1)'
            }}
          >
            {/* Scanning Laser Effect */}
            {status === 'scanning' && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'rgba(255,255,255,0.8)',
                boxShadow: '0 0 10px rgba(255,255,255,0.8)',
                animation: 'scan 2s ease-in-out infinite'
              }}></div>
            )}

            {status === 'success' ? (
              <ShieldCheck color="white" size={56} style={{ animation: 'pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }} />
            ) : (
              <Fingerprint color="white" size={64} style={{ opacity: status === 'scanning' ? 0.5 : 1 }} />
            )}
          </div>

          <div style={{ marginTop: '32px', height: '24px' }}>
            {status === 'idle' && (
              <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)', opacity: 0.8 }}>
                Tocca il sensore per accedere
              </span>
            )}
            {status === 'scanning' && (
              <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Loader2 size={16} className="animate-spin" /> Verifica identità in corso...
              </span>
            )}
            {status === 'success' && (
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#10b981' }}>
                Identità confermata. Accesso...
              </span>
            )}
            {status === 'error' && (
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#ef4444' }}>
                Impronta non riconosciuta. Riprova.
              </span>
            )}
          </div>
        </div>

        <button 
          onClick={() => router.push('/')}
          style={{
            marginTop: '48px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            zIndex: 1
          }}
        >
          Torna alla Pagina Pazienti <ArrowRight size={14} />
        </button>

      </div>

      <style jsx>{`
        @keyframes scan {
          0%, 100% { transform: translateY(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          50% { transform: translateY(116px); }
        }
        @keyframes pop {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
