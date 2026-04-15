import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PageHeader } from '../../components/ui'
import PackageForm, { PackageFormData, buildPackageFormData } from './PackageForm'
import { createPackage } from './service'

const AddPackagePage: React.FC = () => {
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (data: PackageFormData, primaryImage?: File, gallery?: File[]) => {
    setSaving(true)
    try {
      const formData = buildPackageFormData(data, primaryImage, gallery)
      await createPackage(formData)
      toast.success('Package created successfully!')
      navigate('/packages')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create package')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Create Package"
        subtitle="Add a new travel package to the system"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Packages', href: '/packages' }, { label: 'Create' }]}
      />
      <div className="rounded-3xl border border-surface-border bg-surface-card p-4 shadow-sm">
        <PackageForm onSubmit={handleSubmit} saving={saving} />
      </div>
    </div>
  )
}

export default AddPackagePage
