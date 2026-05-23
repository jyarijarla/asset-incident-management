import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import PageLoader from '../components/PageLoader';

const ROLE_CLS = {
  admin: 'text-[#3b82f6] bg-[#3b82f6]/10 border-[#3b82f6]/25',
  technician: 'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/25',
  viewer: 'text-[#a1a1aa] bg-[#a1a1aa]/10 border-[#a1a1aa]/25',
};

const inputCls = 'w-full rounded-xl border border-[#3f3f46] bg-[#0f0f13] px-3.5 py-2.5 text-sm text-[#fafafa] placeholder:text-[#52525b] outline-none transition focus:border-[#3b82f6]/60 focus:ring-2 focus:ring-[#3b82f6]/20 box-border';
const labelCls = 'mb-1.5 block text-xs font-medium text-[#a1a1aa]';

const Users = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '', role_id: 3 });

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try { const r = await api.get('/users'); setUsers(r.data); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    try {
      setError('');
      await api.post('/auth/register', form);
      setShowForm(false);
      setForm({ name: '', email: '', password: '', department: '', role_id: 3 });
      fetchUsers();
    } catch (e) { setError(e.response?.data?.error || 'Failed to create user'); }
  };

  const handleRoleUpdate = async (id, role_id) => {
    try { await api.put(`/users/${id}`, { role_id: parseInt(role_id) }); fetchUsers(); }
    catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this user?')) return;
    try { await api.delete(`/users/${id}`); fetchUsers(); }
    catch (e) { setError(e.response?.data?.error || 'Failed to remove user'); }
  };

  const initials = (name) => name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';

  if (loading) return <PageLoader variant="table" title="Loading users" subtitle="Syncing team members and role assignments..." />;

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-350 space-y-5">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#fafafa]">Team</h1>
            <p className="mt-0.5 text-sm text-[#71717a]">{users.length} member{users.length !== 1 ? 's' : ''} in your organization</p>
          </div>
          <button onClick={() => setShowForm(v => !v)}
            className="rounded-xl bg-[#3b82f6] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2563eb] active:scale-95">
            {showForm ? 'Cancel' : '+ Invite Member'}
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="rounded-2xl border border-[#3f3f46]/60 bg-[#18181b] p-6">
            <h2 className="mb-4 text-sm font-semibold text-[#fafafa]">New Team Member</h2>
            {error && (
              <div className="mb-4 rounded-xl border border-[#ef4444]/30 bg-[#ef4444]/10 px-4 py-2.5 text-sm text-[#ef4444]">{error}</div>
            )}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Jane Smith' },
                { label: 'Email', key: 'email', type: 'email', placeholder: 'jane@company.com' },
                { label: 'Password', key: 'password', type: 'password', placeholder: '••••••••' },
                { label: 'Department', key: 'department', type: 'text', placeholder: 'Engineering' },
              ].map(f => (
                <div key={f.key}>
                  <label className={labelCls}>{f.label}</label>
                  <input type={f.type} value={form[f.key]} placeholder={f.placeholder}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })} className={inputCls} />
                </div>
              ))}
              <div>
                <label className={labelCls}>Role</label>
                <select value={form.role_id} onChange={e => setForm({ ...form, role_id: parseInt(e.target.value) })} className={`${inputCls} cursor-pointer`}>
                  <option value={1}>Admin</option>
                  <option value={2}>Technician</option>
                  <option value={3}>Viewer</option>
                </select>
              </div>
            </div>
            <button onClick={handleCreate}
              className="mt-5 rounded-xl bg-[#22c55e] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#16a34a] active:scale-95">
              Add Member
            </button>
          </div>
        )}

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-[#3f3f46]/60 bg-[#18181b]">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#3f3f46]/60">
                  {['Member', 'Email', 'Department', 'Role', 'Joined', 'Change Role', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-widest text-[#71717a]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3f3f46]/40">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-sm text-[#3f3f46]">No team members yet.</td>
                  </tr>
                ) : users.map(u => (
                  <tr key={u.id} className="transition-colors hover:bg-white/3">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#3b82f6]/15 text-xs font-semibold text-[#3b82f6]">
                          {initials(u.name)}
                        </div>
                        <span className="font-medium text-[#fafafa]">{u.name}</span>
                        {u.id === user.id && (
                          <span className="rounded-full border border-[#3b82f6]/25 bg-[#3b82f6]/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#3b82f6]">you</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[#a1a1aa]">{u.email}</td>
                    <td className="px-5 py-3.5 text-[#a1a1aa]">{u.department || '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${ROLE_CLS[u.role] || 'text-[#a1a1aa] bg-[#a1a1aa]/10 border-[#a1a1aa]/25'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[#a1a1aa]">
                      {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3.5">
                      {u.id !== user.id && (
                        <select value={u.role === 'admin' ? 1 : u.role === 'technician' ? 2 : 3}
                          onChange={e => handleRoleUpdate(u.id, e.target.value)}
                          className="rounded-lg border border-[#3f3f46] bg-[#0f0f13] px-2.5 py-1.5 text-xs text-[#fafafa] outline-none transition focus:border-[#3b82f6]/50 cursor-pointer">
                          <option value={1}>Admin</option>
                          <option value={2}>Technician</option>
                          <option value={3}>Viewer</option>
                        </select>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {u.id !== user.id && (
                        <button onClick={() => handleDelete(u.id)}
                          className="rounded-lg border border-[#ef4444]/30 bg-[#ef4444]/10 px-3 py-1 text-xs font-medium text-[#ef4444] transition hover:bg-[#ef4444]/20">
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Users;
