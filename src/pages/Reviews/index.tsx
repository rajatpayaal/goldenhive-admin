import React, { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { Plus, Star, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import DataTable from '../../components/ui/DataTable'
import { ConfirmDialog, PageHeader } from '../../components/ui'
import { listPackageReviews, removeReview } from './service'

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star key={s} className={`h-3.5 w-3.5 ${s <= rating ? 'fill-warning-400 text-warning-400' : 'text-slate-600'}`} />
    ))}
  </div>
)

const ReviewsPage: React.FC = () => {
  const navigate = useNavigate()
  const [packageId, setPackageId] = useState('')
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = () => {
    if (!packageId) {
      setReviews([])
      return
    }

    setLoading(true)
    listPackageReviews(packageId, { page, limit: 10 })
      .then((response) => {
        const payload = response.data?.data || response.data
        setReviews(payload?.items || payload || [])
        setTotalPages(payload?.totalPages || 1)
      })
      .catch(() => toast.error('Failed to load reviews for package'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [page, packageId])

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await removeReview(deleteId)
      toast.success('Review deleted')
      setDeleteId(null)
      load()
    } catch {
      toast.error('Failed to delete review')
    } finally {
      setDeleting(false)
    }
  }

  const columns = useMemo(
    () => [
      {
        header: 'User',
        render: (row: any) => <span className="font-medium text-text-primary">{row.userId?.firstName || ''} {row.userId?.lastName || ''}</span>,
      },
      {
        header: 'Rating',
        render: (row: any) => <StarRating rating={Number(row.rating || 0)} />,
      },
      {
        header: 'Comment',
        render: (row: any) => <span className="line-clamp-2 text-sm text-text-secondary">{row.comment || '—'}</span>,
      },
      {
        header: 'Created',
        render: (row: any) => <span className="text-xs text-text-tertiary">{row.createdAt ? format(new Date(row.createdAt), 'dd MMM yyyy') : '—'}</span>,
      },
      {
        header: 'Actions',
        render: (row: any) => (
          <div className="flex items-center gap-2">
            <button className="btn-secondary btn-sm" onClick={() => navigate(`/reviews/${row._id}/edit`)}>
              Edit
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
        title="Reviews"
        subtitle="Moderate package-specific customer reviews"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Reviews' }]}
        action={
          <button className="btn-primary" onClick={() => navigate('/reviews/new')}>
            <Plus className="h-4 w-4" /> Add Review
          </button>
        }
      />

      <div className="card flex flex-wrap items-center gap-3 p-4">
        <input
          className="input max-w-md"
          placeholder="Enter package ID to load reviews"
          value={packageId}
          onChange={(e) => {
            setPackageId(e.target.value)
            setPage(1)
          }}
        />
      </div>

      <DataTable
        columns={columns}
        data={reviews}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        keyExtractor={(row: any) => row._id}
        emptyMessage={packageId ? 'No reviews for this package' : 'Enter package ID to fetch reviews'}
      />

      <ConfirmDialog
        open={Boolean(deleteId)}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        title="Delete Review"
        message="This review will be permanently removed."
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  )
}

export default ReviewsPage
