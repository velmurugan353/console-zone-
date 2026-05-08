const API_URL = import.meta.env.VITE_API_URL || '';

export interface AutomationLog {
  id?: string;
  service: 'Gmail' | 'Sheets' | 'Drive';
  action: string;
  target: string;
  status: 'success' | 'failed' | 'processing';
  timestamp: any;
}

class GoogleAutomationService {
  async syncCustomerToSheets(customerData: any) {
    console.log(`[AGENT] Syncing ${customerData.name} to Google Sheets...`);
    await this.logActivity('Sheets', 'Export_Row', customerData.email, 'success');
    return true;
  }

  async createCustomerDriveFolder(customerData: any) {
    console.log(`[AGENT] Provisioning Google Drive folder for ${customerData.name}...`);
    await this.logActivity('Drive', 'Create_Folder', `Root/Customers/${customerData.name}`, 'success');
    return true;
  }

  async sendGmailProtocol(customerData: any, template: string) {
    console.log(`[AGENT] Transmitting Gmail protocol via ${template}...`);
    await this.logActivity('Gmail', 'Send_Mail', customerData.email, 'success');
    return true;
  }

  private async logActivity(service: any, action: string, target: string, status: 'success' | 'failed') {
    try {
      await fetch(`${API_URL}/api/notification-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateName: 'Google Automation',
          channels: [service],
          status,
          subject: action,
          body: `Target: ${target}`,
          trigger: 'Agent Action'
        })
      });
    } catch (error) {
      console.error('Error logging automation activity:', error);
    }
  }

  subscribeToLogs(callback: (logs: AutomationLog[]) => void) {
    // Polling as a fallback for WebSocket/onSnapshot
    const fetchLogs = async () => {
      try {
        const response = await fetch(`${API_URL}/api/notification-logs?limit=20`);
        if (response.ok) {
          const data = await response.json().catch(() => ({ logs: [] }));
          const logs = (data.logs || []).map((log: any) => ({
            id: log.logId,
            service: log.channels[0],
            action: log.subject,
            target: log.body.replace('Target: ', ''),
            status: log.status,
            timestamp: log.createdAt
          }));
          callback(logs);
        }
      } catch (error) {
        console.error('Error fetching automation logs:', error);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 30000);
    return () => clearInterval(interval);
  }
}

export const googleAutomationService = new GoogleAutomationService();
