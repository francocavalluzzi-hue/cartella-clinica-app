"use client"

import { ReactNode, ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: ReactNode
  children: ReactNode
  fullWidth?: boolean
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: 'var(--primary)',
    color: 'white',
    border: 'none',
    boxShadow: 'var(--shadow-md)',
  },
  secondary: {
    background: 'var(--background)',
    color: 'var(--text-main)',
    border: '1px solid var(--border)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-muted)',
    border: 'none',
  },
  danger: {
    background: 'var(--danger)',
    color: 'white',
    border: 'none',
  },
}

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: { padding: '8px 16px', fontSize: '13px', borderRadius: 'var(--radius-sm)' },
  md: { padding: '12px 24px', fontSize: '14px', borderRadius: 'var(--radius-md)' },
  lg: { padding: '18px 48px', fontSize: '16px', borderRadius: 'var(--radius-lg)' },
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  fullWidth = false,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <button
      disabled={isDisabled}
        style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        fontWeight: 700,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.7 : 1,
        width: fullWidth ? '100%' : 'auto',
        transition: 'all 0.2s ease',
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...(style || {}),
      }}
      {...props}
    >
      {loading && <Loader2 size={18} className="animate-spin" />}
      {!loading && icon}
      {children}
    </button>
  )
}