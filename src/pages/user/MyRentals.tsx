import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gamepad2, 
  Calendar, 
  Clock, 
  Package, 
  RefreshCw, 
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Truck,
  CreditCard,
  ExternalLink,
  MessageSquare,
  History,
  FileText
} from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

interface Rental {
  id: string;
  product: string;
  image: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'active' | 'completed' | 'overdue';
  totalPrice: number;
  deposit: number;
  paymentId?: string;
  trackingNumber?: string;
  pickupSlot?: {
    slotId: string;
    label: string;
    startTime: string;
    endTime: string;
  };
  returnSlot?: {
    slotId: string;
    label: string;
    startTime: string;
    endTime: string;
  };
  deliveryMethod?: 'pickup' | 'delivery';
}

export default function MyRentals() {
  const { user } = useAuth();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveType] = useState<'active' | 'history'>('active');

  useEffect(() => {
    if (!user) return;

    const loadRentals = async () => {
      try {
        const token = localStorage.getItem('consolezone_token');
        const response = await fetch(`/api/rentals/user/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json().catch(() => []);
          setRentals(data.map((r: any) => ({ ...r, id: r._id })));
        }
      } catch (error) {
        console.error("API error:", error);
      } finally {
        setLoading(false);
      }
    };
    loadRentals();
  }, [user]);

  const activeRentals = rentals.filter(r => r.status === 'active' || r.status === 'pending' || r.status === 'overdue');
  const pastRentals = rentals.filter(r => r.status === 'completed');

  const displayRentals = activeTab === 'active' ? activeRentals : pastRentals;

  const getStatusColor = (status: Rental['status']) => {
    switch (status) {
      case 'active': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'overdue': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'completed': return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
      default: return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-gaming-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">
          Fleet <span className="text-gaming-accent">Deployments</span>
        </h1>
        <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">
          Manage your active rental hardware and deployment history
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-white/5 rounded-xl w-fit">
        <button
          onClick={() => setActiveType('active')}
          className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
            activeTab === 'active' ? 'bg-gaming-accent text-white shadow-lg' : 'text-gray-500 hover:text-white'
          }`}
        >
          Active Fleet ({activeRentals.length})
        </button>
        <button
          onClick={() => setActiveType('history')}
          className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
            activeTab === 'history' ? 'bg-gaming-accent text-white shadow-lg' : 'text-gray-500 hover:text-white'
          }`}
        >
          Past Missions ({pastRentals.length})
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence mode="wait">
          {displayRentals.length > 0 ? (
            displayRentals.map((rental) => (
              <motion.div
                key={rental.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#080112] border border-white/10 rounded-2xl overflow-hidden group hover:border-gaming-accent/30 transition-all"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Image */}
                  <div className="w-full md:w-48 h-48 bg-black/40 relative">
                    <img src={rental.image} className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#080112] to-transparent opacity-60" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 p-6 space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded border text-[8px] font-black uppercase tracking-tighter ${getStatusColor(rental.status)}`}>
                            {rental.status}
                          </span>
                          <span className="text-[10px] font-mono text-gray-600 uppercase">Deployment ID: #{rental.id.slice(-6)}</span>
                        </div>
                        <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">{rental.product}</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-mono text-gray-500 uppercase">Deployment Cost</p>
                        <p className="text-lg font-black text-white">{formatCurrency(rental.totalPrice)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-white/5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span className="text-[9px] font-black uppercase tracking-widest">Start Date</span>
                        </div>
                        <p className="text-xs font-mono text-white">{rental.startDate}</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span className="text-[9px] font-black uppercase tracking-widest">End Date</span>
                        </div>
                        <p className="text-xs font-mono text-white">{rental.endDate}</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <ShieldCheck className="w-3 h-3" />
                          <span className="text-[9px] font-black uppercase tracking-widest">Security Deposit</span>
                        </div>
                        <p className="text-xs font-mono text-amber-500">{formatCurrency(rental.deposit)}</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <CreditCard className="w-3 h-3" />
                          <span className="text-[9px] font-black uppercase tracking-widest">Payment ID</span>
                        </div>
                        <p className="text-xs font-mono text-gray-400 truncate">{rental.paymentId || 'N/A'}</p>
                      </div>
                    </div>

                    {rental.deliveryMethod === 'pickup' && rental.pickupSlot && (
                      <div className="flex flex-wrap gap-4 pt-4">
                        <div className="bg-[#00d4ff]/10 border border-[#00d4ff]/20 rounded-lg px-4 py-2">
                          <div className="flex items-center gap-2 text-[#00d4ff]">
                            <Truck className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-wider">Pickup Slot</span>
                          </div>
                          <p className="text-sm font-bold text-white mt-1">{rental.pickupSlot.label} ({rental.pickupSlot.startTime} - {rental.pickupSlot.endTime})</p>
                        </div>
                        {rental.returnSlot && (
                          <div className="bg-gaming-accent/10 border border-gaming-accent/20 rounded-lg px-4 py-2">
                            <div className="flex items-center gap-2 text-gaming-accent">
                              <Package className="w-4 h-4" />
                              <span className="text-[10px] font-black uppercase tracking-wider">Return Slot</span>
                            </div>
                            <p className="text-sm font-bold text-white mt-1">{rental.returnSlot.label} ({rental.returnSlot.startTime} - {rental.returnSlot.endTime})</p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-gray-400 hover:bg-gaming-accent hover:text-white hover:border-gaming-accent transition-all">
                          <FileText className="w-3 h-3" /> Rental Agreement
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-gray-400 hover:bg-gaming-accent hover:text-white hover:border-gaming-accent transition-all">
                          <MessageSquare className="w-3 h-3" /> Contact Support
                        </button>
                      </div>
                      {rental.status === 'active' && (
                        <button className="px-6 py-2 bg-gaming-accent text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg shadow-gaming-accent/20 hover:scale-105 active:scale-95 transition-all">
                          Return Request
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 bg-white/[0.02] border border-dashed border-white/10 rounded-3xl"
            >
              <History className="w-12 h-12 text-gray-700 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-gray-500 uppercase tracking-widest italic">No deployments found</h2>
              <p className="text-xs text-gray-600 mt-2">Initializing active scan... 0 matches in fleet matrix.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
