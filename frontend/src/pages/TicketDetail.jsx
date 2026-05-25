import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import PageLoader from '../components/PageLoader';

const STATUS_CLS = {
  open: 'text-[#ef4444] bg-[#ef4444]/10 border-[#ef4444]/25',
  in_progress: 'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/25',
  resolved: 'text-[#22c55e] bg-[#22c55e]/10 border-[#22c55e]/25',
  closed: 'text-[#a89880] bg-[#a1a1aa]/10 border-[#a1a1aa]/25',
};
const PRIORITY_CLS = {
  low: 'text-[#22c55e] bg-[#22c55e]/10 border-[#22c55e]/25',
  medium: 'text-[#38bdf8] bg-[#38bdf8]/10 border-[#38bdf8]/25',
  high: 'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/25',
  critical: 'text-[#ef4444] bg-[#ef4444]/10 border-[#ef4444]/25',
};
const GRADE_CFG = {
  A: { color: '#22c55e', label: 'Excellent', desc: 'Auto-resolved' },
  B: { color: '#22c55e', label: 'Good', desc: 'Auto-resolved' },
  C: { color: '#f59e0b', label: 'Adequate', desc: 'Flagged for review' },
  D: { color: '#ef4444', label: 'Poor', desc: 'Requires admin approval' },
  F: { color: '#ef4444', label: 'Inadequate', desc: 'Requires admin approval' },
};

