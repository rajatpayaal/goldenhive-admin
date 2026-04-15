import React, { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import DataTable from '../../components/ui/DataTable'
import { PageHeader } from '../../components/ui'
import { listCustomRequests } from './service'

const CustomRequestsPage: React.FC = () => {
  const navigate = useNavigate()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')

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

  const columns = useMemo(
    () => [
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
          <button className="btn-secondary btn-sm" onClick={() => navigate(`/custom-requests/${row._id}/edit`)}>
            <Eye className="h-3.5 w-3.5" />
          </button>
        ),
      },
    ],
    [navigate]
  )

  return (
    <div className="page">
      <PageHeader title="Custom Requests" subtitle="Handle custom travel inquiries and lead conversions" breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Custom Requests' }]} />

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
    </div>
  )
}

export default CustomRequestsPage
