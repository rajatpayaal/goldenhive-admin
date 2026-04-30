import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PageHeader } from '../../components/ui'
import BlogForm, { BlogFormData } from './BlogForm'
import { createBlog } from './service'

const AddBlogPage: React.FC = () => {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)

  const onSubmit = async (
    data: BlogFormData,
    bannerFile: File | null,
    ogFile: File | null,
    sectionFiles: { index: number; file: File }[]
  ) => {
    if (!data.title || !data.slug) {
      toast.error('Title and Slug are required')
      return
    }
    if (!bannerFile && !data.bannerImageUrl) {
      toast.error('A banner image is required')
      return
    }

    setSaving(true)
    try {
      const fd = new FormData()

      // Basic Information
      fd.append('title', data.title)
      fd.append('slug', data.slug)
      fd.append('author', data.author)
      fd.append('category', data.category)
      fd.append('readTime', data.readTime)
      if (data.tags) {
        // Assume backend accepts JSON array or comma separated string.
        // If it needs a JSON array of tags:
        const tagsArray = data.tags.split(',').map((t) => t.trim()).filter(Boolean)
        fd.append('tags', JSON.stringify(tagsArray))
      }

      // Banner Image
      fd.append(
        'bannerImage',
        JSON.stringify({
          altText: data.bannerImageAlt,
          isVisible: data.bannerImageIsVisible,
          type: data.bannerImageType,
          caption: data.bannerImageCaption,
        })
      )

      // Sections
      const sanitizedSections = data.sections.map((sec) => ({
        ...sec,
        media: sec.media.map((m) => {
          const { file, ...rest } = m
          return rest
        }),
      }))
      fd.append('sections', JSON.stringify(sanitizedSections))

      // FAQs
      if (data.faqId && data.faqId.length > 0) {
        fd.append('faqId', JSON.stringify(data.faqId))
      }

      // SEO
      fd.append(
        'seo',
        JSON.stringify({
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
          keywords: data.keywords.split(',').map((k) => k.trim()).filter(Boolean),
          youtubeUrl: data.youtubeUrl,
          ogImage: data.ogImageUrl || '',
        })
      )

      // Visibility
      fd.append(
        'visibility',
        JSON.stringify({
          banner: data.visibilityBanner,
          sections: data.visibilitySections,
          faq: data.visibilityFaq,
          seo: data.visibilitySeo,
        })
      )

      // Publishing
      fd.append('isPublished', data.isPublished ? 'true' : 'false')
      if (data.publishedAt) {
        fd.append('publishedAt', new Date(data.publishedAt).toISOString())
      }

      // Legacy/Flat visibility fields if backend needs them based on postman payload
      fd.append('bannerImageIsVisible', data.bannerImageIsVisible ? 'true' : 'false')
      fd.append('visibilityBanner', data.visibilityBanner ? 'true' : 'false')
      fd.append('visibilitySections', data.visibilitySections ? 'true' : 'false')
      fd.append('visibilityFaq', data.visibilityFaq ? 'true' : 'false')
      fd.append('visibilitySeo', data.visibilitySeo ? 'true' : 'false')
      if (data.ogImageUrl) fd.append('ogImage', data.ogImageUrl)
      if (data.youtubeUrl) fd.append('youtubeUrl', data.youtubeUrl)

      // Files
      if (bannerFile) fd.append('bannerImageFile', bannerFile)
      if (ogFile) fd.append('ogImageFile', ogFile)
      sectionFiles.forEach((sf) => {
        // Appending sectionMedia multiple times creates an array of files in multipart data
        fd.append('sectionMedia', sf.file)
      })

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
      <BlogForm saving={saving} onSubmit={onSubmit} />
    </div>
  )
}

export default AddBlogPage
