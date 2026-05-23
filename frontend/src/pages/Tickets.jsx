import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import PageLoader from '../components/PageLoader';

const STATUS_CLS = {
  open: 'text-[#ef4444] bg-[#ef4444]/10 border-[#ef4444]/25',
  in_progress: 'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/25',
  resolved: 'text-[#22c55e] bg-[#22c55e]/10 border-[#22c55e]/25',
  closed: 'text-[#57534e] bg-[#a1a1aa]/10 border-[#a1a1aa]/25',
};
const PRIORITY_CLS = {
  low: 'text-[#22c55e] bg-[#22c55e]/10 border-[#22c55e]/25',
  medium: 'text-[#3b82f6] bg-[#3b82f6]/10 border-[#3b82f6]/25',
  high: 'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/25',
  critical: 'text-[#ef4444] bg-[#ef4444]/10 border-[#ef4444]/25',
};

const Pill = ({ label, map }) => (
  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${map[label] || 'text-[#57534e] bg-[#a1a1aa]/10 border-[#a1a1aa]/25'}`}>
    {label.replace('_', ' ')}
  </span>
);

const inputCls = 'w-full rounded-xl border border-[#e7e5e4] bg-white px-3.5 py-2.5 text-sm text-[#1c1917] placeholder:text-[#a8a29e] outline-none transition focus:border-[#3b82f6]/60 focus:ring-2 focus:ring-[#3b82f6]/20 box-border';
const labelCls = 'mb-1.5 block text-xs font-medium text-[#57534e]';

const SearchIcon = () => (
  <svg className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a8a29e]" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
);

const SparkleIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" />
  </svg>
);

const Tickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [form, setForm] = useState({ title: '', description: '', asset_id: '', priority: 'medium' });

  useEffect(() => { fetchTickets(); fetchAssets(); }, []);

  const fetchTickets = async () => {
    try { const r = await api.get('/tickets'); setTickets(r.data); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };
  const fetchAssets = async () => {
    try { const r = await api.get('/assets'); setAssets(r.data); }
    catch (e) { console.error(e); }
  };

  const handleCreate = async () => {
    setError('');
    const missing = [];
    if (!form.title.trim()) missing.push('Title');
    if (!form.asset_id) missing.push('Asset');
    if (!form.description.trim()) missing.push('Description');
    if (missing.length) return setError(`Required: ${missing.join(', ')}`);
    try {
      await api.post('/tickets', form);
      setShowForm(false);
      setForm({ title: '', description: '', asset_id: '', priority: 'medium' });
      fetchTickets();
    } catch (e) { setError(e.response?.data?.error || 'Failed to create ticket'); }
  };

  const handleStatusUpdate = async (id, status) => {
    try { await api.put(`/tickets/${id}`, { status }); fetchTickets(); }
    catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this ticket?')) return;
    try { await api.delete(`/tickets/${id}`); fetchTickets(); }
    catch (e) { console.error(e); }
  };

  const filtered = tickets.filter(t => {
    const s = search.toLowerCase();
    const matchSearch = !s || t.title.toLowerCase().includes(s) || (t.asset_name || '').toLowerCase().includes(s);
    return matchSearch && (!filterStatus || t.status === filterStatus) && (!filterPriority || t.priority === filterPriority);
  });
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const hasFilters = search || filterStatus || filterPriority;

  if (loading) return <PageLoader variant="table" title="Loading tickets" subtitle="Refreshing incidents, AI suggestions, and status updates..." />;

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-350 space-y-5">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1c1917]">Tickets</h1>
            <p className="mt-0.5 text-sm text-[#78716c]">{filtered.length} of {tickets.length} tickets</p>
          </div>
          {['admin', 'technician'].includes(user.role) && (
            <button onClick={() => setShowForm(v => !v)}
              className="rounded-xl bg-[#3b82f6] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2563eb] active:scale-95">
              {showForm ? 'Cancel' : '+ New Ticket'}
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2.5">
          <div className="relative min-w-50 flex-2">
            <SearchIcon />
            <input className={`${inputCls} pl-9`} type="text" placeholder="Search by title or asset..."
              value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} />
          </div>
          <select className={`${inputCls} min-w-37.5 flex-1 cursor-pointer`} value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}>
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select className={`${inputCls} min-w-37.5 flex-1 cursor-pointer`} value={filterPriority}
            onChange={e => { setFilterPriority(e.target.value); setCurrentPage(1); }}>
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          {hasFilters && (
            <button onClick={() => { setSearch(''); setFilterStatus(''); setFilterPriority(''); setCurrentPage(1); }}
              className="rounded-xl border border-[#e7e5e4] bg-transparent px-4 py-2.5 text-sm text-[#57534e] transition hover:bg-[#f5f5f4] hover:text-[#1c1917]">
              Clear
            </button>
          )}
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="rounded-2xl border border-[#e7e5e4] bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold text-[#1c1917]">New Ticket</h2>
            {error && (
              <div className="mb-4 rounded-xl border border-[#ef4444]/30 bg-[#ef4444]/10 px-4 py-2.5 text-sm text-[#ef4444]">{error}</div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Title *</label>
                <input type="text" value={form.title} placeholder="Screen not turning on"
                  onChange={e => setForm({ ...form, title: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Asset *</label>
                <select value={form.asset_id} onChange={e => setForm({ ...form, asset_id: e.target.value })} className={`${inputCls} cursor-pointer`}>
                  <option value="">Select asset</option>
                  {assets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Priority</label>
                <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className={`${inputCls} cursor-pointer`}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Description *</label>
                <input type="text" value={form.description} placeholder="Describe the issue..."
                  onChange={e => setForm({ ...form, description: e.target.value })} className={inputCls} />
              </div>
            </div>
            <p className="mt-3 text-xs text-[#78716c]">AI will analyze this ticket and suggest a priority and category automatically.</p>
            <button onClick={handleCreate}
              className="mt-4 rounded-xl bg-[#22c55e] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#16a34a] active:scale-95">
              Create Ticket
            </button>
          </div>
        )}

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-[#e7e5e4] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#e7e5e4]">
                  {['Title', 'Asset', 'Priority', 'AI Analysis', 'Status', 'Reporter', 'Update Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-widest text-[#78716c]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f5f4]">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-sm text-[#a8a29e]">
                      {tickets.length === 0 ? 'No tickets yet — create your first one above.' : 'No tickets match your filters.'}
                    </td>
                  </tr>
                ) : paginated.map(ticket => (
                  <tr key={ticket.id} className="transition-colors hover:bg-[#f5f5f4]">
                    <td className="max-w-50 px-5 py-4">
                      <Link to={`/tickets/${ticket.id}`} className="block truncate font-medium text-[#1c1917] hover:text-[#3b82f6] transition-colors">
                        {ticket.title}
                      </Link>
                      {ticket.ai_grade && (
                        <span className={`mt-1 inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                          ['A','B'].includes(ticket.ai_grade) ? 'bg-[#22c55e]/15 text-[#22c55e]' :
                          ticket.ai_grade === 'C' ? 'bg-[#f59e0b]/15 text-[#f59e0b]' :
                          'bg-[#ef4444]/15 text-[#ef4444]'
                        }`}>
                          Grade {ticket.ai_grade}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-[#57534e]">{ticket.asset_name || '—'}</td>
                    <td className="px-5 py-4">
                      <Pill label={ticket.priority} map={PRIORITY_CLS} />
                    </td>
                    <td className="px-5 py-4">
                      {ticket.ai_priority_suggestion ? (
                        <div className="rounded-lg border border-[#a78bfa]/20 bg-[#a78bfa]/5 px-3 py-2 space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[#a78bfa]"><SparkleIcon /></span>
                            <Pill label={ticket.ai_priority_suggestion} map={PRIORITY_CLS} />
                            {ticket.ai_category && (
                              <span className="text-[10px] text-[#78716c]">{ticket.ai_category}</span>
                            )}
                          </div>
                          {ticket.ai_recommendation && (
                            <p className="text-[11px] leading-snug text-[#57534e]">{ticket.ai_recommendation}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-[#a8a29e]">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <Pill label={ticket.status} map={STATUS_CLS} />
                    </td>
                    <td className="px-5 py-4 text-[#57534e]">{ticket.reporter_name || '—'}</td>
                    <td className="px-5 py-4">
                      {['admin', 'technician'].includes(user.role) && (
                        <select value={ticket.status} onChange={e => handleStatusUpdate(ticket.id, e.target.value)}
                          className="rounded-lg border border-[#e7e5e4] bg-white px-2.5 py-1.5 text-xs text-[#1c1917] outline-none transition focus:border-[#3b82f6]/50 cursor-pointer">
                          <option value="open">Open</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {user.role === 'admin' && (
                        <button onClick={() => handleDelete(ticket.id)}
                          className="rounded-lg border border-[#ef4444]/30 bg-[#ef4444]/10 px-3 py-1 text-xs font-medium text-[#ef4444] transition hover:bg-[#ef4444]/20">
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-[#e7e5e4] px-5 py-3.5">
              <span className="text-xs text-[#78716c]">Page {currentPage} of {totalPages} · {filtered.length} results</span>
              <div className="flex gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                  className="rounded-lg border border-[#e7e5e4] bg-transparent px-3 py-1.5 text-xs font-medium text-[#57534e] transition enabled:hover:bg-[#e7e5e4] disabled:opacity-40">
                  Previous
                </button>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  className="rounded-lg bg-[#3b82f6] px-3 py-1.5 text-xs font-medium text-white transition enabled:hover:bg-[#2563eb] disabled:opacity-40">
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tickets;
