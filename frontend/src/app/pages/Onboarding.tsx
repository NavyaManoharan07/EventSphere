import { useState } from 'react';
import { Link } from 'react-router';
import { Sparkles, Briefcase, Music, Check } from 'lucide-react';

export function Onboarding() {
  const [step, setStep] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [eventType, setEventType] = useState<string>('');

  const interests = [
    'Technology', 'Business', 'Marketing', 'Design', 'Music', 'Art',
    'Sports', 'Food & Drink', 'Health & Wellness', 'Education', 'Gaming', 'Fashion'
  ];

  const goals = [
    'Find a job', 'Grow my network', 'Learn new skills', 'Find collaborators',
    'Meet new people', 'Discover events', 'Have fun', 'Build my career'
  ];

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const toggleGoal = (goal: string) => {
    setSelectedGoals(prev =>
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-[#F8FAFC] to-[#E0E7FF] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-[#7F5AF0]/5 via-transparent to-[#00C2FF]/5"></div>

      <div className="relative w-full max-w-3xl">
        <div className="absolute inset-0 bg-gradient-to-r from-[#7F5AF0]/20 to-[#00C2FF]/20 rounded-3xl blur-2xl"></div>

        <div className="relative p-8 rounded-3xl bg-white/70 backdrop-blur-xl border border-border shadow-2xl">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7F5AF0] via-[#00C2FF] to-[#2CB67D]"></div>
            <span className="text-2xl font-heading font-semibold bg-gradient-to-r from-[#7F5AF0] via-[#00C2FF] to-[#2CB67D] bg-clip-text text-transparent">
              EventSphere AI
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Step {step} of 4</span>
              <span className="text-sm text-muted-foreground">{Math.round((step / 4) * 100)}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/50">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] transition-all duration-500"
                style={{ width: `${(step / 4) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Step 1: Select Interests */}
          {step === 1 && (
            <div>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-heading font-bold mb-2">What are your interests?</h1>
                <p className="text-muted-foreground">Select topics you're passionate about</p>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-8">
                {interests.map(interest => (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`px-4 py-3 rounded-xl border transition-all ${
                      selectedInterests.includes(interest)
                        ? 'bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white border-transparent shadow-lg'
                        : 'bg-white/50 border-border hover:bg-white/80'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Select Goals */}
          {step === 2 && (
            <div>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-heading font-bold mb-2">What are your goals?</h1>
                <p className="text-muted-foreground">Help us personalize your experience</p>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {goals.map(goal => (
                  <button
                    key={goal}
                    onClick={() => toggleGoal(goal)}
                    className={`px-4 py-3 rounded-xl border transition-all ${
                      selectedGoals.includes(goal)
                        ? 'bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white border-transparent shadow-lg'
                        : 'bg-white/50 border-border hover:bg-white/80'
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Enable Networking */}
          {step === 3 && (
            <div>
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#2CB67D] to-[#00C2FF] flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-heading font-bold mb-2">Enable AI Networking</h1>
                <p className="text-muted-foreground">
                  Let our AI match you with people who share your interests and goals
                </p>
              </div>
              <div className="space-y-4 mb-8">
                <div className="p-4 rounded-xl bg-white/50 border border-border">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#2CB67D] mt-0.5" />
                    <div>
                      <h3 className="font-medium mb-1">Smart Recommendations</h3>
                      <p className="text-sm text-muted-foreground">
                        Get matched with relevant professionals and potential collaborators
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-white/50 border border-border">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#2CB67D] mt-0.5" />
                    <div>
                      <h3 className="font-medium mb-1">Event Connections</h3>
                      <p className="text-sm text-muted-foreground">
                        See who's attending events you're interested in
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-white/50 border border-border">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#2CB67D] mt-0.5" />
                    <div>
                      <h3 className="font-medium mb-1">Privacy First</h3>
                      <p className="text-sm text-muted-foreground">
                        You control what information you share
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Choose Event Type */}
          {step === 4 && (
            <div>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-heading font-bold mb-2">What brings you here?</h1>
                <p className="text-muted-foreground">Choose your primary interest</p>
              </div>
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <button
                  onClick={() => setEventType('career')}
                  className={`p-6 rounded-2xl border transition-all ${
                    eventType === 'career'
                      ? 'bg-gradient-to-br from-[#00C2FF] to-[#2CB67D] text-white border-transparent shadow-xl'
                      : 'bg-white/50 border-border hover:bg-white/80'
                  }`}
                >
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${
                    eventType === 'career' ? 'bg-white/20' : 'bg-[#00C2FF]/10'
                  }`}>
                    <Briefcase className={`w-6 h-6 ${eventType === 'career' ? 'text-white' : 'text-[#00C2FF]'}`} />
                  </div>
                  <h3 className="font-heading font-semibold mb-2">Career</h3>
                  <p className={`text-sm ${eventType === 'career' ? 'text-white/80' : 'text-muted-foreground'}`}>
                    Professional growth and networking
                  </p>
                </button>

                <button
                  onClick={() => setEventType('entertainment')}
                  className={`p-6 rounded-2xl border transition-all ${
                    eventType === 'entertainment'
                      ? 'bg-gradient-to-br from-[#FF6B9D] to-[#7F5AF0] text-white border-transparent shadow-xl'
                      : 'bg-white/50 border-border hover:bg-white/80'
                  }`}
                >
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${
                    eventType === 'entertainment' ? 'bg-white/20' : 'bg-[#FF6B9D]/10'
                  }`}>
                    <Music className={`w-6 h-6 ${eventType === 'entertainment' ? 'text-white' : 'text-[#FF6B9D]'}`} />
                  </div>
                  <h3 className="font-heading font-semibold mb-2">Entertainment</h3>
                  <p className={`text-sm ${eventType === 'entertainment' ? 'text-white/80' : 'text-muted-foreground'}`}>
                    Fun experiences and social events
                  </p>
                </button>

                <button
                  onClick={() => setEventType('both')}
                  className={`p-6 rounded-2xl border transition-all ${
                    eventType === 'both'
                      ? 'bg-gradient-to-br from-[#7F5AF0] via-[#00C2FF] to-[#2CB67D] text-white border-transparent shadow-xl'
                      : 'bg-white/50 border-border hover:bg-white/80'
                  }`}
                >
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${
                    eventType === 'both' ? 'bg-white/20' : 'bg-[#7F5AF0]/10'
                  }`}>
                    <Sparkles className={`w-6 h-6 ${eventType === 'both' ? 'text-white' : 'text-[#7F5AF0]'}`} />
                  </div>
                  <h3 className="font-heading font-semibold mb-2">Both</h3>
                  <p className={`text-sm ${eventType === 'both' ? 'text-white/80' : 'text-muted-foreground'}`}>
                    The best of both worlds
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 rounded-xl bg-white/50 border border-border hover:bg-white/80 transition-all"
              >
                Back
              </button>
            ) : (
              <Link
                to="/login"
                className="px-6 py-3 rounded-xl bg-white/50 border border-border hover:bg-white/80 transition-all"
              >
                Skip
              </Link>
            )}

            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white hover:shadow-xl hover:shadow-primary/30 transition-all"
              >
                Continue
              </button>
            ) : (
              <Link
                to="/app"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white hover:shadow-xl hover:shadow-primary/30 transition-all"
              >
                Finish Setup
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
