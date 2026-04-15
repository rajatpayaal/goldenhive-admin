import React, { useEffect, useState } from 'react'

export type FAQFormData = {
  question: string
  answer: string
}

const defaultForm: FAQFormData = {
  question: '',
  answer: '',
}

interface FAQFormProps {
  defaultValues?: Partial<FAQFormData>
  saving: boolean
  onSubmit: (data: FAQFormData) => Promise<void>
}

const FAQForm: React.FC<FAQFormProps> = ({ defaultValues, saving, onSubmit }) => {
  const [form, setForm] = useState<FAQFormData>({ ...defaultForm, ...defaultValues })

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
        <label className="label">Question *</label>
        <input className="input" value={form.question} onChange={(e) => setForm((p) => ({ ...p, question: e.target.value }))} />
      </div>
      <div>
        <label className="label">Answer *</label>
        <textarea className="input resize-none" rows={4} value={form.answer} onChange={(e) => setForm((p) => ({ ...p, answer: e.target.value }))} />
      </div>
      <div className="flex justify-end border-t border-surface-border pt-4">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save FAQ'}
        </button>
      </div>
    </form>
  )
}

export default FAQForm
