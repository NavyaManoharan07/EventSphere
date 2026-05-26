import { useEffect, useState } from 'react';
import { Users, Plus, TrendingUp, MessageSquare, Calendar, Upload, Sparkles, Link as LinkIcon, Trophy } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);
  const [feedLoading, setFeedLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newCommunity, setNewCommunity] = useState({ name: '', description: '', category: '', type: 'interest' });
  const [discussion, setDiscussion] = useState({ title: '', message: '', type: 'discussion' });
  const [resource, setResource] = useState({ title: '', fileUrl: '' });

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
      await authPostJson('/communities/connections', {
        receiverId: person.id,
        communityId: selectedCommunityId,
        matchScore: person.matchScore,
      });
      setMessage(`Connection request sent to ${person.name}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send connection request');
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
                          onClick={() => setSelectedCommunityId(community.id)}
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
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/50 border border-border">
                    <h3 className="font-heading font-semibold mb-3">Create Discussion</h3>
                    <input
                      value={discussion.title}
                      onChange={(event) => setDiscussion({ ...discussion, title: event.target.value })}
                      placeholder="Anyone interested in AI healthcare startups?"
                      className="w-full mb-3 px-4 py-2 rounded-lg bg-white/70 border border-border focus:outline-none"
                    />
                    <textarea
                      value={discussion.message}
                      onChange={(event) => setDiscussion({ ...discussion, message: event.target.value })}
                      rows={3}
                      placeholder="Share a question, opportunity, idea, or team request..."
                      className="w-full mb-3 px-4 py-2 rounded-lg bg-white/70 border border-border focus:outline-none resize-none"
                    />
                    <div className="flex gap-2">
                      <select
                        value={discussion.type}
                        onChange={(event) => setDiscussion({ ...discussion, type: event.target.value })}
                        className="flex-1 px-3 py-2 rounded-lg bg-white/70 border border-border"
                      >
                        <option value="discussion">Discussion</option>
                        <option value="team">Team Formation</option>
                        <option value="opportunity">Opportunity</option>
                        <option value="poll">Poll</option>
                        <option value="announcement">Announcement</option>
                      </select>
                      <button onClick={createDiscussion} className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white">
                        Post
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white/50 border border-border">
                    <h3 className="font-heading font-semibold mb-3">Share Resource</h3>
                    <input
                      value={resource.title}
                      onChange={(event) => setResource({ ...resource, title: event.target.value })}
                      placeholder="React notes, GitHub repo, resume template"
                      className="w-full mb-3 px-4 py-2 rounded-lg bg-white/70 border border-border focus:outline-none"
                    />
                    <input
                      value={resource.fileUrl}
                      onChange={(event) => setResource({ ...resource, fileUrl: event.target.value })}
                      placeholder="https://..."
                      className="w-full mb-3 px-4 py-2 rounded-lg bg-white/70 border border-border focus:outline-none"
                    />
                    <button onClick={uploadResource} className="w-full px-4 py-2 rounded-lg bg-white/70 border border-border hover:bg-white/90 flex items-center justify-center gap-2">
                      <Upload className="w-4 h-4" />
                      Upload Resource
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-heading font-semibold mb-3">Active Discussions</h3>
                  <div className="space-y-3">
                    {(feed?.discussions || []).length === 0 ? (
                      <div className="p-4 rounded-xl bg-white/50 border border-border text-sm text-muted-foreground">No posts yet. Start the first discussion.</div>
                    ) : feed.discussions.map((item: any) => (
                      <div key={item.id} className="p-4 rounded-xl bg-white/50 border border-border">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-heading font-semibold mb-1">{item.title}</h3>
                            <p className="text-sm text-muted-foreground">{item.message}</p>
                          </div>
                          <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs capitalize">{item.type}</span>
                        </div>
                        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{item.author}</span>
                          <span>{item.replies} replies</span>
                          <span>{item.likes} likes</span>
                        </div>
                      </div>
                    ))}
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
