import React, { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import DataTable from '../../components/ui/DataTable'
import { ConfirmDialog, PageHeader } from '../../components/ui'
import { deletePolicy, listPolicies } from './service'

const PoliciesPage: React.FC = () => {
  const navigate = useNavigate()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

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

  const columns = useMemo(
    () => [
      {
        header: 'Policy',
        render: (row: any) => (
          <div>
            <p className="font-semibold text-text-primary">{row.title || 'Untitled'}</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="rounded bg-brand-500/20 px-1.5 py-0.5 text-[10px] text-brand-400">{row.type}</span>
              <span className="text-xs text-text-tertiary">/{row.slug}</span>
            </div>
          </div>
        ),
      },
      {
        header: 'Sections',
        render: (row: any) => <span className="text-sm font-medium text-text-secondary">{row.sections?.length || 0}</span>,
      },
      {
        header: 'Status',
        render: (row: any) => (
          <span className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${!row.isActive ? 'bg-warning-500/10 text-warning-500' : 'bg-success-500/10 text-success-400'}`}>
            {!row.isActive ? 'INACTIVE' : 'ACTIVE'}
          </span>
        ),
      },
      {
        header: 'Updated',
        render: (row: any) => <span className="text-xs text-text-tertiary">{row.updatedAt ? format(new Date(row.updatedAt), 'dd MMM yyyy') : '—'}</span>,
      },
      {
        header: 'Actions',
        render: (row: any) => (
          <div className="flex items-center gap-2">
            <button className="btn-secondary btn-sm" onClick={() => navigate(`/policies/${row._id}/edit`)}>
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button className="btn-danger btn-sm" onClick={() => setDeleteId(row._id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ),
      },
    ],
    [navigate]
  )

  return (
    <div className="page">
      <PageHeader
        title="Policies CMS"
        subtitle="Full dynamic control over policy formatting, contact footers, and SEO arrays."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Policies' }]}
        action={
          <button className="btn-primary" onClick={() => navigate('/policies/new')}>
            <Plus className="h-4 w-4" /> New Policy
          </button>
        }
      />

      <DataTable columns={columns} data={items} loading={loading} keyExtractor={(row: any) => row._id} emptyMessage="No policies configured" />

      <ConfirmDialog
        open={Boolean(deleteId)}
        onCancel={() => setDeleteId(null)}
        onConfirm={remove}
        title="Delete Policy"
        message="This policy will be permanently removed."
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  )
}

export default PoliciesPage
