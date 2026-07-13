import { useState, useEffect } from 'react';
import { Users, Shield, ShieldCheck, UserCheck, Loader2, Ban, CheckCircle } from 'lucide-react';
import type { User } from '../types';
import * as api from '../api/client';
import { formatDate } from '../lib/utils';

const ROLE_BADGES: Record<string, { label: string; icon: typeof Shield; colors: string }> = {
  admin: { label: 'Admin', icon: ShieldCheck, colors: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  officer: { label: 'Officer', icon: Shield, colors: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  msme_owner: { label: 'MSME Owner', icon: UserCheck, colors: 'bg-slate-500/10 text-slate-400 border-slate-500/30' },
};

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (user: User) => {
    setActionLoading(user.id);
    try {
      await api.deactivateUser(user.id);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_active: !u.is_active } : u))
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-emerald-500" />
        <span className="ml-3 text-sm text-slate-400">Loading users...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Users size={20} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">User Management</h1>
            <p className="text-xs text-slate-500">{users.length} registered users</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-sm text-rose-400">
          {error}
          <button onClick={() => setError('')} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 border-b border-slate-800 bg-slate-900/50">
                <th className="text-left px-6 py-3 font-medium">Name</th>
                <th className="text-left px-6 py-3 font-medium">Email</th>
                <th className="text-left px-6 py-3 font-medium">Role</th>
                <th className="text-left px-6 py-3 font-medium">Status</th>
                <th className="text-left px-6 py-3 font-medium">Joined</th>
                <th className="text-right px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const role = ROLE_BADGES[u.role] || ROLE_BADGES.msme_owner;
                const RoleIcon = role.icon;
                return (
                  <tr key={u.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-medium text-emerald-400">
                            {u.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-slate-200 font-medium text-xs">{u.full_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-slate-400 text-xs">{u.email}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${role.colors}`}>
                        <RoleIcon size={11} className="mr-1" />
                        {role.label}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      {u.is_active ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-slate-500 text-xs">{formatDate(u.created_at)}</td>
                    <td className="px-6 py-3 text-right">
                      <button
                        onClick={() => handleDeactivate(u)}
                        disabled={actionLoading === u.id || u.role === 'admin'}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 disabled:opacity-50 ${
                          u.is_active
                            ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
                        }`}
                      >
                        {actionLoading === u.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : u.is_active ? (
                          <Ban size={12} />
                        ) : (
                          <CheckCircle size={12} />
                        )}
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
