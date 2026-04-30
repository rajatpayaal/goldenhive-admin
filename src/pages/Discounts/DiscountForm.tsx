import React, { useEffect, useState } from 'react'
import { Toggle } from '../../components/ui'

export type DiscountFormData = {
  code: string
  packageId?: string
  minPax: number
  discountType: 'percent' | 'flat'
  value: number
  startDate?: string
  endDate?: string
  isActive: boolean
}

const defaultFormData: DiscountFormData = {
  code: '',
  packageId: '',
  minPax: 1,
  discountType: 'percent',
  value: 10,
  startDate: '',
  endDate: '',
  isActive: true,
}

interface DiscountFormProps {
  defaultValues?: Partial<DiscountFormData>
  saving: boolean
  onSubmit: (data: DiscountFormData) => Promise<void>
}

const DiscountForm: React.FC<DiscountFormProps> = ({ defaultValues, saving, onSubmit }) => {
  const [form, setForm] = useState<DiscountFormData>({ ...defaultFormData, ...defaultValues })

  useEffect(() => {
    setForm({ ...defaultFormData, ...defaultValues })
  }, [defaultValues])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Handle optional fields
    const dataToSubmit = { ...form }
    if (!dataToSubmit.packageId) delete dataToSubmit.packageId
    if (!dataToSubmit.startDate) delete dataToSubmit.startDate
    if (!dataToSubmit.endDate) delete dataToSubmit.endDate
    await onSubmit(dataToSubmit)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <label className="label">Code *</label>
          <input
            className="input"
            value={form.code}
            onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
            placeholder="WELCOME10"
            required
          />
        </div>

        <div>
          <label className="label">Package ID (Optional)</label>
          <input
            className="input"
            value={form.packageId || ''}
            onChange={(e) => setForm((p) => ({ ...p, packageId: e.target.value }))}
            placeholder="Specific Package ID"
          />
        </div>

        <div>
          <label className="label">Type</label>
          <select
            className="input"
            value={form.discountType}
            onChange={(e) => setForm((p) => ({ ...p, discountType: e.target.value as DiscountFormData['discountType'] }))}
          >
            <option value="percent">PERCENT</option>
            <option value="flat">FLAT</option>
          </select>
        </div>

        <div>
          <label className="label">Value</label>
          <input
            type="number"
            className="input"
            value={form.value}
            min={0}
            onChange={(e) => setForm((p) => ({ ...p, value: Number(e.target.value || 0) }))}
          />
        </div>

        <div>
          <label className="label">Min Pax</label>
          <input
            type="number"
            className="input"
            value={form.minPax}
            min={1}
            onChange={(e) => setForm((p) => ({ ...p, minPax: Number(e.target.value || 1) }))}
          />
        </div>

        <div>
          <label className="label">Start Date</label>
          <input
            type="datetime-local"
            className="input"
            value={form.startDate || ''}
            onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
          />
        </div>

        <div>
          <label className="label">End Date</label>
          <input
            type="datetime-local"
            className="input"
            value={form.endDate || ''}
            onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
          />
        </div>
      </div>

      <label className="flex w-fit cursor-pointer items-center gap-3">
        <Toggle checked={form.isActive} onChange={(v) => setForm((p) => ({ ...p, isActive: v }))} />
        <span className="text-sm font-medium text-text-primary">Discount Active</span>
      </label>

      <div className="flex justify-end border-t border-surface-border pt-4">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save Discount'}
        </button>
      </div>
    </form>
  )
}

export default DiscountForm
