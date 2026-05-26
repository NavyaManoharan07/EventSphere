import { useEffect, useState, useRef } from 'react';
import { Users, Plus, TrendingUp, MessageSquare, Calendar, Upload, Sparkles, Link as LinkIcon, Trophy, Send } from 'lucide-react';
import { authGetJson, authPostJson } from '@/lib/api';

type Community = {
  id: string;
  name: string;
  description: string;
  category: string;
  type: string;
  members: number;
  posts: number;
  resources: number;
  events: number;
  joined: boolean;
  match?: number;
  reason?: string;
};

type CommunityHome = {
  myCommunities: Community[];
  suggestedCommunities: Community[];
  recentDiscussions: any[];
  trendingTopics: Array<{ topic: string; posts: number }>;
};

const emptyHome: CommunityHome = {
  myCommunities: [],
  suggestedCommunities: [],
  recentDiscussions: [],
  trendingTopics: [],
};

export function Communities() {
  const [home, setHome] = useState<CommunityHome>(emptyHome);
  const [selectedCommunityId, setSelectedCommunityId] = useState('');
  const [feed, setFeed] = useState<any>(null);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [teamInvitations, setTeamInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedLoading, setFeedLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newCommunity, setNewCommunity] = useState({ name: '', description: '', category: '', type: 'interest' });
  const [discussion, setDiscussion] = useState({ title: '', message: '', type: 'discussion' });
  const [resource, setResource] = useState({ title: '', fileUrl: '' });
  const workspaceRef = useRef<HTMLDivElement>(null);

  const loadCommunities = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await authGetJson<CommunityHome>('/communities');
      setHome(data || emptyHome);
      const firstCommunity = data.myCommunities?.[0] || data.suggestedCommunities?.[0];
      if (!selectedCommunityId && firstCommunity) {
        setSelectedCommunityId(firstCommunity.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load communities');
    } finally {
      setLoading(false);
    }
  };

  const loadFeed = async (communityId: string) => {
    if (!communityId) return;
    setFeedLoading(true);

    try {
      const [feedData, suggestionsData] = await Promise.all([
        authGetJson(`/communities/${communityId}/feed`),
        authGetJson<{ suggestions: any[] }>(`/communities/${communityId}/suggestions`),
      ]);
      setFeed(feedData);
      setAiSuggestions(suggestionsData.suggestions || []);
      try {
        const invites = await authGetJson<any[]>('/communities/team-invitations');
        setTeamInvitations(invites || []);
      } catch {
        setTeamInvitations([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load community feed');
    } finally {
      setFeedLoading(false);
    }
  };

  useEffect(() => {
    loadCommunities();
  }, []);

  useEffect(() => {
    loadFeed(selectedCommunityId);
  }, [selectedCommunityId]);

  const createCommunity = async () => {
    setError('');
    setMessage('');

    try {
      const created = await authPostJson<Community>('/communities', newCommunity);
      setNewCommunity({ name: '', description: '', category: '', type: 'interest' });
      setShowCreate(false);
      setSelectedCommunityId(created.id);
      setMessage('Community created. Members can now join, discuss, and share resources.');
      await loadCommunities();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create community');
    }
  };

  const joinCommunity = async (communityId: string) => {
    setError('');
    setMessage('');

    try {
      await authPostJson(`/communities/${communityId}/join`, {});
      setSelectedCommunityId(communityId);
      setMessage('Joined community. You earned community participation XP.');
      await loadCommunities();
      await loadFeed(communityId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to join community');
    }
  };

  const createDiscussion = async () => {
    if (!selectedCommunityId) return;
    setError('');

    try {
      await authPostJson('/communities/discussions', {
        communityId: selectedCommunityId,
        ...discussion,
      });
      setDiscussion({ title: '', message: '', type: 'discussion' });
      setMessage('Discussion posted. Community members can now continue the conversation.');
      await loadCommunities();
      await loadFeed(selectedCommunityId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create discussion');
    }
  };

  const uploadResource = async () => {
    if (!selectedCommunityId) return;
    setError('');

    try {
      await authPostJson('/communities/resources', {
        communityId: selectedCommunityId,
        ...resource,
      });
      setResource({ title: '', fileUrl: '' });
      setMessage('Resource shared with the community.');
      await loadFeed(selectedCommunityId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to upload resource');
    }
  };

  const connectWithMember = async (person: any) => {
    try {
      await authPostJson('/communities/team-invitations', {
        receiverId: person.id,
        communityId: selectedCommunityId,
        message: `Want to team up in ${feed?.community?.name || 'this community'}?`,
      });
      setMessage(`Team invitation sent to ${person.name}.`);
      const invites = await authGetJson<any[]>('/communities/team-invitations');
      setTeamInvitations(invites || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send team invitation');
    }
  };

  const communityCards = home.myCommunities.length ? home.myCommunities : [];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-heading font-bold mb-2">Communities</h1>
          <p className="text-muted-foreground">Mini social ecosystems around events, interests, goals, and people</p>
        </div>
        <button
          onClick={() => setShowCreate((value) => !value)}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white font-medium hover:shadow-xl hover:shadow-primary/30 transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Community
        </button>
      </div>

      {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {message && <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{message}</div>}

      {showCreate && (
        <div className="mb-6 p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
          <h2 className="text-xl font-heading font-semibold mb-4">Create a Community</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              value={newCommunity.name}
              onChange={(event) => setNewCommunity({ ...newCommunity, name: event.target.value })}
              placeholder="AI Placement Preparation Hub"
              className="px-4 py-3 rounded-xl bg-white/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <input
              value={newCommunity.category}
              onChange={(event) => setNewCommunity({ ...newCommunity, category: event.target.value })}
              placeholder="AI, Career, Music, Hackathon"
              className="px-4 py-3 rounded-xl bg-white/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <select
              value={newCommunity.type}
              onChange={(event) => setNewCommunity({ ...newCommunity, type: event.target.value })}
              className="px-4 py-3 rounded-xl bg-white/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="interest">Interest</option>
              <option value="career">Career</option>
              <option value="entertainment">Entertainment</option>
              <option value="hackathon">Hackathon / Team</option>
              <option value="event">Event</option>
            </select>
            <button
              onClick={createCommunity}
              className="px-4 py-3 rounded-xl bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white"
            >
              Launch Community
            </button>
          </div>
          <textarea
            value={newCommunity.description}
            onChange={(event) => setNewCommunity({ ...newCommunity, description: event.target.value })}
            rows={3}
            placeholder="Describe what members will discuss, share, and build together..."
            className="mt-4 w-full px-4 py-3 rounded-xl bg-white/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
            <h2 className="text-xl font-heading font-semibold mb-6">My Communities</h2>

            {loading ? (
              <div className="p-4 rounded-xl bg-white/50 border border-border">Loading communities...</div>
            ) : communityCards.length === 0 ? (
              <div className="p-4 rounded-xl bg-white/50 border border-border text-sm text-muted-foreground">
                Join a suggested community or create one to start discussions, resources, and team formation.
              </div>
            ) : (
              <div className="space-y-4">
                {communityCards.map(community => (
                  <div key={community.id} className="p-4 rounded-xl bg-white/50 border border-border hover:shadow-lg transition-all">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#7F5AF0] to-[#00C2FF] flex-shrink-0"></div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h3 className="font-heading font-semibold mb-1">{community.name}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{community.description}</p>
                            <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                              {community.category}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground capitalize">{community.type}</span>
                        </div>

                        <div className="grid grid-cols-4 gap-4 mt-3 mb-4">
                          <div>
                            <div className="flex items-center gap-1 text-muted-foreground mb-1">
                              <Users className="w-4 h-4" />
                              <span className="text-xs">Members</span>
                            </div>
                            <div className="font-medium">{community.members.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="flex items-center gap-1 text-muted-foreground mb-1">
                              <MessageSquare className="w-4 h-4" />
                              <span className="text-xs">Posts</span>
                            </div>
                            <div className="font-medium">{community.posts.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="flex items-center gap-1 text-muted-foreground mb-1">
                              <LinkIcon className="w-4 h-4" />
                              <span className="text-xs">Resources</span>
                            </div>
                            <div className="font-medium">{community.resources}</div>
                          </div>
                          <div>
                            <div className="flex items-center gap-1 text-muted-foreground mb-1">
                              <Calendar className="w-4 h-4" />
                              <span className="text-xs">Events</span>
                            </div>
                            <div className="font-medium">{community.events}</div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedCommunityId(community.id);
                            workspaceRef.current?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white text-sm hover:shadow-lg transition-all"
                        >
                          Open Community
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
            <h3 className="font-heading font-semibold mb-4">Team Invitations</h3>
            <div className="space-y-3">
              {teamInvitations.length === 0 ? (
                <div className="text-sm text-muted-foreground">No team invitations yet.</div>
              ) : teamInvitations.slice(0, 5).map((invite) => (
                <div key={invite._id} className="p-3 rounded-xl bg-white/50 border border-border">
                  <div className="font-medium text-sm">{invite.sender?.name} → {invite.receiver?.name}</div>
                  <div className="text-xs text-muted-foreground">{invite.community?.name || invite.event?.title || 'Team request'} • {invite.status}</div>
                  <div className="text-xs text-muted-foreground mt-1">{invite.message}</div>
                </div>
              ))}
            </div>
          </div>

          <div ref={workspaceRef} className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-heading font-semibold">Community Workspace</h2>
              {feed?.community && <span className="text-sm text-muted-foreground">{feed.community.name}</span>}
            </div>

            {!selectedCommunityId ? (
              <div className="p-4 rounded-xl bg-white/50 border border-border text-sm text-muted-foreground">
                Select or join a community to see discussions, resources, AI teammates, and leaderboards.
              </div>
            ) : feedLoading ? (
              <div className="p-4 rounded-xl bg-white/50 border border-border">Loading community workspace...</div>
            ) : (
              <div className="flex flex-col h-[650px]">
                <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4 chat-container">
                  {(feed?.discussions || []).length === 0 ? (
                    <div className="p-8 rounded-xl bg-white/30 border border-dashed border-border text-sm text-muted-foreground text-center">
                      <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-20" />
                      <p>No messages yet in this community workspace.</p>
                      <p className="text-xs">Be the first to start a discussion below!</p>
                    </div>
                  ) : (
                    feed.discussions.map((item: any) => (
                      <div key={item.id} className="flex flex-col group">
                        <div className="flex items-center gap-2 mb-1 px-1">
                          <span className="font-bold text-[11px] text-[#7F5AF0]">{item.author}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-accent/50 text-muted-foreground uppercase font-medium">{item.type}</span>
                        </div>
                        <div className="p-3 rounded-2xl rounded-tl-none bg-white/80 border border-border shadow-sm group-hover:shadow-md transition-all max-w-[85%]">
                          {item.title && <h4 className="font-bold text-sm mb-1 text-foreground">{item.title}</h4>}
                          <p className="text-sm text-foreground/90 leading-relaxed">{item.message}</p>
                          <div className="mt-2 flex items-center gap-3 text-[10px] text-muted-foreground border-t border-border/30 pt-1.5">
                            <span className="flex items-center gap-1 hover:text-primary cursor-pointer transition-colors">
                              <MessageSquare className="w-3 h-3" /> {item.replies} replies
                            </span>
                            <span className="flex items-center gap-1 hover:text-pink-500 cursor-pointer transition-colors">
                              <Plus className="w-3 h-3" /> {item.likes} likes
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-auto pt-4 border-t border-border bg-white/20 -mx-6 px-6 pb-2 rounded-b-2xl">
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        value={discussion.title}
                        onChange={(event) => setDiscussion({ ...discussion, title: event.target.value })}
                        placeholder="Subject (optional)"
                        className="flex-1 px-4 py-2 rounded-xl bg-white/90 border border-border focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm transition-all"
                      />
                      <select
                        value={discussion.type}
                        onChange={(event) => setDiscussion({ ...discussion, type: event.target.value })}
                        className="px-3 py-2 rounded-xl bg-white/90 border border-border text-xs focus:outline-none"
                      >
                        <option value="discussion">Discussion</option>
                        <option value="team">Team Formation</option>
                        <option value="opportunity">Opportunity</option>
                        <option value="announcement">Announcement</option>
                      </select>
                    </div>
                    <div className="relative">
                      <textarea
                        value={discussion.message}
                        onChange={(event) => setDiscussion({ ...discussion, message: event.target.value })}
                        rows={2}
                        placeholder="Type your message to the community..."
                        className="w-full pl-4 pr-14 py-3 rounded-2xl bg-white/90 border border-border focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none text-sm shadow-inner transition-all"
                      />
                      <button
                        onClick={createDiscussion}
                        disabled={!discussion.message.trim()}
                        className="absolute right-2 bottom-2 p-2.5 bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white rounded-xl shadow-lg hover:shadow-primary/40 disabled:opacity-40 disabled:shadow-none transition-all active:scale-95"
                        title="Send Message"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-8">
                  <div className="p-4 rounded-xl bg-white/60 border border-border shadow-sm">
                    <h3 className="font-bold text-xs mb-3 flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                      <LinkIcon className="w-3.5 h-3.5" />
                      Community Resources
                    </h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {(feed?.resources || []).length === 0 ? (
                        <div className="text-[11px] text-muted-foreground text-center py-4 border border-dashed border-border rounded-lg bg-white/30">
                          No resources shared yet.
                        </div>
                      ) : (
                        feed.resources.map((item: any) => (
                          <a
                            key={item.id}
                            href={item.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-between p-2.5 rounded-lg bg-white/80 border border-border hover:border-primary/30 hover:shadow-sm transition-all group"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-xs truncate text-foreground group-hover:text-primary transition-colors">{item.title}</div>
                              <div className="text-[9px] text-muted-foreground">shared by {item.uploadedBy}</div>
                            </div>
                            <Upload className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                        ))
                      )}
                    </div>
                    <div className="mt-4 pt-3 border-t border-border/50">
                      <div className="flex gap-2 mb-2">
                        <input
                          value={resource.title}
                          onChange={(event) => setResource({ ...resource, title: event.target.value })}
                          placeholder="Resource Name"
                          className="flex-1 px-3 py-2 rounded-lg bg-white/80 border border-border text-[11px] focus:outline-none"
                        />
                        <button 
                          onClick={uploadResource} 
                          disabled={!resource.title || !resource.fileUrl}
                          className="px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white disabled:opacity-30 transition-all text-[11px] font-bold"
                        >
                          Share
                        </button>
                      </div>
                      <input
                        value={resource.fileUrl}
                        onChange={(event) => setResource({ ...resource, fileUrl: event.target.value })}
                        placeholder="Link (https://...)"
                        className="w-full px-3 py-2 rounded-lg bg-white/80 border border-border text-[11px] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white/60 border border-border shadow-sm">
                    <h3 className="font-bold text-xs mb-3 flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                      <Users className="w-3.5 h-3.5" />
                      Active Members
                    </h3>
                    <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1">
                      {(feed?.members || []).length === 0 ? (
                        <div className="text-[11px] text-muted-foreground text-center py-4">No active members yet.</div>
                      ) : (
                        feed.members.map((member: any) => (
                          <div key={member.id || member.name} className="flex items-center justify-between p-2.5 rounded-lg bg-white/80 border border-border hover:shadow-sm transition-all">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#7F5AF0] to-[#00C2FF] flex-shrink-0 flex items-center justify-center text-[10px] text-white font-bold">
                                {member.name.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-xs truncate text-foreground">{member.name}</div>
                                <div className="text-[9px] text-muted-foreground truncate italic">{member.role}</div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-600 font-bold border border-green-500/20 uppercase tracking-tighter">Online</span>
                              <span className="text-[9px] text-muted-foreground font-medium">{member.city || 'Global'}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
            <h3 className="font-heading font-semibold mb-4">AI Suggested Communities</h3>

            <div className="space-y-3">
              {home.suggestedCommunities.length === 0 ? (
                <div className="text-sm text-muted-foreground">No suggestions yet. Add interests in Settings.</div>
              ) : home.suggestedCommunities.map(community => (
                <div key={community.id} className="p-3 rounded-xl bg-white/50 border border-border">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#7F5AF0] to-[#00C2FF]"></div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{community.name}</div>
                      <div className="text-xs text-muted-foreground">{community.members.toLocaleString()} members</div>
                      <div className="text-xs text-muted-foreground">{community.match}% match - {community.reason}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => joinCommunity(community.id)}
                    className="w-full px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white text-sm hover:shadow-lg transition-all"
                  >
                    Join Community
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-[#7F5AF0]" />
              <h3 className="font-heading font-semibold">AI Team Matches</h3>
            </div>
            <div className="space-y-3">
              {aiSuggestions.length === 0 ? (
                <div className="text-sm text-muted-foreground">Join a community with members to see teammate matches.</div>
              ) : aiSuggestions.map((person) => (
                <div key={person.id} className="p-3 rounded-xl bg-white/50 border border-border">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium text-sm">{person.name}</div>
                      <div className="text-xs text-muted-foreground">{person.reason}</div>
                      <div className="text-xs text-muted-foreground">{person.matchScore}% collaboration match</div>
                    </div>
                    <button
                      onClick={() => connectWithMember(person)}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white text-xs"
                    >
                      Connect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-[#FFD60A]" />
              <h3 className="font-heading font-semibold">Community Leaderboard</h3>
            </div>
            <div className="space-y-2">
              {(feed?.leaderboard || []).length === 0 ? (
                <div className="text-sm text-muted-foreground">No leaderboard yet.</div>
              ) : feed.leaderboard.map((member: any) => (
                <div key={`${member.rank}-${member.name}`} className="flex items-center justify-between p-3 rounded-lg bg-white/50 border border-border">
                  <div className="font-medium text-sm">{member.rank}. {member.name}</div>
                  <div className="text-xs text-muted-foreground">{member.xpContribution} XP</div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#7F5AF0] to-[#00C2FF] text-white">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5" />
              <h3 className="font-heading font-semibold">Trending Topics</h3>
            </div>
            <div className="space-y-2">
              {home.trendingTopics.map((topic) => (
                <button key={topic.topic} className="w-full text-left px-3 py-2 rounded-lg bg-white/20 backdrop-blur hover:bg-white/30 transition-all">
                  <div className="font-medium">{topic.topic}</div>
                  <div className="text-xs text-white/80">{topic.posts} posts</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
