"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

type HeaderProps = {
    title: string
    subtitle?: string
    showBack?: boolean
    onBack?: () => void
    right?: React.ReactNode
}

export default function Header({ title, subtitle, showBack, onBack, right }: HeaderProps) {
    const router = useRouter()

    const handleBack = () => {
        if (onBack) return onBack()
        router.push("/")
    }

    return (
        <header className="page-header">
            <div className="left">
                {showBack && (
                    <button className="back-button" onClick={handleBack} aria-label="Torna alla Home">
                        <ArrowLeft size={16} /> Torna alla Home
                    </button>
                )}

                <div>
                    <div className="page-header-title">{title}</div>
                    {subtitle && <div className="page-header-subtitle">{subtitle}</div>}
                </div>
            </div>

            <div className="right">{right}</div>
        </header>
    )
}
