import React from 'react'
import { Loader2 } from 'lucide-react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  breadcrumbs?: { label: string; href?: string }[]
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, action, breadcrumbs }) => (
  <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-surface-border bg-surface-card px-6 py-5 md:flex-row md:items-center md:justify-between shadow-card-light dark:shadow-card-dark">
    <div className="flex-1">
      {breadcrumbs && (
        <div className="mb-2 flex flex-wrap items-center gap-1 text-xs text-text-secondary">
          {breadcrumbs.map((b, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span className="text-text-tertiary">/</span>}
              {b.href ? (
                <a href={b.href} className="text-primary-600 dark:text-primary-400 transition hover:text-primary-700">
                  {b.label}
                </a>
              ) : (
                <span className="text-text-primary">{b.label}</span>
              )}
            </span>
          ))}
        </div>
      )}
      <h1 className="text-3xl font-bold text-text-primary">{title}</h1>
      {subtitle && <p className="mt-2 text-sm text-text-secondary">{subtitle}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
)

export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const s = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }[size]
  return <Loader2 className={`${s} animate-spin text-primary-500`} />
}

interface EmptyStateProps {
  message: string
  action?: React.ReactNode
}
export const EmptyState: React.FC<EmptyStateProps> = ({ message, action }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-16">
    <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-surface-border bg-surface-hover">
      <span className="text-2xl">📭</span>
    </div>
    <p className="text-sm text-text-secondary">{message}</p>
    {action && <div className="mt-2">{action}</div>}
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
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm animate-slide-in space-y-4 rounded-2xl border border-surface-border bg-surface-card p-6 shadow-card-light dark:shadow-card-dark">
        <h4 className="text-base font-semibold text-text-primary">{title}</h4>
        <p className="text-sm text-text-secondary">{message}</p>
        <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end">
          <button
            onClick={onCancel}
            className="inline-flex items-center justify-center rounded-lg border border-surface-border bg-surface-card px-4 py-2 text-sm font-semibold text-text-secondary transition hover:bg-surface-hover hover:text-text-primary"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-lg bg-danger-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-danger-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
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
  <label className="flex cursor-pointer items-center gap-3">
    <div
      className={`relative h-6 w-11 rounded-full transition-colors duration-300 ${checked ? 'bg-primary-500' : 'bg-surface-border'}`}
      onClick={() => onChange(!checked)}
    >
      <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white dark:bg-gray-100 shadow transition-transform duration-300 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      <input type="checkbox" checked={checked} onChange={() => {}} className="sr-only" />
    </div>
    {label && <span className="text-sm text-text-secondary">{label}</span>}
  </label>
)

