import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PageHeader, Spinner } from '../../components/ui'
import FAQForm, { FAQFormData } from './FAQForm'
import { fetchFaqById, updateFaq } from './service'

const EditFAQPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [item, setItem] = useState<any>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetchFaqById(id)
      .then((res) => {
        const payload = res.data?.data || res.data
        setItem(payload)
      })
      .catch(() => {
        toast.error('Failed to load FAQ')
        navigate('/faqs')
      })
      .finally(() => setLoading(false))
  }, [id, navigate])

  const defaultValues = useMemo<Partial<FAQFormData>>(
    () => ({ question: item?.question || '', answer: item?.answer || '' }),
    [item]
  )

  const onSubmit = async (data: FAQFormData) => {
    if (!id) return
    if (!data.question?.trim() || !data.answer?.trim()) {
      toast.error('Question and answer are required')
      return
    }

    setSaving(true)
    try {
      await updateFaq(id, data)
      toast.success('FAQ updated')
      navigate('/faqs')
    } catch {
      toast.error('Failed to save FAQ')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader title="Edit FAQ" subtitle="Loading FAQ details..." breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'FAQs', href: '/faqs' }, { label: 'Edit' }]} />
        <div className="rounded-3xl border border-surface-border bg-surface-card p-8 text-center shadow-sm">
          <Spinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader title="Edit FAQ" subtitle="Update question and answer" breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'FAQs', href: '/faqs' }, { label: 'Edit' }]} />
      <div className="rounded-3xl border border-surface-border bg-surface-card p-4 shadow-sm">
        <FAQForm defaultValues={defaultValues} saving={saving} onSubmit={onSubmit} />
      </div>
    </div>
  )
}

export default EditFAQPage
