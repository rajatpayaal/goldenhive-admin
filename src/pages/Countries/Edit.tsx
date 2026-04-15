import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PageHeader, Spinner } from '../../components/ui'
import CountryForm, { CountryFormData } from './CountryForm'
import { fetchCountryById, updateCountry } from './service'

const EditCountryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [item, setItem] = useState<any>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetchCountryById(id)
      .then((res) => {
        const payload = res.data?.data || res.data
        setItem(payload)
      })
      .catch((e: any) => {
        toast.error(e.response?.data?.message || 'Failed to load country')
        navigate('/countries')
      })
      .finally(() => setLoading(false))
  }, [id, navigate])

  const defaultValues = useMemo<Partial<CountryFormData>>(
    () => ({
      name: item?.name || '',
      slug: item?.slug || '',
      isActive: Boolean(item?.isActive ?? true),
    }),
    [item]
  )

  const onSubmit = async (data: CountryFormData) => {
    if (!id) return
    if (!data.name?.trim()) {
      toast.error('Name required')
      return
    }

    setSaving(true)
    try {
      await updateCountry(id, data)
      toast.success('Country updated!')
      navigate('/countries')
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
          title="Edit Country"
          subtitle="Loading country details..."
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Countries', href: '/countries' }, { label: 'Edit' }]}
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
        title="Edit Country"
        subtitle="Update country information"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Countries', href: '/countries' }, { label: 'Edit' }]}
      />
      <div className="rounded-3xl border border-surface-border bg-surface-card p-4 shadow-sm">
        <CountryForm defaultValues={defaultValues} saving={saving} onSubmit={onSubmit} />
      </div>
    </div>
  )
}

export default EditCountryPage
