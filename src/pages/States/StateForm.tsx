import React, { useEffect, useState } from 'react'
import { fetchCountries } from './service'

export type StateFormData = {
  name: string
  slug?: string
  countryId: string
  isActive: boolean
}

const defaultForm: StateFormData = {
  name: '',
  slug: '',
  countryId: '',
  isActive: true,
}

interface StateFormProps {
  defaultValues?: Partial<StateFormData>
  saving: boolean
  onSubmit: (data: StateFormData) => Promise<void>
}

const StateForm: React.FC<StateFormProps> = ({ defaultValues, saving, onSubmit }) => {
  const [form, setForm] = useState<StateFormData>({ ...defaultForm, ...defaultValues })
  const [countries, setCountries] = useState<any[]>([])

  useEffect(() => {
    setForm({ ...defaultForm, ...defaultValues })
  }, [defaultValues])

  useEffect(() => {
    fetchCountries().then((r) => setCountries(r.data?.data || r.data?.items || r.data || []))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Parent Country *</label>
        <select className="input" value={form.countryId} onChange={(e) => setForm((p) => ({ ...p, countryId: e.target.value }))}>
          <option value="">Select Country</option>
          {countries.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">State Name *</label>
        <input className="input" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Himachal Pradesh" />
      </div>
      <div>
        <label className="label">Slug (auto-generated if blank)</label>
        <input className="input" value={form.slug || ''} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} placeholder="himachal-pradesh" />
      </div>
      <div>
        <label className="label">Status</label>
        <select className="input" value={String(form.isActive)} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.value === 'true' }))}>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>
      <div className="flex justify-end border-t border-surface-border pt-4">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save State'}
        </button>
      </div>
    </form>
  )
}

export default StateForm
