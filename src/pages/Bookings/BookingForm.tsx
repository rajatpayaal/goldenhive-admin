import React, { useEffect, useState } from 'react'

export type BookingFormData = {
  packageId: string
  startDate: string
  endDate: string
  travellers: number
  totalAmount: number
  status: string
  paymentStatus: string
  note: string
}

const defaultForm: BookingFormData = {
  packageId: '',
  startDate: '',
  endDate: '',
  travellers: 1,
  totalAmount: 0,
  status: 'REQUESTED',
  paymentStatus: 'UNPAID',
  note: '',
}

interface BookingFormProps {
  mode: 'create' | 'edit'
  defaultValues?: Partial<BookingFormData>
  saving: boolean
  onSubmit: (data: BookingFormData) => Promise<void>
}

const BookingForm: React.FC<BookingFormProps> = ({ mode, defaultValues, saving, onSubmit }) => {
  const [form, setForm] = useState<BookingFormData>({ ...defaultForm, ...defaultValues })

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
          <label className="label">Package ID *</label>
          <input
            className="input"
            value={form.packageId}
            onChange={(e) => setForm((prev) => ({ ...prev, packageId: e.target.value }))}
            placeholder="Mongo package id"
            disabled={mode === 'edit'}
          />
        </div>

        <div>
          <label className="label">Start Date *</label>
          <input
            type="date"
            className="input"
            value={form.startDate}
            onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
            disabled={mode === 'edit'}
          />
        </div>

        <div>
          <label className="label">End Date *</label>
          <input
            type="date"
            className="input"
            value={form.endDate}
            onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))}
            disabled={mode === 'edit'}
          />
        </div>

        <div>
          <label className="label">Travellers</label>
          <input
            type="number"
            className="input"
            value={form.travellers}
            onChange={(e) => setForm((prev) => ({ ...prev, travellers: Number(e.target.value || 1) }))}
            min={1}
            disabled={mode === 'edit'}
          />
        </div>

        <div>
          <label className="label">Total Amount</label>
          <input
            type="number"
            className="input"
            value={form.totalAmount}
            onChange={(e) => setForm((prev) => ({ ...prev, totalAmount: Number(e.target.value || 0) }))}
            min={0}
          />
        </div>

        <div>
          <label className="label">Status</label>
          <select className="input" value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}>
            <option value="REQUESTED">REQUESTED</option>
            <option value="CONTACTED">CONTACTED</option>
            <option value="NEGOTIATING">NEGOTIATING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>

        <div>
          <label className="label">Payment Status</label>
          <select className="input" value={form.paymentStatus} onChange={(e) => setForm((prev) => ({ ...prev, paymentStatus: e.target.value }))}>
            <option value="UNPAID">UNPAID</option>
            <option value="PAID">PAID</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="label">Admin Note</label>
          <textarea
            className="input min-h-[90px] resize-y"
            value={form.note}
            onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
          />
        </div>
      </div>

      <div className="flex justify-end border-t border-surface-border pt-4">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving...' : mode === 'create' ? 'Create Booking' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}

export default BookingForm
