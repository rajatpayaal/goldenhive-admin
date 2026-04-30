import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PageHeader, Spinner } from '../../components/ui'
import BookingForm, { BookingFormData } from './BookingForm'
import { getBookingById, updateBookingStatusById } from './service'

const EditBookingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [booking, setBooking] = useState<any>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getBookingById(id)
      .then((res) => {
        const payload = res.data?.data || res.data
        setBooking(payload)
      })
      .catch((error: any) => {
        toast.error(error?.response?.data?.message || 'Failed to load booking')
        navigate('/bookings')
      })
      .finally(() => setLoading(false))
  }, [id, navigate])

  const defaultValues = useMemo<Partial<BookingFormData>>(() => {
    if (!booking) return {}
    return {
      packageId: booking.packageItems?.[0]?.packageId?._id || booking.packageId || '',
      startDate: booking.startDate ? String(booking.startDate).slice(0, 10) : '',
      endDate: booking.endDate ? String(booking.endDate).slice(0, 10) : '',
      travellers: booking.travellers || 1,
      totalAmount: Number(booking.totalAmount || 0),
      status: booking.status || 'REQUESTED',
      paymentStatus: booking.paymentStatus || 'UNPAID',
      note: booking.note || '',
    }
  }, [booking])

  const onSubmit = async (data: BookingFormData) => {
    if (!id) return
    setSaving(true)
    try {
      const payload = {
        status: data.status,
        paymentStatus: data.paymentStatus,
        totalAmount: data.totalAmount,
        note: data.note,
      }

      await updateBookingStatusById(id, payload)
      toast.success('Booking updated')
      navigate('/bookings')
    } catch (error: any) {
      toast.error(error?.response?.data?.error || error?.response?.data?.message || 'Unable to update booking')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader
          title="Edit Booking"
          subtitle="Loading booking details..."
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Bookings', href: '/bookings' }, { label: 'Edit' }]}
        />
        <div className="rounded-3xl border border-surface-border bg-surface-card p-8 text-center shadow-sm">
          <Spinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Edit Booking"
        subtitle="Update booking status and payment details"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Bookings', href: '/bookings' }, { label: 'Edit' }]}
      />
      <div className="rounded-3xl border border-surface-border bg-surface-card p-4 shadow-sm">
        <BookingForm mode="edit" defaultValues={defaultValues} saving={saving} onSubmit={onSubmit} />
      </div>
    </div>
  )
}

export default EditBookingPage
