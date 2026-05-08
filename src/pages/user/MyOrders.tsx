import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../lib/utils';
import { ShoppingBag, Package, Truck, CheckCircle, Clock, Search, ExternalLink, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function MyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('consolezone_token');
        const response = await fetch(`${API_URL}/api/orders/user/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json().catch(() => []);
          setOrders(data);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const filteredOrders = orders.filter(order => 
    order._id.toLowerCase().includes(search.toLowerCase()) ||
    order.items.some((item: any) => item.name.toLowerCase().includes(search.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'shipped': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'processing': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'cancelled': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle size={14} />;
      case 'shipped': return <Truck size={14} />;
      case 'processing': return <Package size={14} />;
      default: return <Clock size={14} />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gaming-accent"></div>
        <p className="text-[10px] font-mono text-gaming-accent uppercase tracking-[0.4em] animate-pulse">Scanning Logs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gaming-accent/10 rounded-lg">
              <ShoppingBag className="h-5 w-5 text-gaming-accent" />
            </div>
            <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Purchase <span className="text-gaming-accent">Logs</span></h1>
          </div>
          <p className="text-gaming-muted font-mono text-xs uppercase tracking-widest">Transaction History & Fulfilment Tracking</p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by Order ID or Item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gaming-card border border-gaming-border rounded-xl text-white font-mono text-xs focus:outline-none focus:border-gaming-accent"
          />
        </div>
      </div>

      <div className="space-y-6">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={order._id}
              className="bg-gaming-card border border-gaming-border rounded-3xl overflow-hidden group hover:border-gaming-accent/30 transition-all"
            >
              <div className="p-6 md:p-8 space-y-6">
                {/* Order Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Transaction_ID</p>
                    <h3 className="text-lg font-black text-white uppercase tracking-tighter italic">#{order._id.slice(-12).toUpperCase()}</h3>
                  </div>
                  <div className="flex flex-wrap gap-6">
                    <div className="text-right">
                      <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Date</p>
                      <p className="text-sm font-bold text-white">{new Date(order.date || order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Protocol</p>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-4">
                  {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-6 p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                      <div className="w-16 h-16 rounded-xl bg-black border border-white/10 p-2 shrink-0">
                        <img src={item.image || 'https://via.placeholder.com/150'} alt="" className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-grow space-y-1">
                        <h4 className="text-white font-bold uppercase tracking-wide italic">{item.name}</h4>
                        <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                          QTY: {item.quantity} Ã— {formatCurrency(item.price)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-white italic">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-white/5">
                  <div className="flex items-center gap-4 text-gray-500 font-mono text-[10px] uppercase">
                    <div className="flex items-center gap-2">
                      <CreditCard size={14} className="text-gaming-accent" />
                      <span>{order.paymentMethod || 'Razorpay'}</span>
                    </div>
                    <div className="h-3 w-[1px] bg-white/10" />
                    <span>Fulfilment Secure</span>
                  </div>
                  <div className="flex items-center gap-8 w-full sm:w-auto justify-between">
                    <div className="text-right">
                      <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Total Valuation</p>
                      <p className="text-2xl font-black text-gaming-accent italic tracking-tighter">{formatCurrency(order.total)}</p>
                    </div>
                    <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-white hover:bg-gaming-accent hover:text-black transition-all uppercase tracking-widest flex items-center gap-2">
                      TRACKING <ExternalLink size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-32 text-center space-y-6 bg-gaming-card border border-gaming-border rounded-[3rem] border-dashed">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10">
              <ShoppingBag className="h-10 w-10 text-gray-700" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">No Active Logs</h3>
              <p className="text-gaming-muted font-mono text-sm uppercase tracking-widest">Your purchase history is currently unpopulated.</p>
            </div>
            <Link to="/shop" className="inline-block px-10 py-4 bg-gaming-accent text-black font-black uppercase tracking-widest text-xs rounded-2xl hover:shadow-[0_0_30px_rgba(216, 102, 255,0.4)] transition-all">
              Initialize Armory Sync
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
