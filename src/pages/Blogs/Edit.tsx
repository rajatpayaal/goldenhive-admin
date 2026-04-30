import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PageHeader, Spinner } from '../../components/ui'
import BlogForm, { BlogFormData, defaultFormData } from './BlogForm'
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
    
    // Parse tags to string
    let tagsStr = ''
    if (Array.isArray(blog.tags)) {
      tagsStr = blog.tags.join(', ')
    } else if (typeof blog.tags === 'string') {
      tagsStr = blog.tags
    }

    // Parse Keywords to string
    let keywordsStr = ''
    if (blog.seo?.keywords && Array.isArray(blog.seo.keywords)) {
      keywordsStr = blog.seo.keywords.join(', ')
    } else if (typeof blog.seo?.keywords === 'string') {
      keywordsStr = blog.seo.keywords
    }

    let publishedAtStr = defaultFormData.publishedAt
    if (blog.publishedAt) {
      try {
        publishedAtStr = new Date(blog.publishedAt).toISOString().slice(0, 16)
      } catch (e) {
        console.error(e)
      }
    }

    return {
      title: blog.title || '',
      slug: blog.slug || '',
      author: blog.author || 'GoldenHive Team',
      category: blog.category || 'Travel',
      readTime: blog.readTime || '5 min',
      tags: tagsStr,
      
      bannerImageAlt: blog.bannerImage?.altText || '',
      bannerImageCaption: blog.bannerImage?.caption || '',
      bannerImageIsVisible: blog.bannerImage?.isVisible ?? true,
      bannerImageType: blog.bannerImage?.type || 'image',
      bannerImageUrl: blog.bannerImage?.url || '',

      metaTitle: blog.seo?.metaTitle || '',
      metaDescription: blog.seo?.metaDescription || '',
      keywords: keywordsStr,
      ogImageUrl: blog.seo?.ogImage || blog.ogImage || '',
      youtubeUrl: blog.seo?.youtubeUrl || blog.youtubeUrl || '',

      visibilityBanner: blog.visibility?.banner ?? blog.visibilityBanner ?? true,
      visibilitySections: blog.visibility?.sections ?? blog.visibilitySections ?? true,
      visibilityFaq: blog.visibility?.faq ?? blog.visibilityFaq ?? true,
      visibilitySeo: blog.visibility?.seo ?? blog.visibilitySeo ?? true,

      isPublished: Boolean(blog.isPublished ?? blog.isActive ?? false),
      publishedAt: publishedAtStr,

      sections: Array.isArray(blog.sections) ? blog.sections.map((s: any) => ({
        ...s,
        media: Array.isArray(s.media) ? s.media.map((m: any) => ({ ...m })) : []
      })) : [],

      faqId: Array.isArray(blog.faqId) ? blog.faqId : []
    }
  }, [blog])

  const onSubmit = async (
    data: BlogFormData,
    bannerFile: File | null,
    ogFile: File | null,
    sectionFiles: { index: number; file: File }[]
  ) => {
    if (!id) return
    if (!data.title || !data.slug) {
      toast.error('Title and Slug are required')
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
          url: data.bannerImageUrl,
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

      // Legacy/Flat visibility fields
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
        fd.append('sectionMedia', sf.file)
      })

      await updateBlog(id, fd)
      toast.success('Blog updated')
      navigate('/blogs')
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Failed to update blog')
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
      <BlogForm defaultValues={defaultValues} saving={saving} onSubmit={onSubmit} />
    </div>
  )
}

export default EditBlogPage
