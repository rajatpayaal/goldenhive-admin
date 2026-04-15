import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PageHeader } from '../../components/ui'
import AboutUsForm from './AboutUsForm'
import { createAboutUs } from './service'

const AddAboutUsPage: React.FC = () => {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)

  const onSubmit = async (payload: FormData) => {
    setSaving(true)
    try {
      await createAboutUs(payload)
      toast.success('About Us data committed')
      navigate('/about-us')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Create About Us"
        subtitle="Build singleton About Us content"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'About Us', href: '/about-us' }, { label: 'Create' }]}
      />
      <div className="rounded-3xl border border-surface-border bg-surface-card p-4 shadow-sm">
        <AboutUsForm saving={saving} submitLabel="Serialize Logic to Backend" onSubmit={onSubmit} />
      </div>
    </div>
  )
}

export default AddAboutUsPage
