import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PageHeader } from '../../components/ui'
import BookingForm, { BookingFormData } from './BookingForm'
import { createBooking } from './service'

const AddBookingPage: React.FC = () => {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)

  const onSubmit = async (data: BookingFormData) => {
    if (!data.packageId || !data.startDate || !data.endDate) {
      toast.error('Please fill required fields')
      return
    }

    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('packageId', data.packageId)
      fd.append('startDate', data.startDate)
      fd.append('endDate', data.endDate)
      fd.append('travellers', String(data.travellers))
      fd.append('totalAmount', String(data.totalAmount))
      fd.append('status', data.status)
      fd.append('paymentStatus', data.paymentStatus)
      fd.append('note', data.note)

      await createBooking(fd as any)
      toast.success('Booking created')
      navigate('/bookings')
    } catch (error: any) {
      toast.error(error?.response?.data?.error || error?.response?.data?.message || 'Unable to create booking')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Create Booking"
        subtitle="Create a fresh booking from admin panel"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Bookings', href: '/bookings' }, { label: 'Create' }]}
      />
      <div className="rounded-3xl border border-surface-border bg-surface-card p-4 shadow-sm">
        <BookingForm mode="create" saving={saving} onSubmit={onSubmit} />
      </div>
    </div>
  )
}

export default AddBookingPage