const Pill = ({ label, map }) => (
  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${map[label] || 'text-[#a89880] bg-[#a1a1aa]/10 border-[#a1a1aa]/25'}`}>
    {label?.replace('_', ' ')}
  </span>
);

const SparkleIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const AlertIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const inputCls = 'w-full rounded-xl border border-[#3a3530] bg-[#252220] px-3.5 py-2.5 text-sm text-[#f5f0e8] placeholder:text-[#6b5f50] outline-none transition focus:border-[#f59e0b]/60 focus:ring-2 focus:ring-[#f59e0b]/20 box-border resize-none';
const labelCls = 'mb-1.5 block text-xs font-medium text-[#a89880]';

const MetaRow = ({ label, value }) => (
  <div className="flex items-start gap-3 py-2.5 border-b border-[#3a3530] last:border-0">
    <span className="w-28 shrink-0 text-xs text-[#8a7965]">{label}</span>
    <span className="text-sm text-[#f5f0e8] break-words">{value || '—'}</span>
  </div>
);

const GradeCard = ({ ticket }) => {
  const cfg = GRADE_CFG[ticket.ai_grade];
  if (!cfg) return null;

  const strengths = Array.isArray(ticket.ai_grade_strengths)
    ? ticket.ai_grade_strengths
    : (typeof ticket.ai_grade_strengths === 'string' ? JSON.parse(ticket.ai_grade_strengths) : []);
  const improvements = Array.isArray(ticket.ai_grade_improvements)
    ? ticket.ai_grade_improvements
    : (typeof ticket.ai_grade_improvements === 'string' ? JSON.parse(ticket.ai_grade_improvements) : []);

  return (
    <div className="rounded-2xl border bg-[#1c1a17] overflow-hidden" style={{ borderColor: `${cfg.color}30` }}>
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: `${cfg.color}20`, backgroundColor: `${cfg.color}08` }}>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl font-bold" style={{ backgroundColor: `${cfg.color}18`, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
            {ticket.ai_grade}
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: cfg.color }}>{cfg.label}</p>
            <p className="text-xs text-[#8a7965]">{cfg.desc}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold" style={{ color: cfg.color }}>{ticket.ai_grade_score}</p>
          <p className="text-xs text-[#8a7965]">/ 100</p>
        </div>
      </div>

      <div className="px-5 pt-4 pb-1">
        <div className="h-2 overflow-hidden rounded-full bg-[#3a3530]">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${ticket.ai_grade_score}%`, backgroundColor: cfg.color }} />
        </div>
      </div>

      {ticket.ai_grade_feedback && (
        <div className="px-5 py-3.5">
          <p className="text-xs font-medium text-[#a89880] mb-1.5">AI Feedback</p>
          <p className="text-sm leading-relaxed text-[#f5f0e8]">{ticket.ai_grade_feedback}</p>
        </div>
      )}

      <div className="grid gap-4 px-5 pb-5 sm:grid-cols-2">
        {strengths.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium text-[#22c55e]">Strengths</p>
            <ul className="space-y-1.5">
              {strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-[#a89880]">
                  <span className="mt-0.5 shrink-0 text-[#22c55e]"><CheckIcon /></span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}
        {improvements.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium text-[#f59e0b]">Areas to Improve</p>
            <ul className="space-y-1.5">
              {improvements.map((imp, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-[#a89880]">
                  <span className="mt-0.5 shrink-0 text-[#f59e0b]"><AlertIcon /></span>
                  {imp}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

const TicketDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ steps: '', root_cause: '', solution_applied: '' });
  const [submitting, setSubmitting] = useState(false);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState('');

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  useEffect(() => { fetchTicket(); }, [id]);

  const fetchTicket = async () => {
    try {
      const r = await api.get(`/tickets/${id}`);
      setTicket(r.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitResolution = async () => {
    setError('');
    if (!form.steps.trim() || !form.root_cause.trim() || !form.solution_applied.trim()) {
      return setError('All three fields are required');
    }
    setSubmitting(true);
    try {
      const r = await api.post(`/tickets/${id}/resolve`, form);
      setTicket(r.data);
      setForm({ steps: '', root_cause: '', solution_applied: '' });
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to submit resolution');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async () => {
    setApproving(true);
    try {
      const r = await api.post(`/tickets/${id}/approve`);
      setTicket(r.data);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to approve');
    } finally {
      setApproving(false);
    }
  };

  if (loading) return <PageLoader title="Loading ticket" subtitle="Fetching ticket details and AI analysis..." />;
  if (!ticket) return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p className="text-[#8a7965]">Ticket not found.</p>
        <Link to="/tickets" className="mt-3 inline-block text-sm text-[#f59e0b] hover:underline">← Back to Tickets</Link>
      </div>
    </div>
  );

  const canResolve = ['admin', 'technician'].includes(user.role);
  const isAdmin = user.role === 'admin';
  const alreadyResolved = ticket.status === 'resolved' || ticket.status === 'closed';
  const hasGrade = !!ticket.ai_grade;
  const showForm = canResolve && !alreadyResolved && !hasGrade;

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-350 space-y-6">

        <div>
          <Link to="/tickets" className="inline-flex items-center gap-1.5 text-sm text-[#8a7965] transition hover:text-[#f5f0e8]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            Back to Tickets
          </Link>
        </div>

        <div className="flex flex-wrap items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-mono text-[#6b5f50]">#{ticket.id}</span>
              <Pill label={ticket.priority} map={PRIORITY_CLS} />
              <Pill label={ticket.status} map={STATUS_CLS} />
              {ticket.flagged_for_review && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#f59e0b]/30 bg-[#f59e0b]/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#f59e0b]">
                  <AlertIcon /> Flagged for Review
                </span>
              )}
              {ticket.requires_admin_approval && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ef4444]/30 bg-[#ef4444]/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#ef4444]">
                  <AlertIcon /> Needs Admin Approval
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-[#f5f0e8] leading-snug">{ticket.title}</h1>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">

          <div className="lg:col-span-2 space-y-5">
            <div className="rounded-2xl border border-[#3a3530] bg-[#1c1a17] p-5">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[#6b5f50]">Details</p>
              <MetaRow label="Asset" value={ticket.asset_name} />
              <MetaRow label="Reporter" value={ticket.reporter_name} />
              <MetaRow label="Assigned to" value={ticket.assigned_to_name} />
              <MetaRow label="Created" value={new Date(ticket.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })} />
              {ticket.resolved_at && (
                <MetaRow label="Resolved" value={new Date(ticket.resolved_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })} />
              )}
            </div>

            <div className="rounded-2xl border border-[#3a3530] bg-[#1c1a17] p-5">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[#6b5f50]">Description</p>
              <p className="text-sm leading-relaxed text-[#a89880] whitespace-pre-wrap">{ticket.description || '—'}</p>
            </div>

            {hasGrade && ticket.resolution_steps && (
              <div className="rounded-2xl border border-[#3a3530] bg-[#1c1a17] p-5 space-y-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6b5f50]">Resolution Write-up</p>
                <div>
                  <p className="mb-1 text-xs font-medium text-[#a89880]">Steps Taken</p>
                  <p className="text-sm leading-relaxed text-[#f5f0e8] whitespace-pre-wrap">{ticket.resolution_steps}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium text-[#a89880]">Root Cause</p>
                  <p className="text-sm leading-relaxed text-[#f5f0e8] whitespace-pre-wrap">{ticket.root_cause}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium text-[#a89880]">Solution Applied</p>
                  <p className="text-sm leading-relaxed text-[#f5f0e8] whitespace-pre-wrap">{ticket.solution_applied}</p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-5">
            {ticket.ai_priority_suggestion ? (
              <div className="rounded-2xl border border-[#a78bfa]/20 bg-[#a78bfa]/5 p-5">
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-[#a78bfa]"><SparkleIcon /></span>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#a78bfa]">AI Triage</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#8a7965]">Suggested Priority</span>
                    <Pill label={ticket.ai_priority_suggestion} map={PRIORITY_CLS} />
                  </div>
                  {ticket.ai_category && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#8a7965]">Category</span>
                      <span className="text-xs font-medium text-[#f5f0e8]">{ticket.ai_category}</span>
                    </div>
                  )}
                  {ticket.ai_recommendation && (
                    <div className="pt-1 border-t border-[#a78bfa]/15">
                      <p className="mb-1 text-xs text-[#8a7965]">Recommendation</p>
                      <p className="text-sm leading-relaxed text-[#a89880]">{ticket.ai_recommendation}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-[#3a3530] bg-[#1c1a17] p-5">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-[#a78bfa]"><SparkleIcon /></span>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6b5f50]">AI Triage</p>
                </div>
                <p className="text-xs text-[#6b5f50]">No AI analysis available.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="border-t border-[#3a3530] pt-6">
            <h2 className="text-base font-semibold text-[#f5f0e8]">Resolution</h2>
          </div>

          {hasGrade && <GradeCard ticket={ticket} />}

          {ticket.requires_admin_approval && (
            <div className="rounded-2xl border border-[#ef4444]/25 bg-[#ef4444]/8 px-5 py-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-[#ef4444]"><AlertIcon /></span>
                <div>
                  <p className="text-sm font-semibold text-[#f5f0e8]">Admin approval required</p>
                  <p className="text-xs text-[#8a7965]">Resolution scored below 60 — an admin must review and approve before this ticket closes.</p>
                </div>
              </div>
              {isAdmin && (
                <button onClick={handleApprove} disabled={approving}
                  className="rounded-xl bg-[#22c55e] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#16a34a] active:scale-95 disabled:opacity-60">
                  {approving ? 'Approving…' : 'Approve & Resolve'}
                </button>
              )}
            </div>
          )}

          {ticket.flagged_for_review && !ticket.requires_admin_approval && (
            <div className="flex items-center gap-3 rounded-2xl border border-[#f59e0b]/25 bg-[#f59e0b]/8 px-5 py-4">
              <span className="text-[#f59e0b]"><AlertIcon /></span>
              <p className="text-sm text-[#a89880]">
                This ticket was resolved but <span className="font-medium text-[#f59e0b]">flagged for manager review</span> due to a C-grade resolution.
              </p>
            </div>
          )}

          {showForm && (
            <div className="rounded-2xl border border-[#3a3530] bg-[#1c1a17] p-6 space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-[#f5f0e8]">Submit Resolution Write-up</h3>
                <p className="mt-0.5 text-xs text-[#8a7965]">Claude will grade your resolution and automatically determine the ticket outcome.</p>
              </div>

              {error && (
                <div className="rounded-xl border border-[#ef4444]/30 bg-[#ef4444]/10 px-4 py-2.5 text-sm text-[#ef4444]">{error}</div>
              )}

              <div>
                <label className={labelCls}>Steps Taken *</label>
                <textarea rows={4} value={form.steps} onChange={set('steps')} className={inputCls}
                  placeholder="Describe step-by-step what you did to diagnose and remediate the issue..." />
              </div>
              <div>
                <label className={labelCls}>Root Cause Identified *</label>
                <textarea rows={3} value={form.root_cause} onChange={set('root_cause')} className={inputCls}
                  placeholder="What was the underlying cause of the problem?" />
              </div>
              <div>
                <label className={labelCls}>Solution Applied *</label>
                <textarea rows={3} value={form.solution_applied} onChange={set('solution_applied')} className={inputCls}
                  placeholder="What specific fix, replacement, or configuration change resolved the issue?" />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#a78bfa]/20 bg-[#a78bfa]/5 px-4 py-3">
                <div className="flex items-center gap-2 text-[#a78bfa]">
                  <SparkleIcon />
                  <span className="text-xs">Claude will grade your write-up: A/B auto-resolves · C resolves + flags · D/F needs admin approval</span>
                </div>
              </div>

              <button onClick={handleSubmitResolution} disabled={submitting}
                className="w-full rounded-xl bg-[#f59e0b] py-3 text-sm font-semibold text-white transition hover:bg-[#d97706] active:scale-[0.98] disabled:opacity-60">
                {submitting ? 'Grading with AI…' : 'Submit for AI Review'}
              </button>
            </div>
          )}

          {alreadyResolved && !hasGrade && (
            <div className="rounded-2xl border border-[#3a3530] bg-[#1c1a17] px-5 py-4">
              <p className="text-sm text-[#8a7965]">This ticket was resolved without a formal resolution write-up.</p>
            </div>
          )}

          {hasGrade && ticket.requires_admin_approval && !isAdmin && (
            <div className="rounded-2xl border border-[#3a3530] bg-[#1c1a17] px-5 py-4">
              <p className="text-sm text-[#8a7965]">Waiting for an admin to review and approve this resolution.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default TicketDetail;