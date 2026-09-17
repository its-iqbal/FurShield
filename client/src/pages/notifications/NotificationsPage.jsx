import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import NotificationService from '../../api/notificationService.js';

// Notification types — desaturated palette per DESIGN.md
const TYPE_META = {
  appointment_confirmed:   { icon: '🩺', badge: 'badge-info'    },
  appointment_reminder:    { icon: '📅', badge: 'badge-info'    },
  appointment_cancelled:   { icon: '📅', badge: 'badge-error'   },
  appointment_rescheduled: { icon: '📅', badge: 'badge-warning' },
  vaccination_due:         { icon: '💉', badge: 'badge-warning' },
  new_product:             { icon: '🛒', badge: 'badge-neutral' },
  adoption_interest:       { icon: '🐾', badge: 'badge-success' },
  adoption_approved:       { icon: '🐾', badge: 'badge-success' },
  adoption_rejected:       { icon: '🐾', badge: 'badge-error'   },
  treatment_logged:        { icon: '📋', badge: 'badge-success' },
  general:                 { icon: '🔔', badge: 'badge-neutral' },
};

function formatTime(dateStr) {
  if (!dateStr) return '';
  const d    = new Date(dateStr);
  const diff = Date.now() - d;
  if (diff < 60000)     return 'Just now';
  if (diff < 3600000)   return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000)  return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function NotificationItem({ notif, onMarkRead, onDelete }) {
  const meta = TYPE_META[notif.type] ?? TYPE_META.general;
  return (
    <div className={`flex items-start gap-4 p-4 rounded-2xl border transition-all duration-150 group
      ${notif.isRead
        ? 'border-[#E8E2D9] bg-white'
        : 'border-primary-300 bg-primary-50 shadow-warm-sm'
      }`}>
      {/* Icon well */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0
        ${notif.isRead ? 'bg-[#EEEAE4]' : 'bg-primary-100'}`}>
        {meta.icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-semibold flex items-center gap-2 ${notif.isRead ? 'text-muted' : 'text-body'}`}>
            {!notif.isRead && <span className="w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0" aria-hidden="true" />}
            {notif.title}
          </p>
          <span className="text-xs text-subtle flex-shrink-0">{formatTime(notif.createdAt)}</span>
        </div>
        <p className="text-xs text-muted mt-0.5 line-clamp-2">{notif.message}</p>

        {/* Hover actions */}
        <div className="flex items-center gap-3 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          {!notif.isRead && (
            <button onClick={() => onMarkRead(notif._id)}
              className="text-xs text-primary-700 hover:text-primary-900 font-medium transition-colors">
              Mark read
            </button>
          )}
          <button onClick={() => onDelete(notif._id)}
            className="text-xs text-[#8C4238] hover:text-[#6B2E2B] transition-colors ml-auto font-medium">
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
  const [filter,        setFilter]        = useState('all');

  const fetchNotifs = useCallback(async () => {
    setLoading(true);
    try {
      const params = filter === 'unread' ? { isRead: false } : {};
      const { data } = await NotificationService.getAll({ ...params, limit: 50 });
      setNotifications(data.data);
    } catch { setNotifications([]); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetchNotifs(); }, [fetchNotifs]);

  const handleMarkRead = async (id) => {
    try {
      await NotificationService.markRead(id);
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await NotificationService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  };

  const handleDelete = async (id) => {
    try {
      await NotificationService.remove(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch {}
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const displayed   = filter === 'unread' ? notifications.filter((n) => !n.isRead) : notifications;

  return (
    <DashboardLayout pageTitle="Notifications" unreadCount={unreadCount}>
      <div className="px-4 sm:px-6 py-8 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h2 className="font-['Fraunces'] text-2xl font-semibold text-primary-900">Notifications</h2>
            {unreadCount > 0 && (
              <p className="text-primary-600 text-sm mt-0.5 font-medium">{unreadCount} unread</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Filter toggle */}
            <div className="flex p-1 bg-white rounded-xl border border-[#E8E2D9]">
              {['all', 'unread'].map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`text-xs px-3 py-1.5 rounded-lg capitalize transition-colors duration-150
                    ${filter === f ? 'bg-primary-100 text-primary-800 font-medium' : 'text-muted hover:text-body'}`}>
                  {f}
                </button>
              ))}
            </div>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} id="mark-all-read-btn"
                className="btn-outline text-xs px-3 py-1.5">
                Mark all read
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white border border-[#E8E2D9]">
                <div className="w-10 h-10 rounded-xl bg-[#EEEAE4] flex-shrink-0 animate-pulse" />
                <div className="flex-1 space-y-2.5 py-1">
                  <div className="h-3.5 bg-[#EEEAE4] rounded-xl w-2/3 animate-pulse" />
                  <div className="h-3 bg-[#F1F5F1] rounded-xl w-full animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-3xl mx-auto mb-4">
              🔔
            </div>
            <p className="text-muted text-sm">
              {filter === 'unread' ? 'No unread notifications!' : 'No notifications yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {displayed.map((n) => (
              <NotificationItem key={n._id} notif={n} onMarkRead={handleMarkRead} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
