import { useState, useEffect, useMemo } from 'react';
import {
  ShoppingBag,
  Gamepad2,
  Wrench,
  CreditCard,
  Clock,
  Package,
  Shield,
  Trophy,
  Activity,
  ArrowRight,
  Terminal,
  Cpu,
  Zap
} from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function UserDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchUserData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('consolezone_token');
        const headers = {
          'Authorization': `Bearer ${token}`
        };
        const [ordersRes, rentalsRes] = await Promise.all([
          fetch(`${API_URL}/api/orders/user/${user.id}`, { headers }),
          fetch(`${API_URL}/api/rentals/user/${user.id}`, { headers })
        ]);

        if (ordersRes.ok) {
          const ordersData = await ordersRes.json().catch(() => []);
          setOrders(ordersData.map((o: any) => ({ ...o, id: o._id, type: 'order' })));
        }

        if (rentalsRes.ok) {
          const rentalsData = await rentalsRes.json().catch(() => []);
          setRentals(rentalsData.map((r: any) => ({ ...r, id: r._id, type: 'rental' })));
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const stats = useMemo(() => {
    const activeRentals = rentals.filter(r => r.status === 'active' || r.status === 'pending').length;
    const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;
    const totalSpent = orders.reduce((acc, o) => acc + (o.total || 0), 0) +
      rentals.reduce((acc, r) => acc + (r.totalPrice || 0), 0);

    return [
      { label: 'Active Rentals', value: activeRentals.toString(), icon: Gamepad2, color: 'text-blue-400', bg: 'bg-blue-400/10' },
      { label: 'Pending Orders', value: pendingOrders.toString(), icon: ShoppingBag, color: 'text-green-400', bg: 'bg-green-400/10' },
      { label: 'Repair Status', value: 'N/A', icon: Wrench, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
      { label: 'Total Spent', value: formatCurrency(totalSpent), icon: CreditCard, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    ];
  }, [orders, rentals]);

  const recentActivity = useMemo(() => {
    const combined = [
      ...orders.map(o => ({
        id: o.id,
        type: 'order',
        title: `Order #${o.id.slice(-8).toUpperCase()}`,
        date: new Date(o.date || o.createdAt).toLocaleDateString(),
        status: o.status,
        amount: o.total || 0,
        timestamp: new Date(o.date || o.createdAt).getTime()
      })),
      ...rentals.map(r => ({
        id: r.id,
        type: 'rental',
        title: `${r.product || 'Console'} Rental`,
        date: new Date(r.startDate || r.createdAt).toLocaleDateString(),
        status: r.status,
        amount: r.totalPrice || 0,
        timestamp: new Date(r.startDate || r.createdAt).getTime()
      }))
    ];

    return combined.sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);
  }, [orders, rentals]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gaming-accent"></div>
        <p className="text-[10px] font-mono text-gaming-accent uppercase tracking-[0.4em] animate-pulse">Syncing Matrix...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header & XP System */}
      <div className="flex flex-col lg:flex-row gap-8 items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gaming-accent/10 rounded-lg">
              <Terminal className="h-5 w-5 text-gaming-accent" />
            </div>
            <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Command <span className="text-gaming-accent">Matrix</span></h1>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-gaming-muted font-mono text-xs uppercase tracking-widest">Operator: {user?.name} // Session_Active</p>
            <div className="h-3 w-px bg-white/10" />
            <p className="text-gaming-accent font-mono text-[10px] font-black uppercase tracking-[0.2em]">{user?.consolezone_id || 'ID_UNASSIGNED'}</p>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="w-full lg:w-96 bg-gaming-card border border-gaming-border p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Trophy size={60} className="text-gaming-accent" />
          </div>
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-[10px] font-mono text-gaming-accent uppercase tracking-[0.2em] mb-1">Gamer Level</p>
              <h3 className="text-xl font-black text-white italic">LEGENDARY_RANK</h3>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-gaming-muted">14,200 / 15,000 XP</span>
            </div>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '85%' }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-gaming-accent to-gaming-secondary" 
            />
          </div>
          <p className="text-[9px] text-gaming-muted mt-3 font-mono">NEXT_UNLOCK: <span className="text-white">FREE_CONTROLLER_RENTAL</span></p>
        </div>
      </div>

      {/* Stats Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-gaming-card border border-gaming-border p-6 rounded-2xl relative overflow-hidden group hover:border-gaming-accent/30 transition-all">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} w-fit mb-4`}>
              <stat.icon size={20} />
            </div>
            <p className="text-[10px] font-mono text-gaming-muted uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-white tracking-tighter italic">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Power Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Live Fleet Monitor */}
        <div className="md:col-span-2 bg-gaming-card border border-gaming-border rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gaming-accent/5 blur-[100px] -z-10" />
          
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gaming-accent/10 rounded-lg text-gaming-accent">
                <Cpu className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-white uppercase tracking-tight">Active Fleet Monitor</h2>
            </div>
            <Link to="/dashboard/rentals" className="text-[10px] font-black text-gaming-accent hover:underline uppercase tracking-widest">Access All Assets</Link>
          </div>

          <div className="space-y-6">
            {rentals.filter(r => r.status === 'active' || r.status === 'pending').length > 0 ? (
              rentals.filter(r => r.status === 'active' || r.status === 'pending').map((rental) => (
                <div key={rental.id} className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-white/[0.02] border border-white/5 rounded-2xl group hover:border-gaming-accent/30 transition-all">
                  <div className="w-20 h-20 rounded-xl bg-black border border-white/10 p-2 shrink-0">
                    <img src={rental.image || 'https://via.placeholder.com/150'} alt="" className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-grow space-y-2 text-center sm:text-left">
                    <h4 className="text-white font-bold uppercase tracking-wide italic">{rental.product || rental.name}</h4>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-[10px] font-mono text-gaming-muted">
                      <span className="flex items-center gap-1"><Shield size={12} className="text-emerald-500" /> SECURE</span>
                      <span className="flex items-center gap-1 font-bold text-white">STATUS: {rental.status.toUpperCase()}</span>
                      {rental.endDate && <span className="flex items-center gap-1">DUE: {new Date(rental.endDate).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <button className="px-6 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black text-white hover:bg-gaming-accent hover:text-black transition-all uppercase tracking-widest">
                    DETAILS
                  </button>
                </div>
              ))
            ) : (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                  <Gamepad2 className="h-8 w-8 text-gaming-muted" />
                </div>
                <p className="text-gaming-muted font-mono text-sm">NO_ACTIVE_ASSETS_DETECTED</p>
                <Link to="/rentals">
                  <button className="text-gaming-accent text-[10px] font-black uppercase tracking-widest border-b border-gaming-accent/30 hover:border-gaming-accent transition-all">Initialize New Mission</button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Matrix */}
        <div className="bg-gaming-card border border-gaming-border rounded-3xl p-8 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white uppercase tracking-tight">Command Actions</h2>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {[
              { label: 'Manage Identity (KYC)', icon: Shield, path: '/dashboard/kyc', color: 'text-emerald-400' },
              { label: 'Address Database', icon: Package, path: '/dashboard/addresses', color: 'text-blue-400' },
              { label: 'Financial Logs', icon: CreditCard, path: '/dashboard/orders', color: 'text-purple-400' },
              { label: 'Signal Settings', icon: Zap, path: '/dashboard/notifications', color: 'text-amber-400' }
            ].map((action) => (
              <Link 
                key={action.label} 
                to={action.path}
                className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl group hover:border-gaming-accent transition-all"
              >
                <div className="flex items-center gap-3">
                  <action.icon className={`h-4 w-4 ${action.color}`} />
                  <span className="text-[10px] font-black text-gray-400 group-hover:text-white uppercase tracking-widest">{action.label}</span>
                </div>
                <ArrowRight size={14} className="text-gaming-muted group-hover:text-gaming-accent group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Grid */}
      <div className="bg-gaming-card border border-gaming-border rounded-3xl p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-white uppercase tracking-tight italic">Mission Log <span className="text-gaming-accent/50">// History</span></h2>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-mono text-gaming-muted uppercase">Updates Synchronized</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-white/5">
                <th className="pb-4 text-[10px] font-black text-gaming-muted uppercase tracking-[0.2em]">Transaction_ID</th>
                <th className="pb-4 text-[10px] font-black text-gaming-muted uppercase tracking-[0.2em]">Operation_Type</th>
                <th className="pb-4 text-[10px] font-black text-gaming-muted uppercase tracking-[0.2em]">Timestamp</th>
                <th className="pb-4 text-[10px] font-black text-gaming-muted uppercase tracking-[0.2em]">Payload</th>
                <th className="pb-4 text-[10px] font-black text-gaming-muted uppercase tracking-[0.2em] text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentActivity.map((activity) => (
                <tr key={activity.id} className="group hover:bg-white/[0.01] transition-colors">
                  <td className="py-4 text-xs font-mono text-gaming-accent uppercase">#{activity.id.slice(-8).toUpperCase()}</td>
                  <td className="py-4">
                    <span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-tighter ${
                      activity.type === 'order' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'
                    }`}>
                      {activity.type}
                    </span>
                  </td>
                  <td className="py-4 text-xs text-gray-500 font-mono uppercase">{activity.date}</td>
                  <td className="py-4 text-sm font-bold text-white uppercase italic">{activity.title}</td>
                  <td className="py-4 text-right">
                    <span className="text-xs font-black text-white italic">{formatCurrency(activity.amount)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
