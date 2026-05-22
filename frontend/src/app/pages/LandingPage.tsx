import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Search, Calendar, MapPin, Users, Sparkles, TrendingUp, Briefcase, Music, Star, ArrowRight, Compass } from 'lucide-react';

export function LandingPage() {
  const trendingEvents = [
    { id: 1, title: 'AI Summit 2026', category: 'Career', date: 'May 25', attendees: 1250, image: 'tech' },
    { id: 2, title: 'Summer Music Festival', category: 'Entertainment', date: 'Jun 10', attendees: 5000, image: 'music' },
    { id: 3, title: 'Startup Pitch Night', category: 'Career', date: 'May 28', attendees: 320, image: 'startup' },
  ];

  const stats = [
    { label: 'Events Created', value: '50K+', icon: Calendar },
    { label: 'Active Users', value: '2M+', icon: Users },
    { label: 'Connections Made', value: '10M+', icon: Sparkles },
    { label: 'Success Rate', value: '98%', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-[#F8FAFC] to-[#E0E7FF]">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-white/70 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7F5AF0] via-[#00C2FF] to-[#2CB67D]"></div>
            <span className="text-xl font-heading font-semibold bg-gradient-to-r from-[#7F5AF0] via-[#00C2FF] to-[#2CB67D] bg-clip-text text-transparent">
              EventSphere AI
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="px-4 py-2 text-sm font-medium hover:text-primary transition-colors">
              Log In
            </Link>
            <Link
              to="/signup"
              className="px-6 py-2 text-sm font-medium rounded-full bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white hover:shadow-lg hover:shadow-primary/30 transition-all"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#7F5AF0]/5 via-transparent to-[#00C2FF]/5"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/60 backdrop-blur-sm border border-[#7F5AF0]/20"
            >
              <Sparkles className="w-4 h-4 text-[#7F5AF0]" />
              <span className="text-sm font-medium">Powered by AI</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-6xl md:text-7xl font-heading font-bold mb-6 leading-tight"
            >
              Discover Events.<br />
              <span className="bg-gradient-to-r from-[#7F5AF0] via-[#00C2FF] to-[#2CB67D] bg-clip-text text-transparent">
                Build Connections.
              </span><br />
              Unlock Opportunities.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              The intelligent platform that combines career events and entertainment into one seamless experience
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
            >
              <Link
                to="/signup"
                className="px-8 py-4 rounded-full bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white font-medium hover:shadow-xl hover:shadow-primary/30 transition-all flex items-center gap-2 text-lg"
              >
                Get Started Now <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>

            {/* Smart Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="max-w-2xl mx-auto"
            >
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#7F5AF0] via-[#00C2FF] to-[#2CB67D] rounded-full opacity-0 group-hover:opacity-20 blur-xl transition-opacity"></div>
                <div className="relative flex flex-col sm:flex-row items-center gap-3 p-2 rounded-2xl sm:rounded-full bg-white/60 backdrop-blur-lg border border-border shadow-lg">
                  <div className="flex items-center w-full px-4 sm:px-0">
                    <Search className="w-5 h-5 text-muted-foreground mr-3 sm:ml-4" />
                    <input
                      type="text"
                      placeholder="Search for events..."
                      className="flex-1 bg-transparent outline-none py-3"
                    />
                  </div>
                  <button className="w-full sm:w-auto px-6 py-3 rounded-xl sm:rounded-full bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white font-medium hover:shadow-lg transition-all">
                    Search
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Floating Event Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            {trendingEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#7F5AF0]/20 to-[#00C2FF]/20 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity"></div>
                <div className="relative p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border hover:shadow-xl transition-all">
                  <div className="w-full h-40 rounded-xl bg-gradient-to-br from-[#7F5AF0] to-[#00C2FF] mb-4 flex items-center justify-center">
                    <Calendar className="w-12 h-12 text-white/50" />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      event.category === 'Career'
                        ? 'bg-[#00C2FF]/10 text-[#00C2FF]'
                        : 'bg-[#FF6B9D]/10 text-[#FF6B9D]'
                    }`}>
                      {event.category}
                    </span>
                    <span className="text-sm text-muted-foreground">{event.date}</span>
                  </div>
                  <h3 className="font-heading font-semibold mb-2">{event.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{event.attendees}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>San Francisco</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* AI Assistant Orb */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="fixed bottom-8 right-8 z-50"
        >
          <div className="relative group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity animate-pulse"></div>
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[#7F5AF0] to-[#00C2FF] flex items-center justify-center shadow-2xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-white/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center p-4 md:p-6 rounded-2xl bg-white/60 backdrop-blur-lg border border-border hover:shadow-lg transition-all"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 md:mb-4 rounded-full bg-gradient-to-br from-[#7F5AF0] to-[#00C2FF] flex items-center justify-center">
                    <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <div className="text-2xl md:text-3xl font-heading font-bold mb-1 md:mb-2">{stat.value}</div>
                  <div className="text-[10px] md:text-sm text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Career Events Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-white to-[#00C2FF]/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-2">Career Events</h2>
              <p className="text-muted-foreground">Advance your professional journey</p>
            </div>
            <Link to="/signup" className="flex items-center gap-2 text-[#00C2FF] font-medium hover:underline">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`p-6 rounded-2xl bg-white/70 backdrop-blur-lg border transition-all hover:shadow-xl ${
                i === 1 ? 'border-[#00C2FF] shadow-lg shadow-[#00C2FF]/10 ring-1 ring-[#00C2FF]/20' : 'border-border'
              }`}>
                <div className="w-full h-40 rounded-xl bg-gradient-to-br from-[#00C2FF] to-[#2CB67D] mb-4 flex items-center justify-center">
                  <Briefcase className="w-12 h-12 text-white/50" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#00C2FF]/10 text-[#00C2FF]">Career</span>
                  {i === 1 && <span className="text-[10px] font-bold uppercase tracking-wider text-[#00C2FF]">Featured</span>}
                </div>
                <h3 className="font-heading font-semibold mt-3 mb-2">Tech Career Fair 2026</h3>
                <p className="text-sm text-muted-foreground mb-4">Connect with top tech companies</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Jun 5, 2026</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Entertainment Events Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-[#00C2FF]/5 to-[#FF6B9D]/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-2">Entertainment Events</h2>
              <p className="text-muted-foreground">Enjoy unforgettable experiences</p>
            </div>
            <Link to="/signup" className="flex items-center gap-2 text-[#FF6B9D] font-medium hover:underline">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`p-6 rounded-2xl bg-white/70 backdrop-blur-lg border transition-all hover:shadow-xl ${
                i === 2 ? 'border-[#FF6B9D] shadow-lg shadow-[#FF6B9D]/10 ring-1 ring-[#FF6B9D]/20' : 'border-border'
              }`}>
                <div className="w-full h-40 rounded-xl bg-gradient-to-br from-[#FF6B9D] to-[#7F5AF0] mb-4 flex items-center justify-center">
                  <Music className="w-12 h-12 text-white/50" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#FF6B9D]/10 text-[#FF6B9D]">Entertainment</span>
                  {i === 2 && <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6B9D]">Trending</span>}
                </div>
                <h3 className="font-heading font-semibold mt-3 mb-2">Jazz Night Live</h3>
                <p className="text-sm text-muted-foreground mb-4">An evening of smooth jazz</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>May 30, 2026</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-heading font-bold text-center mb-12">What Our Community Says</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Sarah Chen', role: 'Software Engineer', text: 'Found my dream job at a networking event!' },
              { name: 'Mike Johnson', role: 'Event Organizer', text: 'Best platform for managing tech conferences.' },
              { name: 'Emily Davis', role: 'Designer', text: 'The AI recommendations are spot on!' },
            ].map((testimonial, index) => (
              <div key={index} className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 fill-[#FFD60A] text-[#FFD60A]" />
                  ))}
                </div>
                <p className="text-sm mb-4">{testimonial.text}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7F5AF0] to-[#00C2FF]"></div>
                  <div>
                    <div className="font-medium">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-white/40 backdrop-blur-sm border-t border-border">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7F5AF0] via-[#00C2FF] to-[#2CB67D]"></div>
            <span className="text-xl font-heading font-semibold bg-gradient-to-r from-[#7F5AF0] via-[#00C2FF] to-[#2CB67D] bg-clip-text text-transparent">
              EventSphere AI
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Discover Events. Build Connections. Unlock Opportunities.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">About</a>
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Contact</a>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            © 2026 EventSphere AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
