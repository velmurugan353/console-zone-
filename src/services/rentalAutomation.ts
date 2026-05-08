import { notificationService } from './notificationService';
import { getControllerSettings } from './controller-settings';

export interface AutomationRules {
  autoReduceStock: boolean;
  autoDisableOutOfStock: boolean;
  autoBlockRentalDates: boolean;
  autoApplyLatePenalty: boolean;
  autoNotifyAdminOnLowStock: boolean;
  lowStockThreshold: number;
  latePenaltyPerDay: number;
}

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  kycStatus?: string;
  totalRentals: number;
  activeRentals: number;
  completedRentals: number;
  cancelledRentals: number;
  totalSpent: number;
  totalLateFees: number;
  totalRepairCosts: number;
  depositBalance: number;
  lastRentalDate?: string;
  firstRentalDate?: string;
  riskScore: 'low' | 'medium' | 'high';
  notes: string;
  createdAt: string;
}

export interface RentalHistoryEntry {
  id: string;
  rentalId: string;
  unitId: string;
  customer: string;
  customerId?: string;
  email: string;
  phone?: string;
  product: string;
  startDate: string;
  endDate: string;
  actualReturnDate?: string;
  totalPrice: number;
  deposit: number;
  status: 'active' | 'completed' | 'late' | 'cancelled' | 'pending';
  checkOutAt?: string;
  checkInAt?: string;
  returnCondition?: 'good' | 'minor' | 'major';
  repairCost: number;
  lateFee: number;
  depositRefunded: boolean;
  notes: string;
  createdAt: string;
}

export interface MaintenanceEntry {
  id: string;
  unitId: string;
  date: string;
  type: string;
  technician: string;
  notes: string;
  cost: number;
  triggeredBy: string;
}

export interface AutomationLog {
  id: string;
  timestamp: string;
  type: 'checkout' | 'checkin' | 'cancel' | 'booking' | 'maintenance' | 'notification' | 'penalty' | 'refund';
  rentalId: string;
  customerId: string;
  customerName: string;
  message: string;
  status: 'success' | 'failed' | 'pending';
}

export const DEFAULT_RULES: AutomationRules = {
  autoReduceStock: true,
  autoDisableOutOfStock: true,
  autoBlockRentalDates: true,
  autoApplyLatePenalty: true,
  autoNotifyAdminOnLowStock: true,
  lowStockThreshold: 5,
  latePenaltyPerDay: 500
};

const ENV = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : ({} as any);
const API_URL = ENV.PROD && !ENV.VITE_API_URL_FORCE 
  ? '' 
  : (ENV.VITE_API_URL || '');

class RentalAutomationService {
  private rules: AutomationRules = { ...DEFAULT_RULES };
  private alertedProducts: Set<string> = new Set();

  getRules() {
    return this.rules;
  }

  updateRules(newRules: Partial<AutomationRules>) {
    this.rules = { ...this.rules, ...newRules };
  }

  // =================== DATABASE HELPERS ===================

  async getRentalHistory(): Promise<RentalHistoryEntry[]> {
    try {
      const token = localStorage.getItem('consolezone_token');
      const response = await fetch(`${API_URL}/api/rentals`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) return [];
      const rentals = await response.json();
      return rentals.map((r: any) => ({
        ...r,
        id: r._id || r.id,
        customerId: r.userId?._id || r.userId,
        customer: r.user || 'Anonymous',
        lateFee: r.lateFees || 0,
        repairCost: r.repairCost || 0,
        depositRefunded: r.depositRefunded || false
      }));
    } catch (error) {
      console.error("Error fetching rental history:", error);
      return [];
    }
  }

  async getMaintenanceHistory(): Promise<MaintenanceEntry[]> {
    try {
      const token = localStorage.getItem('consolezone_token');
      const response = await fetch(`${API_URL}/api/inventory`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) return [];
      const items = await response.json();
      const maintenance: MaintenanceEntry[] = [];
      items.forEach((item: any) => {
        if (item.maintenanceHistory) {
          item.maintenanceHistory.forEach((record: any) => {
            maintenance.push({
              ...record,
              id: record._id || record.id,
              unitId: item.id || item._id,
              triggeredBy: 'System'
            });
          });
        }
      });
      return maintenance;
    } catch (error) {
      console.error("Error fetching maintenance history:", error);
      return [];
    }
  }

