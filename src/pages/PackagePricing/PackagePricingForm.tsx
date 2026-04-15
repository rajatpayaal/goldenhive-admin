import React, { useEffect, useState } from 'react'
import { Toggle } from '../../components/ui'

export type PricingFormData = {
  packageId: string
  vehicleId: string
  pax: number
  pricePerPerson: number
  totalPrice: number | ''
  discountPercent: number
  finalPricePerPerson: number | ''
  isBestDeal: boolean
  isActive: boolean
}

const defaultForm: PricingFormData = {
  packageId: '',
  vehicleId: '',
  pax: 2,
  pricePerPerson: 0,
  totalPrice: '',
  discountPercent: 0,
  finalPricePerPerson: '',
  isBestDeal: false,
  isActive: true,
}

interface PackagePricingFormProps {
  defaultValues?: Partial<PricingFormData>
  packages: any[]
  vehicles: any[]
  saving: boolean
  onSubmit: (data: PricingFormData) => Promise<void>
}

const PackagePricingForm: React.FC<PackagePricingFormProps> = ({ defaultValues, packages, vehicles, saving, onSubmit }) => {
  const [form, setForm] = useState<PricingFormData>({ ...defaultForm, ...defaultValues })

  useEffect(() => {
    setForm({ ...defaultForm, ...defaultValues })
  }, [defaultValues])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="label">Package *</label>
          <select className="input" value={form.packageId} onChange={(e) => setForm((pf) => ({ ...pf, packageId: e.target.value }))}>
            <option value="">Select Package</option>
            {packages.map((p) => (
              <option key={p._id} value={p._id}>{p.basic?.name || p._id}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="label">Vehicle *</label>
          <select className="input" value={form.vehicleId} onChange={(e) => setForm((pf) => ({ ...pf, vehicleId: e.target.value }))}>
            <option value="">Select Vehicle</option>
            {vehicles.map((v) => (
              <option key={v._id} value={v._id}>{v.name} ({v.type || 'Standard'})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Pax (Occupancy) *</label>
          <input type="number" className="input" min={1} value={form.pax} onChange={(e) => setForm((pf) => ({ ...pf, pax: Number(e.target.value || 1) }))} />
        </div>

        <div>
          <label className="label">Base Price Per Person *</label>
          <input type="number" className="input" min={0} step="0.01" value={form.pricePerPerson} onChange={(e) => setForm((pf) => ({ ...pf, pricePerPerson: Number(e.target.value || 0) }))} />
        </div>

        <div>
          <label className="label">Discount %</label>
          <input type="number" className="input" min={0} max={100} value={form.discountPercent} onChange={(e) => setForm((pf) => ({ ...pf, discountPercent: Number(e.target.value || 0) }))} />
        </div>

        <div>
          <label className="label">Final Price Per Person (Optional Override)</label>
          <input type="number" className="input" min={0} step="0.01" value={form.finalPricePerPerson} onChange={(e) => setForm((pf) => ({ ...pf, finalPricePerPerson: e.target.value === '' ? '' : Number(e.target.value) }))} />
        </div>

        <div>
          <label className="label">Total Price (Optional Override)</label>
          <input type="number" className="input" min={0} step="0.01" value={form.totalPrice} onChange={(e) => setForm((pf) => ({ ...pf, totalPrice: e.target.value === '' ? '' : Number(e.target.value) }))} />
        </div>
      </div>

      <div className="mt-2 grid grid-cols-1 gap-4 border-t border-surface-border pt-2 md:grid-cols-2">
        <label className="flex cursor-pointer items-center gap-3">
          <Toggle checked={form.isBestDeal} onChange={(v) => setForm((pf) => ({ ...pf, isBestDeal: v }))} />
          <span className="text-sm font-medium">Highlight as Best Deal</span>
        </label>

        <label className="flex cursor-pointer items-center gap-3">
          <Toggle checked={form.isActive} onChange={(v) => setForm((pf) => ({ ...pf, isActive: v }))} />
          <span className="text-sm font-medium">Active (Visible)</span>
        </label>
      </div>

      <div className="flex justify-end border-t border-surface-border pt-4">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save Pricing'}
        </button>
      </div>
    </form>
  )
}

export default PackagePricingForm
