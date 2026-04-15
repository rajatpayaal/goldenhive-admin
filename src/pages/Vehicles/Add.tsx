import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PageHeader } from '../../components/ui'
import VehicleForm, { VehicleFormData } from './VehicleForm'
import { createVehicle } from './service'

const AddVehiclePage: React.FC = () => {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)

  const onSubmit = async (data: VehicleFormData, imageFile: File | null) => {
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

      await createVehicle(fd)
      toast.success('Vehicle created')
      navigate('/vehicles')
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Validation Failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Create Vehicle"
        subtitle="Add a new transport vehicle"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Vehicles', href: '/vehicles' }, { label: 'Create' }]}
      />
      <div className="rounded-3xl border border-surface-border bg-surface-card p-4 shadow-sm">
        <VehicleForm saving={saving} onSubmit={onSubmit} />
      </div>
    </div>
  )
}

export default AddVehiclePage
