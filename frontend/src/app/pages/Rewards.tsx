import { useEffect, useState } from 'react';
import { Trophy, Award, Zap, Gift, Star, TrendingUp, Users, Calendar, Shield, Sparkles } from 'lucide-react';
import { authGetJson } from '@/lib/api';

type Badge = {
  name: string;
  description: string;
  progress: number;
  goal: number;
  unlocked: boolean;
};

type RewardSummary = {
  level: {
    current: number;
    currentXp: number;
    nextLevel: number;
    nextLevelXp: number;
    progressPercent: number;
    xpToNextLevel: number;
    benefit: string;
    nextBenefit: string;
  };
  stats: {
    totalXp: number;
    eventsAttended: number;
    dayStreak: number;
    connectionsMade: number;
    eventsOrganized: number;
    successfulEvents: number;
  };
  xpBreakdown: Array<{
    key: string;
    label: string;
    count: number;
    xpEach: number;
    xp: number;
    dailyLimit?: number;
  }>;
  badges: Badge[];
  availableRewards: Array<{
    name: string;
    description: string;
    progress: number;
    goal: number;
    unlocked: boolean;
  }>;
  leaderboard: Array<{
    rank: number;
    name: string;
    xp: number;
  }>;
  organizerTrustLevel: string;
  levelBenefits: Array<{
    level: number;
    xp: number;
    benefit: string;
  }>;
  antiSpamLimits: Array<{
    action: string;
    limit: string;
  }>;
  aiRewards: Array<{
    name: string;
    unlocked: boolean;
    description: string;
  }>;
};

const emptySummary: RewardSummary = {
  level: {
    current: 1,
    currentXp: 0,
    nextLevel: 2,
    nextLevelXp: 200,
    progressPercent: 0,
    xpToNextLevel: 200,
    benefit: 'Member access',
    nextBenefit: 'Profile customization',
  },
  stats: {
    totalXp: 0,
    eventsAttended: 0,
    dayStreak: 0,
    connectionsMade: 0,
    eventsOrganized: 0,
    successfulEvents: 0,
  },
  xpBreakdown: [],
  badges: [],
  availableRewards: [],
  leaderboard: [],
  organizerTrustLevel: 'Not an organizer yet',
  levelBenefits: [],
  antiSpamLimits: [],
  aiRewards: [],
};

const numberFormat = (value: number) => value.toLocaleString();

const badgeIcon = (badge: Badge) => {
  if (badge.name.toLowerCase().includes('network') || badge.name.toLowerCase().includes('social')) return Users;
  if (badge.name.toLowerCase().includes('organizer')) return Calendar;
  if (badge.name.toLowerCase().includes('streak')) return Zap;
  if (badge.name.toLowerCase().includes('community')) return Shield;
  return Star;
};

