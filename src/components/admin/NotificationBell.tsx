'use client';

import { useEffect, useRef, useState } from 'react';

import { csrfFetch } from '@/lib/clientCsrf';

type Notification = {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  entityType: string | null;
  entityId: string | null;
  read: boolean;
  createdAt: string;
};

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadNotifications = async () => {
    const response = await csrfFetch('/api/admin/notifications?limit=10');
    if (!response.ok) return;

    const payload = (await response.json()) as { notifications: Notification[] };
    setNotifications(payload.notifications);
    setUnreadCount(payload.notifications.filter((n) => !n.read).length);
  };

  useEffect(() => {
    void loadNotifications();
    const interval = setInterval(() => {
      void loadNotifications();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkRead = async (notificationId: string) => {
    await csrfFetch('/api/admin/notifications?action=mark_read&notificationId=' + notificationId, {
      method: 'PUT'
    });
    void loadNotifications();
  };

  const handleMarkAllRead = async () => {
    await csrfFetch('/api/admin/notifications?action=mark_all_read', {
      method: 'PUT'
    });
    void loadNotifications();
  };

  const handleDelete = async (notificationId: string) => {
    await csrfFetch('/api/admin/notifications?id=' + notificationId, {
      method: 'DELETE'
    });
    void loadNotifications();
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'schedule_publish':
        return '📅';
      case 'schedule_unpublish':
        return '📅';
      case 'approval_request':
        return '👋';
      case 'mention':
        return '💬';
      default:
        return '🔔';
    }
  };

  return (
    <div className="admin-notification-bell" ref={dropdownRef}>
      <button
        type="button"
        className="admin-notification-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <span className="admin-notification-icon">🔔</span>
        {unreadCount > 0 && <span className="admin-notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="admin-notification-dropdown">
          <div className="admin-notification-header">
            <h3>Notifications</h3>
            <div className="admin-notification-actions">
              {unreadCount > 0 && (
                <button type="button" onClick={() => void handleMarkAllRead()}>
                  Mark all read
                </button>
              )}
            </div>
          </div>

          <div className="admin-notification-list">
            {notifications.length === 0 ? (
              <p className="admin-notification-empty">No notifications yet</p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`admin-notification-item ${notification.read ? 'read' : 'unread'}`}
                >
                  <div className="admin-notification-item-icon">{getNotificationIcon(notification.type)}</div>
                  <div className="admin-notification-item-content">
                    <div className="admin-notification-item-title">
                      {!notification.read && <span className="admin-notification-dot" />}
                      {notification.title}
                    </div>
                    <div className="admin-notification-item-message">{notification.message}</div>
                    <div className="admin-notification-item-time">{formatTimeAgo(notification.createdAt)}</div>
                  </div>
                  <div className="admin-notification-item-actions">
                    {!notification.read && (
                      <button type="button" onClick={() => void handleMarkRead(notification.id)} title="Mark as read">
                        ✓
                      </button>
                    )}
                    <button type="button" onClick={() => void handleDelete(notification.id)} title="Dismiss">
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
