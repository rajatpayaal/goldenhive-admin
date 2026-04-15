import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PageHeader } from '../../components/ui'
import DiscountForm, { DiscountFormData } from './DiscountForm'
import { createDiscountRule } from './service'

const AddDiscountPage: React.FC = () => {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)

  const onSubmit = async (data: DiscountFormData) => {
    if (!data.code) {
      toast.error('Discount code is required')
      return
    }

    setSaving(true)
    try {
      await createDiscountRule(data)
      toast.success('Discount created')
      navigate('/discounts')
    } catch {
      toast.error('Failed to save discount')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Create Discount"
        subtitle="Create a new discount rule"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Discounts', href: '/discounts' }, { label: 'Create' }]}
      />
      <div className="rounded-3xl border border-surface-border bg-surface-card p-4 shadow-sm">
        <DiscountForm saving={saving} onSubmit={onSubmit} />
      </div>
    </div>
  )
}

export default AddDiscountPage
