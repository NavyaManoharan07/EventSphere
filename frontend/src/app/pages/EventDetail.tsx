import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { Calendar, MapPin, Users, Clock, Share2, Heart, Bookmark, Sparkles } from 'lucide-react';

const getJson = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}`);
  return response.json();
};

export function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const loadEvent = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getJson(`/events/${id}`);
        setEvent(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load event');
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [id]);

  const formatDate = (value?: string) => (value ? new Date(value).toLocaleString() : 'TBD');

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-10 text-center">Loading event details...</div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-10 rounded-3xl bg-red-50 border border-red-200 text-red-700">{error}</div>
    );
  }

  if (!event) {
    return null;
  }

  const ticketPrice = event.price != null ? `$${event.price}` : 'TBD';
  const seatsRemaining = event.seatsRemaining != null ? event.seatsRemaining : 0;
  const eventDate = formatDate(event.startDate);
  const eventTime = event.startDate && event.endDate ? `${formatDate(event.startDate)} - ${formatDate(event.endDate)}` : 'TBD';

  return (
    <div className="max-w-7xl mx-auto">
      <div className="relative h-96 rounded-3xl overflow-hidden mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-[#7F5AF0] via-[#00C2FF] to-[#2CB67D]"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Calendar className="w-32 h-32 text-white/30" />
        </div>

        <div className="absolute top-6 right-6 flex gap-3">
          <button type="button" title="Add to favorites" className="w-12 h-12 rounded-full bg-white/90 backdrop-blur flex items-center justify-center hover:scale-110 transition-transform">
            <Heart className="w-5 h-5" />
          </button>
          <button type="button" title="Bookmark event" className="w-12 h-12 rounded-full bg-white/90 backdrop-blur flex items-center justify-center hover:scale-110 transition-transform">
            <Bookmark className="w-5 h-5" />
          </button>
          <button type="button" title="Share event" className="w-12 h-12 rounded-full bg-white/90 backdrop-blur flex items-center justify-center hover:scale-110 transition-transform">
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        <div className="absolute bottom-6 left-6 px-4 py-2 rounded-full bg-white/90 backdrop-blur flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#7F5AF0]" />
          <span className="font-medium">{event.sold ?? 0} people booked</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-[#00C2FF]/10 text-[#00C2FF]">
                {event.category || 'General'}
              </span>
              <span className="text-sm text-muted-foreground">Organized by {event.organizer?.name || 'Organizer'}</span>
            </div>

            <h1 className="text-4xl font-heading font-bold mb-4">{event.title}</h1>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/70 backdrop-blur-lg border border-border">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-sm text-muted-foreground">Date</div>
                  <div className="font-medium">{eventDate}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/70 backdrop-blur-lg border border-border">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-sm text-muted-foreground">Time</div>
                  <div className="font-medium">{eventTime}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/70 backdrop-blur-lg border border-border">
                <MapPin className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-sm text-muted-foreground">Location</div>
                  <div className="font-medium">{event.venue}</div>
                </div>
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed">{event.description}</p>
          </div>

          <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
            <h2 className="text-2xl font-heading font-bold mb-6">Event Agenda</h2>
            <div className="space-y-4">
              <div className="flex gap-4 pb-4 border-b border-border">
                <div className="text-sm text-muted-foreground w-24 flex-shrink-0">10:00 AM</div>
                <div className="flex-1">
                  <h3 className="font-medium mb-1">Registration & Breakfast</h3>
                  <p className="text-sm text-muted-foreground">Get settled and connect with early attendees.</p>
                </div>
                <div className="px-3 py-1 rounded-full text-xs font-medium bg-[#7F5AF0]/10 text-[#7F5AF0]">break</div>
              </div>
              <div className="flex gap-4 pb-4 border-b border-border">
                <div className="text-sm text-muted-foreground w-24 flex-shrink-0">11:00 AM</div>
                <div className="flex-1">
                  <h3 className="font-medium mb-1">Opening Keynote</h3>
                  <p className="text-sm text-muted-foreground">Industry leaders share the biggest trends.</p>
                </div>
                <div className="px-3 py-1 rounded-full text-xs font-medium bg-[#00C2FF]/10 text-[#00C2FF]">keynote</div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#7F5AF0] to-[#00C2FF] text-white">
            <div className="flex items-start gap-3">
              <Sparkles className="w-6 h-6 flex-shrink-0" />
              <div>
                <h3 className="font-heading font-semibold mb-2">Why this event is worth attending</h3>
                <ul className="space-y-2 text-sm text-white/90">
                  <li>• Perfect for professionals looking to expand their network</li>
                  <li>• Experienced speakers and curated sessions</li>
                  <li>• Practical takeaways for real-world projects</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:sticky lg:top-24 h-fit">
          <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border shadow-xl">
            <div className="mb-4">
              <h2 className="text-xl font-heading font-bold">Ticket</h2>
              <p className="text-sm text-muted-foreground">{ticketPrice} • {seatsRemaining} seats left</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/50 border border-border">
                <div>
                  <div className="text-sm text-muted-foreground">General Admission</div>
                  <div className="font-semibold">${event.price}</div>
                </div>
                <div className="text-sm text-muted-foreground">{seatsRemaining} left</div>
              </div>
            </div>

            <Link
              to={`/app/checkout/${id}`}
              className="w-full block text-center px-6 py-3 rounded-xl bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white font-medium hover:shadow-xl hover:shadow-primary/30 transition-all"
            >
              Buy Ticket
            </Link>

            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Booked</span>
                <span className="font-medium">{event.sold ?? 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Remaining</span>
                <span className="font-medium">{seatsRemaining}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
