import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const statusColors = {
  active: { bg: '#a6e3a120', text: '#a6e3a1' },
  inactive: { bg: '#45475a', text: '#a6adc8' },
  under_maintenance: { bg: '#fab38720', text: '#fab387' },
};

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
  const [form, setForm] = useState({
    name: '',
    asset_type_id: '',
    serial_number: '',
    status: 'active',
    location: '',
    purchase_date: '',
  });

  useEffect(() => {
    fetchAssets();
    fetchAssetTypes();
  }, []);

  const fetchAssets = async () => {
    try {
      const res = await api.get('/assets');
      setAssets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssetTypes = async () => {
    try {
      const res = await api.get('/assets/types');
      setAssetTypes(res.data);
    } catch (err) {
      setAssetTypes([
        { id: 1, name: 'Laptop' },
        { id: 2, name: 'Monitor' },
        { id: 3, name: 'Server' },
        { id: 4, name: 'Peripheral' },
        { id: 5, name: 'Networking' },
      ]);
    }
  };

  const handleCreate = async () => {
    try {
      setError('');
      await api.post('/assets', form);
      setShowForm(false);
      setForm({ name: '', asset_type_id: '', serial_number: '', status: 'active', location: '', purchase_date: '' });
      fetchAssets();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create asset');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this asset?')) return;
    try {
      await api.delete(`/assets/${id}`);
      fetchAssets();
    } catch (err) {
      console.error(err);
    }
  };

  const uniqueTypes = [...new Set(assets.map(a => a.asset_type).filter(Boolean))];

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = search === '' ||
      asset.name.toLowerCase().includes(search.toLowerCase()) ||
      asset.serial_number.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === '' || asset.status === filterStatus;
    const matchesType = filterType === '' || asset.asset_type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  if (loading) return <div style={{ padding: '2rem', color: '#cdd6f4' }}>Loading...</div>;

  return (
    <div style={{ padding: '2rem', backgroundColor: '#1e1e2e', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ color: '#cdd6f4', fontSize: '22px', margin: '0 0 4px' }}>Assets</h1>
          <p style={{ color: '#a6adc8', fontSize: '14px', margin: 0 }}>
            {filteredAssets.length} of {assets.length} assets
          </p>
        </div>
        {user.role === 'admin' && (
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
            {showForm ? 'Cancel' : '+ New Asset'}
          </button>
        )}
      </div>

      {/* Search and Filter Bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by name or serial number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 2,
            padding: '8px 12px',
            backgroundColor: '#313244',
            border: '1px solid #45475a',
            borderRadius: '8px',
            color: '#cdd6f4',
            fontSize: '14px',
            minWidth: '200px',
          }}
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            flex: 1,
            padding: '8px 12px',
            backgroundColor: '#313244',
            border: '1px solid #45475a',
            borderRadius: '8px',
            color: '#cdd6f4',
            fontSize: '14px',
            minWidth: '150px',
          }}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="under_maintenance">Under Maintenance</option>
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{
            flex: 1,
            padding: '8px 12px',
            backgroundColor: '#313244',
            border: '1px solid #45475a',
            borderRadius: '8px',
            color: '#cdd6f4',
            fontSize: '14px',
            minWidth: '150px',
          }}
        >
          <option value="">All Types</option>
          {uniqueTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        {(search || filterStatus || filterType) && (
          <button
            onClick={() => { setSearch(''); setFilterStatus(''); setFilterType(''); }}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              border: '1px solid #45475a',
              borderRadius: '8px',
              color: '#a6adc8',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Clear
          </button>
        )}
      </div>

      {showForm && (
        <div style={{ backgroundColor: '#313244', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
          <h2 style={{ color: '#cdd6f4', fontSize: '16px', marginBottom: '1rem' }}>New Asset</h2>
          {error && (
            <div style={{ backgroundColor: '#f38ba820', border: '1px solid #f38ba8', color: '#f38ba8', padding: '10px', borderRadius: '8px', marginBottom: '1rem', fontSize: '14px' }}>
              {error}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[
              { label: 'Asset Name', key: 'name', type: 'text', placeholder: 'MacBook Pro' },
              { label: 'Serial Number', key: 'serial_number', type: 'text', placeholder: 'MBP-2024-001' },
              { label: 'Location', key: 'location', type: 'text', placeholder: 'Office A' },
              { label: 'Purchase Date', key: 'purchase_date', type: 'date', placeholder: '' },
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
              <label style={{ display: 'block', color: '#cdd6f4', marginBottom: '6px', fontSize: '13px' }}>Asset Type</label>
              <select
                value={form.asset_type_id}
                onChange={(e) => setForm({ ...form, asset_type_id: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', backgroundColor: '#1e1e2e', border: '1px solid #45475a', borderRadius: '8px', color: '#cdd6f4', fontSize: '14px', boxSizing: 'border-box' }}
              >
                <option value="">Select type</option>
                {assetTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', color: '#cdd6f4', marginBottom: '6px', fontSize: '13px' }}>Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', backgroundColor: '#1e1e2e', border: '1px solid #45475a', borderRadius: '8px', color: '#cdd6f4', fontSize: '14px', boxSizing: 'border-box' }}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="under_maintenance">Under Maintenance</option>
              </select>
            </div>
          </div>
          <button
            onClick={handleCreate}
            style={{ marginTop: '1rem', padding: '8px 20px', backgroundColor: '#a6e3a1', color: '#1e1e2e', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
          >
            Create Asset
          </button>
        </div>
      )}

      <div style={{ backgroundColor: '#313244', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#45475a' }}>
              {['Name', 'Type', 'Serial Number', 'Status', 'Location', 'Assigned To', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 16px', color: '#a6adc8', fontSize: '13px', fontWeight: '500', textAlign: 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredAssets.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#a6adc8', fontSize: '14px' }}>
                  {assets.length === 0 ? 'No assets yet. Create your first asset above.' : 'No assets match your search.'}
                </td>
              </tr>
            ) : (
              filteredAssets.map((asset, i) => (
                <tr key={asset.id} style={{ borderTop: '1px solid #45475a', backgroundColor: i % 2 === 0 ? 'transparent' : '#2a2a3a' }}>
                  <td style={{ padding: '12px 16px', color: '#cdd6f4', fontSize: '14px' }}>{asset.name}</td>
                  <td style={{ padding: '12px 16px', color: '#a6adc8', fontSize: '14px' }}>{asset.asset_type || '—'}</td>
                  <td style={{ padding: '12px 16px', color: '#a6adc8', fontSize: '14px', fontFamily: 'monospace' }}>{asset.serial_number}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      fontSize: '12px', padding: '2px 10px', borderRadius: '99px',
                      backgroundColor: statusColors[asset.status]?.bg,
                      color: statusColors[asset.status]?.text,
                    }}>
                      {asset.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#a6adc8', fontSize: '14px' }}>{asset.location || '—'}</td>
                  <td style={{ padding: '12px 16px', color: '#a6adc8', fontSize: '14px' }}>{asset.assigned_to || '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    {user.role === 'admin' && (
                      <button
                        onClick={() => handleDelete(asset.id)}
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

export default Assets;