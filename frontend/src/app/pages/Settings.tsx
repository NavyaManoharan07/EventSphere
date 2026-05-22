import { User, Bell, Lock, Palette, Globe, CreditCard, Shield } from 'lucide-react';

export function Settings() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-heading font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="space-y-6">
        {/* Profile Settings */}
        <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#7F5AF0]/10 flex items-center justify-center">
              <User className="w-5 h-5 text-[#7F5AF0]" />
            </div>
            <h2 className="text-xl font-heading font-semibold">Profile Settings</h2>
          </div>

          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">First Name</label>
                <input
                  type="text"
                  defaultValue="John"
                  className="w-full px-4 py-3 rounded-xl bg-white/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Last Name</label>
                <input
                  type="text"
                  defaultValue="Doe"
                  className="w-full px-4 py-3 rounded-xl bg-white/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                defaultValue="john@example.com"
                className="w-full px-4 py-3 rounded-xl bg-white/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Bio</label>
              <textarea
                rows={3}
                defaultValue="Passionate about AI and technology. Love attending events and meeting new people!"
                className="w-full px-4 py-3 rounded-xl bg-white/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
            </div>

            <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white font-medium hover:shadow-xl hover:shadow-primary/30 transition-all">
              Save Changes
            </button>
          </div>
        </div>

        {/* Notification Preferences */}
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
              <label
                key={i}
                className="flex items-center justify-between p-4 rounded-xl bg-white/50 border border-border cursor-pointer hover:bg-white/80 transition-all"
              >
                <div>
                  <div className="font-medium mb-1">{pref.label}</div>
                  <div className="text-sm text-muted-foreground">{pref.description}</div>
                </div>
                <input type="checkbox" defaultChecked className="rounded" />
              </label>
            ))}
          </div>
        </div>

        {/* Privacy & Networking */}
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
              <input type="checkbox" defaultChecked className="rounded" />
            </label>

            <label className="flex items-center justify-between p-4 rounded-xl bg-white/50 border border-border cursor-pointer hover:bg-white/80 transition-all">
              <div>
                <div className="font-medium mb-1">Show Profile to Others</div>
                <div className="text-sm text-muted-foreground">Make your profile visible to attendees</div>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </label>

            <label className="flex items-center justify-between p-4 rounded-xl bg-white/50 border border-border cursor-pointer hover:bg-white/80 transition-all">
              <div>
                <div className="font-medium mb-1">Share Event Attendance</div>
                <div className="text-sm text-muted-foreground">Let connections see which events you attend</div>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </label>
          </div>
        </div>

        {/* Event Preference Slider */}
        <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#7F5AF0]/10 flex items-center justify-center">
              <Palette className="w-5 h-5 text-[#7F5AF0]" />
            </div>
            <h2 className="text-xl font-heading font-semibold">Event Preferences</h2>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-4">Career vs Entertainment Balance</label>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="100"
                defaultValue="50"
                className="w-full h-2 bg-gradient-to-r from-[#00C2FF] via-gray-200 to-[#FF6B9D] rounded-full appearance-none cursor-pointer"
              />
              <div className="flex items-center justify-between mt-2 text-sm">
                <span className="text-[#00C2FF] font-medium">Career Focus</span>
                <span className="text-muted-foreground">Balanced</span>
                <span className="text-[#FF6B9D] font-medium">Entertainment Focus</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security */}
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

        {/* Danger Zone */}
        <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-destructive/20">
          <h2 className="text-xl font-heading font-semibold mb-4 text-destructive">Danger Zone</h2>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 rounded-xl bg-white/50 border border-border hover:bg-destructive/5 transition-all text-destructive">
              Deactivate Account
            </button>
            <button className="w-full text-left px-4 py-3 rounded-xl bg-white/50 border border-border hover:bg-destructive/5 transition-all text-destructive">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
