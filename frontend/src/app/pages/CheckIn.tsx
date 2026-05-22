import { useState } from 'react';
import { useParams } from 'react-router';
import { QrCode, Check, X, Users, TrendingUp } from 'lucide-react';

export function CheckIn() {
  const { eventId } = useParams();
  const [scanning, setScanning] = useState(false);
  const [lastScan, setLastScan] = useState<{ success: boolean; name: string; time: string } | null>(null);

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      setLastScan({
        success: Math.random() > 0.2,
        name: 'Sarah Chen',
        time: new Date().toLocaleTimeString(),
      });
      setScanning(false);
    }, 1500);
  };

  const recentCheckIns = [
    { id: 1, name: 'Sarah Chen', tier: 'VIP', time: '10:32 AM', success: true },
    { id: 2, name: 'Mike Johnson', tier: 'General', time: '10:30 AM', success: true },
    { id: 3, name: 'Emily Davis', tier: 'General', time: '10:28 AM', success: true },
    { id: 4, name: 'Alex Park', tier: 'Early Bird', time: '10:25 AM', success: false },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-heading font-bold mb-2">Event Check-In</h1>
        <p className="text-muted-foreground">AI Summit 2026 - May 25, 2026</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Scanner */}
          <div className="p-8 rounded-3xl bg-white/70 backdrop-blur-lg border border-border text-center">
            <h2 className="text-2xl font-heading font-semibold mb-6">Scan QR Code</h2>

            <div className="relative max-w-md mx-auto mb-6">
              <div
                className={`w-full aspect-square rounded-2xl border-4 border-dashed flex items-center justify-center transition-all ${
                  scanning
                    ? 'border-[#7F5AF0] bg-[#7F5AF0]/5 animate-pulse'
                    : lastScan?.success
                    ? 'border-[#2CB67D] bg-[#2CB67D]/5'
                    : lastScan?.success === false
                    ? 'border-[#FF6B9D] bg-[#FF6B9D]/5'
                    : 'border-border bg-white/50'
                }`}
              >
                {scanning ? (
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-muted-foreground">Scanning...</p>
                  </div>
                ) : lastScan ? (
                  <div className="text-center">
                    <div
                      className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                        lastScan.success ? 'bg-[#2CB67D]' : 'bg-[#FF6B9D]'
                      }`}
                    >
                      {lastScan.success ? (
                        <Check className="w-10 h-10 text-white" />
                      ) : (
                        <X className="w-10 h-10 text-white" />
                      )}
                    </div>
                    <h3 className="text-xl font-heading font-bold mb-2">
                      {lastScan.success ? 'Check-In Successful!' : 'Invalid Ticket'}
                    </h3>
                    <p className="text-muted-foreground">{lastScan.name}</p>
                    <p className="text-sm text-muted-foreground">{lastScan.time}</p>
                  </div>
                ) : (
                  <QrCode className="w-32 h-32 text-muted-foreground" />
                )}
              </div>
            </div>

            <button
              onClick={handleScan}
              disabled={scanning}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white font-medium hover:shadow-xl hover:shadow-primary/30 transition-all disabled:opacity-50"
            >
              {scanning ? 'Scanning...' : 'Scan Ticket'}
            </button>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground mb-3">Or enter ticket ID manually</p>
              <div className="flex gap-2 max-w-md mx-auto">
                <input
                  type="text"
                  placeholder="TICKET-123-ABC"
                  className="flex-1 px-4 py-3 rounded-xl bg-white/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button className="px-6 py-3 rounded-xl bg-white/50 border border-border hover:bg-white/80 transition-all">
                  Verify
                </button>
              </div>
            </div>
          </div>

          {/* Recent Check-Ins */}
          <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
            <h2 className="text-xl font-heading font-semibold mb-6">Recent Check-Ins</h2>

            <div className="space-y-3">
              {recentCheckIns.map(checkin => (
                <div
                  key={checkin.id}
                  className={`p-4 rounded-xl border ${
                    checkin.success
                      ? 'bg-white/50 border-border'
                      : 'bg-[#FF6B9D]/5 border-[#FF6B9D]/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          checkin.success ? 'bg-[#2CB67D]' : 'bg-[#FF6B9D]'
                        }`}
                      >
                        {checkin.success ? (
                          <Check className="w-5 h-5 text-white" />
                        ) : (
                          <X className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{checkin.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {checkin.tier} • {checkin.time}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        checkin.success
                          ? 'bg-[#2CB67D]/10 text-[#2CB67D]'
                          : 'bg-[#FF6B9D]/10 text-[#FF6B9D]'
                      }`}
                    >
                      {checkin.success ? 'Verified' : 'Declined'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          {/* Live Count */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#7F5AF0] to-[#00C2FF] text-white">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-6 h-6" />
              <h3 className="font-heading font-semibold">Live Attendance</h3>
            </div>
            <div className="text-5xl font-heading font-bold mb-2">245</div>
            <div className="text-sm text-white/80">of 300 capacity</div>
            <div className="mt-4 h-2 rounded-full bg-white/20">
              <div className="h-full rounded-full bg-white" style={{ width: '81.6%' }}></div>
            </div>
          </div>

          {/* Check-In Stats */}
          <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
            <h3 className="font-heading font-semibold mb-4">Check-In Analytics</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Success Rate</span>
                <span className="font-heading font-bold text-[#2CB67D]">97.2%</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Average Time</span>
                <span className="font-heading font-bold">8.5s</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Peak Hour</span>
                <span className="font-heading font-bold">10:00 AM</span>
              </div>
            </div>
          </div>

          {/* Ticket Breakdown */}
          <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
            <h3 className="font-heading font-semibold mb-4">Ticket Breakdown</h3>

            <div className="space-y-3">
              {[
                { tier: 'VIP', checked: 18, total: 20, color: '#FFD60A' },
                { tier: 'General', checked: 198, total: 230, color: '#00C2FF' },
                { tier: 'Early Bird', checked: 29, total: 50, color: '#2CB67D' },
              ].map((tier, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{tier.tier}</span>
                    <span className="text-sm text-muted-foreground">
                      {tier.checked} / {tier.total}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(tier.checked / tier.total) * 100}%`,
                        backgroundColor: tier.color,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
