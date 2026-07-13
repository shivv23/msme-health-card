import { useState, useEffect, useCallback } from 'react';
import { Bell, Info, AlertTriangle, CheckCircle, AlertCircle, Check } from 'lucide-react';
import type { Notification } from '../../types';
import * as api from '../../api/client';
import { formatDateTime } from '../../lib/utils';

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
  onUnreadChange?: (count: number) => void;
}

const TYPE_CONFIG: Record<string, { icon: typeof Bell; color: string }> = {
  info: { icon: Info, color: 'text-blue-400' },
  warning: { icon: AlertTriangle, color: 'text-amber-400' },
  success: { icon: CheckCircle, color: 'text-emerald-400' },
  alert: { icon: AlertCircle, color: 'text-rose-400' },
};

export default function NotificationPanel({ open, onClose, onUnreadChange }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getNotifications();
      setNotifications(data.slice(0, 10));
      const unread = data.filter((n) => !n.is_read).length;
      onUnreadChange?.(unread);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [onUnreadChange]);

  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  const handleMarkRead = async (id: number) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      onUnreadChange?.(notifications.filter((n) => !n.is_read && n.id !== id).length);
    } catch {
      // silent
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      onUnreadChange?.(0);
    } catch {
      // silent
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-full mt-2 w-96 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl animate-scale-in z-50 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Bell size={14} />
            Notifications
          </h4>
          {notifications.some((n) => !n.is_read) && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
            >
              <Check size={12} />
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-5 w-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-8 text-center">
              <Bell size={24} className="mx-auto text-slate-600 mb-2" />
              <p className="text-sm text-slate-500">No notifications</p>
            </div>
          ) : (
            notifications.map((n) => {
              const config = TYPE_CONFIG[n.notification_type] || TYPE_CONFIG.info;
              const Icon = config.icon;
              return (
                <button
                  key={n.id}
                  onClick={() => {
                    if (!n.is_read) handleMarkRead(n.id);
                    if (n.link) {
                      onClose();
                      window.location.href = n.link;
                    }
                  }}
                  className={`w-full text-left px-4 py-3 border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors ${
                    !n.is_read ? 'bg-slate-800/30' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Icon size={16} className={`${config.color} mt-0.5 shrink-0`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-medium text-slate-200 truncate">{n.title}</p>
                        {!n.is_read && (
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-slate-600 mt-1">{formatDateTime(n.created_at)}</p>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
