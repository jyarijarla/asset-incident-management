import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const StatCard = ({ title, value, color }) => (
  <div style={{
    backgroundColor: '#313244',
    borderRadius: '12px',
    padding: '1.5rem',
    flex: 1,
    borderLeft: `4px solid ${color}`,
  }}>
    <p style={{ color: '#a6adc8', fontSize: '13px', margin: '0 0 8px' }}>{title}</p>
    <p style={{ color: '#cdd6f4', fontSize: '32px', fontWeight: '600', margin: 0 }}>{value}</p>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [assets, setAssets] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assetsRes, ticketsRes] = await Promise.all([
          api.get('/assets'),
          api.get('/tickets'),
        ]);
        setAssets(assetsRes.data);
        setTickets(ticketsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const openTickets = tickets.filter(t => t.status === 'open').length;
  const inProgressTickets = tickets.filter(t => t.status === 'in_progress').length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;

  if (loading) return <div style={{ padding: '2rem', color: '#cdd6f4' }}>Loading...</div>;

  return (
    <div style={{ padding: '2rem', backgroundColor: '#1e1e2e', minHeight: '100vh' }}>
      <h1 style={{ color: '#cdd6f4', marginBottom: '0.5rem', fontSize: '22px' }}>
        Welcome back, {user?.name}
      </h1>
      <p style={{ color: '#a6adc8', marginBottom: '2rem', fontSize: '14px' }}>
        Here's what's happening in your system
      </p>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <StatCard title="Total Assets" value={assets.length} color="#89b4fa" />
        <StatCard title="Open Tickets" value={openTickets} color="#f38ba8" />
        <StatCard title="In Progress" value={inProgressTickets} color="#fab387" />
        <StatCard title="Resolved" value={resolvedTickets} color="#a6e3a1" />
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, backgroundColor: '#313244', borderRadius: '12px', padding: '1.5rem', minWidth: '300px' }}>
          <h2 style={{ color: '#cdd6f4', fontSize: '16px', marginBottom: '1rem' }}>Recent Assets</h2>
          {assets.slice(0, 5).map(asset => (
            <div key={asset.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 0',
              borderBottom: '1px solid #45475a',
            }}>
              <span style={{ color: '#cdd6f4', fontSize: '14px' }}>{asset.name}</span>
              <span style={{
                fontSize: '12px',
                padding: '2px 10px',
                borderRadius: '99px',
                backgroundColor: asset.status === 'active' ? '#a6e3a120' : '#f38ba820',
                color: asset.status === 'active' ? '#a6e3a1' : '#f38ba8',
              }}>
                {asset.status}
              </span>
            </div>
          ))}
        </div>

        <div style={{ flex: 1, backgroundColor: '#313244', borderRadius: '12px', padding: '1.5rem', minWidth: '300px' }}>
          <h2 style={{ color: '#cdd6f4', fontSize: '16px', marginBottom: '1rem' }}>Recent Tickets</h2>
          {tickets.slice(0, 5).map(ticket => (
            <div key={ticket.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 0',
              borderBottom: '1px solid #45475a',
            }}>
              <span style={{ color: '#cdd6f4', fontSize: '14px' }}>{ticket.title}</span>
              <span style={{
                fontSize: '12px',
                padding: '2px 10px',
                borderRadius: '99px',
                backgroundColor: ticket.status === 'open' ? '#f38ba820' :
                                 ticket.status === 'in_progress' ? '#fab38720' :
                                 ticket.status === 'resolved' ? '#a6e3a120' : '#45475a',
                color: ticket.status === 'open' ? '#f38ba8' :
                       ticket.status === 'in_progress' ? '#fab387' :
                       ticket.status === 'resolved' ? '#a6e3a1' : '#a6adc8',
              }}>
                {ticket.status.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;