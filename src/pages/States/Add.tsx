import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PageHeader } from '../../components/ui'
import StateForm, { StateFormData } from './StateForm'
import { createState } from './service'

const AddStatePage: React.FC = () => {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)

  const onSubmit = async (data: StateFormData) => {
    if (!data.name?.trim()) {
      toast.error('Name required')
      return
    }
    if (!data.countryId) {
      toast.error('Parent Country Required')
      return
    }

    setSaving(true)
    try {
      await createState(data)
      toast.success('State created!')
      navigate('/states')
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Create State"
        subtitle="Add a new state"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'States', href: '/states' }, { label: 'Create' }]}
      />
      <div className="rounded-3xl border border-surface-border bg-surface-card p-4 shadow-sm">
        <StateForm saving={saving} onSubmit={onSubmit} />
      </div>
    </div>
  )
}

export default AddStatePage
