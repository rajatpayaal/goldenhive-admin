import React, { useEffect, useState } from 'react'

export type SupportFormData = {
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  assignedTo: string
}

const defaultForm: SupportFormData = {
  status: 'OPEN',
  priority: 'LOW',
  assignedTo: '',
}

interface SupportFormProps {
  defaultValues?: Partial<SupportFormData>
  agents: any[]
  saving: boolean
  onSubmit: (data: SupportFormData) => Promise<void>
}

const SupportForm: React.FC<SupportFormProps> = ({ defaultValues, agents, saving, onSubmit }) => {
  const [form, setForm] = useState<SupportFormData>({ ...defaultForm, ...defaultValues })

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
        <select className="input text-sm" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as SupportFormData['status'] }))}>
          <option value="OPEN">OPEN</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="CLOSED">CLOSED</option>
        </select>
      </div>

      <div>
        <label className="label">Priority</label>
        <select className="input text-sm" value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value as SupportFormData['priority'] }))}>
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
        </select>
      </div>

      <div>
        <label className="label">Assigned Agent</label>
        <select className="input text-sm" value={form.assignedTo} onChange={(e) => setForm((p) => ({ ...p, assignedTo: e.target.value }))}>
          <option value="">-- Unassigned --</option>
          {agents.map((ag) => (
            <option key={ag._id} value={ag._id}>{ag.firstName} {ag.lastName} ({ag.role})</option>
          ))}
        </select>
      </div>

      <div className="flex justify-end border-t border-surface-border pt-4">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  )
}

export default SupportForm
