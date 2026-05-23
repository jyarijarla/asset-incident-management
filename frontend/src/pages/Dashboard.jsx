import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import PageLoader from '../components/PageLoader';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

const PRIORITY_COLORS = { low: '#22c55e', medium: '#3b82f6', high: '#f59e0b', critical: '#ef4444' };
const PIE_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#a78bfa'];

const tooltipStyle = {
  contentStyle: { backgroundColor: '#ffffff', border: '1px solid #e7e5e4', borderRadius: '10px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' },
  labelStyle: { color: '#1c1917', fontWeight: 600 },
  itemStyle: { color: '#57534e' },
};

/* ── Icons ── */
const BoxIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="m7.5 4.27 9 5.15M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
  </svg>
);
const TicketIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
    <path d="M13 5v2M13 17v2M13 11v2" />
  </svg>
);
const ClockIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const CheckIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const AlertIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const ZapIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

/* ── Stat Card ── */
const StatCard = ({ title, value, subtitle, color, icon }) => (
  <div className="group relative overflow-hidden rounded-2xl border border-[#e7e5e4] bg-white p-5 transition-all duration-200 hover:border-[#d6d3d1] hover:shadow-lg hover:shadow-black/8">
    <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, ${color}80, transparent 70%)` }} />
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#78716c]">{title}</p>
        <p className="mt-2.5 text-[2.1rem] font-bold leading-none tracking-tight text-[#1c1917]">{value}</p>
        {subtitle && <p className="mt-2 text-xs text-[#78716c]">{subtitle}</p>}
      </div>
      <div className="shrink-0 rounded-xl p-2.5 transition-transform duration-200 group-hover:scale-105" style={{ color, backgroundColor: `${color}18` }}>
        {icon}
      </div>
    </div>
  </div>
);

/* ── Chart Card ── */
const ChartCard = ({ title, children, className = '' }) => (
  <div className={`rounded-2xl border border-[#e7e5e4] bg-white p-5 ${className}`}>
    <h2 className="mb-4 text-sm font-semibold text-[#1c1917]">{title}</h2>
    {children}
  </div>
);

const EmptyChart = ({ message }) => (
  <div className="flex h-[220px] items-center justify-center text-sm text-[#a8a29e]">{message}</div>
);

