import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import confetti from 'canvas-confetti';
import { CreditCard, Lock, Check } from 'lucide-react';
import useRazorpay from "react-razorpay";
import { authPostJson, getJson } from '@/lib/api';

export function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [Razorpay] = useRazorpay();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [event, setEvent] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadEvent = async () => {
      if (!id) return;
      try {
        const data = await getJson(`/events/${id}`);
        setEvent(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load event');
      }
    };

    loadEvent();
  }, [id]);

  const handlePayment = async () => {
    if (!id || !event) {
      setError('Missing event information.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Create Razorpay Order
      const order = await authPostJson(`/events/${id}/create-order`, {});
      
      const options = {
        key: "rzp_test_StonSOA2AB0Ncq", // In production this should be an env var
        amount: order.amount,
        currency: order.currency,
        name: "EventSphere",
        description: `Ticket for ${event.title}`,
        order_id: order.id,
        handler: async (response: any) => {
          try {
            setLoading(true);
            // 2. Verify Payment
            await authPostJson("/events/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              eventId: id,
            });

            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            setStep(2);
            setTimeout(() => {
              navigate('/app/tickets');
            }, 3000);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Payment verification failed');
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: "", // Can be filled if user info is available
          email: "",
          contact: "",
        },
        theme: {
          color: "#7F5AF0",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setError(response.error.description);
      });
      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  if (step === 2) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center p-12 rounded-3xl bg-white/70 backdrop-blur-lg border border-border">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#2CB67D] to-[#00C2FF] flex items-center justify-center">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-heading font-bold mb-4">Payment Successful!</h1>
          <p className="text-muted-foreground mb-6">Your ticket has been confirmed. Redirecting to tickets...</p>
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
            Redirecting...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-heading font-bold mb-2">Checkout</h1>
        <p className="text-muted-foreground">Complete your purchase</p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
            <h2 className="text-xl font-heading font-semibold mb-4">Contact Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">First Name</label>
                <input
                  type="text"
                  placeholder="John"
                  className="w-full px-4 py-3 rounded-xl bg-white/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Last Name</label>
                <input
                  type="text"
                  placeholder="Doe"
                  className="w-full px-4 py-3 rounded-xl bg-white/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-white/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
            <h2 className="text-xl font-heading font-semibold mb-4">Payment Method</h2>
            <div className="space-y-4 mb-6">
              <button className="w-full p-4 rounded-xl border-2 border-primary bg-primary/5 flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-primary" />
                <span className="font-medium">Credit / Debit Card</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Card Number</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="4242 4242 4242 4242"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Expiry Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full px-4 py-3 rounded-xl bg-white/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">CVC</label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full px-4 py-3 rounded-xl bg-white/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="w-4 h-4" />
            <span>Your payment information is secure and encrypted</span>
          </div>
        </div>

        <div className="lg:sticky lg:top-24 h-fit">
          <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-border">
            <h2 className="text-xl font-heading font-semibold mb-4">Order Summary</h2>
            <div className="mb-6 pb-6 border-b border-border">
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[#7F5AF0] to-[#00C2FF] flex-shrink-0"></div>
                <div>
                  <h3 className="font-heading font-semibold mb-1">{event?.title ?? 'Selected Event'}</h3>
                  <p className="text-sm text-muted-foreground">{event?.startDate ? new Date(event.startDate).toLocaleDateString() : 'TBD'}</p>
                  <p className="text-sm text-muted-foreground">General Admission × 1</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Ticket Price</span>
                <span>${event?.price ?? '0.00'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Service Fee</span>
                <span>$5.00</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>$6.72</span>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6 py-4 border-t border-border">
              <span className="font-heading font-semibold">Total</span>
              <span className="text-2xl font-heading font-bold">${event ? Number(event.price) + 11.72 : '0.00'}</span>
            </div>

            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white font-medium hover:shadow-xl hover:shadow-primary/30 transition-all disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Complete Purchase'}
            </button>

            <p className="mt-4 text-xs text-center text-muted-foreground">By completing this purchase, you agree to our terms and conditions</p>
          </div>
        </div>
      </div>
    </div>
  );
}
