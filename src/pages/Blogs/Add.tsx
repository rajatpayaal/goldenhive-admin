import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PageHeader } from '../../components/ui'
import BlogForm, { BlogFormData } from './BlogForm'
import { createBlog } from './service'

const AddBlogPage: React.FC = () => {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)

  const onSubmit = async (data: BlogFormData, imageFile: File | null) => {
    if (!data.title || !data.content) {
      toast.error('Title and content are required')
      return
    }
    if (!imageFile) {
      toast.error('A banner image is required')
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
      fd.append('bannerImageFile', imageFile)

      await createBlog(fd)
      toast.success('Blog created')
      navigate('/blogs')
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Failed to save blog')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Create Blog"
        subtitle="Create a new editorial article"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Blogs', href: '/blogs' }, { label: 'Create' }]}
      />
      <div className="rounded-3xl border border-surface-border bg-surface-card p-4 shadow-sm">
        <BlogForm saving={saving} onSubmit={onSubmit} />
      </div>
    </div>
  )
}

export default AddBlogPage
