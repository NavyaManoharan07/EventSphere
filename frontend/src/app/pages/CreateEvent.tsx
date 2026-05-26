import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Upload, Sparkles, Calendar, MapPin, DollarSign, Users } from 'lucide-react';
import { authPostJson } from '@/lib/api';

export function CreateEvent() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Career');
  const [eventType, setEventType] = useState('In-Person');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [venue, setVenue] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [capacity, setCapacity] = useState('100');
  const [price, setPrice] = useState('49');
  const [networkingEnabled, setNetworkingEnabled] = useState(false);
  const [communityEnabled, setCommunityEnabled] = useState(false);
  const [aiRecommendationsEnabled, setAiRecommendationsEnabled] = useState(false);
  const [tagsText, setTagsText] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const canContinue = () => {
    if (step === 1) {
      return title.trim() && description.trim();
    }
    if (step === 2) {
      return startDate && endDate && venue.trim() && city.trim() && country.trim();
    }
    if (step === 3) {
      return capacity.trim() !== '' && price.trim() !== '';
    }
    return true;
  };

  const goNext = () => {
    if (!canContinue()) {
      setError('Please complete all required fields for this step.');
      return;
    }
    setError('');
    setStep((current) => Math.min(current + 1, 4));
  };

  const goBack = () => {
    setError('');
    setStep((current) => Math.max(current - 1, 1));
  };

  const handlePublish = async () => {
    if (!title.trim() || !description.trim() || !startDate || !endDate || !venue.trim() || !capacity.trim() || !price.trim()) {
      setError('Please fill in all required fields before publishing.');
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      setError('Event end date must be after the start date.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authPostJson('/events', {
        title,
        description,
        category,
        eventType,
        venue: `${venue}, ${city}, ${country}`,
        startDate,
        endDate,
        capacity: Number(capacity),
        price: Number(price),
        networkingEnabled,
        communityEnabled,
        aiRecommendationsEnabled,
        tags: tagsText.split(',').map((tag) => tag.trim()).filter(Boolean),
      });
      navigate('/app/organiser');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create event');
    } finally {
      setLoading(false);
    }
  };

  const generateDescription = async () => {
    setError('');
    try {
      const data = await authPostJson<{ description: string; highlights: string[] }>('/events/ai/generate-description', {
        title,
        bullets: description || `${category} event\nNetworking\nUseful takeaways`,
      });
      setDescription(data.description);
      setAiSuggestions(data.highlights || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to generate description');
    }
  };

  const buildSchedule = async () => {
    setError('');
    try {
      const data = await authPostJson<{ suggestions: string[] }>('/events/ai/smart-schedule', {
        sessions: [
          { title: 'Opening Keynote' },
          { title: 'Networking Break' },
          { title: 'Hands-on Session' },
        ],
      });
      setAiSuggestions(data.suggestions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to build schedule');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-heading font-bold mb-2">Create Event</h1>
        <p className="text-muted-foreground">Share your event with the community</p>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Step {step} of 4</span>
          <span className="text-sm text-muted-foreground">{Math.round((step / 4) * 100)}%</span>
        </div>
        <div className="h-2 rounded-full bg-white/70 backdrop-blur-lg border border-border">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] transition-all duration-500"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {step >= 1 && (
          <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-heading font-semibold">Event Basics</h2>
              <button type="button" onClick={generateDescription} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white text-sm hover:shadow-lg transition-all">
                <Sparkles className="w-4 h-4" />
                Generate with AI
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Event Title</label>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  type="text"
                  placeholder="AI Summit 2026"
                  className="w-full px-4 py-3 rounded-xl bg-white/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={4}
                  placeholder="Tell people what your event is about..."
                  className="w-full px-4 py-3 rounded-xl bg-white/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option>Career</option>
                    <option>Entertainment</option>
                    <option>Technology</option>
                    <option>Business</option>
                    <option>Design</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Event Type</label>
                  <select
                    value={eventType}
                    onChange={(event) => setEventType(event.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option>In-Person</option>
                    <option>Virtual</option>
                    <option>Hybrid</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Event Tags</label>
                <input
                  value={tagsText}
                  onChange={(event) => setTagsText(event.target.value)}
                  placeholder="hackathon, startup, music, weekend"
                  className="w-full px-4 py-3 rounded-xl bg-white/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {aiSuggestions.length > 0 && (
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-sm text-muted-foreground">
                  {aiSuggestions.map((item) => <div key={item}>• {item}</div>)}
                </div>
              )}

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
                      value={startDate}
                      onChange={(event) => setStartDate(event.target.value)}
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
                      value={endDate}
                      onChange={(event) => setEndDate(event.target.value)}
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
                    value={venue}
                    onChange={(event) => setVenue(event.target.value)}
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
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    type="text"
                    placeholder="San Francisco"
                    className="w-full px-4 py-3 rounded-xl bg-white/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">State/Country</label>
                  <input
                    value={country}
                    onChange={(event) => setCountry(event.target.value)}
                    type="text"
                    placeholder="California, USA"
                    className="w-full px-4 py-3 rounded-xl bg-white/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {step >= 3 && (
          <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-heading font-semibold">Ticket Setup</h2>
              <button type="button" onClick={buildSchedule} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white text-sm hover:shadow-lg transition-all">
                <Sparkles className="w-4 h-4" />
                Smart Schedule
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Ticket Price</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                    type="number"
                    min="0"
                    placeholder="49"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Capacity</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    value={capacity}
                    onChange={(event) => setCapacity(event.target.value)}
                    type="number"
                    min="1"
                    placeholder="100"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {step >= 4 && (
          <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
            <h2 className="text-xl font-heading font-semibold mb-6">Event Features</h2>

            <div className="space-y-4">
              <label className="flex items-center gap-3 p-4 rounded-xl bg-white/50 border border-border cursor-pointer hover:bg-white/80 transition-all">
                <input
                  type="checkbox"
                  className="rounded"
                  checked={networkingEnabled}
                  onChange={(event) => setNetworkingEnabled(event.target.checked)}
                />
                <div className="flex-1">
                  <div className="font-medium">Enable Networking</div>
                  <div className="text-sm text-muted-foreground">Allow attendees to connect with each other</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 rounded-xl bg-white/50 border border-border cursor-pointer hover:bg-white/80 transition-all">
                <input
                  type="checkbox"
                  className="rounded"
                  checked={communityEnabled}
                  onChange={(event) => setCommunityEnabled(event.target.checked)}
                />
                <div className="flex-1">
                  <div className="font-medium">Create Community Space</div>
                  <div className="text-sm text-muted-foreground">Dedicated discussion area for attendees</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 rounded-xl bg-white/50 border border-border cursor-pointer hover:bg-white/80 transition-all">
                <input
                  type="checkbox"
                  className="rounded"
                  checked={aiRecommendationsEnabled}
                  onChange={(event) => setAiRecommendationsEnabled(event.target.checked)}
                />
                <div className="flex-1">
                  <div className="font-medium">Enable AI Recommendations</div>
                  <div className="text-sm text-muted-foreground">Help attendees discover relevant connections</div>
                </div>
              </label>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={goBack}
          disabled={step === 1}
          className="px-6 py-3 rounded-xl bg-white/70 border border-border text-sm hover:bg-white/90 transition-all disabled:opacity-50"
        >
          Back
        </button>
        {step < 4 ? (
          <button
            type="button"
            onClick={goNext}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white text-sm hover:shadow-xl transition-all"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={handlePublish}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white text-sm hover:shadow-xl transition-all"
            disabled={loading}
          >
            {loading ? 'Publishing...' : 'Publish Event'}
          </button>
        )}
      </div>
    </div>
  );
}
