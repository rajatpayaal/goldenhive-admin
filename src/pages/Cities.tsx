import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { fetchCities, createCity, updateCity, deleteCity, fetchStates } from '../services/api.service'
import DataTable from '../components/ui/DataTable'
import Modal from '../components/ui/Modal'
import StatusBadge from '../components/ui/StatusBadge'
import { PageHeader, Spinner, ConfirmDialog } from '../components/ui'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const schema = z.object({
  name:      z.string().min(1, 'Name required'),
  slug:      z.string().optional(),
  stateId:   z.string().min(1, 'Parent State Required'),
  isActive:  z.boolean().default(true),
})
type FormData = z.infer<typeof schema>

const CityForm: React.FC<{ defaultValues?: Partial<FormData>, onSubmit: (d: FormData) => Promise<void>, saving: boolean }> = ({ defaultValues, onSubmit, saving }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { isActive: true, ...defaultValues } })
  const [statesList, setStatesList] = useState<any[]>([])

  useEffect(() => { fetchStates().then(r => setStatesList(r.data?.data || r.data?.items || r.data || [])) }, [])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="label">Parent State *</label>
        <select {...register('stateId')} className={`input ${errors.stateId ? 'input-error' : ''}`}>
           <option value="">Select State</option>
           {statesList.map(s => <option key={s._id} value={s._id}>{s.name} ({s.countryId?.name || 'Local'})</option>)}
        </select>
        {errors.stateId && <p className="text-danger-500 text-xs mt-1">{errors.stateId.message}</p>}
      </div>
      <div>
        <label className="label">City Name *</label>
        <input {...register('name')} placeholder="e.g. Manali" className={`input ${errors.name ? 'input-error' : ''}`} />
        {errors.name && <p className="text-danger-500 text-xs mt-1">{errors.name.message}</p>}
      </div>
      <div>
        <label className="label">Slug (auto-generated if blank)</label>
        <input {...register('slug')} placeholder="manali" className="input" />
      </div>
      <div>
        <label className="label">Status</label>
        <select {...register('isActive', { setValueAs: (v) => v === 'true' || v === true })} className="input">
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>
      <div className="flex justify-end pt-2">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? <Spinner size="sm" /> : 'Save City'}
        </button>
      </div>
    </form>
  )
}

const CitiesPage: React.FC = () => {
  const [cities, setCities]           = useState<any[]>([])
  const [loading, setLoading]         = useState(true)
  const [modalOpen, setModalOpen]     = useState(false)
  const [editing, setEditing]         = useState<any>(null)
  const [saving, setSaving]           = useState(false)
  const [deleteId, setDeleteId]       = useState<string | null>(null)
  const [deleting, setDeleting]       = useState(false)

  const load = () => {
    setLoading(true)
    fetchCities().then(r => setCities(r.data?.data || r.data?.items || r.data || [])).finally(() => setLoading(false))
  }
  useEffect(() => load(), [])

  const handleSubmit = async (data: FormData) => {
    setSaving(true)
    try {
      if (editing) {
        await updateCity(editing._id, data)
        toast.success('City updated!')
      } else {
        await createCity(data)
        toast.success('City created!')
      }
      setModalOpen(false); setEditing(null); load()
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed to save') }
    finally { setSaving(false) }
  }

  const handleToggle = async (cat: any) => {
    try {
      await updateCity(cat._id, { ...cat, isActive: !cat.isActive })
      toast.success(`City ${cat.isActive ? 'deactivated' : 'activated'}`)
      load()
    } catch { toast.error('Failed to toggle') }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteCity(deleteId)
      toast.success('City deleted')
      setDeleteId(null); load()
    } catch { toast.error('Failed to delete') }
    finally { setDeleting(false) }
  }

  const columns = [
    {
      header: 'Name',
      render: (r: any) => (<div><p className="font-semibold text-text-primary">{r.name}</p><p className="text-xs text-text-tertiary">/{r.slug}</p></div>),
    },
    { header: 'Status', render: (r: any) => <StatusBadge status={r.isActive ? 'ACTIVE' : 'INACTIVE'} type="package" /> },
    { header: 'Created', render: (r: any) => <span className="text-xs text-text-tertiary">{format(new Date(r.createdAt), 'dd MMM yy')}</span> },
    {
      header: 'Actions',
      render: (r: any) => (
        <div className="flex items-center gap-2">
          <button onClick={() => handleToggle(r)} className={`btn-icon btn-sm ${r.isActive ? 'text-success-500 hover:text-success-400' : 'text-text-tertiary hover:text-text-secondary'}`} title={r.isActive ? 'Deactivate' : 'Activate'}>
             {r.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
          </button>
          <button onClick={() => { setEditing({ ...r, stateId: r.stateId?._id || r.stateId }); setModalOpen(true) }} className="btn-secondary btn-sm"><Pencil className="w-3 h-3" /></button>
          <button onClick={() => setDeleteId(r._id)} className="btn-danger btn-sm"><Trash2 className="w-3 h-3" /></button>
        </div>
      ),
    },
  ]

  return (
    <div className="page">
      <PageHeader
        title="Cities"
        subtitle="Manage available cities for packages"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Cities' }]}
        action={<button className="btn-primary" onClick={() => { setEditing(null); setModalOpen(true) }}><Plus className="w-4 h-4" /> New City</button>}
      />
      <DataTable columns={columns} data={cities} loading={loading} keyExtractor={(r: any) => r._id} emptyMessage="No cities yet." />
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null) }} title={editing ? 'Edit City' : 'Create City'}>
        <CityForm defaultValues={editing} onSubmit={handleSubmit} saving={saving} />
      </Modal>
      <ConfirmDialog open={Boolean(deleteId)} onConfirm={handleDelete} onCancel={() => setDeleteId(null)} title="Delete City?" message="All packages connected to this city might break." confirmLabel="Delete" loading={deleting} />
    </div>
  )
}

export default CitiesPage
