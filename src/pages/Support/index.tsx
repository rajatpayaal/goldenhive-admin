import React, { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { Eye, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import DataTable from '../../components/ui/DataTable'
import { ConfirmDialog, PageHeader } from '../../components/ui'
import { deleteSupportTicket, listSupportTickets, listUsers } from './service'

type Ticket = {
  _id: string
  name?: string
  phone?: string
  subject?: string
  status?: 'OPEN' | 'IN_PROGRESS' | 'CLOSED'
  priority?: 'LOW' | 'MEDIUM' | 'HIGH'
  assignedTo?: string | null
  createdAt?: string
}

const SupportPage: React.FC = () => {
  const navigate = useNavigate()
  const [items, setItems] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
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

  const loadAgents = () => {
    listUsers({ limit: 200 })
      .then((resp) => {
        const data = resp.data?.data?.items || resp.data?.items || resp.data || []
        setAgents(data.filter((u: any) => ['ADMIN', 'SALES_AGENT'].includes(String(u.role).toUpperCase())))
      })
      .catch(() => undefined)
  }

  useEffect(() => {
    load()
  }, [statusFilter, priorityFilter])

  useEffect(() => {
    loadAgents()
  }, [])

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

  const columns = useMemo(
    () => [
      {
        header: 'Ticket',
        render: (row: Ticket) => (
          <div>
            <p className="font-semibold text-text-primary">{row.subject || 'Support Ticket'}</p>
            <p className="text-xs text-text-tertiary">{row.name || 'Unknown'} • {row.phone || '—'}</p>
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
          const ag = agents.find((a) => a._id === row.assignedTo)
          return <span className="rounded border border-surface-border bg-surface-border px-2 py-1 text-xs text-text-secondary">{ag ? `${ag.firstName} ${ag.lastName}` : 'Unassigned'}</span>
        },
      },
      {
        header: 'Created',
        render: (row: Ticket) => (
          <span className="text-xs text-text-tertiary">{row.createdAt ? format(new Date(row.createdAt), 'dd MMM yyyy, HH:mm') : '—'}</span>
        ),
      },
      {
        header: 'Actions',
        render: (row: Ticket) => (
          <div className="flex items-center gap-2">
            <button className="btn-secondary btn-sm" onClick={() => navigate(`/support/${row._id}/edit`)}>
              <Eye className="h-3.5 w-3.5" />
            </button>
            <button className="btn-danger btn-sm" onClick={() => setDeleteId(row._id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ),
      },
    ],
    [agents, navigate]
  )

  return (
    <div className="page">
      <PageHeader title="Support" subtitle="Handle customer tickets and issue escalation" breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Support' }]} />

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

      <DataTable columns={columns} data={items} loading={loading} keyExtractor={(row: Ticket) => row._id} emptyMessage="No support tickets found" />

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
