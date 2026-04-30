import React, { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import DataTable from '../../components/ui/DataTable'
import { ConfirmDialog, PageHeader } from '../../components/ui'
import { deleteDiscountRule, listDiscounts } from './service'

const DiscountsPage: React.FC = () => {
  const navigate = useNavigate()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = () => {
    setLoading(true)
    listDiscounts()
      .then((response) => {
        const payload = response.data?.data || response.data
        setItems(payload?.items || payload || [])
      })
      .catch(() => toast.error('Failed to load discounts'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const remove = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteDiscountRule(deleteId)
      toast.success('Discount deleted')
      setDeleteId(null)
      load()
    } catch {
      toast.error('Failed to delete discount')
    } finally {
      setDeleting(false)
    }
  }

  const columns = useMemo(
    () => [
      {
        header: 'Code',
        render: (row: any) => <span className="font-mono text-sm font-semibold text-orange-300">{row.code}</span>,
      },
      {
        header: 'Rule',
        render: (row: any) => (
          <div>
            <p className="text-text-primary">{row.discountType === 'flat' ? `Flat ₹${row.value}` : `${row.value}% off`}</p>
            <p className="text-xs text-text-tertiary">Min Pax: {row.minPax || 1}</p>
          </div>
        ),
      },
      {
        header: 'Status',
        render: (row: any) => (
          <span className={`badge ${row.isActive === false ? 'badge-warning' : 'badge-success'}`}>
            {row.isActive === false ? 'INACTIVE' : 'ACTIVE'}
          </span>
        ),
      },
      {
        header: 'Updated',
        render: (row: any) => <span className="text-xs text-text-tertiary">{row.updatedAt ? format(new Date(row.updatedAt), 'dd MMM yyyy') : '—'}</span>,
      },
      {
        header: 'Actions',
        render: (row: any) => (
          <div className="flex items-center gap-2">
            <button className="btn-secondary btn-sm" onClick={() => navigate(`/discounts/${row._id}/edit`)}>
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
        title="Discounts"
        subtitle="Create and control promotional offers"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Discounts' }]}
        action={
          <button className="btn-primary" onClick={() => navigate('/discounts/new')}>
            <Plus className="h-4 w-4" /> New Discount
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        keyExtractor={(row: any) => row._id}
        emptyMessage="No discounts configured"
      />

      <ConfirmDialog
        open={Boolean(deleteId)}
        onCancel={() => setDeleteId(null)}
        onConfirm={remove}
        title="Delete Discount"
        message="This discount rule will be removed."
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  )
}

export default DiscountsPage
