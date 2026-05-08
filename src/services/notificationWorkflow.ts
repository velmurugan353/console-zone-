export interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: 'Transactional' | 'Marketing' | 'System';
  enabled: boolean;
  channels: ('email' | 'sms' | 'whatsapp' | 'inapp')[];
  trigger: string;
  variables: string[];
}

export interface NotificationLog {
  id: string;
  timestamp: string;
  templateId: string;
  templateName: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  channels: ('email' | 'sms' | 'whatsapp' | 'inapp')[];
  status: 'sent' | 'failed' | 'pending' | 'delivered' | 'opened';
  subject: string;
  body: string;
  rentalId?: string;
  metadata: Record<string, any>;
}

export interface ChannelConfig {
  id: 'email' | 'sms' | 'whatsapp' | 'inapp';
  name: string;
  enabled: boolean;
  provider: string;
  apiKey: string;
  fromAddress: string;
  fromPhone: string;
  whatsappBusinessId: string;
  testMode: boolean;
  rateLimit: number;
  dailyLimit: number;
}

export interface NotificationSettings {
  channels: ChannelConfig[];
  retryAttempts: number;
  retryDelayMinutes: number;
  batchSize: number;
  quietHoursStart: string;
  quietHoursEnd: string;
  fallbackChannel: 'email' | 'sms' | 'whatsapp' | 'inapp' | 'none';
  logRetentionDays: number;
}

