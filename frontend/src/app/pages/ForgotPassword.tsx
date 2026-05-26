import { Link } from 'react-router';
import { Mail, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { postJson } from '@/lib/api';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState(new URLSearchParams(window.location.search).get('token') || '');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const requestReset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const data = await postJson<{ message: string; devToken?: string }>('/auth/forgot-password', { email });
      setMessage(data.devToken ? `${data.message} Dev token: ${data.devToken}` : data.message);
      if (data.devToken) setToken(data.devToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to request password reset');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const data = await postJson<{ message: string }>('/auth/reset-password', { token, password });
      setMessage(data.message);
      setPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-[#F8FAFC] to-[#E0E7FF] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-[#7F5AF0]/5 via-transparent to-[#00C2FF]/5"></div>

      <div className="relative w-full max-w-md">
        <div className="absolute inset-0 bg-gradient-to-r from-[#7F5AF0]/20 to-[#00C2FF]/20 rounded-3xl blur-2xl"></div>

        <div className="relative p-8 rounded-3xl bg-white/70 backdrop-blur-xl border border-border shadow-2xl">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>

          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#7F5AF0] to-[#00C2FF] flex items-center justify-center">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-heading font-bold mb-2">Forgot Password?</h1>
            <p className="text-muted-foreground">
              No worries, we'll send you reset instructions
            </p>
          </div>

          {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          {message && <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{message}</div>}

          {!token ? (
          <form onSubmit={requestReset} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/50 backdrop-blur border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white font-medium hover:shadow-xl hover:shadow-primary/30 transition-all"
            >
              {loading ? 'Sending...' : 'Reset Password'}
            </button>
          </form>
          ) : (
          <form onSubmit={resetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Reset Token</label>
              <input
                value={token}
                onChange={(event) => setToken(event.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">New Password</label>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                placeholder="At least 6 characters"
                className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-[#7F5AF0] to-[#00C2FF] text-white font-medium hover:shadow-xl hover:shadow-primary/30 transition-all"
            >
              {loading ? 'Updating...' : 'Set New Password'}
            </button>
          </form>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Remember your password?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