  async getInventory(): Promise<any[]> {
    try {
      const token = localStorage.getItem('consolezone_token');
      const response = await fetch(`${API_URL}/api/inventory`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error("Error fetching inventory:", error);
      return [];
    }
  }

  getAutomationLogs(): AutomationLog[] {
    const stored = localStorage.getItem('automationLogs');
    return stored ? JSON.parse(stored) : [];
  }

  saveAutomationLogs(logs: AutomationLog[]) {
    localStorage.setItem('automationLogs', JSON.stringify(logs));
  }

  addLog(entry: Omit<AutomationLog, 'id' | 'timestamp'>) {
    const logs = this.getAutomationLogs();
    const newLog: AutomationLog = {
      ...entry,
      id: `LOG-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      timestamp: new Date().toISOString()
    };
    logs.unshift(newLog);
    if (logs.length > 500) logs.length = 500;
    this.saveAutomationLogs(logs);
    return newLog;
  }

  // =================== CUSTOMER MANAGEMENT ===================

  async getCustomers(): Promise<CustomerProfile[]> {
    try {
      const token = localStorage.getItem('consolezone_token');
      const response = await fetch(`${API_URL}/api/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) return [];
      const users = await response.json();
      const history = await this.getRentalHistory();

      return users.map((u: any) => {
        const userId = u.id || u._id;
        const userRentals = history.filter(r => r.customerId === userId);
        const totalSpent = userRentals.reduce((sum, r) => sum + r.totalPrice, 0);
        
        return {
          id: u.id || u._id,
          name: u.username,
          email: u.email,
          phone: u.phone,
          avatar: u.avatar,
          kycStatus: u.kyc_status,
          riskScore: 'low',
          totalRentals: userRentals.length,
          activeRentals: userRentals.filter(r => r.status === 'active').length,
          completedRentals: userRentals.filter(r => r.status === 'completed').length,
          cancelledRentals: userRentals.filter(r => r.status === 'cancelled').length,
          totalSpent,
          totalLateFees: userRentals.reduce((sum, r) => sum + (r.lateFee || 0), 0),
          totalRepairCosts: userRentals.reduce((sum, r) => sum + (r.repairCost || 0), 0),
          depositBalance: 0,
          notes: u.notes || '',
          createdAt: u.createdAt
        };
      });
    } catch (error) {
      console.error("Error fetching customers:", error);
      return [];
    }
  }

  async getCustomerById(id: string): Promise<CustomerProfile | null> {
    const customers = await this.getCustomers();
    return customers.find(c => c.id === id) || null;
  }

  async addCustomerNote(id: string, note: string): Promise<void> {
    try {
      const token = localStorage.getItem('consolezone_token');
      await fetch(`${API_URL}/api/users/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ notes: note })
      });
    } catch (error) {
      console.error("Error adding customer note:", error);
    }
  }

  async getRentalsByCustomer(id: string): Promise<RentalHistoryEntry[]> {
    const history = await this.getRentalHistory();
    return history.filter(r => r.customerId === id);
  }

  // =================== RENTAL WORKFLOW AUTOMATION ===================

  async handleRentalCheckout(rentalId: string, unitId: string, data: any) {
    console.log(`[WORKFLOW] Check-out: ${rentalId} → Unit ${unitId}`);
    try {
      const token = localStorage.getItem('consolezone_token');
      
      const rentalRes = await fetch(`${API_URL}/api/rentals/${rentalId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'active',
          unitId,
          checkOutAt: new Date().toISOString()
        })
      });

      if (!rentalRes.ok) throw new Error("Failed to update rental status");
      const updated = await rentalRes.json();

