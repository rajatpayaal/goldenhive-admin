import React, { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { Pencil, Plus, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import DataTable from '../../components/ui/DataTable'
import StatusBadge from '../../components/ui/StatusBadge'
import { ConfirmDialog, PageHeader } from '../../components/ui'
import { deleteCity, fetchCities, updateCity } from './service'

const CitiesPage: React.FC = () => {
  const navigate = useNavigate()
  const [cities, setCities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = () => {
    setLoading(true)
    fetchCities()
      .then((r) => setCities(r.data?.data || r.data?.items || r.data || []))
      .catch(() => toast.error('Failed to load cities'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const handleToggle = async (row: any) => {
    try {
      await updateCity(row._id, { ...row, stateId: row.stateId?._id || row.stateId, isActive: !row.isActive })
      toast.success(`City ${row.isActive ? 'deactivated' : 'activated'}`)
      load()
    } catch {
      toast.error('Failed to toggle')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteCity(deleteId)
      toast.success('City deleted')
      setDeleteId(null)
      load()
    } catch {
      toast.error('Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  const columns = useMemo(
    () => [
      {
        header: 'Name',
        render: (r: any) => (
          <div>
            <p className="font-semibold text-text-primary">{r.name}</p>
            <p className="text-xs text-text-tertiary">/{r.slug}</p>
          </div>
        ),
      },
      { header: 'Status', render: (r: any) => <StatusBadge status={r.isActive ? 'ACTIVE' : 'INACTIVE'} type="package" /> },
      {
        header: 'Created',
        render: (r: any) => <span className="text-xs text-text-tertiary">{r.createdAt ? format(new Date(r.createdAt), 'dd MMM yy') : '—'}</span>,
      },
      {
        header: 'Actions',
        render: (r: any) => (
          <div className="flex items-center gap-2">
            <button onClick={() => handleToggle(r)} className={`btn-icon btn-sm ${r.isActive ? 'text-success-500 hover:text-success-400' : 'text-text-tertiary hover:text-text-secondary'}`} title={r.isActive ? 'Deactivate' : 'Activate'}>
              {r.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
            </button>
            <button onClick={() => navigate(`/cities/${r._id}/edit`)} className="btn-secondary btn-sm"><Pencil className="h-3 w-3" /></button>
            <button onClick={() => setDeleteId(r._id)} className="btn-danger btn-sm"><Trash2 className="h-3 w-3" /></button>
          </div>
        ),
      },
    ],
    [navigate]
  )

  return (
    <div className="page">
      <PageHeader
        title="Cities"
        subtitle="Manage available cities for packages"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Cities' }]}
        action={<button className="btn-primary" onClick={() => navigate('/cities/new')}><Plus className="h-4 w-4" /> New City</button>}
      />

      <DataTable columns={columns} data={cities} loading={loading} keyExtractor={(r: any) => r._id} emptyMessage="No cities yet." />

      <ConfirmDialog
        open={Boolean(deleteId)}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        title="Delete City?"
        message="All packages connected to this city might break."
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  )
}

export default CitiesPage
