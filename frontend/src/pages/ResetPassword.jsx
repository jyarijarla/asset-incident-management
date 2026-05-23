import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../utils/api';

const inputCls = 'w-full rounded-xl border border-[#cac5bf] bg-white px-4 py-3 text-sm text-[#1c1917] placeholder:text-[#78716c] outline-none transition-all duration-150 focus:border-[#3b82f6]/50 focus:ring-2 focus:ring-[#3b82f6]/15 focus:bg-white';

const Spinner = () => (
  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
);

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirm) return setError('Passwords do not match');
    if (newPassword.length < 6) return setError('Password must be at least 6 characters');

    setLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', { token, newPassword });
      setDone(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm text-center animate-fade-up">
          <div className="card-glass rounded-2xl p-8">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[#ef4444]/20 bg-[#ef4444]/10 text-[#ef4444]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <p className="font-semibold text-[#1c1917]">Invalid reset link</p>
            <p className="mt-2 text-sm text-[#57534e]">This link is missing a reset token. Request a new one from the login page.</p>
            <Link to="/login" className="btn-primary mt-6 inline-block w-full rounded-xl py-3 text-center text-sm font-semibold text-white">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm animate-fade-up">

        <div className="mb-8">
          <Link to="/login" className="mb-6 flex items-center gap-1.5 text-sm text-[#78716c] transition-colors hover:text-[#44403c]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to sign in
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-[#1c1917]">Choose a new password</h1>
          <p className="mt-1.5 text-sm text-[#57534e]">Must be at least 6 characters long.</p>
        </div>

        <div className="card-glass rounded-2xl p-7">
          {done ? (
            <div className="animate-fade-in space-y-5 py-2 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#22c55e]/10 border border-[#22c55e]/20 text-[#22c55e]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-[#1c1917]">Password updated</p>
                <p className="mt-2 text-sm text-[#57534e]">Redirecting you to sign in…</p>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-[#dedad4]">
                <div className="h-full rounded-full bg-[#3b82f6] animate-pulse" style={{ width: '100%' }} />
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-[#ef4444]/25 bg-[#ef4444]/8 px-4 py-3 text-sm text-[#ef4444]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[#44403c]">New password</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    className={inputCls} placeholder="••••••••" required autoComplete="new-password" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[#44403c]">Confirm password</label>
                  <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                    className={inputCls} placeholder="••••••••" required autoComplete="new-password" />
                </div>
                <button type="submit" disabled={loading}
                  className="btn-primary mt-2 w-full rounded-xl py-3 text-sm font-semibold text-white disabled:pointer-events-none">
                  {loading ? <span className="flex items-center justify-center gap-2"><Spinner /> Updating…</span> : 'Set new password'}
                </button>
              </form>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default ResetPassword;
