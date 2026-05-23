import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const FEATURES = [
  { text: 'AI triage tuned to your industry, not just IT' },
  { text: 'Full asset lifecycle tracking across your team' },
  { text: 'Resolution grading with automatic escalation' },
];

const BoxIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="m7.5 4.27 9 5.15M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
  </svg>
);

const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const Spinner = () => (
  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
);

const inputCls = 'w-full rounded-xl border border-[#27272a] bg-[#0a0a0f] px-4 py-3 text-sm text-[#f4f4f5] placeholder:text-[#3f3f46] outline-none transition-all duration-150 focus:border-[#3b82f6]/50 focus:ring-2 focus:ring-[#3b82f6]/15 focus:bg-[#0f0f13]';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // forgot flow: 'email' → verify account exists → 'reset' → set new password → 'done'
  const [mode, setMode] = useState('login');
  const [forgotStep, setForgotStep] = useState('email'); // 'email' | 'reset' | 'done'
  const [resetEmail, setResetEmail] = useState('');
  const [resetName, setResetName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.user, res.data.token, res.data.org);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: verify the email exists
  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError('');
    try {
      const res = await api.post('/auth/forgot-password', { email: resetEmail });
      setResetName(res.data.name);
      setForgotStep('reset');
    } catch (err) {
      setResetError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setResetLoading(false);
    }
  };

  // Step 2: set the new password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return setResetError('Passwords do not match');
    if (newPassword.length < 6) return setResetError('Password must be at least 6 characters');
    setResetLoading(true);
    setResetError('');
    try {
      await api.post('/auth/reset-password', { email: resetEmail, newPassword });
      setForgotStep('done');
    } catch (err) {
      setResetError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setResetLoading(false);
    }
  };

  const switchToForgot = () => {
    setMode('forgot');
    setForgotStep('email');
    setResetEmail(email);
    setResetName('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setResetError('');
  };

  const switchToLogin = () => {
    setMode('login');
    setForgotStep('email');
    setResetError('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="flex min-h-screen">

      {/* ── Left brand panel (desktop only) ── */}
      <div className="hidden lg:flex w-[420px] shrink-0 flex-col justify-between p-12 border-r border-[#27272a]/60"
        style={{ background: 'linear-gradient(160deg, rgb(59 130 246 / 0.07) 0%, transparent 55%), #0d0d12' }}>

        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#3b82f6]/10 border border-[#3b82f6]/20 icon-glow text-[#3b82f6]">
            <BoxIcon />
          </div>
          <span className="text-sm font-bold tracking-tight text-[#f4f4f5]">AssetFlow</span>
        </div>

        <div>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[#3b82f6]/50">Operations Platform</p>
          <h2 className="text-[1.85rem] font-bold leading-[1.2] tracking-tight text-[#f4f4f5]">
            Everything your team needs to stay operational.
          </h2>
          <ul className="mt-8 space-y-4">
            {FEATURES.map((f, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20">
                  <CheckIcon />
                </span>
                <span className="text-sm leading-relaxed text-[#71717a]">{f.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-[11px] text-[#27272a]">Powered by Claude AI · Enterprise ready</p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm animate-fade-up">

          {mode === 'login' ? (
            <>
              <div className="mb-8">
                <div className="mb-5 flex items-center gap-2 lg:hidden">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#3b82f6]/10 border border-[#3b82f6]/20 text-[#3b82f6]">
                    <BoxIcon />
                  </div>
                  <span className="text-sm font-bold text-[#f4f4f5]">AssetFlow</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-[#f4f4f5]">Welcome back</h1>
                <p className="mt-1.5 text-sm text-[#71717a]">Sign in to your organization</p>
              </div>

              <div className="card-glass rounded-2xl p-7">
                {error && (
                  <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-[#ef4444]/25 bg-[#ef4444]/8 px-4 py-3 text-sm text-[#ef4444]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {error}
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[#a1a1aa]">Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      className={inputCls} placeholder="you@company.com" required autoComplete="email" />
                  </div>
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label className="text-xs font-medium text-[#a1a1aa]">Password</label>
                      <button type="button" onClick={switchToForgot}
                        className="text-[11px] text-[#52525b] transition-colors hover:text-[#3b82f6]">
                        Forgot password?
                      </button>
                    </div>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                      className={inputCls} placeholder="••••••••" required autoComplete="current-password" />
                  </div>

                  <button type="submit" disabled={loading}
                    className="btn-primary mt-2 w-full rounded-xl py-3 text-sm font-semibold text-white disabled:pointer-events-none">
                    {loading ? <span className="flex items-center justify-center gap-2"><Spinner /> Signing in…</span> : 'Sign in'}
                  </button>
                </form>
              </div>

              <div className="mt-6 space-y-2 text-center">
                <p className="text-sm text-[#52525b]">
                  New here?{' '}
                  <Link to="/register" className="font-medium text-[#3b82f6] transition-colors hover:text-[#60a5fa]">
                    Create an organization
                  </Link>
                </p>
                <p>
                  <Link to="/" className="text-sm text-[#3f3f46] transition-colors hover:text-[#71717a]">← Back to home</Link>
                </p>
              </div>
            </>
          ) : (
            /* ── Forgot password (3 steps) ── */
            <>
              <div className="mb-8">
                <button type="button" onClick={switchToLogin}
                  className="mb-6 flex items-center gap-1.5 text-sm text-[#52525b] transition-colors hover:text-[#a1a1aa]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                  Back to sign in
                </button>
                <h1 className="text-2xl font-bold tracking-tight text-[#f4f4f5]">
                  {forgotStep === 'email' ? 'Find your account' :
                   forgotStep === 'reset' ? 'Set a new password' :
                   'Password updated'}
                </h1>
                <p className="mt-1.5 text-sm text-[#71717a]">
                  {forgotStep === 'email' && 'Enter your email to verify your account.'}
                  {forgotStep === 'reset' && `Verified as ${resetName}. Choose a new password.`}
                </p>
              </div>

              <div className="card-glass rounded-2xl p-7">
                {/* Step indicator */}
                {forgotStep !== 'done' && (
                  <div className="mb-6 flex items-center gap-2">
                    {['email', 'reset'].map((s, i) => (
                      <div key={s} className="flex items-center gap-2">
                        <div className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
                          forgotStep === s ? 'bg-[#3b82f6] text-white' :
                          (i === 0 && forgotStep === 'reset') ? 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30' :
                          'bg-[#27272a] text-[#52525b]'
                        }`}>
                          {i === 0 && forgotStep === 'reset' ? '✓' : i + 1}
                        </div>
                        <span className={`text-xs ${forgotStep === s ? 'text-[#a1a1aa]' : 'text-[#3f3f46]'}`}>
                          {s === 'email' ? 'Verify' : 'Reset'}
                        </span>
                        {i === 0 && <div className="h-px w-6 bg-[#27272a]" />}
                      </div>
                    ))}
                  </div>
                )}

                {resetError && (
                  <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-[#ef4444]/25 bg-[#ef4444]/8 px-4 py-3 text-sm text-[#ef4444]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {resetError}
                  </div>
                )}

                {forgotStep === 'email' && (
                  <form onSubmit={handleVerifyEmail} className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-[#a1a1aa]">Email address</label>
                      <input type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)}
                        className={inputCls} placeholder="you@company.com" required autoComplete="email" />
                    </div>
                    <button type="submit" disabled={resetLoading}
                      className="btn-primary w-full rounded-xl py-3 text-sm font-semibold text-white disabled:pointer-events-none">
                      {resetLoading ? <span className="flex items-center justify-center gap-2"><Spinner /> Checking…</span> : 'Find account'}
                    </button>
                  </form>
                )}

                {forgotStep === 'reset' && (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="flex items-center gap-2.5 rounded-xl border border-[#27272a] bg-[#0a0a0f] px-4 py-3">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span className="text-sm text-[#71717a]">{resetEmail}</span>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-[#a1a1aa]">New password</label>
                      <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                        className={inputCls} placeholder="••••••••" required autoComplete="new-password" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-[#a1a1aa]">Confirm password</label>
                      <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                        className={inputCls} placeholder="••••••••" required autoComplete="new-password" />
                    </div>
                    <button type="submit" disabled={resetLoading}
                      className="btn-primary w-full rounded-xl py-3 text-sm font-semibold text-white disabled:pointer-events-none">
                      {resetLoading ? <span className="flex items-center justify-center gap-2"><Spinner /> Updating…</span> : 'Reset password'}
                    </button>
                  </form>
                )}

                {forgotStep === 'done' && (
                  <div className="animate-fade-in space-y-5 py-2 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#22c55e]/10 border border-[#22c55e]/20 text-[#22c55e]">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-[#f4f4f5]">Password updated</p>
                      <p className="mt-2 text-sm text-[#71717a]">You can now sign in with your new password.</p>
                    </div>
                    <button type="button" onClick={switchToLogin}
                      className="btn-primary w-full rounded-xl py-3 text-sm font-semibold text-white">
                      Sign in now
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
