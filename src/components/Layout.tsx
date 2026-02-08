import { useAuth } from '../context/AuthContext';
import { Trophy, Swords, PlusCircle, LayoutDashboard, Settings, User, Shield, LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user, isAdmin, logout } = useAuth();

  const NavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => {
    const isActive = location.pathname === to;
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

  return (
    <div className="flex min-h-screen bg-[#020617] text-white selection:bg-rivals-accent selection:text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-[#0f172a] flex flex-col fixed h-full z-10">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-rivals-accent to-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-violet-900/20">
              <Swords size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">RIVALS<span className="text-cyan-400">ARENA</span></h1>
              <p className="text-xs text-slate-500 font-mono">TOURNAMENT OS</p>
            </div>
          </div>

          <nav className="space-y-2">
            <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />

            {isAdmin && (
              <NavItem to="/create" icon={PlusCircle} label="Create Tournament" />
            )}

            <NavItem to="/profile/me" icon={User} label="My Profile" />
            <NavItem to="/leaderboard" icon={Trophy} label="Leaderboard" />

            <div className="pt-4 pb-2">
              <p className="px-4 text-xs font-bold text-slate-600 uppercase tracking-wider">System</p>
            </div>
            <NavItem to="/settings" icon={Settings} label="Preferences" />

            {isAdmin && (
              <NavItem to="/admin" icon={Shield} label="Admin Panel" />
            )}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-800">
          <div className="flex items-center justify-between gap-3 bg-slate-900 p-3 rounded-lg border border-slate-700/50">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-xs font-bold shrink-0">
                {user?.username.substring(0, 2).toUpperCase() || 'GU'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate">{user?.username || 'Guest'}</p>
                <p className="text-[10px] text-cyan-400 flex items-center gap-1 uppercase tracking-wider font-bold">
                  {user?.role || 'Guest'}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="text-slate-500 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen relative">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>

        {/* Decorative Background Elements */}
        <div className="fixed top-0 left-64 right-0 h-64 bg-gradient-to-b from-rivals-accent/5 to-transparent pointer-events-none" />
        <div className="fixed bottom-0 right-0 w-96 h-96 bg-cyan-500/5 blur-3xl rounded-full pointer-events-none" />
      </main>
    </div>
  );
};

export default Layout;
