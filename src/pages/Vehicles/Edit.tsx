import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PageHeader, Spinner } from '../../components/ui'
import VehicleForm, { VehicleFormData } from './VehicleForm'
import { fetchVehicleById, updateVehicle } from './service'

const EditVehiclePage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [item, setItem] = useState<any>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetchVehicleById(id)
      .then((res) => {
        const payload = res.data?.data || res.data
        setItem(payload)
      })
      .catch(() => {
        toast.error('Failed to load vehicle')
        navigate('/vehicles')
      })
      .finally(() => setLoading(false))
  }, [id, navigate])

  const defaultValues = useMemo<Partial<VehicleFormData>>(
    () => ({
      name: item?.name || '',
      seat: item?.seat || 4,
      type: item?.type || '',
      sortOrder: item?.sortOrder || 1,
      imageAlt: item?.image?.alt || '',
      imageTitle: item?.image?.title || '',
      isActive: Boolean(item?.isActive ?? true),
      imageUrl: item?.image?.url || '',
    }),
    [item]
  )

  const onSubmit = async (data: VehicleFormData, imageFile: File | null) => {
    if (!id) return
    if (!data.name || !data.seat) {
      toast.error('Please fill required fields (Name, Seats)')
      return
    }

    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('name', data.name)
      fd.append('seat', String(data.seat))
      fd.append('type', data.type)
      fd.append('sortOrder', String(data.sortOrder))
      fd.append('imageAlt', data.imageAlt)
      fd.append('imageTitle', data.imageTitle)
      fd.append('isActive', data.isActive ? 'true' : 'false')
      if (imageFile) fd.append('image', imageFile)

      await updateVehicle(id, fd)
      toast.success('Vehicle updated')
      navigate('/vehicles')
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Validation Failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader title="Edit Vehicle" subtitle="Loading vehicle details..." breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Vehicles', href: '/vehicles' }, { label: 'Edit' }]} />
        <div className="rounded-3xl border border-surface-border bg-surface-card p-8 text-center shadow-sm">
          <Spinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader title="Edit Vehicle" subtitle="Update transport vehicle" breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Vehicles', href: '/vehicles' }, { label: 'Edit' }]} />
      <div className="rounded-3xl border border-surface-border bg-surface-card p-4 shadow-sm">
        <VehicleForm defaultValues={defaultValues} saving={saving} onSubmit={onSubmit} />
      </div>
    </div>
  )
}

export default EditVehiclePage