/* ── Status badge ── */
const statusCls = {
  active: 'text-[#22c55e] bg-[#22c55e]/10 border-[#22c55e]/25',
  open: 'text-[#ef4444] bg-[#ef4444]/10 border-[#ef4444]/25',
  in_progress: 'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/25',
  resolved: 'text-[#22c55e] bg-[#22c55e]/10 border-[#22c55e]/25',
  closed: 'text-[#57534e] bg-[#a1a1aa]/10 border-[#a1a1aa]/25',
  under_maintenance: 'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/25',
  inactive: 'text-[#57534e] bg-[#a1a1aa]/10 border-[#a1a1aa]/25',
};
const Badge = ({ label }) => (
  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusCls[label] || 'text-[#57534e] bg-[#a1a1aa]/10 border-[#a1a1aa]/25'}`}>
    {label.replace('_', ' ')}
  </span>
);

/* ── Dashboard ── */
const Dashboard = () => {
  const { user, org } = useAuth();
  const [assets, setAssets] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/assets'), api.get('/tickets'), api.get('/tickets/stats')])
      .then(([a, t, s]) => { setAssets(a.data); setTickets(t.data); setStats(s.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const openTickets = tickets.filter(t => t.status === 'open').length;
  const inProgressTickets = tickets.filter(t => t.status === 'in_progress').length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;
  const criticalTickets = tickets.filter(t => t.priority === 'critical' && t.status === 'open').length;

  if (loading) return <PageLoader variant="dashboard" title="Loading dashboard" subtitle="Pulling in KPIs, charts, and recent activity..." />;

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-350 space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[#1c1917]">
            Welcome back, <span className="text-[#3b82f6]">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="mt-1 text-sm text-[#78716c]">
            {org?.name && <span className="mr-1.5">{org.name} ·</span>}
            Here's what's happening across your system
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard title="Total Assets" value={assets.length} color="#3b82f6" icon={<BoxIcon />} />
          <StatCard title="Open Tickets" value={openTickets} color="#ef4444" icon={<TicketIcon />} />
          <StatCard title="In Progress" value={inProgressTickets} color="#f59e0b" icon={<ClockIcon />} />
          <StatCard title="Resolved" value={resolvedTickets} color="#22c55e" icon={<CheckIcon />} />
          <StatCard title="Critical Open" value={criticalTickets} color="#ef4444" subtitle="needs attention" icon={<AlertIcon />} />
          <StatCard
            title="Avg Resolution"
            value={stats?.avgResolutionHours ? `${stats.avgResolutionHours}h` : '—'}
            color="#a78bfa"
            subtitle="hours to close"
            icon={<ZapIcon />}
          />
        </div>

        {/* Charts Row */}
        <div className="grid gap-4 xl:grid-cols-12">
          <ChartCard title="Ticket Trends — Last 7 Days" className="xl:col-span-7">
            {stats?.trends?.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.trends} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: '#78716c', fontSize: 11 }} tickLine={false} axisLine={false}
                    tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                  <YAxis tick={{ fill: '#78716c', fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="total" name="Created" fill="#3b82f6" radius={[5, 5, 0, 0]} />
                  <Bar dataKey="resolved" name="Resolved" fill="#22c55e" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyChart message="No ticket data for the last 7 days" />}
          </ChartCard>

          <ChartCard title="Tickets by Priority" className="xl:col-span-5">
            {stats?.priorityDistribution?.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.priorityDistribution} layout="vertical" barSize={12}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#78716c', fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <YAxis dataKey="priority" type="category" tick={{ fill: '#57534e', fontSize: 12 }} tickLine={false} axisLine={false} width={55} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="count" name="Tickets" radius={[0, 5, 5, 0]}>
                    {stats.priorityDistribution.map((e, i) => <Cell key={i} fill={PRIORITY_COLORS[e.priority] || '#3b82f6'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyChart message="No priority data" />}
          </ChartCard>
        </div>

        {/* Bottom Row */}
        <div className="grid gap-4 xl:grid-cols-12">
          <ChartCard title="Assets by Type" className="xl:col-span-4">
            {stats?.assetsByType?.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={stats.assetsByType} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={3}>
                    {stats.assetsByType.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip {...tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            ) : <EmptyChart message="No asset data" />}
          </ChartCard>

          <div className="grid gap-4 sm:grid-cols-2 xl:col-span-8">
            <ChartCard title="Recent Assets">
              {assets.length === 0 ? (
                <p className="py-4 text-center text-sm text-[#a8a29e]">No assets yet</p>
              ) : (
                <div className="divide-y divide-[#f5f5f4]">
                  {assets.slice(0, 5).map(asset => (
                    <div key={asset.id} className="flex items-center justify-between gap-3 py-2.5">
                      <span className="truncate text-sm text-[#1c1917]">{asset.name}</span>
                      <Badge label={asset.status} />
                    </div>
                  ))}
                </div>
              )}
            </ChartCard>

            <ChartCard title="Recent Tickets">
              {tickets.length === 0 ? (
                <p className="py-4 text-center text-sm text-[#a8a29e]">No tickets yet</p>
              ) : (
                <div className="divide-y divide-[#f5f5f4]">
                  {tickets.slice(0, 5).map(ticket => (
                    <div key={ticket.id} className="flex items-center justify-between gap-3 py-2.5">
                      <span className="truncate text-sm text-[#1c1917]">{ticket.title}</span>
                      <Badge label={ticket.status} />
                    </div>
                  ))}
                </div>
              )}
            </ChartCard>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
