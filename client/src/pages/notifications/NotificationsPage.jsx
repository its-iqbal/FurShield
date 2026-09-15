import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import NotificationService from '../../api/notificationService.js';

const TYPE_META = {
  appointment: { icon: '🩺', color: 'text-blue-400',   bg: 'bg-blue-500/10'   },
  health:      { icon: '📋', color: 'text-green-400',  bg: 'bg-green-500/10'  },
  adoption:    { icon: '🐾', color: 'text-amber-400',  bg: 'bg-amber-500/10'  },
  order:       { icon: '🛒', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  reminder:    { icon: '🔔', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  system:      { icon: '⚙️', color: 'text-gray-400',   bg: 'bg-gray-500/10'   },
};

function formatTime(dateStr) {
  const d = new Date(dateStr);
  const diff = Date.now() - d;
  if (diff < 60000)     return 'Just now';
  if (diff < 3600000)   return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000)  return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
  return d.toLocaleDateString('en-IN', { day:'numeric', month:'short' });
}

function NotificationItem({ notif, onMarkRead, onDelete }) {
  const meta = TYPE_META[notif.type] ?? TYPE_META.system;
  return (
    <div className={`flex items-start gap-4 p-4 rounded-2xl border transition-all duration-200 group
      ${notif.isRead
        ? 'border-white/5 bg-white/[0.02]'
        : 'border-white/10 bg-white/[0.06] shadow-sm'
      }`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${meta.bg}`}>
        {meta.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-semibold ${notif.isRead ? 'text-gray-400' : 'text-white'}`}>
            {!notif.isRead && <span className="w-2 h-2 rounded-full bg-primary-400 inline-block mr-2 mb-0.5" />}
            {notif.title}
          </p>
          <span className="text-xs text-gray-600 flex-shrink-0">{formatTime(notif.createdAt)}</span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>

        <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {!notif.isRead && (
            <button onClick={() => onMarkRead(notif._id)}
              className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
              Mark read
            </button>
          )}
          <button onClick={() => onDelete(notif._id)}
            className="text-xs text-gray-600 hover:text-red-400 transition-colors ml-auto">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [filter,        setFilter]        = useState('all'); // all | unread

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = filter === 'unread' ? { isRead: false } : {};
      const { data } = await NotificationService.getAll({ ...params, limit: 50 });
      setNotifications(data.data);
    } catch { setNotifications([]); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleMarkRead = async (id) => {
    try { await NotificationService.markRead(id); setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n)); }
    catch {}
  };

  const handleMarkAllRead = async () => {
    try { await NotificationService.markAllRead(); setNotifications(prev => prev.map(n => ({ ...n, isRead: true }))); }
    catch {}
  };

  const handleDelete = async (id) => {
    try { await NotificationService.remove(id); setNotifications(prev => prev.filter(n => n._id !== id)); }
    catch {}
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const displayed = filter === 'unread' ? notifications.filter(n => !n.isRead) : notifications;

  return (
    <DashboardLayout pageTitle="Notifications 🔔" unreadCount={unreadCount}>
      <div className="px-4 sm:px-6 py-8 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-black text-white">Notifications</h2>
            {unreadCount > 0 && (
              <p className="text-primary-400 text-sm mt-0.5">{unreadCount} unread</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Filter toggle */}
            <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
              {['all','unread'].map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`text-xs px-3 py-1.5 rounded-lg capitalize transition-all
                    ${filter === f ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                  {f}
                </button>
              ))}
            </div>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} id="mark-all-read-btn"
                className="text-xs text-primary-400 hover:text-primary-300 border border-primary-500/30
                  hover:border-primary-500/50 px-3 py-1.5 rounded-xl transition-all">
                Mark all read
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 animate-pulse">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/10 rounded w-3/4" />
                  <div className="h-3 bg-white/5 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-4 opacity-30">🔔</p>
            <p className="text-gray-400 text-sm">
              {filter === 'unread' ? 'No unread notifications!' : 'No notifications yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayed.map((n) => (
              <NotificationItem key={n._id} notif={n} onMarkRead={handleMarkRead} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
