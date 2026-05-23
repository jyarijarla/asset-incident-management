import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import PageLoader from '../components/PageLoader';

const STATUS_CLASSES = {
  active: 'text-[#22c55e] bg-[#22c55e]/10 border-[#22c55e]/25',
  inactive: 'text-[#57534e] bg-[#a1a1aa]/10 border-[#a1a1aa]/25',
  under_maintenance: 'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/25',
};

const inputCls = 'w-full rounded-xl border border-[#e7e5e4] bg-white px-3.5 py-2.5 text-sm text-[#1c1917] placeholder:text-[#a8a29e] outline-none transition focus:border-[#3b82f6]/60 focus:ring-2 focus:ring-[#3b82f6]/20 box-border';
const labelCls = 'mb-1.5 block text-xs font-medium text-[#57534e]';

const SearchIcon = () => (
  <svg className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a8a29e]" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
);

const Assets = () => {
  const { user } = useAuth();
  const [assets, setAssets] = useState([]);
  const [assetTypes, setAssetTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [form, setForm] = useState({ name: '', asset_type_id: '', serial_number: '', status: 'active', location: '', purchase_date: '' });

  useEffect(() => { fetchAssets(); fetchAssetTypes(); }, []);

  const fetchAssets = async () => {
    try { const r = await api.get('/assets'); setAssets(r.data); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchAssetTypes = async () => {
    try { const r = await api.get('/assets/types'); setAssetTypes(r.data); }
    catch { setAssetTypes([]); }
  };

  const handleCreate = async () => {
    setError('');
    const missing = [];
    if (!form.name.trim()) missing.push('Asset Name');
    if (!form.serial_number.trim()) missing.push('Serial Number');
    if (!form.asset_type_id) missing.push('Asset Type');
    if (missing.length) return setError(`Required: ${missing.join(', ')}`);
    try {
      await api.post('/assets', form);
      setShowForm(false);
      setForm({ name: '', asset_type_id: '', serial_number: '', status: 'active', location: '', purchase_date: '' });
      fetchAssets();
    } catch (e) { setError(e.response?.data?.error || 'Failed to create asset'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this asset?')) return;
    try { await api.delete(`/assets/${id}`); fetchAssets(); }
    catch (e) { console.error(e); }
  };

  const uniqueTypes = [...new Set(assets.map(a => a.asset_type).filter(Boolean))];
  const filtered = assets.filter(a => {
    const s = search.toLowerCase();
    const matchSearch = !s || a.name.toLowerCase().includes(s) || (a.serial_number || '').toLowerCase().includes(s);
    return matchSearch && (!filterStatus || a.status === filterStatus) && (!filterType || a.asset_type === filterType);
  });
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const hasFilters = search || filterStatus || filterType;

  if (loading) return <PageLoader variant="table" title="Loading assets" subtitle="Fetching inventory and table data..." />;

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-350 space-y-5">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1c1917]">Assets</h1>
            <p className="mt-0.5 text-sm text-[#78716c]">{filtered.length} of {assets.length} assets</p>
          </div>
          {user.role === 'admin' && (
            <button onClick={() => setShowForm(v => !v)}
              className="rounded-xl bg-[#3b82f6] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2563eb] active:scale-95">
              {showForm ? 'Cancel' : '+ New Asset'}
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2.5">
          <div className="relative min-w-50 flex-2">
            <SearchIcon />
            <input className={`${inputCls} pl-9`} type="text" placeholder="Search by name or serial number..."
              value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} />
          </div>
          <select className={`${inputCls} min-w-37.5 flex-1 cursor-pointer`} value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}>
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="under_maintenance">Under Maintenance</option>
          </select>
          <select className={`${inputCls} min-w-37.5 flex-1 cursor-pointer`} value={filterType}
            onChange={e => { setFilterType(e.target.value); setCurrentPage(1); }}>
            <option value="">All Types</option>
            {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          {hasFilters && (
            <button onClick={() => { setSearch(''); setFilterStatus(''); setFilterType(''); setCurrentPage(1); }}
              className="rounded-xl border border-[#e7e5e4] bg-transparent px-4 py-2.5 text-sm text-[#57534e] transition hover:bg-[#f5f5f4] hover:text-[#1c1917]">
              Clear
            </button>
          )}
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="rounded-2xl border border-[#e7e5e4] bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold text-[#1c1917]">New Asset</h2>
            {error && (
              <div className="mb-4 rounded-xl border border-[#ef4444]/30 bg-[#ef4444]/10 px-4 py-2.5 text-sm text-[#ef4444]">{error}</div>
            )}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { label: 'Asset Name *', key: 'name', type: 'text', placeholder: 'MacBook Pro' },
                { label: 'Serial Number *', key: 'serial_number', type: 'text', placeholder: 'MBP-2024-001' },
                { label: 'Location', key: 'location', type: 'text', placeholder: 'Office A' },
                { label: 'Purchase Date', key: 'purchase_date', type: 'date', placeholder: '' },
              ].map(f => (
                <div key={f.key}>
                  <label className={labelCls}>{f.label}</label>
                  <input type={f.type} value={form[f.key]} placeholder={f.placeholder}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })} className={inputCls} />
                </div>
              ))}
              <div>
                <label className={labelCls}>Asset Type *</label>
                <select value={form.asset_type_id} onChange={e => setForm({ ...form, asset_type_id: e.target.value })} className={`${inputCls} cursor-pointer`}>
                  <option value="">Select type</option>
                  {assetTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className={`${inputCls} cursor-pointer`}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="under_maintenance">Under Maintenance</option>
                </select>
              </div>
            </div>
            <button onClick={handleCreate}
              className="mt-5 rounded-xl bg-[#22c55e] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#16a34a] active:scale-95">
              Create Asset
            </button>
          </div>
        )}

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-[#e7e5e4] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#e7e5e4]">
                  {['Name', 'Type', 'Serial Number', 'Status', 'Location', 'Assigned To', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-widest text-[#78716c]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f5f4]">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-sm text-[#a8a29e]">
                      {assets.length === 0 ? 'No assets yet — create your first one above.' : 'No assets match your filters.'}
                    </td>
                  </tr>
                ) : paginated.map(asset => (
                  <tr key={asset.id} className="transition-colors hover:bg-white/[0.03]">
                    <td className="px-5 py-3.5 font-medium text-[#1c1917]">{asset.name}</td>
                    <td className="px-5 py-3.5 text-[#57534e]">{asset.asset_type || '—'}</td>
                    <td className="px-5 py-3.5 font-mono text-xs text-[#57534e]">{asset.serial_number}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_CLASSES[asset.status] || 'text-[#57534e] bg-[#a1a1aa]/10 border-[#a1a1aa]/25'}`}>
                        {asset.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[#57534e]">{asset.location || '—'}</td>
                    <td className="px-5 py-3.5 text-[#57534e]">{asset.assigned_to || '—'}</td>
                    <td className="px-5 py-3.5">
                      {user.role === 'admin' && (
                        <button onClick={() => handleDelete(asset.id)}
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

export default Assets;
