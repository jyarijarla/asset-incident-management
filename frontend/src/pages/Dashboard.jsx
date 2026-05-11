import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = {
  low: '#a6e3a1',
  medium: '#89b4fa',
  high: '#fab387',
  critical: '#f38ba8',
};

const PIE_COLORS = ['#89b4fa', '#a6e3a1', '#fab387', '#f38ba8', '#cba6f7'];

const StatCard = ({ title, value, color, subtitle }) => (
  <div style={{
    backgroundColor: '#313244',
    borderRadius: '12px',
    padding: '1.5rem',
    flex: 1,
    borderLeft: `4px solid ${color}`,
    minWidth: '150px',
  }}>
    <p style={{ color: '#a6adc8', fontSize: '13px', margin: '0 0 8px' }}>{title}</p>
    <p style={{ color: '#cdd6f4', fontSize: '32px', fontWeight: '600', margin: '0 0 4px' }}>{value}</p>
    {subtitle && <p style={{ color: '#a6adc8', fontSize: '12px', margin: 0 }}>{subtitle}</p>}
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [assets, setAssets] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assetsRes, ticketsRes, statsRes] = await Promise.all([
          api.get('/assets'),
          api.get('/tickets'),
          api.get('/tickets/stats'),
        ]);
        setAssets(assetsRes.data);
        setTickets(ticketsRes.data);
        setStats(statsRes.data);
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
  const resolvedTickets = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;
  const criticalTickets = tickets.filter(t => t.priority === 'critical' && t.status === 'open').length;

  if (loading) return <div style={{ padding: '2rem', color: '#cdd6f4' }}>Loading...</div>;

  return (
    <div style={{ padding: '2rem', backgroundColor: '#1e1e2e', minHeight: '100vh' }}>
      <h1 style={{ color: '#cdd6f4', marginBottom: '0.25rem', fontSize: '22px' }}>
        Welcome back, {user?.name}
      </h1>
      <p style={{ color: '#a6adc8', marginBottom: '2rem', fontSize: '14px' }}>
        Here's what's happening in your system
      </p>

      {/* KPI Cards */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <StatCard title="Total Assets" value={assets.length} color="#89b4fa" />
        <StatCard title="Open Tickets" value={openTickets} color="#f38ba8" />
        <StatCard title="In Progress" value={inProgressTickets} color="#fab387" />
        <StatCard title="Resolved" value={resolvedTickets} color="#a6e3a1" />
        <StatCard
          title="Critical Open"
          value={criticalTickets}
          color="#f38ba8"
          subtitle="needs immediate attention"
        />
        <StatCard
          title="Avg Resolution"
          value={stats?.avgResolutionHours ? `${stats.avgResolutionHours}h` : '—'}
          color="#cba6f7"
          subtitle="hours to resolve"
        />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>

        {/* Ticket Trends Bar Chart */}
        <div style={{ flex: 2, backgroundColor: '#313244', borderRadius: '12px', padding: '1.5rem', minWidth: '300px' }}>
          <h2 style={{ color: '#cdd6f4', fontSize: '15px', marginBottom: '1.5rem' }}>Ticket Trends — Last 7 Days</h2>
          {stats?.trends?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#45475a" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#a6adc8', fontSize: 12 }}
                  tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis tick={{ fill: '#a6adc8', fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e1e2e', border: '1px solid #45475a', borderRadius: '8px' }}
                  labelStyle={{ color: '#cdd6f4' }}
                  itemStyle={{ color: '#a6adc8' }}
                />
                <Bar dataKey="total" name="Created" fill="#89b4fa" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" name="Resolved" fill="#a6e3a1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a6adc8', fontSize: '14px' }}>
              No ticket data for the last 7 days
            </div>
          )}
        </div>

        {/* Assets By Type Pie Chart */}
        <div style={{ flex: 1, backgroundColor: '#313244', borderRadius: '12px', padding: '1.5rem', minWidth: '250px' }}>
          <h2 style={{ color: '#cdd6f4', fontSize: '15px', marginBottom: '1.5rem' }}>Assets By Type</h2>
          {stats?.assetsByType?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={stats.assetsByType}
                  dataKey="count"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {stats.assetsByType.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e1e2e', border: '1px solid #45475a', borderRadius: '8px' }}
                  itemStyle={{ color: '#a6adc8' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a6adc8', fontSize: '14px' }}>
              No asset data
            </div>
          )}
        </div>

        {/* Priority Distribution */}
        <div style={{ flex: 1, backgroundColor: '#313244', borderRadius: '12px', padding: '1.5rem', minWidth: '250px' }}>
          <h2 style={{ color: '#cdd6f4', fontSize: '15px', marginBottom: '1.5rem' }}>Tickets By Priority</h2>
          {stats?.priorityDistribution?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.priorityDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#45475a" />
                <XAxis type="number" tick={{ fill: '#a6adc8', fontSize: 12 }} allowDecimals={false} />
                <YAxis dataKey="priority" type="category" tick={{ fill: '#a6adc8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e1e2e', border: '1px solid #45475a', borderRadius: '8px' }}
                  itemStyle={{ color: '#a6adc8' }}
                />
                <Bar dataKey="count" name="Tickets" radius={[0, 4, 4, 0]}>
                  {stats.priorityDistribution.map((entry, index) => (
                    <Cell key={index} fill={COLORS[entry.priority] || '#89b4fa'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a6adc8', fontSize: '14px' }}>
              No priority data
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, backgroundColor: '#313244', borderRadius: '12px', padding: '1.5rem', minWidth: '300px' }}>
          <h2 style={{ color: '#cdd6f4', fontSize: '15px', marginBottom: '1rem' }}>Recent Assets</h2>
          {assets.slice(0, 5).map(asset => (
            <div key={asset.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0', borderBottom: '1px solid #45475a',
            }}>
              <span style={{ color: '#cdd6f4', fontSize: '14px' }}>{asset.name}</span>
              <span style={{
                fontSize: '12px', padding: '2px 10px', borderRadius: '99px',
                backgroundColor: asset.status === 'active' ? '#a6e3a120' : asset.status === 'under_maintenance' ? '#fab38720' : '#45475a',
                color: asset.status === 'active' ? '#a6e3a1' : asset.status === 'under_maintenance' ? '#fab387' : '#a6adc8',
              }}>
                {asset.status.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>

        <div style={{ flex: 1, backgroundColor: '#313244', borderRadius: '12px', padding: '1.5rem', minWidth: '300px' }}>
          <h2 style={{ color: '#cdd6f4', fontSize: '15px', marginBottom: '1rem' }}>Recent Tickets</h2>
          {tickets.slice(0, 5).map(ticket => (
            <div key={ticket.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0', borderBottom: '1px solid #45475a',
            }}>
              <span style={{ color: '#cdd6f4', fontSize: '14px', flex: 1, marginRight: '1rem' }}>{ticket.title}</span>
              <span style={{
                fontSize: '12px', padding: '2px 10px', borderRadius: '99px', whiteSpace: 'nowrap',
                backgroundColor: ticket.status === 'open' ? '#f38ba820' : ticket.status === 'in_progress' ? '#fab38720' : ticket.status === 'resolved' ? '#a6e3a120' : '#45475a',
                color: ticket.status === 'open' ? '#f38ba8' : ticket.status === 'in_progress' ? '#fab387' : ticket.status === 'resolved' ? '#a6e3a1' : '#a6adc8',
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