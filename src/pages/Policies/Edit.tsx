import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PageHeader, Spinner } from '../../components/ui'
import PolicyForm, { PolicyFormData } from './PolicyForm'
import { getPolicyById, updatePolicy } from './service'

const EditPolicyPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [item, setItem] = useState<any>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getPolicyById(id)
      .then((res) => {
        const payload = res.data?.data || res.data
        setItem(payload)
      })
      .catch((err: any) => {
        toast.error(err.response?.data?.message || 'Failed to load policy')
        navigate('/policies')
      })
      .finally(() => setLoading(false))
  }, [id, navigate])

  const defaultValues = useMemo<Partial<PolicyFormData>>(() => {
    if (!item) return {}
    return {
      type: item.type || 'TERMS_AND_CONDITIONS',
      title: item.title || '',
      slug: item.slug || '',
      content: item.content || '',
      footerEmail: item.footer?.email || '',
      footerPhone: item.footer?.phone || '',
      footerAddress: item.footer?.address || '',
      seoMetaTitle: item.seo?.metaTitle || '',
      seoMetaDescription: item.seo?.metaDescription || '',
      seoKeywords: item.seo?.keywords?.join(', ') || '',
      isActive: Boolean(item.isActive ?? true),
      sections: (item.sections || []).map((sec: any) => ({
        title: sec.title || '',
        description: sec.description || '',
        points: sec.points?.join(',\n') || '',
        _previewUrl: sec.imageUrl || '',
      })),
    }
  }, [item])

  const onSubmit = async (payload: FormData) => {
    if (!id) return
    const title = String(payload.get('title') || '').trim()
    const type = String(payload.get('type') || '').trim()

    if (!title || !type) {
      toast.error('Type and title are required')
      return
    }

    setSaving(true)
    try {
      await updatePolicy(id, payload)
      toast.success('Policy updated')
      navigate('/policies')
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Failed to save policy')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader
          title="Edit Policy"
          subtitle="Loading policy details..."
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Policies', href: '/policies' }, { label: 'Edit' }]}
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
        title="Edit Policy Data"
        subtitle="Update policy content and sections"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Policies', href: '/policies' }, { label: 'Edit' }]}
      />
      <div className="rounded-3xl border border-surface-border bg-surface-card p-4 shadow-sm">
        <PolicyForm defaultValues={defaultValues} saving={saving} submitLabel="Save Policy" onSubmit={onSubmit} />
      </div>
    </div>
  )
}

export default EditPolicyPage
