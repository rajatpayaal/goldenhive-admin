import React, { useEffect, useMemo, useState } from 'react'
import { Edit, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import DataTable from '../../components/ui/DataTable'
import { ConfirmDialog, PageHeader } from '../../components/ui'
import { deletePackagePricing, fetchPackagePricing, fetchPackages, fetchVehicles } from './service'

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

const PackagePricingPage: React.FC = () => {
  const navigate = useNavigate()
  const [items, setItems] = useState<PricingItem[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [packageFilter, setPackageFilter] = useState('')
  const [packages, setPackages] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadDependencies = async () => {
    try {
      const [resPkg, resVeh] = await Promise.all([fetchPackages({ limit: 100 }), fetchVehicles()])
      setPackages(resPkg.data?.data?.items || resPkg.data?.items || resPkg.data?.data || resPkg.data || [])
      setVehicles(resVeh.data?.data?.items || resVeh.data?.items || resVeh.data?.data || resVeh.data || [])
    } catch {
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

  const confirmDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deletePackagePricing(deleteId)
      toast.success('Pricing deleted')
      setDeleteId(null)
      loadData()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  const columns = useMemo(
    () => [
      {
        header: 'Package',
        render: (row: PricingItem) => {
          const pkgId = typeof row.packageId === 'object' ? row.packageId?._id : row.packageId
          const p = packages.find((pkg) => pkg._id === pkgId)
          const name = typeof row.packageId === 'object' && row.packageId?.basic?.name ? row.packageId.basic.name : (p?.basic?.name || pkgId)
          return <span className="font-medium text-text-secondary">{name || 'Unknown Package'}</span>
        },
      },
      {
        header: 'Vehicle',
        render: (row: PricingItem) => {
          const vehId = typeof row.vehicleId === 'object' ? row.vehicleId?._id : row.vehicleId
          const v = vehicles.find((veh) => veh._id === vehId)
          const name = typeof row.vehicleId === 'object' && row.vehicleId?.name ? `${row.vehicleId.name} (${row.vehicleId.type || ''})` : (v ? `${v.name} (${v.type || ''})` : vehId)
          return <span className="text-text-tertiary">{name || 'Unknown Vehicle'}</span>
        },
      },
      {
        header: 'Pax / Mode',
        render: (row: PricingItem) => (
          <div>
            <p className="font-semibold">{row.pax} Pax</p>
            {row.isBestDeal && <span className="rounded bg-orange-500/20 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-orange-400">Best Deal</span>}
          </div>
        ),
      },
      {
        header: 'Per Person',
        render: (row: PricingItem) => (
          <div>
            <p className="font-bold text-emerald-400">₹{(row.finalPricePerPerson || 0).toLocaleString()}</p>
            {Number(row.discountPercent) > 0 && <p className="text-xs text-slate-500 line-through">₹{(row.pricePerPerson || 0).toLocaleString()}</p>}
          </div>
        ),
      },
      { header: 'Total Price', render: (row: PricingItem) => <span className="font-bold text-text-secondary">₹{(row.totalPrice || 0).toLocaleString()}</span> },
      {
        header: 'Status',
        render: (row: PricingItem) => (
          <span className={`rounded-lg px-2 py-1 text-xs font-medium ${row.isActive ? 'bg-success-500/10 text-success-400' : 'bg-slate-500/10 text-text-tertiary'}`}>
            {row.isActive ? 'Active' : 'Inactive'}
          </span>
        ),
      },
      {
        header: 'Actions',
        render: (row: PricingItem) => (
          <div className="flex items-center gap-2">
            <button className="btn-secondary btn-sm" onClick={() => navigate(`/package-pricing/${row._id}/edit`)}>
              <Edit className="h-3.5 w-3.5" /> Edit
            </button>
            <button className="btn-danger btn-sm" onClick={() => setDeleteId(row._id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ),
      },
    ],
    [navigate, packages, vehicles]
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
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
            <button className="btn-primary" onClick={() => navigate('/package-pricing/new')}>
              <Plus className="h-4 w-4" /> New Pricing Rule
            </button>
          </div>
        }
      />

      <div className="card flex items-center gap-3 p-4">
        <label className="shrink-0 text-sm font-medium text-text-tertiary">Filter Package:</label>
        <select className="input max-w-sm" value={packageFilter} onChange={(e) => { setPackageFilter(e.target.value); setPage(1) }}>
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

      <ConfirmDialog
        open={Boolean(deleteId)}
        onCancel={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Pricing Rule"
        message="Are you sure you want to completely remove this pricing rule? This action cannot be undone."
        loading={deleting}
      />
    </div>
  )
}

export default PackagePricingPage
