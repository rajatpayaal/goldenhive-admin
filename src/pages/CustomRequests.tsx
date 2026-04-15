import React, { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import DataTable from '../components/ui/DataTable'
import Modal from '../components/ui/Modal'
import { PageHeader } from '../components/ui'
import { listCustomRequests, updateCustomRequest } from '../services/adminPanel.service'

const CustomRequestsPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')

  const [selected, setSelected] = useState<any | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [status, setStatus] = useState('PENDING')
  const [adminNote, setAdminNote] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    listCustomRequests({ page, limit: 10, status: statusFilter || undefined, sort: '-createdAt' })
      .then((response) => {
        const payload = response.data?.data || response.data
        setItems(payload?.items || payload || [])
        setTotalPages(payload?.totalPages || 1)
      })
      .catch(() => toast.error('Failed to load custom requests'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [page, statusFilter])

  const openView = (item: any) => {
    setSelected(item)
    setStatus(item.status || 'PENDING')
    setAdminNote(item.adminNote || '')
    setModalOpen(true)
  }

  const save = async () => {
    if (!selected?._id) return
    setSaving(true)
    try {
      await updateCustomRequest(selected._id, {
        status,
        adminNote,
      })
      toast.success('Request updated')
      setModalOpen(false)
      load()
    } catch {
      toast.error('Failed to update request')
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    {
      header: 'Customer',
      render: (row: any) => (
        <div>
          <p className="font-semibold text-text-primary">{row.name || 'Unknown'}</p>
          <p className="text-xs text-text-tertiary">{row.email || 'No email'}</p>
        </div>
      ),
    },
    {
      header: 'Request',
      render: (row: any) => <span className="line-clamp-2 text-sm text-text-secondary">{row.message || row.requirement || 'No description'}</span>,
    },
    {
      header: 'Status',
      render: (row: any) => (
        <span className={`badge ${row.status === 'COMPLETED' ? 'badge-success' : row.status === 'IN_PROGRESS' ? 'badge-warning' : 'badge-info'}`}>
          {row.status || 'PENDING'}
        </span>
      ),
    },
    {
      header: 'Created',
      render: (row: any) => <span className="text-xs text-text-tertiary">{row.createdAt ? format(new Date(row.createdAt), 'dd MMM yyyy') : '—'}</span>,
    },
    {
      header: 'Actions',
      render: (row: any) => (
        <button className="btn-secondary btn-sm" onClick={() => openView(row)}>
          <Eye className="h-3.5 w-3.5" />
        </button>
      ),
    },
  ]

  return (
    <div className="page">
      <PageHeader
        title="Custom Requests"
        subtitle="Handle custom travel inquiries and lead conversions"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Custom Requests' }]}
      />

      <div className="card p-4">
        <select className="input w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="PENDING">PENDING</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="REJECTED">REJECTED</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        keyExtractor={(row: any) => row._id}
        emptyMessage="No custom requests found"
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Custom Request"
        size="lg"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModalOpen(false)}>Close</button>
            <button className="btn-primary" onClick={save} disabled={saving}>Save</button>
          </>
        }
      >
        {selected && (
          <div className="space-y-4">
            <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-300">
              {selected.message || selected.requirement || 'No request description'}
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className="label">Status</label>
                <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="PENDING">PENDING</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>
              <div>
                <label className="label">Admin Note</label>
                <input className="input" value={adminNote} onChange={(e) => setAdminNote(e.target.value)} />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default CustomRequestsPage
