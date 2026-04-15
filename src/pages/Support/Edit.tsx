import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PageHeader, Spinner } from '../../components/ui'
import SupportForm, { SupportFormData } from './SupportForm'
import { getSupportTicketById, listUsers, updateSupportTicket } from './service'

const EditSupportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [ticket, setTicket] = useState<any>(null)
  const [agents, setAgents] = useState<any[]>([])

  useEffect(() => {
    listUsers({ limit: 200 })
      .then((resp) => {
        const data = resp.data?.data?.items || resp.data?.items || resp.data || []
        setAgents(data.filter((u: any) => ['ADMIN', 'SALES_AGENT'].includes(String(u.role).toUpperCase())))
      })
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getSupportTicketById(id)
      .then((res) => {
        const payload = res.data?.data || res.data
        setTicket(payload)
      })
      .catch((e: any) => {
        toast.error(e.response?.data?.message || 'Failed to load ticket')
        navigate('/support')
      })
      .finally(() => setLoading(false))
  }, [id, navigate])

  const defaultValues = useMemo<Partial<SupportFormData>>(
    () => ({
      status: ticket?.status || 'OPEN',
      priority: ticket?.priority || 'LOW',
      assignedTo: ticket?.assignedTo || '',
    }),
    [ticket]
  )

  const onSubmit = async (data: SupportFormData) => {
    if (!id) return
    setSaving(true)
    try {
      await updateSupportTicket(id, { status: data.status, priority: data.priority, assignedTo: data.assignedTo || null })
      toast.success('Ticket updated')
      navigate('/support')
    } catch {
      toast.error('Failed to update ticket')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader title="Support Ticket" subtitle="Loading ticket details..." breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Support', href: '/support' }, { label: 'Edit' }]} />
        <div className="rounded-3xl border border-surface-border bg-surface-card p-8 text-center shadow-sm">
          <Spinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Support Ticket"
        subtitle={ticket?.subject || 'Update support ticket details'}
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Support', href: '/support' }, { label: 'Edit' }]}
      />
      <div className="rounded-3xl border border-surface-border bg-surface-card p-4 shadow-sm">
        <div className="mb-4 rounded-xl border border-surface-border bg-surface-card p-3 text-sm text-text-secondary">
          {ticket?.message || 'No message'}
        </div>
        <SupportForm defaultValues={defaultValues} agents={agents} saving={saving} onSubmit={onSubmit} />
      </div>
    </div>
  )
}

export default EditSupportPage
