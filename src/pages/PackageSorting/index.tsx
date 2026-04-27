import React, { useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { PageHeader, Spinner } from '../../components/ui'
import { fetchCategories, fetchPackageSortingByCategory, updatePackageSortOrder } from './service'

const normalizeList = (payload: any) => {
  if (!payload) return []
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload.data)) return payload.data
  if (Array.isArray(payload.items)) return payload.items
  return []
}

const PackageSortingPage: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([])
  const [categoryId, setCategoryId] = useState('')
  const [packages, setPackages] = useState<any[]>([])
  const [draftOrders, setDraftOrders] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [savingId, setSavingId] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories()
      .then((r) => setCategories(normalizeList(r.data?.data || r.data?.items || r.data || [])))
      .catch(() => setCategories([]))
  }, [])

  const loadPackages = async (id = categoryId) => {
    if (!id) {
      setPackages([])
      return
    }

    setLoading(true)
    try {
      const res = await fetchPackageSortingByCategory(id, { limit: 200 })
      const payload = res.data?.data || res.data
      const list = Array.isArray(payload) ? payload : payload?.items || payload?.data || []
      const normalizedList = normalizeList(list)
      setPackages(normalizedList)
      setDraftOrders(
        normalizedList.reduce((acc: Record<string, string>, pkg: any) => {
          const order = Number(pkg?.sortOrder)
          acc[pkg?._id] = Number.isFinite(order) && order > 0 ? String(Math.trunc(order)) : ''
          return acc
        }, {})
      )
    } catch (err: any) {
      setPackages([])
      toast.error(err.response?.data?.message || 'Failed to load packages')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (categoryId) loadPackages(categoryId)
  }, [categoryId])

  const sortedPackages = useMemo(() => {
    return [...packages].sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0))
  }, [packages])

  const showOrderError = (err: any) => {
    const payload = err?.response?.data
    const status = Number(err?.response?.status || 0)
    const code = payload?.code
    const apiMessage =
      payload?.message ||
      payload?.error ||
      payload?.errors?.[0]?.message ||
      (typeof payload === 'string' ? payload : '')
    const transportMessage = err?.message

    if (code === 'SORT_ORDER_REQUIRED' || status === 400) {
      toast.error(apiMessage || 'Sort order required or invalid')
      return
    }
    if (code === 'PACKAGE_NOT_FOUND' || status === 404) {
      toast.error(apiMessage || 'Package not found')
      return
    }
    if (status === 401 || status === 403) {
      toast.error(apiMessage || 'Admin token missing/invalid')
      return
    }
    if (status === 429) {
      toast.error(apiMessage || 'Too many requests, try again shortly')
      return
    }
    toast.error(
      apiMessage ||
      transportMessage ||
      (status ? `Failed to update order (${status})` : 'Failed to update order')
    )
  }

  const handleMove = async (id: string, newOrder: number) => {
    const safeOrder = Math.trunc(Number(newOrder))
    if (!Number.isFinite(safeOrder) || safeOrder < 1) {
      toast.error('Invalid sort order')
      return
    }

    setSavingId(id)
    try {
      await updatePackageSortOrder(id, safeOrder)
      await loadPackages(categoryId)
      toast.success('Sort order updated')
    } catch (err: any) {
      showOrderError(err)
    } finally {
      setSavingId(null)
    }
  }

  const handleManualUpdate = async (id: string) => {
    const value = Math.trunc(Number(draftOrders[id]))
    if (!Number.isFinite(value) || value < 1) {
      toast.error('Enter a valid order number')
      return
    }
    await handleMove(id, value)
  }

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Package Sorting"
        subtitle="Manage category-wise package order for the admin panel"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Package Sorting' }]}
      />

      <div className="flex flex-col gap-4 rounded-3xl border border-surface-border bg-surface-card p-4 shadow-sm sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full max-w-md">
          <label className="mb-2 block text-sm font-medium text-text-secondary">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-2xl border border-surface-border bg-surface-card/90 px-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-400 focus:ring-1 focus:ring-brand-400/30"
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          disabled={!categoryId || loading}
          onClick={() => loadPackages(categoryId)}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-surface-border bg-surface-card px-4 py-3 text-sm font-semibold text-text-primary transition hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      <div className="rounded-3xl border border-surface-border bg-surface-card p-4 shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Spinner size="lg" />
          </div>
        ) : sortedPackages.length === 0 ? (
          <p className="text-sm text-text-tertiary">Select a category to load packages.</p>
        ) : (
          <div className="space-y-3">
            {sortedPackages.map((pkg, index) => {
              const order = index + 1
              const canMoveUp = index > 0
              const canMoveDown = index < sortedPackages.length - 1
              const displayName = pkg.basic?.name || pkg.name || 'Untitled package'
              const saving = savingId === pkg._id

              return (
                <div key={pkg._id} className="flex flex-col gap-3 rounded-2xl border border-surface-border bg-surface-card/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{displayName}</p>
                    <p className="text-xs text-text-tertiary">Sort order: {pkg.sortOrder ?? order}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      value={draftOrders[pkg._id] ?? ''}
                      onChange={(e) =>
                        setDraftOrders((prev) => ({
                          ...prev,
                          [pkg._id]: e.target.value,
                        }))
                      }
                      className="h-10 w-24 rounded-xl border border-surface-border bg-surface-card px-3 text-sm text-text-primary outline-none transition focus:border-brand-400 focus:ring-1 focus:ring-brand-400/30"
                      placeholder="Order"
                    />
                    <button
                      type="button"
                      disabled={saving || loading}
                      onClick={() => handleManualUpdate(pkg._id)}
                      className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-surface-border bg-surface-card px-3 py-2 text-sm font-semibold text-text-primary transition hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Update
                    </button>
                    <button
                      type="button"
                      disabled={!canMoveUp || saving || loading}
                      onClick={() => handleMove(pkg._id, Math.max(order - 1, 1))}
                      className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-surface-border bg-surface-card px-3 py-2 text-sm font-semibold text-text-primary transition hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <ArrowUp className="h-4 w-4" /> Up
                    </button>
                    <button
                      type="button"
                      disabled={!canMoveDown || saving || loading}
                      onClick={() => handleMove(pkg._id, order + 1)}
                      className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-surface-border bg-surface-card px-3 py-2 text-sm font-semibold text-text-primary transition hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <ArrowDown className="h-4 w-4" /> Down
                    </button>
                    {saving && <Spinner size="sm" />}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default PackageSortingPage
