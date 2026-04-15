import React, { useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import DataTable from '../../components/ui/DataTable'
import { ConfirmDialog, PageHeader } from '../../components/ui'
import { deleteFooter, listFooters } from './service'

const FooterCMSPage: React.FC = () => {
  const navigate = useNavigate()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = () => {
    setLoading(true)
    listFooters()
      .then((response) => {
        const payload = response.data?.data || response.data
        setItems(payload?.items || payload || [])
      })
      .catch(() => toast.error('Failed to load footer records'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const remove = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteFooter(deleteId)
      toast.success('Footer deleted')
      setDeleteId(null)
      load()
    } catch {
      toast.error('Failed to delete footer')
    } finally {
      setDeleting(false)
    }
  }

  const columns = useMemo(
    () => [
      {
        header: 'Locale Configuration',
        render: (row: any) => (
          <div>
            <p className="flex items-center gap-2 font-semibold text-text-primary">
              <span className="font-bold uppercase tracking-widest text-brand-400">{row.languageCode}</span>
              <span className="text-text-tertiary">/</span>
              <span className="uppercase">{row.regionCode}</span>
            </p>
            <p className="mt-0.5 line-clamp-1 text-xs text-text-tertiary">{row.branding?.description || 'No branding description'}</p>
          </div>
        ),
      },
      {
        header: 'Link Data',
        render: (row: any) => (
          <div className="flex flex-col gap-1 text-xs text-text-secondary">
            <span>{row.footerColumns?.length || 0} Columns</span>
            <span>{row.seoLinkTabs?.length || 0} SEO Tabs</span>
          </div>
        ),
      },
      {
        header: 'Status',
        render: (row: any) => (
          <span className={`badge ${row.isActive === false ? 'badge-warning' : 'badge-success'}`}>
            {row.isActive === false ? 'INACTIVE' : 'ACTIVE'}
          </span>
        ),
      },
      {
        header: 'Actions',
        render: (row: any) => (
          <div className="flex items-center gap-2">
            <button className="btn-secondary btn-sm" onClick={() => navigate(`/footer/${row._id}/edit`)}>
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button className="btn-danger btn-sm" onClick={() => setDeleteId(row._id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ),
      },
    ],
    [navigate]
  )

  return (
    <div className="page">
      <PageHeader
        title="Footer Configuration"
        subtitle="Manage deeply nested footer arrays and locale settings"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Footer CMS' }]}
        action={
          <button className="btn-primary" onClick={() => navigate('/footer/new')}>
            <Plus className="h-4 w-4" /> New Footer Profile
          </button>
        }
      />

      <DataTable columns={columns} data={items} loading={loading} keyExtractor={(row: any) => row._id} emptyMessage="No footer profiles found" />

      <ConfirmDialog
        open={Boolean(deleteId)}
        onCancel={() => setDeleteId(null)}
        onConfirm={remove}
        title="Delete Footer"
        message="This footer profile will be removed."
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  )
}

export default FooterCMSPage
