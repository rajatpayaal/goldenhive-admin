import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { fetchCountries, createCountry, updateCountry, deleteCountry } from '../services/api.service'
import DataTable from '../components/ui/DataTable'
import Modal from '../components/ui/Modal'
import StatusBadge from '../components/ui/StatusBadge'
import { PageHeader, Spinner, ConfirmDialog } from '../components/ui'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const schema = z.object({
  name:      z.string().min(1, 'Name required'),
  slug:      z.string().optional(),
  isActive:  z.boolean().default(true),
})
type FormData = z.infer<typeof schema>

const CountryForm: React.FC<{ defaultValues?: Partial<FormData>, onSubmit: (d: FormData) => Promise<void>, saving: boolean }> = ({ defaultValues, onSubmit, saving }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { isActive: true, ...defaultValues } })
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="label">Country Name *</label>
        <input {...register('name')} placeholder="e.g. India" className={`input ${errors.name ? 'input-error' : ''}`} />
        {errors.name && <p className="text-danger-500 text-xs mt-1">{errors.name.message}</p>}
      </div>
      <div>
        <label className="label">Slug (auto-generated if blank)</label>
        <input {...register('slug')} placeholder="india" className="input" />
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
          {saving ? <Spinner size="sm" /> : 'Save Country'}
        </button>
      </div>
    </form>
  )
}

const CountriesPage: React.FC = () => {
  const [countries, setCountries]     = useState<any[]>([])
  const [loading, setLoading]         = useState(true)
  const [modalOpen, setModalOpen]     = useState(false)
  const [editing, setEditing]         = useState<any>(null)
  const [saving, setSaving]           = useState(false)
  const [deleteId, setDeleteId]       = useState<string | null>(null)
  const [deleting, setDeleting]       = useState(false)

  const load = () => {
    setLoading(true)
    fetchCountries().then(r => setCountries(r.data?.data || r.data?.items || r.data || [])).finally(() => setLoading(false))
  }
  useEffect(() => load(), [])

  const handleSubmit = async (data: FormData) => {
    setSaving(true)
    try {
      if (editing) {
        await updateCountry(editing._id, data)
        toast.success('Country updated!')
      } else {
        await createCountry(data)
        toast.success('Country created!')
      }
      setModalOpen(false); setEditing(null); load()
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed to save') }
    finally { setSaving(false) }
  }

  const handleToggle = async (cat: any) => {
    try {
      await updateCountry(cat._id, { ...cat, isActive: !cat.isActive })
      toast.success(`Country ${cat.isActive ? 'deactivated' : 'activated'}`)
      load()
    } catch { toast.error('Failed to toggle') }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteCountry(deleteId)
      toast.success('Country deleted')
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
          <button onClick={() => { setEditing(r); setModalOpen(true) }} className="btn-secondary btn-sm"><Pencil className="w-3 h-3" /></button>
          <button onClick={() => setDeleteId(r._id)} className="btn-danger btn-sm"><Trash2 className="w-3 h-3" /></button>
        </div>
      ),
    },
  ]

  return (
    <div className="page">
      <PageHeader
        title="Countries"
        subtitle="Manage available countries for packages"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Countries' }]}
        action={<button className="btn-primary" onClick={() => { setEditing(null); setModalOpen(true) }}><Plus className="w-4 h-4" /> New Country</button>}
      />
      <DataTable columns={columns} data={countries} loading={loading} keyExtractor={(r: any) => r._id} emptyMessage="No countries yet." />
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null) }} title={editing ? 'Edit Country' : 'Create Country'}>
        <CountryForm defaultValues={editing} onSubmit={handleSubmit} saving={saving} />
      </Modal>
      <ConfirmDialog open={Boolean(deleteId)} onConfirm={handleDelete} onCancel={() => setDeleteId(null)} title="Delete Country?" message="All states connected to this country could break." confirmLabel="Delete" loading={deleting} />
    </div>
  )
}

export default CountriesPage
