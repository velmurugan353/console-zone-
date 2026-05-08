import { useState, useEffect } from 'react';
import { notificationService, AppNotification } from '../services/notificationService';

export const useAdminNotifications = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const unsub = notificationService.subscribe('admin', (data) => {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    });
    return () => unsub();
  }, []);

  const markRead = async (id: string) => {
    await notificationService.markAsRead(id);
  };

  return { notifications, unreadCount, markRead };
};
