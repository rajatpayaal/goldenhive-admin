import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PageHeader } from '../../components/ui'
import FooterForm from './FooterForm'
import { createFooter } from './service'
import { fetchCategories, fetchPackages } from '../../services/api.service'

const AddFooterCMSPage: React.FC = () => {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [packages, setPackages] = useState<any[]>([])

  useEffect(() => {
    Promise.all([fetchCategories(), fetchPackages({ limit: 500 })])
      .then(([catRes, pkgRes]) => {
        const catData = catRes.data?.data || catRes.data
        const pkgData = pkgRes.data?.data || pkgRes.data
        setCategories(catData?.items || catData || [])
        setPackages(pkgData?.items || pkgData || [])
      })
      .catch(() => toast.error('Failed to load categories/packages'))
  }, [])

  const onSubmit = async (payload: FormData) => {
    const languageCode = String(payload.get('languageCode') || '').trim()
    const regionCode = String(payload.get('regionCode') || '').trim()

    if (!languageCode || !regionCode) {
      toast.error('Language and region are required')
      return
    }

    setSaving(true)
    try {
      await createFooter(payload)
      toast.success('Footer created')
      navigate('/footer')
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Failed to save footer')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="New Configuration"
        subtitle="Create footer locale profile"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Footer CMS', href: '/footer' }, { label: 'Create' }]}
      />
      <div className="rounded-3xl border border-surface-border bg-surface-card p-4 shadow-sm">
        <FooterForm categories={categories} packages={packages} saving={saving} submitLabel="Save Profile" onSubmit={onSubmit} />
      </div>
    </div>
  )
}

export default AddFooterCMSPage
