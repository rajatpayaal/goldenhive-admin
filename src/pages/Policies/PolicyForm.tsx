import React, { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, Plus, Trash, Upload } from 'lucide-react'
import { Spinner, Toggle } from '../../components/ui'

type PolicySection = {
  title: string
  description: string
  points: string
  _imageFile?: File | null
  _previewUrl?: string
}

export type PolicyFormData = {
  type: string
  title: string
  slug: string
  content: string
  footerEmail: string
  footerPhone: string
  footerAddress: string
  seoMetaTitle: string
  seoMetaDescription: string
  seoKeywords: string
  isActive: boolean
  sections: PolicySection[]
}

const defaultForm: PolicyFormData = {
  type: 'TERMS_AND_CONDITIONS',
  title: '',
  slug: '',
  content: '',
  footerEmail: '',
  footerPhone: '',
  footerAddress: '',
  seoMetaTitle: '',
  seoMetaDescription: '',
  seoKeywords: '',
  isActive: true,
  sections: [],
}

interface PolicyFormProps {
  defaultValues?: Partial<PolicyFormData>
  saving: boolean
  submitLabel?: string
  onSubmit: (payload: FormData) => Promise<void>
}

const PolicyForm: React.FC<PolicyFormProps> = ({ defaultValues, saving, submitLabel = 'Save Policy', onSubmit }) => {
  const [form, setForm] = useState<PolicyFormData>({ ...defaultForm, ...defaultValues, sections: defaultValues?.sections || [] })
  const [expandedSection, setExpandedSection] = useState<number | null>(null)

  useEffect(() => {
    setForm({ ...defaultForm, ...defaultValues, sections: defaultValues?.sections || [] })
    setExpandedSection(null)
  }, [defaultValues])

  const handleSectionAdd = () => {
    setForm((p) => ({ ...p, sections: [...p.sections, { title: '', description: '', points: '' }] }))
    setExpandedSection(form.sections.length)
  }

  const handleSectionRemove = (idx: number) => {
    setForm((p) => ({ ...p, sections: p.sections.filter((_, i) => i !== idx) }))
  }

  const handleSectionChange = (idx: number, field: keyof PolicySection, val: any) => {
    const arr = [...form.sections]
    arr[idx] = { ...arr[idx], [field]: val }
    setForm((p) => ({ ...p, sections: arr }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const fd = new FormData()
    fd.append('type', form.type)
    fd.append('title', form.title)
    fd.append('slug', form.slug)
    fd.append('content', form.content)
    fd.append('isActive', form.isActive ? 'true' : 'false')

    fd.append(
      'footer',
      JSON.stringify({
        email: form.footerEmail,
        phone: form.footerPhone,
        address: form.footerAddress,
      })
    )

    fd.append(
      'seo',
      JSON.stringify({
        metaTitle: form.seoMetaTitle,
        metaDescription: form.seoMetaDescription,
        keywords: form.seoKeywords.split(',').map((s) => s.trim()).filter(Boolean),
      })
    )

    const processedSections: any[] = []
    let currentFileIndex = 0

    form.sections.forEach((sec) => {
      const payloadSection: any = {
        title: sec.title,
        description: sec.description,
        points: sec.points.split('\n').map((s) => s.replace(/,/g, '').trim()).filter(Boolean),
      }

      if (sec._imageFile) {
        payloadSection.imageFileIndex = currentFileIndex
        fd.append('sectionImages', sec._imageFile)
        currentFileIndex += 1
      } else if (sec._previewUrl) {
        payloadSection.imageUrl = sec._previewUrl
      }

      processedSections.push(payloadSection)
    })

    fd.append('sections', JSON.stringify(processedSections))

    await onSubmit(fd)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4 rounded-xl border border-surface-border bg-surface-card p-4">
        <h3 className="mb-4 border-b border-surface-border pb-2 text-xs font-bold uppercase tracking-widest text-text-tertiary">Core Settings</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="label">Policy Format Type</label>
            <select className="input" value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>
              <option value="TERMS_AND_CONDITIONS">Terms and Conditions</option>
              <option value="PRIVACY_POLICY">Privacy Policy</option>
              <option value="CORPORATE_TOURS_POLICY">Corporate Tours Policy</option>
              <option value="FRAUD_AWARENESS">Fraud Awareness</option>
              <option value="CANCELLATION_POLICY">Cancellation Policy</option>
              <option value="REFUND_POLICY">Refund Policy</option>
            </select>
          </div>
          <div>
            <label className="label">Custom URL Slug</label>
            <input className="input" value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} placeholder="refund-rules" />
          </div>
          <div className="md:col-span-2">
            <label className="label">Main Page Title</label>
            <input className="input" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
          </div>
          <div className="md:col-span-2">
            <label className="label">Top-Level Content</label>
            <textarea className="input min-h-[100px] resize-y" value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))} />
          </div>
        </div>
        <label className="mt-4 flex w-fit cursor-pointer items-center gap-3">
          <Toggle checked={form.isActive} onChange={(v) => setForm((p) => ({ ...p, isActive: v }))} />
          <span className="text-sm font-medium text-text-secondary">Policy is Active</span>
        </label>
      </div>

      <div className="space-y-4 rounded-xl border border-surface-border bg-surface-card p-4">
        <div className="mb-4 flex items-center justify-between border-b border-surface-border pb-2">
          <h3 className="text-xs font-bold uppercase tracking-widest text-text-tertiary">Dynamic Sections Arrays</h3>
          <button type="button" className="btn-secondary btn-sm" onClick={handleSectionAdd}>
            <Plus className="w-3" /> Add Section Block
          </button>
        </div>

        {form.sections.length === 0 && (
          <div className="py-6 text-center text-sm italic text-text-tertiary">No sections added yet.</div>
        )}

        <div className="space-y-3">
          {form.sections.map((section, idx) => {
            const isExpanded = expandedSection === idx
            return (
              <div key={idx} className="overflow-hidden rounded-lg border border-surface-border bg-surface-card transition-all">
                <div className="flex cursor-pointer items-center justify-between p-3 hover:bg-surface-border" onClick={() => setExpandedSection(isExpanded ? null : idx)}>
                  <span className="text-sm font-semibold text-text-secondary">{section.title || `Section Block ${idx + 1}`}</span>
                  <div className="flex items-center gap-2">
                    <button type="button" className="rounded p-1 text-danger-400 transition-colors hover:bg-danger-500/20" onClick={(e) => {
                      e.stopPropagation()
                      handleSectionRemove(idx)
                    }}>
                      <Trash className="h-4 w-4" />
                    </button>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-text-tertiary" /> : <ChevronDown className="h-4 w-4 text-text-tertiary" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="grid grid-cols-1 gap-4 border-t border-surface-border p-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <label className="label">Section Headline</label>
                      <input className="input" value={section.title} onChange={(e) => handleSectionChange(idx, 'title', e.target.value)} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="label">Descriptive Body</label>
                      <textarea className="input min-h-[80px] resize-y" value={section.description} onChange={(e) => handleSectionChange(idx, 'description', e.target.value)} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="label">Array of Points (One per line)</label>
                      <textarea className="input min-h-[80px] resize-y" value={section.points} onChange={(e) => handleSectionChange(idx, 'points', e.target.value)} />
                    </div>

                    <div className="relative cursor-pointer rounded-xl border border-surface-border bg-surface-hover p-3 text-center md:col-span-2" onClick={() => document.getElementById(`sec-img-${idx}`)?.click()}>
                      {section._imageFile || section._previewUrl ? (
                        <img src={section._imageFile ? URL.createObjectURL(section._imageFile) : section._previewUrl} alt="Section attach preview" className="h-24 w-full rounded object-cover" />
                      ) : (
                        <div className="flex flex-col items-center justify-center py-4 text-text-tertiary">
                          <Upload className="mb-1 h-5 w-5 opacity-50" />
                          <span className="text-xs font-medium">Attach an image to this block</span>
                        </div>
                      )}
                      <input
                        id={`sec-img-${idx}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) handleSectionChange(idx, '_imageFile', e.target.files[0])
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-surface-border bg-surface-card p-4">
        <h3 className="mb-4 border-b border-surface-border pb-2 text-xs font-bold uppercase tracking-widest text-text-tertiary">Dedicated Contact Footer</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="label">Email Contact</label>
            <input className="input" type="email" value={form.footerEmail} onChange={(e) => setForm((p) => ({ ...p, footerEmail: e.target.value }))} />
          </div>
          <div>
            <label className="label">Phone Contact</label>
            <input className="input" value={form.footerPhone} onChange={(e) => setForm((p) => ({ ...p, footerPhone: e.target.value }))} />
          </div>
          <div>
            <label className="label">Address</label>
            <input className="input" value={form.footerAddress} onChange={(e) => setForm((p) => ({ ...p, footerAddress: e.target.value }))} />
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-surface-border bg-surface-card p-4">
        <h3 className="mb-4 border-b border-surface-border pb-2 text-xs font-bold uppercase tracking-widest text-text-tertiary">SEO Mapping</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="label">Meta Title</label>
            <input className="input" value={form.seoMetaTitle} onChange={(e) => setForm((p) => ({ ...p, seoMetaTitle: e.target.value }))} />
          </div>
          <div>
            <label className="label">Keywords (comma separated)</label>
            <input className="input" value={form.seoKeywords} onChange={(e) => setForm((p) => ({ ...p, seoKeywords: e.target.value }))} />
          </div>
          <div className="md:col-span-2">
            <label className="label">Meta Description</label>
            <textarea className="input min-h-[90px] resize-y" value={form.seoMetaDescription} onChange={(e) => setForm((p) => ({ ...p, seoMetaDescription: e.target.value }))} />
          </div>
        </div>
      </div>

      <div className="flex justify-end border-t border-surface-border pt-4">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? <Spinner size="sm" /> : submitLabel}
        </button>
      </div>
    </form>
  )
}

export default PolicyForm
