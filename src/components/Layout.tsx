import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { Trophy, Swords, PlusCircle, LayoutDashboard, Settings, User, Shield, LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user, isAdmin, logout } = useAuth();

  const NavItem = ({ to, icon: Icon, label, pathname }: { to: string; icon: any; label: string; pathname: string }) => {
    const isActive = pathname === to || (to !== '/' && pathname.startsWith(to));
    return (
      <Link
        to={to}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${isActive
          ? 'bg-rivals-accent text-white shadow-[0_0_15px_rgba(139,92,246,0.5)]'
          : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
      >
        <Icon size={20} className={isActive ? 'animate-pulse' : ''} />
        <span className="font-medium">{label}</span>
        {isActive && (
          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
        )}
      </Link>
    );
  };

  const Layout: React.FC<LayoutProps> = ({ children }) => {
    const location = useLocation();
    const { user, isAdmin, logout } = useAuth();

    return (
      <div className="flex min-h-screen bg-[#020617] text-white selection:bg-rivals-accent selection:text-white overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-slate-800 bg-[#0f172a] flex flex-col fixed h-full z-10 shadow-2xl">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-rivals-accent to-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-violet-900/20">
                <Swords size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">RIVALS<span className="text-cyan-400">ARENA</span></h1>
                <p className="text-xs text-slate-500 font-mono text-[10px]">TOURNAMENT OS</p>
              </div>
            </div>

            <nav className="space-y-1">
              <NavItem to="/" icon={LayoutDashboard} label="Dashboard" pathname={location.pathname} />

              {isAdmin && (
                <NavItem to="/create" icon={PlusCircle} label="Create" pathname={location.pathname} />
              )}

              <NavItem to={`/profile/${user?.id || 'me'}`} icon={User} label="Profile" pathname={location.pathname} />
              <NavItem to="/leaderboard" icon={Trophy} label="Leaderboard" pathname={location.pathname} />

              <div className="pt-4 pb-1">
                <p className="px-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest">System</p>
              </div>
              <NavItem to="/settings" icon={Settings} label="Settings" pathname={location.pathname} />

              {isAdmin && (
                <NavItem to="/admin" icon={Shield} label="Admin" pathname={location.pathname} />
              )}
            </nav>
          </div>

          <div className="mt-auto p-4 border-t border-slate-800/50">
            <div className="flex items-center justify-between gap-2 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0 text-slate-400">
                  {user?.username ? String(user.username).substring(0, 2).toUpperCase() : 'GU'}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold truncate text-slate-200">{user?.username || 'Guest'}</p>
                  <p className="text-[9px] text-cyan-400 uppercase tracking-tighter font-black opacity-80">
                    {user?.role || 'user'}
                  </p>
                </div>
              </div>
              <button
                onClick={logout}
                className="text-slate-600 hover:text-red-400 transition-colors p-1"
                title="Logout"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen relative bg-[#020617]">
          <div className="max-w-7xl mx-auto pb-20">
            {children}
          </div>

          {/* Decorative Background Elements */}
          <div className="fixed top-0 left-64 right-0 h-64 bg-gradient-to-b from-rivals-accent/5 to-transparent pointer-events-none" />
          <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-rivals-accent/5 blur-[120px] rounded-full pointer-events-none" />
        </main>
      </div>
    );
  };

  export default Layout;
