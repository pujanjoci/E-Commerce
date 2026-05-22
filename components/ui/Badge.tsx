import { type HTMLAttributes } from 'react'

type BadgeVariant = 'default' | 'accent' | 'success' | 'warning' | 'danger' | 'ghost'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-[var(--ag-surface-2)] text-[var(--ag-text-secondary)] border border-[var(--ag-border)]',
  accent: 'bg-[var(--ag-accent-muted)] text-[var(--ag-accent-hover)] border border-[var(--ag-accent)]/30',
  success: 'bg-[var(--ag-success)]/10 text-[var(--ag-success)] border border-[var(--ag-success)]/30',
  warning: 'bg-[var(--ag-warning)]/10 text-[var(--ag-warning)] border border-[var(--ag-warning)]/30',
  danger: 'bg-[var(--ag-danger)]/10 text-[var(--ag-danger)] border border-[var(--ag-danger)]/30',
  ghost: 'bg-transparent text-[var(--ag-text-muted)]',
}

export default function Badge({ variant = 'default', className = '', children, ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}
