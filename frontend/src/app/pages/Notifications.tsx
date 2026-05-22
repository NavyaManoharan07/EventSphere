import { Sparkles, Calendar, Users, MessageSquare, Trophy, Bell } from 'lucide-react';

export function Notifications() {
  const notifications = [
    { id: 1, type: 'ai', icon: Sparkles, title: 'New AI Match', message: 'Sarah Chen is a 95% match based on your interests', time: '5m ago', unread: true },
    { id: 2, type: 'event', icon: Calendar, title: 'Event Reminder', message: 'AI Summit 2026 starts in 2 days', time: '1h ago', unread: true },
    { id: 3, type: 'network', icon: Users, title: 'New Connection', message: 'Mike Johnson accepted your connection request', time: '3h ago', unread: false },
    { id: 4, type: 'community', icon: MessageSquare, title: 'New Discussion Reply', message: 'Someone replied to your post in AI Enthusiasts', time: '5h ago', unread: false },
    { id: 5, type: 'reward', icon: Trophy, title: 'Achievement Unlocked', message: 'You earned the "Social Butterfly" badge!', time: '1d ago', unread: false },
    { id: 6, type: 'event', icon: Calendar, title: 'Weekend Suggestion', message: 'Check out these events happening this weekend', time: '1d ago', unread: false },
  ];

  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'ai':
        return { bg: 'bg-[#7F5AF0]/10', text: 'text-[#7F5AF0]', border: 'border-[#7F5AF0]/20' };
      case 'event':
        return { bg: 'bg-[#00C2FF]/10', text: 'text-[#00C2FF]', border: 'border-[#00C2FF]/20' };
      case 'network':
        return { bg: 'bg-[#2CB67D]/10', text: 'text-[#2CB67D]', border: 'border-[#2CB67D]/20' };
      case 'community':
        return { bg: 'bg-[#FF6B9D]/10', text: 'text-[#FF6B9D]', border: 'border-[#FF6B9D]/20' };
      case 'reward':
        return { bg: 'bg-[#FFD60A]/10', text: 'text-[#FFD60A]', border: 'border-[#FFD60A]/20' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' };
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-heading font-bold mb-2">Notifications</h1>
          <p className="text-muted-foreground">Stay updated with your activity</p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-white/70 backdrop-blur-lg border border-border hover:bg-white/90 transition-all text-sm">
          Mark all as read
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['All', 'AI Recommendations', 'Events', 'Networking', 'Communities', 'Rewards'].map((filter, i) => (
          <button
            key={i}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
              i === 0
                ? 'bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white shadow-lg'
                : 'bg-white/70 backdrop-blur-lg border border-border hover:bg-white/90'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.map(notification => {
          const Icon = notification.icon;
          const style = getNotificationStyle(notification.type);

          return (
            <div
              key={notification.id}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                notification.unread
                  ? 'bg-white/90 backdrop-blur-lg border-border hover:shadow-lg'
                  : 'bg-white/60 backdrop-blur-lg border-border/50 hover:bg-white/80'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${style.bg} border ${style.border}`}>
                  <Icon className={`w-6 h-6 ${style.text}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-heading font-semibold">{notification.title}</h3>
                    {notification.unread && (
                      <div className="w-2 h-2 rounded-full bg-[#7F5AF0] flex-shrink-0 ml-2 mt-1.5"></div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                  <span className="text-xs text-muted-foreground">{notification.time}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State (when no notifications) */}
      <div className="hidden text-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#7F5AF0] to-[#00C2FF] flex items-center justify-center opacity-50">
          <Bell className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-heading font-semibold mb-2">No notifications</h3>
        <p className="text-muted-foreground">You're all caught up!</p>
      </div>
    </div>
  );
}
