import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PageHeader } from '../../components/ui'
import CategoryForm, { CategoryFormData } from './CategoryForm'
import { createCategory } from './service'

const AddCategoryPage: React.FC = () => {
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (data: CategoryFormData) => {
    setSaving(true)
    try {
      await createCategory(data)
      toast.success('Category created successfully!')
      navigate('/categories')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create category')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Create Category"
        subtitle="Add a new package category"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Categories', href: '/categories' }, { label: 'Create' }]}
      />
      <div className="rounded-3xl border border-surface-border bg-surface-card p-4 shadow-sm">
        <CategoryForm onSubmit={handleSubmit} saving={saving} />
      </div>
    </div>
  )
}

export default AddCategoryPage
