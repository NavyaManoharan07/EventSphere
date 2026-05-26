import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Plus, TrendingUp, Users, DollarSign, Calendar, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { authGetJson, getJson } from '@/lib/api';

export function OrganiserDashboard() {
  const [events, setEvents] = useState<any[]>([]);
  const [intelligence, setIntelligence] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getJson<any[]>('/events');
        setEvents(data || []);
        try {
          const insights = await authGetJson('/events/organizer/intelligence');
          setIntelligence(insights);
        } catch {
          setIntelligence(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load events');
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  const totalRevenue = events.reduce((sum, event) => sum + (Number(event.price) * Number(event.sold || 0)), 0);
  const totalAttendees = events.reduce((sum, event) => sum + Number(event.sold || 0), 0);
  const activeEvents = events.length;

  const salesData = events.slice(-5).map((event, index) => ({ month: event.title || `Event ${index + 1}`, sales: Number(event.sold || 0) }));
  const revenueData = events.slice(-5).map((event, index) => ({ month: event.title || `Event ${index + 1}`, revenue: Number(event.price || 0) * Number(event.sold || 0) }));

  const exportCsv = () => {
    const rows = [
      ['Title', 'Date', 'Tickets Sold', 'Capacity', 'Revenue'],
      ...events.map((event) => [
        event.title,
        event.startDate ? new Date(event.startDate).toLocaleDateString() : 'TBD',
        event.sold || 0,
        event.capacity || 0,
        Number(event.price || 0) * Number(event.sold || 0),
      ]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'eventsphere-attendees.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-heading font-bold mb-2">Organiser Dashboard</h1>
          <p className="text-muted-foreground">Manage your events and track performance</p>
        </div>
        <Link
          to="/app/create-event"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white font-medium hover:shadow-xl hover:shadow-primary/30 transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Event
        </Link>
      </div>

      {loading ? (
        <div className="rounded-3xl bg-white/70 border border-border p-10 text-center">Loading events...</div>
      ) : error ? (
        <div className="rounded-3xl bg-red-50 border border-red-200 p-10 text-center text-red-700">{error}</div>
      ) : (
        <>
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-full bg-[#2CB67D]/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-[#2CB67D]" />
                </div>
                <TrendingUp className="w-4 h-4 text-[#2CB67D]" />
              </div>
              <div className="text-2xl font-heading font-bold mb-1">${totalRevenue.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Revenue</div>
            </div>

            <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-full bg-[#00C2FF]/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-[#00C2FF]" />
                </div>
                <TrendingUp className="w-4 h-4 text-[#2CB67D]" />
              </div>
              <div className="text-2xl font-heading font-bold mb-1">{totalAttendees.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Attendees</div>
            </div>

            <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-full bg-[#7F5AF0]/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[#7F5AF0]" />
                </div>
              </div>
              <div className="text-2xl font-heading font-bold mb-1">{activeEvents}</div>
              <div className="text-sm text-muted-foreground">Active Events</div>
            </div>

            <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-full bg-[#FFD60A]/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-[#FFD60A]" />
                </div>
                <TrendingUp className="w-4 h-4 text-[#2CB67D]" />
              </div>
              <div className="text-2xl font-heading font-bold mb-1">{activeEvents ? Math.round((totalAttendees / (activeEvents * 100)) * 100) : 0}%</div>
              <div className="text-sm text-muted-foreground">Engagement</div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-heading font-semibold">Ticket Sales</h2>
                <button className="text-sm text-primary hover:underline">View Details</button>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={salesData.length ? salesData : [{ month: 'No Data', sales: 0 }] }>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Bar dataKey="sales" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7F5AF0" />
                      <stop offset="100%" stopColor="#00C2FF" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-heading font-semibold">Revenue Trend</h2>
                <button className="text-sm text-primary hover:underline">View Details</button>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={revenueData.length ? revenueData : [{ month: 'No Data', revenue: 0 }] }>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#7F5AF0" strokeWidth={3} dot={{ fill: '#7F5AF0', r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {intelligence && (
            <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border mb-8">
              <h2 className="text-xl font-heading font-semibold mb-4">AI Organizer Intelligence</h2>
              <div className="grid md:grid-cols-4 gap-4 mb-5">
                <div className="p-4 rounded-xl bg-white/50 border border-border">
                  <div className="text-sm text-muted-foreground">Event Health</div>
                  <div className="text-2xl font-heading font-bold">{intelligence.summary?.healthScore ?? 0}%</div>
                </div>
                <div className="p-4 rounded-xl bg-white/50 border border-border">
                  <div className="text-sm text-muted-foreground">Check-ins</div>
                  <div className="text-2xl font-heading font-bold">{intelligence.summary?.checkedIn ?? 0}</div>
                </div>
                <div className="p-4 rounded-xl bg-white/50 border border-border">
                  <div className="text-sm text-muted-foreground">Tickets</div>
                  <div className="text-2xl font-heading font-bold">{intelligence.summary?.sold ?? 0}</div>
                </div>
                <div className="p-4 rounded-xl bg-white/50 border border-border">
                  <div className="text-sm text-muted-foreground">Revenue</div>
                  <div className="text-2xl font-heading font-bold">${Number(intelligence.summary?.revenue || 0).toLocaleString()}</div>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white/50 border border-border">
                  <h3 className="font-heading font-semibold mb-2">Audience Interests</h3>
                  {(intelligence.audienceInterests || []).length ? intelligence.audienceInterests.map((item: any) => (
                    <div key={item.name} className="text-sm text-muted-foreground">{item.name}: {item.count}</div>
                  )) : <div className="text-sm text-muted-foreground">No attendee interest data yet.</div>}
                </div>
                <div className="p-4 rounded-xl bg-white/50 border border-border">
                  <h3 className="font-heading font-semibold mb-2">Best Timing</h3>
                  {(intelligence.bestTimingSuggestions || []).map((item: string) => <div key={item} className="text-sm text-muted-foreground mb-1">{item}</div>)}
                </div>
                <div className="p-4 rounded-xl bg-white/50 border border-border">
                  <h3 className="font-heading font-semibold mb-2">Improvements</h3>
                  {(intelligence.improvementSuggestions || []).map((item: string) => <div key={item} className="text-sm text-muted-foreground mb-1">{item}</div>)}
                </div>
              </div>
            </div>
          )}

          <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-heading font-semibold">Active Events</h2>
              <button onClick={exportCsv} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/50 border border-border hover:bg-white/80 transition-all">
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>

            <div className="space-y-3">
              {events.length ? (
                events.map((event) => (
                  <div key={event._id} className="p-4 rounded-xl bg-white/50 border border-border">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-heading font-semibold mb-1">{event.title}</h3>
                        <p className="text-sm text-muted-foreground">{event.startDate ? new Date(event.startDate).toLocaleDateString() : 'TBD'}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-heading font-bold text-[#2CB67D]">${(Number(event.price) * Number(event.sold || 0)).toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">Revenue</div>
                      </div>
                    </div>

                    <div className="mb-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-muted-foreground">Tickets Sold</span>
                        <span className="text-sm font-medium">{event.sold || 0} / {event.capacity || 0}</span>
                      </div>
                      <div className="h-2 rounded-full bg-white">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF]"
                          style={{ width: event.capacity ? `${Math.min(100, ((event.sold || 0) / event.capacity) * 100)}%` : '0%' }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <Link
                        to={`/app/event/${event._id}`}
                        className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white text-sm text-center hover:shadow-lg transition-all"
                      >
                        View Event
                      </Link>
                      <Link
                        to={`/app/checkin/${event._id}`}
                        className="px-4 py-2 rounded-lg bg-white/50 border border-border text-sm hover:bg-white/80 transition-all"
                      >
                        Check-in
                      </Link>
                      <button className="px-4 py-2 rounded-lg bg-white/50 border border-border text-sm hover:bg-white/80 transition-all">
                        Analytics
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl bg-white/70 border border-border p-10 text-center text-muted-foreground">
                  No active events found.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
