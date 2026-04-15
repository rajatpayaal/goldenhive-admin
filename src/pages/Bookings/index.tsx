import React, { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import DataTable from '../../components/ui/DataTable'
import StatusBadge from '../../components/ui/StatusBadge'
import { ConfirmDialog, PageHeader } from '../../components/ui'
import { deleteBookingById, listBookings } from './service'

type Booking = {
  _id: string
  bookingNo?: string
  userId?: { firstName?: string; lastName?: string; email?: string }
  packageItems?: Array<{ packageId?: { basic?: { name?: string } } }>
  startDate?: string
  endDate?: string
  totalAmount?: number
  status?: string
  paymentStatus?: string
  createdAt?: string
}

const BookingsPage: React.FC = () => {
  const navigate = useNavigate()
  const [items, setItems] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadBookings = () => {
    setLoading(true)
    listBookings({ page, limit: 10, status: statusFilter || undefined, paymentStatus: paymentFilter || undefined })
      .then((response) => {
        const payload = response.data?.data || response.data
        setItems(payload?.items || [])
        setTotalPages(payload?.totalPages || 1)
      })
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadBookings()
  }, [page, statusFilter, paymentFilter])

  const removeBooking = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteBookingById(deleteId)
      toast.success('Booking removed or cancelled')
      setDeleteId(null)
      loadBookings()
    } catch (error: any) {
      toast.error(error?.response?.data?.error || error?.response?.data?.message || 'Unable to remove booking')
    } finally {
      setDeleting(false)
    }
  }

  const columns = useMemo(
    () => [
      {
        header: 'Booking',
        render: (row: Booking) => (
          <div>
            <p className="font-semibold text-text-primary">{row.bookingNo || row._id.slice(-8)}</p>
            <p className="text-xs text-text-secondary">{row.createdAt ? format(new Date(row.createdAt), 'dd MMM yyyy') : '—'}</p>
          </div>
        ),
      },
      {
        header: 'Customer',
        render: (row: Booking) => (
          <div>
            <p>{row.userId?.firstName || ''} {row.userId?.lastName || ''}</p>
            <p className="text-xs text-text-secondary">{row.userId?.email || '—'}</p>
          </div>
        ),
      },
      {
        header: 'Package',
        render: (row: Booking) => <span>{row.packageItems?.[0]?.packageId?.basic?.name || '—'}</span>,
      },
      {
        header: 'Amount',
        render: (row: Booking) => <span className="font-semibold text-primary-500">₹{Number(row.totalAmount || 0).toLocaleString()}</span>,
      },
      {
        header: 'Status',
        render: (row: Booking) => <StatusBadge status={row.status} type="booking" />,
      },
      {
        header: 'Payment',
        render: (row: Booking) => <StatusBadge status={row.paymentStatus} type="payment" />,
      },
      {
        header: 'Actions',
        render: (row: Booking) => (
          <div className="flex items-center gap-2">
            <button className="btn-secondary btn-sm" onClick={() => navigate(`/bookings/${row._id}/edit`)}>
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button className="btn-danger btn-sm" onClick={() => setDeleteId(row._id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ),
      },
    ],
    [navigate]
  )

  return (
    <div className="page">
      <PageHeader
        title="Bookings"
        subtitle="Track, update, and manage customer journeys"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Bookings' }]}
        action={
          <div className="flex items-center gap-2">
            <button className="btn-secondary" onClick={loadBookings}>
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
            <button className="btn-primary" onClick={() => navigate('/bookings/new')}>
              <Plus className="h-4 w-4" /> Create Booking
            </button>
          </div>
        }
      />

      <div className="card flex flex-wrap items-center gap-3 p-4">
        <select className="input w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="REQUESTED">REQUESTED</option>
          <option value="CONTACTED">CONTACTED</option>
          <option value="NEGOTIATING">NEGOTIATING</option>
          <option value="APPROVED">APPROVED</option>
          <option value="REJECTED">REJECTED</option>
        </select>
        <select className="input w-auto" value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
          <option value="">All Payments</option>
          <option value="UNPAID">UNPAID</option>
          <option value="PAID">PAID</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        keyExtractor={(row) => row._id}
        emptyMessage="No bookings found"
      />

      <ConfirmDialog
        open={Boolean(deleteId)}
        onCancel={() => setDeleteId(null)}
        onConfirm={removeBooking}
        title="Delete Booking"
        message="If delete is not supported by backend, this action will mark booking as REJECTED."
        confirmLabel="Reject"
        loading={deleting}
      />
    </div>
  )
}

export default BookingsPage
