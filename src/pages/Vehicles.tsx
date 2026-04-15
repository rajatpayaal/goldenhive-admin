import React, { useEffect, useState, useMemo, useRef } from 'react'
import { Plus, Trash2, Edit, RefreshCw, Upload, CarFront } from 'lucide-react'
import toast from 'react-hot-toast'

import DataTable from '../components/ui/DataTable'
import Modal from '../components/ui/Modal'
import { PageHeader, ConfirmDialog, Toggle, Spinner } from '../components/ui'
import {
  fetchVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from '../services/api.service'

type VehicleItem = {
  _id: string
  name: string
  seat: number
  type?: string
  sortOrder: number
  image?: { url?: string; alt?: string; title?: string }
  isActive: boolean
}

type VehicleForm = {
  name: string
  seat: number
  type: string
  sortOrder: number
  imageAlt: string
  imageTitle: string
  isActive: boolean
}

const defaultForm: VehicleForm = {
  name: '',
  seat: 4,
  type: '',
  sortOrder: 1,
  imageAlt: '',
  imageTitle: '',
  isActive: true,
}

const VehiclesPage: React.FC = () => {
  const [items, setItems] = useState<VehicleItem[]>([])
  const [loading, setLoading] = useState(false)

  // Modal State
  const [openForm, setOpenForm] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [saving, setSaving] = useState(false)
  
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [form, setForm] = useState<VehicleForm>(defaultForm)
  
  // Image Upload
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const imageRef = useRef<HTMLInputElement>(null)

  const loadData = () => {
    setLoading(true)
    fetchVehicles()
      .then((res) => {
        const d = res.data?.data || res.data
        setItems(d?.items || d || [])
      })
      .catch(() => toast.error('Failed to load vehicles'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [])

  const openCreate = () => {
    setSelectedId(null)
    setForm(defaultForm)
    setImageFile(null)
    setPreviewUrl('')
    setOpenForm(true)
  }

  const openEdit = (item: VehicleItem) => {
    setSelectedId(item._id)
    setForm({
      name: item.name || '',
      seat: item.seat || 4,
      type: item.type || '',
      sortOrder: item.sortOrder || 1,
      imageAlt: item?.image?.alt || '',
      imageTitle: item?.image?.title || '',
      isActive: item.isActive ?? true,
    })
    setImageFile(null)
    setPreviewUrl(item?.image?.url || '')
    setOpenForm(true)
  }

  const saveForm = async () => {
    if (!form.name || !form.seat) {
      toast.error('Please fill required fields (Name, Seats)')
      return
    }

    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('name', form.name)
      fd.append('seat', String(form.seat))
      fd.append('type', form.type)
      fd.append('sortOrder', String(form.sortOrder))
      fd.append('imageAlt', form.imageAlt)
      fd.append('imageTitle', form.imageTitle)
      fd.append('isActive', form.isActive ? 'true' : 'false')

      if (imageFile) {
        fd.append('image', imageFile)
      }

      if (selectedId) {
        await updateVehicle(selectedId, fd)
        toast.success('Vehicle updated')
      } else {
        await createVehicle(fd)
        toast.success('Vehicle created')
      }
      setOpenForm(false)
      loadData()
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Validation Failed')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!selectedId) return
    setSaving(true)
    try {
      await deleteVehicle(selectedId)
      toast.success('Vehicle deleted')
      setOpenDelete(false)
      loadData()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete')
    } finally {
      setSaving(false)
    }
  }

  const columns = useMemo(
    () => [
      {
        header: 'Vehicle',
        render: (row: VehicleItem) => (
          <div className="flex items-center gap-3">
            {row.image?.url ? (
              <img src={row.image.url} alt={row.name} className="w-12 h-12 rounded-lg object-cover bg-surface" />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-surface flex items-center justify-center border border-white/5">
                <CarFront className="w-5 h-5 text-slate-500" />
              </div>
            )}
            <div>
              <p className="font-semibold text-slate-200">{row.name}</p>
              <p className="text-xs text-slate-500">{row.type || 'Standard'}</p>
            </div>
          </div>
        ),
      },
      {
        header: 'Seats',
        render: (row: VehicleItem) => <span className="font-medium">{row.seat}</span>
      },
      {
        header: 'Sort Order',
        render: (row: VehicleItem) => <span className="text-slate-400">{row.sortOrder}</span>
      },
      {
        header: 'Status',
        render: (row: VehicleItem) => (
          <span className={`px-2 py-1 text-xs rounded-lg font-medium ${row.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'}`}>
            {row.isActive ? 'Active' : 'Inactive'}
          </span>
        ),
      },
      {
        header: 'Actions',
        render: (row: VehicleItem) => (
          <div className="flex items-center gap-2">
            <button className="btn-secondary btn-sm" onClick={() => openEdit(row)}>
              <Edit className="w-3.5 h-3.5" /> Edit
            </button>
            <button className="btn-danger btn-sm" onClick={() => { setSelectedId(row._id); setOpenDelete(true) }}>
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ),
      },
    ],
    []
  )

  return (
    <div className="page">
      <PageHeader
        title="Vehicles"
        subtitle="Manage your standard transport vehicles for packages and pricing options"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Management' }, { label: 'Vehicles' }]}
        action={
          <div className="flex gap-2">
            <button className="btn-secondary" onClick={loadData}>
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
            <button className="btn-primary" onClick={openCreate}>
              <Plus className="w-4 h-4" /> Add Vehicle
            </button>
          </div>
        }
      />

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        keyExtractor={(row) => row._id}
        emptyMessage="No vehicles found."
      />

      {/* Editor Modal */}
      <Modal
        open={openForm}
        onClose={() => setOpenForm(false)}
        title={selectedId ? 'Edit Vehicle' : 'Create Vehicle'}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setOpenForm(false)}>Cancel</button>
            <button className="btn-primary" onClick={saveForm} disabled={saving}>
              {saving ? <Spinner size="sm" /> : 'Save Vehicle'}
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="md:col-span-2">
            <label className="label">Vehicle Picture</label>
            <div
              onClick={() => imageRef.current?.click()}
              className="border-2 border-dashed border-surface-border rounded-xl p-4 text-center cursor-pointer hover:border-brand-500/50 transition-colors"
            >
              {imageFile || previewUrl ? (
                <img 
                  src={imageFile ? URL.createObjectURL(imageFile) : previewUrl} 
                  alt="Vehicle" 
                  className="h-32 object-cover rounded-lg mx-auto" 
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-500 py-4">
                  <Upload className="w-6 h-6" />
                  <span className="text-xs">Click to upload vehicle image</span>
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

          <div>
            <label className="label">Vehicle Name *</label>
            <input 
              type="text" className="input" placeholder="e.g. Innova Crysta"
              value={form.name} onChange={(e) => setForm(pf => ({ ...pf, name: e.target.value }))} 
            />
          </div>

          <div>
            <label className="label">Category / Type</label>
            <input 
              type="text" className="input" placeholder="e.g. SUV"
              value={form.type} onChange={(e) => setForm(pf => ({ ...pf, type: e.target.value }))} 
            />
          </div>

          <div>
            <label className="label">Seats (Occupancy) *</label>
            <input 
              type="number" className="input" min="1"
              value={form.seat} onChange={(e) => setForm(pf => ({ ...pf, seat: Number(e.target.value) }))} 
            />
          </div>

          <div>
            <label className="label">Sort Order</label>
            <input 
              type="number" className="input" min="1"
              value={form.sortOrder} onChange={(e) => setForm(pf => ({ ...pf, sortOrder: Number(e.target.value) }))} 
            />
          </div>

          <div>
            <label className="label">Image Alt Text</label>
            <input 
              type="text" className="input"
              value={form.imageAlt} onChange={(e) => setForm(pf => ({ ...pf, imageAlt: e.target.value }))} 
            />
          </div>

          <div>
            <label className="label">Image Title Text</label>
            <input 
              type="text" className="input"
              value={form.imageTitle} onChange={(e) => setForm(pf => ({ ...pf, imageTitle: e.target.value }))} 
            />
          </div>

          <div className="md:col-span-2 pt-2 border-t border-surface-border mt-2">
            <label className="flex items-center gap-3 cursor-pointer w-fit">
              <Toggle checked={form.isActive} onChange={(v) => setForm(pf => ({ ...pf, isActive: v }))} />
              <span className="text-sm font-medium">Active (Visible)</span>
            </label>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={openDelete}
        onCancel={() => setOpenDelete(false)}
        onConfirm={confirmDelete}
        title="Delete Vehicle"
        message="Are you sure you want to completely remove this vehicle? This action cannot be undone."
        loading={saving}
      />
    </div>
  )
}

export default VehiclesPage
