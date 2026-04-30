import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PageHeader, Spinner } from '../../components/ui'
import PackageForm, { PackageFormData, buildPackageFormData, mapPackageToForm } from './PackageForm'
import { fetchPackageById, updatePackage } from './service'

const EditPackagePage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [defaultValues, setDefaultValues] = useState<Partial<PackageFormData> | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetchPackageById(id)
      .then((res) => {
        const payload = res.data?.data || res.data
        setDefaultValues(mapPackageToForm(payload))
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || 'Failed to load package')
        navigate('/packages')
      })
      .finally(() => setLoading(false))
  }, [id, navigate])

  const handleSubmit = async (data: PackageFormData, primaryImage?: File, gallery?: File[], existingGallery?: any[]) => {
    if (!id) return
    setSaving(true)
    try {
      const formData = buildPackageFormData(data, primaryImage, gallery, existingGallery)
      await updatePackage(id, formData)
      toast.success('Package updated successfully!')
      navigate('/packages')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update package')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader
          title="Edit Package"
          subtitle="Loading package details..."
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Packages', href: '/packages' }, { label: 'Edit' }]}
        />
        <div className="rounded-3xl border border-surface-border bg-surface-card p-4 text-center shadow-sm">
          <Spinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Edit Package"
        subtitle="Update the package details"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Packages', href: '/packages' }, { label: 'Edit' }]}
      />
      <div className="rounded-3xl border border-surface-border bg-surface-card p-4 shadow-sm">
        <PackageForm
          defaultValues={defaultValues || undefined}
          onSubmit={handleSubmit}
          saving={saving}
        />
      </div>
    </div>
  )
}

export default EditPackagePage
