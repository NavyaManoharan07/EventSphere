import { Link } from 'react-router';
import { Calendar, MapPin, Download, Share2, QrCode, Plus } from 'lucide-react';

export function MyTickets() {
  const tickets = [
    { id: 1, event: 'AI Summit 2026', date: 'May 25', time: '10:00 AM', location: 'San Francisco', tier: 'General', status: 'upcoming' },
    { id: 2, event: 'Summer Music Fest', date: 'Jun 10', time: '6:00 PM', location: 'Los Angeles', tier: 'VIP', status: 'upcoming' },
    { id: 3, event: 'Tech Conference 2026', date: 'May 15', time: '9:00 AM', location: 'New York', tier: 'General', status: 'past' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-heading font-bold mb-2">My Tickets</h1>
          <p className="text-muted-foreground">View and manage your event tickets</p>
        </div>
        <Link
          to="/app/discover"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white font-medium hover:shadow-xl hover:shadow-primary/30 transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Find Events
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8">
        <button className="px-6 py-2 rounded-full bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white shadow-lg">
          Upcoming
        </button>
        <button className="px-6 py-2 rounded-full bg-white/70 backdrop-blur-lg border border-border hover:bg-white/90">
          Past Events
        </button>
      </div>

      {/* Tickets Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {tickets.filter(t => t.status === 'upcoming').map(ticket => (
          <div key={ticket.id} className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#7F5AF0]/20 to-[#00C2FF]/20 rounded-3xl opacity-0 group-hover:opacity-100 blur-2xl transition-opacity"></div>

            <div className="relative p-6 rounded-3xl bg-white/70 backdrop-blur-lg border border-border hover:shadow-2xl transition-all">
              {/* Ticket Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h3 className="text-2xl font-heading font-bold mb-2">{ticket.event}</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{ticket.date} at {ticket.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{ticket.location}</span>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white text-sm font-medium">
                  {ticket.tier}
                </div>
              </div>

              {/* QR Code */}
              <div className="relative mb-6 p-6 rounded-2xl bg-white/90 backdrop-blur">
                <div className="absolute inset-0 bg-gradient-to-br from-[#7F5AF0]/10 to-[#00C2FF]/10 rounded-2xl animate-pulse"></div>
                <div className="relative w-48 h-48 mx-auto bg-white rounded-xl flex items-center justify-center border-4 border-dashed border-border">
                  <QrCode className="w-32 h-32 text-muted-foreground" />
                </div>
                <p className="text-center mt-3 text-xs text-muted-foreground font-mono">
                  TICKET-{ticket.id}-{Math.random().toString(36).substr(2, 9).toUpperCase()}
                </p>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-3 gap-3">
                <button className="px-4 py-3 rounded-xl bg-white/50 border border-border hover:bg-white/80 transition-all flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  <span className="text-sm">Download</span>
                </button>
                <button className="px-4 py-3 rounded-xl bg-white/50 border border-border hover:bg-white/80 transition-all flex items-center justify-center gap-2">
                  <Share2 className="w-4 h-4" />
                  <span className="text-sm">Share</span>
                </button>
                <Link
                  to={`/app/event/${ticket.id}`}
                  className="px-4 py-3 rounded-xl bg-white/50 border border-border hover:bg-white/80 transition-all flex items-center justify-center gap-2"
                >
                  <span className="text-sm">Details</span>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {tickets.filter(t => t.status === 'upcoming').length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#7F5AF0] to-[#00C2FF] flex items-center justify-center opacity-50">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-heading font-semibold mb-2">No upcoming tickets</h3>
          <p className="text-muted-foreground mb-6">Discover amazing events to attend</p>
          <Link
            to="/app/discover"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white font-medium hover:shadow-xl hover:shadow-primary/30 transition-all"
          >
            <Plus className="w-5 h-5" />
            Browse Events
          </Link>
        </div>
      )}
    </div>
  );
}
