import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { Calendar, MapPin, Users, Clock, Share2, Heart, Bookmark, Sparkles, ChevronDown } from 'lucide-react';

export function EventDetail() {
  const { id } = useParams();
  const [selectedTicket, setSelectedTicket] = useState('general');

  const ticketTiers = [
    { id: 'early', name: 'Early Bird', price: 49, original: 79, available: 5, features: ['General Access', 'Event Swag'] },
    { id: 'general', name: 'General Admission', price: 79, available: 150, features: ['General Access', 'Event Swag', 'Lunch Included'] },
    { id: 'vip', name: 'VIP Pass', price: 199, available: 20, features: ['VIP Access', 'Premium Swag', 'All Meals', 'Meet & Greet', 'Reserved Seating'] },
  ];

  const agenda = [
    { time: '9:00 AM', title: 'Registration & Breakfast', type: 'break' },
    { time: '10:00 AM', title: 'Opening Keynote: The Future of AI', speaker: 'Dr. Sarah Chen', type: 'keynote' },
    { time: '11:30 AM', title: 'Panel Discussion: AI in Practice', type: 'panel' },
    { time: '1:00 PM', title: 'Networking Lunch', type: 'break' },
    { time: '2:30 PM', title: 'Workshop: Building AI Applications', type: 'workshop' },
    { time: '4:00 PM', title: 'Closing Remarks', type: 'closing' },
  ];

  const speakers = [
    { name: 'Dr. Sarah Chen', role: 'AI Research Lead', company: 'TechCorp' },
    { name: 'Mike Johnson', role: 'CTO', company: 'StartupX' },
    { name: 'Emily Davis', role: 'Product Designer', company: 'DesignCo' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Banner */}
      <div className="relative h-96 rounded-3xl overflow-hidden mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-[#7F5AF0] via-[#00C2FF] to-[#2CB67D]"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Calendar className="w-32 h-32 text-white/30" />
        </div>

        {/* Actions */}
        <div className="absolute top-6 right-6 flex gap-3">
          <button className="w-12 h-12 rounded-full bg-white/90 backdrop-blur flex items-center justify-center hover:scale-110 transition-transform">
            <Heart className="w-5 h-5" />
          </button>
          <button className="w-12 h-12 rounded-full bg-white/90 backdrop-blur flex items-center justify-center hover:scale-110 transition-transform">
            <Bookmark className="w-5 h-5" />
          </button>
          <button className="w-12 h-12 rounded-full bg-white/90 backdrop-blur flex items-center justify-center hover:scale-110 transition-transform">
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* AI Match Badge */}
        <div className="absolute bottom-6 left-6 px-4 py-2 rounded-full bg-white/90 backdrop-blur flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#7F5AF0]" />
          <span className="font-medium">95% AI Match</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Event Overview */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-[#00C2FF]/10 text-[#00C2FF]">
                Career
              </span>
              <span className="text-sm text-muted-foreground">Organized by TechEvents Inc.</span>
            </div>

            <h1 className="text-4xl font-heading font-bold mb-4">AI Summit 2026</h1>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/70 backdrop-blur-lg border border-border">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-sm text-muted-foreground">Date</div>
                  <div className="font-medium">May 25, 2026</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/70 backdrop-blur-lg border border-border">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-sm text-muted-foreground">Time</div>
                  <div className="font-medium">9:00 AM - 5:00 PM</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/70 backdrop-blur-lg border border-border">
                <MapPin className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-sm text-muted-foreground">Location</div>
                  <div className="font-medium">San Francisco, CA</div>
                </div>
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              Join us for the premier AI conference of 2026! Connect with industry leaders, learn cutting-edge techniques,
              and discover the future of artificial intelligence. This full-day event features keynotes, panels, workshops,
              and extensive networking opportunities with over 1,250 attendees from around the world.
            </p>
          </div>

          {/* Agenda */}
          <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
            <h2 className="text-2xl font-heading font-bold mb-6">Event Agenda</h2>
            <div className="space-y-4">
              {agenda.map((item, i) => (
                <div key={i} className="flex gap-4 pb-4 border-b border-border last:border-0">
                  <div className="text-sm text-muted-foreground w-24 flex-shrink-0">{item.time}</div>
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{item.title}</h3>
                    {item.speaker && (
                      <p className="text-sm text-muted-foreground">{item.speaker}</p>
                    )}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium h-fit ${
                    item.type === 'keynote' ? 'bg-[#7F5AF0]/10 text-[#7F5AF0]' :
                    item.type === 'workshop' ? 'bg-[#00C2FF]/10 text-[#00C2FF]' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {item.type}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Speakers */}
          <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
            <h2 className="text-2xl font-heading font-bold mb-6">Featured Speakers</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {speakers.map((speaker, i) => (
                <div key={i} className="text-center">
                  <div className="w-24 h-24 mx-auto mb-3 rounded-full bg-gradient-to-br from-[#7F5AF0] to-[#00C2FF]"></div>
                  <h3 className="font-heading font-semibold mb-1">{speaker.name}</h3>
                  <p className="text-sm text-muted-foreground">{speaker.role}</p>
                  <p className="text-sm text-muted-foreground">{speaker.company}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Recommendation */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#7F5AF0] to-[#00C2FF] text-white">
            <div className="flex items-start gap-3">
              <Sparkles className="w-6 h-6 flex-shrink-0" />
              <div>
                <h3 className="font-heading font-semibold mb-2">Why This Event Matches You</h3>
                <ul className="space-y-2 text-sm text-white/90">
                  <li>• Aligns with your interest in Technology and AI</li>
                  <li>• 12 people from your network are attending</li>
                  <li>• Matches your career growth goals</li>
                  <li>• Similar to events you've attended before</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Ticket Panel */}
        <div className="lg:sticky lg:top-24 h-fit">
          <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border shadow-xl">
            <h2 className="text-xl font-heading font-bold mb-4">Select Ticket</h2>

            <div className="space-y-3 mb-6">
              {ticketTiers.map(tier => (
                <button
                  key={tier.id}
                  onClick={() => setSelectedTicket(tier.id)}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    selectedTicket === tier.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-white/50 hover:bg-white/80'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-heading font-semibold">{tier.name}</h3>
                      <p className="text-xs text-muted-foreground">{tier.available} available</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-heading font-bold">${tier.price}</div>
                      {tier.original && (
                        <div className="text-sm text-muted-foreground line-through">${tier.original}</div>
                      )}
                    </div>
                  </div>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {tier.features.map((feature, i) => (
                      <li key={i}>• {feature}</li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm">Quantity</span>
                <div className="flex items-center gap-3">
                  <button className="w-8 h-8 rounded-lg bg-white/50 border border-border hover:bg-white/80">-</button>
                  <span className="w-8 text-center font-medium">1</span>
                  <button className="w-8 h-8 rounded-lg bg-white/50 border border-border hover:bg-white/80">+</button>
                </div>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Coupon code"
                  className="w-full px-4 py-2 rounded-lg bg-white/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <div className="space-y-2 mb-6 py-4 border-t border-b border-border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">$79.00</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Service Fee</span>
                <span className="font-medium">$5.00</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-heading font-semibold">Total</span>
                <span className="text-xl font-heading font-bold">$84.00</span>
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
                <span className="text-muted-foreground">Going</span>
                <span className="font-medium">1,250 people</span>
              </div>
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7F5AF0] to-[#00C2FF] border-2 border-white"></div>
                ))}
                <div className="w-8 h-8 rounded-full bg-white/70 backdrop-blur border-2 border-white flex items-center justify-center text-xs font-medium">
                  +1.2K
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
