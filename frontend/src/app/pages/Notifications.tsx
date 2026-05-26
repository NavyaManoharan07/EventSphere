import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Sparkles, Calendar, Users, MessageSquare, Trophy, Bell, Ticket } from 'lucide-react';
import { authGetJson, authPostJson } from '@/lib/api';

const iconByType: Record<string, any> = {
  ai: Sparkles,
  event: Calendar,
  network: Users,
  community: MessageSquare,
  reward: Trophy,
  ticket: Ticket,
  opportunity: Sparkles,
};

export function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadNotifications = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await authGetJson<any[]>('/notifications');
      setNotifications(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAllRead = async () => {
    try {
      await authPostJson('/notifications/read-all', {});
      setNotifications((items) => items.map((item) => ({ ...item, unread: false })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to mark notifications read');
    }
  };

  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'ai':
      case 'opportunity':
        return { bg: 'bg-[#7F5AF0]/10', text: 'text-[#7F5AF0]', border: 'border-[#7F5AF0]/20' };
      case 'event':
      case 'ticket':
        return { bg: 'bg-[#00C2FF]/10', text: 'text-[#00C2FF]', border: 'border-[#00C2FF]/20' };
      case 'network':
        return { bg: 'bg-[#2CB67D]/10', text: 'text-[#2CB67D]', border: 'border-[#2CB67D]/20' };
      case 'community':
        return { bg: 'bg-[#FF6B9D]/10', text: 'text-[#FF6B9D]', border: 'border-[#FF6B9D]/20' };
      case 'reward':
        return { bg: 'bg-[#FFD60A]/10', text: 'text-[#B98900]', border: 'border-[#FFD60A]/20' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' };
    }
  };

  const filteredNotifications = notifications.filter((item) => {
    if (filter === 'All') return true;
    if (filter === 'AI Recommendations') return item.type === 'ai' || item.type === 'opportunity';
    if (filter === 'Events') return item.type === 'event' || item.type === 'ticket';
    if (filter === 'Networking') return item.type === 'network';
    if (filter === 'Communities') return item.type === 'community';
    if (filter === 'Rewards') return item.type === 'reward';
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-heading font-bold mb-2">Notifications</h1>
          <p className="text-muted-foreground">Stay updated with reminders, opportunities, tickets, rewards, and communities</p>
        </div>
        <button onClick={markAllRead} className="px-4 py-2 rounded-lg bg-white/70 backdrop-blur-lg border border-border hover:bg-white/90 transition-all text-sm">
          Mark all as read
        </button>
      </div>

      {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['All', 'AI Recommendations', 'Events', 'Networking', 'Communities', 'Rewards'].map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
              filter === item
                ? 'bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white shadow-lg'
                : 'bg-white/70 backdrop-blur-lg border border-border hover:bg-white/90'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="p-6 rounded-xl bg-white/70 border border-border text-center">Loading notifications...</div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#7F5AF0] to-[#00C2FF] flex items-center justify-center opacity-70">
              <Bell className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-heading font-semibold mb-2">No notifications</h3>
            <p className="text-muted-foreground">You are all caught up.</p>
          </div>
        ) : filteredNotifications.map((notification) => {
          const Icon = iconByType[notification.type] || Bell;
          const style = getNotificationStyle(notification.type);
          const content = (
            <div className={`p-4 rounded-xl border transition-all cursor-pointer ${
              notification.unread
                ? 'bg-white/90 backdrop-blur-lg border-border hover:shadow-lg'
                : 'bg-white/60 backdrop-blur-lg border-border/50 hover:bg-white/80'
            }`}>
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${style.bg} border ${style.border}`}>
                  <Icon className={`w-6 h-6 ${style.text}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-heading font-semibold">{notification.title}</h3>
                    {notification.unread && <div className="w-2 h-2 rounded-full bg-[#7F5AF0] flex-shrink-0 ml-2 mt-1.5"></div>}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                  <span className="text-xs text-muted-foreground">
                    {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : 'Just now'}
                  </span>
                </div>
              </div>
            </div>
          );

          return notification.link ? (
            <Link key={notification.id} to={notification.link}>{content}</Link>
          ) : (
            <div key={notification.id}>{content}</div>
          );
        })}
      </div>
    </div>
  );
}
