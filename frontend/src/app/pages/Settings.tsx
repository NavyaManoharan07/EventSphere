import { useEffect, useState } from 'react';
import { User, Bell, Lock, Palette, Shield } from 'lucide-react';
import { authGetJson, authPutJson } from '@/lib/api';

type Profile = {
  name: string;
  email: string;
  city: string;
  bio: string;
  interests: string[];
  goals: string[];
  eventPreference: string;
  networkingEnabled: boolean;
  profileVisible: boolean;
  shareEventAttendance: boolean;
};

const emptyProfile: Profile = {
  name: '',
  email: '',
  city: '',
  bio: '',
  interests: [],
  goals: [],
  eventPreference: 'Both',
  networkingEnabled: true,
  profileVisible: true,
  shareEventAttendance: true,
};

const splitTags = (value: string) => value.split(',').map((item) => item.trim()).filter(Boolean);

export function Settings() {
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [interestsText, setInterestsText] = useState('');
  const [goalsText, setGoalsText] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await authGetJson<Profile>('/auth/me');
        const nextProfile = { ...emptyProfile, ...data };
        setProfile(nextProfile);
        setInterestsText((nextProfile.interests || []).join(', '));
        setGoalsText((nextProfile.goals || []).join(', '));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const updateProfile = (changes: Partial<Profile>) => {
    setProfile((current) => ({ ...current, ...changes }));
  };

  const saveProfile = async () => {
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const data = await authPutJson<Profile>('/auth/profile', {
        ...profile,
        interests: splitTags(interestsText),
        goals: splitTags(goalsText),
        onboardingCompleted: true,
      });
      setProfile({ ...emptyProfile, ...data });
      setInterestsText((data.interests || []).join(', '));
      setGoalsText((data.goals || []).join(', '));
      setMessage('Profile saved. AI recommendations will use these preferences.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-heading font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your profile and AI personalization data</p>
      </div>

      {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {message && <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{message}</div>}

      <div className="space-y-6">
        <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#7F5AF0]/10 flex items-center justify-center">
              <User className="w-5 h-5 text-[#7F5AF0]" />
            </div>
            <h2 className="text-xl font-heading font-semibold">Profile Settings</h2>
          </div>

          {loading ? (
            <div className="p-4 rounded-xl bg-white/50 border border-border">Loading profile...</div>
          ) : (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(event) => updateProfile({ name: event.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">City</label>
                  <input
                    type="text"
                    value={profile.city}
                    onChange={(event) => updateProfile({ city: event.target.value })}
                    placeholder="Chennai"
                    className="w-full px-4 py-3 rounded-xl bg-white/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full px-4 py-3 rounded-xl bg-white/30 border border-border text-muted-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Bio</label>
                <textarea
                  rows={3}
                  value={profile.bio}
                  onChange={(event) => updateProfile({ bio: event.target.value })}
                  placeholder="Tell others what you are interested in..."
                  className="w-full px-4 py-3 rounded-xl bg-white/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Interests</label>
                <input
                  value={interestsText}
                  onChange={(event) => setInterestsText(event.target.value)}
                  placeholder="AI, Startups, Music"
                  className="w-full px-4 py-3 rounded-xl bg-white/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <p className="mt-2 text-xs text-muted-foreground">Used for event recommendations, communities, and networking matches.</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Goals</label>
                <input
                  value={goalsText}
                  onChange={(event) => setGoalsText(event.target.value)}
                  placeholder="Career, Networking, Learning"
                  className="w-full px-4 py-3 rounded-xl bg-white/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <button
                onClick={saveProfile}
                disabled={saving}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white font-medium hover:shadow-xl hover:shadow-primary/30 transition-all"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#00C2FF]/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-[#00C2FF]" />
            </div>
            <h2 className="text-xl font-heading font-semibold">Notification Preferences</h2>
          </div>

          <div className="space-y-4">
            {[
              { label: 'AI Recommendations', description: 'Get personalized event suggestions' },
              { label: 'Weekend Suggestions', description: 'Discover events happening this weekend' },
              { label: 'Networking Matches', description: 'New people you should meet' },
              { label: 'Event Reminders', description: 'Reminders for upcoming events' },
              { label: 'Community Updates', description: 'New posts and discussions' },
              { label: 'Reward Notifications', description: 'Achievement and XP updates' },
            ].map((pref, i) => (
              <label key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/50 border border-border cursor-pointer hover:bg-white/80 transition-all">
                <div>
                  <div className="font-medium mb-1">{pref.label}</div>
                  <div className="text-sm text-muted-foreground">{pref.description}</div>
                </div>
                <input type="checkbox" defaultChecked className="rounded" />
              </label>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#2CB67D]/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#2CB67D]" />
            </div>
            <h2 className="text-xl font-heading font-semibold">Privacy & Networking</h2>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 rounded-xl bg-white/50 border border-border cursor-pointer hover:bg-white/80 transition-all">
              <div>
                <div className="font-medium mb-1">Enable AI Networking</div>
                <div className="text-sm text-muted-foreground">Allow AI to match you with people</div>
              </div>
              <input
                type="checkbox"
                checked={profile.networkingEnabled}
                onChange={(event) => updateProfile({ networkingEnabled: event.target.checked })}
                className="rounded"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-xl bg-white/50 border border-border cursor-pointer hover:bg-white/80 transition-all">
              <div>
                <div className="font-medium mb-1">Show Profile to Others</div>
                <div className="text-sm text-muted-foreground">Make your profile visible to attendees</div>
              </div>
              <input
                type="checkbox"
                checked={profile.profileVisible}
                onChange={(event) => updateProfile({ profileVisible: event.target.checked })}
                className="rounded"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-xl bg-white/50 border border-border cursor-pointer hover:bg-white/80 transition-all">
              <div>
                <div className="font-medium mb-1">Share Event Attendance</div>
                <div className="text-sm text-muted-foreground">Let connections see which events you attend</div>
              </div>
              <input
                type="checkbox"
                checked={profile.shareEventAttendance}
                onChange={(event) => updateProfile({ shareEventAttendance: event.target.checked })}
                className="rounded"
              />
            </label>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#7F5AF0]/10 flex items-center justify-center">
              <Palette className="w-5 h-5 text-[#7F5AF0]" />
            </div>
            <h2 className="text-xl font-heading font-semibold">Event Preferences</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            {['Career', 'Entertainment', 'Both'].map((preference) => (
              <button
                key={preference}
                onClick={() => updateProfile({ eventPreference: preference })}
                className={`px-4 py-3 rounded-xl border transition-all ${
                  profile.eventPreference === preference
                    ? 'bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white border-transparent shadow-lg'
                    : 'bg-white/50 border-border hover:bg-white/80'
                }`}
              >
                {preference}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#FF6B9D]/10 flex items-center justify-center">
              <Lock className="w-5 h-5 text-[#FF6B9D]" />
            </div>
            <h2 className="text-xl font-heading font-semibold">Security</h2>
          </div>

          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 rounded-xl bg-white/50 border border-border hover:bg-white/80 transition-all">
              Change Password
            </button>
            <button className="w-full text-left px-4 py-3 rounded-xl bg-white/50 border border-border hover:bg-white/80 transition-all">
              Two-Factor Authentication
            </button>
            <button className="w-full text-left px-4 py-3 rounded-xl bg-white/50 border border-border hover:bg-white/80 transition-all">
              Connected Accounts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
