import React, { useEffect, useState } from 'react'
import { Toggle } from '../../components/ui'

export type DiscountFormData = {
  code: string
  type: 'PERCENT' | 'FLAT'
  value: number
  minAmount: number
  maxDiscount: number
  isActive: boolean
}

const defaultFormData: DiscountFormData = {
  code: '',
  type: 'PERCENT',
  value: 10,
  minAmount: 0,
  maxDiscount: 0,
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
    await onSubmit(form)
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
          />
        </div>

        <div>
          <label className="label">Type</label>
          <select
            className="input"
            value={form.type}
            onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as DiscountFormData['type'] }))}
          >
            <option value="PERCENT">PERCENT</option>
            <option value="FLAT">FLAT</option>
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
          <label className="label">Min Amount</label>
          <input
            type="number"
            className="input"
            value={form.minAmount}
            min={0}
            onChange={(e) => setForm((p) => ({ ...p, minAmount: Number(e.target.value || 0) }))}
          />
        </div>

        <div>
          <label className="label">Max Discount</label>
          <input
            type="number"
            className="input"
            value={form.maxDiscount}
            min={0}
            onChange={(e) => setForm((p) => ({ ...p, maxDiscount: Number(e.target.value || 0) }))}
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
