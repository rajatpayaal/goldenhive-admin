import React, { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import DataTable from '../../components/ui/DataTable'
import { ConfirmDialog, PageHeader } from '../../components/ui'
import { getFeedbackByPackage, removeFeedback } from './service'

const FeedbackPage: React.FC = () => {
  const [packageId, setPackageId] = useState('')
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = () => {
    if (!packageId) {
      setItems([])
      return
    }

    setLoading(true)
    getFeedbackByPackage(packageId, { page, limit: 10 })
      .then((response) => {
        const payload = response.data?.data || response.data
        setItems(payload?.items || payload || [])
        setTotalPages(payload?.totalPages || 1)
      })
      .catch(() => toast.error('Failed to load feedback'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [packageId, page])

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await removeFeedback(deleteId)
      toast.success('Feedback deleted')
      setDeleteId(null)
      load()
    } catch {
      toast.error('Failed to delete feedback')
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    {
      header: 'User',
      render: (row: any) => (
        <span className="font-medium text-text-primary">{row.userId?.firstName || ''} {row.userId?.lastName || ''}</span>
      ),
    },
    {
      header: 'Rating',
      render: (row: any) => <span className="text-warning-400">{row.rating || 0}/5</span>,
    },
    {
      header: 'Comment',
      render: (row: any) => <span className="line-clamp-2 text-sm text-text-secondary">{row.comment || '—'}</span>,
    },
    {
      header: 'Date',
      render: (row: any) => (
        <span className="text-xs text-text-tertiary">
          {row.createdAt ? format(new Date(row.createdAt), 'dd MMM yyyy') : '—'}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (row: any) => (
        <button className="btn-danger btn-sm" onClick={() => setDeleteId(row._id)}>
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      ),
    },
  ]

  return (
    <div className="page">
      <PageHeader
        title="Feedback"
        subtitle="Moderate package feedback and remove abuse"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Feedback' }]}
      />

      <div className="card p-4">
        <input
          className="input max-w-md"
          placeholder="Enter package ID to fetch feedback"
          value={packageId}
          onChange={(e) => {
            setPackageId(e.target.value)
            setPage(1)
          }}
        />
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        keyExtractor={(row: any) => row._id}
        emptyMessage={packageId ? 'No feedback records for this package' : 'Enter package ID to load feedback'}
      />

      <ConfirmDialog
        open={Boolean(deleteId)}
        onCancel={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Feedback"
        message="This feedback entry will be permanently deleted."
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  )
}

export default FeedbackPage
