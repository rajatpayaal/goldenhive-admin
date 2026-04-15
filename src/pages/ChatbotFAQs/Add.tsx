import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PageHeader } from '../../components/ui'
import ChatbotFAQForm, { ChatbotFAQFormData } from './ChatbotFAQForm'
import { createChatbotFaq } from './service'

const AddChatbotFAQPage: React.FC = () => {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)

  const onSubmit = async (data: ChatbotFAQFormData) => {
    if (!data.question?.trim() || !data.answer?.trim()) {
      toast.error('Question and answer are required')
      return
    }

    setSaving(true)
    try {
      await createChatbotFaq({
        ...data,
        keywords: data.keywords ? data.keywords.split(',').map((s) => s.trim()).filter(Boolean) : [],
      })
      toast.success('Chatbot knowledge created')
      navigate('/chatbot')
    } catch {
      toast.error('Failed to save Chatbot knowledge')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Train AI Response Logic"
        subtitle="Create a new chatbot rule"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Chatbot FAQs', href: '/chatbot' }, { label: 'Create' }]}
      />
      <div className="rounded-3xl border border-surface-border bg-surface-card p-4 shadow-sm">
        <ChatbotFAQForm saving={saving} onSubmit={onSubmit} />
      </div>
    </div>
  )
}

export default AddChatbotFAQPage
