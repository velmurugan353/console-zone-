export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'system' | 'order' | 'rental' | 'repair' | 'kyc' | 'sell' | 'reward';
  priority: 'low' | 'medium' | 'high' | 'critical';
  read: boolean;
  timestamp: any;
  actionPath?: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: 'Transactional' | 'Marketing' | 'System';
  enabled: boolean;
}

export const DEFAULT_TEMPLATES: NotificationTemplate[] = [
  {
    id: 'order_confirmation',
    name: 'Order Confirmation',
    subject: 'Mission Confirmed: Your Order #{{orderId}}',
    body: 'Greetings Agent, your mission supplies are being prepared...',
    category: 'Transactional',
    enabled: true
  },
  {
    id: 'rental_confirmation',
    name: 'Rental Confirmation',
    subject: 'Gear Deployed: Rental #{{rentalId}}',
    body: 'Your rental gear has been deployed and is on its way...',
    category: 'Transactional',
    enabled: true
  }
];

type NotificationCallback = (notifications: AppNotification[]) => void;
const subscribers = new Map<string, Set<NotificationCallback>>();

const ENV = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : ({} as any);
const API_URL = ENV.PROD && !ENV.VITE_API_URL_FORCE 
  ? '' 
  : (ENV.VITE_API_URL || '');

export const notificationService = {
  sendNotification: async (type: string, email: string, data: any) => {
    try {
      const token = localStorage.getItem('consolezone_token');
      const response = await fetch(`${API_URL}/api/notifications`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: data.userId,
          email,
          type,
          title: `Update: ${type.replace('_', ' ')}`,
          message: `Notification for ${type}`,
          data
        })
      });
      return await response.json().catch(() => ({}));
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  },

  send: async (templateId: string, data: any, options?: any) => {
    console.log(`Sending notification using template ${templateId}`, data, options);
    // Implementation for sending via template
    return Promise.resolve();
  },

  getUserNotifications: async (userId: string) => {
    if (userId === 'admin') return []; // Admin notifications logic placeholder
    
    try {
      const token = localStorage.getItem('consolezone_token');
      const response = await fetch(`${API_URL}/api/notifications/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) return [];
      return await response.json().catch(() => []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }
  },

  markAsRead: async (id: string) => {
    try {
      const token = localStorage.getItem('consolezone_token');
      await fetch(`${API_URL}/api/notifications/${id}/read`, { 
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  },

  subscribe: (userId: string, callback: NotificationCallback) => {
    if (!subscribers.has(userId)) {
      subscribers.set(userId, new Set());
    }
    subscribers.get(userId)!.add(callback);

    // Initial fetch
    notificationService.getUserNotifications(userId).then(callback);

    return () => {
      subscribers.get(userId)?.delete(callback);
    };
  },

  getTemplates: () => {
    return DEFAULT_TEMPLATES;
  }
};
