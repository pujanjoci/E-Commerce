'use client'

import { type ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, className = '', disabled, ...props }, ref) => {
    const base =
      'relative inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ag-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ag-base)] disabled:opacity-40 disabled:cursor-not-allowed select-none'

    const variants = {
      primary:
        'bg-[var(--ag-accent)] text-white hover:bg-[var(--ag-accent-hover)] hover:shadow-[0_0_24px_var(--ag-accent-glow)] active:scale-[0.98]',
      secondary:
        'bg-[var(--ag-surface-2)] text-[var(--ag-text-primary)] border border-[var(--ag-border)] hover:border-[var(--ag-border-strong)] hover:bg-[var(--ag-surface)] active:scale-[0.98]',
      outline:
        'bg-transparent text-[var(--ag-accent)] border border-[var(--ag-accent)] hover:bg-[var(--ag-accent-muted)] active:scale-[0.98]',
      ghost:
        'bg-transparent text-[var(--ag-text-secondary)] hover:text-[var(--ag-text-primary)] hover:bg-[var(--ag-surface-2)] active:scale-[0.98]',
      danger:
        'bg-[var(--ag-danger)] text-white hover:opacity-90 active:scale-[0.98]',
    }

    const sizes = {
      sm: 'text-xs px-3 py-1.5 h-7',
      md: 'text-sm px-5 py-2.5 h-10',
      lg: 'text-base px-7 py-3.5 h-13',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button
