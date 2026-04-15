import React, { useEffect, useRef, useState } from 'react'
import { CarFront, Upload } from 'lucide-react'
import { Toggle } from '../../components/ui'

export type VehicleFormData = {
  name: string
  seat: number
  type: string
  sortOrder: number
  imageAlt: string
  imageTitle: string
  isActive: boolean
  imageUrl?: string
}

const defaultForm: VehicleFormData = {
  name: '',
  seat: 4,
  type: '',
  sortOrder: 1,
  imageAlt: '',
  imageTitle: '',
  isActive: true,
  imageUrl: '',
}

interface VehicleFormProps {
  defaultValues?: Partial<VehicleFormData>
  saving: boolean
  onSubmit: (data: VehicleFormData, imageFile: File | null) => Promise<void>
}

const VehicleForm: React.FC<VehicleFormProps> = ({ defaultValues, saving, onSubmit }) => {
  const [form, setForm] = useState<VehicleFormData>({ ...defaultForm, ...defaultValues })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const imageRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setForm({ ...defaultForm, ...defaultValues })
    setImageFile(null)
  }, [defaultValues])

  const previewUrl = imageFile ? URL.createObjectURL(imageFile) : (form.imageUrl || '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(form, imageFile)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="md:col-span-2">
        <label className="label">Vehicle Picture</label>
        <div
          onClick={() => imageRef.current?.click()}
          className="cursor-pointer rounded-xl border-2 border-dashed border-surface-border p-4 text-center transition-colors hover:border-brand-500/50"
        >
          {previewUrl ? (
            <img src={previewUrl} alt="Vehicle" className="mx-auto h-32 rounded-lg object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-2 py-4 text-text-tertiary">
              <CarFront className="h-6 w-6" />
              <div className="flex items-center gap-2 text-xs">
                <Upload className="h-4 w-4" />
                <span>Click to upload vehicle image</span>
              </div>
            </div>
          )}
          <input
            ref={imageRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) setImageFile(e.target.files[0])
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="label">Vehicle Name *</label>
          <input type="text" className="input" value={form.name} onChange={(e) => setForm((pf) => ({ ...pf, name: e.target.value }))} />
        </div>

        <div>
          <label className="label">Category / Type</label>
          <input type="text" className="input" value={form.type} onChange={(e) => setForm((pf) => ({ ...pf, type: e.target.value }))} />
        </div>

        <div>
          <label className="label">Seats (Occupancy) *</label>
          <input type="number" min={1} className="input" value={form.seat} onChange={(e) => setForm((pf) => ({ ...pf, seat: Number(e.target.value || 1) }))} />
        </div>

        <div>
          <label className="label">Sort Order</label>
          <input type="number" min={1} className="input" value={form.sortOrder} onChange={(e) => setForm((pf) => ({ ...pf, sortOrder: Number(e.target.value || 1) }))} />
        </div>

        <div>
          <label className="label">Image Alt Text</label>
          <input type="text" className="input" value={form.imageAlt} onChange={(e) => setForm((pf) => ({ ...pf, imageAlt: e.target.value }))} />
        </div>

        <div>
          <label className="label">Image Title Text</label>
          <input type="text" className="input" value={form.imageTitle} onChange={(e) => setForm((pf) => ({ ...pf, imageTitle: e.target.value }))} />
        </div>
      </div>

      <div className="mt-2 border-t border-surface-border pt-2">
        <label className="flex w-fit cursor-pointer items-center gap-3">
          <Toggle checked={form.isActive} onChange={(v) => setForm((pf) => ({ ...pf, isActive: v }))} />
          <span className="text-sm font-medium">Active (Visible)</span>
        </label>
      </div>

      <div className="flex justify-end border-t border-surface-border pt-4">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save Vehicle'}
        </button>
      </div>
    </form>
  )
}

export default VehicleForm
