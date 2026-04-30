import React, { useEffect, useRef, useState } from 'react'
import { Upload, Plus, Trash2, GripVertical, Image as ImageIcon } from 'lucide-react'
import { Toggle } from '../../components/ui'
import { listFaqs } from './service'

export type BlogSectionMedia = {
  fileIndex?: number
  url?: string
  altText: string
  isVisible: boolean
  type: string
  caption: string
  file?: File | null
}

export type BlogSection = {
  sectionId?: string
  title: string
  content: string
  type: string
  isVisible: boolean
  order: number
  media: BlogSectionMedia[]
}

export type BlogFormData = {
  title: string
  slug: string
  author: string
  category: string
  readTime: string
  tags: string
  
  bannerImageAlt: string
  bannerImageCaption: string
  bannerImageIsVisible: boolean
  bannerImageType: string
  bannerImageUrl?: string

  metaTitle: string
  metaDescription: string
  keywords: string
  ogImageUrl?: string
  youtubeUrl: string
  
  visibilityBanner: boolean
  visibilitySections: boolean
  visibilityFaq: boolean
  visibilitySeo: boolean

  isPublished: boolean
  publishedAt: string

  sections: BlogSection[]
  faqId: string[]
}

export const defaultFormData: BlogFormData = {
  title: '',
  slug: '',
  author: 'GoldenHive Team',
  category: 'Travel',
  readTime: '5 min',
  tags: '',
  
  bannerImageAlt: '',
  bannerImageCaption: '',
  bannerImageIsVisible: true,
  bannerImageType: 'image',
  bannerImageUrl: '',

  metaTitle: '',
  metaDescription: '',
  keywords: '',
  ogImageUrl: '',
  youtubeUrl: '',
  
  visibilityBanner: true,
  visibilitySections: true,
  visibilityFaq: true,
  visibilitySeo: true,

  isPublished: true,
  publishedAt: new Date().toISOString().slice(0, 16),

  sections: [],
  faqId: []
}

interface BlogFormProps {
  defaultValues?: Partial<BlogFormData>
  saving: boolean
  onSubmit: (
    data: BlogFormData, 
    bannerFile: File | null, 
    ogFile: File | null, 
    sectionFiles: { index: number; file: File }[]
  ) => Promise<void>
}

