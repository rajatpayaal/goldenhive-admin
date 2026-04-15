import React, { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import DataTable from '../../components/ui/DataTable'
import { ConfirmDialog, PageHeader } from '../../components/ui'
import { deleteBanner, listBanners } from './service'

const BannersPage: React.FC = () => {
  const navigate = useNavigate()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
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

  const columns = useMemo(
    () => [
      {
        header: 'Banner',
        render: (row: any) => (
          <div className="flex items-center gap-3">
            <img
              src={row.imageUrl || row.image || 'https://placehold.co/80x48?text=Banner'}
              alt={row.title}
              className="h-12 w-20 rounded-lg border border-surface-border object-cover"
            />
            <div>
              <p className="font-semibold text-text-primary">{row.title || 'Untitled'}</p>
              <p className="text-xs text-text-secondary">Order: {row.sortOrder || 1}</p>
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
        render: (row: any) => <span className="text-xs text-text-secondary">{row.updatedAt ? format(new Date(row.updatedAt), 'dd MMM yyyy') : '—'}</span>,
      },
      {
        header: 'Actions',
        render: (row: any) => (
          <div className="flex items-center gap-2">
            <button className="btn-secondary btn-sm" onClick={() => navigate(`/banners/${row._id}/edit`)}>
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
        title="Banners"
        subtitle="Manage homepage and campaign banners"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Banners' }]}
        action={
          <button className="btn-primary" onClick={() => navigate('/banners/new')}>
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
