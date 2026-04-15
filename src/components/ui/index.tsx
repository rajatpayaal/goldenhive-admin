import React from 'react'
import { Loader2 } from 'lucide-react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  breadcrumbs?: { label: string; href?: string }[]
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, action, breadcrumbs }) => (
  <div className="section-header">
    <div>
      {breadcrumbs && (
        <div className="mb-1 flex items-center gap-1 text-xs text-mutedFg">
          {breadcrumbs.map((b, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span>/</span>}
              {b.href ? (
                <a href={b.href} className="hover:text-fg">
                  {b.label}
                </a>
              ) : (
                <span>{b.label}</span>
              )}
            </span>
          ))}
        </div>
      )}
      <h1 className="text-xl font-bold text-fg">{title}</h1>
      {subtitle && <p className="mt-0.5 text-sm text-mutedFg">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
)

export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const s = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }[size]
  return <Loader2 className={`${s} animate-spin text-brand-500`} />
}

interface EmptyStateProps {
  message: string
  action?: React.ReactNode
}
export const EmptyState: React.FC<EmptyStateProps> = ({ message, action }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-16">
    <div className="flex h-16 w-16 items-center justify-center rounded-full border border-surface-border bg-surface-card">
      <span className="text-2xl">📭</span>
    </div>
    <p className="text-sm text-mutedFg">{message}</p>
    {action}
  </div>
)

interface ConfirmProps {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
  title?: string
  message?: string
  confirmLabel?: string
  loading?: boolean
}

export const ConfirmDialog: React.FC<ConfirmProps> = ({
  open,
  onConfirm,
  onCancel,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  loading,
}) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm animate-slide-in space-y-4 rounded-xl border border-surface-border bg-surface-card p-6 shadow-card">
        <h4 className="text-base font-bold text-fg">{title}</h4>
        <p className="text-sm text-mutedFg">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="btn-secondary btn-sm">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading} className="btn-danger btn-sm">
            {loading ? <Spinner size="sm" /> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

interface ToggleProps {
  checked: boolean
  onChange: (v: boolean) => void
  label?: string
}

export const Toggle: React.FC<ToggleProps> = ({ checked, onChange, label }) => (
  <label className="flex cursor-pointer items-center gap-2">
    <div className="toggle" onClick={() => onChange(!checked)}>
      <input type="checkbox" checked={checked} onChange={() => {}} className="sr-only" />
      <div
        className={`absolute inset-0 rounded-full transition-all duration-300 ${
          checked ? 'bg-brand-500' : 'bg-surface-border'
        }`}
      />
      <div
        className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all duration-300 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </div>
    {label && <span className="text-xs text-mutedFg">{label}</span>}
  </label>
)

