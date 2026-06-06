import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      {/* Background grid */}
      <div
        className="fixed inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Glow accent */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header stripe */}
          <div className="h-1 bg-linear-to-r from-emerald-400 via-teal-400 to-cyan-400" />

          <div className="px-8 pt-8 pb-10">
            {/* Brand */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
                <span
                  className="text-xs font-semibold tracking-[0.25em] text-emerald-400 uppercase"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  VendorBridge
                </span>
              </div>
              <h1
                className="text-3xl font-bold text-white mt-2"
                style={{ fontFamily: "'Sora', sans-serif", letterSpacing: '-0.02em' }}
              >
                Welcome back
              </h1>
              <p className="text-slate-400 text-sm mt-1">Sign in to your organisation.</p>
            </div>

            {error && (
              <div className="mb-5 flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                <span className="text-red-400 text-lg leading-none mt-0.5">✕</span>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label
                  className="block text-xs font-medium text-slate-400 mb-1.5 tracking-wide uppercase"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  Email
                </label>
                <input
                  type="email"
                  placeholder="tony@stark.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 transition"
                  style={{ fontFamily: "'Sora', sans-serif" }}
                />
              </div>

              {/* Password */}
              <div>
                <label
                  className="block text-xs font-medium text-slate-400 mb-1.5 tracking-wide uppercase"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 transition"
                  style={{ fontFamily: "'Sora', sans-serif" }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-semibold rounded-lg py-2.5 text-sm transition-all duration-200 tracking-wide"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            <p
              className="mt-6 text-center text-slate-500 text-sm"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
              >
                Create organisation
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
