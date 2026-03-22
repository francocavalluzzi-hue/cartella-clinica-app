"use client"

import { ReactNode, HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
}

const paddingStyles = {
  none: '0',
  sm: '16px',
  md: '24px',
  lg: '40px',
}

export default function Card({
  children,
  padding = 'md',
  hover = false,
  style,
  ...props
}: CardProps) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: paddingStyles[padding],
        boxShadow: 'var(--shadow-sm)',
        transition: hover ? 'all 0.2s ease' : 'none',
        ...(style || {}),
      }}
      {...props}
    >
      {children}
    </div>
  )
}

// Sub-components for structured cards
export function CardHeader({ children, style, ...props }: { children: ReactNode } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      style={{
        padding: '20px 24px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--background)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        ...(style || {}),
      }}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardTitle({ children, icon }: { children: ReactNode; icon?: ReactNode }) {
  return (
    <h3 style={{
      fontSize: '16px',
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      margin: 0,
      color: 'var(--text-main)',
    }}>
      {icon}
      {children}
    </h3>
  )
}

export function CardDescription({ children }: { children: ReactNode }) {
  return (
    <p style={{
      fontSize: '12px',
      color: 'var(--text-muted)',
      margin: '4px 0 0 0',
    }}>
      {children}
    </p>
  )
}

export function CardContent({ children, style, ...props }: { children: ReactNode } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      style={{
        padding: '24px',
        ...(style || {}),
      }}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardFooter({ children, style, ...props }: { children: ReactNode } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      style={{
        padding: '12px 24px',
        background: 'var(--background)',
        fontSize: '11px',
        color: 'var(--text-muted)',
        textAlign: 'center',
        borderTop: '1px solid var(--border)',
        ...(style || {}),
      }}
      {...props}
    >
      {children}
    </div>
  )
}