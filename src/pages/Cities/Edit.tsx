import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PageHeader, Spinner } from '../../components/ui'
import CityForm, { CityFormData } from './CityForm'
import { fetchCityById, updateCity } from './service'

const EditCityPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [item, setItem] = useState<any>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetchCityById(id)
      .then((res) => {
        const payload = res.data?.data || res.data
        setItem(payload)
      })
      .catch((e: any) => {
        toast.error(e.response?.data?.message || 'Failed to load city')
        navigate('/cities')
      })
      .finally(() => setLoading(false))
  }, [id, navigate])

  const defaultValues = useMemo<Partial<CityFormData>>(
    () => ({
      name: item?.name || '',
      slug: item?.slug || '',
      stateId: item?.stateId?._id || item?.stateId || '',
      isActive: Boolean(item?.isActive ?? true),
    }),
    [item]
  )

  const onSubmit = async (data: CityFormData) => {
    if (!id) return
    if (!data.name?.trim()) {
      toast.error('Name required')
      return
    }
    if (!data.stateId) {
      toast.error('Parent State Required')
      return
    }

    setSaving(true)
    try {
      await updateCity(id, data)
      toast.success('City updated!')
      navigate('/cities')
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
          title="Edit City"
          subtitle="Loading city details..."
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Cities', href: '/cities' }, { label: 'Edit' }]}
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
        title="Edit City"
        subtitle="Update city information"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Cities', href: '/cities' }, { label: 'Edit' }]}
      />
      <div className="rounded-3xl border border-surface-border bg-surface-card p-4 shadow-sm">
        <CityForm defaultValues={defaultValues} saving={saving} onSubmit={onSubmit} />
      </div>
    </div>
  )
}

export default EditCityPage
