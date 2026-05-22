import { Link } from 'react-router';
import { Calendar, MapPin, Users, TrendingUp, Sparkles, Zap, Award, Target } from 'lucide-react';

export function Dashboard() {
  const upcomingEvents = [
    { id: 1, title: 'AI Summit 2026', date: 'May 25', time: '10:00 AM', attendees: 1250, category: 'Career' },
    { id: 2, title: 'Summer Music Fest', date: 'Jun 10', time: '6:00 PM', attendees: 5000, category: 'Entertainment' },
  ];

  const aiRecommendations = [
    { id: 3, title: 'Startup Networking Night', match: 95, reason: 'Based on your interests in tech and networking' },
    { id: 4, title: 'Design Workshop', match: 88, reason: 'Popular with people in your network' },
  ];

  const networkActivity = [
    { name: 'Sarah Chen', event: 'Tech Conference 2026', avatar: 1 },
    { name: 'Mike Johnson', event: 'Startup Pitch Night', avatar: 2 },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-heading font-bold mb-2">Welcome back!</h1>
        <p className="text-muted-foreground">Here's what's happening in your event world</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-full bg-[#7F5AF0]/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[#7F5AF0]" />
            </div>
            <TrendingUp className="w-4 h-4 text-[#2CB67D]" />
          </div>
          <div className="text-2xl font-heading font-bold mb-1">12</div>
          <div className="text-sm text-muted-foreground">Events Attended</div>
        </div>

        <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-full bg-[#00C2FF]/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-[#00C2FF]" />
            </div>
            <TrendingUp className="w-4 h-4 text-[#2CB67D]" />
          </div>
          <div className="text-2xl font-heading font-bold mb-1">48</div>
          <div className="text-sm text-muted-foreground">Connections Made</div>
        </div>

        <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-full bg-[#FFD60A]/10 flex items-center justify-center">
              <Award className="w-5 h-5 text-[#FFD60A]" />
            </div>
          </div>
          <div className="text-2xl font-heading font-bold mb-1">1,250</div>
          <div className="text-sm text-muted-foreground">XP Points</div>
        </div>

        <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-full bg-[#2CB67D]/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#2CB67D]" />
            </div>
          </div>
          <div className="text-2xl font-heading font-bold mb-1">5</div>
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
              {aiRecommendations.map(event => (
                <div key={event.id} className="p-4 rounded-xl bg-white/50 border border-border hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-heading font-semibold mb-1">{event.title}</h3>
                      <p className="text-sm text-muted-foreground">{event.reason}</p>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white text-sm font-medium">
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
              ))}
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
              {upcomingEvents.map(event => (
                <div key={event.id} className="p-4 rounded-xl bg-gradient-to-r from-white/50 to-white/30 border border-border">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#7F5AF0] to-[#00C2FF] flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-heading font-semibold mb-1">{event.title}</h3>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{event.date} at {event.time}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{event.attendees}</span>
                            </div>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          event.category === 'Career'
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
                        View Ticket →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
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
                <span className="text-sm">Level 5</span>
                <span className="text-sm">1,250 / 2,000 XP</span>
              </div>
              <div className="h-2 rounded-full bg-white/20">
                <div className="h-full rounded-full bg-white" style={{ width: '62%' }}></div>
              </div>
            </div>
            <p className="text-sm text-white/80">750 XP to next level</p>
          </div>

          {/* Event Streak */}
          <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#2CB67D]/10 flex items-center justify-center">
                <Zap className="w-4 h-4 text-[#2CB67D]" />
              </div>
              <h3 className="font-heading font-semibold">5 Day Streak</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Keep it up! Attend an event to maintain your streak.
            </p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map(day => (
                <div
                  key={day}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium ${
                    day <= 5
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
              {networkActivity.map((person, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7F5AF0] to-[#00C2FF]"></div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{person.name}</div>
                    <div className="text-xs text-muted-foreground truncate">Attending {person.event}</div>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/app/networking" className="block mt-4 text-sm text-primary hover:underline">
              View All Connections →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
