import { useEffect, useState } from 'react'
import * as adminApi from '../../api/admin'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    adminApi.listAllUsers().then((data) => setUsers(data.users)).catch((err) => setError(err.message))
  }, [])

  if (error) return <p className="error">{error}</p>

  return (
    <div>
      <h1>Users</h1>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Joined</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{new Date(user.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
