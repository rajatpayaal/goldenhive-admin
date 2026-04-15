import React, { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Plus, Star, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import DataTable from '../components/ui/DataTable'
import Modal from '../components/ui/Modal'
import { ConfirmDialog, PageHeader } from '../components/ui'
import { listPackageReviews, removeReview, upsertReview } from '../services/adminPanel.service'

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star key={s} className={`h-3.5 w-3.5 ${s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
    ))}
  </div>
)

const ReviewsPage: React.FC = () => {
  const [packageId, setPackageId] = useState('')
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)
  const [newUserId, setNewUserId] = useState('')
  const [newRating, setNewRating] = useState(5)
  const [newComment, setNewComment] = useState('')
  const [saving, setSaving] = useState(false)

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

  const submitReview = async () => {
    if (!packageId || !newUserId) {
      toast.error('Package ID and User ID are required')
      return
    }

    setSaving(true)
    try {
      await upsertReview({
        packageId,
        userId: newUserId,
        rating: newRating,
        comment: newComment,
      })
      toast.success('Review created or updated')
      setModalOpen(false)
      setNewComment('')
      setNewRating(5)
      setNewUserId('')
      load()
    } catch {
      toast.error('Failed to save review')
    } finally {
      setSaving(false)
    }
  }

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

  const columns = [
    {
      header: 'User',
      render: (row: any) => (
        <span className="font-medium text-slate-100">{row.userId?.firstName || ''} {row.userId?.lastName || ''}</span>
      ),
    },
    {
      header: 'Rating',
      render: (row: any) => <StarRating rating={Number(row.rating || 0)} />,
    },
    {
      header: 'Comment',
      render: (row: any) => <span className="line-clamp-2 text-sm text-slate-300">{row.comment || '—'}</span>,
    },
    {
      header: 'Created',
      render: (row: any) => <span className="text-xs text-slate-400">{row.createdAt ? format(new Date(row.createdAt), 'dd MMM yyyy') : '—'}</span>,
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
        title="Reviews"
        subtitle="Moderate package-specific customer reviews"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Reviews' }]}
        action={
          <button className="btn-primary" onClick={() => setModalOpen(true)}>
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

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add or Update Review"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={submitReview} disabled={saving}>Save Review</button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="label">Package ID</label>
            <input className="input" value={packageId} onChange={(e) => setPackageId(e.target.value)} />
          </div>
          <div>
            <label className="label">User ID</label>
            <input className="input" value={newUserId} onChange={(e) => setNewUserId(e.target.value)} />
          </div>
          <div>
            <label className="label">Rating</label>
            <input type="number" min={1} max={5} className="input" value={newRating} onChange={(e) => setNewRating(Number(e.target.value || 5))} />
          </div>
          <div>
            <label className="label">Comment</label>
            <textarea className="input resize-none" rows={4} value={newComment} onChange={(e) => setNewComment(e.target.value)} />
          </div>
        </div>
      </Modal>

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
