import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { Trophy, Swords, PlusCircle, LayoutDashboard, Settings, User, Shield, LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const NavItem = ({ to, icon: Icon, label, pathname }: { to: string; icon: any; label: string; pathname: string }) => {
  const isActive = pathname === to || (to !== '/' && pathname.startsWith(to));
  return (
    <Link
      to={to}
      className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${isActive
        ? 'bg-rivals-accent/20 text-white shadow-[0_0_20px_rgba(139,92,246,0.2)] border border-rivals-accent/30'
        : 'text-slate-400 hover:text-white hover:bg-white/5'
        }`}
    >
      <Icon size={20} className={`${isActive ? 'text-rivals-neon animate-pulse' : 'group-hover:text-rivals-accent'} transition-colors duration-300`} />
      <span className={`font-semibold tracking-wide ${isActive ? 'neon-text' : ''}`}>{label}</span>
      {isActive && (
        <div className="absolute left-0 w-1 h-6 bg-rivals-neon rounded-r-full shadow-[0_0_10px_#22d3ee]" />
      )}
    </Link>
  );
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user, isAdmin, logout, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-rivals-darker flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-rivals-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Syncing Neural Link</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-rivals-darker text-slate-100 font-sans selection:bg-rivals-accent/40 overflow-hidden relative">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-rivals-accent/10 blur-[120px] rounded-full pointer-events-none animate-pulse" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rivals-neon/10 blur-[120px] rounded-full pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Sidebar */}
      <aside className="w-72 glass-heavy border-r border-white/5 flex flex-col fixed h-full z-50 transition-all duration-500">
        <div className="p-8">
          <div className="flex items-center gap-4 mb-12 group cursor-pointer">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-rivals-accent to-rivals-neon rounded-2xl flex items-center justify-center shadow-lg shadow-rivals-accent/20 rotate-3 group-hover:rotate-12 transition-transform duration-500">
                <Swords size={28} className="text-white" />
              </div>
              <div className="absolute -inset-1 bg-rivals-accent/20 blur opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter italic">
                RIVALS<span className="text-rivals-neon">ARENA</span>
              </h1>
              <div className="flex items-center gap-2">
                <span className="h-1 w-8 bg-rivals-accent rounded-full" />
                <p className="text-[10px] text-slate-500 font-mono tracking-[0.2em] font-bold">ULTIMATE EDITION</p>
              </div>
            </div>
          </div>

          <nav className="space-y-2">
            <p className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4">Competitions</p>
            <NavItem to="/" icon={LayoutDashboard} label="War Room" pathname={location.pathname} />
            {isAdmin && (
              <NavItem to="/create" icon={PlusCircle} label="Launch Event" pathname={location.pathname} />
            )}
            <NavItem to="/leaderboard" icon={Trophy} label="Hall of Fame" pathname={location.pathname} />

            <p className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mt-10 mb-4">Identity</p>
            <NavItem to={`/profile/${user?.id || 'me'}`} icon={User} label="Combat Profile" pathname={location.pathname} />
            <NavItem to="/settings" icon={Settings} label="System Settings" pathname={location.pathname} />

            {isAdmin && (
              <div className="mt-8 pt-8 border-t border-white/5">
                <NavItem to="/admin" icon={Shield} label="Central Intelligence" pathname={location.pathname} />
              </div>
            )}
          </nav>
        </div>

        <div className="mt-auto p-6">
          <div className="glass bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center justify-between group hover:border-white/20 transition-all duration-300">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xs font-black text-rivals-neon border border-white/5 overflow-hidden">
                  {user?.username ? String(user.username).substring(0, 2).toUpperCase() : '??'}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-rivals-dark animate-pulse" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold truncate text-white">{user?.username || 'Initiate'}</p>
                <div className="flex items-center gap-1.5">
                  <span className="block w-1.5 h-1.5 rounded-full bg-rivals-accent shadow-[0_0_5px_#8b5cf6]" />
                  <p className="text-[9px] text-rivals-accent uppercase font-black tracking-widest leading-none">
                    {user?.role || 'user'}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              className="text-slate-500 hover:text-hot hover:bg-hot/10 p-2 rounded-lg transition-all"
              title="Terminate Session"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Viewport */}
      <main className="flex-1 ml-72 p-10 overflow-y-auto h-screen relative scroll-smooth">
        <div className="max-w-7xl mx-auto pb-24 relative z-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
          {children}
        </div>

        {/* Decorative elements */}
        <div className="fixed top-0 left-72 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
        <div className="fixed bottom-0 left-72 right-0 h-64 bg-gradient-to-t from-rivals-darker to-transparent pointer-events-none z-0" />
      </main>
    </div>
  );
};

export default Layout;
