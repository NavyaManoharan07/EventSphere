import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Upload, Sparkles, Calendar, MapPin, DollarSign, Users } from 'lucide-react';

export function CreateEvent() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const handlePublish = () => {
    navigate('/app/organiser');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-heading font-bold mb-2">Create Event</h1>
        <p className="text-muted-foreground">Share your event with the community</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Step {step} of 4</span>
          <span className="text-sm text-muted-foreground">{Math.round((step / 4) * 100)}%</span>
        </div>
        <div className="h-2 rounded-full bg-white/70 backdrop-blur-lg border border-border">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] transition-all duration-500"
            style={{ width: `${(step / 4) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Step 1: Event Basics */}
        {step >= 1 && (
          <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-heading font-semibold">Event Basics</h2>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white text-sm hover:shadow-lg transition-all">
                <Sparkles className="w-4 h-4" />
                Generate with AI
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Event Title</label>
                <input
                  type="text"
                  placeholder="AI Summit 2026"
                  className="w-full px-4 py-3 rounded-xl bg-white/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  rows={4}
                  placeholder="Tell people what your event is about..."
                  className="w-full px-4 py-3 rounded-xl bg-white/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select className="w-full px-4 py-3 rounded-xl bg-white/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <option>Career</option>
                    <option>Entertainment</option>
                    <option>Technology</option>
                    <option>Business</option>
                    <option>Design</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Event Type</label>
                  <select className="w-full px-4 py-3 rounded-xl bg-white/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <option>In-Person</option>
                    <option>Virtual</option>
                    <option>Hybrid</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Event Banner</label>
                <div className="relative">
                  <input type="file" className="hidden" id="banner-upload" />
                  <label
                    htmlFor="banner-upload"
                    className="block w-full h-48 rounded-xl bg-white/50 border-2 border-dashed border-border hover:bg-white/80 transition-all cursor-pointer"
                  >
                    <div className="h-full flex flex-col items-center justify-center">
                      <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Click to upload banner image</p>
                      <p className="text-xs text-muted-foreground mt-1">Recommended: 1920x1080px</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Date & Location */}
        {step >= 2 && (
          <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
            <h2 className="text-xl font-heading font-semibold mb-6">Date & Location</h2>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Start Date & Time</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="datetime-local"
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">End Date & Time</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="datetime-local"
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Venue Name</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Moscone Center"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">City</label>
                  <input
                    type="text"
                    placeholder="San Francisco"
                    className="w-full px-4 py-3 rounded-xl bg-white/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">State/Country</label>
                  <input
                    type="text"
                    placeholder="California, USA"
                    className="w-full px-4 py-3 rounded-xl bg-white/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Tickets */}
        {step >= 3 && (
          <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-heading font-semibold">Ticket Tiers</h2>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white text-sm hover:shadow-lg transition-all">
                <Sparkles className="w-4 h-4" />
                Smart Pricing
              </button>
            </div>

            <div className="space-y-4">
              {[
                { name: 'Early Bird', price: 49, capacity: 50 },
                { name: 'General Admission', price: 79, capacity: 200 },
              ].map((tier, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/50 border border-border">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Tier Name</label>
                      <input
                        type="text"
                        defaultValue={tier.name}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Price</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                          type="number"
                          defaultValue={tier.price}
                          className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Capacity</label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                          type="number"
                          defaultValue={tier.capacity}
                          className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button className="w-full px-4 py-3 rounded-xl bg-white/50 border border-dashed border-border hover:bg-white/80 transition-all">
                + Add Tier
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Features */}
        {step >= 4 && (
          <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
            <h2 className="text-xl font-heading font-semibold mb-6">Event Features</h2>

            <div className="space-y-4">
              <label className="flex items-center gap-3 p-4 rounded-xl bg-white/50 border border-border cursor-pointer hover:bg-white/80 transition-all">
                <input type="checkbox" className="rounded" />
                <div className="flex-1">
                  <div className="font-medium">Enable Networking</div>
                  <div className="text-sm text-muted-foreground">Allow attendees to connect with each other</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 rounded-xl bg-white/50 border border-border cursor-pointer hover:bg-white/80 transition-all">
                <input type="checkbox" className="rounded" />
                <div className="flex-1">
                  <div className="font-medium">Create Community Space</div>
                  <div className="text-sm text-muted-foreground">Dedicated discussion area for attendees</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 rounded-xl bg-white/50 border border-border cursor-pointer hover:bg-white/80 transition-all">
                <input type="checkbox" className="rounded" />
                <div className="flex-1">
                  <div className="font-medium">Enable AI Recommendations</div>
                  <div className="text-sm text-muted-foreground">Help attendees discover relevant connections</div>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-3 rounded-xl bg-white/70 backdrop-blur-lg border border-border hover:bg-white/90 transition-all"
            >
              Back
            </button>
          ) : (
            <div></div>
          )}

          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white font-medium hover:shadow-xl hover:shadow-primary/30 transition-all"
            >
              Continue
            </button>
          ) : (
            <div className="flex gap-3">
              <button className="px-6 py-3 rounded-xl bg-white/70 backdrop-blur-lg border border-border hover:bg-white/90 transition-all">
                Preview Event
              </button>
              <button
                onClick={handlePublish}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white font-medium hover:shadow-xl hover:shadow-primary/30 transition-all"
              >
                Publish Event
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
