import React, { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { Pencil, Plus, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import DataTable from '../../components/ui/DataTable'
import StatusBadge from '../../components/ui/StatusBadge'
import { ConfirmDialog, PageHeader } from '../../components/ui'
import { deleteState, fetchStates, updateState } from './service'

const StatesPage: React.FC = () => {
  const navigate = useNavigate()
  const [states, setStates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = () => {
    setLoading(true)
    fetchStates()
      .then((r) => setStates(r.data?.data || r.data?.items || r.data || []))
      .catch(() => toast.error('Failed to load states'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const handleToggle = async (row: any) => {
    try {
      await updateState(row._id, { ...row, countryId: row.countryId?._id || row.countryId, isActive: !row.isActive })
      toast.success(`State ${row.isActive ? 'deactivated' : 'activated'}`)
      load()
    } catch {
      toast.error('Failed to toggle')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteState(deleteId)
      toast.success('State deleted')
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
            <button onClick={() => handleToggle(r)} className={`btn-icon btn-sm ${r.isActive ? 'text-success-400 hover:text-success-300' : 'text-text-tertiary hover:text-text-secondary'}`} title={r.isActive ? 'Deactivate' : 'Activate'}>
              {r.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
            </button>
            <button onClick={() => navigate(`/states/${r._id}/edit`)} className="btn-secondary btn-sm"><Pencil className="h-3 w-3" /></button>
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
        title="States"
        subtitle="Manage available states for packages"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'States' }]}
        action={<button className="btn-primary" onClick={() => navigate('/states/new')}><Plus className="h-4 w-4" /> New State</button>}
      />

      <DataTable columns={columns} data={states} loading={loading} keyExtractor={(r: any) => r._id} emptyMessage="No states yet." />

      <ConfirmDialog
        open={Boolean(deleteId)}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        title="Delete State?"
        message="All packages connected to this state might break."
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  )
}

export default StatesPage
