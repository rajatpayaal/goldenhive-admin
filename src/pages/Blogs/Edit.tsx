import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PageHeader, Spinner } from '../../components/ui'
import BlogForm, { BlogFormData } from './BlogForm'
import { getBlogById, updateBlog } from './service'

const EditBlogPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [blog, setBlog] = useState<any>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getBlogById(id)
      .then((res) => {
        const payload = res.data?.data || res.data
        setBlog(payload)
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || 'Failed to load blog')
        navigate('/blogs')
      })
      .finally(() => setLoading(false))
  }, [id, navigate])

  const defaultValues = useMemo<Partial<BlogFormData>>(() => {
    if (!blog) return {}
    const firstSection = blog.sections?.find((s: any) => s.type === 'TextBody')
    return {
      title: blog.title || '',
      author: blog.author || 'Goldenhive',
      category: blog.category || 'Travel Guide',
      readTime: blog.readTime || '5 min',
      tags: blog.tags?.join(', ') || '',
      content: firstSection?.content || blog.content || '',
      bannerImageAlt: blog.bannerImage?.altText || '',
      isPublished: Boolean(blog.isPublished ?? blog.isActive ?? false),
      bannerImageUrl: blog.bannerImage?.url || '',
    }
  }, [blog])

  const onSubmit = async (data: BlogFormData, imageFile: File | null) => {
    if (!id) return
    if (!data.title || !data.content) {
      toast.error('Title and content are required')
      return
    }

    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('title', data.title)
      fd.append('author', data.author)
      fd.append('category', data.category)
      fd.append('readTime', data.readTime)
      fd.append('isPublished', data.isPublished ? 'true' : 'false')
      if (data.tags) fd.append('tags', data.tags)
      if (data.bannerImageAlt) {
        fd.append('bannerImage', JSON.stringify({ altText: data.bannerImageAlt, isVisible: true }))
      }

      const sectionsPayload = [
        { title: '', content: data.content, type: 'TextBody', isVisible: true, order: 1 },
      ]
      fd.append('sections', JSON.stringify(sectionsPayload))
      if (imageFile) fd.append('bannerImageFile', imageFile)

      await updateBlog(id, fd)
      toast.success('Blog updated')
      navigate('/blogs')
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Failed to save blog')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader
          title="Edit Blog"
          subtitle="Loading blog details..."
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Blogs', href: '/blogs' }, { label: 'Edit' }]}
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
        title="Edit Blog"
        subtitle="Update blog details"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Blogs', href: '/blogs' }, { label: 'Edit' }]}
      />
      <div className="rounded-3xl border border-surface-border bg-surface-card p-4 shadow-sm">
        <BlogForm defaultValues={defaultValues} saving={saving} onSubmit={onSubmit} />
      </div>
    </div>
  )
}

export default EditBlogPage
