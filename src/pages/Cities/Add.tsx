import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PageHeader } from '../../components/ui'
import CityForm, { CityFormData } from './CityForm'
import { createCity } from './service'

const AddCityPage: React.FC = () => {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)

  const onSubmit = async (data: CityFormData) => {
    if (!data.name?.trim()) {
      toast.error('Name required')
      return
    }
    if (!data.stateId) {
      toast.error('Parent State Required')
      return
    }

    setSaving(true)
    try {
      await createCity(data)
      toast.success('City created!')
      navigate('/cities')
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Create City"
        subtitle="Add a new city"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Cities', href: '/cities' }, { label: 'Create' }]}
      />
      <div className="rounded-3xl border border-surface-border bg-surface-card p-4 shadow-sm">
        <CityForm saving={saving} onSubmit={onSubmit} />
      </div>
    </div>
  )
}

export default AddCityPage
