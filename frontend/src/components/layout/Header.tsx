import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronDown, User, LogOut, UserCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../api/client';
import NotificationPanel from '../notifications/NotificationPanel';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/assess': 'Health Assessment',
  '/msme': 'MSME Directory',
  '/register': 'Register MSME',
  '/analytics': 'Analytics',
  '/profile': 'Profile',
  '/users': 'User Management',
};

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchValue, setSearchValue] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnread = useCallback(async () => {
    try {
      const res = await api.getUnreadCount();
      setUnreadCount(res.count);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  const getTitle = () => {
    if (location.pathname.startsWith('/msme/')) {
      const parts = location.pathname.split('/');
      if (parts.includes('health')) return 'Health Card View';
      return 'MSME Details';
    }
    return PAGE_TITLES[location.pathname] || 'MSME Health Card';
  };

  const roleLabel: Record<string, string> = {
    admin: 'Administrator',
    officer: 'Loan Officer',
    msme_owner: 'MSME Owner',
  };

  return (
    <header className="h-16 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-30">
      <h2 className="text-lg font-semibold text-slate-100">{getTitle()}</h2>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search GST, name..."
            className="w-64 pl-9 pr-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
          />
        </div>

        <div className="relative">
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
            className="relative p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <NotificationPanel
            open={showNotifications}
            onClose={() => setShowNotifications(false)}
            onUnreadChange={setUnreadCount}
          />
        </div>

        <div className="relative">
          <button
            onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <User size={16} className="text-emerald-400" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-medium text-slate-200 leading-tight">{user?.full_name || 'User'}</p>
              <p className="text-[10px] text-slate-500 leading-tight">{roleLabel[user?.role || 'msme_owner']}</p>
            </div>
            <ChevronDown size={14} className="text-slate-500" />
          </button>
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-52 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 animate-scale-in z-50">
              <div className="px-3 py-2 text-sm text-slate-200 font-medium">{user?.full_name}</div>
              <div className="px-3 py-1.5 text-xs text-slate-500">{user?.email}</div>
              <hr className="my-2 border-slate-800" />
              <button
                onClick={() => { setShowUserMenu(false); navigate('/profile'); }}
                className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <UserCircle size={14} />
                Profile
              </button>
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
