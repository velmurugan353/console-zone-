import { useState, useEffect } from 'react';

const ENV = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : ({} as any);
const API_URL = ENV.PROD && !ENV.VITE_API_URL_FORCE 
  ? '' 
  : (ENV.VITE_API_URL || '');

export interface AdminPriorityItem {
  id: string;
  kind: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  subtitle: string;
  timestamp: Date | null;
  actionPath: string;
}

export interface AdminInventoryBreakdownItem {
  name: string;
  value: number;
  color: string;
}

export interface AdminActivityItem {
  id: string;
  type: 'ORDER' | 'RENTAL' | 'KYC' | 'SYSTEM' | 'REPAIR';
  title: string;
  subtitle: string;
  timestamp: Date;
  status: string;
  severity?: 'critical' | 'high' | 'medium' | 'low';
  message?: string;
}

export interface AdminOverview {
  metrics: {
    grossRevenue: number;
    ordersInFlight: number;
    activeRentals: number;
    fleetReady: number;
    fleetReadyRate: number;
    kycQueue: number;
    criticalSignals: number;
  };
  revenueTrend: { date: string; revenue: number }[];
  inventoryDistribution: AdminInventoryBreakdownItem[];
  priorityQueue: AdminPriorityItem[];
  activityFeed: AdminActivityItem[];
}

