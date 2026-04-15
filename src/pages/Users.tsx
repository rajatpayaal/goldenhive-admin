import React, { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { Eye, Plus, ShieldAlert, Trash2, UserRoundPen } from 'lucide-react'
import toast from 'react-hot-toast'
import DataTable from '../components/ui/DataTable'
import Modal from '../components/ui/Modal'
import StatusBadge from '../components/ui/StatusBadge'
import { ConfirmDialog, PageHeader } from '../components/ui'
import { createUser, deleteUserById, listUsers, updateUserById, UserPayload } from '../services/adminPanel.service'

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

type UserFormState = UserPayload & {
  password: string
}

const emptyForm: UserFormState = {
  firstName: '',
  lastName: '',
  userName: '',
  email: '',
  password: '',
  mobile: '',
  role: 'USER',
  isBlocked: false,
  isVerified: true,
}

const UsersPage: React.FC = () => {
  const [items, setItems] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<UserRecord | null>(null)

  const [openProfile, setOpenProfile] = useState(false)
  const [openEditor, setOpenEditor] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [saving, setSaving] = useState(false)

  const [editing, setEditing] = useState<UserRecord | null>(null)
  const [form, setForm] = useState<UserFormState>(emptyForm)

  const loadUsers = () => {
    setLoading(true)
    listUsers({ page, limit: 10, search: search || undefined })
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

  const startCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setOpenEditor(true)
  }

  const startEdit = (user: UserRecord) => {
    setEditing(user)
    setForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      userName: user.userName || '',
      email: user.email || '',
      password: '',
      mobile: user.mobile || '',
      role: (user.role as UserPayload['role']) || 'USER',
      isBlocked: Boolean(user.isBlocked),
      isVerified: Boolean(user.isVerified),
    })
    setOpenEditor(true)
  }

  const submitForm = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.userName) {
      toast.error('Please fill required fields')
      return
    }

    setSaving(true)
    try {
      if (!editing) {
        if (!form.password) {
          toast.error('Password is required for new user')
          setSaving(false)
          return
        }
        await createUser(form)
        toast.success('User registration initiated. OTP verification required.')
      } else {
        const updatePayload: Partial<UserPayload> = {
          firstName: form.firstName,
          lastName: form.lastName,
          userName: form.userName,
          email: form.email,
          mobile: form.mobile,
          role: form.role,
          isBlocked: Boolean(form.isBlocked),
          isVerified: Boolean(form.isVerified),
        }
        await updateUserById(editing._id, updatePayload)
        toast.success('User updated')
      }

      setOpenEditor(false)
      loadUsers()
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Unable to save user')
    } finally {
      setSaving(false)
    }
  }

  const removeUser = async () => {
    if (!selected) return
    setSaving(true)
    try {
      await deleteUserById(selected._id)
      toast.success('User deleted')
      setOpenDelete(false)
      setSelected(null)
      loadUsers()
    } catch {
      toast.error('Failed to delete user')
    } finally {
      setSaving(false)
    }
  }

  const toggleBlock = async (_user: UserRecord) => {
    setSaving(true)
    try {
      await updateUserById(_user._id, { isBlocked: !_user.isBlocked })
      toast.success(_user.isBlocked ? 'User unblocked' : 'User blocked')
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
            <p className="font-semibold text-slate-100">{row.firstName} {row.lastName}</p>
            <p className="text-xs text-slate-400">@{row.userName}</p>
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
          <span className="text-xs text-slate-400">
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
            <button className="btn-secondary btn-sm" onClick={() => startEdit(row)}>
              <UserRoundPen className="h-3.5 w-3.5" />
            </button>
            <button className="btn-secondary btn-sm text-amber-300" onClick={() => toggleBlock(row)}>
              <ShieldAlert className="h-3.5 w-3.5" />
            </button>
            <button
              className="btn-danger btn-sm"
              onClick={() => {
                setSelected(row)
                setOpenDelete(true)
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ),
      },
    ],
    [saving]
  )

  return (
    <div className="page">
      <PageHeader
        title="Users"
        subtitle="Create, manage, and control user access"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Users' }]}
        action={
          <button className="btn-primary" onClick={startCreate}>
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
            <p className="text-slate-100"><strong>Name:</strong> {selected.firstName} {selected.lastName}</p>
            <p className="text-slate-100"><strong>Email:</strong> {selected.email}</p>
            <p className="text-slate-100"><strong>Username:</strong> @{selected.userName}</p>
            <p className="text-slate-100"><strong>Mobile:</strong> {selected.mobile || '—'}</p>
            <p className="text-slate-100"><strong>Role:</strong> {selected.role}</p>
          </div>
        )}
      </Modal>

      <Modal
        open={openEditor}
        onClose={() => setOpenEditor(false)}
        title={editing ? 'Edit User' : 'Create User'}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setOpenEditor(false)}>Cancel</button>
            <button className="btn-primary" onClick={submitForm} disabled={saving}>
              {editing ? 'Save Changes' : 'Create User'}
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="label">First Name</label>
            <input className="input" value={form.firstName} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} />
          </div>
          <div>
            <label className="label">Last Name</label>
            <input className="input" value={form.lastName} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} />
          </div>
          <div>
            <label className="label">Username</label>
            <input className="input" value={form.userName} onChange={(e) => setForm((p) => ({ ...p, userName: e.target.value }))} />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
          </div>
          {!editing ? (
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} />
            </div>
          ) : (
            <div className="md:col-span-2">
              <p className="text-xs text-slate-400">
                Note: changing password is handled via user self-service flows (OTP / reset-password).
              </p>
            </div>
          )}

          <div>
            <label className="label">Mobile</label>
            <input className="input" value={form.mobile || ''} onChange={(e) => setForm((p) => ({ ...p, mobile: e.target.value }))} />
          </div>
          <div>
            <label className="label">Role</label>
            <select className="input" value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as UserPayload['role'] }))}>
              <option value="USER">USER</option>
              <option value="SALES_AGENT">SALES_AGENT</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="user-is-verified"
              type="checkbox"
              checked={Boolean(form.isVerified)}
              onChange={(e) => setForm((p) => ({ ...p, isVerified: e.target.checked }))}
            />
            <label htmlFor="user-is-verified" className="text-sm text-slate-200">
              Verified
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="user-is-blocked"
              type="checkbox"
              checked={Boolean(form.isBlocked)}
              onChange={(e) => setForm((p) => ({ ...p, isBlocked: e.target.checked }))}
            />
            <label htmlFor="user-is-blocked" className="text-sm text-slate-200">
              Blocked
            </label>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={openDelete}
        onCancel={() => setOpenDelete(false)}
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
