import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { listChatbotFaqs, createChatbotFaq, updateChatbotFaq, deleteChatbotFaq } from '../services/adminPanel.service'
import Modal from '../components/ui/Modal'
import { PageHeader, Spinner, ConfirmDialog, Toggle } from '../components/ui'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, BotMessageSquare } from 'lucide-react'

type ChatbotFaqForm = {
  question: string
  answer: string
  keywords: string
  isActive: boolean
}

const ChatbotFAQsPage: React.FC = () => {
  const [faqs, setFaqs]             = useState<any[]>([])
  const [loading, setLoading]       = useState(true)
  const [expanded, setExpanded]     = useState<string | null>(null)
  const [modalOpen, setModalOpen]   = useState(false)
  const [editing, setEditing]       = useState<any>(null)
  const [saving, setSaving]         = useState(false)
  const [deleteId, setDeleteId]     = useState<string | null>(null)
  const [deleting, setDeleting]     = useState(false)

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ChatbotFaqForm>()

  const load = () => {
    setLoading(true)
    listChatbotFaqs().then(r => setFaqs(r.data?.data || r.data?.items || r.data || []))
      .finally(() => setLoading(false))
  }
  
  useEffect(() => { load() }, [])

  const openCreate = () => { 
    setEditing(null)
    reset({ question: '', answer: '', keywords: '', isActive: true })
    setModalOpen(true) 
  }
  
  const openEdit = (faq: any) => { 
    setEditing(faq)
    reset({ 
        question: faq.question, 
        answer: faq.answer, 
        keywords: (faq.keywords || []).join(', '),
        isActive: Boolean(faq.isActive ?? true)
    })
    setModalOpen(true) 
  }

  const onSubmit = async (data: ChatbotFaqForm) => {
    setSaving(true)
    try {
      const payload = {
          ...data,
          keywords: data.keywords ? data.keywords.split(',').map(s => s.trim()).filter(Boolean) : []
      }

      if (editing) { 
          await updateChatbotFaq(editing._id, payload)
          toast.success('Chatbot knowledge updated') 
      } else { 
          await createChatbotFaq(payload)
          toast.success('Chatbot knowledge created') 
      }
      setModalOpen(false)
      load()
    } catch { toast.error('Failed to save Chatbot knowledge') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try { 
        await deleteChatbotFaq(deleteId)
        toast.success('Chatbot knowledge deleted')
        setDeleteId(null)
        load() 
    }
    catch { toast.error('Failed to delete') }
    finally { setDeleting(false) }
  }

  const isActiveValue = watch('isActive')

  return (
    <div className="page">
      <PageHeader
        title="AI Chatbot Knowledge"
        subtitle="Train the automated AI chatbot on how to respond to users."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Chatbot FAQs' }]}
        action={<button className="btn-primary" onClick={openCreate}><Plus className="w-4 h-4" /> Add Logic</button>}
      />

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {faqs.length === 0 && (
            <div className="card p-10 text-center text-text-tertiary">
               <BotMessageSquare className="w-8 h-8 opacity-50 mx-auto mb-2" />
               No AI logic yet. Provide answers to frequently asked questions!
            </div>
          )}
          {faqs.map((faq) => (
            <div key={faq._id} className="card overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-surface-border/30 transition"
                onClick={() => setExpanded(expanded === faq._id ? null : faq._id)}
              >
                <div className="flex flex-col gap-1">
                   <span className="font-semibold text-sm text-text-primary flex items-center gap-2">
                      {faq.question}
                      {!faq.isActive && <span className="bg-danger-500/20 text-danger-500 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase">Disabled</span>}
                   </span>
                   {faq.keywords && faq.keywords.length > 0 && (
                      <div className="flex gap-1.5 mt-1">
                         {faq.keywords.map((kw: string, idx: number) => (
                            <span key={idx} className="bg-surface-border border border-surface-border text-text-tertiary px-1.5 py-0.5 rounded text-[10px] uppercase font-medium">{kw}</span>
                         ))}
                      </div>
                   )}
                </div>
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
                  <span className="font-bold text-brand-400 mr-2 text-xs">AI Response:</span> 
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit AI Response Logic' : 'Train AI Response Logic'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">User Question / Intent *</label>
            <input {...register('question', { required: 'Required' })} placeholder="e.g. How do I initiate a refund?" className={`input ${errors.question ? 'input-error' : ''}`} />
            {errors.question && <p className="text-danger-400 text-xs mt-1">{errors.question.message}</p>}
          </div>
          <div>
            <label className="label">Matching Triggers / Keywords</label>
            <input {...register('keywords')} placeholder="e.g. refund, money back, cancel" className="input text-sm" />
            <p className="text-[10px] text-text-tertiary mt-1 uppercase">Comma-separated triggers to help the AI map closely.</p>
          </div>
          <div>
            <label className="label">AI Answer *</label>
            <textarea {...register('answer', { required: 'Required' })} rows={4} placeholder="The AI will respond exactly with this string..." className={`input resize-none ${errors.answer ? 'input-error' : ''}`} />
          </div>
          
          <label className="flex items-center gap-3 cursor-pointer mt-4">
             <Toggle checked={isActiveValue} onChange={(v) => setValue('isActive', v)} />
             <span className="text-sm font-medium text-text-secondary">Logic is currently Active</span>
          </label>

          <div className="flex justify-end pt-4 border-t border-surface-border">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <Spinner size="sm" /> : 'Save AI Logic'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteId)}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        title="Delete AI Logic?"
        message="This rule will be completely erased from the AI chatbot's knowledge base."
        loading={deleting}
      />
    </div>
  )
}

export default ChatbotFAQsPage
