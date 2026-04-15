import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Shield, UserCog, Globe } from 'lucide-react'
import { PageHeader } from '../components/ui'
import { fetchAdminSettings } from '../services/adminPanel.service'
import { useAuthStore } from '../store/authStore'

type SettingsForm = {
  companyName: string
  supportEmail: string
  supportPhone: string
  timezone: string
  autoAssignSupport: boolean
  requireMfaForAdmins: boolean
  bookingApprovalFlow: 'AUTO' | 'MANUAL'
}

const SettingsPage: React.FC = () => {
  const user = useAuthStore((state) => state.user)
  const [loading, setLoading] = useState(false)

  const { register, reset, handleSubmit, watch } = useForm<SettingsForm>({
    defaultValues: {
      companyName: 'Goldenhive Holidays',
      supportEmail: user?.email || '',
      supportPhone: '',
      timezone: 'Asia/Kolkata',
      autoAssignSupport: true,
      requireMfaForAdmins: false,
      bookingApprovalFlow: 'MANUAL',
    },
  })

  useEffect(() => {
    setLoading(true)
    fetchAdminSettings()
      .then((data) => {
        const footer = Array.isArray(data.footer) ? data.footer[0] : data.footer
        reset((previous) => ({
          ...previous,
          supportEmail: footer?.email || previous.supportEmail,
          supportPhone: footer?.phone || previous.supportPhone,
        }))
      })
      .finally(() => setLoading(false))
  }, [reset])

  const onSubmit = async (_values: SettingsForm) => {
    toast.success('Settings saved. Connect this form to your preferred config endpoint.')
  }

  return (
    <div className="page space-y-5">
      <PageHeader
        title="Settings"
        subtitle="Control security, operations, and platform defaults"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Settings' }]}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <section className="rounded-2xl border border-surface-border bg-surface-card p-5">
          <div className="mb-4 flex items-center gap-2 text-text-secondary">
            <UserCog className="h-4 w-4 text-orange-300" />
            <h3 className="text-sm font-semibold">Organization</h3>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="label">Company Name</label>
              <input className="input" {...register('companyName')} />
            </div>
            <div>
              <label className="label">Timezone</label>
              <select className="input" {...register('timezone')}>
                <option value="Asia/Kolkata">Asia/Kolkata</option>
                <option value="UTC">UTC</option>
                <option value="Europe/London">Europe/London</option>
              </select>
            </div>
            <div>
              <label className="label">Support Email</label>
              <input className="input" type="email" {...register('supportEmail')} />
            </div>
            <div>
              <label className="label">Support Phone</label>
              <input className="input" {...register('supportPhone')} />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-surface-border bg-surface-card p-5">
          <div className="mb-4 flex items-center gap-2 text-text-secondary">
            <Shield className="h-4 w-4 text-cyan-300" />
            <h3 className="text-sm font-semibold">Security & Access</h3>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="flex items-center justify-between rounded-xl border border-surface-border bg-surface-card p-3 text-sm text-text-secondary">
              <span>Require MFA for Admins</span>
              <input type="checkbox" className="h-4 w-4" {...register('requireMfaForAdmins')} />
            </label>
            <label className="flex items-center justify-between rounded-xl border border-surface-border bg-surface-card p-3 text-sm text-text-secondary">
              <span>Auto-assign Support Tickets</span>
              <input type="checkbox" className="h-4 w-4" {...register('autoAssignSupport')} />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-surface-border bg-surface-card p-5">
          <div className="mb-4 flex items-center gap-2 text-text-secondary">
            <Globe className="h-4 w-4 text-success-300" />
            <h3 className="text-sm font-semibold">Booking Workflow</h3>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="label">Approval Flow</label>
              <select className="input" {...register('bookingApprovalFlow')}>
                <option value="MANUAL">Manual Approval</option>
                <option value="AUTO">Auto Approval</option>
              </select>
            </div>
            <div className="rounded-xl border border-orange-400/20 bg-orange-500/10 p-3 text-xs text-orange-100">
              Current Mode: <strong>{watch('bookingApprovalFlow')}</strong>
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <button type="submit" className="btn-primary" disabled={loading}>
            Save Settings
          </button>
        </div>
      </form>
    </div>
  )
}

export default SettingsPage
