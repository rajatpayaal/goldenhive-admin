import React, { useEffect, useState } from 'react'

export type CustomRequestFormData = {
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED'
  adminNote: string
}

const defaultForm: CustomRequestFormData = {
  status: 'PENDING',
  adminNote: '',
}

interface CustomRequestFormProps {
  defaultValues?: Partial<CustomRequestFormData>
  saving: boolean
  onSubmit: (data: CustomRequestFormData) => Promise<void>
}

const CustomRequestForm: React.FC<CustomRequestFormProps> = ({ defaultValues, saving, onSubmit }) => {
  const [form, setForm] = useState<CustomRequestFormData>({ ...defaultForm, ...defaultValues })

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
        <label className="label">Status</label>
        <select className="input" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as CustomRequestFormData['status'] }))}>
          <option value="PENDING">PENDING</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="REJECTED">REJECTED</option>
        </select>
      </div>
      <div>
        <label className="label">Admin Note</label>
        <input className="input" value={form.adminNote} onChange={(e) => setForm((p) => ({ ...p, adminNote: e.target.value }))} />
      </div>
      <div className="flex justify-end border-t border-surface-border pt-4">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  )
}

export default CustomRequestForm
