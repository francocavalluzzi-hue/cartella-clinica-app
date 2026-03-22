"use client"

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'critical'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  size?: 'sm' | 'md'
}

const variantStyles: Record<BadgeVariant, { bg: string; color: string }> = {
  default: { bg: 'var(--border)', color: 'var(--text-muted)' },
  success: { bg: '#10b98122', color: '#10b981' },
  warning: { bg: '#f59e0b22', color: '#f59e0b' },
  danger: { bg: '#ef444422', color: '#ef4444' },
  info: { bg: '#3b82f622', color: '#3b82f6' },
  critical: { bg: '#8b5cf622', color: '#8b5cf6' },
}

const sizeStyles = {
  sm: { padding: '2px 6px', fontSize: '10px' },
  md: { padding: '4px 10px', fontSize: '12px' },
}

export default function Badge({
  children,
  variant = 'default',
  size = 'sm'
}: BadgeProps) {
  const styles = variantStyles[variant]
  const sizeStyle = sizeStyles[size]

  return (
    <span style={{
      padding: sizeStyle.padding,
      background: styles.bg,
      color: styles.color,
      borderRadius: '4px',
      fontSize: sizeStyle.fontSize,
      fontWeight: 800,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    }}>
      {children}
    </span>
  )
}

// Convenience components for security levels
export function SecurityBadge({ level }: { level: 'low' | 'medium' | 'high' | 'critical' }) {
  const variantMap: Record<string, BadgeVariant> = {
    low: 'default',
    medium: 'info',
    high: 'success',
    critical: 'critical',
  }

  return (
    <Badge variant={variantMap[level]}>
      {level.toUpperCase()}
    </Badge>
  )
}

export function StatusBadge({ status }: { status: 'pending' | 'active' | 'completed' | 'error' }) {
  const variantMap: Record<string, BadgeVariant> = {
    pending: 'warning',
    active: 'info',
    completed: 'success',
    error: 'danger',
  }

  return (
    <Badge variant={variantMap[status]} size="md">
      {status === 'pending' ? 'In Attesa' :
       status === 'active' ? 'Attivo' :
       status === 'completed' ? 'Completato' : 'Errore'}
    </Badge>
  )
}