import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../../lib/utils';
import { rentalAutomationService } from '../../services/rentalAutomation';
import {
  Calendar as CalendarIcon,
  CheckCircle,
  AlertTriangle,
  Clock,
  XCircle,
  Search,
  List,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Activity,
  Zap,
  Package,
  RefreshCw,
  Edit2,
  Save,
  X,
  Mail,
  User,
  Trash2,
  ShieldCheck,
  Eye,
  LogIn,
  LogOut,
  ClipboardCheck,
  DollarSign,
  Camera,
  Wrench,
  CheckSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import ViewKYCModal from '../../components/admin/ViewKYCModal';

const API_URL = import.meta.env.PROD && !import.meta.env.VITE_API_URL_FORCE 
  ? '' 
  : (import.meta.env.VITE_API_URL || '');

type RentalStatus = 'active' | 'completed' | 'late' | 'pending';

interface RentalTimeline {
  status: string;
  timestamp: string;
  note: string;
}

interface Rental {
  id: string;
  _id?: string;
  userId?: any; // Can be string or populated object
  user: string;
  email: string;
  phone?: string;
  product: string;
  image: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  deposit: number;
  status: RentalStatus;
  timeline: RentalTimeline[];
  returnCondition?: string;
  repairCost?: number;
}

export default function AdminRentals() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Rental>>({});
  const [kycModalUser, setKycModalUser] = useState<{ id: string, name: string } | null>(null);
  const [checkoutRental, setCheckoutRental] = useState<Rental | null>(null);
  const [checkinRental, setCheckinRental] = useState<Rental | null>(null);
  const [cancelRental, setCancelRental] = useState<Rental | null>(null);
  const [checkoutForm, setCheckoutForm] = useState({ unitId: '', notes: '' });
  const [checkinForm, setCheckinForm] = useState({ condition: 'good' as 'good' | 'minor' | 'major', repairCost: 0, notes: '', imageUrl: '' });
  const [cancelForm, setCancelForm] = useState({ reason: '', refundDeposit: true });
  const [isProcessing, setIsProcessing] = useState(false);

  const loadRentals = async () => {
    try {
      const token = localStorage.getItem('consolezone_token');
      const response = await fetch(`${API_URL}/api/rentals`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const fetchedRentals = await response.json().catch(() => []);
        setRentals(fetchedRentals.map((r: any) => ({ 
          ...r, 
          id: r._id || r.id,
          user: r.user || 'Anonymous User',
          product: r.product || r.name || 'Unknown Hardware'
        })));
      }
    } catch (error) {
      console.error("API error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRentals();
  }, []);

  const handleStatusChange = async (id: string, newStatus: RentalStatus) => {
    const rental = rentals.find(r => r.id === id);
    if (!rental) return;

    const updatedTimeline = [...(rental.timeline || []), { 
      status: newStatus, 
      timestamp: new Date().toISOString(), 
      note: `Status protocol updated to ${newStatus} by admin` 
    }];

    const token = localStorage.getItem('consolezone_token');
    try {
      const response = await fetch(`${API_URL}/api/rentals/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus, timeline: updatedTimeline })
      });

      if (response.ok) {
        const updated = await response.json().catch(() => ({}));
        const final = { ...updated, id: updated._id };
        setRequests(prev => prev.map(r => r.id === id ? final : r));
        if (selectedRental?.id === id) setSelectedRental(final);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleViewKYC = (rental: Rental) => {
    const userId = typeof rental.userId === 'object' ? rental.userId._id : rental.userId;
    if (userId) {
      setKycModalUser({ id: userId, name: rental.user });
    } else {
      alert("No User ID associated with this rental.");
    }
  };

  const handleEditToggle = async () => {
    if (isEditing && selectedRental) {
      const token = localStorage.getItem('consolezone_token');
      try {
        const response = await fetch(`${API_URL}/api/rentals/${selectedRental.id}`, {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(editForm)
        });
        if (response.ok) {
          const updated = await response.json().catch(() => ({}));
          const final = { ...updated, id: updated._id };
          setRentals(prev => prev.map(r => r.id === final.id ? final : r));
          setSelectedRental(final);
          alert('Rental record updated in matrix.');
        }
      } catch (error) {
        alert('Update failed.');
      }
      setIsEditing(false);
    } else {
      setEditForm(selectedRental || {});
      setIsEditing(true);
    }
  };

  const handleCheckout = async () => {
    if (!checkoutRental) return;
    setIsProcessing(true);
    try {
      const result = await rentalAutomationService.triggerWorkflow('rental_checkout', {
        rentalId: checkoutRental.id,
        unitId: checkoutForm.unitId,
        notes: checkoutForm.notes
      });

      if (result) {
        const updated = { ...checkoutRental, ...result, id: result.id } as unknown as Rental;
        setRentals(prev => prev.map(r => r.id === checkoutRental.id ? updated : r));
        setCheckoutRental(null);
        setCheckoutForm({ unitId: '', notes: '' });
        alert('Check-out successful - Unit deployed & history updated.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Checkout failed.');
    }
    setIsProcessing(false);
  };

  const handleCheckin = async () => {
    if (!checkinRental) return;
    setIsProcessing(true);
    try {
      const result = await rentalAutomationService.triggerWorkflow('rental_checkin', {
        rentalId: checkinRental.id,
        condition: checkinForm.condition,
        repairCost: checkinForm.repairCost,
        notes: checkinForm.notes,
        imageUrl: checkinForm.imageUrl
      });

      if (result) {
        const updated = { ...checkinRental, ...result, id: result.id } as unknown as Rental;
        setRentals(prev => prev.map(r => r.id === checkinRental.id ? updated : r));
        setCheckinRental(null);
        setCheckinForm({ condition: 'good', repairCost: 0, notes: '', imageUrl: '' });
        alert('Check-in successful - Rental completed & history updated.');
      }
    } catch (error) {
      console.error('Checkin error:', error);
      alert('Check-in failed.');
    }
    setIsProcessing(false);
  };

  const handleCancel = async () => {
    if (!cancelRental) return;
    setIsProcessing(true);
    try {
      const result = await rentalAutomationService.triggerWorkflow('rental_cancel', {
        rentalId: cancelRental.id,
        reason: cancelForm.reason,
        refundDeposit: cancelForm.refundDeposit
      });

      if (result) {
        const updated = { ...cancelRental, ...result, id: result.id } as Rental;
        setRentals(prev => prev.map(r => r.id === cancelRental.id ? updated : r));
        setCancelRental(null);
        setCancelForm({ reason: '', refundDeposit: true });
        alert('Rental cancelled & history updated.');
      }
    } catch (error) {
      console.error('Cancel error:', error);
      alert('Cancellation failed.');
    }
    setIsProcessing(false);
  };

  const filteredRentals = rentals.filter(rental => {
    const matchesSearch = 
      (rental.user || '').toLowerCase().includes(search.toLowerCase()) ||
      (rental.product || '').toLowerCase().includes(search.toLowerCase()) ||
      (rental.id || '').toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || rental.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'completed': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'late': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'pending': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default: return 'text-gray-400 bg-white/5 border-white/10';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <RefreshCw className="h-10 w-10 text-gaming-accent animate-spin" />
        <p className="text-[10px] font-mono text-gaming-accent uppercase tracking-[0.4em] animate-pulse">Scanning Fleet...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Deployed_Units', val: rentals.filter(r => r.status === 'active').length, icon: Package, color: 'text-blue-500' },
          { label: 'Late_Signals', val: rentals.filter(r => r.status === 'late').length, icon: Clock, color: 'text-red-500' },
          { label: 'Pending_Orders', val: rentals.filter(r => r.status === 'pending').length, icon: Activity, color: 'text-amber-500' },
          { label: 'Total_Deployments', val: rentals.length, icon: Zap, color: 'text-gaming-accent' }
        ].map((stat, i) => (
          <div key={i} className="bg-[#080112] border border-white/10 p-6 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">{stat.label}</span>
              <stat.icon size={14} className={stat.color} />
            </div>
            <p className="text-3xl font-black text-white italic tracking-tighter">{stat.val}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 bg-[#080112] p-4 rounded-2xl border border-white/10">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search fleet database (User, Hardware, ID)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 bg-black border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-gaming-accent w-full"
          />
        </div>
        <div className="flex items-center space-x-2">
          {(['all', 'active', 'pending', 'late', 'completed', 'cancelled'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
                filter === f ? 'bg-gaming-accent text-white border-gaming-accent' : 'bg-black text-gray-500 border-white/10 hover:border-white/20'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="bg-[#080112] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/[0.02] text-gray-500 text-[10px] font-mono uppercase tracking-widest border-b border-white/5">
              <tr>
                <th className="px-6 py-4">Hardware_Node</th>
                <th className="px-6 py-4">Identity</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs font-mono text-gray-400">
              {filteredRentals.map((rental) => (
                <tr key={rental.id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-black border border-white/10 p-1 shrink-0">
                        <img src={rental.image} alt="" className="w-full h-full object-contain" />
                      </div>
                      <div className="text-white font-bold uppercase italic">{rental.product}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-300 font-bold">{rental.user}</div>
                    <div className="flex items-center gap-2">
                      <div className="text-[9px] text-gray-600">{rental.email}</div>
                      {rental.userId && (
                        <Link 
                          to={`/admin/kyc?search=${rental.user}`}
                          className="text-[8px] font-black text-gaming-accent uppercase border border-gaming-accent/20 px-1 rounded hover:bg-gaming-accent/10 transition-all flex items-center gap-1"
                        >
                          <ShieldCheck size={8} /> Verify_Identity
                        </Link>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2"><CalendarIcon size={10} className="text-gaming-accent"/> <span>{new Date(rental.startDate).toLocaleDateString()}</span></div>
                      <div className="flex items-center gap-2"><Clock size={10} className="text-red-500"/> <span>{new Date(rental.endDate).toLocaleDateString()}</span></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded border uppercase tracking-tighter ${getStatusColor(rental.status)}`}>
                      {rental.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleStatusChange(rental.id, 'active')}
                        className="p-2 hover:bg-emerald-500/10 rounded text-gray-600 hover:text-emerald-500"
                        title="Authorize Deployment"
                      >
                        <CheckCircle size={16} />
                      </button>
                      <button 
                        onClick={() => handleViewKYC(rental)}
                        className="p-2 hover:bg-gaming-accent/10 rounded text-gray-600 hover:text-gaming-accent"
                        title="View KYC Dossier"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => setSelectedRental(rental)}
                        className="p-2 hover:bg-gaming-accent/10 rounded text-gray-600 hover:text-gaming-accent"
                        title="Details"
                      >
                        <Zap size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRentals.length === 0 && (
          <div className="text-center py-20 opacity-50 italic uppercase tracking-widest text-[10px] text-gray-500">
            No fleet records detected in current vector
          </div>
        )}
      </div>

      <ViewKYCModal 
        isOpen={!!kycModalUser}
        onClose={() => setKycModalUser(null)}
        userId={kycModalUser?.id || ''}
        userName={kycModalUser?.name || ''}
      />

      {/* Details Modal */}
      <AnimatePresence>
        {selectedRental && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#080112] border border-white/10 rounded-3xl w-full max-w-4xl p-8 shadow-2xl relative"
            >
              <button onClick={() => setSelectedRental(null)} className="absolute top-6 right-6 text-gray-500 hover:text-white"><X size={24}/></button>
              
              <div className="flex flex-col md:flex-row gap-10">
                <div className="md:w-1/3 space-y-6">
                  <div className="aspect-square rounded-2xl bg-black border border-white/10 p-4">
                    <img src={selectedRental.image} className="w-full h-full object-contain" alt="" />
                  </div>
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-4">
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5 pb-2">Financial_Snapshot</h4>
                    <div className="flex justify-between">
                      <span className="text-[9px] font-mono text-gray-600">Rental Fee</span>
                      <span className="text-white font-bold">{formatCurrency(selectedRental.totalPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[9px] font-mono text-gray-600">Security Deposit</span>
                      <span className="text-amber-500 font-bold">{formatCurrency(selectedRental.deposit)}</span>
                    </div>
                  </div>
                </div>

                <div className="md:w-2/3 space-y-8">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">{selectedRental.product}</h3>
                      <p className="text-gaming-accent font-mono text-xs mt-1">Deployment ID: {selectedRental.id}</p>
                    </div>
                    {selectedRental.userId && (
                      <Link 
                        to={`/admin/kyc?search=${selectedRental.user}`}
                        className="px-4 py-2 bg-gaming-accent/10 text-gaming-accent border border-gaming-accent/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gaming-accent hover:text-black transition-all flex items-center gap-2"
                      >
                        <ShieldCheck size={14} /> Review_KYC_Dossier
                      </Link>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Personnel_Data</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm text-gray-300 font-bold"><User size={14} className="text-gaming-accent"/> {selectedRental.user}</div>
                        <div className="flex items-center gap-3 text-xs text-gray-500 font-mono"><Mail size={14}/> {selectedRental.email}</div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Deployment_Schedule</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-xs text-gray-300 font-mono"><CalendarIcon size={14} className="text-gaming-accent"/> Start: {new Date(selectedRental.startDate).toLocaleDateString()}</div>
                        <div className="flex items-center gap-3 text-xs text-gray-300 font-mono"><Clock size={14} className="text-red-500"/> Return: {new Date(selectedRental.endDate).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Operation_Timeline</h4>
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-6 h-48 overflow-y-auto custom-scrollbar">
                      <div className="space-y-4">
                        {(selectedRental.timeline || []).map((log, i) => (
                          <div key={i} className="flex gap-4 border-l-2 border-gaming-accent/20 pl-4 py-1 relative">
                            <div className="absolute -left-[5px] top-2 w-2 h-2 rounded-full bg-gaming-accent shadow-[0_0_8px_rgba(216, 102, 255,0.8)]" />
                            <div className="flex-1">
                              <p className="text-[10px] font-black text-white uppercase tracking-tighter">{log.status}</p>
                              <p className="text-[9px] text-gray-500 font-mono">{new Date(log.timestamp).toLocaleString()}</p>
                              <p className="text-[10px] text-gray-400 mt-1 italic">"{log.note}"</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-white/5">
                    {selectedRental.status === 'pending' && (
                      <>
                        <button onClick={() => setCheckoutRental(selectedRental)} className="flex-1 py-4 bg-gaming-accent text-black font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-[#9333EA] shadow-[0_0_20px_rgba(216, 102, 255,0.4)] flex items-center justify-center gap-2">
                          <LogOut size={14} /> Check-Out
                        </button>
                        <button onClick={() => setCancelRental(selectedRental)} className="flex-1 py-4 bg-red-500/10 text-red-500 font-black border border-red-500/20 uppercase text-[10px] tracking-widest rounded-2xl hover:bg-red-500 hover:text-white flex items-center justify-center gap-2">
                          <XCircle size={14} /> Cancel
                        </button>
                      </>
                    )}
                    {selectedRental.status === 'active' && (
                      <button onClick={() => setCheckinRental(selectedRental)} className="flex-1 py-4 bg-emerald-500 text-black font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2">
                        <LogIn size={14} /> Check-In
                      </button>
                    )}
                    {selectedRental.status === 'late' && (
                      <button onClick={() => setCheckinRental(selectedRental)} className="flex-1 py-4 bg-emerald-500 text-black font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2">
                        <LogIn size={14} /> Check-In
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      <AnimatePresence>
        {checkoutRental && (
          <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-[#080112] border border-white/10 rounded-3xl p-8 max-w-lg w-full space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-white italic uppercase flex items-center gap-2">
                  <LogOut className="text-gaming-accent" /> Check-Out <span className="text-gaming-accent">Console</span>
                </h2>
                <button onClick={() => setCheckoutRental(null)} className="p-2 text-gray-500 hover:text-white"><X size={20} /></button>
              </div>
              
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-xs text-gray-400 mb-2">Deploying to: <span className="text-white font-bold">{checkoutRental.user}</span></p>
                <p className="text-xs text-gray-400">Product: <span className="text-white font-bold">{checkoutRental.product}</span></p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold mb-2 block">Assign Unit ID *</label>
                  <input
                    type="text"
                    value={checkoutForm.unitId}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, unitId: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl p-3 text-white outline-none focus:border-gaming-accent"
                    placeholder="e.g. PS5-001, XBOX-X-012"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold mb-2 block">Notes</label>
                  <textarea
                    value={checkoutForm.notes}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, notes: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl p-3 text-white outline-none focus:border-gaming-accent"
                    rows={3}
                    placeholder="Any special notes..."
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setCheckoutRental(null)} className="flex-1 py-3 text-gray-500 font-bold uppercase tracking-widest text-xs border border-white/10 rounded-xl hover:bg-white/5">Cancel</button>
                <button onClick={handleCheckout} disabled={isProcessing || !checkoutForm.unitId} className="flex-1 py-3 bg-gaming-accent text-black font-black uppercase tracking-widest text-xs rounded-xl shadow-[0_0_20px_rgba(216, 102, 255,0.4)] flex items-center justify-center gap-2 hover:bg-[#9333EA] disabled:opacity-50">
                  {isProcessing ? <RefreshCw className="animate-spin" size={14} /> : <LogOut size={14} />}
                  Confirm Check-Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Check-in Modal */}
      <AnimatePresence>
        {checkinRental && (
          <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-[#080112] border border-white/10 rounded-3xl p-8 max-w-lg w-full space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-white italic uppercase flex items-center gap-2">
                  <LogIn className="text-emerald-500" /> Check-In <span className="text-emerald-500">Console</span>
                </h2>
                <button onClick={() => setCheckinRental(null)} className="p-2 text-gray-500 hover:text-white"><X size={20} /></button>
              </div>
              
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-xs text-gray-400 mb-2">Returned by: <span className="text-white font-bold">{checkinRental.user}</span></p>
                <p className="text-xs text-gray-400">Product: <span className="text-white font-bold">{checkinRental.product}</span></p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold mb-3 block">Condition Assessment *</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'good', label: 'Good', desc: 'No visible damage', color: 'emerald' },
                      { id: 'minor', label: 'Minor', desc: 'Scratches/wear', color: 'amber' },
                      { id: 'major', label: 'Major', desc: 'Needs repair', color: 'red' }
                    ].map((cond) => (
                      <button
                        key={cond.id}
                        onClick={() => setCheckinForm({ ...checkinForm, condition: cond.id as any })}
                        className={`p-3 rounded-xl border-2 transition-all ${checkinForm.condition === cond.id 
                          ? `border-${cond.color}-500 bg-${cond.color}-500/10` 
                          : 'border-white/10 hover:border-white/20'}`}
                      >
                        <p className={`text-sm font-bold text-${cond.color}-500 uppercase`}>{cond.label}</p>
                        <p className="text-[8px] text-gray-500 mt-1">{cond.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {checkinForm.condition !== 'good' && (
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase font-bold mb-2 block">Repair Cost (₹)</label>
                    <input
                      type="number"
                      value={checkinForm.repairCost}
                      onChange={(e) => setCheckinForm({ ...checkinForm, repairCost: Number(e.target.value) })}
                      className="w-full bg-black border border-white/10 rounded-xl p-3 text-white outline-none focus:border-red-500"
                      placeholder="0"
                    />
                  </div>
                )}

                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold mb-2 block">Evidence Image URL</label>
                  <input
                    type="text"
                    value={checkinForm.imageUrl}
                    onChange={(e) => setCheckinForm({ ...checkinForm, imageUrl: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl p-3 text-white outline-none focus:border-gaming-accent"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold mb-2 block">Notes</label>
                  <textarea
                    value={checkinForm.notes}
                    onChange={(e) => setCheckinForm({ ...checkinForm, notes: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl p-3 text-white outline-none focus:border-emerald-500"
                    rows={3}
                    placeholder="Any notes about the returned condition..."
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setCheckinRental(null)} className="flex-1 py-3 text-gray-500 font-bold uppercase tracking-widest text-xs border border-white/10 rounded-xl hover:bg-white/5">Cancel</button>
                <button onClick={handleCheckin} disabled={isProcessing} className="flex-1 py-3 bg-emerald-500 text-black font-black uppercase tracking-widest text-xs rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 hover:bg-emerald-400 disabled:opacity-50">
                  {isProcessing ? <RefreshCw className="animate-spin" size={14} /> : <LogIn size={14} />}
                  Confirm Check-In
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cancel Rental Modal */}
      <AnimatePresence>
        {cancelRental && (
          <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-[#080112] border border-red-500/30 rounded-3xl p-8 max-w-lg w-full space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-white italic uppercase flex items-center gap-2">
                  <XCircle className="text-red-500" /> Cancel <span className="text-red-500">Rental</span>
                </h2>
                <button onClick={() => setCancelRental(null)} className="p-2 text-gray-500 hover:text-white"><X size={20} /></button>
              </div>
              
              <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20">
                <p className="text-xs text-gray-400 mb-2">Cancelling for: <span className="text-white font-bold">{cancelRental.user}</span></p>
                <p className="text-xs text-gray-400">Product: <span className="text-white font-bold">{cancelRental.product}</span></p>
                <p className="text-xs text-gray-400 mt-2">Deposit: <span className="text-amber-400 font-bold">₹{cancelRental.deposit}</span></p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold mb-2 block">Cancellation Reason *</label>
                  <select
                    value={cancelForm.reason}
                    onChange={(e) => setCancelForm({ ...cancelForm, reason: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl p-3 text-white outline-none focus:border-red-500"
                  >
                    <option value="">Select reason...</option>
                    <option value="Customer requested cancellation">Customer requested</option>
                    <option value="Payment failed">Payment failed</option>
                    <option value="Unit unavailable">Unit unavailable</option>
                    <option value="No show">Customer no show</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="flex items-center justify-between bg-white/5 rounded-xl p-4 border border-white/10">
                  <div>
                    <p className="text-sm text-white font-bold">Refund Deposit</p>
                    <p className="text-[10px] text-gray-500">Return security deposit to customer</p>
                  </div>
                  <button
                    onClick={() => setCancelForm({ ...cancelForm, refundDeposit: !cancelForm.refundDeposit })}
                    className={`w-12 h-6 rounded-full transition-colors ${cancelForm.refundDeposit ? 'bg-emerald-500' : 'bg-gray-600'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${cancelForm.refundDeposit ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setCancelRental(null)} className="flex-1 py-3 text-gray-500 font-bold uppercase tracking-widest text-xs border border-white/10 rounded-xl hover:bg-white/5">Keep Rental</button>
                <button onClick={handleCancel} disabled={isProcessing || !cancelForm.reason} className="flex-1 py-3 bg-red-500 text-black font-black uppercase tracking-widest text-xs rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.4)] flex items-center justify-center gap-2 hover:bg-red-400 disabled:opacity-50">
                  {isProcessing ? <RefreshCw className="animate-spin" size={14} /> : <XCircle size={14} />}
                  Confirm Cancellation
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

