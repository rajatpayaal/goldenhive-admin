import React, { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, Plus, Trash } from 'lucide-react'
import { Spinner, Toggle } from '../../components/ui'

type FooterColumnItem = {
  label: string
  url: string
  icon: string
  textColor: string
  isExternal: boolean
  isActive: boolean
}

type FooterColumn = {
  title: string
  isActive: boolean
  items: FooterColumnItem[]
}

type SeoLinkTab = {
  categoryId: string
  packageIds: string[]
  isActive: boolean
}

export type FooterFormData = {
  languageCode: string
  regionCode: string
  isActive: boolean
  visibility: {
    seoLinkTabs: boolean
    footerColumns: boolean
    branding: boolean
    qrCode: boolean
  }
  branding: {
    description: string
    copyrightText: string
    isActive: boolean
    _logoUrl?: string
    _logoFile?: File | null
  }
  qrCode: {
    title: string
    subtitle: string
    link: string
    isActive: boolean
    _imageUrl?: string
    _imageFile?: File | null
  }
  footerColumns: FooterColumn[]
  seoLinkTabs: SeoLinkTab[]
}

const defaultForm: FooterFormData = {
  languageCode: 'en',
  regionCode: 'GLOBAL',
  isActive: true,
  visibility: {
    seoLinkTabs: true,
    footerColumns: true,
    branding: true,
    qrCode: true,
  },
  branding: {
    description: 'Your trusted travel partner.',
    copyrightText: '© 2026 GoldenHive',
    isActive: true,
    _logoFile: null,
  },
  qrCode: {
    title: 'Download App',
    subtitle: 'Scan to install',
    link: 'https://app.link',
    isActive: true,
    _imageFile: null,
  },
  footerColumns: [],
  seoLinkTabs: [],
}

interface FooterFormProps {
  defaultValues?: Partial<FooterFormData>
  categories: any[]
  packages: any[]
  saving: boolean
  submitLabel?: string
  onSubmit: (payload: FormData) => Promise<void>
}

