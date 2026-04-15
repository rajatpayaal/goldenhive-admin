import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PageHeader, Spinner } from '../../components/ui'
import UserForm from './UserForm'
import { getUserById, updateUserRecord, UserFormData } from './service'

const EditUserPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [item, setItem] = useState<any>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getUserById(id)
      .then((res) => {
        const payload = res.data?.data || res.data
        setItem(payload)
      })
      .catch(() => {
        toast.error('Failed to load user')
        navigate('/users')
      })
      .finally(() => setLoading(false))
  }, [id, navigate])

  const defaultValues = useMemo<Partial<UserFormData>>(
    () => ({
      firstName: item?.firstName || '',
      lastName: item?.lastName || '',
      userName: item?.userName || '',
      email: item?.email || '',
      mobile: item?.mobile || '',
      role: item?.role || 'USER',
      isBlocked: Boolean(item?.isBlocked),
      isVerified: Boolean(item?.isVerified ?? true),
      password: '',
    }),
    [item]
  )

  const onSubmit = async (form: UserFormData) => {
    if (!id) return
    if (!form.firstName || !form.lastName || !form.email || !form.userName) {
      toast.error('Please fill required fields')
      return
    }

    setSaving(true)
    try {
      await updateUserRecord(id, {
        firstName: form.firstName,
        lastName: form.lastName,
        userName: form.userName,
        email: form.email,
        mobile: form.mobile,
        role: form.role,
        isBlocked: Boolean(form.isBlocked),
        isVerified: Boolean(form.isVerified),
      })
      toast.success('User updated')
      navigate('/users')
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Unable to save user')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader
          title="Edit User"
          subtitle="Loading user details..."
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Users', href: '/users' }, { label: 'Edit' }]}
        />
        <div className="rounded-3xl border border-surface-border bg-surface-card p-8 text-center shadow-sm">
          <Spinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Edit User"
        subtitle="Update user account and access settings"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Users', href: '/users' }, { label: 'Edit' }]}
      />
      <div className="rounded-3xl border border-surface-border bg-surface-card p-4 shadow-sm">
        <UserForm mode="edit" defaultValues={defaultValues} saving={saving} onSubmit={onSubmit} />
      </div>
    </div>
  )
}

export default EditUserPage
