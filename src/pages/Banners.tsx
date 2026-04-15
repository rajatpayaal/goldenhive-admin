import React, { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import DataTable from '../components/ui/DataTable'
import Modal from '../components/ui/Modal'
import { ConfirmDialog, PageHeader } from '../components/ui'
import { createBanner, deleteBanner, listBanners, updateBanner } from '../services/adminPanel.service'

type BannerForm = {
  title: string
  imageUrl: string
  imageFile: File | null
  redirectUrl: string
  sortOrder: number
  isActive: boolean
}

const defaultForm: BannerForm = {
  title: '',
  imageUrl: '',
  imageFile: null,
  redirectUrl: '',
  sortOrder: 1,
  isActive: true,
}

const BannersPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<BannerForm>(defaultForm)
  const [editing, setEditing] = useState<any | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = () => {
    setLoading(true)
    listBanners()
      .then((response) => {
        const payload = response.data?.data || response.data
        setItems(payload?.items || payload || [])
      })
      .catch(() => toast.error('Failed to load banners'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(defaultForm)
    setModalOpen(true)
  }

  const openEdit = (item: any) => {
    setEditing(item)
    setForm({
      title: item.title || '',
      imageUrl: item.imageUrl || item.image || '',
      imageFile: null,
      redirectUrl: item.redirectUrl || item.redirectType || item.link || '',
      sortOrder: Number(item.sortOrder || 1),
      isActive: Boolean(item.isActive ?? true),
    })
    setModalOpen(true)
  }

  const save = async () => {
    if (!form.title) {
      toast.error('Title is required')
      return
    }

    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('title', form.title)
      fd.append('redirectType', form.redirectUrl) // Maps to backend property
      fd.append('sortOrder', String(form.sortOrder))
      fd.append('isActive', String(form.isActive))
      if (form.imageFile) fd.append('image', form.imageFile)
      
      if (editing?._id) {
        await updateBanner(editing._id, fd as any)
        toast.success('Banner updated')
      } else {
        await createBanner(fd as any)
        toast.success('Banner created')
      }
      setModalOpen(false)
      load()
    } catch {
      toast.error('Failed to save banner')
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteBanner(deleteId)
      toast.success('Banner deleted')
      setDeleteId(null)
      load()
    } catch {
      toast.error('Failed to delete banner')
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    {
      header: 'Banner',
      render: (row: any) => (
        <div className="flex items-center gap-3">
          <img
            src={row.imageUrl || row.image || 'https://placehold.co/80x48?text=Banner'}
            alt={row.title}
            className="h-12 w-20 rounded-lg border border-white/10 object-cover"
          />
          <div>
            <p className="font-semibold text-slate-100">{row.title || 'Untitled'}</p>
            <p className="text-xs text-slate-400">Order: {row.sortOrder || 1}</p>
          </div>
        </div>
      ),
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
        title="Banners"
        subtitle="Manage homepage and campaign banners"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Banners' }]}
        action={
          <button className="btn-primary" onClick={openCreate}>
            <Plus className="h-4 w-4" /> New Banner
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        keyExtractor={(row: any) => row._id}
        emptyMessage="No banners found"
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Banner' : 'Create Banner'}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={save} disabled={saving}>Save Banner</button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="label">Title</label>
            <input className="input" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
          </div>
          <div>
            <label className="label">Image Upload</label>
            <div className="flex items-center gap-3">
              {(form.imageFile || form.imageUrl) && (
                <img
                  src={form.imageFile ? URL.createObjectURL(form.imageFile) : form.imageUrl}
                  alt="preview"
                  className="w-16 h-16 object-cover border border-white/10 rounded-lg"
                />
              )}
              <input 
                type="file" 
                accept="image/*"
                className="input" 
                onChange={(e) => setForm((p) => ({ ...p, imageFile: e.target.files?.[0] || null }))} 
              />
            </div>
          </div>
          <div>
            <label className="label">Redirect URL</label>
            <input className="input" value={form.redirectUrl} onChange={(e) => setForm((p) => ({ ...p, redirectUrl: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Sort Order</label>
              <input type="number" className="input" value={form.sortOrder} onChange={(e) => setForm((p) => ({ ...p, sortOrder: Number(e.target.value || 1) }))} />
            </div>
            <label className="mt-6 flex items-center gap-2 text-sm text-slate-200">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))} />
              Active
            </label>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteId)}
        onCancel={() => setDeleteId(null)}
        onConfirm={remove}
        title="Delete Banner"
        message="This banner will be permanently removed."
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  )
}

export default BannersPage
