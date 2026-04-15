import React, { useEffect, useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { Toggle } from '../../components/ui'

export type BlogFormData = {
  title: string
  author: string
  category: string
  readTime: string
  tags: string
  content: string
  bannerImageAlt: string
  isPublished: boolean
  bannerImageUrl?: string
}

const defaultFormData: BlogFormData = {
  title: '',
  author: 'Goldenhive',
  category: 'Travel Guide',
  readTime: '5 min',
  tags: '',
  content: '',
  bannerImageAlt: '',
  isPublished: true,
  bannerImageUrl: '',
}

interface BlogFormProps {
  defaultValues?: Partial<BlogFormData>
  saving: boolean
  onSubmit: (data: BlogFormData, imageFile: File | null) => Promise<void>
}

const BlogForm: React.FC<BlogFormProps> = ({ defaultValues, saving, onSubmit }) => {
  const [form, setForm] = useState<BlogFormData>({ ...defaultFormData, ...defaultValues })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const imageRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setForm({ ...defaultFormData, ...defaultValues })
    setImageFile(null)
  }, [defaultValues])

  const previewUrl = imageFile ? URL.createObjectURL(imageFile) : (form.bannerImageUrl || '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(form, imageFile)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
            <span className="mt-1 text-xs opacity-70">Recommended: 1200x600 JPG or PNG</span>
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label">Blog Title *</label>
          <input
            className="input"
            placeholder="e.g. 5 Hidden Gems in Kerala"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          />
        </div>

        <div>
          <label className="label">Author</label>
          <input className="input" value={form.author} onChange={(e) => setForm((p) => ({ ...p, author: e.target.value }))} />
        </div>

        <div>
          <label className="label">Category</label>
          <input className="input" placeholder="e.g. Travel Guide" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} />
        </div>

        <div>
          <label className="label">Tags (comma separated)</label>
          <input className="input" placeholder="luxury, beaches, relax" value={form.tags} onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))} />
        </div>

        <div>
          <label className="label">Read Time</label>
          <input className="input" placeholder="e.g. 5 min" value={form.readTime} onChange={(e) => setForm((p) => ({ ...p, readTime: e.target.value }))} />
        </div>
      </div>

      <div>
        <label className="label">Blog Content (TextBody Section) *</label>
        <textarea
          className="input min-h-[150px] resize-y"
          placeholder="Write your blog content here..."
          value={form.content}
          onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
        />
      </div>

      <div className="mt-2 border-t border-surface-border pt-2">
        <label className="flex w-fit cursor-pointer items-center gap-3">
          <Toggle checked={form.isPublished} onChange={(v) => setForm((p) => ({ ...p, isPublished: v }))} />
          <span className="text-sm font-medium text-text-primary">Publish immediately</span>
        </label>
        <p className="ml-14 mt-1 text-xs text-text-tertiary">Drafts will not appear on the website until published.</p>
      </div>

      <div className="flex justify-end gap-3 border-t border-surface-border pt-4">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save Blog'}
        </button>
      </div>
    </form>
  )
}

export default BlogForm
