import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PageHeader, Spinner } from '../../components/ui'
import ChatbotFAQForm, { ChatbotFAQFormData } from './ChatbotFAQForm'
import { getChatbotFaqById, updateChatbotFaq } from './service'

const EditChatbotFAQPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [item, setItem] = useState<any>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getChatbotFaqById(id)
      .then((res) => {
        const payload = res.data?.data || res.data
        setItem(payload)
      })
      .catch(() => {
        toast.error('Failed to load chatbot FAQ')
        navigate('/chatbot')
      })
      .finally(() => setLoading(false))
  }, [id, navigate])

  const defaultValues = useMemo<Partial<ChatbotFAQFormData>>(
    () => ({
      question: item?.question || '',
      answer: item?.answer || '',
      keywords: (item?.keywords || []).join(', '),
      isActive: Boolean(item?.isActive ?? true),
    }),
    [item]
  )

  const onSubmit = async (data: ChatbotFAQFormData) => {
    if (!id) return
    if (!data.question?.trim() || !data.answer?.trim()) {
      toast.error('Question and answer are required')
      return
    }

    setSaving(true)
    try {
      await updateChatbotFaq(id, {
        ...data,
        keywords: data.keywords ? data.keywords.split(',').map((s) => s.trim()).filter(Boolean) : [],
      })
      toast.success('Chatbot knowledge updated')
      navigate('/chatbot')
    } catch {
      toast.error('Failed to save Chatbot knowledge')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader title="Edit AI Response Logic" subtitle="Loading chatbot rule..." breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Chatbot FAQs', href: '/chatbot' }, { label: 'Edit' }]} />
        <div className="rounded-3xl border border-surface-border bg-surface-card p-8 text-center shadow-sm">
          <Spinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader title="Edit AI Response Logic" subtitle="Update chatbot rule" breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Chatbot FAQs', href: '/chatbot' }, { label: 'Edit' }]} />
      <div className="rounded-3xl border border-surface-border bg-surface-card p-4 shadow-sm">
        <ChatbotFAQForm defaultValues={defaultValues} saving={saving} onSubmit={onSubmit} />
      </div>
    </div>
  )
}

export default EditChatbotFAQPage
