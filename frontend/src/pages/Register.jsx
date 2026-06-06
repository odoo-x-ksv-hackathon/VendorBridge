import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const ORG_TYPES = ['BUYER', 'SELLER'];

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    orgName: '',
    type: 'BUYER',
    gstNumber: '',
    userName: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }} className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
            style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)' }}>VB</div>
          <span className="font-bold text-gray-900 text-sm tracking-tight">VendorBridge</span>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="h-1" style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)' }} />
          <div className="px-7 pt-7 pb-8">
            <h1 className="text-xl font-bold text-gray-900 leading-tight">Create Organisation</h1>
            <p className="text-xs text-gray-500 mt-1">Set up your organisation account to get started.</p>

            {error && (
              <div className="mt-4 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Organisation Name" name="orgName" placeholder="Stark Industries" value={form.orgName} onChange={handleChange} required />
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Type</label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                  >
                    {ORG_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <Field label="GST Number" name="gstNumber" placeholder="22AAAAA0000A1Z5" value={form.gstNumber} onChange={handleChange} required />
              <Field label="Your Name" name="userName" placeholder="Tony Stark" value={form.userName} onChange={handleChange} required />
              <Field label="Email" name="email" type="email" placeholder="tony@stark.com" value={form.email} onChange={handleChange} required />
              <Field label="Password" name="password" type="password" placeholder="••••••••••" value={form.password} onChange={handleChange} required />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 text-sm font-semibold text-white rounded-lg disabled:opacity-60 transition-all hover:opacity-90 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)' }}
              >
                {loading ? 'Creating Organisation…' : 'Create Organisation'}
              </button>
            </form>

            <p className="mt-5 text-center text-xs text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, name, type = 'text', placeholder, value, onChange, required }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
    />
  </div>
);

export default Register;