export const DEFAULT_TEMPLATES: NotificationTemplate[] = [
  {
    id: 'booking_confirmed',
    name: 'Booking Confirmed',
    subject: 'Booking Confirmed - {{productName}}',
    body: 'Hi {{customerName}}, your booking for {{productName}} has been confirmed.\n\nStart: {{startDate}}\nEnd: {{endDate}}\nTotal: ₹{{totalPrice}}\nDeposit: ₹{{deposit}}\n\nRental ID: {{rentalId}}',
    category: 'Transactional',
    enabled: true,
    channels: ['email', 'sms', 'whatsapp', 'inapp'],
    trigger: 'rental_booked',
    variables: ['customerName', 'productName', 'startDate', 'endDate', 'totalPrice', 'deposit', 'rentalId']
  },
  {
    id: 'rental_checkout',
    name: 'Check-Out Notification',
    subject: 'Your {{productName}} is Ready!',
    body: 'Hi {{customerName}}, your {{productName}} (Unit: {{unitId}}) is ready for pickup.\n\nCheck-out completed at {{checkOutAt}}.\n\nPlease bring your ID.',
    category: 'Transactional',
    enabled: true,
    channels: ['email', 'sms', 'whatsapp', 'inapp'],
    trigger: 'rental_checked_out',
    variables: ['customerName', 'productName', 'unitId', 'checkOutAt']
  },
  {
    id: 'reminder_24h_pickup',
    name: '24h Pickup Reminder',
    subject: 'Reminder: Pickup Tomorrow - {{productName}}',
    body: 'Hi {{customerName}}, your {{productName}} rental starts tomorrow.\n\nPickup Date: {{startDate}}\n\nPlease visit our store.',
    category: 'Transactional',
    enabled: true,
    channels: ['email', 'sms', 'whatsapp'],
    trigger: '24h_before_start',
    variables: ['customerName', 'productName', 'startDate']
  },
  {
    id: 'reminder_24h_return',
    name: '24h Return Reminder',
    subject: 'Reminder: Return Due Tomorrow',
    body: 'Hi {{customerName}}, your {{productName}} rental ends tomorrow.\n\nReturn Date: {{endDate}}\n\nPlease return the unit to avoid late fees.',
    category: 'Transactional',
    enabled: true,
    channels: ['email', 'sms', 'whatsapp'],
    trigger: '24h_before_end',
    variables: ['customerName', 'productName', 'endDate']
  },
  {
    id: 'overdue_alert',
    name: 'Overdue Alert',
    subject: 'URGENT: {{productName}} is Overdue!',
    body: 'Hi {{customerName}}, your {{productName}} rental was due on {{endDate}}.\n\nLate Fee Applied: ₹{{lateFee}}\n\nPlease return immediately.',
    category: 'Transactional',
    enabled: true,
    channels: ['email', 'sms', 'whatsapp', 'inapp'],
    trigger: 'past_end_date',
    variables: ['customerName', 'productName', 'endDate', 'lateFee']
  },
  {
    id: 'rental_checkin',
    name: 'Check-In Confirmation',
    subject: 'Return Confirmed - {{productName}}',
    body: 'Hi {{customerName}}, your {{productName}} has been returned.\n\nCondition: {{condition}}\nLate Fee: ₹{{lateFee}}\nRepair Cost: ₹{{repairCost}}\nTotal Charges: ₹{{totalCharges}}',
    category: 'Transactional',
    enabled: true,
    channels: ['email', 'sms', 'whatsapp', 'inapp'],
    trigger: 'rental_checked_in',
    variables: ['customerName', 'productName', 'condition', 'lateFee', 'repairCost', 'totalCharges']
  },
  {
    id: 'deposit_refund',
    name: 'Deposit Refund Processed',
    subject: 'Deposit Refunded - ₹{{depositAmount}}',
    body: 'Hi {{customerName}}, your security deposit of ₹{{depositAmount}} has been refunded.\n\nProcessing time: 3-5 business days.',
    category: 'Transactional',
    enabled: true,
    channels: ['email', 'inapp'],
    trigger: 'deposit_refunded',
    variables: ['customerName', 'depositAmount']
  },
  {
    id: 'rental_cancelled',
    name: 'Rental Cancelled',
    subject: 'Rental Cancelled - {{productName}}',
    body: 'Hi {{customerName}}, your rental for {{productName}} has been cancelled.\n\nReason: {{reason}}\n{{refundStatus}}',
    category: 'Transactional',
    enabled: true,
    channels: ['email', 'sms', 'whatsapp', 'inapp'],
    trigger: 'rental_cancelled',
    variables: ['customerName', 'productName', 'reason', 'refundStatus']
  },
  {
    id: 'maintenance_flagged',
    name: 'Unit Flagged for Maintenance',
    subject: 'Maintenance Required - {{unitId}}',
    body: 'Unit {{unitId}} has been flagged for maintenance.\n\nType: {{maintenanceType}}\nCost: ₹{{cost}}\nTriggered by: {{triggeredBy}}',
    category: 'System',
    enabled: true,
    channels: ['email', 'inapp'],
    trigger: 'maintenance_required',
    variables: ['unitId', 'maintenanceType', 'cost', 'triggeredBy']
  },
  {
    id: 'admin_daily_summary',
    name: 'Daily Summary (Admin)',
    subject: 'Daily Rental Summary - {{date}}',
    body: 'Daily Summary:\n- Active Rentals: {{activeCount}}\n- Check-outs Today: {{checkoutCount}}\n- Check-ins Today: {{checkinCount}}\n- Revenue Today: ₹{{revenue}}\n- Late Returns: {{lateCount}}',
    category: 'System',
    enabled: false,
    channels: ['email'],
    trigger: 'daily_schedule',
    variables: ['date', 'activeCount', 'checkoutCount', 'checkinCount', 'revenue', 'lateCount']
  }
];

