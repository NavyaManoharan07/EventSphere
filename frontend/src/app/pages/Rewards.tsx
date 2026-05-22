import { Trophy, Award, Zap, Gift, Star, TrendingUp, Users, Calendar } from 'lucide-react';

export function Rewards() {
  const achievements = [
    { id: 1, name: 'Early Adopter', description: 'Joined EventSphere AI', icon: Star, unlocked: true },
    { id: 2, name: 'Social Butterfly', description: 'Attend 10 events', progress: 12, goal: 10, icon: Users, unlocked: true },
    { id: 3, name: 'Networking Pro', description: 'Make 50 connections', progress: 48, goal: 50, icon: Users, unlocked: false },
    { id: 4, name: 'Event Host', description: 'Host 5 events', progress: 2, goal: 5, icon: Calendar, unlocked: false },
  ];

  const rewards = [
    { id: 1, name: '10% Off Next Ticket', xp: 500, type: 'discount' },
    { id: 2, name: 'VIP Lounge Access', xp: 1000, type: 'access' },
    { id: 3, name: 'Free Event Swag', xp: 750, type: 'swag' },
    { id: 4, name: '20% Off Premium Events', xp: 1500, type: 'discount' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-heading font-bold mb-2">Rewards & Achievements</h1>
        <p className="text-muted-foreground">Level up and unlock exclusive benefits</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Level Progress */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-[#7F5AF0] via-[#00C2FF] to-[#2CB67D] text-white">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-sm text-white/80 mb-1">Current Level</div>
                <div className="text-5xl font-heading font-bold">5</div>
              </div>
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                <Trophy className="w-10 h-10" />
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/80">Progress to Level 6</span>
                <span className="text-sm font-medium">1,250 / 2,000 XP</span>
              </div>
              <div className="h-3 rounded-full bg-white/20 backdrop-blur">
                <div className="h-full rounded-full bg-white" style={{ width: '62.5%' }}></div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
              <div>
                <div className="text-2xl font-heading font-bold">1,250</div>
                <div className="text-xs text-white/80">Total XP</div>
              </div>
              <div>
                <div className="text-2xl font-heading font-bold">12</div>
                <div className="text-xs text-white/80">Events Attended</div>
              </div>
              <div>
                <div className="text-2xl font-heading font-bold">5</div>
                <div className="text-xs text-white/80">Day Streak</div>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
            <h2 className="text-xl font-heading font-semibold mb-6">Achievements</h2>

            <div className="grid md:grid-cols-2 gap-4">
              {achievements.map(achievement => {
                const Icon = achievement.icon;
                const progress = achievement.progress || 0;
                const goal = achievement.goal || 1;
                const percentage = Math.min((progress / goal) * 100, 100);

                return (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-xl border transition-all ${
                      achievement.unlocked
                        ? 'bg-gradient-to-br from-[#FFD60A]/10 to-[#FF6B9D]/10 border-[#FFD60A]/30'
                        : 'bg-white/50 border-border'
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        achievement.unlocked
                          ? 'bg-gradient-to-br from-[#FFD60A] to-[#FF6B9D]'
                          : 'bg-gray-200'
                      }`}>
                        <Icon className={`w-6 h-6 ${achievement.unlocked ? 'text-white' : 'text-gray-400'}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-heading font-semibold mb-1">{achievement.name}</h3>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      </div>
                    </div>

                    {!achievement.unlocked && achievement.goal && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">Progress</span>
                          <span className="text-xs font-medium">{progress} / {goal}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF]"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {achievement.unlocked && (
                      <div className="flex items-center gap-1 text-sm text-[#FFD60A]">
                        <Award className="w-4 h-4" />
                        <span className="font-medium">Unlocked!</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Available Rewards */}
          <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
            <h2 className="text-xl font-heading font-semibold mb-6">Available Rewards</h2>

            <div className="space-y-3">
              {rewards.map(reward => (
                <div key={reward.id} className="p-4 rounded-xl bg-white/50 border border-border hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#FFD60A] to-[#FF6B9D] flex items-center justify-center">
                        <Gift className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-heading font-semibold">{reward.name}</h3>
                        <p className="text-sm text-muted-foreground">Cost: {reward.xp} XP</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white text-sm hover:shadow-lg transition-all">
                      Redeem
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Event Streak */}
          <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#2CB67D]/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#2CB67D]" />
              </div>
              <div>
                <h3 className="font-heading font-semibold">Event Streak</h3>
                <p className="text-sm text-muted-foreground">5 days in a row</p>
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5, 6, 7].map(day => (
                <div
                  key={day}
                  className={`flex-1 h-10 rounded-lg flex items-center justify-center text-xs font-medium ${
                    day <= 5
                      ? 'bg-gradient-to-br from-[#2CB67D] to-[#00C2FF] text-white'
                      : 'bg-white/50 border border-border text-muted-foreground'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            <p className="text-sm text-muted-foreground">
              Keep your streak alive by attending events regularly!
            </p>
          </div>

          {/* Leaderboard */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#7F5AF0] to-[#00C2FF] text-white">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5" />
              <h3 className="font-heading font-semibold">Leaderboard</h3>
            </div>

            <div className="space-y-3">
              {[
                { rank: 1, name: 'Sarah Chen', xp: 3250 },
                { rank: 2, name: 'Mike Johnson', xp: 2890 },
                { rank: 3, name: 'You', xp: 1250 },
              ].map(user => (
                <div key={user.rank} className="flex items-center gap-3 p-3 rounded-lg bg-white/20 backdrop-blur">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-heading font-bold ${
                    user.rank === 1 ? 'bg-[#FFD60A] text-gray-900' :
                    user.rank === 2 ? 'bg-gray-300 text-gray-900' :
                    user.rank === 3 ? 'bg-[#CD7F32] text-white' :
                    'bg-white/20'
                  }`}>
                    {user.rank}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-xs text-white/80">{user.xp} XP</div>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-4 px-4 py-2 rounded-lg bg-white/20 backdrop-blur hover:bg-white/30 transition-all">
              View Full Leaderboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