const FooterForm: React.FC<FooterFormProps> = ({
  defaultValues,
  categories,
  packages,
  saving,
  submitLabel = 'Save Profile',
  onSubmit,
}) => {
  const [form, setForm] = useState<FooterFormData>({ ...defaultForm, ...defaultValues, footerColumns: defaultValues?.footerColumns || [], seoLinkTabs: defaultValues?.seoLinkTabs || [] })
  const [expandedColumn, setExpandedColumn] = useState<number | null>(null)
  const [expandedTab, setExpandedTab] = useState<number | null>(null)

  useEffect(() => {
    setForm({ ...defaultForm, ...defaultValues, footerColumns: defaultValues?.footerColumns || [], seoLinkTabs: defaultValues?.seoLinkTabs || [] })
    setExpandedColumn(null)
    setExpandedTab(null)
  }, [defaultValues])

  const addColumn = () => {
    setForm((p) => ({ ...p, footerColumns: [...p.footerColumns, { title: 'New Column', isActive: true, items: [] }] }))
    setExpandedColumn(form.footerColumns.length)
  }

  const removeColumn = (idx: number) => {
    setForm((p) => ({ ...p, footerColumns: p.footerColumns.filter((_, i) => i !== idx) }))
  }

  const addColumnItem = (colIdx: number) => {
    const arr = [...form.footerColumns]
    arr[colIdx].items.push({ label: 'Link', url: '/', icon: '', textColor: '', isExternal: false, isActive: true })
    setForm((p) => ({ ...p, footerColumns: arr }))
  }

  const removeColumnItem = (colIdx: number, itemIdx: number) => {
    const arr = [...form.footerColumns]
    arr[colIdx].items = arr[colIdx].items.filter((_, i) => i !== itemIdx)
    setForm((p) => ({ ...p, footerColumns: arr }))
  }

  const updateColumnItem = (colIdx: number, itemIdx: number, field: keyof FooterColumnItem, value: any) => {
    const arr = [...form.footerColumns]
    arr[colIdx].items[itemIdx] = { ...arr[colIdx].items[itemIdx], [field]: value }
    setForm((p) => ({ ...p, footerColumns: arr }))
  }

  const addTab = () => {
    setForm((p) => ({ ...p, seoLinkTabs: [...p.seoLinkTabs, { categoryId: '', packageIds: [], isActive: true }] }))
    setExpandedTab(form.seoLinkTabs.length)
  }

  const removeTab = (idx: number) => {
    setForm((p) => ({ ...p, seoLinkTabs: p.seoLinkTabs.filter((_, i) => i !== idx) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const fd = new FormData()
    fd.append('languageCode', form.languageCode)
    fd.append('regionCode', form.regionCode)
    fd.append('isActive', String(form.isActive))
    fd.append('visibility', JSON.stringify(form.visibility))

    fd.append(
      'branding',
      JSON.stringify({
        description: form.branding.description,
        copyrightText: form.branding.copyrightText,
        isActive: form.branding.isActive,
      })
    )

    fd.append(
      'qrCode',
      JSON.stringify({
        title: form.qrCode.title,
        subtitle: form.qrCode.subtitle,
        link: form.qrCode.link,
        isActive: form.qrCode.isActive,
      })
    )

    if (form.branding._logoFile) fd.append('brandingLogoFile', form.branding._logoFile)
    if (form.qrCode._imageFile) fd.append('qrCodeImageFile', form.qrCode._imageFile)

    fd.append('footerColumns', JSON.stringify(form.footerColumns))
    fd.append('seoLinkTabs', JSON.stringify(form.seoLinkTabs))

    await onSubmit(fd)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 rounded-xl border border-surface-border bg-surface-card p-4 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="label">Language</label>
          <input className="input" value={form.languageCode} onChange={(e) => setForm((p) => ({ ...p, languageCode: e.target.value }))} />
        </div>
        <div>
          <label className="label">Region</label>
          <input className="input" value={form.regionCode} onChange={(e) => setForm((p) => ({ ...p, regionCode: e.target.value }))} />
        </div>
        <div className="col-span-2 flex items-end pb-2">
          <label className="flex cursor-pointer items-center gap-3">
            <Toggle checked={form.isActive} onChange={(v) => setForm((p) => ({ ...p, isActive: v }))} />
            <span className="text-sm font-medium text-text-secondary">Global Activation</span>
          </label>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-surface-border bg-surface-card p-4">
        <h3 className="border-b border-surface-border pb-2 text-xs font-bold text-text-tertiary">Component Visibility Toggles</h3>
        <div className="flex flex-wrap gap-6">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={form.visibility.seoLinkTabs} onChange={(e) => setForm((p) => ({ ...p, visibility: { ...p.visibility, seoLinkTabs: e.target.checked } }))} className="rounded border-surface-border bg-surface-card text-brand-500 focus:ring-brand-500" />
            SEO Links
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={form.visibility.footerColumns} onChange={(e) => setForm((p) => ({ ...p, visibility: { ...p.visibility, footerColumns: e.target.checked } }))} className="rounded border-surface-border bg-surface-card text-brand-500 focus:ring-brand-500" />
            Footer Columns
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={form.visibility.branding} onChange={(e) => setForm((p) => ({ ...p, visibility: { ...p.visibility, branding: e.target.checked } }))} className="rounded border-surface-border bg-surface-card text-brand-500 focus:ring-brand-500" />
            Branding Block
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={form.visibility.qrCode} onChange={(e) => setForm((p) => ({ ...p, visibility: { ...p.visibility, qrCode: e.target.checked } }))} className="rounded border-surface-border bg-surface-card text-brand-500 focus:ring-brand-500" />
            QR Code Block
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-3 rounded-xl border border-surface-border bg-surface-card p-4">
          <h3 className="text-xs font-bold text-brand-400">BRANDING BLOCK</h3>
          <textarea className="input h-16 text-xs" value={form.branding.description} onChange={(e) => setForm((p) => ({ ...p, branding: { ...p.branding, description: e.target.value } }))} />
          <input className="input text-xs" value={form.branding.copyrightText} onChange={(e) => setForm((p) => ({ ...p, branding: { ...p.branding, copyrightText: e.target.value } }))} />
          <div className="flex gap-2">
            {(form.branding._logoUrl || form.branding._logoFile) && (
              <img src={form.branding._logoFile ? URL.createObjectURL(form.branding._logoFile) : form.branding._logoUrl} alt="Logo" className="h-8 w-8 shrink-0 rounded border border-surface-border object-cover" />
            )}
            <input type="file" className="input p-1.5 text-xs" onChange={(e) => setForm((p) => ({ ...p, branding: { ...p.branding, _logoFile: e.target.files?.[0] || null } }))} />
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-surface-border bg-surface-card p-4">
          <h3 className="text-xs font-bold text-indigo-400">QR CODE BLOCK</h3>
          <input className="input text-xs" value={form.qrCode.title} onChange={(e) => setForm((p) => ({ ...p, qrCode: { ...p.qrCode, title: e.target.value } }))} />
          <input className="input text-xs" value={form.qrCode.link} onChange={(e) => setForm((p) => ({ ...p, qrCode: { ...p.qrCode, link: e.target.value } }))} />
          <div className="flex gap-2">
            {(form.qrCode._imageUrl || form.qrCode._imageFile) && (
              <img src={form.qrCode._imageFile ? URL.createObjectURL(form.qrCode._imageFile) : form.qrCode._imageUrl} alt="QR" className="h-8 w-8 shrink-0 rounded border border-surface-border object-cover" />
            )}
            <input type="file" className="input p-1.5 text-xs" onChange={(e) => setForm((p) => ({ ...p, qrCode: { ...p.qrCode, _imageFile: e.target.files?.[0] || null } }))} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-end justify-between border-b border-surface-border pb-2">
          <div>
            <h3 className="text-sm font-bold text-text-primary">Footer Link Columns</h3>
            <p className="text-xs text-text-tertiary">Manage columns like Company, Policies, Links</p>
          </div>
          <button type="button" className="btn-secondary btn-sm" onClick={addColumn}><Plus className="w-3" /> Add Column</button>
        </div>

        <div className="space-y-3">
          {form.footerColumns.map((col, cIdx) => {
            const isExpanded = expandedColumn === cIdx
            return (
              <div key={cIdx} className="overflow-hidden rounded-lg border border-surface-border bg-surface-card">
                <div className="flex cursor-pointer items-center justify-between p-3 hover:bg-surface-border" onClick={() => setExpandedColumn(isExpanded ? null : cIdx)}>
                  <span className="text-sm font-semibold text-text-secondary">{col.title || `Column ${cIdx + 1}`}</span>
                  <div className="flex items-center gap-2">
                    <button type="button" className="rounded p-1 text-danger-400 hover:bg-danger-500/20" onClick={(e) => { e.stopPropagation(); removeColumn(cIdx) }}><Trash className="h-4 w-4" /></button>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-text-tertiary" /> : <ChevronDown className="h-4 w-4 text-text-tertiary" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="space-y-3 border-t border-surface-border p-4">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <input className="input" value={col.title} onChange={(e) => {
                        const arr = [...form.footerColumns]
                        arr[cIdx] = { ...arr[cIdx], title: e.target.value }
                        setForm((p) => ({ ...p, footerColumns: arr }))
                      }} placeholder="Column Title" />
                      <label className="flex items-center gap-3">
                        <Toggle checked={col.isActive} onChange={(v) => {
                          const arr = [...form.footerColumns]
                          arr[cIdx] = { ...arr[cIdx], isActive: v }
                          setForm((p) => ({ ...p, footerColumns: arr }))
                        }} />
                        <span className="text-sm text-text-secondary">Column Active</span>
                      </label>
                    </div>

                    <div className="flex justify-end">
                      <button type="button" className="btn-secondary btn-sm" onClick={() => addColumnItem(cIdx)}><Plus className="w-3" /> Add Link</button>
                    </div>

                    <div className="space-y-2">
                      {col.items.map((item, iIdx) => (
                        <div key={iIdx} className="grid grid-cols-1 gap-2 rounded border border-surface-border bg-surface-hover p-2 md:grid-cols-6">
                          <input className="input md:col-span-2" placeholder="Label" value={item.label} onChange={(e) => updateColumnItem(cIdx, iIdx, 'label', e.target.value)} />
                          <input className="input md:col-span-2" placeholder="URL" value={item.url} onChange={(e) => updateColumnItem(cIdx, iIdx, 'url', e.target.value)} />
                          <input className="input" placeholder="Icon" value={item.icon} onChange={(e) => updateColumnItem(cIdx, iIdx, 'icon', e.target.value)} />
                          <div className="flex items-center justify-between gap-2">
                            <label className="flex items-center gap-1 text-xs">
                              <input type="checkbox" checked={item.isExternal} onChange={(e) => updateColumnItem(cIdx, iIdx, 'isExternal', e.target.checked)} />
                              External
                            </label>
                            <button type="button" className="text-danger-500" onClick={() => removeColumnItem(cIdx, iIdx)}>
                              <Trash className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-end justify-between border-b border-surface-border pb-2">
          <div>
            <h3 className="text-sm font-bold text-text-primary">SEO Link Tabs</h3>
            <p className="text-xs text-text-tertiary">Map categories to packages</p>
          </div>
          <button type="button" className="btn-secondary btn-sm" onClick={addTab}><Plus className="w-3" /> Add Tab</button>
        </div>

        <div className="space-y-3">
          {form.seoLinkTabs.map((tab, tIdx) => {
            const isExpanded = expandedTab === tIdx
            return (
              <div key={tIdx} className="overflow-hidden rounded-lg border border-surface-border bg-surface-card">
                <div className="flex cursor-pointer items-center justify-between p-3 hover:bg-surface-border" onClick={() => setExpandedTab(isExpanded ? null : tIdx)}>
                  <span className="text-sm font-semibold text-text-secondary">SEO Tab {tIdx + 1}</span>
                  <div className="flex items-center gap-2">
                    <button type="button" className="rounded p-1 text-danger-400 hover:bg-danger-500/20" onClick={(e) => { e.stopPropagation(); removeTab(tIdx) }}><Trash className="h-4 w-4" /></button>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-text-tertiary" /> : <ChevronDown className="h-4 w-4 text-text-tertiary" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="space-y-3 border-t border-surface-border p-4">
                    <div>
                      <label className="label">Category</label>
                      <select
                        className="input"
                        value={tab.categoryId}
                        onChange={(e) => {
                          const arr = [...form.seoLinkTabs]
                          arr[tIdx] = { ...arr[tIdx], categoryId: e.target.value }
                          setForm((p) => ({ ...p, seoLinkTabs: arr }))
                        }}
                      >
                        <option value="">Select category</option>
                        {categories.map((c: any) => (
                          <option key={c._id} value={c._id}>{c.name || c.title || c._id}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="label">Packages</label>
                      <select
                        multiple
                        className="input min-h-[120px]"
                        value={tab.packageIds}
                        onChange={(e) => {
                          const values = Array.from(e.target.selectedOptions).map((opt) => opt.value)
                          const arr = [...form.seoLinkTabs]
                          arr[tIdx] = { ...arr[tIdx], packageIds: values }
                          setForm((p) => ({ ...p, seoLinkTabs: arr }))
                        }}
                      >
                        {packages.map((p: any) => (
                          <option key={p._id} value={p._id}>{p.basic?.name || p.name || p._id}</option>
                        ))}
                      </select>
                    </div>

                    <label className="flex items-center gap-3">
                      <Toggle checked={tab.isActive} onChange={(v) => {
                        const arr = [...form.seoLinkTabs]
                        arr[tIdx] = { ...arr[tIdx], isActive: v }
                        setForm((p) => ({ ...p, seoLinkTabs: arr }))
                      }} />
                      <span className="text-sm text-text-secondary">Tab Active</span>
                    </label>
                  </div>
                )}
              </div>
            )
          })}
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

export default FooterForm
