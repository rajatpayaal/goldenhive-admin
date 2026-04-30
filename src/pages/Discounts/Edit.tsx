import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PageHeader, Spinner } from '../../components/ui'
import DiscountForm, { DiscountFormData } from './DiscountForm'
import { getDiscountRuleById, updateDiscountRule } from './service'

const EditDiscountPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [item, setItem] = useState<any>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getDiscountRuleById(id)
      .then((res) => {
        const payload = res.data?.data || res.data
        setItem(payload)
      })
      .catch(() => {
        toast.error('Failed to load discount')
        navigate('/discounts')
      })
      .finally(() => setLoading(false))
  }, [id, navigate])

  const defaultValues = useMemo<Partial<DiscountFormData>>(() => {
    if (!item) return {}
    return {
      code: item.code || '',
      packageId: item.packageId || '',
      discountType: item.discountType || 'percent',
      value: Number(item.value || 0),
      minPax: Number(item.minPax || 1),
      startDate: item.startDate ? String(item.startDate).slice(0, 16) : '',
      endDate: item.endDate ? String(item.endDate).slice(0, 16) : '',
      isActive: Boolean(item.isActive ?? true),
    }
  }, [item])

  const onSubmit = async (data: DiscountFormData) => {
    if (!id) return
    if (!data.code) {
      toast.error('Discount code is required')
      return
    }

    setSaving(true)
    try {
      await updateDiscountRule(id, data)
      toast.success('Discount updated')
      navigate('/discounts')
    } catch {
      toast.error('Failed to save discount')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader
          title="Edit Discount"
          subtitle="Loading discount details..."
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Discounts', href: '/discounts' }, { label: 'Edit' }]}
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
        title="Edit Discount"
        subtitle="Update discount rule"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Discounts', href: '/discounts' }, { label: 'Edit' }]}
      />
      <div className="rounded-3xl border border-surface-border bg-surface-card p-4 shadow-sm">
        <DiscountForm defaultValues={defaultValues} saving={saving} onSubmit={onSubmit} />
      </div>
    </div>
  )
}

export default EditDiscountPage
