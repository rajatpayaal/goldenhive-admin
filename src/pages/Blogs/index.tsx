import React, { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { ImageIcon, Pencil, Plus, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import DataTable from '../../components/ui/DataTable'
import { ConfirmDialog, PageHeader } from '../../components/ui'
import { deleteBlog, listBlogs } from './service'

const BlogsPage: React.FC = () => {
  const navigate = useNavigate()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = () => {
    setLoading(true)
    listBlogs({ page, limit: 15 })
      .then((response) => {
        const payload = response.data?.data || response.data
        setItems(payload?.items || payload || [])
        setTotalPages(payload?.totalPages || 1)
      })
      .catch(() => toast.error('Failed to load blogs'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [page])

  const onDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteBlog(deleteId)
      toast.success('Blog deleted')
      setDeleteId(null)
      load()
    } catch {
      toast.error('Failed to delete blog')
    } finally {
      setDeleting(false)
    }
  }

  const columns = useMemo(
    () => [
      {
        header: 'Blog Post',
        render: (row: any) => (
          <div className="flex items-center gap-3">
            {row.bannerImage?.url ? (
              <img src={row.bannerImage.url} alt={row.title} className="h-10 w-12 rounded border border-surface-border object-cover shadow" />
            ) : (
              <div className="flex h-10 w-12 flex-col items-center justify-center rounded bg-surface-hover">
                <ImageIcon className="h-4 w-4 text-text-tertiary" />
              </div>
            )}
            <div>
              <p className="line-clamp-1 max-w-[300px] font-semibold text-text-primary">{row.title || 'Untitled'}</p>
              <p className="text-[11px] capitalize text-text-secondary">
                {row.category} • {row.userId ? `${row.userId.firstName || ''} ${row.userId.lastName || ''}`.trim() || row.userId.email : row.author}
              </p>
            </div>
          </div>
        ),
      },
      {
        header: 'Views',
        render: (row: any) => <span className="font-medium text-text-secondary">{row.views || 0}</span>,
      },
      {
        header: 'Status',
        render: (row: any) => (
          <span className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${!row.isPublished ? 'bg-warning-500/10 text-warning-500' : 'bg-success-500/10 text-success-400'}`}>
            {!row.isPublished ? 'Draft' : 'Published'}
          </span>
        ),
      },
      {
        header: 'Date',
        render: (row: any) => (
          <span className="text-xs text-text-secondary">
            {row.publishedAt ? format(new Date(row.publishedAt), 'dd MMM yyyy') : (row.createdAt ? format(new Date(row.createdAt), 'dd MMM yyyy') : '—')}
          </span>
        ),
      },
      {
        header: 'Actions',
        render: (row: any) => (
          <div className="flex items-center gap-2">
            <button className="btn-secondary btn-sm" onClick={() => navigate(`/blogs/${row._id}/edit`)}>
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
        title="Blogs"
        subtitle="Publish and manage rich editorial content"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Blogs' }]}
        action={
          <button className="btn-primary" onClick={() => navigate('/blogs/new')}>
            <Plus className="h-4 w-4" /> New Blog
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        keyExtractor={(row: any) => row._id}
        emptyMessage="No blogs yet"
      />

      <ConfirmDialog
        open={Boolean(deleteId)}
        onCancel={() => setDeleteId(null)}
        onConfirm={onDelete}
        title="Delete Blog"
        message="This blog post will be permanently removed."
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  )
}

export default BlogsPage
