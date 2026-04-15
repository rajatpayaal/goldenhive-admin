import React, { useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ConfirmDialog, PageHeader } from '../../components/ui'
import { deleteFaq, fetchFaqs } from './service'

const FAQsPage: React.FC = () => {
  const navigate = useNavigate()
  const [faqs, setFaqs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = () => {
    setLoading(true)
    fetchFaqs()
      .then((r) => setFaqs(r.data?.data || r.data?.items || r.data || []))
      .catch(() => toast.error('Failed to load FAQs'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteFaq(deleteId)
      toast.success('FAQ deleted')
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
      return <div className="card p-10 text-center text-text-tertiary">No FAQs yet. Add your first one!</div>
    }

    return (
      <div className="space-y-3">
        {faqs.map((faq) => (
          <div key={faq._id} className="card overflow-hidden">
            <button className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-surface-border/30" onClick={() => setExpanded(expanded === faq._id ? null : faq._id)}>
              <span className="text-sm font-semibold text-text-primary">{faq.question}</span>
              <div className="ml-4 flex shrink-0 items-center gap-2">
                <button onClick={(e) => { e.stopPropagation(); navigate(`/faqs/${faq._id}/edit`) }} className="btn-ghost btn-icon btn-sm">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); setDeleteId(faq._id) }} className="btn-ghost btn-icon btn-sm text-danger-400">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                {expanded === faq._id ? <ChevronUp className="h-4 w-4 text-text-tertiary" /> : <ChevronDown className="h-4 w-4 text-text-tertiary" />}
              </div>
            </button>
            {expanded === faq._id && <div className="border-t border-surface-border px-5 pb-4 pt-3 text-sm text-text-tertiary">{faq.answer}</div>}
          </div>
        ))}
      </div>
    )
  }, [expanded, faqs, loading, navigate])

  return (
    <div className="page">
      <PageHeader
        title="FAQs"
        subtitle="Manage frequently asked questions"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'FAQs' }]}
        action={<button className="btn-primary" onClick={() => navigate('/faqs/new')}><Plus className="h-4 w-4" /> Add FAQ</button>}
      />

      {content}

      <ConfirmDialog
        open={Boolean(deleteId)}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        title="Delete FAQ?"
        message="This FAQ will be permanently deleted."
        loading={deleting}
      />
    </div>
  )
}

export default FAQsPage
