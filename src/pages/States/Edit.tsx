import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PageHeader, Spinner } from '../../components/ui'
import StateForm, { StateFormData } from './StateForm'
import { fetchStateById, updateState } from './service'

const EditStatePage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [item, setItem] = useState<any>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetchStateById(id)
      .then((res) => {
        const payload = res.data?.data || res.data
        setItem(payload)
      })
      .catch((e: any) => {
        toast.error(e.response?.data?.message || 'Failed to load state')
        navigate('/states')
      })
      .finally(() => setLoading(false))
  }, [id, navigate])

  const defaultValues = useMemo<Partial<StateFormData>>(
    () => ({
      name: item?.name || '',
      slug: item?.slug || '',
      countryId: item?.countryId?._id || item?.countryId || '',
      isActive: Boolean(item?.isActive ?? true),
    }),
    [item]
  )

  const onSubmit = async (data: StateFormData) => {
    if (!id) return
    if (!data.name?.trim()) {
      toast.error('Name required')
      return
    }
    if (!data.countryId) {
      toast.error('Parent Country Required')
      return
    }

    setSaving(true)
    try {
      await updateState(id, data)
      toast.success('State updated!')
      navigate('/states')
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader
          title="Edit State"
          subtitle="Loading state details..."
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'States', href: '/states' }, { label: 'Edit' }]}
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
        title="Edit State"
        subtitle="Update state information"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'States', href: '/states' }, { label: 'Edit' }]}
      />
      <div className="rounded-3xl border border-surface-border bg-surface-card p-4 shadow-sm">
        <StateForm defaultValues={defaultValues} saving={saving} onSubmit={onSubmit} />
      </div>
    </div>
  )
}

export default EditStatePage
