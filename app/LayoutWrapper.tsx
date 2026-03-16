"use client"

import React, { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import Sidebar from "./Sidebar"
import CommandPalette from "./components/CommandPalette"
import { supabase } from "../lib/supabaseClient"
import { BellRing, ShieldX } from "lucide-react"

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [toast, setToast] = useState<{message: string, type: 'info'|'warning'}|null>(null)
  
  // Se siamo nella landing page o nel percorso tablet, non mostriamo la sidebar desktop
  const isTablet = pathname?.startsWith("/tablet")
  const isLanding = pathname === "/"
  const isLogin = pathname === "/login"

  // 1. Auto-Lock Security (Inactivity Timer)
  useEffect(() => {
    if (isLanding || isLogin) return; // Non bloccare sulla landing o se già in login

    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      // Timeout globale: 10 minuti (600000 ms) di inattività = blocco
      timeoutId = setTimeout(() => {
        setToast({ message: "Sessione bloccata per inattività.", type: 'warning' })
        setTimeout(() => router.push('/login'), 2000)
      }, 600000); 
    };

    // Eventi che resettano il timer
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('scroll', resetTimer);
    window.addEventListener('click', resetTimer);

    resetTimer(); // Start timer inizialmente

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('scroll', resetTimer);
      window.removeEventListener('click', resetTimer);
    };
  }, [pathname, isLanding, isLogin, router]);

  // 2. Global Real-time Notifications (Supabase)
  useEffect(() => {
    if (isLanding || isLogin) return;

    const channel = supabase
      .channel('global_documents')
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "documents"
      }, (payload: any) => {
        // Notifica globale quando arriva un nuovo documento (es. firmato dal tablet in sala d'attesa)
        setToast({ message: `Nuovo documento firmato dal paziente (ID Paziente: ${payload.new.patient_id.substring(0,6)}...)`, type: 'info' })
        setTimeout(() => setToast(null), 5000)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [isLanding, isLogin])

  if (isTablet || isLanding || isLogin) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--content-bg)" }}>
        <CommandPalette />
        {children}
      </div>
    )
  }

  return (
    <div style={{ display: "flex", position: 'relative' }}>
      <Sidebar />
      <main style={{ 
        flex: 1, 
        marginLeft: "260px", 
        minHeight: "100vh",
        background: "var(--content-bg)"
      }}>
        <CommandPalette />
        {children}
      </main>

      {/* Global Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: toast.type === 'info' ? 'var(--surface)' : '#ef4444',
          color: toast.type === 'info' ? 'var(--text-main)' : 'white',
          padding: '16px 24px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          border: toast.type === 'info' ? '1px solid var(--primary)' : 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 9999,
          animation: 'slideInRight 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}>
          {toast.type === 'info' ? <BellRing size={20} color="var(--primary)" /> : <ShieldX size={20} color="white" />}
          <span style={{ fontSize: '14px', fontWeight: 600 }}>{toast.message}</span>
          
          <style jsx>{`
            @keyframes slideInRight {
              from { transform: translateX(100%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </div>
  )
}
