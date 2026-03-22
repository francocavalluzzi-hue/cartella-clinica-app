"use client"

import { ReactNode, InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  icon?: ReactNode
  error?: string
  required?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  icon,
  error,
  required,
  style,
  ...props
}, ref) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {label && (
        <label style={{
          fontSize: '13px',
          fontWeight: 700,
          color: 'var(--text-muted)',
        }}>
          {label} {required && <span style={{ color: 'red' }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {icon && (
          <span style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
            pointerEvents: 'none',
          }}>
            {icon}
          </span>
        )}
        <input
          ref={ref}
          style={{
            width: '100%',
            padding: icon ? '16px 16px 16px 48px' : '16px',
            borderRadius: 'var(--radius-md)',
            border: error ? '2px solid var(--danger)' : '1px solid var(--border)',
            fontSize: '16px',
            background: 'var(--background)',
            color: 'var(--text-main)',
            outline: 'none',
            transition: 'border-color 0.2s, box-shadow 0.12s',
            ...(style || {}),
          }}
          {...props}
        />
      </div>
      {error && (
        <span style={{
          fontSize: '12px',
          color: 'var(--danger)',
          marginTop: '4px',
        }}>
          {error}
        </span>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input