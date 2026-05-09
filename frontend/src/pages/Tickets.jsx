import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const statusColors = {
  open: { bg: '#f38ba820', text: '#f38ba8' },
  in_progress: { bg: '#fab38720', text: '#fab387' },
  resolved: { bg: '#a6e3a120', text: '#a6e3a1' },
  closed: { bg: '#45475a', text: '#a6adc8' },
};

const priorityColors = {
  low: { bg: '#a6e3a120', text: '#a6e3a1' },
  medium: { bg: '#89b4fa20', text: '#89b4fa' },
  high: { bg: '#fab38720', text: '#fab387' },
  critical: { bg: '#f38ba820', text: '#f38ba8' },
};

const Tickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    asset_id: '',
    priority: 'medium',
  });

  useEffect(() => {
    fetchTickets();
    fetchAssets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await api.get('/tickets');
      setTickets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssets = async () => {
    try {
      const res = await api.get('/assets');
      setAssets(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async () => {
    try {
      setError('');
      await api.post('/tickets', form);
      setShowForm(false);
      setForm({ title: '', description: '', asset_id: '', priority: 'medium' });
      fetchTickets();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create ticket');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/tickets/${id}`, { status });
      fetchTickets();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) return;
    try {
      await api.delete(`/tickets/${id}`);
      fetchTickets();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div style={{ padding: '2rem', color: '#cdd6f4' }}>Loading...</div>;

  return (
    <div style={{ padding: '2rem', backgroundColor: '#1e1e2e', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: '#cdd6f4', fontSize: '22px', margin: '0 0 4px' }}>Tickets</h1>
          <p style={{ color: '#a6adc8', fontSize: '14px', margin: 0 }}>{tickets.length} total tickets</p>
        </div>
        {['admin', 'technician'].includes(user.role) && (
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
            {showForm ? 'Cancel' : '+ New Ticket'}
          </button>
        )}
      </div>

      {showForm && (
        <div style={{ backgroundColor: '#313244', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
          <h2 style={{ color: '#cdd6f4', fontSize: '16px', marginBottom: '1rem' }}>New Ticket</h2>
          {error && (
            <div style={{ backgroundColor: '#f38ba820', border: '1px solid #f38ba8', color: '#f38ba8', padding: '10px', borderRadius: '8px', marginBottom: '1rem', fontSize: '14px' }}>
              {error}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', color: '#cdd6f4', marginBottom: '6px', fontSize: '13px' }}>Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Screen not turning on"
                style={{ width: '100%', padding: '8px 12px', backgroundColor: '#1e1e2e', border: '1px solid #45475a', borderRadius: '8px', color: '#cdd6f4', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: '#cdd6f4', marginBottom: '6px', fontSize: '13px' }}>Asset</label>
              <select
                value={form.asset_id}
                onChange={(e) => setForm({ ...form, asset_id: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', backgroundColor: '#1e1e2e', border: '1px solid #45475a', borderRadius: '8px', color: '#cdd6f4', fontSize: '14px', boxSizing: 'border-box' }}
              >
                <option value="">Select asset</option>
                {assets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', color: '#cdd6f4', marginBottom: '6px', fontSize: '13px' }}>Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', backgroundColor: '#1e1e2e', border: '1px solid #45475a', borderRadius: '8px', color: '#cdd6f4', fontSize: '14px', boxSizing: 'border-box' }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', color: '#cdd6f4', marginBottom: '6px', fontSize: '13px' }}>Description</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe the issue..."
                style={{ width: '100%', padding: '8px 12px', backgroundColor: '#1e1e2e', border: '1px solid #45475a', borderRadius: '8px', color: '#cdd6f4', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>
          </div>
          <button
            onClick={handleCreate}
            style={{ marginTop: '1rem', padding: '8px 20px', backgroundColor: '#a6e3a1', color: '#1e1e2e', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
          >
            Create Ticket
          </button>
        </div>
      )}

      <div style={{ backgroundColor: '#313244', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#45475a' }}>
              {['Title', 'Asset', 'Priority', 'AI Suggestion', 'Status', 'Reporter', 'Update Status', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 16px', color: '#a6adc8', fontSize: '13px', fontWeight: '500', textAlign: 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: '#a6adc8', fontSize: '14px' }}>
                  No tickets yet. Create your first ticket above.
                </td>
              </tr>
            ) : (
              tickets.map((ticket, i) => (
                <tr key={ticket.id} style={{ borderTop: '1px solid #45475a', backgroundColor: i % 2 === 0 ? 'transparent' : '#2a2a3a' }}>
                  <td style={{ padding: '12px 16px', color: '#cdd6f4', fontSize: '14px' }}>{ticket.title}</td>
                  <td style={{ padding: '12px 16px', color: '#a6adc8', fontSize: '14px' }}>{ticket.asset_name || '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      fontSize: '12px', padding: '2px 10px', borderRadius: '99px',
                      backgroundColor: priorityColors[ticket.priority]?.bg,
                      color: priorityColors[ticket.priority]?.text,
                    }}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {ticket.ai_priority_suggestion ? (
                      <div>
                        <span style={{
                          fontSize: '12px', padding: '2px 10px', borderRadius: '99px',
                          backgroundColor: priorityColors[ticket.ai_priority_suggestion]?.bg,
                          color: priorityColors[ticket.ai_priority_suggestion]?.text,
                        }}>
                          {ticket.ai_priority_suggestion}
                        </span>
                        {ticket.ai_category && (
                          <div style={{ fontSize: '11px', color: '#a6adc8', marginTop: '4px' }}>
                            {ticket.ai_category}
                          </div>
                        )}
                        {ticket.ai_recommendation && (
                          <div style={{ fontSize: '11px', color: '#a6adc8', marginTop: '4px', maxWidth: '200px' }}>
                            {ticket.ai_recommendation}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: '#45475a', fontSize: '12px' }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      fontSize: '12px', padding: '2px 10px', borderRadius: '99px',
                      backgroundColor: statusColors[ticket.status]?.bg,
                      color: statusColors[ticket.status]?.text,
                    }}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#a6adc8', fontSize: '14px' }}>{ticket.reporter_name || '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    {['admin', 'technician'].includes(user.role) && (
                      <select
                        value={ticket.status}
                        onChange={(e) => handleStatusUpdate(ticket.id, e.target.value)}
                        style={{ padding: '4px 8px', backgroundColor: '#1e1e2e', border: '1px solid #45475a', borderRadius: '6px', color: '#cdd6f4', fontSize: '12px', cursor: 'pointer' }}
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {user.role === 'admin' && (
                      <button
                        onClick={() => handleDelete(ticket.id)}
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

export default Tickets;