export function Rewards() {
  const [summary, setSummary] = useState<RewardSummary>(emptySummary);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadRewards = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await authGetJson<RewardSummary>('/events/rewards/summary');
        setSummary(data || emptySummary);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load rewards');
      } finally {
        setLoading(false);
      }
    };

    loadRewards();
  }, []);

  const unlockedBadges = summary.badges.filter((badge) => badge.unlocked).length;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-heading font-bold mb-2">Rewards & Achievements</h1>
        <p className="text-muted-foreground">Level up through meaningful events, networking, and consistency</p>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Level Progress */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-[#7F5AF0] via-[#00C2FF] to-[#2CB67D] text-white">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-sm text-white/80 mb-1">Current Level</div>
                <div className="text-5xl font-heading font-bold">{loading ? '...' : summary.level.current}</div>
                <div className="text-sm text-white/80 mt-2">{summary.level.benefit}</div>
              </div>
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                <Trophy className="w-10 h-10" />
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/80">Progress to Level {summary.level.nextLevel}</span>
                <span className="text-sm font-medium">
                  {numberFormat(summary.level.currentXp)} / {numberFormat(summary.level.nextLevelXp)} XP
                </span>
              </div>
              <div className="h-3 rounded-full bg-white/20 backdrop-blur">
                <div className="h-full rounded-full bg-white" style={{ width: `${summary.level.progressPercent}%` }}></div>
              </div>
              <div className="text-xs text-white/80 mt-2">
                {summary.level.xpToNextLevel} XP to unlock {summary.level.nextBenefit}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
              <div>
                <div className="text-2xl font-heading font-bold">{numberFormat(summary.stats.totalXp)}</div>
                <div className="text-xs text-white/80">Total XP</div>
              </div>
              <div>
                <div className="text-2xl font-heading font-bold">{numberFormat(summary.stats.eventsAttended)}</div>
                <div className="text-xs text-white/80">Events Attended</div>
              </div>
              <div>
                <div className="text-2xl font-heading font-bold">{numberFormat(summary.stats.dayStreak)}</div>
                <div className="text-xs text-white/80">Day Streak</div>
              </div>
            </div>
          </div>

          {/* XP Breakdown */}
          <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
            <h2 className="text-xl font-heading font-semibold mb-6">XP Breakdown</h2>
            {loading ? (
              <div className="p-4 rounded-xl bg-white/50 border border-border">Loading XP rules...</div>
            ) : summary.xpBreakdown.length === 0 ? (
              <div className="p-4 rounded-xl bg-white/50 border border-border text-sm text-muted-foreground">
                No reward activity yet. Attend and check in to events to start earning XP.
              </div>
            ) : (
              <div className="space-y-3">
                {summary.xpBreakdown.map((rule) => (
                  <div key={rule.key} className="p-4 rounded-xl bg-white/50 border border-border">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="font-heading font-semibold">{rule.label}</h3>
                        <p className="text-sm text-muted-foreground">
                          {rule.count} x {rule.xpEach} XP{rule.dailyLimit ? `, limit ${rule.dailyLimit}/day` : ''}
                        </p>
                      </div>
                      <div className="text-lg font-heading font-bold text-[#7F5AF0]">+{numberFormat(rule.xp)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Achievements */}
          <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-heading font-semibold">Badges</h2>
              <div className="text-sm text-muted-foreground">{unlockedBadges} unlocked</div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {summary.badges.map((badge) => {
                const Icon = badgeIcon(badge);
                const percentage = Math.min((badge.progress / Math.max(badge.goal, 1)) * 100, 100);

                return (
                  <div
                    key={badge.name}
                    className={`p-4 rounded-xl border transition-all ${
                      badge.unlocked
                        ? 'bg-gradient-to-br from-[#FFD60A]/10 to-[#FF6B9D]/10 border-[#FFD60A]/30'
                        : 'bg-white/50 border-border'
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        badge.unlocked
                          ? 'bg-gradient-to-br from-[#FFD60A] to-[#FF6B9D]'
                          : 'bg-gray-200'
                      }`}>
                        <Icon className={`w-6 h-6 ${badge.unlocked ? 'text-white' : 'text-gray-400'}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-heading font-semibold mb-1">{badge.name}</h3>
                        <p className="text-sm text-muted-foreground">{badge.description}</p>
                      </div>
                    </div>

                    {badge.unlocked ? (
                      <div className="flex items-center gap-1 text-sm text-[#D99B00]">
                        <Award className="w-4 h-4" />
                        <span className="font-medium">Unlocked</span>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">Progress</span>
                          <span className="text-xs font-medium">{badge.progress} / {badge.goal}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF]"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Available Rewards */}
          <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
            <h2 className="text-xl font-heading font-semibold mb-6">Discounts & Milestone Rewards</h2>

            <div className="space-y-3">
              {summary.availableRewards.map((reward) => {
                const percentage = Math.min((reward.progress / Math.max(reward.goal, 1)) * 100, 100);

                return (
                  <div key={reward.name} className="p-4 rounded-xl bg-white/50 border border-border hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#FFD60A] to-[#FF6B9D] flex items-center justify-center">
                          <Gift className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-heading font-semibold">{reward.name}</h3>
                          <p className="text-sm text-muted-foreground">{reward.description}</p>
                          {!reward.unlocked && (
                            <div className="mt-2">
                              <div className="h-1.5 rounded-full bg-white">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF]"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        disabled={!reward.unlocked}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white text-sm hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {reward.unlocked ? 'Unlocked' : `${reward.progress}/${reward.goal}`}
                      </button>
                    </div>
                  </div>
                );
              })}
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
                <p className="text-sm text-muted-foreground">{summary.stats.dayStreak} days in a row</p>
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5, 6, 7].map(day => (
                <div
                  key={day}
                  className={`flex-1 h-10 rounded-lg flex items-center justify-center text-xs font-medium ${
                    day <= Math.min(summary.stats.dayStreak, 7)
                      ? 'bg-gradient-to-br from-[#2CB67D] to-[#00C2FF] text-white'
                      : 'bg-white/50 border border-border text-muted-foreground'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            <p className="text-sm text-muted-foreground">
              3 days gives 50 XP, 5 days gives 100 XP, and 7 days unlocks a special badge.
            </p>
          </div>

          {/* Leaderboard */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#7F5AF0] to-[#00C2FF] text-white">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5" />
              <h3 className="font-heading font-semibold">Leaderboard</h3>
            </div>

            <div className="space-y-3">
              {summary.leaderboard.length === 0 ? (
                <div className="p-3 rounded-lg bg-white/20 backdrop-blur">No leaderboard data yet.</div>
              ) : (
                summary.leaderboard.map(user => (
                  <div key={`${user.rank}-${user.name}`} className="flex items-center gap-3 p-3 rounded-lg bg-white/20 backdrop-blur">
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
                      <div className="text-xs text-white/80">{numberFormat(user.xp)} XP</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Smart Rewards */}
          <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-[#7F5AF0]" />
              <h3 className="font-heading font-semibold">Smart AI Rewards</h3>
            </div>
            <div className="space-y-3">
              {summary.aiRewards.map((reward) => (
                <div key={reward.name} className="p-3 rounded-xl bg-white/50 border border-border">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium text-sm">{reward.name}</div>
                      <div className="text-xs text-muted-foreground">{reward.description}</div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${reward.unlocked ? 'bg-[#2CB67D]/10 text-[#2CB67D]' : 'bg-gray-100 text-muted-foreground'}`}>
                      {reward.unlocked ? 'Active' : 'Locked'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust and Limits */}
          <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
            <h3 className="font-heading font-semibold mb-2">Organizer Trust</h3>
            <div className="text-sm text-muted-foreground mb-4">{summary.organizerTrustLevel}</div>
            <h3 className="font-heading font-semibold mb-3">Anti-Spam Limits</h3>
            <div className="space-y-2">
              {summary.antiSpamLimits.map((limit) => (
                <div key={limit.action} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{limit.action}</span>
                  <span className="font-medium">{limit.limit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
