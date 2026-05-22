import { Users, Plus, TrendingUp, MessageSquare, Calendar } from 'lucide-react';

export function Communities() {
  const myCommunities = [
    { id: 1, name: 'AI Enthusiasts', members: 2450, posts: 1234, events: 12, category: 'Technology' },
    { id: 2, name: 'Tech Founders', members: 1820, posts: 890, events: 8, category: 'Business' },
  ];

  const suggestedCommunities = [
    { id: 3, name: 'Product Managers', members: 3200, category: 'Career' },
    { id: 4, name: 'Music Lovers', members: 5600, category: 'Entertainment' },
    { id: 5, name: 'Design Systems', members: 1900, category: 'Design' },
  ];

  const recentDiscussions = [
    { id: 1, title: 'Best AI tools for 2026?', community: 'AI Enthusiasts', replies: 45, time: '2h ago' },
    { id: 2, title: 'Fundraising tips for early stage', community: 'Tech Founders', replies: 23, time: '5h ago' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-heading font-bold mb-2">Communities</h1>
          <p className="text-muted-foreground">Connect with like-minded people</p>
        </div>
        <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white font-medium hover:shadow-xl hover:shadow-primary/30 transition-all flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Create Community
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* My Communities */}
          <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
            <h2 className="text-xl font-heading font-semibold mb-6">My Communities</h2>

            <div className="space-y-4">
              {myCommunities.map(community => (
                <div key={community.id} className="p-4 rounded-xl bg-white/50 border border-border hover:shadow-lg transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#7F5AF0] to-[#00C2FF] flex-shrink-0"></div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-heading font-semibold mb-1">{community.name}</h3>
                          <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                            {community.category}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mt-3 mb-4">
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
                            <Calendar className="w-4 h-4" />
                            <span className="text-xs">Events</span>
                          </div>
                          <div className="font-medium">{community.events}</div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white text-sm hover:shadow-lg transition-all">
                          View Community
                        </button>
                        <button className="px-4 py-2 rounded-lg bg-white/50 border border-border text-sm hover:bg-white/80 transition-all">
                          Post
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Discussions */}
          <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
            <h2 className="text-xl font-heading font-semibold mb-6">Recent Discussions</h2>

            <div className="space-y-4">
              {recentDiscussions.map(discussion => (
                <div key={discussion.id} className="p-4 rounded-xl bg-white/50 border border-border hover:shadow-lg transition-all cursor-pointer">
                  <h3 className="font-heading font-semibold mb-2">{discussion.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs">
                      {discussion.community}
                    </span>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>{discussion.replies} replies</span>
                    </div>
                    <span>{discussion.time}</span>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-4 px-4 py-2 rounded-xl bg-white/50 border border-border hover:bg-white/80 transition-all">
              View All Discussions
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Suggested Communities */}
          <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
            <h3 className="font-heading font-semibold mb-4">Suggested Communities</h3>

            <div className="space-y-3">
              {suggestedCommunities.map(community => (
                <div key={community.id} className="p-3 rounded-xl bg-white/50 border border-border">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#7F5AF0] to-[#00C2FF]"></div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{community.name}</div>
                      <div className="text-xs text-muted-foreground">{community.members.toLocaleString()} members</div>
                    </div>
                  </div>
                  <button className="w-full px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white text-sm hover:shadow-lg transition-all">
                    Join Community
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Trending Topics */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#7F5AF0] to-[#00C2FF] text-white">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5" />
              <h3 className="font-heading font-semibold">Trending Topics</h3>
            </div>
            <div className="space-y-2">
              {['#AI2026', '#StartupLife', '#ProductDesign', '#TechEvents', '#Networking'].map((topic, i) => (
                <button
                  key={i}
                  className="w-full text-left px-3 py-2 rounded-lg bg-white/20 backdrop-blur hover:bg-white/30 transition-all"
                >
                  <div className="font-medium">{topic}</div>
                  <div className="text-xs text-white/80">{Math.floor(Math.random() * 500 + 100)} posts</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
