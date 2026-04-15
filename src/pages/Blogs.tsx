import React, { useEffect, useState, useRef } from 'react'
import { format } from 'date-fns'
import { Pencil, Plus, Trash2, Upload, ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import DataTable from '../components/ui/DataTable'
import Modal from '../components/ui/Modal'
import { ConfirmDialog, PageHeader, Toggle, Spinner } from '../components/ui'
import { createBlog, deleteBlog, listBlogs, updateBlog } from '../services/adminPanel.service'

type BlogForm = {
  title: string
  author: string
  category: string
  readTime: string
  tags: string
  content: string
  bannerImageAlt: string
  isPublished: boolean
}

const defaultForm: BlogForm = {
  title: '',
  author: 'Goldenhive',
  category: 'Travel Guide',
  readTime: '5 min',
  tags: '',
  content: '',
  bannerImageAlt: '',
  isPublished: true,
}

const BlogsPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState<BlogForm>(defaultForm)
  const [saving, setSaving] = useState(false)

  // Image Upload state
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const imageRef = useRef<HTMLInputElement>(null)

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

  const openCreate = () => {
    setEditing(null)
    setForm(defaultForm)
    setImageFile(null)
    setPreviewUrl('')
    setModalOpen(true)
  }

  const openEdit = (item: any) => {
    setEditing(item)
    // Extract first TextBody section content if it exists
    const firstSection = item.sections?.find((s: any) => s.type === 'TextBody')
    const extractedContent = firstSection?.content || item.content || ''
    
    setForm({
      title: item.title || '',
      author: item.author || 'Goldenhive',
      category: item.category || 'Travel Guide',
      readTime: item.readTime || '5 min',
      tags: item.tags?.join(', ') || '',
      content: extractedContent,
      bannerImageAlt: item.bannerImage?.altText || '',
      isPublished: Boolean(item.isPublished ?? item.isActive ?? false),
    })
    
    setImageFile(null)
    setPreviewUrl(item.bannerImage?.url || '')
    setModalOpen(true)
  }

  const onSave = async () => {
    if (!form.title || !form.content) {
      toast.error('Title and content are required')
      return
    }
    
    if (!editing && !imageFile && !previewUrl) {
      toast.error('A banner image is required')
      return
    }

    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('title', form.title)
      fd.append('author', form.author)
      fd.append('category', form.category)
      fd.append('readTime', form.readTime)
      fd.append('isPublished', form.isPublished ? 'true' : 'false')
      
      if (form.tags) {
        fd.append('tags', form.tags)
      }

      // Metadata for banner
      if (form.bannerImageAlt) {
        fd.append('bannerImage', JSON.stringify({ altText: form.bannerImageAlt, isVisible: true }))
      }

      // Automatically construct the dynamic sections array for the CMS backend
      const sectionsPayload = [
        {
          title: '',
          content: form.content,
          type: 'TextBody',
          isVisible: true,
          order: 1,
        }
      ]
      fd.append('sections', JSON.stringify(sectionsPayload))

      if (imageFile) {
        fd.append('bannerImageFile', imageFile)
      }

      if (editing?._id) {
        await updateBlog(editing._id, fd)
        toast.success('Blog updated')
      } else {
        await createBlog(fd)
        toast.success('Blog created')
      }
      setModalOpen(false)
      load()
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Failed to save blog')
    } finally {
      setSaving(false)
    }
  }

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

  const columns = [
    {
      header: 'Blog Post',
      render: (row: any) => (
        <div className="flex items-center gap-3">
          {row.bannerImage?.url ? (
            <img src={row.bannerImage.url} alt={row.title} className="w-12 h-10 object-cover rounded shadow border border-white/10" />
          ) : (
            <div className="w-12 h-10 bg-white/5 rounded flex flex-col items-center justify-center">
              <ImageIcon className="w-4 h-4 text-text-tertiary" />
            </div>
          )}
          <div>
            <p className="font-semibold text-text-primary line-clamp-1 max-w-[300px]">{row.title || 'Untitled'}</p>
            <p className="text-[11px] text-text-secondary capitalize">{row.category} • {row.author}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Views',
      render: (row: any) => <span className="font-medium text-text-secondary">{row.views || 0}</span>
    },
    {
      header: 'Status',
      render: (row: any) => (
        <span className={`px-2 py-1 text-[10px] tracking-wider uppercase font-bold rounded-md ${!row.isPublished ? 'bg-warning-500/10 text-warning-500' : 'bg-success-500/10 text-success-400'}`}>
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
          <button className="btn-secondary btn-sm" onClick={() => openEdit(row)}>
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button className="btn-danger btn-sm" onClick={() => setDeleteId(row._id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="page">
      <PageHeader
        title="Blogs"
        subtitle="Publish and manage rich editorial content"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Blogs' }]}
        action={
          <button className="btn-primary" onClick={openCreate}>
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

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Blog' : 'Create Blog'}
        size="2xl"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={onSave} disabled={saving}>
              {saving ? <Spinner size="sm" /> : 'Save Blog'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          
          <div className="border border-white/10 rounded-xl p-4 bg-black/20 text-center cursor-pointer hover:border-brand-500/50 transition-colors"
             onClick={() => imageRef.current?.click()}
          >
            {imageFile || previewUrl ? (
              <img 
                src={imageFile ? URL.createObjectURL(imageFile) : previewUrl} 
                alt="Banner preview" 
                className="w-full h-40 object-cover rounded-lg"
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-slate-400">
                <Upload className="w-8 h-8 mb-2 opacity-50" />
                <span className="text-sm font-medium">Click to upload banner image</span>
                <span className="text-xs mt-1 opacity-70">Recommended: 1200x600 JPG or PNG</span>
              </div>
            )}
            <input
              ref={imageRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) setImageFile(e.target.files[0])
              }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Blog Title *</label>
              <input 
                className="input" 
                placeholder="e.g. 5 Hidden Gems in Kerala"
                value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} 
              />
            </div>
            
            <div>
              <label className="label">Author</label>
              <input className="input" value={form.author} onChange={(e) => setForm((p) => ({ ...p, author: e.target.value }))} />
            </div>

            <div>
              <label className="label">Category</label>
              <input className="input" placeholder="e.g. Travel Guide" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} />
            </div>

            <div>
              <label className="label">Tags (comma separated)</label>
              <input className="input" placeholder="luxury, beaches, relax" value={form.tags} onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))} />
            </div>

            <div>
              <label className="label">Read Time</label>
              <input className="input" placeholder="e.g. 5 min" value={form.readTime} onChange={(e) => setForm((p) => ({ ...p, readTime: e.target.value }))} />
            </div>
          </div>

          <div>
            <label className="label">Blog Content (TextBody Section) *</label>
            <textarea 
              className="input resize-y min-h-[150px]" 
              placeholder="Write your blog content here..."
              value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))} 
            />
          </div>

          <div className="pt-2 border-t border-surface-border mt-2">
            <label className="flex items-center gap-3 cursor-pointer w-fit">
              <Toggle checked={form.isPublished} onChange={(v) => setForm(pf => ({ ...pf, isPublished: v }))} />
              <span className="text-sm font-medium text-slate-200">Publish immediately</span>
            </label>
            <p className="text-xs text-slate-500 mt-1 ml-14">Drafts will not appear on the website until published.</p>
          </div>

        </div>
      </Modal>

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
