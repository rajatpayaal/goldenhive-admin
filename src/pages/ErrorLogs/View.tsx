import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PageHeader, Spinner } from '../../components/ui'
import { getErrorLogById } from './service'

const ViewErrorLogPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [item, setItem] = useState<any>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getErrorLogById(id)
      .then((res) => {
        const payload = res.data?.data || res.data
        setItem(payload)
      })
      .catch(() => {
        toast.error('Failed to load error log')
        navigate('/error-logs')
      })
      .finally(() => setLoading(false))
  }, [id, navigate])

  if (loading) {
    return (
      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader title="Error Log Details" subtitle="Loading error log..." breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Error Logs', href: '/error-logs' }, { label: 'View' }]} />
        <div className="rounded-3xl border border-surface-border bg-surface-card p-8 text-center shadow-sm">
          <Spinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader title="Error Log Details" subtitle={item?.errorName || 'Runtime error details'} breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Error Logs', href: '/error-logs' }, { label: 'View' }]} />
      <pre className="max-h-[70vh] overflow-auto rounded-xl border border-surface-border bg-surface-card p-4 text-xs text-text-secondary">
        {JSON.stringify(item, null, 2)}
      </pre>
    </div>
  )
}

export default ViewErrorLogPage
