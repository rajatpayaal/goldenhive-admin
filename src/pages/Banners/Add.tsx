import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PageHeader } from '../../components/ui'
import BannerForm, { BannerFormData } from './BannerForm'
import { createBanner } from './service'

const AddBannerPage: React.FC = () => {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)

  const onSubmit = async (data: BannerFormData, imageFile: File | null) => {
    if (!data.title) {
      toast.error('Title is required')
      return
    }
    if (!imageFile) {
      toast.error('Banner image is required')
      return
    }

    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('title', data.title)
      fd.append('redirectType', data.redirectUrl)
      fd.append('sortOrder', String(data.sortOrder))
      fd.append('isActive', String(data.isActive))
      fd.append('image', imageFile)

      await createBanner(fd as any)
      toast.success('Banner created')
      navigate('/banners')
    } catch {
      toast.error('Failed to save banner')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Create Banner"
        subtitle="Add a fresh campaign banner"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Banners', href: '/banners' }, { label: 'Create' }]}
      />
      <div className="rounded-3xl border border-surface-border bg-surface-card p-4 shadow-sm">
        <BannerForm saving={saving} onSubmit={onSubmit} />
      </div>
    </div>
  )
}

export default AddBannerPage
