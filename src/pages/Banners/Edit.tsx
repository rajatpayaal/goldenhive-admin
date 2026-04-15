import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PageHeader, Spinner } from '../../components/ui'
import BannerForm, { BannerFormData } from './BannerForm'
import { getBannerById, updateBanner } from './service'

const EditBannerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [banner, setBanner] = useState<any>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getBannerById(id)
      .then((res) => {
        const payload = res.data?.data || res.data
        setBanner(payload)
      })
      .catch(() => {
        toast.error('Failed to load banner')
        navigate('/banners')
      })
      .finally(() => setLoading(false))
  }, [id, navigate])

  const defaultValues = useMemo<Partial<BannerFormData>>(() => {
    if (!banner) return {}
    return {
      title: banner.title || '',
      imageUrl: banner.imageUrl || banner.image || '',
      redirectUrl: banner.redirectType || banner.redirectUrl || '',
      sortOrder: Number(banner.sortOrder || 1),
      isActive: Boolean(banner.isActive ?? true),
    }
  }, [banner])

  const onSubmit = async (data: BannerFormData, imageFile: File | null) => {
    if (!id) return
    if (!data.title) {
      toast.error('Title is required')
      return
    }

    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('title', data.title)
      fd.append('redirectType', data.redirectUrl)
      fd.append('sortOrder', String(data.sortOrder))
      fd.append('isActive', String(data.isActive))
      if (imageFile) fd.append('image', imageFile)

      await updateBanner(id, fd as any)
      toast.success('Banner updated')
      navigate('/banners')
    } catch {
      toast.error('Failed to save banner')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader
          title="Edit Banner"
          subtitle="Loading banner details..."
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Banners', href: '/banners' }, { label: 'Edit' }]}
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
        title="Edit Banner"
        subtitle="Update campaign banner details"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Banners', href: '/banners' }, { label: 'Edit' }]}
      />
      <div className="rounded-3xl border border-surface-border bg-surface-card p-4 shadow-sm">
        <BannerForm defaultValues={defaultValues} saving={saving} onSubmit={onSubmit} />
      </div>
    </div>
  )
}

export default EditBannerPage