const BlogForm: React.FC<BlogFormProps> = ({ defaultValues, saving, onSubmit }) => {
  const [form, setForm] = useState<BlogFormData>({ ...defaultFormData, ...defaultValues })
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [ogFile, setOgFile] = useState<File | null>(null)
  const [faqsList, setFaqsList] = useState<any[]>([])

  const bannerRef = useRef<HTMLInputElement>(null)
  const ogRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setForm({ ...defaultFormData, ...defaultValues })
    setBannerFile(null)
    setOgFile(null)
  }, [defaultValues])

  useEffect(() => {
    listFaqs().then((res) => {
      setFaqsList(res.data?.data || res.data || [])
    }).catch(console.error)
  }, [])

  const bannerPreview = bannerFile ? URL.createObjectURL(bannerFile) : form.bannerImageUrl
  const ogPreview = ogFile ? URL.createObjectURL(ogFile) : form.ogImageUrl

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const sectionFiles: { index: number; file: File }[] = []
    let fileIndexCounter = 0

    const formToSubmit = { ...form }
    formToSubmit.sections = formToSubmit.sections.map((sec) => {
      const updatedMedia = sec.media.map((m) => {
        if (m.file) {
          sectionFiles.push({ index: fileIndexCounter, file: m.file })
          const updated = { ...m, fileIndex: fileIndexCounter }
          fileIndexCounter++
          return updated
        }
        return m
      })
      return { ...sec, media: updatedMedia }
    })

    await onSubmit(formToSubmit, bannerFile, ogFile, sectionFiles)
  }

  const updateField = (field: keyof BlogFormData, value: any) => {
    setForm((p) => ({ ...p, [field]: value }))
  }

  const addSection = () => {
    setForm((p) => ({
      ...p,
      sections: [
        ...p.sections,
        {
          sectionId: `sec_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`,
          title: '',
          content: '',
          type: 'TextBody',
          isVisible: true,
          order: p.sections.length + 1,
          media: []
        }
      ]
    }))
  }

  const updateSection = (idx: number, field: keyof BlogSection, value: any) => {
    setForm((p) => {
      const newSec = [...p.sections]
      newSec[idx] = { ...newSec[idx], [field]: value }
      return { ...p, sections: newSec }
    })
  }

  const removeSection = (idx: number) => {
    setForm((p) => {
      const newSec = [...p.sections]
      newSec.splice(idx, 1)
      return { ...p, sections: newSec.map((s, i) => ({ ...s, order: i + 1 })) }
    })
  }

  const addSectionMedia = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setForm((p) => {
      const newSec = [...p.sections]
      newSec[idx].media = [
        ...newSec[idx].media,
        {
          file,
          altText: file.name,
          caption: '',
          isVisible: true,
          type: 'image'
        }
      ]
      return { ...p, sections: newSec }
    })
  }

  const updateSectionMedia = (secIdx: number, mediaIdx: number, field: keyof BlogSectionMedia, value: any) => {
    setForm((p) => {
      const newSec = [...p.sections]
      newSec[secIdx].media[mediaIdx] = { ...newSec[secIdx].media[mediaIdx], [field]: value }
      return { ...p, sections: newSec }
    })
  }

  const removeSectionMedia = (secIdx: number, mediaIdx: number) => {
    setForm((p) => {
      const newSec = [...p.sections]
      newSec[secIdx].media.splice(mediaIdx, 1)
      return { ...p, sections: newSec }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Left Column */}
      <div className="space-y-6 lg:col-span-7 xl:col-span-8">
        
        {/* Basic Information */}
        <div className="rounded-2xl border border-surface-border bg-surface-card p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">Basic Information</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Title *</label>
              <input required className="input" value={form.title} onChange={e => updateField('title', e.target.value)} />
            </div>
            <div>
              <label className="label">Slug *</label>
              <input required className="input" value={form.slug} onChange={e => updateField('slug', e.target.value)} />
            </div>
            <div>
              <label className="label">Author *</label>
              <input required className="input" value={form.author} onChange={e => updateField('author', e.target.value)} />
            </div>
            <div>
              <label className="label">Category *</label>
              <input required className="input" value={form.category} onChange={e => updateField('category', e.target.value)} />
            </div>
            <div>
              <label className="label">Read Time</label>
              <input className="input" value={form.readTime} onChange={e => updateField('readTime', e.target.value)} />
            </div>
            <div>
              <label className="label">Tags</label>
              <input className="input" placeholder="comma separated" value={form.tags} onChange={e => updateField('tags', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="rounded-2xl border border-surface-border bg-surface-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-primary">Sections</h2>
            <button type="button" onClick={addSection} className="btn-secondary py-1.5 text-sm">
              <Plus className="mr-1 h-4 w-4" /> Add Section
            </button>
          </div>
          
          <div className="space-y-4">
            {form.sections.map((section, sIdx) => (
              <div key={sIdx} className="rounded-xl border border-surface-border bg-surface-hover/30 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-5 w-5 text-text-tertiary cursor-grab" />
                    <span className="font-medium text-text-secondary">{sIdx + 1}. {section.title || 'New Section'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Toggle checked={section.isVisible} onChange={v => updateSection(sIdx, 'isVisible', v)} />
                    <button type="button" onClick={() => removeSection(sIdx)} className="text-danger-500 hover:text-danger-600 transition">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="label">Section Title</label>
                    <input className="input" value={section.title} onChange={e => updateSection(sIdx, 'title', e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Type</label>
                    <select className="input" value={section.type} onChange={e => updateSection(sIdx, 'type', e.target.value)}>
                      <option value="Hero">Hero</option>
                      <option value="Stats">Stats</option>
                      <option value="Offerings">Offerings</option>
                      <option value="Process">Process</option>
                      <option value="Tips">Tips</option>
                      <option value="SuccessSnapshot">SuccessSnapshot</option>
                      <option value="TextBody">TextBody</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Order</label>
                    <input type="number" className="input" value={section.order} onChange={e => updateSection(sIdx, 'order', parseInt(e.target.value) || 0)} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Content</label>
                    <textarea className="input min-h-[120px]" value={section.content} onChange={e => updateSection(sIdx, 'content', e.target.value)} />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="label">Media</label>
                  <div className="flex flex-col gap-3">
                    {section.media.map((m, mIdx) => (
                      <div key={mIdx} className="flex items-start gap-3 rounded-lg border border-surface-border bg-surface-card p-3 shadow-sm">
                        {m.file ? (
                          <img src={URL.createObjectURL(m.file)} className="h-16 w-24 rounded-md object-cover" alt="" />
                        ) : m.url ? (
                          <img src={m.url} className="h-16 w-24 rounded-md object-cover" alt="" />
                        ) : (
                          <div className="flex h-16 w-24 items-center justify-center rounded-md bg-surface-hover text-text-tertiary">
                            <ImageIcon className="h-6 w-6" />
                          </div>
                        )}
                        <div className="flex-1 space-y-2">
                          <input className="input py-1 text-sm" placeholder="Alt Text" value={m.altText} onChange={e => updateSectionMedia(sIdx, mIdx, 'altText', e.target.value)} />
                          <input className="input py-1 text-sm" placeholder="Caption" value={m.caption} onChange={e => updateSectionMedia(sIdx, mIdx, 'caption', e.target.value)} />
                        </div>
                        <button type="button" onClick={() => removeSectionMedia(sIdx, mIdx)} className="text-danger-500 hover:text-danger-600 mt-1">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <div className="flex items-center gap-3">
                      <label className="btn-secondary py-1.5 text-sm cursor-pointer inline-flex items-center w-fit">
                        <Plus className="mr-1 h-4 w-4" /> Add Media
                        <input type="file" accept="image/*" className="hidden" onChange={e => addSectionMedia(sIdx, e)} />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {form.sections.length === 0 && (
              <div className="text-center py-6 text-text-tertiary text-sm">No sections added yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="space-y-6 lg:col-span-5 xl:col-span-4">
        
        {/* Banner Image */}
        <div className="rounded-2xl border border-surface-border bg-surface-card p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">Banner Image</h2>
          <div
            className="cursor-pointer rounded-xl border border-dashed border-surface-border bg-surface-hover p-2 text-center transition-colors hover:border-brand-500/50 mb-4"
            onClick={() => bannerRef.current?.click()}
          >
            {bannerPreview ? (
              <img src={bannerPreview} alt="Banner preview" className="h-40 w-full rounded-lg object-cover" />
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-text-tertiary">
                <Upload className="mb-2 h-6 w-6 opacity-50" />
                <span className="text-sm">Upload Banner</span>
              </div>
            )}
            <input
              ref={bannerRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) setBannerFile(e.target.files[0])
              }}
            />
          </div>
          <div className="space-y-3">
            <div>
              <label className="label">Alt Text</label>
              <input className="input py-1.5" value={form.bannerImageAlt} onChange={e => updateField('bannerImageAlt', e.target.value)} />
            </div>
            <div>
              <label className="label">Caption</label>
              <input className="input py-1.5" value={form.bannerImageCaption} onChange={e => updateField('bannerImageCaption', e.target.value)} />
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm font-medium text-text-secondary">Visible</span>
              <Toggle checked={form.bannerImageIsVisible} onChange={v => updateField('bannerImageIsVisible', v)} />
            </div>
          </div>
        </div>

        {/* SEO Settings */}
        <div className="rounded-2xl border border-surface-border bg-surface-card p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">SEO Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Meta Title</label>
              <input className="input" value={form.metaTitle} onChange={e => updateField('metaTitle', e.target.value)} />
            </div>
            <div>
              <label className="label">Meta Description</label>
              <textarea className="input min-h-[80px]" value={form.metaDescription} onChange={e => updateField('metaDescription', e.target.value)} />
            </div>
            <div>
              <label className="label">Keywords</label>
              <input className="input" placeholder="comma separated" value={form.keywords} onChange={e => updateField('keywords', e.target.value)} />
            </div>
            <div>
              <label className="label">YouTube URL</label>
              <input className="input" value={form.youtubeUrl} onChange={e => updateField('youtubeUrl', e.target.value)} />
            </div>
            <div>
              <label className="label">OG Image</label>
              <div className="flex items-center gap-3">
                <button type="button" className="btn-secondary py-1.5 text-sm" onClick={() => ogRef.current?.click()}>
                  Upload Image
                </button>
                {ogPreview && <img src={ogPreview} className="h-10 w-16 rounded object-cover" alt="OG" />}
                <input ref={ogRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) setOgFile(e.target.files[0]) }} />
              </div>
            </div>
          </div>
        </div>

        {/* Visibility */}
        <div className="rounded-2xl border border-surface-border bg-surface-card p-5 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-text-primary">Visibility</h2>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Banner</span>
            <Toggle checked={form.visibilityBanner} onChange={v => updateField('visibilityBanner', v)} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Sections</span>
            <Toggle checked={form.visibilitySections} onChange={v => updateField('visibilitySections', v)} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">FAQ</span>
            <Toggle checked={form.visibilityFaq} onChange={v => updateField('visibilityFaq', v)} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">SEO</span>
            <Toggle checked={form.visibilitySeo} onChange={v => updateField('visibilitySeo', v)} />
          </div>
        </div>

        {/* FAQs */}
        <div className="rounded-2xl border border-surface-border bg-surface-card p-5 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-text-primary">FAQs</h2>
          <label className="label">Selected FAQs</label>
          <div className="max-h-40 overflow-y-auto rounded-xl border border-surface-border p-2 space-y-2">
            {faqsList.map(faq => (
              <label key={faq._id} className="flex items-start gap-2 cursor-pointer p-1 hover:bg-surface-hover rounded">
                <input 
                  type="checkbox" 
                  className="mt-1"
                  checked={form.faqId.includes(faq._id)}
                  onChange={(e) => {
                    const newFaqs = e.target.checked 
                      ? [...form.faqId, faq._id]
                      : form.faqId.filter(id => id !== faq._id)
                    updateField('faqId', newFaqs)
                  }}
                />
                <span className="text-sm text-text-secondary">{faq.question}</span>
              </label>
            ))}
            {faqsList.length === 0 && <span className="text-xs text-text-tertiary">No FAQs available</span>}
          </div>
        </div>

        {/* Publishing */}
        <div className="rounded-2xl border border-surface-border bg-surface-card p-5 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-text-primary">Publishing</h2>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-secondary">Is Published</span>
            <Toggle checked={form.isPublished} onChange={v => updateField('isPublished', v)} />
          </div>
          <div>
            <label className="label">Published At</label>
            <input type="datetime-local" className="input" value={form.publishedAt} onChange={e => updateField('publishedAt', e.target.value)} />
          </div>
          
          <div className="pt-4 border-t border-surface-border">
            <button type="submit" className="btn-primary w-full" disabled={saving}>
              {saving ? 'Saving...' : 'Publish Blog'}
            </button>
          </div>
        </div>

      </div>
    </form>
  )
}

export default BlogForm
