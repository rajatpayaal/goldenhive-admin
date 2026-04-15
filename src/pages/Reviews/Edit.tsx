import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PageHeader, Spinner } from '../../components/ui'
import ReviewForm, { ReviewFormData } from './ReviewForm'
import { getReviewById, upsertReview } from './service'

const EditReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [item, setItem] = useState<any>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getReviewById(id)
      .then((res) => {
        const payload = res.data?.data || res.data
        setItem(payload)
      })
      .catch(() => {
        toast.error('Failed to load review')
        navigate('/reviews')
      })
      .finally(() => setLoading(false))
  }, [id, navigate])

  const defaultValues = useMemo<Partial<ReviewFormData>>(
    () => ({
      packageId: item?.packageId?._id || item?.packageId || '',
      userId: item?.userId?._id || item?.userId || '',
      rating: Number(item?.rating || 5),
      comment: item?.comment || '',
    }),
    [item]
  )

  const onSubmit = async (data: ReviewFormData) => {
    if (!data.packageId || !data.userId) {
      toast.error('Package ID and User ID are required')
      return
    }

    setSaving(true)
    try {
      await upsertReview({ packageId: data.packageId, userId: data.userId, rating: data.rating, comment: data.comment })
      toast.success('Review updated')
      navigate('/reviews')
    } catch {
      toast.error('Failed to save review')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader
          title="Edit Review"
          subtitle="Loading review details..."
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Reviews', href: '/reviews' }, { label: 'Edit' }]}
        />
        <div className="rounded-3xl border border-surface-border bg-surface-card p-8 text-center shadow-sm">
          <Spinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Edit Review"
        subtitle="Update rating and comment"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Reviews', href: '/reviews' }, { label: 'Edit' }]}
      />
      <div className="rounded-3xl border border-surface-border bg-surface-card p-4 shadow-sm">
        <ReviewForm defaultValues={defaultValues} saving={saving} onSubmit={onSubmit} />
      </div>
    </div>
  )
}

export default EditReviewPage
