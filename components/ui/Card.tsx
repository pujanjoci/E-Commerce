import { type HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  glass?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingMap = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export default function Card({ hover = false, glass = false, padding = 'md', className = '', children, ...props }: CardProps) {
  return (
    <div
      className={[
        'rounded-lg border border-[var(--ag-border)] transition-all duration-300',
        glass ? 'ag-glass' : 'bg-[var(--ag-surface)]',
        hover ? 'hover:border-[var(--ag-border-strong)] hover:shadow-[var(--ag-shadow)] hover:-translate-y-0.5' : '',
        paddingMap[padding],
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}
