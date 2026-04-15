import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import {
  fetchCategories, updateCategory, deleteCategory,
} from './service'
import DataTable from '../../components/ui/DataTable'
import StatusBadge from '../../components/ui/StatusBadge'
import { PageHeader, ConfirmDialog } from '../../components/ui'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const CategoriesPage: React.FC = () => {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading]       = useState(true)
  const [deleteId, setDeleteId]     = useState<string | null>(null)
  const [deleting, setDeleting]     = useState(false)

  const load = () => {
    setLoading(true)
    fetchCategories()
      .then((r) => {
        const payload = r.data?.data || r.data?.items || r.data || []
        setCategories(Array.isArray(payload) ? payload : payload?.items || [])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => load(), [])

  const handleToggle = async (cat: any) => {
    try {
      await updateCategory(cat._id, { ...cat, isActive: !cat.isActive })
      toast.success(`Category ${cat.isActive ? 'deactivated' : 'activated'}`)
      load()
    } catch {
      toast.error('Failed to toggle')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteCategory(deleteId)
      toast.success('Category deleted')
      setDeleteId(null)
      load()
    } catch {
      toast.error('Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    {
      header: 'Name',
      render: (r: any) => (
        <div>
          <p className="font-semibold text-text-primary">{r.name}</p>
          <p className="text-xs text-text-tertiary">/{r.slug}</p>
        </div>
      ),
    },
    { header: 'Sort', render: (r: any) => <span className="text-text-secondary">{r.sortOrder}</span> },
    {
      header: 'Status',
      render: (r: any) => <StatusBadge status={r.isActive ? 'ACTIVE' : 'INACTIVE'} type="package" />,
    },
    { header: 'Created', render: (r: any) => <span className="text-xs text-text-tertiary">{format(new Date(r.createdAt), 'dd MMM yy')}</span> },
    {
      header: 'Actions',
      render: (r: any) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleToggle(r)}
            title={r.isActive ? 'Deactivate' : 'Activate'}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border border-surface-border bg-surface-card text-text-secondary transition hover:bg-surface-hover ${r.isActive ? 'text-success-500 hover:text-success-400' : 'text-text-tertiary hover:text-text-secondary'}`}
          >
            {r.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
          </button>
          <button
            onClick={() => navigate(`/categories/${r._id}/edit`)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-surface-border bg-surface-card text-text-primary transition hover:bg-surface-hover"
          >
            <Pencil className="w-3 h-3" />
          </button>
          <button
            onClick={() => setDeleteId(r._id)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-danger-500 text-white transition hover:bg-danger-400"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Categories"
        subtitle="Organise your travel packages into categories"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Categories' }]}
        action={
          <button
            className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-400"
            onClick={() => navigate('/categories/new')}
          >
            <Plus className="w-4 h-4" /> New Category
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={categories}
        loading={loading}
        keyExtractor={(r: any) => r._id}
        emptyMessage="No categories yet. Create your first one!"
      />

      <ConfirmDialog
        open={Boolean(deleteId)}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        title="Delete Category?"
        message="All packages with this category will lose their category assignment."
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  )
}

export default CategoriesPage
