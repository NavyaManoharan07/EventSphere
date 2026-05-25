import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Search, Filter, MapPin, Calendar, Users, Sparkles, Heart, Share2 } from 'lucide-react';
import { getJson } from '@/lib/api';

export function Discover() {
  const [activeTab, setActiveTab] = useState('all');
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getJson<any[]>('/events');
        setEvents(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load events');
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  const renderPrice = (price: number) => (price === 0 ? 'Free' : `$${price}`);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-heading font-bold mb-2">Discover Events</h1>
        <p className="text-muted-foreground">Find your next amazing experience</p>
      </div>

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

        <div className="flex gap-2 overflow-x-auto pb-2">
          {['all', 'career', 'entertainment', 'trending', 'nearby', 'foryou'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white shadow-lg'
                  : 'bg-white/70 backdrop-blur-lg border border-border hover:bg-white/90'
              }`}
            >
              {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl bg-white/70 border border-border p-10 text-center">Loading events...</div>
      ) : error ? (
        <div className="rounded-3xl bg-red-50 border border-red-200 p-10 text-center text-red-700">{error}</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.length === 0 ? (
            <div className="rounded-3xl bg-white/70 border border-border p-10 text-center">No events found.</div>
          ) : (
            events.map((event) => {
              const dateLabel = event.startDate ? new Date(event.startDate).toLocaleDateString() : 'TBD';
              const category = event.category || 'General';
              const match = event.sold ? Math.min(100, 70 + event.sold) : 85;

              return (
                <div key={event._id} className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#7F5AF0]/20 to-[#00C2FF]/20 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity"></div>

                  <div className="relative p-4 rounded-2xl bg-white/70 backdrop-blur-lg border border-border hover:shadow-xl transition-all">
                    <div className="relative w-full h-48 rounded-xl bg-gradient-to-br from-[#7F5AF0] to-[#00C2FF] mb-4 overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Calendar className="w-12 h-12 text-white/50" />
                      </div>

                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white text-xs font-medium flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {match}% Match
                      </div>

                      <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur text-xs font-medium">
                        {renderPrice(event.price)}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            category === 'Career'
                              ? 'bg-[#00C2FF]/10 text-[#00C2FF]'
                              : 'bg-[#FF6B9D]/10 text-[#FF6B9D]'
                          }`}>
                            {category}
                          </span>
                          <span className="text-xs text-muted-foreground">{dateLabel}</span>
                        </div>
                        <h3 className="font-heading font-semibold mb-2">{event.title}</h3>
                      </div>

                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{event.venue}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{event.sold ?? 0} attending</span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Link
                          to={`/app/event/${event._id}`}
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
              );
            })
          )}
        </div>
      )}

      <div className="mt-12 text-center">
        <button className="px-8 py-3 rounded-full bg-white/70 backdrop-blur-lg border border-border hover:bg-white/90 transition-all">
          Load More Events
        </button>
      </div>
    </div>
  );
}
