import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PageHeader } from '../../components/ui'
import PolicyForm from './PolicyForm'
import { createPolicy } from './service'

const AddPolicyPage: React.FC = () => {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)

  const onSubmit = async (payload: FormData) => {
    const title = String(payload.get('title') || '').trim()
    const type = String(payload.get('type') || '').trim()

    if (!title || !type) {
      toast.error('Type and title are required')
      return
    }

    setSaving(true)
    try {
      await createPolicy(payload)
      toast.success('Policy created')
      navigate('/policies')
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Failed to save policy')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Build Policy Document"
        subtitle="Create policy schema and sections"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Policies', href: '/policies' }, { label: 'Create' }]}
      />
      <div className="rounded-3xl border border-surface-border bg-surface-card p-4 shadow-sm">
        <PolicyForm saving={saving} submitLabel="Save Policy" onSubmit={onSubmit} />
      </div>
    </div>
  )
}

export default AddPolicyPage
