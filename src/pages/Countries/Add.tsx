import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PageHeader } from '../../components/ui'
import CountryForm, { CountryFormData } from './CountryForm'
import { createCountry } from './service'

const AddCountryPage: React.FC = () => {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)

  const onSubmit = async (data: CountryFormData) => {
    if (!data.name?.trim()) {
      toast.error('Name required')
      return
    }

    setSaving(true)
    try {
      await createCountry(data)
      toast.success('Country created!')
      navigate('/countries')
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Create Country"
        subtitle="Add a new country"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Countries', href: '/countries' }, { label: 'Create' }]}
      />
      <div className="rounded-3xl border border-surface-border bg-surface-card p-4 shadow-sm">
        <CountryForm saving={saving} onSubmit={onSubmit} />
      </div>
    </div>
  )
}

export default AddCountryPage
