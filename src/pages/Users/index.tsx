import React, { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { Eye, Plus, ShieldAlert, Trash2, UserRoundPen } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import DataTable from '../../components/ui/DataTable'
import Modal from '../../components/ui/Modal'
import StatusBadge from '../../components/ui/StatusBadge'
import { ConfirmDialog, PageHeader } from '../../components/ui'
import { getUsers, removeUserRecord, updateUserRecord } from './service'

type UserRecord = {
  _id: string
  firstName: string
  lastName: string
  userName: string
  email: string
  mobile?: string
  role: string
  isBlocked?: boolean
  isVerified?: boolean
  createdAt?: string
}

const UsersPage: React.FC = () => {
  const navigate = useNavigate()
  const [items, setItems] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<UserRecord | null>(null)
  const [openProfile, setOpenProfile] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const loadUsers = () => {
    setLoading(true)
    getUsers({ page, limit: 10, search: search || undefined })
      .then((response) => {
        const payload = response.data?.data || response.data
        const users =
          payload?.items ||
          payload?.results ||
          payload?.users ||
          (payload?.user ? [payload.user] : []) ||
          (payload?._id ? [payload] : [])
        setItems(users)
        setTotalPages(payload?.totalPages || 1)
      })
      .catch(() => {
        toast.error('Failed to fetch users')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadUsers()
  }, [page, search])

  const removeUser = async () => {
    if (!deleteId) return
    setSaving(true)
    try {
      await removeUserRecord(deleteId)
      toast.success('User deleted')
      setDeleteId(null)
      loadUsers()
    } catch {
      toast.error('Failed to delete user')
    } finally {
      setSaving(false)
    }
  }

  const toggleBlock = async (user: UserRecord) => {
    setSaving(true)
    try {
      await updateUserRecord(user._id, { isBlocked: !user.isBlocked })
      toast.success(user.isBlocked ? 'User unblocked' : 'User blocked')
      loadUsers()
    } catch {
      toast.error('Failed to update user status')
    } finally {
      setSaving(false)
    }
  }

  const columns = useMemo(
    () => [
      {
        header: 'User',
        render: (row: UserRecord) => (
          <div>
            <p className="font-semibold text-text-primary">{row.firstName} {row.lastName}</p>
            <p className="text-xs text-text-secondary">@{row.userName}</p>
          </div>
        ),
      },
      { header: 'Email', render: (row: UserRecord) => <span>{row.email}</span> },
      { header: 'Role', render: (row: UserRecord) => <StatusBadge status={row.role} type="user" /> },
      {
        header: 'Status',
        render: (row: UserRecord) => (
          <span className={`badge ${row.isBlocked ? 'badge-danger' : 'badge-success'}`}>
            {row.isBlocked ? 'Blocked' : 'Active'}
          </span>
        ),
      },
      {
        header: 'Joined',
        render: (row: UserRecord) => (
          <span className="text-xs text-text-secondary">
            {row.createdAt ? format(new Date(row.createdAt), 'dd MMM yyyy') : '—'}
          </span>
        ),
      },
      {
        header: 'Actions',
        render: (row: UserRecord) => (
          <div className="flex items-center gap-2">
            <button
              className="btn-secondary btn-sm"
              onClick={() => {
                setSelected(row)
                setOpenProfile(true)
              }}
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
            <button className="btn-secondary btn-sm" onClick={() => navigate(`/users/${row._id}/edit`)}>
              <UserRoundPen className="h-3.5 w-3.5" />
            </button>
            <button className="btn-secondary btn-sm text-warning-400" onClick={() => toggleBlock(row)}>
              <ShieldAlert className="h-3.5 w-3.5" />
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
        title="Users"
        subtitle="Create, manage, and control user access"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Users' }]}
        action={
          <button className="btn-primary" onClick={() => navigate('/users/new')}>
            <Plus className="h-4 w-4" />
            Add User
          </button>
        }
      />

      <div className="card p-4">
        <input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
          className="input max-w-sm"
          placeholder="Search by name, email"
        />
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        keyExtractor={(row) => row._id}
        emptyMessage="No users found"
      />

      <Modal open={openProfile} onClose={() => setOpenProfile(false)} title="User Profile">
        {selected && (
          <div className="space-y-3 text-sm">
            <p className="text-text-primary"><strong>Name:</strong> {selected.firstName} {selected.lastName}</p>
            <p className="text-text-primary"><strong>Email:</strong> {selected.email}</p>
            <p className="text-text-primary"><strong>Username:</strong> @{selected.userName}</p>
            <p className="text-text-primary"><strong>Mobile:</strong> {selected.mobile || '—'}</p>
            <p className="text-text-primary"><strong>Role:</strong> {selected.role}</p>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteId)}
        onCancel={() => setDeleteId(null)}
        onConfirm={removeUser}
        title="Delete User"
        message="This permanently deletes the selected user if your backend supports DELETE /users/:id."
        confirmLabel="Delete"
        loading={saving}
      />
    </div>
  )
}

export default UsersPage
