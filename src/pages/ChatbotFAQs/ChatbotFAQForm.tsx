import React, { useEffect, useState } from 'react'
import { Toggle } from '../../components/ui'

export type ChatbotFAQFormData = {
  question: string
  answer: string
  keywords: string
  isActive: boolean
}

const defaultForm: ChatbotFAQFormData = {
  question: '',
  answer: '',
  keywords: '',
  isActive: true,
}

interface ChatbotFAQFormProps {
  defaultValues?: Partial<ChatbotFAQFormData>
  saving: boolean
  onSubmit: (data: ChatbotFAQFormData) => Promise<void>
}

const ChatbotFAQForm: React.FC<ChatbotFAQFormProps> = ({ defaultValues, saving, onSubmit }) => {
  const [form, setForm] = useState<ChatbotFAQFormData>({ ...defaultForm, ...defaultValues })

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
        <label className="label">User Question / Intent *</label>
        <input className="input" value={form.question} onChange={(e) => setForm((p) => ({ ...p, question: e.target.value }))} />
      </div>
      <div>
        <label className="label">Matching Triggers / Keywords</label>
        <input className="input text-sm" value={form.keywords} onChange={(e) => setForm((p) => ({ ...p, keywords: e.target.value }))} />
      </div>
      <div>
        <label className="label">AI Answer *</label>
        <textarea className="input resize-none" rows={4} value={form.answer} onChange={(e) => setForm((p) => ({ ...p, answer: e.target.value }))} />
      </div>
      <label className="mt-4 flex cursor-pointer items-center gap-3">
        <Toggle checked={form.isActive} onChange={(v) => setForm((p) => ({ ...p, isActive: v }))} />
        <span className="text-sm font-medium text-text-secondary">Logic is currently Active</span>
      </label>
      <div className="flex justify-end border-t border-surface-border pt-4">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save AI Logic'}
        </button>
      </div>
    </form>
  )
}

export default ChatbotFAQForm
