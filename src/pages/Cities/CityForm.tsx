import React, { useEffect, useState } from 'react'
import { fetchStates } from './service'

export type CityFormData = {
  name: string
  slug?: string
  stateId: string
  isActive: boolean
}

const defaultForm: CityFormData = {
  name: '',
  slug: '',
  stateId: '',
  isActive: true,
}

interface CityFormProps {
  defaultValues?: Partial<CityFormData>
  saving: boolean
  onSubmit: (data: CityFormData) => Promise<void>
}

const CityForm: React.FC<CityFormProps> = ({ defaultValues, saving, onSubmit }) => {
  const [form, setForm] = useState<CityFormData>({ ...defaultForm, ...defaultValues })
  const [statesList, setStatesList] = useState<any[]>([])

  useEffect(() => {
    setForm({ ...defaultForm, ...defaultValues })
  }, [defaultValues])

  useEffect(() => {
    fetchStates().then((r) => setStatesList(r.data?.data || r.data?.items || r.data || []))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Parent State *</label>
        <select className="input" value={form.stateId} onChange={(e) => setForm((p) => ({ ...p, stateId: e.target.value }))}>
          <option value="">Select State</option>
          {statesList.map((s) => (
            <option key={s._id} value={s._id}>{s.name} ({s.countryId?.name || 'Local'})</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">City Name *</label>
        <input className="input" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Manali" />
      </div>
      <div>
        <label className="label">Slug (auto-generated if blank)</label>
        <input className="input" value={form.slug || ''} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} placeholder="manali" />
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
          {saving ? 'Saving...' : 'Save City'}
        </button>
      </div>
    </form>
  )
}

export default CityForm
