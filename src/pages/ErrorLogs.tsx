import React, { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Eye, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import DataTable from '../components/ui/DataTable'
import Modal from '../components/ui/Modal'
import { ConfirmDialog, PageHeader } from '../components/ui'
import { deleteErrorLogById, listErrorLogs } from '../services/adminPanel.service'

const ErrorLogsPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [eventType, setEventType] = useState('')
  const [statusCode, setStatusCode] = useState('')

  const [selected, setSelected] = useState<any | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = () => {
    setLoading(true)
    listErrorLogs({
      eventType: eventType || undefined,
      statusCode: statusCode ? Number(statusCode) : undefined,
      page,
      limit: 20,
    })
      .then((response) => {
        const payload = response.data?.data || response.data
        setItems(payload?.items || payload || [])
        setTotalPages(payload?.totalPages || 1)
      })
      .catch(() => toast.error('Failed to load error logs'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [page, eventType, statusCode])

  const remove = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteErrorLogById(deleteId)
      toast.success('Error log deleted')
      setDeleteId(null)
      load()
    } catch {
      toast.error('Failed to delete error log')
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    {
      header: 'Error',
      render: (row: any) => (
        <div>
          <p className="font-semibold text-text-primary">{row.errorName || 'Error'}</p>
          <p className="line-clamp-1 text-xs text-text-tertiary">{row.errorMessage || 'No message'}</p>
        </div>
      ),
    },
    {
      header: 'Route',
      render: (row: any) => <span className="text-sm text-text-secondary">{row.method || 'GET'} {row.route || row.originalUrl || '-'}</span>,
    },
    {
      header: 'Status',
      render: (row: any) => <span className="badge badge-danger">{row.statusCode || 500}</span>,
    },
    {
      header: 'Date',
      render: (row: any) => <span className="text-xs text-text-tertiary">{row.createdAt ? format(new Date(row.createdAt), 'dd MMM yyyy HH:mm') : '—'}</span>,
    },
    {
      header: 'Actions',
      render: (row: any) => (
        <div className="flex items-center gap-2">
          <button
            className="btn-secondary btn-sm"
            onClick={() => {
              setSelected(row)
              setModalOpen(true)
            }}
          >
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
        title="Error Logs"
        subtitle="Inspect, triage, and clean runtime issues"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Error Logs' }]}
      />

      <div className="card flex flex-wrap items-center gap-3 p-4">
        <select className="input w-auto" value={eventType} onChange={(e) => setEventType(e.target.value)}>
          <option value="">All event types</option>
          <option value="ERROR">ERROR</option>
          <option value="PUBLIC_ROUTE_HIT">PUBLIC_ROUTE_HIT</option>
        </select>
        <input
          className="input w-auto"
          placeholder="Status code"
          value={statusCode}
          onChange={(e) => setStatusCode(e.target.value)}
        />
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        keyExtractor={(row: any) => row._id}
        emptyMessage="No logs found"
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Error Log Details"
        size="xl"
      >
        {selected && (
          <pre className="max-h-[60vh] overflow-auto rounded-xl border border-surface-border bg-surface-card p-4 text-xs text-text-secondary">
            {JSON.stringify(selected, null, 2)}
          </pre>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteId)}
        onCancel={() => setDeleteId(null)}
        onConfirm={remove}
        title="Delete Error Log"
        message="This log entry will be permanently removed."
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  )
}

export default ErrorLogsPage
