import { type InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[var(--ag-text-secondary)]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ag-text-muted)] pointer-events-none">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={[
              'w-full rounded-xl border bg-[var(--ag-surface)] text-[var(--ag-text-primary)] placeholder-[var(--ag-text-muted)]',
              'text-sm px-4 py-2.5 h-11',
              'border-[var(--ag-border)] hover:border-[var(--ag-border-strong)]',
              'focus:outline-none focus:border-[var(--ag-accent)] focus:ring-1 focus:ring-[var(--ag-accent)]',
              'transition-all duration-200',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              error ? 'border-[var(--ag-danger)] focus:border-[var(--ag-danger)] focus:ring-[var(--ag-danger)]' : '',
              icon ? 'pl-10' : '',
              className,
            ].join(' ')}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-[var(--ag-danger)]">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
