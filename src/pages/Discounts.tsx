import React, { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import DataTable from '../components/ui/DataTable'
import Modal from '../components/ui/Modal'
import { ConfirmDialog, PageHeader } from '../components/ui'
import { createDiscountRule, deleteDiscountRule, listDiscounts, updateDiscountRule } from '../services/adminPanel.service'

type DiscountForm = {
  code: string
  type: 'PERCENT' | 'FLAT'
  value: number
  minAmount: number
  maxDiscount: number
  isActive: boolean
}

const defaultForm: DiscountForm = {
  code: '',
  type: 'PERCENT',
  value: 10,
  minAmount: 0,
  maxDiscount: 0,
  isActive: true,
}

const DiscountsPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState<DiscountForm>(defaultForm)
  const [saving, setSaving] = useState(false)

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

  const openCreate = () => {
    setEditing(null)
    setForm(defaultForm)
    setModalOpen(true)
  }

  const openEdit = (item: any) => {
    setEditing(item)
    setForm({
      code: item.code || '',
      type: item.type || 'PERCENT',
      value: Number(item.value || 0),
      minAmount: Number(item.minAmount || 0),
      maxDiscount: Number(item.maxDiscount || 0),
      isActive: Boolean(item.isActive ?? true),
    })
    setModalOpen(true)
  }

  const save = async () => {
    if (!form.code) {
      toast.error('Discount code is required')
      return
    }

    setSaving(true)
    try {
      if (editing?._id) {
        await updateDiscountRule(editing._id, form)
        toast.success('Discount updated')
      } else {
        await createDiscountRule(form)
        toast.success('Discount created')
      }
      setModalOpen(false)
      load()
    } catch {
      toast.error('Failed to save discount')
    } finally {
      setSaving(false)
    }
  }

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

  const columns = [
    {
      header: 'Code',
      render: (row: any) => <span className="font-mono text-sm font-semibold text-orange-300">{row.code}</span>,
    },
    {
      header: 'Rule',
      render: (row: any) => (
        <div>
          <p className="text-slate-100">{row.type === 'FLAT' ? `Flat ₹${row.value}` : `${row.value}% off`}</p>
          <p className="text-xs text-slate-400">Min: ₹{row.minAmount || 0}</p>
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
      render: (row: any) => <span className="text-xs text-slate-400">{row.updatedAt ? format(new Date(row.updatedAt), 'dd MMM yyyy') : '—'}</span>,
    },
    {
      header: 'Actions',
      render: (row: any) => (
        <div className="flex items-center gap-2">
          <button className="btn-secondary btn-sm" onClick={() => openEdit(row)}>
            <Pencil className="h-3.5 w-3.5" />
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
        title="Discounts"
        subtitle="Create and control promotional offers"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Discounts' }]}
        action={
          <button className="btn-primary" onClick={openCreate}>
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

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Discount' : 'Create Discount'}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={save} disabled={saving}>Save Discount</button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="label">Code</label>
            <input className="input" value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))} />
          </div>
          <div>
            <label className="label">Type</label>
            <select className="input" value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as DiscountForm['type'] }))}>
              <option value="PERCENT">PERCENT</option>
              <option value="FLAT">FLAT</option>
            </select>
          </div>
          <div>
            <label className="label">Value</label>
            <input type="number" className="input" value={form.value} onChange={(e) => setForm((p) => ({ ...p, value: Number(e.target.value || 0) }))} />
          </div>
          <div>
            <label className="label">Min Amount</label>
            <input type="number" className="input" value={form.minAmount} onChange={(e) => setForm((p) => ({ ...p, minAmount: Number(e.target.value || 0) }))} />
          </div>
          <div>
            <label className="label">Max Discount</label>
            <input type="number" className="input" value={form.maxDiscount} onChange={(e) => setForm((p) => ({ ...p, maxDiscount: Number(e.target.value || 0) }))} />
          </div>
          <label className="mt-6 flex items-center gap-2 text-sm text-slate-200">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))} />
            Active
          </label>
        </div>
      </Modal>

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
