import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Calendar, Users, TrendingUp, Sparkles, Zap, Award } from 'lucide-react';
import { authGetJson } from '@/lib/api';

type DashboardSummary = {
  user?: {
    name?: string;
    email?: string;
  };
  stats: {
    eventsAttended: number;
    connectionsMade: number;
    xpPoints: number;
    dayStreak: number;
  };
  level: {
    current: number;
    currentXp: number;
    nextLevelXp: number;
    progressPercent: number;
    xpToNextLevel: number;
  };
  upcomingEvents: Array<{
    id: string;
    title: string;
    startDate?: string;
    attendees: number;
    category: string;
  }>;
  recommendations: Array<{
    id: string;
    title: string;
    match: number;
    reason: string;
  }>;
  networkActivity: Array<{
    name: string;
    event: string;
  }>;
};

const emptySummary: DashboardSummary = {
  stats: {
    eventsAttended: 0,
    connectionsMade: 0,
    xpPoints: 0,
    dayStreak: 0,
  },
  level: {
    current: 1,
    currentXp: 0,
    nextLevelXp: 500,
    progressPercent: 0,
    xpToNextLevel: 500,
  },
  upcomingEvents: [],
  recommendations: [],
  networkActivity: [],
};

const formatDate = (date?: string) => {
  if (!date) return 'TBD';

  return new Date(date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
};

const formatTime = (date?: string) => {
  if (!date) return 'TBD';

  return new Date(date).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
};

const formatNumber = (value: number) => value.toLocaleString();

export function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary>(emptySummary);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSummary = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await authGetJson<DashboardSummary>('/events/dashboard/summary');
        setSummary(data || emptySummary);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load your dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, []);

  const { stats, level, upcomingEvents, recommendations, networkActivity } = summary;
  const firstName = summary.user?.name?.split(' ')[0];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-heading font-bold mb-2">
          {firstName ? `Welcome back, ${firstName}!` : 'Welcome back!'}
        </h1>
        <p className="text-muted-foreground">Here's what's happening in your event world</p>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-full bg-[#7F5AF0]/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[#7F5AF0]" />
            </div>
            <TrendingUp className="w-4 h-4 text-[#2CB67D]" />
          </div>
          <div className="text-2xl font-heading font-bold mb-1">
            {loading ? '...' : formatNumber(stats.eventsAttended)}
          </div>
          <div className="text-sm text-muted-foreground">Events Attended</div>
        </div>

        <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-full bg-[#00C2FF]/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-[#00C2FF]" />
            </div>
            <TrendingUp className="w-4 h-4 text-[#2CB67D]" />
          </div>
          <div className="text-2xl font-heading font-bold mb-1">
            {loading ? '...' : formatNumber(stats.connectionsMade)}
          </div>
          <div className="text-sm text-muted-foreground">Connections Made</div>
        </div>

        <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-full bg-[#FFD60A]/10 flex items-center justify-center">
              <Award className="w-5 h-5 text-[#FFD60A]" />
            </div>
          </div>
          <div className="text-2xl font-heading font-bold mb-1">
            {loading ? '...' : formatNumber(stats.xpPoints)}
          </div>
          <div className="text-sm text-muted-foreground">XP Points</div>
        </div>

        <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-full bg-[#2CB67D]/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#2CB67D]" />
            </div>
          </div>
          <div className="text-2xl font-heading font-bold mb-1">
            {loading ? '...' : formatNumber(stats.dayStreak)}
          </div>
          <div className="text-sm text-muted-foreground">Day Streak</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* AI Recommendations */}
          <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7F5AF0] to-[#00C2FF] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xl font-heading font-semibold">AI Recommendations</h2>
              </div>
              <Link to="/app/discover" className="text-sm text-primary hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="p-4 rounded-xl bg-white/50 border border-border">Loading recommendations...</div>
              ) : recommendations.length === 0 ? (
                <div className="p-4 rounded-xl bg-white/50 border border-border text-sm text-muted-foreground">
                  No recommendations yet. Explore events to build your profile.
                </div>
              ) : (
                recommendations.map(event => (
                  <div key={event.id} className="p-4 rounded-xl bg-white/50 border border-border hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between mb-2 gap-4">
                      <div>
                        <h3 className="font-heading font-semibold mb-1">{event.title}</h3>
                        <p className="text-sm text-muted-foreground">{event.reason}</p>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white text-sm font-medium whitespace-nowrap">
                        {event.match}% Match
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Link
                        to={`/app/event/${event.id}`}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white text-sm hover:shadow-lg transition-all"
                      >
                        View Details
                      </Link>
                      <button className="px-4 py-2 rounded-lg bg-white/50 border border-border text-sm hover:bg-white/80 transition-all">
                        Save
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-heading font-semibold">Upcoming Events</h2>
              <Link to="/app/tickets" className="text-sm text-primary hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="p-4 rounded-xl bg-white/50 border border-border">Loading your events...</div>
              ) : upcomingEvents.length === 0 ? (
                <div className="p-4 rounded-xl bg-white/50 border border-border text-sm text-muted-foreground">
                  No upcoming tickets yet. Discover an event and book your spot.
                </div>
              ) : (
                upcomingEvents.map(event => (
                  <div key={event.id} className="p-4 rounded-xl bg-gradient-to-r from-white/50 to-white/30 border border-border">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#7F5AF0] to-[#00C2FF] flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2 gap-4">
                          <div>
                            <h3 className="font-heading font-semibold mb-1">{event.title}</h3>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(event.startDate)} at {formatTime(event.startDate)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>{formatNumber(event.attendees)}</span>
                              </div>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            event.category === 'Free'
                              ? 'bg-[#00C2FF]/10 text-[#00C2FF]'
                              : 'bg-[#FF6B9D]/10 text-[#FF6B9D]'
                          }`}>
                            {event.category}
                          </span>
                        </div>
                        <Link
                          to={`/app/event/${event.id}`}
                          className="inline-block text-sm text-primary hover:underline"
                        >
                          View Ticket &rarr;
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* XP Progress */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#7F5AF0] to-[#00C2FF] text-white">
            <h3 className="font-heading font-semibold mb-4">Level Progress</h3>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Level {level.current}</span>
                <span className="text-sm">{formatNumber(level.currentXp)} / {formatNumber(level.nextLevelXp)} XP</span>
              </div>
              <div className="h-2 rounded-full bg-white/20">
                <div className="h-full rounded-full bg-white" style={{ width: `${level.progressPercent}%` }}></div>
              </div>
            </div>
            <p className="text-sm text-white/80">{formatNumber(level.xpToNextLevel)} XP to next level</p>
          </div>

          {/* Event Streak */}
          <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#2CB67D]/10 flex items-center justify-center">
                <Zap className="w-4 h-4 text-[#2CB67D]" />
              </div>
              <h3 className="font-heading font-semibold">{stats.dayStreak} Day Streak</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Keep it up! Attend an event to maintain your streak.
            </p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map(day => (
                <div
                  key={day}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium ${
                    day <= Math.min(stats.dayStreak, 7)
                      ? 'bg-gradient-to-br from-[#2CB67D] to-[#00C2FF] text-white'
                      : 'bg-white/50 border border-border text-muted-foreground'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>
          </div>

          {/* Network Activity */}
          <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
            <h3 className="font-heading font-semibold mb-4">Your Network</h3>
            <div className="space-y-3">
              {loading ? (
                <div className="text-sm text-muted-foreground">Loading connections...</div>
              ) : networkActivity.length === 0 ? (
                <div className="text-sm text-muted-foreground">No shared event connections yet.</div>
              ) : (
                networkActivity.map((person, i) => (
                  <div key={`${person.name}-${i}`} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7F5AF0] to-[#00C2FF]"></div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{person.name}</div>
                      <div className="text-xs text-muted-foreground truncate">Attending {person.event}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Link to="/app/networking" className="block mt-4 text-sm text-primary hover:underline">
              View All Connections &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
