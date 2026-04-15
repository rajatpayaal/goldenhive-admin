import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PageHeader, Spinner } from '../../components/ui'
import CategoryForm, { CategoryFormData } from './CategoryForm'
import { fetchCategoryById, updateCategory } from './service'

const EditCategoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [defaultValues, setDefaultValues] = useState<Partial<CategoryFormData> | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetchCategoryById(id)
      .then((res) => {
        const payload = res.data?.data || res.data
        setDefaultValues(payload)
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || 'Failed to load category')
        navigate('/categories')
      })
      .finally(() => setLoading(false))
  }, [id, navigate])

  const handleSubmit = async (data: CategoryFormData) => {
    if (!id) return
    setSaving(true)
    try {
      await updateCategory(id, data)
      toast.success('Category updated successfully!')
      navigate('/categories')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update category')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader
          title="Edit Category"
          subtitle="Loading category data..."
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Categories', href: '/categories' }, { label: 'Edit' }]}
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
        title="Edit Category"
        subtitle="Update category details"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Categories', href: '/categories' }, { label: 'Edit' }]}
      />
      <div className="rounded-3xl border border-surface-border bg-surface-card p-4 shadow-sm">
        <CategoryForm
          defaultValues={defaultValues || undefined}
          onSubmit={handleSubmit}
          saving={saving}
        />
      </div>
    </div>
  )
}

export default EditCategoryPage
