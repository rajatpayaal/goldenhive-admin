import React, { useEffect, useMemo, useState } from 'react'
import { CarFront, Edit, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import DataTable from '../../components/ui/DataTable'
import { ConfirmDialog, PageHeader } from '../../components/ui'
import { deleteVehicle, fetchVehicles } from './service'

type VehicleItem = {
  _id: string
  name: string
  seat: number
  type?: string
  sortOrder: number
  image?: { url?: string }
  isActive: boolean
}

const VehiclesPage: React.FC = () => {
  const navigate = useNavigate()
  const [items, setItems] = useState<VehicleItem[]>([])
  const [loading, setLoading] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadData = () => {
    setLoading(true)
    fetchVehicles()
      .then((res) => {
        const d = res.data?.data || res.data
        setItems(d?.items || d || [])
      })
      .catch(() => toast.error('Failed to load vehicles'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [])

  const confirmDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteVehicle(deleteId)
      toast.success('Vehicle deleted')
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
        header: 'Vehicle',
        render: (row: VehicleItem) => (
          <div className="flex items-center gap-3">
            {row.image?.url ? (
              <img src={row.image.url} alt={row.name} className="h-12 w-12 rounded-lg bg-surface object-cover" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-surface-border bg-surface">
                <CarFront className="h-5 w-5 text-text-tertiary" />
              </div>
            )}
            <div>
              <p className="font-semibold text-text-secondary">{row.name}</p>
              <p className="text-xs text-text-tertiary">{row.type || 'Standard'}</p>
            </div>
          </div>
        ),
      },
      { header: 'Seats', render: (row: VehicleItem) => <span className="font-medium">{row.seat}</span> },
      { header: 'Sort Order', render: (row: VehicleItem) => <span className="text-text-tertiary">{row.sortOrder}</span> },
      {
        header: 'Status',
        render: (row: VehicleItem) => (
          <span className={`rounded-lg px-2 py-1 text-xs font-medium ${row.isActive ? 'bg-success-500/10 text-success-400' : 'bg-slate-500/10 text-text-tertiary'}`}>
            {row.isActive ? 'Active' : 'Inactive'}
          </span>
        ),
      },
      {
        header: 'Actions',
        render: (row: VehicleItem) => (
          <div className="flex items-center gap-2">
            <button className="btn-secondary btn-sm" onClick={() => navigate(`/vehicles/${row._id}/edit`)}>
              <Edit className="h-3.5 w-3.5" /> Edit
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
        title="Vehicles"
        subtitle="Manage your standard transport vehicles for packages and pricing options"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Management' }, { label: 'Vehicles' }]}
        action={
          <div className="flex gap-2">
            <button className="btn-secondary" onClick={loadData}>
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
            <button className="btn-primary" onClick={() => navigate('/vehicles/new')}>
              <Plus className="h-4 w-4" /> Add Vehicle
            </button>
          </div>
        }
      />

      <DataTable columns={columns} data={items} loading={loading} keyExtractor={(row) => row._id} emptyMessage="No vehicles found." />

      <ConfirmDialog
        open={Boolean(deleteId)}
        onCancel={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Vehicle"
        message="Are you sure you want to completely remove this vehicle? This action cannot be undone."
        loading={deleting}
      />
    </div>
  )
}

export default VehiclesPage
