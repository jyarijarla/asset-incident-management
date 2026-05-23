import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const INDUSTRY_LABELS = {
  technology: 'Technology',
  av_events: 'AV / Events',
  healthcare: 'Healthcare',
  restaurant: 'Restaurant',
  education: 'Education',
  manufacturing: 'Manufacturing',
  retail: 'Retail',
  other: 'Other',
};

const Navbar = () => {
  const { user, org, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const hiddenPaths = ['/', '/login', '/register'];
  if (!user || hiddenPaths.includes(location.pathname)) return null;

  const handleLogout = () => { logout(); navigate('/'); };
  const isActive = (path) => location.pathname === path;

  const navLink = (to, label) => (
    <Link
      to={to}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-150 ${
        isActive(to)
          ? 'bg-[#3b82f6]/12 text-[#3b82f6]'
          : 'text-[#44403c] hover:bg-[#dedad4] hover:text-[#1c1917]'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 border-b border-[#cac5bf] bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-350 items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Left: brand + links */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#3b82f6]/15 border border-[#3b82f6]/20">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="m7.5 4.27 9 5.15M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
              </svg>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-[#1c1917]">{org?.name || 'AssetFlow'}</span>
              {org?.industry && (
                <span className="text-[10px] font-medium text-[#3b82f6]/70">{INDUSTRY_LABELS[org.industry] || org.industry}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-0.5">
            {navLink('/dashboard', 'Dashboard')}
            {navLink('/assets', 'Assets')}
            {navLink('/tickets', 'Tickets')}
            {user.role === 'admin' && navLink('/users', 'Team')}
          </div>
        </div>

        {/* Right: user chip + logout */}
        <div className="flex items-center gap-2.5">
          <div className="hidden rounded-full border border-[#cac5bf] bg-white px-3 py-1.5 sm:flex items-center gap-2">
            <div className="h-5 w-5 rounded-full bg-[#3b82f6]/15 flex items-center justify-center text-[9px] font-bold text-[#3b82f6]">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs text-[#44403c]">
              {user.name} <span className="text-[#78716c]">· {user.role}</span>
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-[#ef4444]/30 bg-[#ef4444]/10 px-3 py-1.5 text-xs font-semibold text-[#ef4444] transition hover:bg-[#ef4444]/20 active:scale-95"
          >
            Logout
          </button>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
