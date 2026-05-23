import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const INDUSTRIES = [
  { value: 'technology', label: 'Technology / IT' },
  { value: 'av_events', label: 'AV / Live Events' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'restaurant', label: 'Restaurant / Food Service' },
  { value: 'education', label: 'Education' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'retail', label: 'Retail' },
  { value: 'other', label: 'Other' },
];

const inputCls = 'w-full rounded-xl border border-[#e7e5e4] bg-white px-4 py-2.5 text-sm text-[#1c1917] placeholder:text-[#a8a29e] outline-none transition focus:border-[#3b82f6]/60 focus:ring-2 focus:ring-[#3b82f6]/20 box-border';
const labelCls = 'mb-1.5 block text-xs font-medium text-[#57534e]';

const Register = () => {
  const [form, setForm] = useState({ org_name: '', industry: 'technology', name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/register-org', form);
      login(res.data.user, res.data.token, res.data.org);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#3b82f6]/15 border border-[#3b82f6]/20">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="m7.5 4.27 9 5.15M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
              <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-[#1c1917]">Create your organization</h1>
          <p className="mt-1 text-sm text-[#78716c]">Set up your workspace in under a minute</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-[#e7e5e4] bg-white p-7">
          {error && (
            <div className="mb-5 rounded-xl border border-[#ef4444]/30 bg-[#ef4444]/10 px-4 py-2.5 text-sm text-[#ef4444]">{error}</div>
          )}

          <div className="mb-5 space-y-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#a8a29e]">Organization</p>
            <div>
              <label className={labelCls}>Organization name</label>
              <input className={inputCls} type="text" required placeholder="Acme Corp / The Midnight Band / …"
                value={form.org_name} onChange={set('org_name')} />
            </div>
            <div>
              <label className={labelCls}>Industry</label>
              <select className={`${inputCls} cursor-pointer`} value={form.industry} onChange={set('industry')}>
                {INDUSTRIES.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
              </select>
              <p className="mt-1.5 text-[11px] text-[#a8a29e]">Assets and AI triage will be tailored to your industry.</p>
            </div>
          </div>

          <div className="my-5 border-t border-[#e7e5e4]" />

          <div className="space-y-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#a8a29e]">Admin account</p>
            <div>
              <label className={labelCls}>Your name</label>
              <input className={inputCls} type="text" required placeholder="Jane Smith"
                value={form.name} onChange={set('name')} />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input className={inputCls} type="email" required placeholder="jane@example.com"
                value={form.email} onChange={set('email')} />
            </div>
            <div>
              <label className={labelCls}>Password</label>
              <input className={inputCls} type="password" required placeholder="••••••••"
                value={form.password} onChange={set('password')} />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="mt-6 w-full rounded-xl bg-[#3b82f6] py-3 text-sm font-semibold text-white transition hover:bg-[#2563eb] active:scale-[0.98] disabled:opacity-60">
            {loading ? 'Creating…' : 'Create organization'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-[#78716c]">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-[#3b82f6] hover:underline">Sign in</Link>
        </p>
        <p className="mt-2 text-center text-sm text-[#78716c]">
          <Link to="/" className="hover:text-[#57534e] transition-colors">← Back to home</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
