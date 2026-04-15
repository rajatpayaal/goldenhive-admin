import React, { useEffect, useState, useRef } from 'react'
import { format } from 'date-fns'
import { Pencil, Plus, Trash2, Upload, Trash, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'
import DataTable from '../components/ui/DataTable'
import Modal from '../components/ui/Modal'
import { ConfirmDialog, PageHeader, Toggle, Spinner } from '../components/ui'
import { createPolicy, deletePolicy, listPolicies, updatePolicy } from '../services/adminPanel.service'

type PolicySection = {
  title: string
  description: string
  points: string
  imageFileIndex?: number
  _imageFile?: File | null
  _previewUrl?: string
}

type PolicyForm = {
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

const defaultForm: PolicyForm = {
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

const PoliciesPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState<PolicyForm>(defaultForm)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [expandedSection, setExpandedSection] = useState<number | null>(null)

  const load = () => {
    setLoading(true)
    listPolicies()
      .then((response) => {
        const payload = response.data?.data || response.data
        setItems(payload?.items || payload || [])
      })
      .catch(() => toast.error('Failed to load policies'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(defaultForm)
    setExpandedSection(null)
    setModalOpen(true)
  }

  const openEdit = (item: any) => {
    setEditing(item)
    setForm({
      type: item.type || 'TERMS_AND_CONDITIONS',
      title: item.title || '',
      slug: item.slug || '',
      content: item.content || '',
      footerEmail: item.footer?.email || '',
      footerPhone: item.footer?.phone || '',
      footerAddress: item.footer?.address || '',
      seoMetaTitle: item.seo?.metaTitle || '',
      seoMetaDescription: item.seo?.metaDescription || '',
      seoKeywords: item.seo?.keywords?.join(', ') || '',
      isActive: Boolean(item.isActive ?? true),
      sections: (item.sections || []).map((sec: any) => ({
        title: sec.title || '',
        description: sec.description || '',
        points: sec.points?.join(',\n') || '',
        _previewUrl: sec.imageUrl || '',
      }))
    })
    setExpandedSection(null)
    setModalOpen(true)
  }

  const save = async () => {
    if (!form.title || !form.type) {
      toast.error('Type and title are required')
      return
    }

    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('type', form.type)
      fd.append('title', form.title)
      fd.append('slug', form.slug)
      fd.append('content', form.content)
      fd.append('isActive', form.isActive ? 'true' : 'false')

      fd.append('footer', JSON.stringify({
        email: form.footerEmail,
        phone: form.footerPhone,
        address: form.footerAddress
      }))

      fd.append('seo', JSON.stringify({
        metaTitle: form.seoMetaTitle,
        metaDescription: form.seoMetaDescription,
        keywords: form.seoKeywords.split(',').map(s => s.trim()).filter(Boolean)
      }))

      // Process sections
      const processedSections: any[] = []
      let currentFileIndex = 0

      form.sections.forEach((sec) => {
        const payloadSection: any = {
          title: sec.title,
          description: sec.description,
          points: sec.points.split('\n').map(s => s.replace(/,/g, '').trim()).filter(Boolean),
        }

        if (sec._imageFile) {
          payloadSection.imageFileIndex = currentFileIndex
          fd.append('sectionImages', sec._imageFile)
          currentFileIndex++
        } else if (sec._previewUrl) {
          payloadSection.imageUrl = sec._previewUrl
        }

        processedSections.push(payloadSection)
      })

      fd.append('sections', JSON.stringify(processedSections))

      if (editing?._id) {
        await updatePolicy(editing._id, fd)
        toast.success('Policy updated')
      } else {
        await createPolicy(fd)
        toast.success('Policy created')
      }
      setModalOpen(false)
      load()
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Failed to save policy')
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deletePolicy(deleteId)
      toast.success('Policy deleted')
      setDeleteId(null)
      load()
    } catch {
      toast.error('Failed to delete policy')
    } finally {
      setDeleting(false)
    }
  }

  const handleSectionAdd = () => {
    setForm(p => ({
      ...p,
      sections: [...p.sections, { title: '', description: '', points: '' }]
    }))
    setExpandedSection(form.sections.length)
  }

  const handleSectionRemove = (idx: number) => {
    setForm(p => ({
      ...p,
      sections: p.sections.filter((_, i) => i !== idx)
    }))
  }

  const handleSectionChange = (idx: number, field: keyof PolicySection, val: any) => {
    const arr = [...form.sections]
    arr[idx] = { ...arr[idx], [field]: val }
    setForm(p => ({ ...p, sections: arr }))
  }

  const columns = [
    {
      header: 'Policy',
      render: (row: any) => (
        <div>
          <p className="font-semibold text-slate-100">{row.title || 'Untitled'}</p>
          <div className="flex gap-2 items-center mt-1">
            <span className="text-[10px] bg-brand-500/20 text-brand-400 px-1.5 py-0.5 rounded">{row.type}</span>
            <span className="text-xs text-slate-500">/{row.slug}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Sections',
      render: (row: any) => <span className="text-sm font-medium text-slate-300">{row.sections?.length || 0}</span>
    },
    {
      header: 'Status',
      render: (row: any) => (
        <span className={`px-2 py-1 text-[10px] tracking-wider uppercase font-bold rounded-md ${!row.isActive ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-400'}`}>
          {!row.isActive ? 'INACTIVE' : 'ACTIVE'}
        </span>
      ),
    },
    {
      header: 'Updated',
      render: (row: any) => <span className="text-xs text-slate-400">{row.updatedAt ? format(new Date(row.updatedAt), 'dd MMM yyyy') : '—'}</span>,
    },
    {
      header: 'Actions',
      render: (row: any) => (
        <div className="flex items-center gap-2">
          <button className="btn-secondary btn-sm" onClick={() => openEdit(row)}>
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button className="btn-danger btn-sm" onClick={() => setDeleteId(row._id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="page">
      <PageHeader
        title="Policies CMS"
        subtitle="Full dynamic control over policy formatting, contact footers, and SEO arrays."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Policies' }]}
        action={
          <button className="btn-primary" onClick={openCreate}>
            <Plus className="h-4 w-4" /> New Policy
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        keyExtractor={(row: any) => row._id}
        emptyMessage="No policies configured"
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Policy Data' : 'Build Policy Document'}
        size="3xl"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={save} disabled={saving}>
               {saving ? <Spinner size="sm" /> : 'Save Policy'}
            </button>
          </>
        }
      >
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">

          <div className="border border-white/10 rounded-xl p-4 bg-slate-900/50 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-white/5 pb-2 mb-4">Core Settings</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="label">Policy Format Type (Backend Enum)</label>
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
                <label className="label">Custom URL Slug (Leave blank to auto-generate)</label>
                <input className="input" value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} placeholder="e.g. refund-rules" />
              </div>
              <div className="md:col-span-2">
                <label className="label">Main Page Title</label>
                <input className="input" value={form.title} placeholder="e.g. User Terms of Operation" onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
              </div>
              <div className="md:col-span-2">
                <label className="label">Top-Level Content (Markdown)</label>
                <textarea className="input resize-y min-h-[100px]" placeholder="Global text that appears above sections..." value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))} />
              </div>
            </div>
            
            <label className="flex items-center gap-3 cursor-pointer w-fit mt-4">
              <Toggle checked={form.isActive} onChange={(v) => setForm(pf => ({ ...pf, isActive: v }))} />
              <span className="text-sm font-medium text-slate-200">Policy is Active</span>
            </label>
          </div>

          <div className="border border-white/10 rounded-xl p-4 bg-slate-900/50 space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Dynamic Sections Arrays</h3>
              <button className="btn-secondary btn-sm" onClick={handleSectionAdd}>
                <Plus className="w-3" /> Add Section Block
              </button>
            </div>
            
            {form.sections.length === 0 && (
              <div className="text-center py-6 text-slate-500 text-sm italic">
                No sections added. Click 'Add Section Block' to create nested content.
              </div>
            )}

            <div className="space-y-3">
              {form.sections.map((section, idx) => {
                const isExpanded = expandedSection === idx
                return (
                  <div key={idx} className="border border-white/5 bg-black/40 rounded-lg overflow-hidden transition-all">
                    <div 
                      className="p-3 flex justify-between items-center cursor-pointer hover:bg-white/5"
                      onClick={() => setExpandedSection(isExpanded ? null : idx)}
                    >
                      <span className="font-semibold text-sm text-slate-200">
                        {section.title || `Section Block ${idx + 1}`}
                      </span>
                      <div className="flex items-center gap-2">
                        <button 
                          className="p-1 hover:bg-red-500/20 text-red-400 rounded transition-colors"
                          onClick={(e) => { e.stopPropagation(); handleSectionRemove(idx); }}
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div className="p-4 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="label">Section Headline</label>
                          <input className="input" value={section.title} onChange={e => handleSectionChange(idx, 'title', e.target.value)} />
                        </div>
                        <div className="md:col-span-2">
                          <label className="label">Descriptive Body</label>
                          <textarea className="input resize-y min-h-[80px]" value={section.description} onChange={e => handleSectionChange(idx, 'description', e.target.value)} />
                        </div>
                        <div className="md:col-span-2">
                          <label className="label">Array of Points (One per line)</label>
                          <textarea className="input resize-y min-h-[80px]" placeholder="Sub-point 1\nSub-point 2" value={section.points} onChange={e => handleSectionChange(idx, 'points', e.target.value)} />
                        </div>
                        
                        <div className="md:col-span-2 border border-white/10 rounded-xl p-3 bg-black/20 text-center cursor-pointer relative"
                             onClick={() => document.getElementById(`sec-img-${idx}`)?.click()}
                        >
                          {section._imageFile || section._previewUrl ? (
                            <img 
                              src={section._imageFile ? URL.createObjectURL(section._imageFile) : section._previewUrl!} 
                              alt="Section attach preview" 
                              className="w-full h-24 object-cover rounded flex-shrink-0"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center py-4 text-slate-400">
                              <Upload className="w-5 h-5 mb-1 opacity-50" />
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

          <div className="border border-white/10 rounded-xl p-4 bg-slate-900/50 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-white/5 pb-2 mb-4">Dedicated Contact Footer</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="label">Email Contact</label>
                <input className="input" type="email" value={form.footerEmail} onChange={(e) => setForm((p) => ({ ...p, footerEmail: e.target.value }))} placeholder="support@goldenhive.com" />
              </div>
              <div>
                <label className="label">Phone Contact</label>
                <input className="input" value={form.footerPhone} onChange={(e) => setForm((p) => ({ ...p, footerPhone: e.target.value }))} placeholder="+1 800 123 4567" />
              </div>
              <div>
                <label className="label">Registered Address</label>
                <input className="input" value={form.footerAddress} onChange={(e) => setForm((p) => ({ ...p, footerAddress: e.target.value }))} placeholder="123 Corporate Way..." />
              </div>
            </div>
          </div>

          <div className="border border-white/10 rounded-xl p-4 bg-slate-900/50 space-y-4">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-white/5 pb-2 mb-4">Search Engine Metadata Array</h3>
             <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="label">Meta Title Override</label>
                  <input className="input" value={form.seoMetaTitle} onChange={(e) => setForm((p) => ({ ...p, seoMetaTitle: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Keywords (Comma split)</label>
                  <input className="input" value={form.seoKeywords} placeholder="terms, privacy, legal" onChange={(e) => setForm((p) => ({ ...p, seoKeywords: e.target.value }))} />
                </div>
                <div className="md:col-span-2">
                  <label className="label">Meta Description Text</label>
                  <textarea className="input" rows={2} value={form.seoMetaDescription} onChange={(e) => setForm((p) => ({ ...p, seoMetaDescription: e.target.value }))} />
                </div>
             </div>
          </div>

        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteId)}
        onCancel={() => setDeleteId(null)}
        onConfirm={remove}
        title="Delete Document Data"
        message="This structured document will be permanently removed."
        confirmLabel="Destroy Record"
        loading={deleting}
      />
    </div>
  )
}

export default PoliciesPage
