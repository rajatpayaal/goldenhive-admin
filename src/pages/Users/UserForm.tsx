import React, { useEffect, useState } from 'react'
import { UserPayload } from '../../services/adminPanel.service'
import { UserFormData } from './service'

type Props = {
  mode: 'create' | 'edit'
  defaultValues?: Partial<UserFormData>
  saving?: boolean
  onSubmit: (form: UserFormData) => void
}

const initialForm: UserFormData = {
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

const UserForm: React.FC<Props> = ({ mode, defaultValues, saving, onSubmit }) => {
  const [form, setForm] = useState<UserFormData>(initialForm)

  useEffect(() => {
    setForm({
      ...initialForm,
      ...defaultValues,
      password: defaultValues?.password || '',
    })
  }, [defaultValues])

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

      {mode === 'create' ? (
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} />
        </div>
      ) : (
        <div className="md:col-span-2">
          <p className="text-xs text-text-tertiary">
            Note: password changes should use dedicated auth reset flows.
          </p>
        </div>
      )}

      <div>
        <label className="label">Mobile</label>
        <input className="input" value={form.mobile || ''} onChange={(e) => setForm((p) => ({ ...p, mobile: e.target.value }))} />
      </div>

      <div>
        <label className="label">Role</label>
        <select
          className="input"
          value={form.role}
          onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as UserPayload['role'] }))}
        >
          <option value="USER">USER</option>
          <option value="SALES_AGENT">SALES_AGENT</option>
          <option value="ADMIN">ADMIN</option>
        </select>
      </div>

      <label className="flex items-center gap-2">
        <input
          id="user-is-verified"
          type="checkbox"
          checked={Boolean(form.isVerified)}
          onChange={(e) => setForm((p) => ({ ...p, isVerified: e.target.checked }))}
        />
        <span className="text-sm text-text-secondary">Verified</span>
      </label>

      <label className="flex items-center gap-2">
        <input
          id="user-is-blocked"
          type="checkbox"
          checked={Boolean(form.isBlocked)}
          onChange={(e) => setForm((p) => ({ ...p, isBlocked: e.target.checked }))}
        />
        <span className="text-sm text-text-secondary">Blocked</span>
      </label>

      <div className="md:col-span-2 flex justify-end">
        <button className="btn-primary" disabled={saving} onClick={() => onSubmit(form)}>
          {mode === 'create' ? 'Create User' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

export default UserForm
