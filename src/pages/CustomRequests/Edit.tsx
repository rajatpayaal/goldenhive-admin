import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PageHeader, Spinner } from '../../components/ui'
import CustomRequestForm, { CustomRequestFormData } from './CustomRequestForm'
import { getCustomRequestById, updateCustomRequest } from './service'

const EditCustomRequestPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [item, setItem] = useState<any>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getCustomRequestById(id)
      .then((res) => {
        const payload = res.data?.data || res.data
        setItem(payload)
      })
      .catch(() => {
        toast.error('Failed to load request')
        navigate('/custom-requests')
      })
      .finally(() => setLoading(false))
  }, [id, navigate])

  const defaultValues = useMemo<Partial<CustomRequestFormData>>(
    () => ({
      status: item?.status || 'PENDING',
      adminNote: item?.adminNote || '',
    }),
    [item]
  )

  const onSubmit = async (data: CustomRequestFormData) => {
    if (!id) return
    setSaving(true)
    try {
      await updateCustomRequest(id, { status: data.status, adminNote: data.adminNote })
      toast.success('Request updated')
      navigate('/custom-requests')
    } catch {
      toast.error('Failed to update request')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader title="Custom Request" subtitle="Loading request details..." breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Custom Requests', href: '/custom-requests' }, { label: 'Edit' }]} />
        <div className="rounded-3xl border border-surface-border bg-surface-card p-8 text-center shadow-sm">
          <Spinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Custom Request"
        subtitle={item?.name ? `${item.name} • ${item.email || 'No email'}` : 'Update request status'}
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Custom Requests', href: '/custom-requests' }, { label: 'Edit' }]}
      />
      <div className="rounded-3xl border border-surface-border bg-surface-card p-4 shadow-sm">
        <div className="mb-4 rounded-xl border border-surface-border bg-surface-card p-4 text-sm text-text-secondary">
          {item?.message || item?.requirement || 'No request description'}
        </div>
        <CustomRequestForm defaultValues={defaultValues} saving={saving} onSubmit={onSubmit} />
      </div>
    </div>
  )
}

export default EditCustomRequestPage
