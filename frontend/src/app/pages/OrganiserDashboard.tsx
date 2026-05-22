import { Plus, TrendingUp, Users, DollarSign, Calendar, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export function OrganiserDashboard() {
  const salesData = [
    { month: 'Jan', sales: 45 },
    { month: 'Feb', sales: 78 },
    { month: 'Mar', sales: 92 },
    { month: 'Apr', sales: 125 },
    { month: 'May', sales: 156 },
  ];

  const revenueData = [
    { month: 'Jan', revenue: 3500 },
    { month: 'Feb', revenue: 6200 },
    { month: 'Mar', revenue: 7300 },
    { month: 'Apr', revenue: 9900 },
    { month: 'May', revenue: 12400 },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-heading font-bold mb-2">Organiser Dashboard</h1>
          <p className="text-muted-foreground">Manage your events and track performance</p>
        </div>
        <a
          href="/app/create-event"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white font-medium hover:shadow-xl hover:shadow-primary/30 transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Event
        </a>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-full bg-[#2CB67D]/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-[#2CB67D]" />
            </div>
            <TrendingUp className="w-4 h-4 text-[#2CB67D]" />
          </div>
          <div className="text-2xl font-heading font-bold mb-1">$12.4K</div>
          <div className="text-sm text-muted-foreground">Total Revenue</div>
        </div>

        <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-full bg-[#00C2FF]/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-[#00C2FF]" />
            </div>
            <TrendingUp className="w-4 h-4 text-[#2CB67D]" />
          </div>
          <div className="text-2xl font-heading font-bold mb-1">1,456</div>
          <div className="text-sm text-muted-foreground">Total Attendees</div>
        </div>

        <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-full bg-[#7F5AF0]/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[#7F5AF0]" />
            </div>
          </div>
          <div className="text-2xl font-heading font-bold mb-1">8</div>
          <div className="text-sm text-muted-foreground">Active Events</div>
        </div>

        <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-full bg-[#FFD60A]/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#FFD60A]" />
            </div>
            <TrendingUp className="w-4 h-4 text-[#2CB67D]" />
          </div>
          <div className="text-2xl font-heading font-bold mb-1">92%</div>
          <div className="text-sm text-muted-foreground">Satisfaction</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Ticket Sales */}
        <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-heading font-semibold">Ticket Sales</h2>
            <button className="text-sm text-primary hover:underline">View Details</button>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={salesData}>
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

        {/* Revenue */}
        <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-heading font-semibold">Revenue Trend</h2>
            <button className="text-sm text-primary hover:underline">View Details</button>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#7F5AF0" strokeWidth={3} dot={{ fill: '#7F5AF0', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Active Events */}
      <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-heading font-semibold">Active Events</h2>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/50 border border-border hover:bg-white/80 transition-all">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        <div className="space-y-3">
          {[
            { id: 1, name: 'AI Summit 2026', date: 'May 25', sold: 245, capacity: 300, revenue: '$19,500' },
            { id: 2, name: 'Tech Networking Mixer', date: 'Jun 5', sold: 180, capacity: 250, revenue: '$14,400' },
          ].map(event => (
            <div key={event.id} className="p-4 rounded-xl bg-white/50 border border-border">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-heading font-semibold mb-1">{event.name}</h3>
                  <p className="text-sm text-muted-foreground">{event.date}</p>
                </div>
                <div className="text-right">
                  <div className="font-heading font-bold text-[#2CB67D]">{event.revenue}</div>
                  <div className="text-sm text-muted-foreground">Revenue</div>
                </div>
              </div>

              <div className="mb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-muted-foreground">Tickets Sold</span>
                  <span className="text-sm font-medium">{event.sold} / {event.capacity}</span>
                </div>
                <div className="h-2 rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF]"
                    style={{ width: `${(event.sold / event.capacity) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                <a href={`/app/event/${event.id}`} className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white text-sm text-center hover:shadow-lg transition-all">
                  View Event
                </a>
                <a href={`/app/checkin/${event.id}`} className="px-4 py-2 rounded-lg bg-white/50 border border-border text-sm hover:bg-white/80 transition-all">
                  Check-in
                </a>
                <button className="px-4 py-2 rounded-lg bg-white/50 border border-border text-sm hover:bg-white/80 transition-all">
                  Analytics
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
