import React, { useEffect, useState, useMemo } from 'react'
import { Plus, Trash2, Edit, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

import DataTable from '../components/ui/DataTable'
import Modal from '../components/ui/Modal'
import { PageHeader, ConfirmDialog, Toggle, Spinner } from '../components/ui'
import {
  fetchPackagePricing,
  createPackagePricing,
  updatePackagePricing,
  deletePackagePricing,
  fetchPackages,
  fetchVehicles,
} from '../services/api.service'

type PricingItem = {
  _id: string
  packageId?: { _id: string; basic?: { name: string } } | string
  vehicleId?: { _id: string; title?: string; name?: string; type?: string } | string
  pax: number
  pricePerPerson: number
  totalPrice?: number
  discountPercent?: number
  finalPricePerPerson?: number
  isBestDeal: boolean
  isActive: boolean
}

type PricingForm = {
  packageId: string
  vehicleId: string
  pax: number
  pricePerPerson: number
  totalPrice: number | ''
  discountPercent: number
  finalPricePerPerson: number | ''
  isBestDeal: boolean
  isActive: boolean
}

const defaultForm: PricingForm = {
  packageId: '',
  vehicleId: '',
  pax: 2,
  pricePerPerson: 0,
  totalPrice: '',
  discountPercent: 0,
  finalPricePerPerson: '',
  isBestDeal: false,
  isActive: true,
}

const PackagePricingPage: React.FC = () => {
  const [items, setItems] = useState<PricingItem[]>([])
  const [loading, setLoading] = useState(false)

  // Filters / Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [packageFilter, setPackageFilter] = useState('')

  // Related Data
  const [packages, setPackages] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])

  // Modal State
  const [openForm, setOpenForm] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [saving, setSaving] = useState(false)
  
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [form, setForm] = useState<PricingForm>(defaultForm)

  const loadDependencies = async () => {
    try {
      const [resPkg, resVeh] = await Promise.all([
        fetchPackages({ limit: 100 }), // Get some packages to populate dropdowns
        fetchVehicles()
      ])
      setPackages(resPkg.data?.data?.items || resPkg.data?.items || resPkg.data?.data || resPkg.data || [])
      setVehicles(resVeh.data?.data?.items || resVeh.data?.items || resVeh.data?.data || resVeh.data || [])
    } catch (e: any) {
      toast.error('Failed to load packages/vehicles')
    }
  }

  const loadData = () => {
    setLoading(true)
    fetchPackagePricing({ page, limit: 15, packageId: packageFilter || undefined })
      .then((res) => {
        const d = res.data?.data || res.data
        setItems(d?.items || d || [])
        setTotalPages(d?.totalPages || 1)
      })
      .catch(() => toast.error('Failed to load pricing entries'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadDependencies()
  }, [])

  useEffect(() => {
    loadData()
  }, [page, packageFilter])

  const openCreate = () => {
    setSelectedId(null)
    setForm(defaultForm)
    setOpenForm(true)
  }

  const openEdit = (item: PricingItem) => {
    setSelectedId(item._id)
    setForm({
      packageId: typeof item.packageId === 'object' ? item.packageId?._id || '' : item.packageId || '',
      vehicleId: typeof item.vehicleId === 'object' ? item.vehicleId?._id || '' : item.vehicleId || '',
      pax: item.pax || 2,
      pricePerPerson: item.pricePerPerson || 0,
      totalPrice: item.totalPrice !== undefined ? item.totalPrice : '',
      discountPercent: item.discountPercent || 0,
      finalPricePerPerson: item.finalPricePerPerson !== undefined ? item.finalPricePerPerson : '',
      isBestDeal: item.isBestDeal ?? false,
      isActive: item.isActive ?? true,
    })
    setOpenForm(true)
  }

  const saveForm = async () => {
    if (!form.packageId || !form.vehicleId || !form.pax || !form.pricePerPerson) {
      toast.error('Please fill required fields (Package, Vehicle, Pax, Price Per Person)')
      return
    }

    setSaving(true)
    try {
      const payload: any = {
        packageId: form.packageId,
        vehicleId: form.vehicleId,
        pax: Number(form.pax),
        pricePerPerson: Number(form.pricePerPerson),
        discountPercent: Number(form.discountPercent),
        isBestDeal: form.isBestDeal,
        isActive: form.isActive,
      }

      if (form.totalPrice !== '') payload.totalPrice = Number(form.totalPrice)
      if (form.finalPricePerPerson !== '') payload.finalPricePerPerson = Number(form.finalPricePerPerson)

      if (selectedId) {
        await updatePackagePricing(selectedId, payload)
        toast.success('Pricing updated')
      } else {
        await createPackagePricing(payload)
        toast.success('Pricing created')
      }
      setOpenForm(false)
      loadData()
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Validation Failed')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!selectedId) return
    setSaving(true)
    try {
      await deletePackagePricing(selectedId)
      toast.success('Pricing deleted')
      setOpenDelete(false)
      loadData()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete')
    } finally {
      setSaving(false)
    }
  }

  const columns = useMemo(
    () => [
      {
        header: 'Package',
        render: (row: PricingItem) => {
          const pkgId = typeof row.packageId === 'object' ? row.packageId?._id : row.packageId
          const p = packages.find(pkg => pkg._id === pkgId)
          const name = typeof row.packageId === 'object' && row.packageId?.basic?.name ? row.packageId.basic.name : (p?.basic?.name || pkgId)
          return <span className="font-medium text-slate-200">{name || 'Unknown Package'}</span>
        },
      },
      {
        header: 'Vehicle',
        render: (row: PricingItem) => {
          const vehId = typeof row.vehicleId === 'object' ? row.vehicleId?._id : row.vehicleId
          const v = vehicles.find(veh => veh._id === vehId)
          const name = typeof row.vehicleId === 'object' && row.vehicleId?.name ? `${row.vehicleId.name} (${row.vehicleId.type || ''})` : (v ? `${v.name} (${v.type || ''})` : vehId)
          return <span className="text-slate-400">{name || 'Unknown Vehicle'}</span>
        },
      },
      {
        header: 'Pax / Mode',
        render: (row: PricingItem) => (
          <div>
            <p className="font-semibold">{row.pax} Pax</p>
            {row.isBestDeal && <span className="text-[10px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded uppercase tracking-wider">Best Deal</span>}
          </div>
        ),
      },
      {
        header: 'Per Person',
        render: (row: PricingItem) => (
          <div>
            <p className="font-bold text-emerald-400">₹{(row.finalPricePerPerson || 0).toLocaleString()}</p>
            {Number(row.discountPercent) > 0 && (
              <p className="text-xs text-slate-500 line-through">₹{(row.pricePerPerson || 0).toLocaleString()}</p>
            )}
          </div>
        ),
      },
      {
        header: 'Total Price',
        render: (row: PricingItem) => <span className="font-bold text-slate-300">₹{(row.totalPrice || 0).toLocaleString()}</span>
      },
      {
        header: 'Status',
        render: (row: PricingItem) => (
          <span className={`px-2 py-1 text-xs rounded-lg font-medium ${row.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'}`}>
            {row.isActive ? 'Active' : 'Inactive'}
          </span>
        ),
      },
      {
        header: 'Actions',
        render: (row: PricingItem) => (
          <div className="flex items-center gap-2">
            <button className="btn-secondary btn-sm" onClick={() => openEdit(row)}>
              <Edit className="w-3.5 h-3.5" /> Edit
            </button>
            <button className="btn-danger btn-sm" onClick={() => { setSelectedId(row._id); setOpenDelete(true) }}>
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ),
      },
    ],
    [packages, vehicles]
  )

  return (
    <div className="page">
      <PageHeader
        title="Package Pricing"
        subtitle="Manage dynamic pricing rules for packages, vehicles, and occupancies"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Management' }, { label: 'Package Pricing' }]}
        action={
          <div className="flex gap-2">
            <button className="btn-secondary" onClick={loadData}>
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
            <button className="btn-primary" onClick={openCreate}>
              <Plus className="w-4 h-4" /> New Pricing Rule
            </button>
          </div>
        }
      />

      {/* Filter Bar */}
      <div className="card p-4 flex items-center gap-3">
        <label className="text-sm font-medium text-slate-400 shrink-0">Filter Package:</label>
        <select 
          className="input max-w-sm"
          value={packageFilter}
          onChange={(e) => { setPackageFilter(e.target.value); setPage(1) }}
        >
          <option value="">All Packages</option>
          {packages.map((p) => (
            <option key={p._id} value={p._id}>{p.basic?.name || p._id}</option>
          ))}
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
        emptyMessage="No pricing configurations found."
      />

      {/* Editor Modal */}
      <Modal
        open={openForm}
        onClose={() => setOpenForm(false)}
        title={selectedId ? 'Edit Pricing Rule' : 'Create Pricing Rule'}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setOpenForm(false)}>Cancel</button>
            <button className="btn-primary" onClick={saveForm} disabled={saving}>
              {saving ? <Spinner size="sm" /> : 'Save Pricing'}
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="label">Package *</label>
            <select className="input" value={form.packageId} onChange={(e) => setForm(pf => ({ ...pf, packageId: e.target.value }))}>
              <option value="">Select Package</option>
              {packages.map((p) => (
                <option key={p._id} value={p._id}>{p.basic?.name || p._id}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="label">Vehicle *</label>
            <select className="input" value={form.vehicleId} onChange={(e) => setForm(pf => ({ ...pf, vehicleId: e.target.value }))}>
              <option value="">Select Vehicle</option>
              {vehicles.map((v) => (
                <option key={v._id} value={v._id}>{v.name} ({v.type || 'Standard'})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Pax (Occupancy) *</label>
            <input 
              type="number" className="input" min="1"
              value={form.pax} onChange={(e) => setForm(pf => ({ ...pf, pax: Number(e.target.value) }))} 
            />
          </div>

          <div>
            <label className="label">Base Price Per Person *</label>
            <input 
              type="number" className="input" min="0" step="0.01"
              value={form.pricePerPerson} onChange={(e) => setForm(pf => ({ ...pf, pricePerPerson: Number(e.target.value) }))} 
            />
          </div>

          <div>
            <label className="label">Discount %</label>
            <input 
              type="number" className="input" min="0" max="100"
              value={form.discountPercent} onChange={(e) => setForm(pf => ({ ...pf, discountPercent: Number(e.target.value) }))} 
            />
          </div>

          <div>
            <label className="label">Final Price Per Person (Optional Override)</label>
            <input 
              type="number" className="input" min="0" step="0.01"
              placeholder="Auto-calculated if blank"
              value={form.finalPricePerPerson} onChange={(e) => setForm(pf => ({ ...pf, finalPricePerPerson: e.target.value === '' ? '' : Number(e.target.value) }))} 
            />
          </div>

          <div>
            <label className="label">Total Price (Optional Override)</label>
            <input 
              type="number" className="input" min="0" step="0.01"
              placeholder="Auto-calculated if blank"
              value={form.totalPrice} onChange={(e) => setForm(pf => ({ ...pf, totalPrice: e.target.value === '' ? '' : Number(e.target.value) }))} 
            />
          </div>

          <div className="md:col-span-2 pt-2 border-t border-surface-border mt-2 grid grid-cols-2 gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <Toggle checked={form.isBestDeal} onChange={(v) => setForm(pf => ({ ...pf, isBestDeal: v }))} />
              <span className="text-sm font-medium">Highlight as Best Deal</span>
            </label>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <Toggle checked={form.isActive} onChange={(v) => setForm(pf => ({ ...pf, isActive: v }))} />
              <span className="text-sm font-medium">Active (Visible)</span>
            </label>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={openDelete}
        onCancel={() => setOpenDelete(false)}
        onConfirm={confirmDelete}
        title="Delete Pricing Rule"
        message="Are you sure you want to completely remove this pricing rule? This action cannot be undone."
        loading={saving}
      />
    </div>
  )
}

export default PackagePricingPage
