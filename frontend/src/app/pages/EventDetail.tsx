import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { Calendar, MapPin, Users, Clock, Share2, Heart, Bookmark, Sparkles } from 'lucide-react';
import { authPostJson, getJson } from '@/lib/api';

export function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [message, setMessage] = useState('');

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
  const agenda = event.agenda?.length ? event.agenda : [
    { time: '10:00 AM', title: 'Registration & Welcome', description: 'Get settled and meet attendees.', type: 'break' },
    { time: '11:00 AM', title: 'Featured Session', description: 'Curated session from the organizer.', type: 'session' },
  ];
  const speakers = event.speakers || [];
  const faqs = event.faqs || [];
  const reviews = event.reviews || [];

  const submitReview = async () => {
    try {
      await authPostJson(`/events/${id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment,
      });
      setMessage('Review submitted.');
      setReviewComment('');
      const refreshed = await getJson(`/events/${id}`);
      setEvent(refreshed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit review');
    }
  };

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
          {message && <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{message}</div>}
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
            {event.tags?.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {event.tags.map((tag: string) => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs">{tag}</span>
                ))}
              </div>
            ) : null}
          </div>

          <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
            <h2 className="text-2xl font-heading font-bold mb-6">Event Agenda</h2>
            <div className="space-y-4">
              {agenda.map((item: any, index: number) => (
                <div key={`${item.time}-${index}`} className="flex gap-4 pb-4 border-b border-border">
                  <div className="text-sm text-muted-foreground w-24 flex-shrink-0">{item.time}</div>
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <div className="px-3 py-1 rounded-full text-xs font-medium bg-[#7F5AF0]/10 text-[#7F5AF0]">{item.type}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
              <h2 className="text-xl font-heading font-bold mb-4">Speakers</h2>
              {speakers.length === 0 ? (
                <p className="text-sm text-muted-foreground">Speaker details will be announced soon.</p>
              ) : speakers.map((speaker: any) => (
                <div key={speaker.name} className="p-3 rounded-xl bg-white/50 border border-border mb-3">
                  <div className="font-medium">{speaker.name}</div>
                  <div className="text-sm text-muted-foreground">{speaker.role}</div>
                  <p className="text-sm text-muted-foreground mt-2">{speaker.bio}</p>
                </div>
              ))}
            </div>

            <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
              <h2 className="text-xl font-heading font-bold mb-4">Venue Map</h2>
              {event.mapUrl ? (
                <a href={event.mapUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">Open venue map</a>
              ) : (
                <div className="p-6 rounded-xl bg-white/50 border border-border text-sm text-muted-foreground">{event.venue}</div>
              )}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
            <h2 className="text-xl font-heading font-bold mb-4">FAQ</h2>
            {faqs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No FAQs added yet.</p>
            ) : faqs.map((faq: any) => (
              <div key={faq.question} className="pb-4 mb-4 border-b border-border">
                <div className="font-medium mb-1">{faq.question}</div>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>

          <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
            <h2 className="text-xl font-heading font-bold mb-4">Reviews & Ratings</h2>
            <div className="grid md:grid-cols-[160px_1fr] gap-3 mb-6">
              <select value={reviewRating} onChange={(event) => setReviewRating(Number(event.target.value))} className="px-3 py-2 rounded-xl bg-white/70 border border-border">
                {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} stars</option>)}
              </select>
              <div className="flex gap-2">
                <input value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} placeholder="Share your experience..." className="flex-1 px-3 py-2 rounded-xl bg-white/70 border border-border" />
                <button onClick={submitReview} className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white text-sm">Post</button>
              </div>
            </div>
            {reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">No reviews yet.</p>
            ) : reviews.map((review: any, index: number) => (
              <div key={review._id || index} className="p-3 rounded-xl bg-white/50 border border-border mb-3">
                <div className="font-medium">{review.rating} / 5</div>
                <p className="text-sm text-muted-foreground">{review.comment || 'No comment provided.'}</p>
              </div>
            ))}
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
