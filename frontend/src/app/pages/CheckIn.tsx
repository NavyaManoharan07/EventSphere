import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { QrCode, Check, X, Users, TrendingUp } from 'lucide-react';
import { authPostJson, getJson } from '@/lib/api';

export function CheckIn() {
  const { eventId } = useParams();
  const [event, setEvent] = useState<any>(null);
  const [ticketCode, setTicketCode] = useState('');
  const [status, setStatus] = useState<'success' | 'failure' | 'idle'>('idle');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadEvent = async () => {
      if (!eventId) return;
      try {
        const data = await getJson(`/events/${eventId}`);
        setEvent(data);
      } catch (err) {
        setMessage(err instanceof Error ? err.message : 'Unable to load event');
      }
    };

    loadEvent();
  }, [eventId]);

  const handleVerify = async () => {
    if (!ticketCode.trim()) {
      setMessage('Enter a ticket code to verify.');
      setStatus('failure');
      return;
    }

    setLoading(true);
    setMessage('');
    setStatus('idle');

    try {
      const result = await authPostJson<{ success: boolean; message?: string }>('/events/checkin', {
        ticketCode: ticketCode.trim(),
      });

      setStatus(result.success ? 'success' : 'failure');
      setMessage(result.message ?? (result.success ? 'Ticket verified successfully.' : 'Ticket validation failed.'));
    } catch (err) {
      setStatus('failure');
      setMessage(err instanceof Error ? err.message : 'Unable to verify ticket.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-heading font-bold mb-2">Event Check-In</h1>
        <p className="text-muted-foreground">{event?.title || 'Loading event...'} </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-8 rounded-3xl bg-white/70 backdrop-blur-lg border border-border text-center">
            <h2 className="text-2xl font-heading font-semibold mb-6">Verify Ticket</h2>

            <div className="relative max-w-md mx-auto mb-6">
              <div
                className={`w-full aspect-square rounded-2xl border-4 border-dashed flex items-center justify-center transition-all ${
                  loading
                    ? 'border-[#7F5AF0] bg-[#7F5AF0]/5 animate-pulse'
                    : status === 'success'
                    ? 'border-[#2CB67D] bg-[#2CB67D]/5'
                    : status === 'failure'
                    ? 'border-[#FF6B9D] bg-[#FF6B9D]/5'
                    : 'border-border bg-white/50'
                }`}
              >
                {loading ? (
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-muted-foreground">Validating...</p>
                  </div>
                ) : status !== 'idle' ? (
                  <div className="text-center">
                    <div
                      className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                        status === 'success' ? 'bg-[#2CB67D]' : 'bg-[#FF6B9D]'
                      }`}
                    >
                      {status === 'success' ? (
                        <Check className="w-10 h-10 text-white" />
                      ) : (
                        <X className="w-10 h-10 text-white" />
                      )}
                    </div>
                    <h3 className="text-xl font-heading font-bold mb-2">
                      {status === 'success' ? 'Check-In Successful!' : 'Invalid Ticket'}
                    </h3>
                    <p className="text-muted-foreground">{message}</p>
                  </div>
                ) : (
                  <QrCode className="w-32 h-32 text-muted-foreground" />
                )}
              </div>
            </div>

            <div className="space-y-4 max-w-md mx-auto">
              <input
                value={ticketCode}
                onChange={(event) => setTicketCode(event.target.value)}
                type="text"
                placeholder="Enter ticket code"
                className="w-full px-4 py-3 rounded-xl bg-white/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                onClick={handleVerify}
                disabled={loading}
                className="w-full px-8 py-4 rounded-xl bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white font-medium hover:shadow-xl hover:shadow-primary/30 transition-all disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify Ticket'}
              </button>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
            <h2 className="text-xl font-heading font-semibold mb-6">Recent Check-Ins</h2>
            <div className="space-y-3">
              {event?.recentCheckIns?.length ? (
                event.recentCheckIns.map((checkin:any) => (
                  <div
                    key={checkin.id}
                    className={`p-4 rounded-xl border ${
                      checkin.success ? 'bg-white/50 border-border' : 'bg-[#FF6B9D]/5 border-[#FF6B9D]/20'
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
                          checkin.success ? 'bg-[#2CB67D]/10 text-[#2CB67D]' : 'bg-[#FF6B9D]/10 text-[#FF6B9D]'
                        }`}
                      >
                        {checkin.success ? 'Verified' : 'Declined'}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl bg-white/50 border border-border p-6 text-center text-muted-foreground">
                  No recent check-ins yet.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#7F5AF0] to-[#00C2FF] text-white">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-6 h-6" />
              <h3 className="font-heading font-semibold">Live Attendance</h3>
            </div>
            <div className="text-5xl font-heading font-bold mb-2">{event?.sold ?? 0}</div>
            <div className="text-sm text-white/80">of {event?.capacity ?? 0} capacity</div>
            <div className="mt-4 h-2 rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white"
                style={{ width: event?.capacity ? `${Math.min(100, ((event.sold || 0) / event.capacity) * 100)}%` : '0%' }}
              />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
            <h3 className="font-heading font-semibold mb-4">Check-In Analytics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Success Rate</span>
                <span className="font-heading font-bold text-[#2CB67D]">{event?.checkInStats?.successRate ?? 'n/a'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Average Time</span>
                <span className="font-heading font-bold">{event?.checkInStats?.avgTime ?? 'n/a'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Peak Hour</span>
                <span className="font-heading font-bold">{event?.checkInStats?.peakHour ?? 'n/a'}</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
            <h3 className="font-heading font-semibold mb-4">Ticket Breakdown</h3>
            <div className="space-y-3">
              {event?.ticketBreakdown?.map((tier:any, i:number) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{tier.tier}</span>
                    <span className="text-sm text-muted-foreground">
                      {tier.checked} / {tier.total}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white">
                    <div className="h-full rounded-full" style={{ width: `${(tier.checked / tier.total) * 100}%`, backgroundColor: tier.color }}></div>
                  </div>
                </div>
              )) ?? (
                <div className="text-sm text-muted-foreground">No breakdown available.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
