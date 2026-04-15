import React, { useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import DataTable from '../../components/ui/DataTable'
import { ConfirmDialog, PageHeader } from '../../components/ui'
import { deleteAboutUs, listAboutUs } from './service'

const AboutUsPage: React.FC = () => {
  const navigate = useNavigate()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = () => {
    setLoading(true)
    listAboutUs()
      .then((r) => setItems(r.data?.data || r.data || []))
      .catch(() => toast.error('Failed to load About Us records'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const remove = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteAboutUs(deleteId)
      toast.success('Document deleted')
      setDeleteId(null)
      load()
    } catch {
      toast.error('Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  const columns = useMemo(
    () => [
      {
        header: 'Hero Title',
        render: (r: any) => <span className="font-bold text-text-secondary">{r.heroTitle || 'Untitled'}</span>,
      },
      {
        header: 'Mission Length',
        render: (r: any) => <span className="text-text-tertiary">{(r.missionStatement || '').length} chars</span>,
      },
      {
        header: 'Config Nodes',
        render: (r: any) => (
          <div className="text-xs text-brand-400">
            {r.coreValues?.length || 0} Values, {r.leadershipTeam?.length || 0} Leaders, {r.stats?.length || 0} Stats
          </div>
        ),
      },
      {
        header: 'Actions',
        render: (r: any) => (
          <div className="flex gap-2">
            <button className="btn-secondary btn-sm" onClick={() => navigate(`/about-us/${r._id}/edit`)}>
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button className="btn-danger btn-sm" onClick={() => setDeleteId(r._id)}>
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
        title="About Us CMS"
        subtitle="Complete schema builder for the About Us application component"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'About Us' }]}
        action={
          <button
            className="btn-primary"
            onClick={() => {
              if (items.length > 0) {
                toast.error('About Us document already exists. Only one singleton is allowed.')
                return
              }
              navigate('/about-us/new')
            }}
          >
            <Plus className="w-4 h-4" /> Instantiate Master Document
          </button>
        }
      />

      <DataTable columns={columns} data={items} loading={loading} keyExtractor={(r: any) => r._id} emptyMessage="No About Us record found in registry." />

      <ConfirmDialog
        open={Boolean(deleteId)}
        onCancel={() => setDeleteId(null)}
        onConfirm={remove}
        title="Destroy Record"
        message="Executing this drops all arrays and unmounts the About Us mapping permanently."
        loading={deleting}
      />
    </div>
  )
}

export default AboutUsPage
