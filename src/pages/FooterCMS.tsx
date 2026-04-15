import React, { useEffect, useState, useRef } from 'react'
import { format } from 'date-fns'
import { Pencil, Plus, Trash2, Upload, Trash, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'
import DataTable from '../components/ui/DataTable'
import Modal from '../components/ui/Modal'
import { ConfirmDialog, PageHeader, Toggle, Spinner } from '../components/ui'
import { createFooter, deleteFooter, listFooters, updateFooter } from '../services/adminPanel.service'
import { fetchCategories as listCategories, fetchPackages as listPackages } from '../services/api.service'
import api from '../services/apiService'
import { API_ENDPOINTS } from '../services/api.endpoints'

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

type FooterForm = {
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

const defaultForm: FooterForm = {
  languageCode: 'en',
  regionCode: 'GLOBAL',
  isActive: true,
  visibility: {
    seoLinkTabs: true,
    footerColumns: true,
    branding: true,
    qrCode: true
  },
  branding: {
    description: 'Your trusted travel partner.',
    copyrightText: '© 2026 GoldenHive',
    isActive: true,
    _logoFile: null
  },
  qrCode: {
    title: 'Download App',
    subtitle: 'Scan to install',
    link: 'https://app.link',
    isActive: true,
    _imageFile: null
  },
  footerColumns: [],
  seoLinkTabs: []
}

const FooterCMSPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState<FooterForm>(defaultForm)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [expandedColumn, setExpandedColumn] = useState<number | null>(null)
  const [expandedTab, setExpandedTab] = useState<number | null>(null)
  
  const [categories, setCategories] = useState<any[]>([])
  const [packages, setPackages] = useState<any[]>([])

  const loadData = async () => {
    try {
      const [catRes, pkgRes] = await Promise.all([
        api.get(API_ENDPOINTS.categories.root, { params: { limit: 100 } }),
        listPackages({ limit: 500 })
      ])
      
      const catData = catRes.data?.data || catRes.data
      const pkgData = pkgRes.data?.data || pkgRes.data
      
      setCategories(catData?.items || catData || [])
      setPackages(pkgData?.items || pkgData || [])
    } catch {
      toast.error('Failed to load categories/packages')
    }
  }

  const load = () => {
    setLoading(true)
    listFooters()
      .then((response) => {
        const payload = response.data?.data || response.data
        setItems(payload?.items || payload || [])
      })
      .catch(() => toast.error('Failed to load footer records'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    loadData()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(defaultForm)
    setExpandedColumn(null)
    setExpandedTab(null)
    setModalOpen(true)
  }

  const openEdit = (item: any) => {
    setEditing(item)
    setForm({
      languageCode: item.languageCode || 'en',
      regionCode: item.regionCode || 'GLOBAL',
      isActive: Boolean(item.isActive ?? true),
      visibility: {
        seoLinkTabs: Boolean(item.visibility?.seoLinkTabs ?? true),
        footerColumns: Boolean(item.visibility?.footerColumns ?? true),
        branding: Boolean(item.visibility?.branding ?? true),
        qrCode: Boolean(item.visibility?.qrCode ?? true),
      },
      branding: {
        description: item.branding?.description || item.brandingText || '', // migrate old text if any
        copyrightText: item.branding?.copyrightText || '',
        isActive: Boolean(item.branding?.isActive ?? true),
        _logoUrl: item.branding?.logoUrl || '',
        _logoFile: null
      },
      qrCode: {
        title: item.qrCode?.title || '',
        subtitle: item.qrCode?.subtitle || '',
        link: item.qrCode?.link || '',
        isActive: Boolean(item.qrCode?.isActive ?? true),
        _imageUrl: item.qrCode?.imageUrl || '',
        _imageFile: null
      },
      footerColumns: (item.footerColumns || []).map((col: any) => ({
        title: col.title || '',
        isActive: Boolean(col.isActive ?? true),
        items: (col.items || []).map((itm: any) => ({
          label: itm.label || '',
          url: itm.url || itm.slug || '',
          icon: itm.icon || '',
          textColor: itm.textColor || '',
          isExternal: Boolean(itm.isExternal ?? false),
          isActive: Boolean(itm.isActive ?? true)
        }))
      })),
      seoLinkTabs: (item.seoLinkTabs || []).map((tab: any) => ({
        categoryId: tab.categoryId?._id || tab.categoryId || '',
        packageIds: (tab.packageIds || []).map((p: any) => p?._id || p),
        isActive: Boolean(tab.isActive ?? true)
      }))
    })
    setExpandedColumn(null)
    setExpandedTab(null)
    setModalOpen(true)
  }

  const save = async () => {
    if (!form.languageCode || !form.regionCode) {
      toast.error('Language and region are required')
      return
    }

    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('languageCode', form.languageCode)
      fd.append('regionCode', form.regionCode)
      fd.append('isActive', String(form.isActive))
      fd.append('visibility', JSON.stringify(form.visibility))
      
      fd.append('branding', JSON.stringify({
        description: form.branding.description,
        copyrightText: form.branding.copyrightText,
        isActive: form.branding.isActive
      }))

      fd.append('qrCode', JSON.stringify({
        title: form.qrCode.title,
        subtitle: form.qrCode.subtitle,
        link: form.qrCode.link,
        isActive: form.qrCode.isActive
      }))

      if (form.branding._logoFile) fd.append('brandingLogoFile', form.branding._logoFile)
      if (form.qrCode._imageFile) fd.append('qrCodeImageFile', form.qrCode._imageFile)

      fd.append('footerColumns', JSON.stringify(form.footerColumns))
      fd.append('seoLinkTabs', JSON.stringify(form.seoLinkTabs))

      if (editing?._id) {
        await updateFooter(editing._id, fd as any)
        toast.success('Footer updated')
      } else {
        await createFooter(fd as any)
        toast.success('Footer created')
      }

      setModalOpen(false)
      load()
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Failed to save footer')
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteFooter(deleteId)
      toast.success('Footer deleted')
      setDeleteId(null)
      load()
    } catch {
      toast.error('Failed to delete footer')
    } finally {
      setDeleting(false)
    }
  }

  const addColumn = () => {
    setForm(p => ({
      ...p,
      footerColumns: [...p.footerColumns, { title: 'New Column', isActive: true, items: [] }]
    }))
    setExpandedColumn(form.footerColumns.length)
  }

  const removeColumn = (idx: number) => {
    setForm(p => ({
      ...p,
      footerColumns: p.footerColumns.filter((_, i) => i !== idx)
    }))
  }

  const addColumnItem = (colIdx: number) => {
    const arr = [...form.footerColumns]
    arr[colIdx].items.push({ label: 'Link', url: '/', icon: '', textColor: '', isExternal: false, isActive: true })
    setForm(p => ({ ...p, footerColumns: arr }))
  }

  const removeColumnItem = (colIdx: number, itemIdx: number) => {
    const arr = [...form.footerColumns]
    arr[colIdx].items = arr[colIdx].items.filter((_, i) => i !== itemIdx)
    setForm(p => ({ ...p, footerColumns: arr }))
  }

  const updateColumnItem = (colIdx: number, itemIdx: number, field: keyof FooterColumnItem, value: any) => {
    const arr = [...form.footerColumns]
    arr[colIdx].items[itemIdx] = { ...arr[colIdx].items[itemIdx], [field]: value }
    setForm({ ...form, footerColumns: arr })
  }

  const addTab = () => {
    setForm(p => ({ ...p, seoLinkTabs: [...p.seoLinkTabs, { categoryId: '', packageIds: [], isActive: true }] }))
    setExpandedTab(form.seoLinkTabs.length)
  }

  const removeTab = (idx: number) => {
    setForm(p => ({ ...p, seoLinkTabs: p.seoLinkTabs.filter((_, i) => i !== idx) }))
  }

  const columns = [
    {
      header: 'Locale Configuration',
      render: (row: any) => (
        <div>
          <p className="font-semibold text-slate-100 flex items-center gap-2">
             <span className="uppercase text-brand-400 font-bold tracking-widest">{row.languageCode}</span>
             <span className="text-slate-500">/</span>
             <span className="uppercase">{row.regionCode}</span>
          </p>
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{row.branding?.description || 'No branding description'}</p>
        </div>
      ),
    },
    {
       header: 'Link Data',
       render: (row: any) => (
         <div className="flex flex-col gap-1 text-xs text-slate-300">
           <span>{row.footerColumns?.length || 0} Columns</span>
           <span>{row.seoLinkTabs?.length || 0} SEO Tabs</span>
         </div>
       )
    },
    {
      header: 'Status',
      render: (row: any) => (
        <span className={`badge ${row.isActive === false ? 'badge-warning' : 'badge-success'}`}>
          {row.isActive === false ? 'INACTIVE' : 'ACTIVE'}
        </span>
      ),
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
        title="Footer Configuration"
        subtitle="Manage deeply nested footer arrays and locale settings"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Footer CMS' }]}
        action={
          <button className="btn-primary" onClick={openCreate}>
            <Plus className="h-4 w-4" /> New Footer Profile
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        keyExtractor={(row: any) => row._id}
        emptyMessage="No footer profiles found"
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Configuration' : 'New Configuration'}
        size="3xl"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={save} disabled={saving}>{saving ? <Spinner size="sm" /> : 'Save Profile'}</button>
          </>
        }
      >
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 border border-white/10 bg-slate-900/50 rounded-xl">
             <div>
               <label className="label">Language (e.g. en)</label>
               <input className="input" value={form.languageCode} onChange={(e) => setForm(p => ({ ...p, languageCode: e.target.value }))} />
             </div>
             <div>
               <label className="label">Region (e.g. GLOBAL)</label>
               <input className="input" value={form.regionCode} onChange={(e) => setForm(p => ({ ...p, regionCode: e.target.value }))} />
             </div>
             <div className="col-span-2 flex items-end pb-2">
               <label className="flex items-center gap-3 cursor-pointer">
                 <Toggle checked={form.isActive} onChange={(v) => setForm(p => ({ ...p, isActive: v }))} />
                 <span className="text-sm font-medium text-slate-200">Global Activation</span>
               </label>
             </div>
          </div>

          <div className="p-4 border border-white/10 bg-black/30 rounded-xl space-y-4">
            <h3 className="text-xs font-bold text-slate-400 border-b border-white/10 pb-2">Component Visibility Toggles</h3>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" checked={form.visibility.seoLinkTabs} onChange={e => setForm(p => ({ ...p, visibility: { ...p.visibility, seoLinkTabs: e.target.checked } }))} className="rounded bg-black border-white/20 text-brand-500 focus:ring-brand-500" />
                SEO Links
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" checked={form.visibility.footerColumns} onChange={e => setForm(p => ({ ...p, visibility: { ...p.visibility, footerColumns: e.target.checked } }))} className="rounded bg-black border-white/20 text-brand-500 focus:ring-brand-500" />
                Footer Columns
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" checked={form.visibility.branding} onChange={e => setForm(p => ({ ...p, visibility: { ...p.visibility, branding: e.target.checked } }))} className="rounded bg-black border-white/20 text-brand-500 focus:ring-brand-500" />
                Branding Block
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" checked={form.visibility.qrCode} onChange={e => setForm(p => ({ ...p, visibility: { ...p.visibility, qrCode: e.target.checked } }))} className="rounded bg-black border-white/20 text-brand-500 focus:ring-brand-500" />
                QR Code Block
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="p-4 border border-white/10 bg-slate-900/50 rounded-xl space-y-3">
                <h3 className="text-xs font-bold text-brand-400">BRANDING BLOCK</h3>
                <textarea className="input text-xs h-16" placeholder="Your trusted partner..." value={form.branding.description} onChange={e => setForm(p => ({ ...p, branding: { ...p.branding, description: e.target.value } }))} />
                <input className="input text-xs" placeholder="© 2026 Goldenhive" value={form.branding.copyrightText} onChange={e => setForm(p => ({ ...p, branding: { ...p.branding, copyrightText: e.target.value } }))} />
                <div className="flex gap-2">
                  {(form.branding._logoUrl || form.branding._logoFile) && (
                    <img src={form.branding._logoFile ? URL.createObjectURL(form.branding._logoFile) : form.branding._logoUrl} alt="Logo" className="w-8 h-8 rounded shrink-0 object-cover border border-white/20" />
                  )}
                  <input type="file" className="input text-xs p-1.5" title="Change Logo" onChange={e => {
                     setForm(p => ({ ...p, branding: { ...p.branding, _logoFile: e.target.files?.[0] || null } }))
                  }} />
                </div>
             </div>

             <div className="p-4 border border-white/10 bg-slate-900/50 rounded-xl space-y-3">
                <h3 className="text-xs font-bold text-indigo-400">QR CODE BLOCK</h3>
                <input className="input text-xs" placeholder="Download App" value={form.qrCode.title} onChange={e => setForm(p => ({ ...p, qrCode: { ...p.qrCode, title: e.target.value } }))} />
                <input className="input text-xs" placeholder="https://..." value={form.qrCode.link} onChange={e => setForm(p => ({ ...p, qrCode: { ...p.qrCode, link: e.target.value } }))} />
                <div className="flex gap-2">
                  {(form.qrCode._imageUrl || form.qrCode._imageFile) && (
                    <img src={form.qrCode._imageFile ? URL.createObjectURL(form.qrCode._imageFile) : form.qrCode._imageUrl} alt="QR" className="w-8 h-8 rounded shrink-0 object-cover border border-white/20 bg-white" />
                  )}
                  <input type="file" className="input text-xs p-1.5" title="Change QR" onChange={e => {
                     setForm(p => ({ ...p, qrCode: { ...p.qrCode, _imageFile: e.target.files?.[0] || null } }))
                  }} />
                </div>
             </div>
          </div>

          <div className="space-y-4">
             <div className="flex justify-between items-end border-b border-white/5 pb-2">
                 <div>
                    <h3 className="text-sm font-bold text-slate-200">Footer Link Columns</h3>
                    <p className="text-xs text-slate-500">Manage columns like 'Company', 'Policies', 'Links'</p>
                 </div>
                 <button className="btn-secondary btn-sm" onClick={addColumn}><Plus className="w-3" /> Add Column</button>
             </div>

             <div className="space-y-2">
               {form.footerColumns.map((col, cIdx) => {
                 const isExp = expandedColumn === cIdx
                 return (
                   <div key={cIdx} className="bg-black/40 border border-white/5 rounded-lg overflow-hidden">
                      <div className="p-3 flex justify-between items-center cursor-pointer hover:bg-white/5" onClick={() => setExpandedColumn(isExp ? null : cIdx)}>
                         <span className="font-semibold text-sm">{col.title || 'Untitled Column'} <span className="text-xs text-slate-500 font-normal ml-2">({col.items.length} items)</span></span>
                         <div className="flex gap-2">
                            <button className="p-1 hover:text-red-400" onClick={e => { e.stopPropagation(); removeColumn(cIdx) }}><Trash className="w-4" /></button>
                            {isExp ? <ChevronUp className="w-4 text-slate-400" /> : <ChevronDown className="w-4 text-slate-400" />}
                         </div>
                      </div>
                      
                      {isExp && (
                        <div className="p-3 border-t border-white/5 bg-slate-900/30">
                           <div className="flex justify-between mb-4 gap-4 items-center">
                              <input className="input text-sm w-1/3" placeholder="Column Title" value={col.title} onChange={e => {
                                 const c2 = [...form.footerColumns]
                                 c2[cIdx].title = e.target.value
                                 setForm({ ...form, footerColumns: c2 })
                              }} />
                              <button className="btn-primary btn-sm" onClick={() => addColumnItem(cIdx)}>+ Add Item</button>
                           </div>

                           <div className="space-y-2">
                             {col.items.map((item, iIdx) => (
                                <div key={iIdx} className="flex gap-2 items-center bg-black/50 p-2 rounded border border-white/5">
                                   <input className="input text-xs w-1/3" placeholder="Label" value={item.label} onChange={e => updateColumnItem(cIdx, iIdx, 'label', e.target.value)} />
                                   <input className="input text-xs flex-1" placeholder="/url-or-slug" value={item.url} onChange={e => updateColumnItem(cIdx, iIdx, 'url', e.target.value)} />
                                   <label className="text-xs flex items-center gap-1 min-w-[70px] whitespace-nowrap"><input type="checkbox" checked={item.isExternal} onChange={e => updateColumnItem(cIdx, iIdx, 'isExternal', e.target.checked)} className="rounded" /> External</label>
                                   <button className="p-1 hover:text-red-400 text-slate-500 shrink-0" onClick={() => removeColumnItem(cIdx, iIdx)}><Trash className="w-3.5" /></button>
                                </div>
                             ))}
                             {col.items.length === 0 && <p className="text-xs text-slate-500 py-2">No links within this column.</p>}
                           </div>
                        </div>
                      )}
                   </div>
                 )
               })}
             </div>
          </div>

          <div className="space-y-4">
             <div className="flex justify-between items-end border-b border-white/5 pb-2 mt-8">
                 <div>
                    <h3 className="text-sm font-bold text-slate-200">SEO Link Tabs (Mega Footer)</h3>
                    <p className="text-xs text-slate-500">Maps categories to arrays of packages for SEO linking</p>
                 </div>
                 <button className="btn-secondary btn-sm" onClick={addTab}><Plus className="w-3" /> Add Tab</button>
             </div>

             <div className="space-y-2">
               {form.seoLinkTabs.map((tab, tIdx) => {
                 const isExp = expandedTab === tIdx
                 const selectedCat = categories.find(c => c._id === tab.categoryId)?.name || 'Select Category'
                 return (
                   <div key={tIdx} className="bg-black/40 border border-white/5 rounded-lg overflow-hidden">
                      <div className="p-3 flex justify-between items-center cursor-pointer hover:bg-white/5" onClick={() => setExpandedTab(isExp ? null : tIdx)}>
                         <span className="font-semibold text-sm">{selectedCat} <span className="text-xs text-slate-500 font-normal ml-2">({tab.packageIds.length} pkgs)</span></span>
                         <div className="flex gap-2">
                            <button className="p-1 hover:text-red-400" onClick={e => { e.stopPropagation(); removeTab(tIdx) }}><Trash className="w-4" /></button>
                            {isExp ? <ChevronUp className="w-4 text-slate-400" /> : <ChevronDown className="w-4 text-slate-400" />}
                         </div>
                      </div>
                      
                      {isExp && (
                        <div className="p-3 border-t border-white/5 bg-slate-900/30 flex flex-col gap-3">
                           <div>
                              <label className="label text-[10px]">Filter Category</label>
                              <select className="input text-xs" value={tab.categoryId} onChange={e => {
                                  const t2 = [...form.seoLinkTabs]
                                  t2[tIdx].categoryId = e.target.value
                                  setForm({ ...form, seoLinkTabs: t2 })
                              }}>
                                <option value="">-- Choose --</option>
                                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                              </select>
                           </div>

                           <div>
                              <label className="label text-[10px] flex justify-between">
                                 Select Target Packages
                                 <span className="text-slate-500">Multiselect (Ctrl/Cmd + Click)</span>
                              </label>
                              <select 
                                multiple 
                                className="input text-xs min-h-[120px] p-2" 
                                value={tab.packageIds} 
                                onChange={e => {
                                  const s = Array.from(e.target.selectedOptions, o => o.value)
                                  const t2 = [...form.seoLinkTabs]
                                  t2[tIdx].packageIds = s
                                  setForm({ ...form, seoLinkTabs: t2 })
                                }}
                              >
                                {packages.map(p => {
                                  const name = p.basic?.name || p.name || 'Unknown Package'
                                  const status = p.meta?.status || p.status || 'ACTIVE'
                                  return <option key={p._id} value={p._id}>{name} [{status}]</option>
                                })}
                              </select>
                           </div>
                        </div>
                      )}
                   </div>
                 )
               })}
             </div>
          </div>

        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteId)}
        onCancel={() => setDeleteId(null)}
        onConfirm={remove}
        title="Delete Footer Entry"
        message="This footer configuration will be removed."
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  )
}

export default FooterCMSPage
