import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/helpers';
import Button from './Button';

// Icon components
const Icons = {
  Dashboard: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  Connector: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Jobs: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  RawData: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
    </svg>
  ),
  NormalizedData: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  Menu: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  Close: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Logout: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  User: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  ChevronLeft: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  ),
  Health: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
};

const navItems = [
  { path: '/', label: 'Dashboard', icon: Icons.Dashboard, tutorialId: 'dashboard-nav' },
  { path: '/connectors', label: 'Connectors', icon: Icons.Connector, tutorialId: 'connectors-nav' },
  { path: '/jobs', label: 'Sync Jobs', icon: Icons.Jobs, tutorialId: 'jobs-nav' },
  { path: '/data/raw', label: 'Raw Data', icon: Icons.RawData, adminOnly: true, tutorialId: 'raw-data-nav' },
  { path: '/data/normalized', label: 'Normalized', icon: Icons.NormalizedData, tutorialId: 'normalized-nav' },
  { path: '/system/health', label: 'System Health', icon: Icons.Health, adminOnly: true, tutorialId: 'system-health-nav' },
];


const Layout = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full z-50 flex flex-col',
          'bg-surface-900/95 backdrop-blur-xl border-r border-surface-700/50',
          'transition-all duration-300 ease-in-out',
          sidebarCollapsed ? 'w-20' : 'w-64',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-surface-700/50">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/25">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            {!sidebarCollapsed && (
              <span className="text-xl font-bold text-gradient animate-fade-in">
                DataBridge
              </span>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-surface-700/50 text-gray-400"
          >
            <Icons.Close className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto scrollbar-hide">
          {navItems
            .filter((item) => !item.adminOnly || isAdmin())
            .map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                data-tutorial={item.tutorialId}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200',
                  active
                    ? 'bg-primary-500/10 text-primary-400 shadow-lg shadow-primary-500/5'
                    : 'text-gray-400 hover:bg-surface-700/50 hover:text-white',
                  sidebarCollapsed && 'justify-center px-3'
                )}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon className={cn('w-5 h-5 flex-shrink-0', active && 'text-primary-400')} />
                {!sidebarCollapsed && (
                  <span className="animate-fade-in">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>


        {/* User section */}
        <div className="p-4 border-t border-surface-700/50">
          <div
            className={cn(
              'flex items-center gap-3 p-3 rounded-xl bg-surface-800/50',
              sidebarCollapsed && 'justify-center p-2'
            )}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-sm">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0 animate-fade-in">
                <p className="text-sm font-medium text-white truncate">
                  {user?.email}
                </p>
                <p className="text-xs text-gray-400">
                  {isAdmin() ? 'Administrator' : 'User'}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={cn(
              'w-full mt-3 flex items-center gap-3 px-4 py-2.5 rounded-xl',
              'text-gray-400 hover:text-danger-400 hover:bg-danger-500/10',
              'transition-all duration-200',
              sidebarCollapsed && 'justify-center px-3'
            )}
            title={sidebarCollapsed ? 'Logout' : undefined}
          >
            <Icons.Logout className="w-5 h-5" />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>

        {/* Collapse toggle (desktop only) */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-surface-700 border border-surface-600 items-center justify-center text-gray-400 hover:text-white transition-colors"
        >
          <Icons.ChevronLeft
            className={cn(
              'w-4 h-4 transition-transform duration-300',
              sidebarCollapsed && 'rotate-180'
            )}
          />
        </button>
      </aside>

      {/* Main content */}
      <div
        className={cn(
          'min-h-screen transition-all duration-300',
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        )}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-surface-900/80 backdrop-blur-xl border-b border-surface-700/50">
          <div className="flex items-center justify-between h-full px-4 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-surface-700/50 text-gray-400"
            >
              <Icons.Menu className="w-6 h-6" />
            </button>

            <div className="flex-1 lg:hidden text-center">
              <span className="text-lg font-bold text-gradient">DataBridge</span>
            </div>

            <div className="flex items-center gap-4">
              {isAdmin() && (
                <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary-500/20 text-primary-400 border border-primary-500/30">
                  Admin
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
