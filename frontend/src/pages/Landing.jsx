import { useNavigate } from 'react-router-dom';

const INDUSTRIES = [
  { label: 'Technology / IT', icon: '💻' },
  { label: 'AV / Live Events', icon: '🎛️' },
  { label: 'Healthcare', icon: '🏥' },
  { label: 'Restaurant', icon: '🍽️' },
  { label: 'Education', icon: '🎓' },
  { label: 'Manufacturing', icon: '🏭' },
  { label: 'Retail', icon: '🛒' },
];

const STEPS = [
  { n: '01', title: 'Register your org', body: 'Pick your industry. We seed your workspace with the right asset types on day one.' },
  { n: '02', title: 'Add your assets', body: 'Log equipment, devices, or anything your team depends on to get work done.' },
  { n: '03', title: 'File a ticket', body: 'Report an incident. AI triages it instantly with context that fits your industry.' },
  { n: '04', title: 'Resolve & track', body: 'Update status, view trends, and keep your team ahead of what matters.' },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-[#0f0e0c]">

      <header className="flex items-center justify-between border-b border-[#3a3530] px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f59e0b]/15 border border-[#f59e0b]/20">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="m7.5 4.27 9 5.15M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
              <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
            </svg>
          </div>
          <span className="text-sm font-bold text-[#f5f0e8]">AssetFlow</span>
        </div>
        <button onClick={() => navigate('/login')}
          className="rounded-xl border border-[#3a3530] bg-transparent px-4 py-1.5 text-sm text-[#a89880] transition hover:bg-[#252220] hover:text-[#f5f0e8]">
          Sign in
        </button>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">

        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#f59e0b]/25 bg-[#f59e0b]/10 px-4 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#f59e0b]" />
          <span className="text-xs font-medium text-[#f59e0b]">Multi-industry operations platform</span>
        </div>

        <h1 className="max-w-2xl text-[clamp(2rem,5vw,3.25rem)] font-bold leading-[1.1] tracking-tight text-[#f5f0e8]">
          Asset &amp; Incident Management<br />
          <span className="text-[#f59e0b]">for Any Team, Any Industry</span>
        </h1>

        <p className="mt-5 max-w-lg text-base leading-relaxed text-[#8a7965]">
          Track your assets, file incident tickets, and get AI-powered triage that understands your industry — not just IT.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button onClick={() => navigate('/register')}
            className="rounded-xl bg-[#f59e0b] px-6 py-3 text-sm font-semibold text-[#1c1a17] shadow-lg shadow-[#f59e0b]/25 transition hover:bg-[#fbbf24] active:scale-[0.98]">
            Get Started Free
          </button>
          <button onClick={() => navigate('/login')}
            className="rounded-xl border border-[#3a3530] bg-transparent px-6 py-3 text-sm font-medium text-[#a89880] transition hover:bg-[#252220] hover:text-[#f5f0e8]">
            Sign In
          </button>
        </div>

        <div className="mt-16">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-[#6b5f50]">Built for every industry</p>
          <div className="flex flex-wrap justify-center gap-2">
            {INDUSTRIES.map(ind => (
              <div key={ind.label}
                className="flex items-center gap-2 rounded-full border border-[#3a3530] bg-[#1c1a17] px-4 py-1.5 text-sm text-[#a89880] transition hover:border-[#2e2b27] hover:text-[#f5f0e8]">
                <span>{ind.icon}</span>
                <span>{ind.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 w-full max-w-3xl">
          <p className="mb-8 text-[10px] font-semibold uppercase tracking-widest text-[#6b5f50]">How it works</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(step => (
              <div key={step.n}
                className="group rounded-2xl border border-[#3a3530] bg-[#1c1a17] p-5 text-left transition hover:border-[#2e2b27] hover:shadow-lg hover:shadow-black/8">
                <div className="mb-3 text-[11px] font-bold tracking-widest text-[#f59e0b]/40 group-hover:text-[#f59e0b] transition-colors">{step.n}</div>
                <div className="mb-2 text-sm font-semibold text-[#f5f0e8]">{step.title}</div>
                <div className="text-xs leading-relaxed text-[#8a7965]">{step.body}</div>
              </div>
            ))}
          </div>
        </div>

      </main>

      <footer className="border-t border-[#3a3530] py-5 text-center text-xs text-[#6b5f50]">
        AssetFlow · Powered by Claude AI
      </footer>

    </div>
  );
};

export default Landing;