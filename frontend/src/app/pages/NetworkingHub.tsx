import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Sparkles, Users, MessageSquare, MapPin } from 'lucide-react';
import { authGetJson } from '@/lib/api';

export function NetworkingHub() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSuggestions = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await authGetJson<{ suggestions: any[] }>('/events/networking/suggestions');
        setRecommendations(data.suggestions || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load networking suggestions');
      } finally {
        setLoading(false);
      }
    };

    loadSuggestions();
  }, []);

  const nearbyAttendees = recommendations.filter((person) => person.city).slice(0, 2);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-heading font-bold mb-2">Networking Hub</h1>
        <p className="text-muted-foreground">Connect with people who share your interests</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-[#00C2FF]/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-[#00C2FF]" />
            </div>
            <div>
              <div className="text-2xl font-heading font-bold">{recommendations.filter((person) => person.sharedEvents > 0).length}</div>
              <div className="text-sm text-muted-foreground">Warm Matches</div>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-[#7F5AF0]/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#7F5AF0]" />
            </div>
            <div>
              <div className="text-2xl font-heading font-bold">{recommendations.length}</div>
              <div className="text-sm text-muted-foreground">AI Matches</div>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-[#2CB67D]/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-[#2CB67D]" />
            </div>
            <div>
              <div className="text-2xl font-heading font-bold">{recommendations.reduce((total, person) => total + (person.sharedEvents || 0), 0)}</div>
              <div className="text-sm text-muted-foreground">Shared Events</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* AI Recommendations */}
          <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7F5AF0] to-[#00C2FF] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-heading font-semibold">People You Should Meet</h2>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="p-4 rounded-xl bg-white/50 border border-border">Loading AI matches...</div>
              ) : error ? (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">{error}</div>
              ) : recommendations.length === 0 ? (
                <div className="p-4 rounded-xl bg-white/50 border border-border text-sm text-muted-foreground">
                  No AI networking matches yet. Add interests in Settings or attend events to improve matches.
                </div>
              ) : recommendations.map(person => (
                <div key={person.id || person._id} className="p-4 rounded-xl bg-white/50 border border-border hover:shadow-lg transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#7F5AF0] to-[#00C2FF] flex-shrink-0"></div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-heading font-semibold">{person.name}</h3>
                          <p className="text-sm text-muted-foreground">{person.bio || person.city || 'EventSphere member'}</p>
                        </div>
                        <div className="px-3 py-1 rounded-full bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white text-xs font-medium whitespace-nowrap">
                          {person.match}% Match
                        </div>
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Sparkles className="w-4 h-4" />
                          <span>{person.reason}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span>{person.sharedEvents || 0} shared events</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white text-sm hover:shadow-lg transition-all">
                          Connect
                        </button>
                        <button className="px-4 py-2 rounded-lg bg-white/50 border border-border text-sm hover:bg-white/80 transition-all">
                          View Profile
                        </button>
                        <Link 
                          to={`/app/messages?user=${person.id || person._id}`}
                          className="px-4 py-2 rounded-lg bg-white/50 border border-border text-sm hover:bg-white/80 transition-all"
                        >
                          Message
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Finder */}
          <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
            <h2 className="text-xl font-heading font-semibold mb-4">Team Finder</h2>
            <p className="text-muted-foreground mb-4">
              Looking for collaborators? Find team members for hackathons, projects, or startups.
            </p>
            <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white font-medium hover:shadow-xl hover:shadow-primary/30 transition-all">
              Find Team Members
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Nearby Attendees */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#2CB67D] to-[#00C2FF] text-white">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5" />
              <h3 className="font-heading font-semibold">Nearby Attendees</h3>
            </div>
            <div className="space-y-3 mb-4">
              {nearbyAttendees.length === 0 ? (
                <div className="p-3 rounded-xl bg-white/20 backdrop-blur text-sm">Add your city in Settings to discover local matches.</div>
              ) : nearbyAttendees.map((person, i) => (
                <div key={i} className="p-3 rounded-xl bg-white/20 backdrop-blur">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-white/30"></div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{person.name}</div>
                      <div className="text-xs text-white/80 truncate">{person.city}</div>
                    </div>
                  </div>
                  <div className="text-xs text-white/80">{person.match}% AI match</div>
                </div>
              ))}
            </div>
            <button className="w-full px-4 py-2 rounded-lg bg-white/20 backdrop-blur hover:bg-white/30 transition-all">
              View All
            </button>
          </div>

          {/* Suggested Communities */}
          <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
            <h3 className="font-heading font-semibold mb-4">Suggested Communities</h3>
            <div className="space-y-3">
              {['AI Enthusiasts', 'Tech Founders', 'Product Managers'].map((community, i) => (
                <div key={i} className="p-3 rounded-xl bg-white/50 border border-border">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7F5AF0] to-[#00C2FF]"></div>
                    <div>
                      <div className="font-medium text-sm">{community}</div>
                      <div className="text-xs text-muted-foreground">{Math.floor(Math.random() * 500 + 200)} members</div>
                    </div>
                  </div>
                  <button className="w-full px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white text-xs hover:shadow-lg transition-all">
                    Join
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