export const DEFAULT_SETTINGS: NotificationSettings = {
  channels: [
    {
      id: 'email',
      name: 'Email',
      enabled: true,
      provider: 'SendGrid',
      apiKey: '',
      fromAddress: 'noreply@consolezone.com',
      fromPhone: '',
      whatsappBusinessId: '',
      testMode: true,
      rateLimit: 100,
      dailyLimit: 5000
    },
    {
      id: 'sms',
      name: 'SMS',
      enabled: true,
      provider: 'Twilio',
      apiKey: '',
      fromAddress: '',
      fromPhone: '+91XXXXXXXXXX',
      whatsappBusinessId: '',
      testMode: true,
      rateLimit: 50,
      dailyLimit: 1000
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      enabled: false,
      provider: 'Twilio WhatsApp',
      apiKey: '',
      fromAddress: '',
      fromPhone: '+91XXXXXXXXXX',
      whatsappBusinessId: '',
      testMode: true,
      rateLimit: 50,
      dailyLimit: 1000
    },
    {
      id: 'inapp',
      name: 'In-App',
      enabled: true,
      provider: 'Internal',
      apiKey: '',
      fromAddress: '',
      fromPhone: '',
      whatsappBusinessId: '',
      testMode: false,
      rateLimit: 999,
      dailyLimit: 99999
    }
  ],
  retryAttempts: 3,
  retryDelayMinutes: 5,
  batchSize: 50,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
  fallbackChannel: 'email',
  logRetentionDays: 30
};

class NotificationWorkflowService {
  private templates: NotificationTemplate[] = DEFAULT_TEMPLATES;
  private logs: NotificationLog[] = [];
  private settings: NotificationSettings = DEFAULT_SETTINGS;

  constructor() {
    this.loadFromStorage();
  }

  loadFromStorage() {
    const storedTemplates = localStorage.getItem('notificationTemplates');
    const storedLogs = localStorage.getItem('notificationLogs');
    const storedSettings = localStorage.getItem('notificationSettings');

    if (storedTemplates) this.templates = JSON.parse(storedTemplates);
    if (storedLogs) this.logs = JSON.parse(storedLogs);
    if (storedSettings) this.settings = JSON.parse(storedSettings);
  }

  saveToStorage() {
    localStorage.setItem('notificationTemplates', JSON.stringify(this.templates));
    localStorage.setItem('notificationLogs', JSON.stringify(this.logs));
    localStorage.setItem('notificationSettings', JSON.stringify(this.settings));
  }

  getTemplates(): NotificationTemplate[] {
    return this.templates;
  }

  getTemplate(id: string): NotificationTemplate | null {
    return this.templates.find(t => t.id === id) || null;
  }

  updateTemplate(id: string, updates: Partial<NotificationTemplate>) {
    const index = this.templates.findIndex(t => t.id === id);
    if (index === -1) return null;
    this.templates[index] = { ...this.templates[index], ...updates };
    this.saveToStorage();
    return this.templates[index];
  }

  toggleTemplate(id: string) {
    const template = this.getTemplate(id);
    if (!template) return null;
    return this.updateTemplate(id, { enabled: !template.enabled });
  }

  getSettings(): NotificationSettings {
    return this.settings;
  }

  updateSettings(updates: Partial<NotificationSettings>) {
    this.settings = { ...this.settings, ...updates };
    this.saveToStorage();
    return this.settings;
  }

  updateChannel(channelId: string, updates: Partial<ChannelConfig>) {
    const index = this.settings.channels.findIndex(c => c.id === channelId);
    if (index === -1) return null;
    this.settings.channels[index] = { ...this.settings.channels[index], ...updates };
    this.saveToStorage();
    return this.settings.channels[index];
  }

  toggleChannel(channelId: string) {
    const channel = this.settings.channels.find(c => c.id === channelId);
    if (!channel) return null;
    return this.updateChannel(channelId, { enabled: !channel.enabled });
  }

  getLogs(): NotificationLog[] {
    return this.logs;
  }

  getLogsByCustomer(customerId: string): NotificationLog[] {
    return this.logs.filter(l => l.customerId === customerId);
  }

  getLogsByRental(rentalId: string): NotificationLog[] {
    return this.logs.filter(l => l.rentalId === rentalId);
  }

  getLogsByStatus(status: string): NotificationLog[] {
    return this.logs.filter(l => l.status === status);
  }

