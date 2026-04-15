import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PageHeader, Spinner } from '../../components/ui'
import AboutUsForm from './AboutUsForm'
import { getAboutUsById, updateAboutUs } from './service'

const EditAboutUsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [item, setItem] = useState<any>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getAboutUsById(id)
      .then((res) => {
        const payload = res.data?.data || res.data
        setItem(payload)
      })
      .catch(() => {
        toast.error('Failed to load About Us data')
        navigate('/about-us')
      })
      .finally(() => setLoading(false))
  }, [id, navigate])

  const onSubmit = async (payload: FormData) => {
    if (!id) return
    setSaving(true)
    try {
      await updateAboutUs(id, payload)
      toast.success('About Us data committed')
      navigate('/about-us')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader
          title="Edit About Us"
          subtitle="Loading content schema..."
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'About Us', href: '/about-us' }, { label: 'Edit' }]}
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
        title="Edit About Us"
        subtitle="Update the singleton About Us schema"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'About Us', href: '/about-us' }, { label: 'Edit' }]}
      />
      <div className="rounded-3xl border border-surface-border bg-surface-card p-4 shadow-sm">
        <AboutUsForm defaultValues={item || {}} saving={saving} submitLabel="Serialize Logic to Backend" onSubmit={onSubmit} />
      </div>
    </div>
  )
}

export default EditAboutUsPage
