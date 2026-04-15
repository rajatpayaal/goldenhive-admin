import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { fetchStates, createState, updateState, deleteState, fetchCountries } from '../services/api.service'
import DataTable from '../components/ui/DataTable'
import Modal from '../components/ui/Modal'
import StatusBadge from '../components/ui/StatusBadge'
import { PageHeader, Spinner, ConfirmDialog } from '../components/ui'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const schema = z.object({
  name:      z.string().min(1, 'Name required'),
  slug:      z.string().optional(),
  countryId: z.string().min(1, 'Parent Country Required'),
  isActive:  z.boolean().default(true),
})
type FormData = z.infer<typeof schema>

const StateForm: React.FC<{ defaultValues?: Partial<FormData>, onSubmit: (d: FormData) => Promise<void>, saving: boolean }> = ({ defaultValues, onSubmit, saving }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { isActive: true, ...defaultValues } })
  const [countries, setCountries] = useState<any[]>([])

  useEffect(() => { fetchCountries().then(r => setCountries(r.data?.data || r.data?.items || r.data || [])) }, [])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="label">Parent Country *</label>
        <select {...register('countryId')} className={`input ${errors.countryId ? 'input-error' : ''}`}>
           <option value="">Select Country</option>
           {countries.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        {errors.countryId && <p className="text-danger-400 text-xs mt-1">{errors.countryId.message}</p>}
      </div>
      <div>
        <label className="label">State Name *</label>
        <input {...register('name')} placeholder="e.g. Himachal Pradesh" className={`input ${errors.name ? 'input-error' : ''}`} />
        {errors.name && <p className="text-danger-400 text-xs mt-1">{errors.name.message}</p>}
      </div>
      <div>
        <label className="label">Slug (auto-generated if blank)</label>
        <input {...register('slug')} placeholder="himachal-pradesh" className="input" />
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
          {saving ? <Spinner size="sm" /> : 'Save State'}
        </button>
      </div>
    </form>
  )
}

const StatesPage: React.FC = () => {
  const [states, setStates]           = useState<any[]>([])
  const [loading, setLoading]         = useState(true)
  const [modalOpen, setModalOpen]     = useState(false)
  const [editing, setEditing]         = useState<any>(null)
  const [saving, setSaving]           = useState(false)
  const [deleteId, setDeleteId]       = useState<string | null>(null)
  const [deleting, setDeleting]       = useState(false)

  const load = () => {
    setLoading(true)
    fetchStates().then(r => setStates(r.data?.data || r.data?.items || r.data || [])).finally(() => setLoading(false))
  }
  useEffect(() => load(), [])

  const handleSubmit = async (data: FormData) => {
    setSaving(true)
    try {
      if (editing) {
        await updateState(editing._id, data)
        toast.success('State updated!')
      } else {
        await createState(data)
        toast.success('State created!')
      }
      setModalOpen(false); setEditing(null); load()
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed to save') }
    finally { setSaving(false) }
  }

  const handleToggle = async (cat: any) => {
    try {
      // Must pass full cat payload or at least required fields because schema is validated on backend
      await updateState(cat._id, { ...cat, isActive: !cat.isActive })
      toast.success(`State ${cat.isActive ? 'deactivated' : 'activated'}`)
      load()
    } catch { toast.error('Failed to toggle') }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteState(deleteId)
      toast.success('State deleted')
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
          <button onClick={() => handleToggle(r)} className={`btn-icon btn-sm ${r.isActive ? 'text-success-400 hover:text-success-300' : 'text-text-tertiary hover:text-text-secondary'}`} title={r.isActive ? 'Deactivate' : 'Activate'}>
             {r.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
          </button>
          <button onClick={() => { setEditing({ ...r, countryId: r.countryId?._id || r.countryId }); setModalOpen(true) }} className="btn-secondary btn-sm"><Pencil className="w-3 h-3" /></button>
          <button onClick={() => setDeleteId(r._id)} className="btn-danger btn-sm"><Trash2 className="w-3 h-3" /></button>
        </div>
      ),
    },
  ]

  return (
    <div className="page">
      <PageHeader
        title="States"
        subtitle="Manage available states for packages"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'States' }]}
        action={<button className="btn-primary" onClick={() => { setEditing(null); setModalOpen(true) }}><Plus className="w-4 h-4" /> New State</button>}
      />
      <DataTable columns={columns} data={states} loading={loading} keyExtractor={(r: any) => r._id} emptyMessage="No states yet." />
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null) }} title={editing ? 'Edit State' : 'Create State'}>
        <StateForm defaultValues={editing} onSubmit={handleSubmit} saving={saving} />
      </Modal>
      <ConfirmDialog open={Boolean(deleteId)} onConfirm={handleDelete} onCancel={() => setDeleteId(null)} title="Delete State?" message="All packages connected to this state might break." confirmLabel="Delete" loading={deleting} />
    </div>
  )
}

export default StatesPage
