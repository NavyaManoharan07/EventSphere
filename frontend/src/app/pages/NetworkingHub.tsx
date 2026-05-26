import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Sparkles, Users, MessageSquare, MapPin } from 'lucide-react';
import { authGetJson, authPostJson } from '@/lib/api';

const isRouteNotFound = (error: unknown) => (
  error instanceof Error && error.message.toLowerCase().includes('route not found')
);

const isExistingConnection = (error: unknown) => (
  error instanceof Error && error.message.toLowerCase().includes('connection request already exists')
);

export function NetworkingHub() {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set());
  const [suggestedCommunities, setSuggestedCommunities] = useState<any[]>([]);
  const [joiningCommunityId, setJoiningCommunityId] = useState<string | null>(null);
  const [showAllNearby, setShowAllNearby] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);

  useEffect(() => {
    const loadSuggestions = async () => {
      setLoading(true);
      setError('');
      setSuccess('');

      try {
        const data = await authGetJson<{ suggestions: any[] }>('/events/networking/suggestions');
        const suggestions = data.suggestions || [];
        setRecommendations(suggestions);
        setConnectedIds(new Set(suggestions.filter((person) => person.connected).map((person) => String(person.id || person._id))));
      } catch (err) {
        if (!isRouteNotFound(err)) {
          setError(err instanceof Error ? err.message : 'Unable to load networking suggestions');
        }
      } finally {
        setLoading(false);
      }

      try {
        const communityData = await authGetJson<{ suggestedCommunities: any[] }>('/communities');
        setSuggestedCommunities(communityData.suggestedCommunities || []);
      } catch {
        setSuggestedCommunities([]);
      }
    };

    loadSuggestions();
  }, []);

  const handleConnect = async (person: any) => {
    const id = person.id || person._id;
    if (!id) return;

    setConnectingId(String(id));
    setError('');
    setSuccess('');

    try {
      try {
        await authPostJson(`/social/connections/${id}/connect`, {
          matchScore: person.match || 0,
        });
      } catch (err) {
        if (isExistingConnection(err)) {
          setConnectedIds((current) => new Set(current).add(String(id)));
          setSuccess(`You are already connected with ${person.name}.`);
          return;
        }
        if (!isRouteNotFound(err)) throw err;
        try {
          await authPostJson('/communities/connections', {
            receiverId: id,
            communityId: null,
            matchScore: person.match || 0,
          });
        } catch (fallbackError) {
          if (!isExistingConnection(fallbackError)) throw fallbackError;
        }
      }
      setConnectedIds((current) => new Set(current).add(String(id)));
      setSuccess(`You are now connected with and following ${person.name}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send connection request');
    } finally {
      setConnectingId(null);
    }
  };

  const handleViewProfile = async (person: any) => {
    const id = person.id || person._id;
    if (!id) return;

    setProfileOpen(true);
    setProfileLoading(true);
    setSelectedProfile({
      ...person,
      id,
      interests: person.interests || [],
      goals: person.goals || [],
    });
    setError('');
    setSuccess('');

    try {
      const profile = await authGetJson(`/auth/user/${id}`);
      setSelectedProfile({
        ...person,
        ...profile,
        id: profile.id || id,
        interests: profile.interests || person.interests || [],
        goals: profile.goals || person.goals || [],
      });
    } catch {
      setSelectedProfile({
        ...person,
        id,
        interests: person.interests || [],
        goals: person.goals || [],
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleJoinCommunity = async (community: any) => {
    setJoiningCommunityId(community.id);
    setError('');
    setSuccess('');

    try {
      await authPostJson(`/communities/${community.id}/join`, {});
      setSuggestedCommunities((items) => items.filter((item) => item.id !== community.id));
      setSuccess(`Joined ${community.name}. Open Communities to see posts, resources, members, and teammate matches.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to join community');
    } finally {
      setJoiningCommunityId(null);
    }
  };

  const nearbyMatches = recommendations.filter((person) => person.city);
  const nearbyAttendees = showAllNearby ? nearbyMatches : nearbyMatches.slice(0, 2);

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
      {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {success && <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</div>}

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
              ) : recommendations.length === 0 ? (
                <div className="p-4 rounded-xl bg-white/50 border border-border text-sm text-muted-foreground">
                  No AI networking matches yet. Add interests in Settings or attend events to improve matches.
                </div>
              ) : recommendations.map(person => {
                const personId = String(person.id || person._id);
                const isConnected = connectedIds.has(personId);

                return (
                <div key={personId} className="p-4 rounded-xl bg-white/50 border border-border hover:shadow-lg transition-all">
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

                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => handleConnect(person)}
                          disabled={connectingId === personId || isConnected}
                          className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white text-sm hover:shadow-lg transition-all disabled:opacity-50"
                        >
                          {connectingId === personId ? 'Connecting...' : isConnected ? 'Connected' : 'Connect'}
                        </button>
                        <button
                          onClick={() => handleViewProfile(person)}
                          className="px-4 py-2 rounded-lg bg-white/50 border border-border text-sm hover:bg-white/80 transition-all"
                        >
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
                );
              })}
            </div>
          </div>

          {/* Team Finder */}
          <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
            <h2 className="text-xl font-heading font-semibold mb-4">Team Finder</h2>
            <p className="text-muted-foreground mb-4">
              Looking for collaborators? Find team members for hackathons, projects, or startups.
            </p>
            <button
              onClick={() => navigate('/app/communities')}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white font-medium hover:shadow-xl hover:shadow-primary/30 transition-all"
            >
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
            <button
              onClick={() => setShowAllNearby((value) => !value)}
              className="w-full px-4 py-2 rounded-lg bg-white/20 backdrop-blur hover:bg-white/30 transition-all"
            >
              {showAllNearby ? 'Show Less' : 'View All'}
            </button>
          </div>

          {/* Suggested Communities */}
          <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
            <h3 className="font-heading font-semibold mb-4">Suggested Communities</h3>
            <div className="space-y-3">
              {suggestedCommunities.length === 0 ? (
                <div className="text-sm text-muted-foreground">No new community suggestions yet. Add interests or create communities to improve matches.</div>
              ) : suggestedCommunities.slice(0, 4).map((community) => (
                <div key={community.id} className="p-3 rounded-xl bg-white/50 border border-border">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7F5AF0] to-[#00C2FF]"></div>
                    <div>
                      <div className="font-medium text-sm">{community.name}</div>
                      <div className="text-xs text-muted-foreground">{community.members} members</div>
                      <div className="text-xs text-muted-foreground">{community.match}% match</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleJoinCommunity(community)}
                    disabled={joiningCommunityId === community.id}
                    className="w-full px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white text-xs hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {joiningCommunityId === community.id ? 'Joining...' : 'Join'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {profileOpen && selectedProfile && (
        <div className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="w-full max-w-3xl rounded-3xl bg-white border border-border shadow-2xl overflow-hidden">
            <div className="h-28 bg-gradient-to-r from-[#7F5AF0] via-[#00C2FF] to-[#2CB67D]"></div>
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 -mt-16 mb-6">
                <div className="flex items-end gap-4">
                  <div className="w-28 h-28 rounded-full border-4 border-white bg-gradient-to-br from-[#7F5AF0] to-[#00C2FF] flex items-center justify-center text-white text-4xl font-heading overflow-hidden">
                    {selectedProfile.profilePhoto ? (
                      <img src={selectedProfile.profilePhoto} alt={selectedProfile.name} className="w-full h-full object-cover" />
                    ) : (
                      selectedProfile.name?.charAt(0)
                    )}
                  </div>
                  <div className="pb-2">
                    <h2 className="text-2xl font-heading font-bold">{selectedProfile.name}</h2>
                    <p className="text-sm text-muted-foreground">{selectedProfile.city || 'EventSphere member'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setProfileOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white border border-border text-sm hover:bg-slate-50"
                >
                  Close
                </button>
              </div>

              {profileLoading ? (
                <div className="rounded-2xl bg-slate-50 border border-border p-6 text-sm text-muted-foreground">
                  Loading profile...
                </div>
              ) : (
                <div className="grid md:grid-cols-[1fr_220px] gap-6">
                  <div className="space-y-4">
                    <div className="rounded-2xl bg-slate-50 border border-border p-5">
                      <h3 className="font-heading font-semibold mb-2">About</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedProfile.bio || `${selectedProfile.name} is open to networking, event conversations, and collaboration.`}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 border border-border p-5">
                      <h3 className="font-heading font-semibold mb-3">Interests</h3>
                      <div className="flex flex-wrap gap-2">
                        {(selectedProfile.interests || []).length ? selectedProfile.interests.map((interest: string) => (
                          <span key={interest} className="px-3 py-1 rounded-full bg-white border text-xs text-muted-foreground">{interest}</span>
                        )) : (
                          <span className="text-sm text-muted-foreground">No interests added yet.</span>
                        )}
                      </div>
                    </div>

                    <div className="rounded-2xl bg-slate-50 border border-border p-5">
                      <h3 className="font-heading font-semibold mb-3">Goals</h3>
                      <div className="flex flex-wrap gap-2">
                        {(selectedProfile.goals || []).length ? selectedProfile.goals.map((goal: string) => (
                          <span key={goal} className="px-3 py-1 rounded-full bg-white border text-xs text-muted-foreground">{goal}</span>
                        )) : (
                          <span className="text-sm text-muted-foreground">No goals added yet.</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => handleConnect(selectedProfile)}
                      disabled={connectedIds.has(String(selectedProfile.id))}
                      className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white text-sm font-medium disabled:opacity-50"
                    >
                      {connectedIds.has(String(selectedProfile.id)) ? 'Connected' : 'Connect'}
                    </button>
                    <Link
                      to={`/app/messages?user=${selectedProfile.id}`}
                      className="block w-full px-4 py-3 rounded-xl bg-white border border-border text-sm font-medium text-center hover:bg-slate-50"
                    >
                      Message
                    </Link>
                    <div className="rounded-2xl bg-slate-50 border border-border p-4 text-sm text-muted-foreground">
                      <div className="font-medium text-foreground mb-2">Profile Summary</div>
                      <div>{selectedProfile.match ?? 0}% AI match</div>
                      <div>{selectedProfile.sharedEvents || 0} shared events</div>
                      <div>{selectedProfile.eventPreference || 'Any'} preference</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
