import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const roleColors = {
  admin: { bg: '#89b4fa20', text: '#89b4fa' },
  technician: { bg: '#fab38720', text: '#fab387' },
  viewer: { bg: '#a6adc820', text: '#a6adc8' },
};

const Users = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    role_id: 3,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      setError('');
      await api.post('/auth/register', form);
      setShowForm(false);
      setForm({ name: '', email: '', password: '', department: '', role_id: 3 });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create user');
    }
  };

  const handleRoleUpdate = async (id, role_id) => {
    try {
      await api.put(`/users/${id}`, { role_id: parseInt(role_id) });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete user');
    }
  };

  if (loading) return <div style={{ padding: '2rem', color: '#cdd6f4' }}>Loading...</div>;

  return (
    <div style={{ padding: '2rem', backgroundColor: '#1e1e2e', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: '#cdd6f4', fontSize: '22px', margin: '0 0 4px' }}>Users</h1>
          <p style={{ color: '#a6adc8', fontSize: '14px', margin: 0 }}>{users.length} total users</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#89b4fa',
            color: '#1e1e2e',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          {showForm ? 'Cancel' : '+ New User'}
        </button>
      </div>

      {showForm && (
        <div style={{ backgroundColor: '#313244', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
          <h2 style={{ color: '#cdd6f4', fontSize: '16px', marginBottom: '1rem' }}>New User</h2>
          {error && (
            <div style={{ backgroundColor: '#f38ba820', border: '1px solid #f38ba8', color: '#f38ba8', padding: '10px', borderRadius: '8px', marginBottom: '1rem', fontSize: '14px' }}>
              {error}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[
              { label: 'Full Name', key: 'name', type: 'text', placeholder: 'John Smith' },
              { label: 'Email', key: 'email', type: 'email', placeholder: 'john@company.com' },
              { label: 'Password', key: 'password', type: 'password', placeholder: '••••••••' },
              { label: 'Department', key: 'department', type: 'text', placeholder: 'IT' },
            ].map(field => (
              <div key={field.key}>
                <label style={{ display: 'block', color: '#cdd6f4', marginBottom: '6px', fontSize: '13px' }}>{field.label}</label>
                <input
                  type={field.type}
                  value={form[field.key]}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  style={{ width: '100%', padding: '8px 12px', backgroundColor: '#1e1e2e', border: '1px solid #45475a', borderRadius: '8px', color: '#cdd6f4', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
            ))}
            <div>
              <label style={{ display: 'block', color: '#cdd6f4', marginBottom: '6px', fontSize: '13px' }}>Role</label>
              <select
                value={form.role_id}
                onChange={(e) => setForm({ ...form, role_id: parseInt(e.target.value) })}
                style={{ width: '100%', padding: '8px 12px', backgroundColor: '#1e1e2e', border: '1px solid #45475a', borderRadius: '8px', color: '#cdd6f4', fontSize: '14px', boxSizing: 'border-box' }}
              >
                <option value={1}>Admin</option>
                <option value={2}>Technician</option>
                <option value={3}>Viewer</option>
              </select>
            </div>
          </div>
          <button
            onClick={handleCreate}
            style={{ marginTop: '1rem', padding: '8px 20px', backgroundColor: '#a6e3a1', color: '#1e1e2e', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
          >
            Create User
          </button>
        </div>
      )}

      <div style={{ backgroundColor: '#313244', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#45475a' }}>
              {['Name', 'Email', 'Department', 'Role', 'Joined', 'Update Role', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 16px', color: '#a6adc8', fontSize: '13px', fontWeight: '500', textAlign: 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#a6adc8', fontSize: '14px' }}>
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((u, i) => (
                <tr key={u.id} style={{ borderTop: '1px solid #45475a', backgroundColor: i % 2 === 0 ? 'transparent' : '#2a2a3a' }}>
                  <td style={{ padding: '12px 16px', color: '#cdd6f4', fontSize: '14px' }}>{u.name}</td>
                  <td style={{ padding: '12px 16px', color: '#a6adc8', fontSize: '14px' }}>{u.email}</td>
                  <td style={{ padding: '12px 16px', color: '#a6adc8', fontSize: '14px' }}>{u.department || '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      fontSize: '12px', padding: '2px 10px', borderRadius: '99px',
                      backgroundColor: roleColors[u.role]?.bg,
                      color: roleColors[u.role]?.text,
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#a6adc8', fontSize: '14px' }}>
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {u.id !== user.id && (
                      <select
                        value={u.role === 'admin' ? 1 : u.role === 'technician' ? 2 : 3}
                        onChange={(e) => handleRoleUpdate(u.id, e.target.value)}
                        style={{ padding: '4px 8px', backgroundColor: '#1e1e2e', border: '1px solid #45475a', borderRadius: '6px', color: '#cdd6f4', fontSize: '12px', cursor: 'pointer' }}
                      >
                        <option value={1}>Admin</option>
                        <option value={2}>Technician</option>
                        <option value={3}>Viewer</option>
                      </select>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {u.id !== user.id && (
                      <button
                        onClick={() => handleDelete(u.id)}
                        style={{ padding: '4px 12px', backgroundColor: '#f38ba820', color: '#f38ba8', border: '1px solid #f38ba8', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;