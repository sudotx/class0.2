import { useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import * as usersApi from '../api/users'

export default function Profile() {
  const { user, refreshMe } = useAuth()
  const [form, setForm] = useState({
    username: user.username,
    dateOfBirth: user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : '',
    phone: user.phone || '',
  })
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' })
  const [status, setStatus] = useState(null)
  const [error, setError] = useState(null)
  const passwordDialogRef = useRef(null)

  async function handleProfileSubmit(e) {
    e.preventDefault()
    setError(null)
    setStatus(null)
    try {
      await usersApi.updateMe(form)
      await refreshMe()
      setStatus('Profile updated.')
    } catch (err) {
      setError(err.message)
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault()
    setError(null)
    setStatus(null)
    try {
      await usersApi.updatePassword(passwordForm)
      setPasswordForm({ currentPassword: '', newPassword: '' })
      setStatus('Password updated.')
      passwordDialogRef.current?.close()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    try {
      await usersApi.uploadAvatar(file)
      await refreshMe()
      setStatus('Avatar updated.')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="card">
      <h1>Profile</h1>
      {status && <p className="success">{status}</p>}
      {error && <p className="error">{error}</p>}

      <div className="avatar-row">
        {user.avatarUrl && <img className="avatar" src={user.avatarUrl} alt="avatar" />}
        <label>
          Change avatar
          <input type="file" accept="image/*" onChange={handleAvatarChange} />
        </label>
      </div>

      <form onSubmit={handleProfileSubmit}>
        <label>
          Username
          <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        </label>
        <label>
          Date of birth
          <input
            type="date"
            value={form.dateOfBirth}
            onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
          />
        </label>
        <label>
          Phone
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </label>
        <button type="submit">Save profile</button>
      </form>

      <button type="button" className="link-button" onClick={() => passwordDialogRef.current?.showModal()}>
        Change password
      </button>

      <dialog ref={passwordDialogRef}>
        <h2>Change password</h2>
        <form onSubmit={handlePasswordSubmit}>
          <label>
            Current password
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              required
            />
          </label>
          <label>
            New password
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              required
              minLength={8}
            />
          </label>
          <div className="dialog-actions">
            <button type="button" onClick={() => passwordDialogRef.current?.close()}>
              Cancel
            </button>
            <button type="submit">Update password</button>
          </div>
        </form>
      </dialog>
    </div>
  )
}
