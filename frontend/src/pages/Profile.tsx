import { useState } from 'react';
import { User, Mail, Phone, Shield, Calendar, Key, Loader2, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../lib/utils';

const ROLE_LABELS: Record<string, { label: string; badge: string }> = {
  admin: { label: 'Administrator', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  officer: { label: 'Loan Officer', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  msme_owner: { label: 'MSME Owner', badge: 'bg-slate-500/10 text-slate-400 border-slate-500/30' },
};

export default function Profile() {
  const { user, updateProfile, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  const [profileForm, setProfileForm] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', confirmPassword: '' });
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState({ type: '', text: '' });

  if (!user) return null;

  const role = ROLE_LABELS[user.role] || ROLE_LABELS.msme_owner;

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg({ type: '', text: '' });
    try {
      await updateProfile({
        full_name: profileForm.full_name,
        phone: profileForm.phone || undefined,
      });
      setProfileMsg({ type: 'success', text: 'Profile updated successfully' });
    } catch (err: unknown) {
      setProfileMsg({ type: 'error', text: err instanceof Error ? err.message : 'Update failed' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwErrors({});
    setPwMsg({ type: '', text: '' });
    const errs: Record<string, string> = {};
    if (!pwForm.old_password) errs.old_password = 'Current password is required';
    if (!pwForm.new_password) errs.new_password = 'New password is required';
    else if (pwForm.new_password.length < 6) errs.new_password = 'Min. 6 characters';
    if (pwForm.new_password !== pwForm.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (Object.keys(errs).length > 0) { setPwErrors(errs); return; }

    setPwLoading(true);
    try {
      await changePassword({ old_password: pwForm.old_password, new_password: pwForm.new_password });
      setPwMsg({ type: 'success', text: 'Password changed successfully' });
      setPwForm({ old_password: '', new_password: '', confirmPassword: '' });
    } catch (err: unknown) {
      setPwMsg({ type: 'error', text: err instanceof Error ? err.message : 'Change failed' });
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-6">
        <div className="flex items-start gap-5">
          <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <User size={28} className="text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-slate-100">{user.full_name}</h1>
            <p className="text-sm text-slate-500 mt-0.5">{user.email}</p>
            <div className="flex items-center gap-3 mt-3">
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${role.badge}`}>
                <Shield size={12} className="mr-1" />
                {role.label}
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Calendar size={12} />
                Joined {formatDate(user.created_at)}
              </span>
              {user.last_login && (
                <span className="text-xs text-slate-500">
                  Last login: {formatDate(user.last_login)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-1 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'profile'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          <User size={14} className="inline mr-2" />
          Edit Profile
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'password'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          <Key size={14} className="inline mr-2" />
          Change Password
        </button>
      </div>

      {activeTab === 'profile' && (
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-6 animate-fade-in">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">Profile Information</h3>
          {profileMsg.text && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              profileMsg.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
            }`}>
              {profileMsg.type === 'success' && <Check size={14} className="inline mr-1" />}
              {profileMsg.text}
            </div>
          )}
          <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={profileForm.full_name}
                  onChange={(e) => setProfileForm((p) => ({ ...p, full_name: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-800/30 border border-slate-700/50 text-sm text-slate-500 cursor-not-allowed"
                />
              </div>
              <p className="mt-1 text-xs text-slate-600">Email cannot be changed</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="9876543210"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={profileLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-all duration-200 disabled:opacity-50 shadow-lg shadow-emerald-500/20"
            >
              {profileLoading ? <Loader2 size={14} className="animate-spin" /> : null}
              {profileLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'password' && (
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-6 animate-fade-in">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">Change Password</h3>
          {pwMsg.text && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              pwMsg.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
            }`}>
              {pwMsg.type === 'success' && <Check size={14} className="inline mr-1" />}
              {pwMsg.text}
            </div>
          )}
          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Current Password</label>
              <div className="relative">
                <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  value={pwForm.old_password}
                  onChange={(e) => setPwForm((p) => ({ ...p, old_password: e.target.value }))}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-800/50 border text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors ${pwErrors.old_password ? 'border-rose-500' : 'border-slate-700'}`}
                />
              </div>
              {pwErrors.old_password && <p className="mt-1 text-xs text-rose-400">{pwErrors.old_password}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">New Password</label>
              <div className="relative">
                <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  value={pwForm.new_password}
                  onChange={(e) => setPwForm((p) => ({ ...p, new_password: e.target.value }))}
                  placeholder="Min. 6 characters"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-800/50 border text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors ${pwErrors.new_password ? 'border-rose-500' : 'border-slate-700'}`}
                />
              </div>
              {pwErrors.new_password && <p className="mt-1 text-xs text-rose-400">{pwErrors.new_password}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm New Password</label>
              <div className="relative">
                <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  value={pwForm.confirmPassword}
                  onChange={(e) => setPwForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-800/50 border text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors ${pwErrors.confirmPassword ? 'border-rose-500' : 'border-slate-700'}`}
                />
              </div>
              {pwErrors.confirmPassword && <p className="mt-1 text-xs text-rose-400">{pwErrors.confirmPassword}</p>}
            </div>
            <button
              type="submit"
              disabled={pwLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-all duration-200 disabled:opacity-50 shadow-lg shadow-emerald-500/20"
            >
              {pwLoading ? <Loader2 size={14} className="animate-spin" /> : null}
              {pwLoading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
