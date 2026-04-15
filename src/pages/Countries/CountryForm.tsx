import React, { useEffect, useState } from 'react'

export type CountryFormData = {
  name: string
  slug?: string
  isActive: boolean
}

const defaultForm: CountryFormData = {
  name: '',
  slug: '',
  isActive: true,
}

interface CountryFormProps {
  defaultValues?: Partial<CountryFormData>
  saving: boolean
  onSubmit: (data: CountryFormData) => Promise<void>
}

const CountryForm: React.FC<CountryFormProps> = ({ defaultValues, saving, onSubmit }) => {
  const [form, setForm] = useState<CountryFormData>({ ...defaultForm, ...defaultValues })

  useEffect(() => {
    setForm({ ...defaultForm, ...defaultValues })
  }, [defaultValues])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Country Name *</label>
        <input className="input" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. India" />
      </div>
      <div>
        <label className="label">Slug (auto-generated if blank)</label>
        <input className="input" value={form.slug || ''} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} placeholder="india" />
      </div>
      <div>
        <label className="label">Status</label>
        <select
          className="input"
          value={String(form.isActive)}
          onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.value === 'true' }))}
        >
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>
      <div className="flex justify-end border-t border-surface-border pt-4">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save Country'}
        </button>
      </div>
    </form>
  )
}

export default CountryForm
