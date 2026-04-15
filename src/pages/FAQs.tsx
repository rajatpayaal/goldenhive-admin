import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { fetchFaqs, createFaq, updateFaq, deleteFaq } from '../services/api.service'
import Modal from '../components/ui/Modal'
import { PageHeader, Spinner, ConfirmDialog } from '../components/ui'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react'

const FAQsPage: React.FC = () => {
  const [faqs, setFaqs]             = useState<any[]>([])
  const [loading, setLoading]       = useState(true)
  const [expanded, setExpanded]     = useState<string | null>(null)
  const [modalOpen, setModalOpen]   = useState(false)
  const [editing, setEditing]       = useState<any>(null)
  const [saving, setSaving]         = useState(false)
  const [deleteId, setDeleteId]     = useState<string | null>(null)
  const [deleting, setDeleting]     = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<{ question: string; answer: string }>()

  const load = () => {
    setLoading(true)
    fetchFaqs().then(r => setFaqs(r.data?.data || r.data?.items || r.data || []))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); reset({ question: '', answer: '' }); setModalOpen(true) }
  const openEdit   = (faq: any) => { setEditing(faq); reset({ question: faq.question, answer: faq.answer }); setModalOpen(true) }

  const onSubmit = async (data: { question: string; answer: string }) => {
    setSaving(true)
    try {
      if (editing) { await updateFaq(editing._id, data); toast.success('FAQ updated') }
      else          { await createFaq(data); toast.success('FAQ created') }
      setModalOpen(false); load()
    } catch { toast.error('Failed to save FAQ') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try { await deleteFaq(deleteId); toast.success('FAQ deleted'); setDeleteId(null); load() }
    catch { toast.error('Failed to delete') }
    finally { setDeleting(false) }
  }

  return (
    <div className="page">
      <PageHeader
        title="FAQs"
        subtitle="Manage frequently asked questions"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'FAQs' }]}
        action={<button className="btn-primary" onClick={openCreate}><Plus className="w-4 h-4" /> Add FAQ</button>}
      />

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {faqs.length === 0 && (
            <div className="card p-10 text-center text-text-tertiary">No FAQs yet. Add your first one!</div>
          )}
          {faqs.map((faq) => (
            <div key={faq._id} className="card overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-surface-border/30 transition"
                onClick={() => setExpanded(expanded === faq._id ? null : faq._id)}
              >
                <span className="font-semibold text-sm text-text-primary">{faq.question}</span>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <button onClick={(e) => { e.stopPropagation(); openEdit(faq) }} className="btn-ghost btn-icon btn-sm">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setDeleteId(faq._id) }} className="btn-ghost btn-icon btn-sm text-danger-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  {expanded === faq._id ? <ChevronUp className="w-4 h-4 text-text-tertiary" /> : <ChevronDown className="w-4 h-4 text-text-tertiary" />}
                </div>
              </button>
              {expanded === faq._id && (
                <div className="px-5 pb-4 text-sm text-text-tertiary border-t border-surface-border pt-3">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit FAQ' : 'Add FAQ'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Question *</label>
            <input {...register('question', { required: 'Required' })} className={`input ${errors.question ? 'input-error' : ''}`} />
            {errors.question && <p className="text-danger-400 text-xs mt-1">{errors.question.message}</p>}
          </div>
          <div>
            <label className="label">Answer *</label>
            <textarea {...register('answer', { required: 'Required' })} rows={4} className={`input resize-none ${errors.answer ? 'input-error' : ''}`} />
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <Spinner size="sm" /> : 'Save FAQ'}
            </button>
          </div>
        </form>
      </Modal>

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
