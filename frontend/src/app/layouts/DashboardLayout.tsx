import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router';
import { Search, Bell, MessageSquare, User, Home, Compass, Ticket, Users, MessageCircle, Trophy, Briefcase, Settings as SettingsIcon, Sparkles } from 'lucide-react';
import { authGetJson } from '@/lib/api';

export function DashboardLayout() {
  const location = useLocation();
  const [xpPoints, setXpPoints] = useState(0);

  useEffect(() => {
    const loadXp = async () => {
      try {
        const data = await authGetJson<{ stats?: { totalXp?: number } }>('/events/rewards/summary');
        setXpPoints(data.stats?.totalXp ?? 0);
      } catch {
        setXpPoints(0);
      }
    };

    loadXp();
  }, []);

  const navItems = [
    { path: '/app', icon: Home, label: 'Home' },
    { path: '/app/discover', icon: Compass, label: 'Discover' },
    { path: '/app/tickets', icon: Ticket, label: 'My Tickets' },
    { path: '/app/networking', icon: Users, label: 'Networking Hub' },
    { path: '/app/communities', icon: MessageCircle, label: 'Communities' },
    { path: '/app/rewards', icon: Trophy, label: 'Rewards' },
    { path: '/app/organiser', icon: Briefcase, label: 'Organiser Mode' },
    { path: '/app/settings', icon: SettingsIcon, label: 'Settings' },
  ];

  const isActive = (path: string) => {
    if (path === '/app') {
      return location.pathname === '/app';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-white/70 border-b border-border">
        <div className="h-16 px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7F5AF0] via-[#00C2FF] to-[#2CB67D]"></div>
            <span className="text-xl font-heading font-semibold bg-gradient-to-r from-[#7F5AF0] via-[#00C2FF] to-[#2CB67D] bg-clip-text text-transparent">
              EventSphere AI
            </span>
          </Link>

          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search events, people, communities..."
                className="w-full pl-10 pr-4 py-2 rounded-full bg-white/50 backdrop-blur border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/app/notifications" className="relative p-2 hover:bg-accent rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF6B9D] rounded-full"></span>
            </Link>
            <Link to="/app/messages" className="relative p-2 hover:bg-accent rounded-lg transition-colors">
              <MessageSquare className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#00C2FF] rounded-full"></span>
            </Link>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#7F5AF0]/10 to-[#00C2FF]/10 border border-[#7F5AF0]/20">
              <Sparkles className="w-4 h-4 text-[#7F5AF0]" />
              <span className="text-sm font-medium">{xpPoints.toLocaleString()} XP</span>
            </div>
            <Link to="/app/settings" className="p-2 hover:bg-accent rounded-full transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7F5AF0] to-[#00C2FF] flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className="fixed left-0 top-16 bottom-0 w-64 backdrop-blur-lg bg-white/60 border-r border-border p-4 overflow-y-auto">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    active
                      ? 'bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white shadow-lg shadow-primary/20'
                      : 'hover:bg-accent/50 text-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 p-6 min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
