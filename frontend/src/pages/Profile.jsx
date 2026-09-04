import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import * as usersApi from '../api/users'

export default function Profile() {
  const { user, refreshMe } = useAuth()
  const [form, setForm] = useState({
    username: user.username,
    dateOfBirth: user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : '',
    phone: user.phone || '',
    address: {
      line1: user.address?.line1 || '',
      city: user.address?.city || '',
      state: user.address?.state || '',
      country: user.address?.country || '',
      postalCode: user.address?.postalCode || '',
    },
  })
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' })
  const [status, setStatus] = useState(null)
  const [error, setError] = useState(null)

  function setAddress(field, value) {
    setForm({ ...form, address: { ...form.address, [field]: value } })
  }

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
        <fieldset>
          <legend>Address</legend>
          <label>
            Address line
            <input value={form.address.line1} onChange={(e) => setAddress('line1', e.target.value)} />
          </label>
          <label>
            City
            <input value={form.address.city} onChange={(e) => setAddress('city', e.target.value)} />
          </label>
          <label>
            State
            <input value={form.address.state} onChange={(e) => setAddress('state', e.target.value)} />
          </label>
          <label>
            Country
            <input value={form.address.country} onChange={(e) => setAddress('country', e.target.value)} />
          </label>
          <label>
            Postal code
            <input value={form.address.postalCode} onChange={(e) => setAddress('postalCode', e.target.value)} />
          </label>
        </fieldset>
        <button type="submit">Save profile</button>
      </form>

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
        <button type="submit">Update password</button>
      </form>
    </div>
  )
}
