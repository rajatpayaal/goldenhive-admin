import React, { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { Eye, Plus, RefreshCw, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import DataTable from '../components/ui/DataTable'
import Modal from '../components/ui/Modal'
import StatusBadge from '../components/ui/StatusBadge'
import { ConfirmDialog, PageHeader } from '../components/ui'
import {
  createBooking,
  deleteBookingById,
  listBookings,
  updateBookingById,
} from '../services/adminPanel.service'

type Booking = {
  _id: string
  bookingNo?: string
  userId?: { firstName?: string; lastName?: string; email?: string }
  packageItems?: Array<{ packageId?: { basic?: { name?: string } }; travellers?: number }>
  startDate?: string
  endDate?: string
  totalAmount?: number
  travellers?: number
  status?: string
  paymentStatus?: string
  note?: string
  createdAt?: string
}

type BookingForm = {
  packageId: string
  startDate: string
  endDate: string
  travellers: number
  totalAmount: number
  status: string
  paymentStatus: string
  note: string
}

const defaultForm: BookingForm = {
  packageId: '',
  startDate: '',
  endDate: '',
  travellers: 1,
  totalAmount: 0,
  status: 'REQUESTED',
  paymentStatus: 'UNPAID',
  note: '',
}

const BookingsPage: React.FC = () => {
  const [items, setItems] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')

  const [selected, setSelected] = useState<Booking | null>(null)
  const [form, setForm] = useState<BookingForm>(defaultForm)
  const [openDetail, setOpenDetail] = useState(false)
  const [openCreate, setOpenCreate] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [saving, setSaving] = useState(false)

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

  const openDetails = (booking: Booking) => {
    setSelected(booking)
    setForm({
      packageId: booking.packageItems?.[0]?.packageId?.basic?.name || '',
      startDate: booking.startDate ? booking.startDate.slice(0, 10) : '',
      endDate: booking.endDate ? booking.endDate.slice(0, 10) : '',
      travellers: booking.travellers || 1,
      totalAmount: booking.totalAmount || 0,
      status: booking.status || 'REQUESTED',
      paymentStatus: booking.paymentStatus || 'UNPAID',
      note: booking.note || '',
    })
    setOpenDetail(true)
  }

  const saveBookingStatus = async () => {
    if (!selected) return
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('status', form.status)
      fd.append('paymentStatus', form.paymentStatus)
      fd.append('totalAmount', String(form.totalAmount))
      fd.append('note', form.note)

      await updateBookingById(selected._id, fd)
      toast.success('Booking updated')
      setOpenDetail(false)
      loadBookings()
    } catch (error: any) {
      toast.error(error?.response?.data?.error || error?.response?.data?.message || 'Unable to update booking')
    } finally {
      setSaving(false)
    }
  }

  const submitCreate = async () => {
    if (!form.packageId || !form.startDate || !form.endDate) {
      toast.error('Please fill required fields')
      return
    }

    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('packageId', form.packageId)
      fd.append('startDate', form.startDate)
      fd.append('endDate', form.endDate)
      fd.append('travellers', String(form.travellers))
      fd.append('totalAmount', String(form.totalAmount))
      fd.append('status', form.status)
      fd.append('paymentStatus', form.paymentStatus)
      fd.append('note', form.note)

      await createBooking(fd as any)
      toast.success('Booking created')
      setOpenCreate(false)
      setForm(defaultForm)
      loadBookings()
    } catch (error: any) {
      toast.error(error?.response?.data?.error || error?.response?.data?.message || 'Unable to create booking')
    } finally {
      setSaving(false)
    }
  }

  const removeBooking = async () => {
    if (!selected) return
    setSaving(true)
    try {
      await deleteBookingById(selected._id)
      toast.success('Booking removed or cancelled')
      setOpenDelete(false)
      setOpenDetail(false)
      setSelected(null)
      loadBookings()
    } catch (error: any) {
      toast.error(error?.response?.data?.error || error?.response?.data?.message || 'Unable to remove booking')
    } finally {
      setSaving(false)
    }
  }

  const columns = useMemo(
    () => [
      {
        header: 'Booking',
        render: (row: Booking) => (
          <div>
            <p className="font-semibold text-slate-100">{row.bookingNo || row._id.slice(-8)}</p>
            <p className="text-xs text-slate-400">{row.createdAt ? format(new Date(row.createdAt), 'dd MMM yyyy') : '—'}</p>
          </div>
        ),
      },
      {
        header: 'Customer',
        render: (row: Booking) => (
          <div>
            <p>{row.userId?.firstName || ''} {row.userId?.lastName || ''}</p>
            <p className="text-xs text-slate-400">{row.userId?.email || '—'}</p>
          </div>
        ),
      },
      {
        header: 'Package',
        render: (row: Booking) => <span>{row.packageItems?.[0]?.packageId?.basic?.name || '—'}</span>,
      },
      {
        header: 'Amount',
        render: (row: Booking) => <span className="font-semibold text-orange-300">₹{Number(row.totalAmount || 0).toLocaleString()}</span>,
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
          <button className="btn-secondary btn-sm" onClick={() => openDetails(row)}>
            <Eye className="h-3.5 w-3.5" /> View
          </button>
        ),
      },
    ],
    []
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
            <button className="btn-primary" onClick={() => setOpenCreate(true)}>
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

      <Modal
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        title={`Booking ${selected?.bookingNo || ''}`}
        footer={
          <>
            <button className="btn-danger" onClick={() => setOpenDelete(true)}>
              <Trash2 className="h-4 w-4" /> Delete
            </button>
            <button className="btn-secondary" onClick={() => setOpenDetail(false)}>Close</button>
            <button className="btn-primary" onClick={saveBookingStatus} disabled={saving}>Save Changes</button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}>
              <option value="REQUESTED">REQUESTED</option>
              <option value="CONTACTED">CONTACTED</option>
              <option value="NEGOTIATING">NEGOTIATING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>
          <div>
            <label className="label">Payment Status</label>
            <select className="input" value={form.paymentStatus} onChange={(e) => setForm((prev) => ({ ...prev, paymentStatus: e.target.value }))}>
              <option value="UNPAID">UNPAID</option>
              <option value="PAID">PAID</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="label">Total Amount (₹)</label>
            <input type="number" className="input" value={form.totalAmount} onChange={(e) => setForm((prev) => ({ ...prev, totalAmount: Number(e.target.value) }))} />
          </div>
          <div className="md:col-span-2">
            <label className="label">Admin Note</label>
            <textarea className="input resize-none" rows={3} value={form.note} onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))} />
          </div>
        </div>
      </Modal>

      <Modal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        title="Create Booking"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setOpenCreate(false)}>Cancel</button>
            <button className="btn-primary" onClick={submitCreate} disabled={saving}>Create</button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="label">Package ID</label>
            <input className="input" value={form.packageId} onChange={(e) => setForm((prev) => ({ ...prev, packageId: e.target.value }))} placeholder="Mongo package id" />
          </div>
          <div>
            <label className="label">Start Date</label>
            <input type="date" className="input" value={form.startDate} onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))} />
          </div>
          <div>
            <label className="label">End Date</label>
            <input type="date" className="input" value={form.endDate} onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))} />
          </div>
          <div>
            <label className="label">Travellers</label>
            <input type="number" className="input" value={form.travellers} onChange={(e) => setForm((prev) => ({ ...prev, travellers: Number(e.target.value) }))} />
          </div>
          <div>
            <label className="label">Total Amount</label>
            <input type="number" className="input" value={form.totalAmount} onChange={(e) => setForm((prev) => ({ ...prev, totalAmount: Number(e.target.value) }))} />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={openDelete}
        onCancel={() => setOpenDelete(false)}
        onConfirm={removeBooking}
        title="Delete Booking"
        message="If delete is not supported by backend, this action will mark booking as REJECTED."
        confirmLabel="Reject"
        loading={saving}
      />
    </div>
  )
}

export default BookingsPage
