import React, { useEffect, useState } from 'react'

export type ReviewFormData = {
  packageId: string
  userId: string
  rating: number
  comment: string
}

const defaultForm: ReviewFormData = {
  packageId: '',
  userId: '',
  rating: 5,
  comment: '',
}

interface ReviewFormProps {
  defaultValues?: Partial<ReviewFormData>
  saving: boolean
  onSubmit: (data: ReviewFormData) => Promise<void>
}

const ReviewForm: React.FC<ReviewFormProps> = ({ defaultValues, saving, onSubmit }) => {
  const [form, setForm] = useState<ReviewFormData>({ ...defaultForm, ...defaultValues })

  useEffect(() => {
    setForm({ ...defaultForm, ...defaultValues })
  }, [defaultValues])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="label">Package ID</label>
        <input className="input" value={form.packageId} onChange={(e) => setForm((p) => ({ ...p, packageId: e.target.value }))} />
      </div>
      <div>
        <label className="label">User ID</label>
        <input className="input" value={form.userId} onChange={(e) => setForm((p) => ({ ...p, userId: e.target.value }))} />
      </div>
      <div>
        <label className="label">Rating</label>
        <input type="number" min={1} max={5} className="input" value={form.rating} onChange={(e) => setForm((p) => ({ ...p, rating: Number(e.target.value || 5) }))} />
      </div>
      <div>
        <label className="label">Comment</label>
        <textarea className="input resize-none" rows={4} value={form.comment} onChange={(e) => setForm((p) => ({ ...p, comment: e.target.value }))} />
      </div>
      <div className="flex justify-end border-t border-surface-border pt-4">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save Review'}
        </button>
      </div>
    </form>
  )
}

export default ReviewForm
