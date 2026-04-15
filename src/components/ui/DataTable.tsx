import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Column<T> {
  header: string
  accessor?: keyof T
  render?: (row: T) => React.ReactNode
  className?: string
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  emptyMessage?: string
  keyExtractor: (row: T) => string
  // pagination
  page?: number
  totalPages?: number
  onPageChange?: (page: number) => void
}

function DataTable<T>({
  columns, data, loading = false, emptyMessage = 'No records found', keyExtractor,
  page = 1, totalPages = 1, onPageChange,
}: TableProps<T>) {
  const skeletonRows = 5

  return (
    <div className="overflow-hidden rounded-2xl border border-surface-border bg-surface-card shadow-card-light dark:shadow-card-dark">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-surface-border text-sm text-text-primary">
          <thead className="bg-surface-hover border-b border-surface-border">
            <tr>
              {columns.map((col) => (
                <th key={col.header} className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-primary ${col.className || ''}`}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {loading ? (
              Array.from({ length: skeletonRows }).map((_, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={col.header} className="px-4 py-4">
                      <div className="h-4 w-full animate-pulse rounded bg-surface-border" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-text-secondary">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={keyExtractor(row)} className="hover:bg-surface-hover transition-colors">
                  {columns.map((col) => (
                    <td key={col.header} className={`px-4 py-4 align-top text-text-primary ${col.className || ''}`}>
                      {col.render
                        ? col.render(row)
                        : col.accessor
                        ? String(row[col.accessor] ?? '')
                        : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && onPageChange && (
        <div className="flex flex-col gap-3 border-t border-surface-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between bg-surface-hover">
          <p className="text-xs text-text-secondary">Page {page} of {totalPages}</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-surface-border bg-surface-card text-text-primary transition hover:bg-surface-border disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, page - 2) + i
              if (p > totalPages) return null
              return (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  className={`flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg text-xs font-semibold transition ${
                    p === page ? 'bg-primary-500 text-white' : 'text-text-primary hover:bg-surface-border'
                  }`}
                >
                  {p}
                </button>
              )
            })}
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-surface-border bg-surface-card text-text-primary transition hover:bg-surface-border disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataTable
