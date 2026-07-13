import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Stethoscope,
  Building2,
  UserPlus,
  Shield,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/assess', icon: Stethoscope, label: 'Health Assessment' },
  { to: '/msme', icon: Building2, label: 'MSME Directory' },
  { to: '/register', icon: UserPlus, label: 'Register MSME' },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-slate-950 border-r border-slate-800/50 flex flex-col z-40">
      <div className="p-6 border-b border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <Shield size={20} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100">MSME Health</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Financial Card</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              )
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800/50">
        <div className="rounded-lg bg-slate-900/50 p-3 text-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Team Codalions</p>
        </div>
      </div>
    </aside>
  );
}
