import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PageHeader } from '../../components/ui'
import FAQForm, { FAQFormData } from './FAQForm'
import { createFaq } from './service'

const AddFAQPage: React.FC = () => {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)

  const onSubmit = async (data: FAQFormData) => {
    if (!data.question?.trim() || !data.answer?.trim()) {
      toast.error('Question and answer are required')
      return
    }

    setSaving(true)
    try {
      await createFaq(data)
      toast.success('FAQ created')
      navigate('/faqs')
    } catch {
      toast.error('Failed to save FAQ')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Add FAQ"
        subtitle="Create a frequently asked question"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'FAQs', href: '/faqs' }, { label: 'Create' }]}
      />
      <div className="rounded-3xl border border-surface-border bg-surface-card p-4 shadow-sm">
        <FAQForm saving={saving} onSubmit={onSubmit} />
      </div>
    </div>
  )
}

export default AddFAQPage
