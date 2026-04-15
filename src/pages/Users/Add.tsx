import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PageHeader } from '../../components/ui'
import UserForm from './UserForm'
import { createUserRecord, UserFormData } from './service'

const AddUserPage: React.FC = () => {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)

  const onSubmit = async (form: UserFormData) => {
    if (!form.firstName || !form.lastName || !form.email || !form.userName) {
      toast.error('Please fill required fields')
      return
    }

    if (!form.password) {
      toast.error('Password is required for new user')
      return
    }

    setSaving(true)
    try {
      await createUserRecord(form)
      toast.success('User registration initiated. OTP verification required.')
      navigate('/users')
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Unable to save user')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Create User"
        subtitle="Create a new user account and access role"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Users', href: '/users' }, { label: 'Create' }]}
      />
      <div className="rounded-3xl border border-surface-border bg-surface-card p-4 shadow-sm">
        <UserForm mode="create" saving={saving} onSubmit={onSubmit} />
      </div>
    </div>
  )
}

export default AddUserPage
