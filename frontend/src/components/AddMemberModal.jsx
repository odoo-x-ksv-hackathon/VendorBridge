import { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import api from '../lib/axios';

const ROLES = ['PROCUREMENT_OFFICER', 'MANAGER', 'ADMIN'];

export default function AddMemberModal({ onClose }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'PROCUREMENT_OFFICER' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setError(null);
    try {
      await api.post('/auth/add-member', form);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add member.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <UserPlus size={16} className="text-blue-500" />
            <h2 className="font-bold text-gray-900 text-sm">Add Team Member</h2>
          </div>
          <button onClick={onClose}><X size={18} className="text-gray-400 hover:text-gray-600" /></button>
        </div>

        {success ? (
          <div className="p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto">
              <UserPlus size={22} className="text-green-500" />
            </div>
            <p className="text-sm font-semibold text-gray-800">Member added successfully!</p>
            <p className="text-xs text-gray-500">They will receive a welcome email with login instructions.</p>
            <div className="flex gap-2 justify-center pt-1">
              <button onClick={() => { setSuccess(false); setForm({ name: '', email: '', password: '', role: 'PROCUREMENT_OFFICER' }); }}
                className="px-4 py-2 text-xs font-semibold border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                Add Another
              </button>
              <button onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-white rounded-lg"
                style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)' }}>
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {[['name', 'Full Name', 'text'], ['email', 'Email', 'email'], ['password', 'Password', 'password']].map(([field, label, type]) => (
              <div key={field}>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
                <input type={type} value={form[field]} required
                  onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Role</label>
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white transition-all">
                {ROLES.map(r => (
                  <option key={r} value={r}>{r.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex gap-3 pt-1">
              <button type="submit" disabled={submitting}
                className="flex-1 py-2.5 text-sm font-semibold text-white rounded-lg disabled:opacity-60 transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)' }}>
                {submitting ? 'Adding...' : 'Add Member'}
              </button>
              <button type="button" onClick={onClose}
                className="px-4 py-2.5 text-sm font-semibold border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
