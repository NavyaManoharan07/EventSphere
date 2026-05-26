import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { MessageSquare, Users, MapPin, Sparkles, CheckCircle, Eye, PlusCircle, UserPlus } from 'lucide-react';
import { authGetJson, authPostJson } from '@/lib/api';

type UserProfile = {
  id: string;
  name: string;
  profilePhoto?: string;
  city: string;
  bio: string;
  interests: string[];
  goals: string[];
  eventPreference: string;
  networkingEnabled: boolean;
  profileVisible: boolean;
  shareEventAttendance: boolean;
  onboardingCompleted: boolean;
};

type ProfilePost = {
  id: string;
  content: string;
  eventTitle?: string;
  visibility: string;
  likes: number;
  createdAt: string;
  author?: {
    id: string;
    name: string;
    profilePhoto?: string;
    city?: string;
  };
};

export function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<ProfilePost[]>([]);
  const [currentUserId, setCurrentUserId] = useState('');
  const [connected, setConnected] = useState(false);
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postEventTitle, setPostEventTitle] = useState('');

  useEffect(() => {
    if (!id) return;

    const loadProfile = async () => {
      setLoading(true);
      setError('');
      setStatus('');

      try {
        const [me, social] = await Promise.all([
          authGetJson<{ _id?: string; id?: string }>('/auth/me'),
          authGetJson<{ profile: UserProfile; connection: { connected: boolean; following: boolean }; posts: ProfilePost[] }>(`/social/profile/${id}`),
        ]);

        setCurrentUserId(String(me._id || me.id || ''));
        setProfile(social.profile);
        setConnected(Boolean(social.connection?.connected));
        setFollowing(Boolean(social.connection?.following));
        setPosts(social.posts || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [id]);

  const handleConnect = async () => {
    if (!profile) return;
    setConnecting(true);
    setError('');
    setStatus('');

    try {
      await authPostJson(`/social/connections/${profile.id}/connect`, {});
      setConnected(true);
      setFollowing(true);
      setStatus(`You are now connected with and following ${profile.name}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to connect');
    } finally {
      setConnecting(false);
    }
  };

  const handleFollow = async () => {
    if (!profile) return;
    setConnecting(true);
    setError('');
    setStatus('');

    try {
      const result = await authPostJson<{ connected: boolean; following: boolean }>(`/social/connections/${profile.id}/follow`, {});
      setConnected(result.connected);
      setFollowing(result.following);
      setStatus(result.following ? `Following ${profile.name}.` : `Unfollowed ${profile.name}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update follow status');
    } finally {
      setConnecting(false);
    }
  };

  const handleCreatePost = async () => {
    if (!postContent.trim()) {
      setError('Write a short update before posting.');
      return;
    }

    setPosting(true);
    setError('');
    setStatus('');

    try {
      const created = await authPostJson<ProfilePost>('/social/posts', {
        content: postContent,
        eventTitle: postEventTitle,
        visibility: 'connections',
      });
      setPosts((current) => [created, ...current]);
      setPostContent('');
      setPostEventTitle('');
      setStatus('Post shared with your connections.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create post');
    } finally {
      setPosting(false);
    }
  };

  const isOwnProfile = Boolean(profile?.id && currentUserId && profile.id.toString() === currentUserId.toString());

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col gap-6 mb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-heading font-bold mb-2">Profile</h1>
          <p className="text-muted-foreground">View posts, connect, follow, and message other EventSphere members.</p>
        </div>
        {profile && !isOwnProfile && (
          <button
            onClick={() => navigate(`/app/messages?user=${profile.id}`)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white font-medium hover:shadow-xl transition-all"
          >
            Message
          </button>
        )}
      </div>

      {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {status && <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{status}</div>}

      <div className="rounded-3xl bg-white/80 border border-border p-8 shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">Loading profile...</div>
        ) : profile ? (
          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            <div className="space-y-6">
              <div className="rounded-3xl bg-gradient-to-br from-[#7F5AF0] to-[#00C2FF] p-6 text-white shadow-lg">
                <div className="w-28 h-28 rounded-full bg-white/20 mb-4 overflow-hidden">
                  {profile.profilePhoto ? (
                    <img src={profile.profilePhoto} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">{profile.name?.charAt(0)}</div>
                  )}
                </div>
                <h2 className="text-2xl font-heading font-bold mb-1">{profile.name}</h2>
                <p className="text-sm text-white/80 mb-4">{profile.city || 'EventSphere member'}</p>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{profile.networkingEnabled ? 'Networking enabled' : 'Networking paused'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.city || 'Location hidden'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>{profile.profileVisible ? 'Profile visible' : 'Profile hidden'}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl bg-slate-50 p-6 border border-border">
                <h3 className="font-semibold mb-3">About</h3>
                <p className="text-sm text-muted-foreground">{profile.bio || 'No bio yet. This member may be open to opportunities and event conversations.'}</p>
              </div>

              <div className="rounded-3xl bg-slate-50 p-6 border border-border">
                <h3 className="font-semibold mb-3">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.length > 0 ? profile.interests.map((interest) => (
                    <span key={interest} className="px-3 py-1 rounded-full bg-white border text-xs text-muted-foreground">{interest}</span>
                  )) : (
                    <span className="text-sm text-muted-foreground">No interests specified yet.</span>
                  )}
                </div>
              </div>

              <div className="rounded-3xl bg-slate-50 p-6 border border-border">
                <h3 className="font-semibold mb-3">Goals</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.goals.length > 0 ? profile.goals.map((goal) => (
                    <span key={goal} className="px-3 py-1 rounded-full bg-white border text-xs text-muted-foreground">{goal}</span>
                  )) : (
                    <span className="text-sm text-muted-foreground">No goals listed yet.</span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col gap-3 p-6 rounded-3xl bg-slate-50 border border-border">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-[#7F5AF0]" />
                  <div>
                    <h3 className="font-heading font-semibold">Social Profile</h3>
                    <p className="text-sm text-muted-foreground">Connection state and event preference data.</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Event preference</span>
                    <span>{profile.eventPreference || 'Any'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Connection</span>
                    <span>{isOwnProfile ? 'This is you' : connected ? 'Connected' : 'Not connected'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Follow status</span>
                    <span>{isOwnProfile ? 'Own profile' : following ? 'Following' : 'Not following'}</span>
                  </div>
                </div>
              </div>

              {!isOwnProfile && (
                <div className="rounded-3xl bg-white border border-border p-6">
                  <h3 className="font-heading font-semibold mb-4">Actions</h3>
                  <div className="grid gap-3">
                    <button
                      onClick={handleConnect}
                      disabled={connecting || connected}
                      className="w-full px-4 py-3 rounded-2xl bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white font-medium hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      {connecting ? 'Connecting...' : connected ? 'Connected' : 'Connect'}
                    </button>
                    <button
                      onClick={handleFollow}
                      disabled={connecting}
                      className="w-full px-4 py-3 rounded-2xl border border-border bg-white text-sm font-medium hover:bg-slate-100 disabled:opacity-50"
                    >
                      {following ? 'Following' : 'Follow'}
                    </button>
                    <button
                      onClick={() => navigate(`/app/messages?user=${profile.id}`)}
                      className="w-full px-4 py-3 rounded-2xl border border-border bg-white text-sm font-medium hover:bg-slate-100"
                    >
                      Message {profile.name}
                    </button>
                  </div>
                </div>
              )}

              <div className="rounded-3xl bg-white border border-border p-6">
                <h3 className="font-heading font-semibold mb-4">Event Experience Posts</h3>
                {isOwnProfile && (
                  <div className="mb-6 rounded-2xl bg-slate-50 border border-border p-4">
                    <input
                      value={postEventTitle}
                      onChange={(event) => setPostEventTitle(event.target.value)}
                      placeholder="Event name, e.g. AI Summit 2026"
                      className="mb-3 w-full px-4 py-2 rounded-xl bg-white border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                    <textarea
                      value={postContent}
                      onChange={(event) => setPostContent(event.target.value)}
                      rows={4}
                      placeholder="Share what you learned, who you met, or what others should know..."
                      className="w-full px-4 py-3 rounded-xl bg-white border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                    />
                    <button
                      onClick={handleCreatePost}
                      disabled={posting}
                      className="mt-3 px-4 py-2 rounded-xl bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white text-sm font-medium disabled:opacity-50 inline-flex items-center gap-2"
                    >
                      <PlusCircle className="w-4 h-4" />
                      {posting ? 'Posting...' : 'Post to Connections'}
                    </button>
                  </div>
                )}

                <div className="space-y-4">
                  {posts.length === 0 ? (
                    <div className="rounded-2xl bg-slate-50 border border-border p-5 text-sm text-muted-foreground">
                      No posts yet. Event stories shared here are visible to connections.
                    </div>
                  ) : posts.map((post) => (
                    <div key={post.id} className="rounded-2xl bg-slate-50 border border-border p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7F5AF0] to-[#00C2FF] flex items-center justify-center text-white text-sm">
                          {(post.author?.name || profile.name || 'U').charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{post.author?.name || profile.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {post.createdAt ? new Date(post.createdAt).toLocaleString() : 'Just now'}
                          </div>
                        </div>
                      </div>
                      {post.eventTitle && (
                        <div className="mb-2 inline-flex px-3 py-1 rounded-full bg-primary/10 text-primary text-xs">
                          {post.eventTitle}
                        </div>
                      )}
                      <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{post.content}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl bg-slate-50 p-6 border border-border">
                <h3 className="font-heading font-semibold mb-4">Community compatibility</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#2CB67D]" /> Available for networking</div>
                  <div className="flex items-center gap-2"><MessageSquare className="w-4 h-4 text-[#7F5AF0]" /> Open to messages</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-20 text-center text-muted-foreground">This profile is unavailable.</div>
        )}
      </div>
    </div>
  );
}