      await fetch(`${API_URL}/api/inventory/${unitId}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'Rented' })
      });

      this.addLog({
        type: 'checkout',
        rentalId: rentalId,
        customerId: updated.userId || '',
        customerName: updated.user,
        message: `Check-out: ${updated.product} → Unit ${unitId}`,
        status: 'success'
      });

      await notificationService.send('rental_checkout', {
        customerName: updated.user,
        productName: updated.product,
        unitId,
        checkOutAt: updated.checkOutAt
      }, { email: updated.email, phone: updated.phone });

      return updated;
    } catch (error) {
      console.error("Checkout workflow failed:", error);
      throw error;
    }
  }

  async handleRentalCheckin(rentalId: string, data: { condition: string; repairCost: number; notes: string; imageUrl?: string }) {
    console.log(`[WORKFLOW] Check-in: ${rentalId} → Condition: ${data.condition}`);
    try {
      const token = localStorage.getItem('consolezone_token');
      const rentalRes = await fetch(`${API_URL}/api/rentals/${rentalId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!rentalRes.ok) throw new Error("Rental not found");
      const rental = await rentalRes.json();

      const now = new Date();
      const endDate = new Date(rental.endDate);
      let lateFee = 0;

      if (now > endDate && this.rules.autoApplyLatePenalty) {
        const hoursLate = Math.ceil((now.getTime() - endDate.getTime()) / (1000 * 60 * 60));
        lateFee = hoursLate * (this.rules.latePenaltyPerDay / 24);
      }

      const updateRes = await fetch(`${API_URL}/api/rentals/${rentalId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'completed',
          actualReturnDate: now.toISOString(),
          returnCondition: data.condition,
          repairCost: data.repairCost,
          lateFees: lateFee
        })
      });

      if (!updateRes.ok) throw new Error("Failed to update rental");
      const updated = await updateRes.json();

      let newStatus = 'Available';
      if (data.condition === 'major') newStatus = 'Maintenance';
      
      await fetch(`${API_URL}/api/inventory/${rental.unitId}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (data.condition === 'major' || (data.condition === 'minor' && data.repairCost > 0)) {
        await fetch(`${API_URL}/api/inventory/${rental.unitId}/maintenance`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            type: data.condition === 'major' ? 'Post-Return Inspection' : 'Minor Repair',
            technician: 'Auto-Assigned',
            notes: data.notes,
            cost: data.repairCost,
            nextStatus: newStatus
          })
        });
      }

      this.addLog({
        type: 'checkin',
        rentalId: rentalId,
        customerId: updated.userId || '',
        customerName: updated.user,
        message: `Check-in: ${updated.product} → Condition: ${data.condition}`,
        status: 'success'
      });

      await notificationService.send('rental_checkin', {
        customerName: updated.user,
        productName: updated.product,
        condition: data.condition,
        lateFee,
        repairCost: data.repairCost,
        totalCharges: lateFee + data.repairCost
      }, { email: updated.email, phone: updated.phone });

      return updated;
    } catch (error) {
      console.error("Check-in workflow failed:", error);
      throw error;
    }
  }

  async handleRentalCancel(rentalId: string, data: { reason: string; refundDeposit: boolean }) {
    console.log(`[WORKFLOW] Cancel: ${rentalId} → Reason: ${data.reason}`);
    try {
      const token = localStorage.getItem('consolezone_token');
      
      const updateRes = await fetch(`${API_URL}/api/rentals/${rentalId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'cancelled',
          depositRefunded: data.refundDeposit
        })
      });

      if (!updateRes.ok) throw new Error("Failed to cancel rental");
      const updated = await updateRes.json();

      if (updated.unitId) {
        await fetch(`${API_URL}/api/inventory/${updated.unitId}/status`, {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: 'Available' })
        });
      }

      this.addLog({
        type: 'cancel',
        rentalId: rentalId,
        customerId: updated.userId || '',
        customerName: updated.user,
        message: `Cancelled: ${data.reason}`,
        status: 'success'
      });

      await notificationService.send('rental_cancelled', {
        customerName: updated.user,
        productName: updated.product,
        reason: data.reason,
        refundStatus: data.refundDeposit ? 'Refund processed' : 'No refund'
      }, { email: updated.email, phone: updated.phone });

      return updated;
    } catch (error) {
      console.error("Cancel workflow failed:", error);
      throw error;
    }
  }

  async handleRentalBooking(booking: any) {
    this.addLog({
      type: 'booking',
      rentalId: booking.rentalId || '',
      customerId: booking.userId || '',
      customerName: booking.customerName,
      message: `New rental booking: ${booking.productName}`,
      status: 'success'
    });

    await notificationService.send('rental_confirmation', {
      customerName: booking.customerName,
      consoleName: booking.productName,
      startDate: booking.startDate,
      endDate: booking.endDate,
      rentalId: booking.rentalId
    }, { email: booking.email, phone: booking.phone });
  }

  async triggerWorkflow(workflowId: string, data: any) {
    console.log(`[AUTOMATION] Triggering Workflow: ${workflowId}`, data);

    switch (workflowId) {
      case 'rental_confirmed':
        return await this.handleRentalBooking(data);
      case 'rental_checkout':
        return await this.handleRentalCheckout(data.rentalId, data.unitId, data);
      case 'rental_checkin':
        return await this.handleRentalCheckin(data.rentalId, data);
      case 'rental_cancel':
        return await this.handleRentalCancel(data.rentalId, data);
      default:
        console.log(`[AUTOMATION] No specific handler for workflow: ${workflowId}`);
    }
  }

  // =================== STATS & REPORTS ===================

  async getStats() {
    const history = await this.getRentalHistory();
    const maintenance = await this.getMaintenanceHistory();

    const totalRentals = history.length;
    const activeRentals = history.filter(r => r.status === 'active').length;
    const completedRentals = history.filter(r => r.status === 'completed').length;
    const cancelledRentals = history.filter(r => r.status === 'cancelled').length;
    const lateRentals = history.filter(r => r.status === 'late').length;
    const totalRevenue = history.filter(r => r.status === 'completed').reduce((sum, r) => sum + r.totalPrice, 0);
    const totalLateFees = history.reduce((sum, r) => sum + (r.lateFee || 0), 0);
    const totalRepairCosts = history.reduce((sum, r) => sum + (r.repairCost || 0), 0);
    const totalMaintenanceCost = maintenance.reduce((sum, m) => sum + m.cost, 0);

    return {
      totalRentals,
      activeRentals,
      completedRentals,
      cancelledRentals,
      lateRentals,
      totalRevenue,
      totalLateFees,
      totalRepairCosts,
      totalMaintenanceCost,
      maintenanceRecords: maintenance.length
    };
  }
}

export const rentalAutomationService = new RentalAutomationService();
export const automationService = rentalAutomationService;
