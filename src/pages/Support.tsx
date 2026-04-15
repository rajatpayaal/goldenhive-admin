import React, { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Eye, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import DataTable from '../components/ui/DataTable'
import Modal from '../components/ui/Modal'
import { ConfirmDialog, PageHeader } from '../components/ui'
import { deleteSupportTicket, listSupportTickets, updateSupportTicket } from '../services/adminPanel.service'

type Ticket = {
  _id: string
  userId?: string
  name?: string
  phone?: string
  subject?: string
  message?: string
  status?: 'OPEN' | 'IN_PROGRESS' | 'CLOSED'
  priority?: 'LOW' | 'MEDIUM' | 'HIGH'
  assignedTo?: string | null
  createdAt?: string
}

const SupportPage: React.FC = () => {
  const [items, setItems] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')

  const [selected, setSelected] = useState<Ticket | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [status, setStatus] = useState<Ticket['status']>('OPEN')
  const [priority, setPriority] = useState<Ticket['priority']>('LOW')
  const [assignedTo, setAssignedTo] = useState<string>('')
  const [saving, setSaving] = useState(false)
  
  const [agents, setAgents] = useState<any[]>([])

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = () => {
    setLoading(true)
    listSupportTickets({ status: statusFilter || undefined, priority: priorityFilter || undefined, limit: 50 })
      .then((response) => {
        const payload = response.data?.data || response.data
        setItems(payload?.items || payload || [])
      })
      .catch(() => toast.error('Failed to load support tickets'))
      .finally(() => setLoading(false))
  }

  const loadAgents = async () => {
     try {
       const resp = await import('../services/adminPanel.service').then(m => m.listUsers({ limit: 200 }))
       const data = resp.data?.data?.items || resp.data?.items || resp.data || []
       setAgents(data.filter((u: any) => ['ADMIN', 'SALES_AGENT'].includes(String(u.role).toUpperCase())))
     } catch {}
  }

  useEffect(() => {
    load()
    loadAgents()
  }, [statusFilter, priorityFilter])

  const openView = (item: Ticket) => {
    setSelected(item)
    setStatus(item.status || 'OPEN')
    setPriority(item.priority || 'LOW')
    setAssignedTo(item.assignedTo || '')
    setModalOpen(true)
  }

  const save = async () => {
    if (!selected) return
    setSaving(true)
    try {
      await updateSupportTicket(selected._id, { 
         status, 
         priority, 
         assignedTo: assignedTo || null
      })
      toast.success('Ticket updated')
      setModalOpen(false)
      load()
    } catch {
      toast.error('Failed to update ticket')
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteSupportTicket(deleteId)
      toast.success('Ticket deleted')
      setDeleteId(null)
      load()
    } catch {
      toast.error('Failed to delete ticket')
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    {
      header: 'Ticket',
      render: (row: Ticket) => (
        <div>
          <p className="font-semibold text-slate-100">{row.subject || 'Support Ticket'}</p>
          <p className="text-xs text-slate-400">{row.name || 'Unknown'} • {row.phone || '—'}</p>
        </div>
      ),
    },
    {
      header: 'Priority',
      render: (row: Ticket) => (
        <span className={`badge ${row.priority === 'HIGH' ? 'badge-danger' : row.priority === 'MEDIUM' ? 'badge-warning' : 'badge-info'}`}>
          {row.priority || 'LOW'}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (row: Ticket) => (
        <span className={`badge ${row.status === 'CLOSED' ? 'badge-success' : row.status === 'IN_PROGRESS' ? 'badge-warning' : 'badge-info'}`}>
          {row.status || 'OPEN'}
        </span>
      ),
    },
    {
       header: 'Agent',
       render: (row: Ticket) => {
         const ag = agents.find(a => a._id === row.assignedTo)
         return <span className="text-xs text-slate-300 bg-white/5 border border-white/5 px-2 py-1 rounded">{ag ? `${ag.firstName} ${ag.lastName}` : 'Unassigned'}</span>
       }
    },
    {
      header: 'Created',
      render: (row: Ticket) => (
        <span className="text-xs text-slate-400">{row.createdAt ? format(new Date(row.createdAt), 'dd MMM yyyy, HH:mm') : '—'}</span>
      ),
    },
    {
      header: 'Actions',
      render: (row: Ticket) => (
        <div className="flex items-center gap-2">
          <button className="btn-secondary btn-sm" onClick={() => openView(row)}>
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button className="btn-danger btn-sm" onClick={() => setDeleteId(row._id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="page">
      <PageHeader
        title="Support"
        subtitle="Handle customer tickets and issue escalation"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Support' }]}
      />

      <div className="card flex flex-wrap items-center gap-3 p-4">
        <select className="input w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="OPEN">OPEN</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="CLOSED">CLOSED</option>
        </select>
        <select className="input w-auto" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
          <option value="">All Priorities</option>
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        keyExtractor={(row: Ticket) => row._id}
        emptyMessage="No support tickets found"
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Support Ticket"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModalOpen(false)}>Close</button>
            <button className="btn-primary" onClick={save} disabled={saving}>Save</button>
          </>
        }
      >
        {selected && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-slate-100">{selected.subject}</p>
              <p className="text-xs text-slate-400">{selected.name} • {selected.phone || 'No phone'}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3 text-sm text-slate-300">
              {selected.message || 'No message'}
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <label className="label">Status</label>
                <select className="input text-sm" value={status} onChange={(e) => setStatus(e.target.value as Ticket['status'])}>
                  <option value="OPEN">OPEN</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>
              <div>
                <label className="label">Priority</label>
                <select className="input text-sm" value={priority} onChange={(e) => setPriority(e.target.value as Ticket['priority'])}>
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                </select>
              </div>
              <div>
                <label className="label">Assigned Agent</label>
                <select className="input text-sm" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
                   <option value="">-- Unassigned --</option>
                   {agents.map(ag => <option key={ag._id} value={ag._id}>{ag.firstName} {ag.lastName} ({ag.role})</option>)}
                </select>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteId)}
        onCancel={() => setDeleteId(null)}
        onConfirm={remove}
        title="Delete Ticket"
        message="This support ticket will be deleted permanently."
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  )
}

export default SupportPage
