import React, { useEffect, useMemo, useState } from 'react'
import { BotMessageSquare, ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ConfirmDialog, PageHeader } from '../../components/ui'
import { deleteChatbotFaq, listChatbotFaqs } from './service'

const ChatbotFAQsPage: React.FC = () => {
  const navigate = useNavigate()
  const [faqs, setFaqs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = () => {
    setLoading(true)
    listChatbotFaqs()
      .then((r) => setFaqs(r.data?.data || r.data?.items || r.data || []))
      .catch(() => toast.error('Failed to load chatbot knowledge'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteChatbotFaq(deleteId)
      toast.success('Chatbot knowledge deleted')
      setDeleteId(null)
      load()
    } catch {
      toast.error('Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  const content = useMemo(() => {
    if (loading) {
      return (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
        </div>
      )
    }

    if (faqs.length === 0) {
      return (
        <div className="card p-10 text-center text-text-tertiary">
          <BotMessageSquare className="mx-auto mb-2 h-8 w-8 opacity-50" />
          No AI logic yet. Provide answers to frequently asked questions!
        </div>
      )
    }

    return (
      <div className="space-y-3">
        {faqs.map((faq) => (
          <div key={faq._id} className="card overflow-hidden">
            <button className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-surface-border/30" onClick={() => setExpanded(expanded === faq._id ? null : faq._id)}>
              <div className="flex flex-col gap-1">
                <span className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                  {faq.question}
                  {!faq.isActive && <span className="rounded bg-danger-500/20 px-1.5 py-0.5 text-[10px] font-bold uppercase text-danger-500">Disabled</span>}
                </span>
                {faq.keywords && faq.keywords.length > 0 && (
                  <div className="mt-1 flex gap-1.5">
                    {faq.keywords.map((kw: string, idx: number) => (
                      <span key={idx} className="rounded border border-surface-border bg-surface-border px-1.5 py-0.5 text-[10px] font-medium uppercase text-text-tertiary">{kw}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="ml-4 flex shrink-0 items-center gap-2">
                <button onClick={(e) => { e.stopPropagation(); navigate(`/chatbot/${faq._id}/edit`) }} className="btn-ghost btn-icon btn-sm">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); setDeleteId(faq._id) }} className="btn-ghost btn-icon btn-sm text-danger-400">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                {expanded === faq._id ? <ChevronUp className="h-4 w-4 text-text-tertiary" /> : <ChevronDown className="h-4 w-4 text-text-tertiary" />}
              </div>
            </button>
            {expanded === faq._id && (
              <div className="border-t border-surface-border px-5 pb-4 pt-3 text-sm text-text-tertiary">
                <span className="mr-2 text-xs font-bold text-brand-400">AI Response:</span>
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }, [expanded, faqs, loading, navigate])

  return (
    <div className="page">
      <PageHeader
        title="AI Chatbot Knowledge"
        subtitle="Train the automated AI chatbot on how to respond to users."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Chatbot FAQs' }]}
        action={<button className="btn-primary" onClick={() => navigate('/chatbot/new')}><Plus className="h-4 w-4" /> Add Logic</button>}
      />

      {content}

      <ConfirmDialog
        open={Boolean(deleteId)}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        title="Delete AI Logic?"
        message="This rule will be completely erased from the AI chatbot knowledge base."
        loading={deleting}
      />
    </div>
  )
}

export default ChatbotFAQsPage
