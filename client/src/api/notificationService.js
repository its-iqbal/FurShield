import api from './axios.js';

const NotificationService = {
  getAll:      (params = {}) => api.get('/notifications',          { params }),
  markRead:    (id)          => api.patch(`/notifications/${id}/read`),
  markAllRead: ()            => api.patch('/notifications/read-all'),
  remove:      (id)          => api.delete(`/notifications/${id}`),
  getUnreadCount: ()         => api.get('/notifications/unread-count'),
};
export default NotificationService;