export const buildAdminOverview = (data: {
  now: Date;
  orders: any[];
  rentals: any[];
  inventory: any[];
  users: any[];
  kyc: any[];
  notifications: any[];
}): AdminOverview => {
  const { now, orders, rentals, inventory, kyc, notifications } = data;

  // Metrics
  const grossRevenue = 
    orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + (o.total || 0), 0) +
    rentals.filter(r => r.status !== 'cancelled').reduce((sum, r) => sum + (r.totalPrice || 0) + (r.lateFees || 0), 0);

  const ordersInFlight = orders.filter(o => o.status === 'processing').length;
  const activeRentals = rentals.filter(r => r.status === 'active' || r.status === 'late').length;
  const fleetReady = inventory.filter(i => i.status === 'Available').length;
  const fleetReadyRate = inventory.length > 0 ? fleetReady / inventory.length : 0;
  const kycQueue = kyc.filter(k => k.status === 'MANUAL_REVIEW').length;
  const criticalSignals = notifications.filter(n => !n.read && (n.priority === 'high' || n.priority === 'critical')).length;

  // Revenue Trend (7 days)
  const revenueTrend = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split('T')[0];
    
    const dayRevenue = 
      orders.filter(o => o.date === dateStr && o.status !== 'cancelled').reduce((sum, o) => sum + (o.total || 0), 0) +
      rentals.filter(r => r.startDate?.startsWith(dateStr) && r.status !== 'cancelled').reduce((sum, r) => sum + (r.totalPrice || 0), 0);

    return { date: dateStr, revenue: dayRevenue };
  });

  // Inventory Distribution
  const statusGroups = inventory.reduce((acc: Record<string, number>, item) => {
    const s = item.status || 'Unknown';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const colors: Record<string, string> = {
    'Available': '#10B981',
    'Rented': '#3B82F6',
    'Maintenance': '#F59E0B',
    'Retired': '#EF4444'
  };

  const inventoryDistribution: AdminInventoryBreakdownItem[] = Object.entries(statusGroups).map(([name, value]) => ({
    name,
    value: value as number,
    color: colors[name] || '#6B7280'
  }));

  // Priority Queue
  const priorityQueue: AdminPriorityItem[] = [
    ...notifications.filter(n => !n.read && (n.priority === 'high' || n.priority === 'critical')).map(n => ({
      id: n.id || n._id,
      kind: 'notification',
      severity: (n.priority as any) || 'low',
      title: n.title,
      subtitle: n.message,
      timestamp: n.timestamp ? new Date(n.timestamp) : new Date(),
      actionPath: n.actionPath || '/admin'
    })),
    ...rentals.filter(r => r.status === 'late').map(r => ({
      id: r.id || r._id,
      kind: 'rental',
      severity: 'high' as const,
      title: `Overdue Rental: ${r.product}`,
      subtitle: `Rental #${r.id || r._id} is past due date`,
      timestamp: r.endDate ? new Date(r.endDate) : new Date(),
      actionPath: `/admin/operations?tab=rentals`
    })),
    ...kyc.filter(k => k.status === 'MANUAL_REVIEW').map(k => ({
      id: k.id || k._id,
      kind: 'kyc',
      severity: 'medium' as const,
      title: 'KYC Manual Review',
      subtitle: `Verification needed for ${k.fullName}`,
      timestamp: k.submittedAt ? new Date(k.submittedAt) : new Date(),
      actionPath: '/admin/kyc'
    })),
    ...inventory.filter(i => i.status === 'Maintenance').map(i => ({
      id: i.id || i._id,
      kind: 'inventory',
      severity: 'low' as const,
      title: 'Unit Maintenance',
      subtitle: `${i.name} requires service`,
      timestamp: i.lastService ? new Date(i.lastService) : new Date(),
      actionPath: '/admin/inventory'
    }))
  ].sort((a, b) => {
    const weights = { critical: 4, high: 3, medium: 2, low: 1 };
    return weights[b.severity] - weights[a.severity];
  });

  // Activity Feed
  const activityFeed: AdminActivityItem[] = [
    ...orders.map(o => ({
      id: o.id || o._id,
      type: 'ORDER' as const,
      title: `New Order: #${o.id || o._id}`,
      subtitle: `${o.customer} placed an order for ₹${o.total}`,
      timestamp: o.date ? new Date(o.date) : new Date(),
      status: o.status,
      message: `${o.customer} ordered mission supplies`,
      severity: 'low' as const
    })),
    ...rentals.map(r => ({
      id: r.id || r._id,
      type: 'RENTAL' as const,
      title: `Rental Update: #${r.id || r._id}`,
      subtitle: `${r.product} status changed to ${r.status}`,
      timestamp: r.startDate ? new Date(r.startDate) : new Date(),
      status: r.status,
      message: `${r.product} is now ${r.status}`,
      severity: r.status === 'late' ? 'high' as const : 'low' as const
    })),
    ...kyc.map(k => ({
      id: k.id || k._id,
      type: 'KYC' as const,
      title: `KYC Submitted: ${k.fullName}`,
      subtitle: `New verification request status: ${k.status}`,
      timestamp: k.submittedAt ? new Date(k.submittedAt) : new Date(),
      status: k.status,
      message: `KYC for ${k.fullName} is ${k.status}`,
      severity: k.status === 'MANUAL_REVIEW' ? 'medium' as const : 'low' as const
    })),
    ...notifications.map(n => ({
      id: n.id || n._id,
      type: 'SYSTEM' as const,
      title: n.title,
      subtitle: n.message,
      timestamp: n.timestamp ? new Date(n.timestamp) : new Date(),
      status: n.read ? 'read' : 'unread',
      message: n.message,
      severity: (n.priority as any) || 'low'
    }))
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
   .slice(0, 8);

  return {
    metrics: {
      grossRevenue,
      ordersInFlight,
      activeRentals,
      fleetReady,
      fleetReadyRate,
      kycQueue,
      criticalSignals
    },
    revenueTrend,
    inventoryDistribution,
    priorityQueue,
    activityFeed
  };
};

export const useAdminOverview = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('consolezone_token');
        const headers = { 'Authorization': `Bearer ${token}` };

        const [ordersRes, rentalsRes, usersRes, inventoryRes, kycRes] = await Promise.all([
          fetch(`${API_URL}/api/orders`, { headers }),
          fetch(`${API_URL}/api/rentals`, { headers }),
          fetch(`${API_URL}/api/users`, { headers }),
          fetch(`${API_URL}/api/inventory`, { headers }),
          fetch(`${API_URL}/api/kyc-all`, { headers })
        ]);

        const orders = await ordersRes.json().catch(() => []);
        const rentals = await rentalsRes.json().catch(() => []);
        const users = await usersRes.json().catch(() => []);
        const inventory = await inventoryRes.json().catch(() => []);
        const kyc = await kycRes.json().catch(() => []);
        const notifications: any[] = []; // Admin notifications not implemented yet on backend

        const data = buildAdminOverview({
          now: new Date(),
          orders: Array.isArray(orders) ? orders : [],
          rentals: Array.isArray(rentals) ? rentals : [],
          inventory: Array.isArray(inventory) ? inventory : [],
          users: Array.isArray(users) ? users : [],
          kyc: Array.isArray(kyc) ? kyc : [],
          notifications
        });

        setOverview(data);
        setLastUpdated(new Date());
        setLoading(false);
      } catch (e) {
        console.error("Dashboard data fetch failed:", e);
        setError("Synchronization failure with Command Matrix.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    loading,
    error,
    lastUpdated,
    metrics: overview?.metrics || {
      grossRevenue: 0,
      ordersInFlight: 0,
      activeRentals: 0,
      fleetReady: 0,
      fleetReadyRate: 0,
      kycQueue: 0,
      criticalSignals: 0
    },
    revenueTrend: overview?.revenueTrend || [],
    inventoryDistribution: overview?.inventoryDistribution || [],
    priorityQueue: overview?.priorityQueue || [],
    activityFeed: overview?.activityFeed || []
  };
};
