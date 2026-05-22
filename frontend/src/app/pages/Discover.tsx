import { useState } from 'react';
import { Link } from 'react-router';
import { Search, Filter, MapPin, Calendar, Users, Sparkles, Heart, Share2 } from 'lucide-react';

export function Discover() {
  const [activeTab, setActiveTab] = useState('all');

  const events = [
    { id: 1, title: 'AI Summit 2026', category: 'Career', date: 'May 25', location: 'San Francisco', attendees: 1250, price: 'Paid', match: 95, image: 'tech' },
    { id: 2, title: 'Summer Music Festival', category: 'Entertainment', date: 'Jun 10', location: 'Los Angeles', attendees: 5000, price: 'Paid', match: 88, image: 'music' },
    { id: 3, title: 'Startup Pitch Night', category: 'Career', date: 'May 28', location: 'New York', attendees: 320, price: 'Free', match: 92, image: 'startup' },
    { id: 4, title: 'Design Workshop', category: 'Career', date: 'Jun 2', location: 'Austin', attendees: 150, price: 'Paid', match: 85, image: 'design' },
    { id: 5, title: 'Jazz Night Live', category: 'Entertainment', date: 'May 30', location: 'Chicago', attendees: 400, price: 'Paid', match: 78, image: 'jazz' },
    { id: 6, title: 'Tech Networking Mixer', category: 'Career', date: 'Jun 5', location: 'Seattle', attendees: 280, price: 'Free', match: 90, image: 'networking' },
  ];

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'career', label: 'Career' },
    { id: 'entertainment', label: 'Entertainment' },
    { id: 'trending', label: 'Trending' },
    { id: 'nearby', label: 'Nearby' },
    { id: 'foryou', label: 'For You' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-heading font-bold mb-2">Discover Events</h1>
        <p className="text-muted-foreground">Find your next amazing experience</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search events, topics, or locations..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/70 backdrop-blur-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <button className="px-6 py-3 rounded-xl bg-white/70 backdrop-blur-lg border border-border hover:bg-white/90 transition-all flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2 rounded-full whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white shadow-lg'
                  : 'bg-white/70 backdrop-blur-lg border border-border hover:bg-white/90'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(event => (
          <div key={event.id} className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#7F5AF0]/20 to-[#00C2FF]/20 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity"></div>

            <div className="relative p-4 rounded-2xl bg-white/70 backdrop-blur-lg border border-border hover:shadow-xl transition-all">
              {/* Event Image */}
              <div className="relative w-full h-48 rounded-xl bg-gradient-to-br from-[#7F5AF0] to-[#00C2FF] mb-4 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Calendar className="w-12 h-12 text-white/50" />
                </div>

                {/* AI Match Badge */}
                {event.match >= 85 && (
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white text-xs font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {event.match}% Match
                  </div>
                )}

                {/* Price Badge */}
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur text-xs font-medium">
                  {event.price}
                </div>

                {/* Action Buttons */}
                <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center hover:scale-110 transition-transform">
                    <Heart className="w-4 h-4" />
                  </button>
                  <button className="w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center hover:scale-110 transition-transform">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Event Details */}
              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      event.category === 'Career'
                        ? 'bg-[#00C2FF]/10 text-[#00C2FF]'
                        : 'bg-[#FF6B9D]/10 text-[#FF6B9D]'
                    }`}>
                      {event.category}
                    </span>
                    <span className="text-xs text-muted-foreground">{event.date}</span>
                  </div>
                  <h3 className="font-heading font-semibold mb-2">{event.title}</h3>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{event.attendees} attending</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Link
                    to={`/app/event/${event.id}`}
                    className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white text-sm text-center hover:shadow-lg transition-all"
                  >
                    View Details
                  </Link>
                  <button className="px-4 py-2 rounded-lg bg-white/50 border border-border text-sm hover:bg-white/80 transition-all">
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="mt-12 text-center">
        <button className="px-8 py-3 rounded-full bg-white/70 backdrop-blur-lg border border-border hover:bg-white/90 transition-all">
          Load More Events
        </button>
      </div>
    </div>
  );
}
