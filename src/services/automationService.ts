
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

export const DEFAULT_RULES: AutomationRules = {
  autoReduceStock: true,
  autoDisableOutOfStock: true,
  autoBlockRentalDates: true,
  autoApplyLatePenalty: true,
  autoNotifyAdminOnLowStock: true,
  lowStockThreshold: 5,
  latePenaltyPerDay: 500
};

class AutomationService {
  private rules: AutomationRules = { ...DEFAULT_RULES };
  private alertedProducts: Set<string> = new Set();

  getRules() {
    return this.rules;
  }

  updateRules(newRules: Partial<AutomationRules>) {
    this.rules = { ...this.rules, ...newRules };
  }

  // E-commerce Automation
  async handleOrderPlacement(order: any, products: any[]) {
    if (this.rules.autoReduceStock) {
      // Logic to reduce stock in DB would go here
      console.log(`[AUTOMATION] Reducing stock for ${products.length} items`);

      products.forEach(p => {
        if (p.stock <= this.rules.lowStockThreshold && this.rules.autoNotifyAdminOnLowStock) {
          if (!this.alertedProducts.has(p.id)) {
            console.log(`[AUTOMATION] ALERT: Low stock for ${p.name}`);
            this.alertedProducts.add(p.id);
          }
        }
      });
    }

    // Generate Invoice (Simulated)
    console.log(`[AUTOMATION] Generating invoice for Order #${order.id}`);

    // Send Notifications
    await notificationService.send('order_confirmation', {
      orderId: order.id,
      customerName: order.customerName,
      productName: products.map(p => p.name).join(', ')
    }, { email: order.email, phone: order.phone });
  }

  async handleInventoryChange(product: any) {
    const controllerSettings = getControllerSettings();
    let buffer = 3; // default buffer

    if (product.type === 'ps4') {
      buffer = controllerSettings.hysteresis.ps4.stockAlertBuffer;
    } else if (product.type === 'ps5') {
      buffer = controllerSettings.hysteresis.ps5.stockAlertBuffer;
    }

    if (product.stock >= this.rules.lowStockThreshold + buffer) {
      if (this.alertedProducts.has(product.id)) {
        console.log(`[AUTOMATION] Stock recovered for ${product.name}, clearing low stock alert.`);
        this.alertedProducts.delete(product.id);
      }
    } else if (product.stock <= this.rules.lowStockThreshold && this.rules.autoNotifyAdminOnLowStock) {
      if (!this.alertedProducts.has(product.id)) {
        console.log(`[AUTOMATION] ALERT: Low stock for ${product.name}`);
        this.alertedProducts.add(product.id);
      }
    }
  }

  // Rental Automation
  async handleRentalBooking(booking: any) {
    if (this.rules.autoBlockRentalDates) {
      console.log(`[AUTOMATION] Blocking dates ${booking.startDate} to ${booking.endDate} for ${booking.consoleName}`);
    }

    // Calculate Price
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = days * booking.pricePerDay + booking.securityDeposit;

    console.log(`[AUTOMATION] Calculated Rental Price: ${totalPrice}`);

    // Send Notifications
    await notificationService.send('rental_confirmation', {
      customerName: booking.customerName,
      consoleName: booking.consoleName,
      startDate: booking.startDate,
      endDate: booking.endDate
    }, { email: booking.email, phone: booking.phone });

    // Schedule Reminder (Simulated)
    const reminderDate = new Date(end);
    reminderDate.setDate(reminderDate.getDate() - 1);
    console.log(`[AUTOMATION] Scheduled return reminder for ${reminderDate.toISOString()}`);
  }

  // Repair Automation
  async handleRepairRequest(request: any) {
    const ticketId = Math.random().toString(36).substring(7).toUpperCase();
    console.log(`[AUTOMATION] Created Repair Ticket #${ticketId}`);

    // Assign Technician (Simulated)
    const technicians = ['Alex', 'Jordan', 'Sam'];
    const assigned = technicians[Math.floor(Math.random() * technicians.length)];
    console.log(`[AUTOMATION] Assigned technician ${assigned} to Ticket #${ticketId}`);

    await notificationService.send('repair_update', {
      customerName: request.customerName,
      deviceType: request.deviceType,
      ticketId,
      status: 'Technician Assigned'
    }, { email: request.email, phone: request.phone });
  }

  // Sell Request Automation
  async handleSellRequest(request: any) {
    console.log(`[AUTOMATION] New Sell Request for ${request.consoleModel}`);

    await notificationService.send('sell_offer', {
      customerName: request.customerName,
      consoleModel: request.consoleModel,
      offerAmount: request.offerAmount || 'Pending Review'
    }, { email: request.email, phone: request.phone });
  }

  // Generic Workflow Trigger
  async triggerWorkflow(workflowId: string, data: any) {
    console.log(`[AUTOMATION] Triggering Workflow: ${workflowId}`, data);

    switch (workflowId) {
      case 'rental_confirmed':
        await this.handleRentalBooking({
          customerName: data.customerName,
          consoleName: data.productName,
          startDate: data.startDate,
          endDate: data.endDate,
          email: data.email,
          phone: data.phone
        });
        break;
      case 'repair_created':
        await this.handleRepairRequest({
          customerName: data.customerName,
          deviceType: data.device,
          email: data.email,
          phone: data.phone
        });
        break;
      case 'buyback_quote_sent':
        await this.handleSellRequest({
          customerName: data.customerName,
          consoleModel: data.device,
          offerAmount: data.offerAmount,
          email: data.email,
          phone: data.phone
        });
        break;
      default:
        console.log(`[AUTOMATION] No specific handler for workflow: ${workflowId}`);
    }
  }
}

export const automationService = new AutomationService();
