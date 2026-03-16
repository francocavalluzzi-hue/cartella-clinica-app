"use client"

import React, { useState, useEffect } from 'react'
import { Mic, MicOff, Sparkles, Loader2, Play } from 'lucide-react'

export default function MedicalScribe({ onTranscription }: { onTranscription: (text: string) => void }) {
  const [isListening, setIsListening] = useState(false)
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing'>('idle')
  const [transcript, setTranscript] = useState("")

  const toggleListen = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  const startListening = () => {
    setIsListening(true)
    setStatus('listening')
    setTranscript("")
    // Real Web Speech API would go here, simulating for now
  }

  const stopListening = () => {
    setIsListening(false)
    setStatus('processing')
    
    // Simulating AI processing/formatting
    setTimeout(() => {
      const mockResult = "Paziente presenta lieve infiammazione post-operatoria. Si consiglia applicazione locale di ghiaccio e monitoraggio della temperatura nelle prossime 24 ore. Prescritta terapia analgesica di supporto."
      setTranscript(mockResult)
      onTranscription(mockResult)
      setStatus('idle')
    }, 1500)
  }

  return (
    <div style={{ background: 'var(--surface)', borderRadius: '20px', padding: '24px', border: '1px solid var(--border)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
        <div 
          onClick={toggleListen}
          style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '50%', 
            background: isListening ? '#ef4444' : 'var(--primary)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            boxShadow: isListening ? '0 0 20px rgba(239, 68, 68, 0.4)' : '0 10px 20px rgba(13, 148, 136, 0.2)',
            transform: isListening ? 'scale(1.1)' : 'scale(1)'
          }}
        >
          {isListening ? <MicOff color="white" size={32} /> : <Mic color="white" size={32} />}
        </div>
        
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            AI Medical Scribe {isListening && <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', animation: 'pulse 1s infinite' }}></span>}
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {status === 'idle' && "Tocca il microfono per dettare note cliniche"}
            {status === 'listening' && "In ascolto... Parla ora"}
            {status === 'processing' && "L'intelligenza artificiale sta formattando le note..."}
          </p>
        </div>
      </div>

      {isListening && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', height: '40px', justifyContent: 'center', marginBottom: '16px' }}>
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} style={{ 
              width: '4px', 
              background: 'var(--primary)', 
              borderRadius: '2px',
              animation: `wave 1s ease-in-out infinite`,
              animationDelay: `${i * 0.1}s`,
              height: `${10 + Math.random() * 30}px`
            }}></div>
          ))}
        </div>
      )}

      {status === 'processing' && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px' }}>
          <Loader2 className="animate-spin" color="var(--primary)" size={24} />
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.3; }
          100% { opacity: 1; }
        }
        @keyframes wave {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(2); }
        }
      `}</style>
    </div>
  )
}
