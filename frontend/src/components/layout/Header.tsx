import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, ChevronDown, User } from 'lucide-react';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/assess': 'Health Assessment',
  '/msme': 'MSME Directory',
  '/register': 'Register MSME',
};

export default function Header() {
  const location = useLocation();
  const [searchValue, setSearchValue] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const getTitle = () => {
    if (location.pathname.startsWith('/msme/')) {
      const parts = location.pathname.split('/');
      if (parts.includes('health')) return 'Health Card View';
      return 'MSME Details';
    }
    return PAGE_TITLES[location.pathname] || 'MSME Health Card';
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
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center">
              3
            </span>
          </button>
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-4 space-y-3 animate-scale-in z-50">
              <h4 className="text-sm font-semibold text-slate-200">Notifications</h4>
              <div className="space-y-2">
                <div className="p-2 rounded-lg bg-slate-800/50 text-sm text-slate-300">
                  New assessment completed for GSTIN 27AABCU9603R1ZM
                </div>
                <div className="p-2 rounded-lg bg-slate-800/50 text-sm text-slate-300">
                  Credit recommendation generated for MSME #12
                </div>
                <div className="p-2 rounded-lg bg-slate-800/50 text-sm text-slate-300">
                  5 MSMEs moved to amber category this week
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <User size={16} className="text-emerald-400" />
            </div>
            <ChevronDown size={14} className="text-slate-500" />
          </button>
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 animate-scale-in z-50">
              <div className="px-3 py-2 text-sm text-slate-200 font-medium">Admin User</div>
              <div className="px-3 py-1.5 text-xs text-slate-500">admin@idbi.in</div>
              <hr className="my-2 border-slate-800" />
              <button className="w-full text-left px-3 py-2 text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors">
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
