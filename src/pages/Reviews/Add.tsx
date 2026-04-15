import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PageHeader } from '../../components/ui'
import ReviewForm, { ReviewFormData } from './ReviewForm'
import { upsertReview } from './service'

const AddReviewPage: React.FC = () => {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)

  const onSubmit = async (data: ReviewFormData) => {
    if (!data.packageId || !data.userId) {
      toast.error('Package ID and User ID are required')
      return
    }

    setSaving(true)
    try {
      await upsertReview({ packageId: data.packageId, userId: data.userId, rating: data.rating, comment: data.comment })
      toast.success('Review created or updated')
      navigate('/reviews')
    } catch {
      toast.error('Failed to save review')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Add or Update Review"
        subtitle="Create a package review"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Reviews', href: '/reviews' }, { label: 'Create' }]}
      />
      <div className="rounded-3xl border border-surface-border bg-surface-card p-4 shadow-sm">
        <ReviewForm saving={saving} onSubmit={onSubmit} />
      </div>
    </div>
  )
}

export default AddReviewPage
