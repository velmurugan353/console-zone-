import { useState, useEffect } from 'react';
import { formatCurrency } from '../../lib/utils';
import {
  Search,
  Filter,
  Eye,
  Truck,
  CheckCircle,
  XCircle,
  Calendar,
  X,
  Mail,
  MapPin,
  CreditCard,
  Package,
  Download,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Activity,
  Zap,
  Clock,
  ClipboardList,
  ExternalLink,
  ShieldCheck,
  User,
  AlertCircle,
  Edit2,
  Save,
  Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { automationService } from '../../services/automationService';
import { notificationService } from '../../services/notificationService';
import { invoiceService } from '../../services/invoiceService';
import InvoiceModal from '../../components/admin/InvoiceModal';
import ViewKYCModal from '../../components/admin/ViewKYCModal';

const API_URL = import.meta.env.PROD && !import.meta.env.VITE_API_URL_FORCE 
  ? '' 
  : (import.meta.env.VITE_API_URL || '');

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: 'buy' | 'rent';
  rentalDuration?: number;
  image?: string;
}

interface OrderTimeline {
  status: OrderStatus;
  timestamp: string;
  note: string;
}

interface Order {
  id: string;
  _id?: string;
  userId?: any;
  customer: string;
  email: string;
  phone: string;
  date: string;
  total: number;
  status: OrderStatus;
  items: OrderItem[];
  paymentMethod: string;
  shippingAddress: string;
  trackingNumber?: string;
  internalNotes?: string;
  timeline: OrderTimeline[];
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Order>>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Order | 'items_count'; direction: 'asc' | 'desc' } | null>(null);
  const [bulkConfirm, setBulkConfirm] = useState<{ show: boolean; status: OrderStatus | null }>({ show: false, status: null });
  const [shippingTrackingNumber, setShippingTrackingNumber] = useState('');
  const [showInvoice, setShowInvoice] = useState(false);
  const [kycModalUser, setKycModalUser] = useState<{ id: string, name: string } | null>(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const token = localStorage.getItem('consolezone_token');
        const response = await fetch(`${API_URL}/api/orders`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const fetchedOrders = await response.json().catch(() => []);
          setOrders(fetchedOrders.map((o: any) => ({ ...o, id: o._id })));
        }
      } catch (error) {
        console.error("API error:", error);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  const handleViewKYC = (order: Order) => {
    const userId = typeof order.userId === 'object' ? order.userId._id : order.userId;
    if (userId) {
      setKycModalUser({ id: userId, name: order.customer });
    } else {
      alert("No User ID associated with this order.");
    }
  };

  const handleEditToggle = async () => {
    if (isEditing) {
      if (selectedOrder) {
        const token = localStorage.getItem('consolezone_token');
        try {
          const response = await fetch(`${API_URL}/api/orders/${selectedOrder.id}`, {
            method: 'PATCH',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(editForm)
          });
          if (response.ok) {
            const updated = await response.json();
            setSelectedOrder({ ...updated, id: updated._id });
          }
        } catch (error) {
          console.error('Failed to update order:', error);
          alert('Failed to save changes to database.');
        }
      }
      setIsEditing(false);
    } else {
      setEditForm(selectedOrder || {});
      setIsEditing(true);
    }
  };

  const handleEditChange = (field: keyof Order, value: any) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const closeOrderModal = () => {
    setSelectedOrder(null);
    setIsEditing(false);
  };

  const handleStatusChange = async (id: string, newStatus: OrderStatus, trackingNumber?: string) => {
    const order = orders.find(o => o.id === id);
    if (!order) return;

    const newTimelineEntry: OrderTimeline = {
      status: newStatus,
      timestamp: new Date().toISOString(),
      note: `Status updated to ${newStatus} by admin`
    };

    const updatedOrderData = {
      status: newStatus,
      timeline: [...order.timeline, newTimelineEntry],
      ...(trackingNumber ? { trackingNumber } : {})
    };

    const token = localStorage.getItem('consolezone_token');
    try {
      const response = await fetch(`${API_URL}/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedOrderData)
      });

      if (response.ok) {
        const updated = await response.json();
        const finalOrder = { ...updated, id: updated._id };
        setOrders(prev => prev.map(o => o.id === id ? finalOrder : o));
        if (selectedOrder?.id === id) {
          setSelectedOrder(finalOrder);
        }
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status in database.');
      return;
    }

    // Automation & Notifications
    if (newStatus === 'processing') {
      notificationService.sendNotification('order_processing', order.email, {
        customerName: order.customer,
        orderId: id
      });
    }

    if (newStatus === 'shipped') {
      await automationService.handleOrderPlacement(order as any, order.items as any); // Re-using for stock and logging
      if (trackingNumber) {
        notificationService.sendNotification('shipping_update', order.email, {
          customerName: order.customer,
          orderId: id,
          trackingNumber: trackingNumber
        });
      } else {
        notificationService.sendNotification('order_confirmation', order.email, {
          customerName: order.customer,
          orderId: id,
          productName: order.items.map(i => i.name).join(', ')
        });
      }
    }

    if (newStatus === 'delivered') {
      notificationService.sendNotification('payment_receipt', order.email, {
        customerName: order.customer,
        orderId: id,
        amount: order.total
      });
    }
  };

  const handleManualNotification = (type: 'tracking' | 'reminder' | 'custom') => {
    if (!selectedOrder) return;

    // Simulate sending a manual notification
    if (type === 'tracking' && selectedOrder.trackingNumber) {
      notificationService.sendNotification('shipping_update', selectedOrder.email, {
        customerName: selectedOrder.customer,
        orderId: selectedOrder.id,
        trackingNumber: selectedOrder.trackingNumber
      });
      alert(`Tracking info sent to ${selectedOrder.email}`);
    } else if (type === 'tracking') {
      alert('Cannot send tracking info: No tracking number assigned.');
    } else {
      alert(`Manual ${type} notification triggered for ${selectedOrder.customer}`);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === filteredOrders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredOrders.map(o => o.id));
    }
  };

  const bulkUpdateStatus = (status: OrderStatus) => {
    setBulkConfirm({ show: true, status });
  };

  const confirmBulkAction = () => {
    if (bulkConfirm.status) {
      selectedIds.forEach(id => handleStatusChange(id, bulkConfirm.status!));
      setSelectedIds([]);
      setBulkConfirm({ show: false, status: null });
    }
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    revenue: orders.reduce((acc, o) => acc + (o.status !== 'cancelled' ? o.total : 0), 0),
    avgOrder: orders.length > 0 ? orders.reduce((acc, o) => acc + o.total, 0) / orders.length : 0
  };

  const handleExportManifest = () => {
    const activeOrders = orders.filter(o => o.status === 'processing' || o.status === 'shipped');
    if (activeOrders.length === 0) {
      alert('No active processing orders found for manifest generation.');
      return;
    }

    const csvHeader = 'Order ID,Customer,Email,Phone,Items,Total,Address,Date\n';
    const csvContent = activeOrders.map(o => {
      const itemNames = o.items.map(i => `${i.name} (x${i.quantity})`).join('; ');
      return `${o.id},${o.customer},${o.email},${o.phone},"${itemNames}",${o.total},"${o.shippingAddress.replace(/"/g, '""')}",${o.date}`;
    }).join('\n');

    const blob = new Blob([csvHeader + csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Logistics_Manifest_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.customer.toLowerCase().includes(search.toLowerCase()) ||
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.email.toLowerCase().includes(search.toLowerCase());

    const matchesFilter = filter === 'all' || order.status === filter;
    const matchesDate = !dateFilter || order.date === dateFilter;

    return matchesSearch && matchesFilter && matchesDate;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (!sortConfig) return 0;

    let aValue: any = a[sortConfig.key as keyof Order];
    let bValue: any = b[sortConfig.key as keyof Order];

    if (sortConfig.key === 'items_count') {
      aValue = a.items.reduce((acc, i) => acc + i.quantity, 0);
      bValue = b.items.reduce((acc, i) => acc + i.quantity, 0);
    }

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const requestSort = (key: keyof Order | 'items_count') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const renderSortIcon = (key: keyof Order | 'items_count') => {
    if (sortConfig?.key !== key) return <ChevronDown className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />;
    return sortConfig.direction === 'asc' ? <ChevronUp className="h-3 w-3 text-gaming-accent" /> : <ChevronDown className="h-3 w-3 text-gaming-accent" />;
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'delivered': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'shipped': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'processing': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'cancelled': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gaming-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#080112] border border-white/10 p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity className="h-12 w-12 text-gaming-accent" />
          </div>
          <p className="text-gray-500 text-[10px] font-mono uppercase tracking-widest mb-1">Total Revenue</p>
          <div className="flex items-end space-x-2">
            <p className="text-3xl font-bold text-white tracking-tighter">{formatCurrency(stats.revenue)}</p>
            <span className="text-emerald-500 text-[10px] font-mono mb-1">+12.4%</span>
          </div>
          <div className="w-full bg-white/5 h-1 rounded-full mt-4 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '75%' }}
              className="bg-gaming-accent h-full shadow-[0_0_10px_var(--color-gaming-accent)]"
            />
          </div>
        </div>
        <div className="bg-[#080112] border border-white/10 p-6 rounded-2xl">
          <p className="text-gray-500 text-[10px] font-mono uppercase tracking-widest mb-1">Pending Orders</p>
          <p className="text-3xl font-bold text-amber-500 tracking-tighter">{stats.pending}</p>
          <p className="text-gray-600 text-[10px] font-mono mt-2 uppercase">Awaiting Protocol</p>
        </div>
        <div className="bg-[#080112] border border-white/10 p-6 rounded-2xl">
          <p className="text-gray-500 text-[10px] font-mono uppercase tracking-widest mb-1">Total Orders</p>
          <p className="text-3xl font-bold text-white tracking-tighter">{stats.total}</p>
          <p className="text-gray-600 text-[10px] font-mono mt-2 uppercase">System Matrix</p>
        </div>
        <div className="bg-[#080112] border border-white/10 p-6 rounded-2xl">
          <p className="text-gray-500 text-[10px] font-mono uppercase tracking-widest mb-1">Avg Order Value</p>
          <p className="text-3xl font-bold text-blue-500 tracking-tighter">{formatCurrency(stats.avgOrder)}</p>
          <p className="text-gray-600 text-[10px] font-mono mt-2 uppercase">Efficiency Index</p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-[#080112] p-4 rounded-2xl border border-white/10">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search order matrix..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 bg-black border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-gaming-accent w-full"
          />
        </div>
        <div className="flex items-center space-x-3">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-black border border-white/10 rounded-xl px-4 py-2 text-white font-mono text-xs focus:outline-none focus:border-gaming-accent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-black border border-white/10 rounded-xl px-4 py-2 text-white font-mono text-xs focus:outline-none focus:border-gaming-accent"
          />
          <button
            onClick={handleExportManifest}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest"
            title="Generate Logistics Manifest"
          >
            <ClipboardList className="h-4 w-4" />
            <span className="hidden sm:inline">Manifest</span>
          </button>
          <button className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors text-gray-400 hover:text-white">
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-gaming-accent/10 border border-gaming-accent/30 rounded-xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <span className="text-[10px] font-mono text-gaming-accent uppercase font-bold tracking-widest">
                {selectedIds.length} Orders Selected
              </span>
              <div className="h-4 w-px bg-gaming-accent/30"></div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => bulkUpdateStatus('processing')}
                  className="px-3 py-1 bg-gaming-accent text-black text-[9px] font-mono font-bold uppercase rounded hover:bg-[#9333EA] transition-all"
                >
                  Process
                </button>
                <button
                  onClick={() => bulkUpdateStatus('shipped')}
                  className="px-3 py-1 bg-blue-500 text-white text-[9px] font-mono font-bold uppercase rounded hover:bg-blue-600 transition-all"
                >
                  Ship
                </button>
                <button
                  onClick={() => bulkUpdateStatus('cancelled')}
                  className="px-3 py-1 bg-red-500 text-white text-[9px] font-mono font-bold uppercase rounded hover:bg-red-600 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
            <button
              onClick={() => setSelectedIds([])}
              className="text-[9px] font-mono text-gray-500 uppercase hover:text-white"
            >
              Clear Selection
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Action Confirmation Modal */}
      <AnimatePresence>
        {bulkConfirm.show && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#080112] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-white/10 bg-white/[0.02]">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest font-bold">Security_Protocol_Check</span>
                </div>
                <h2 className="text-xl font-bold text-white tracking-tighter uppercase italic">Confirm Bulk Action</h2>
              </div>

              <div className="p-8 space-y-4">
                <p className="text-gray-400 font-mono text-xs leading-relaxed">
                  You are about to update the status of <span className="text-white font-bold">[{selectedIds.length}]</span> orders to <span className={`font-bold uppercase ${getStatusColor(bulkConfirm.status!)} px-1.5 py-0.5 rounded border border-current/20`}>{bulkConfirm.status}</span>.
                </p>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                  <p className="text-[9px] font-mono text-gray-600 uppercase tracking-widest mb-2">Affected Order Matrix</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedIds.slice(0, 5).map(id => (
                      <span key={id} className="text-[10px] font-mono text-gaming-accent bg-gaming-accent/10 px-2 py-0.5 rounded border border-gaming-accent/20">
                        {id}
                      </span>
                    ))}
                    {selectedIds.length > 5 && (
                      <span className="text-[10px] font-mono text-gray-500 italic">
                        + {selectedIds.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-[9px] font-mono text-gray-500 italic uppercase">
                  This action will trigger automated workflows and customer notifications.
                </p>
              </div>

              <div className="p-6 bg-white/[0.02] border-t border-white/10 flex justify-end space-x-3">
                <button
                  onClick={() => setBulkConfirm({ show: false, status: null })}
                  className="px-6 py-2 bg-white/5 text-gray-400 rounded-xl font-mono text-[10px] uppercase tracking-widest hover:bg-white/10 transition-colors border border-white/5"
                >
                  Abort
                </button>
                <button
                  onClick={confirmBulkAction}
                  className="px-6 py-2 bg-gaming-accent text-black rounded-xl font-bold font-mono text-[10px] uppercase tracking-widest hover:bg-[#9333EA] transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                >
                  Execute Protocol
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Table Matrix */}
      <div className="bg-[#080112] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/[0.02] text-gray-500 text-[10px] font-mono uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredOrders.length && filteredOrders.length > 0}
                    onChange={toggleAll}
                    className="rounded border-white/10 bg-black text-gaming-accent focus:ring-gaming-accent"
                  />
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-white transition-colors group" onClick={() => requestSort('id')}>
                  <div className="flex items-center space-x-1">
                    <span>Order ID</span>
                    {renderSortIcon('id')}
                  </div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-white transition-colors group" onClick={() => requestSort('customer')}>
                  <div className="flex items-center space-x-1">
                    <span>Identity</span>
                    {renderSortIcon('customer')}
                  </div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-white transition-colors group" onClick={() => requestSort('date')}>
                  <div className="flex items-center space-x-1">
                    <span>Timestamp</span>
                    {renderSortIcon('date')}
                  </div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-white transition-colors group" onClick={() => requestSort('items_count')}>
                  <div className="flex items-center space-x-1">
                    <span>Payload</span>
                    {renderSortIcon('items_count')}
                  </div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-white transition-colors group" onClick={() => requestSort('total')}>
                  <div className="flex items-center space-x-1">
                    <span>Valuation</span>
                    {renderSortIcon('total')}
                  </div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-white transition-colors group" onClick={() => requestSort('status')}>
                  <div className="flex items-center space-x-1">
                    <span>Protocol</span>
                    {renderSortIcon('status')}
                  </div>
                </th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs font-mono text-gray-400">
              {sortedOrders.map((order) => (
                <tr key={order.id} className={`hover:bg-white/[0.01] transition-colors group ${selectedIds.includes(order.id) ? 'bg-gaming-accent/5' : ''}`}>
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(order.id)}
                      onChange={() => toggleSelection(order.id)}
                      className="rounded border-white/10 bg-black text-gaming-accent focus:ring-gaming-accent"
                    />
                  </td>
                  <td className="px-6 py-4 text-gaming-accent font-bold tracking-tighter">[{order.id}]</td>
                  <td className="px-6 py-4">
                    <div className="text-white uppercase font-bold tracking-tight">{order.customer}</div>
                    <div className="text-[10px] text-gray-600">{order.paymentMethod}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{order.date}</td>
                  <td className="px-6 py-4 text-gray-300">
                    {order.items.reduce((acc, item) => acc + item.quantity, 0)} Units
                  </td>
                  <td className="px-6 py-4 font-bold text-white">{formatCurrency(order.total)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded border uppercase tracking-tighter ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleStatusChange(order.id, 'processing')}
                          className="p-2 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/20 rounded transition-all"
                          title="Process Protocol"
                        >
                          <Zap className="h-4 w-4" />
                        </button>
                      )}
                      {order.status === 'processing' && (
                        <button
                          onClick={() => {
                            const tracking = window.prompt('Enter tracking number (optional):');
                            if (tracking !== null) {
                              handleStatusChange(order.id, 'shipped', tracking);
                            }
                          }}
                          className="p-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border border-blue-500/20 rounded transition-all"
                          title="Ship Protocol"
                        >
                          <Truck className="h-4 w-4" />
                        </button>
                      )}
                      {order.status === 'shipped' && (
                        <button
                          onClick={() => handleStatusChange(order.id, 'delivered')}
                          className="p-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20 rounded transition-all"
                          title="Finalize Protocol"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleViewKYC(order)}
                        className="p-2 hover:bg-gaming-accent/10 rounded transition-all text-gray-600 hover:text-gaming-accent border border-transparent hover:border-gaming-accent/20"
                        title="View KYC Dossier"
                      >
                        <ShieldCheck className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 hover:bg-white/5 rounded transition-colors text-gray-600 hover:text-white border border-transparent hover:border-white/10"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12 text-gray-600 font-mono text-xs uppercase tracking-widest">
            Order Matrix Empty // No matching records
          </div>
        )}
      </div>

      <ViewKYCModal 
        isOpen={!!kycModalUser}
        onClose={() => setKycModalUser(null)}
        userId={kycModalUser?.id || ''}
        userName={kycModalUser?.name || ''}
      />

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#080112] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <ShieldCheck className="h-3 w-3 text-gaming-accent" />
                    <span className="text-[10px] font-mono text-gaming-accent uppercase tracking-widest">Order_Protocol_Active</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tighter uppercase italic">
                    Order <span className="text-gaming-accent">[{selectedOrder.id}]</span>
                  </h2>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleViewKYC(selectedOrder)}
                    className="flex items-center gap-2 px-4 py-2 bg-gaming-accent/10 text-gaming-accent border border-gaming-accent/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gaming-accent hover:text-black transition-all"
                  >
                    <ShieldCheck size={14} /> Review_KYC
                  </button>
                  <button
                    onClick={handleEditToggle}
                    className={`p-2 rounded-full transition-colors ${isEditing ? 'bg-gaming-accent/20 text-gaming-accent' : 'hover:bg-white/5 text-gray-500 hover:text-white'}`}
                    title={isEditing ? "Save Changes" : "Edit Order"}
                  >
                    {isEditing ? <Save className="h-5 w-5" /> : <Edit2 className="h-5 w-5" />}
                  </button>
                  <button
                    onClick={closeOrderModal}
                    className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-500 hover:text-white"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="flex-grow overflow-y-auto p-8 space-y-8">
                {/* Status & Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 flex flex-col gap-4 p-6 bg-white/[0.02] rounded-2xl border border-white/5">
                    <div className="flex flex-wrap items-center justify-between w-full">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-gray-500 uppercase block">Current Protocol Status</span>
                        <span className={`px-4 py-1 text-xs font-bold rounded border uppercase tracking-widest inline-block ${getStatusColor(selectedOrder.status)}`}>
                          {selectedOrder.status}
                        </span>
                      </div>

                      <div className="flex space-x-2">
                        {/* Manual Notification Triggers */}
                        <button
                          onClick={() => handleManualNotification('tracking')}
                          className="p-2 bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500/20 transition-colors rounded-xl flex items-center justify-center"
                          title="Manually Push Tracking"
                        >
                          <Mail className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleManualNotification('reminder')}
                          className="p-2 bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 transition-colors rounded-xl flex items-center justify-center"
                          title="Send Order Reminder"
                        >
                          <AlertCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="w-full h-px bg-white/10 hidden md:block my-2"></div>

                    <div className="flex flex-wrap gap-2 w-full">
                      {selectedOrder.status === 'pending' && (
                        <button
                          onClick={() => handleStatusChange(selectedOrder.id, 'processing')}
                          className="px-4 py-2 bg-gaming-accent text-black rounded-xl font-bold hover:bg-[#9333EA] transition-all text-[10px] font-mono uppercase tracking-widest"
                        >
                          Initiate Processing
                        </button>
                      )}
                      {selectedOrder.status === 'processing' && (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            placeholder="Tracking Number"
                            value={shippingTrackingNumber}
                            onChange={(e) => setShippingTrackingNumber(e.target.value)}
                            className="bg-black border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-[10px] focus:outline-none focus:border-gaming-accent"
                          />
                          <button
                            onClick={() => {
                              handleStatusChange(selectedOrder.id, 'shipped', shippingTrackingNumber);
                              setShippingTrackingNumber('');
                            }}
                            className="px-4 py-2 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-all text-[10px] font-mono uppercase tracking-widest flex items-center"
                          >
                            <Truck className="mr-2 h-3 w-3" /> Ship Package
                          </button>
                        </div>
                      )}
                      {selectedOrder.status === 'shipped' && (
                        <button
                          onClick={() => handleStatusChange(selectedOrder.id, 'delivered')}
                          className="px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all text-[10px] font-mono uppercase tracking-widest flex items-center"
                        >
                          <CheckCircle className="mr-2 h-3 w-3" /> Finalize Delivery
                        </button>
                      )}
                      {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'delivered' && (
                        <button
                          onClick={() => handleStatusChange(selectedOrder.id, 'cancelled')}
                          className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl font-bold hover:bg-red-500/20 transition-all text-[10px] font-mono uppercase tracking-widest"
                        >
                          Abort Order
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="p-6 bg-white/[0.02] rounded-2xl border border-white/5 flex flex-col justify-center">
                    <span className="text-[10px] font-mono text-gray-500 uppercase block mb-2">Tracking ID</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.trackingNumber || ''}
                        onChange={(e) => handleEditChange('trackingNumber', e.target.value)}
                        className="w-full bg-black border border-white/10 rounded px-2 py-1 text-white font-mono text-sm focus:outline-none focus:border-gaming-accent"
                        placeholder="Enter tracking number"
                      />
                    ) : selectedOrder.trackingNumber ? (
                      <div className="flex items-center justify-between">
                        <span className="text-white font-mono text-sm font-bold">{selectedOrder.trackingNumber}</span>
                        <ExternalLink className="h-3 w-3 text-gaming-accent cursor-pointer" />
                      </div>
                    ) : (
                      <span className="text-gray-600 font-mono text-[10px] italic">No Tracking Assigned</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Identity & Shipping */}
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-[0.3em] flex items-center">
                        <User className="mr-2 h-3 w-3 text-gaming-accent" /> Customer_Identity
                      </h3>
                      <div className="bg-white/[0.02] p-6 rounded-2xl border border-white/5 space-y-3">
                        <div className="flex justify-between items-center">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editForm.customer || ''}
                              onChange={(e) => handleEditChange('customer', e.target.value)}
                              className="w-full bg-black border border-white/10 rounded px-2 py-1 text-white font-bold text-lg focus:outline-none focus:border-gaming-accent"
                              placeholder="Customer Name"
                            />
                          ) : (
                            <span className="text-white font-bold text-lg tracking-tight uppercase">{selectedOrder.customer}</span>
                          )}
                          {!isEditing && <Mail className="h-4 w-4 text-gray-600 hover:text-white cursor-pointer transition-colors" />}
                        </div>
                        {isEditing ? (
                          <input
                            type="email"
                            value={editForm.email || ''}
                            onChange={(e) => handleEditChange('email', e.target.value)}
                            className="w-full bg-black border border-white/10 rounded px-2 py-1 text-gray-400 font-mono text-xs focus:outline-none focus:border-gaming-accent"
                            placeholder="Email Address"
                          />
                        ) : (
                          <p className="text-gray-500 font-mono text-xs">{selectedOrder.email}</p>
                        )}
                        {isEditing ? (
                          <input
                            type="text"
                            maxLength={10}
                            value={editForm.phone || ''}
                            onChange={(e) => handleEditChange('phone', e.target.value.replace(/\D/g, ''))}
                            className={`w-full bg-black border rounded px-2 py-1 font-mono text-xs focus:outline-none transition-colors ${
                              (editForm.phone?.length === 10) ? 'border-emerald-500/50 text-emerald-500' : 'border-white/10 text-gray-400 focus:border-gaming-accent'
                            }`}
                            placeholder="10-Digit Mobile"
                          />
                        ) : (
                          <p className="text-gray-500 font-mono text-xs">{selectedOrder.phone}</p>
                        )}
                        <div className="pt-4 border-t border-white/5 flex items-center text-gray-400 text-[10px] font-mono uppercase">
                          <CreditCard className="mr-2 h-3 w-3 text-gaming-accent" /> {selectedOrder.paymentMethod}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-[0.3em] flex items-center">
                        <MapPin className="mr-2 h-3 w-3 text-gaming-accent" /> Distribution_Node
                      </h3>
                      <div className="bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                        {isEditing ? (
                          <textarea
                            value={editForm.shippingAddress || ''}
                            onChange={(e) => handleEditChange('shippingAddress', e.target.value)}
                            className="w-full bg-black border border-white/10 rounded px-2 py-1 text-gray-400 font-mono text-xs focus:outline-none focus:border-gaming-accent min-h-[80px] resize-none"
                            placeholder="Shipping Address"
                          />
                        ) : (
                          <p className="text-gray-400 font-mono text-xs leading-relaxed uppercase">
                            {selectedOrder.shippingAddress}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Timeline & Notes */}
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-[0.3em] flex items-center">
                        <Clock className="mr-2 h-3 w-3 text-gaming-accent" /> Event_Log
                      </h3>
                      <div className="bg-white/[0.02] p-6 rounded-2xl border border-white/5 space-y-6">
                        {selectedOrder.timeline.map((event, idx) => (
                          <div key={idx} className="flex gap-4 relative">
                            {idx !== selectedOrder.timeline.length - 1 && (
                              <div className="absolute left-[5px] top-4 bottom-[-24px] w-px bg-white/10"></div>
                            )}
                            <div className={`w-2.5 h-2.5 rounded-full mt-1 z-10 ${idx === selectedOrder.timeline.length - 1 ? 'bg-gaming-accent shadow-[0_0_8px_var(--color-gaming-accent)]' : 'bg-gray-700'
                              }`}></div>
                            <div className="space-y-1">
                              <p className="text-white text-[10px] font-bold uppercase tracking-tight">{event.note}</p>
                              <p className="text-[9px] font-mono text-gray-600 uppercase">{event.timestamp}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-[0.3em] flex items-center">
                        <ClipboardList className="mr-2 h-3 w-3 text-gaming-accent" /> Internal_Notes
                      </h3>
                      <textarea
                        placeholder="Add internal protocol notes..."
                        className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-[10px] font-mono text-gray-400 focus:outline-none focus:border-gaming-accent/30 min-h-[100px] resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Payload Manifest */}
                <div className="space-y-4">
                  <h3 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-[0.3em] flex items-center">
                    <Package className="mr-2 h-3 w-3 text-gaming-accent" /> Payload_Manifest
                  </h3>
                  <div className="bg-white/[0.02] rounded-2xl border border-white/5 overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-white/[0.02] text-gray-500 text-[10px] font-mono uppercase tracking-widest">
                        <tr>
                          <th className="px-6 py-4">Asset</th>
                          <th className="px-6 py-4">Type</th>
                          <th className="px-6 py-4 text-center">Qty</th>
                          <th className="px-6 py-4 text-right">Valuation</th>
                          <th className="px-6 py-4 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-xs font-mono">
                        {selectedOrder.items.map((item) => (
                          <tr key={item.id}>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-3">
                                <img src={item.image} alt={item.name} className="w-8 h-8 rounded object-cover border border-white/10" />
                                <span className="text-white font-bold uppercase tracking-tight">{item.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-tighter ${item.type === 'rent' ? 'text-blue-400 border-blue-500/20 bg-blue-500/10' : 'text-gaming-accent border-gaming-accent/20 bg-gaming-accent/10'
                                }`}>
                                {item.type}
                                {item.type === 'rent' && ` [${item.rentalDuration}D]`}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center text-gray-400">{item.quantity}</td>
                            <td className="px-6 py-4 text-right text-gray-400">{formatCurrency(item.price)}</td>
                            <td className="px-6 py-4 text-right text-white font-bold">
                              {formatCurrency(item.price * item.quantity)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-white/[0.02]">
                        <tr>
                          <td colSpan={4} className="px-6 py-4 text-right text-gray-500 font-bold uppercase tracking-widest text-[9px]">Subtotal</td>
                          <td className="px-6 py-4 text-right text-white font-bold">{formatCurrency(selectedOrder.total)}</td>
                        </tr>
                        <tr>
                          <td colSpan={4} className="px-6 py-4 text-right text-gray-500 font-bold uppercase tracking-widest text-[9px]">Logistics_Fee</td>
                          <td className="px-6 py-4 text-right text-emerald-400 font-bold uppercase tracking-widest text-[9px]">Waived</td>
                        </tr>
                        <tr className="border-t border-white/10">
                          <td colSpan={4} className="px-6 py-4 text-right text-white font-bold uppercase tracking-widest text-[10px]">Total_Valuation</td>
                          <td className="px-6 py-4 text-right text-gaming-accent text-lg font-bold tracking-tighter">{formatCurrency(selectedOrder.total)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white/[0.02] border-t border-white/10 flex justify-end space-x-3">
                <button
                  onClick={() => setShowInvoice(true)}
                  className="px-6 py-2 bg-white/5 text-gaming-accent rounded-xl font-mono text-[10px] uppercase tracking-widest hover:bg-white/10 transition-colors border border-gaming-accent/20 flex items-center gap-2"
                >
                  <Printer size={12} />
                  Generate Invoice
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-6 py-2 bg-gaming-accent text-black rounded-xl font-bold font-mono text-[10px] uppercase tracking-widest hover:bg-[#9333EA] transition-all"
                >
                  Close Matrix
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Invoice Generator Modal */}
      <AnimatePresence>
        {showInvoice && selectedOrder && (
          <InvoiceModal 
            data={invoiceService.formatOrderData(selectedOrder)} 
            onClose={() => setShowInvoice(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

