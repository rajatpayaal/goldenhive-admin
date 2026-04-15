import React, { useEffect, useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { Toggle } from '../../components/ui'

export type BannerFormData = {
  title: string
  imageUrl: string
  redirectUrl: string
  sortOrder: number
  isActive: boolean
}

const defaultFormData: BannerFormData = {
  title: '',
  imageUrl: '',
  redirectUrl: '',
  sortOrder: 1,
  isActive: true,
}

interface BannerFormProps {
  defaultValues?: Partial<BannerFormData>
  saving: boolean
  onSubmit: (data: BannerFormData, imageFile: File | null) => Promise<void>
}

const BannerForm: React.FC<BannerFormProps> = ({ defaultValues, saving, onSubmit }) => {
  const [form, setForm] = useState<BannerFormData>({ ...defaultFormData, ...defaultValues })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const imageRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setForm({ ...defaultFormData, ...defaultValues })
    setImageFile(null)
  }, [defaultValues])

  const previewUrl = imageFile ? URL.createObjectURL(imageFile) : form.imageUrl

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(form, imageFile)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Banner Title *</label>
        <input
          className="input"
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          placeholder="Homepage Hero Banner"
        />
      </div>

      <div
        className="cursor-pointer rounded-xl border border-surface-border bg-surface-hover p-4 text-center transition-colors hover:border-brand-500/50"
        onClick={() => imageRef.current?.click()}
      >
        {previewUrl ? (
          <img src={previewUrl} alt="Banner preview" className="h-40 w-full rounded-lg object-cover" />
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-text-tertiary">
            <Upload className="mb-2 h-8 w-8 opacity-50" />
            <span className="text-sm font-medium">Click to upload banner image</span>
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="label">Redirect URL</label>
          <input
            className="input"
            value={form.redirectUrl}
            onChange={(e) => setForm((p) => ({ ...p, redirectUrl: e.target.value }))}
            placeholder="/packages"
          />
        </div>

        <div>
          <label className="label">Sort Order</label>
          <input
            type="number"
            className="input"
            value={form.sortOrder}
            min={1}
            onChange={(e) => setForm((p) => ({ ...p, sortOrder: Number(e.target.value || 1) }))}
          />
        </div>
      </div>

      <label className="flex w-fit cursor-pointer items-center gap-3">
        <Toggle checked={form.isActive} onChange={(v) => setForm((p) => ({ ...p, isActive: v }))} />
        <span className="text-sm font-medium text-text-primary">Banner Active</span>
      </label>

      <div className="flex justify-end border-t border-surface-border pt-4">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save Banner'}
        </button>
      </div>
    </form>
  )
}

export default BannerForm