  getLogsByChannel(channel: string): NotificationLog[] {
    return this.logs.filter(l => l.channels.includes(channel as any));
  }

  getLogsByDateRange(start: string, end: string): NotificationLog[] {
    return this.logs.filter(l => {
      const date = new Date(l.timestamp);
      return date >= new Date(start) && date <= new Date(end);
    });
  }

  addLog(entry: Omit<NotificationLog, 'id' | 'timestamp'>) {
    const log: NotificationLog = {
      ...entry,
      id: `NOTIF-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      timestamp: new Date().toISOString()
    };
    this.logs.unshift(log);
    const retentionDate = new Date();
    retentionDate.setDate(retentionDate.getDate() - this.settings.logRetentionDays);
    this.logs = this.logs.filter(l => new Date(l.timestamp) > retentionDate);
    this.saveToStorage();
    return log;
  }

  async triggerWorkflow(trigger: string, data: Record<string, any>) {
    const template = this.templates.find(t => t.trigger === trigger && t.enabled);
    if (!template) {
      console.log(`[NOTIFICATION] No enabled template found for trigger: ${trigger}`);
      return null;
    }

    if (!this.isWithinQuietHours()) {
      console.log(`[NOTIFICATION] Quiet hours active, skipping: ${trigger}`);
      return null;
    }

    const subject = this.interpolate(template.subject, data);
    const body = this.interpolate(template.body, data);

    const channels = template.channels.filter(ch => {
      const channel = this.settings.channels.find(c => c.id === ch);
      return channel && channel.enabled;
    });

    if (channels.length === 0) {
      console.log(`[NOTIFICATION] No channels enabled for: ${trigger}`);
      return null;
    }

    const log = this.addLog({
      templateId: template.id,
      templateName: template.name,
      customerId: data.customerId || '',
      customerName: data.customerName || 'Unknown',
      customerEmail: data.email || '',
      customerPhone: data.phone,
      channels,
      status: 'sent',
      subject,
      body,
      rentalId: data.rentalId,
      metadata: data
    });

    console.log(`[NOTIFICATION] Sent: ${template.name} → ${data.customerName} via ${channels.join(', ')}`);

    return log;
  }

  interpolate(template: string, data: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] !== undefined ? String(data[key]) : match;
    });
  }

  isWithinQuietHours(): boolean {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;

    const [startH, startM] = this.settings.quietHoursStart.split(':').map(Number);
    const [endH, endM] = this.settings.quietHoursEnd.split(':').map(Number);
    const startTime = startH * 60 + startM;
    const endTime = endH * 60 + endM;

    if (startTime > endTime) {
      return currentTime >= startTime || currentTime < endTime;
    }
    return currentTime >= startTime && currentTime < endTime;
  }

  getStats() {
    const total = this.logs.length;
    const sent = this.logs.filter(l => l.status === 'sent' || l.status === 'delivered' || l.status === 'opened').length;
    const failed = this.logs.filter(l => l.status === 'failed').length;
    const pending = this.logs.filter(l => l.status === 'pending').length;

    const byTemplate: Record<string, number> = {};
    this.logs.forEach(l => {
      byTemplate[l.templateName] = (byTemplate[l.templateName] || 0) + 1;
    });

    const byChannel: Record<string, number> = { email: 0, sms: 0, whatsapp: 0, inapp: 0 };
    this.logs.forEach(l => {
      l.channels.forEach(ch => {
        byChannel[ch] = (byChannel[ch] || 0) + 1;
      });
    });

    const today = new Date().toDateString();
    const todayCount = this.logs.filter(l => new Date(l.timestamp).toDateString() === today).length;

    return {
      total,
      sent,
      failed,
      pending,
      todayCount,
      byTemplate,
      byChannel,
      successRate: total > 0 ? ((sent / total) * 100).toFixed(1) : '0'
    };
  }
}

export const notificationWorkflowService = new NotificationWorkflowService();
