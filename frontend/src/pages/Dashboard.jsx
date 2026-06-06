import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-12">
      {/* Background grid */}
      <div
        className="fixed inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
            <span
              className="text-xs font-semibold tracking-[0.25em] text-emerald-400 uppercase"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              VendorBridge
            </span>
          </div>
          <button
            onClick={logout}
            className="text-xs text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/40 rounded-lg px-3 py-1.5 transition-all duration-200"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            Sign out
          </button>
        </div>

        {/* Welcome card */}
        <div className="bg-slate-900 border border-slate-700/60 rounded-2xl overflow-hidden shadow-xl">
          <div className="h-1 bg-linear-to-r from-emerald-400 via-teal-400 to-cyan-400" />
          <div className="px-8 py-8">
            <p
              className="text-slate-400 text-sm mb-1"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              Hello,
            </p>
            <h1
              className="text-3xl font-bold text-white mb-6"
              style={{ fontFamily: "'Sora', sans-serif", letterSpacing: '-0.02em' }}
            >
              {user?.name || user?.email}
            </h1>

            <div className="grid grid-cols-2 gap-4">
              <InfoTile label="Organisation" value={user?.org?.name} />
              <InfoTile label="Type" value={user?.org?.type} accent />
              <InfoTile label="Email" value={user?.email} span />
              {user?.gstNumber && <InfoTile label="GST Number" value={user.gstNumber} span />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoTile = ({ label, value, accent = false, span = false }) => (
  <div
    className={`bg-slate-800/60 border border-slate-700/40 rounded-xl px-4 py-3 ${span ? 'col-span-2' : ''}`}
  >
    <p
      className="text-xs text-slate-500 mb-1 uppercase tracking-widest"
      style={{ fontFamily: "'DM Mono', monospace" }}
    >
      {label}
    </p>
    <p
      className={`text-sm font-semibold ${accent ? 'text-emerald-400' : 'text-white'}`}
      style={{ fontFamily: "'Sora', sans-serif" }}
    >
      {value || '—'}
    </p>
  </div>
);

export default Dashboard;
