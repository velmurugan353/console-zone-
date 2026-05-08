import React, { useState, useEffect } from 'react';
import {
  Search,
  Users,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Eye,
  Edit,
  Save,
  X,
  Shield,
  TrendingUp,
  Clock,
  Package,
  FileText,
  Star,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { rentalAutomationService, CustomerProfile } from '../../services/rentalAutomation';

export default function CustomerProfilesPage() {
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);
  const [selectedCustomerRentals, setSelectedCustomerRentals] = useState<any[]>([]);
  const [editingNote, setEditingNote] = useState(false);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    const data = await rentalAutomationService.getCustomers();
    setCustomers(data);
  };

  useEffect(() => {
    const fetchRentals = async () => {
      if (selectedCustomer) {
        const rentals = await rentalAutomationService.getRentalsByCustomer(selectedCustomer.id);
        setSelectedCustomerRentals(rentals);
      } else {
        setSelectedCustomerRentals([]);
      }
    };
    fetchRentals();
  }, [selectedCustomer]);

  const filteredCustomers = customers.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase());
    const matchesRisk = riskFilter === 'all' || c.riskScore === riskFilter;
    return matchesSearch && matchesRisk;
  });

  const handleSaveNote = async () => {
    if (!selectedCustomer) return;
    await rentalAutomationService.addCustomerNote(selectedCustomer.id, noteText);
    setNoteText('');
    setEditingNote(false);
    await loadCustomers();
    const updated = await rentalAutomationService.getCustomerById(selectedCustomer.id);
    setSelectedCustomer(updated);
  };

  const RiskBadge = ({ risk }: { risk: string }) => {
    const styles: Record<string, string> = {
      low: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      medium: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      high: 'bg-red-500/10 text-red-500 border-red-500/20'
    };
    return (
      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${styles[risk] || styles.low}`}>
        {risk}
      </span>
    );
  };

  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const highRisk = customers.filter(c => c.riskScore === 'high').length;
  const avgRentals = totalCustomers > 0 ? (customers.reduce((sum, c) => sum + c.totalRentals, 0) / totalCustomers).toFixed(1) : '0';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-8">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Users className="h-3 w-3 text-gaming-accent animate-pulse" />
            <span className="text-[10px] font-mono text-gaming-accent uppercase tracking-[0.2em]">Customer Intelligence Database</span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tighter uppercase italic">Customer <span className="text-gaming-accent">Profiles</span></h1>
          <p className="text-gray-500 font-mono text-xs mt-1">Auto-pulled from rental automation system.</p>
        </div>
        <button
          onClick={loadCustomers}
          className="p-2 bg-white/5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Customers', val: totalCustomers, icon: Users, color: 'text-gaming-accent' },
          { label: 'Total Revenue', val: `₹${totalRevenue}`, icon: TrendingUp, color: 'text-emerald-500' },
          { label: 'Avg Rentals', val: avgRentals, icon: Calendar, color: 'text-blue-500' },
          { label: 'High Risk', val: highRisk, icon: ShieldAlert, color: 'text-red-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#080112] border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <stat.icon size={16} className={stat.color} />
            </div>
            <p className="text-[8px] text-gray-500 uppercase font-bold tracking-widest">{stat.label}</p>
            <p className={`text-xl font-black ${stat.color}`}>{stat.val}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 bg-[#080112] p-4 rounded-2xl border border-white/10">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search customers (Name, Email, ID)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 bg-black border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-gaming-accent w-full"
          />
        </div>
        <div className="flex items-center space-x-2">
          {(['all', 'low', 'medium', 'high'] as const).map(f => (
            <button
              key={f}
              onClick={() => setRiskFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${riskFilter === f ? 'bg-gaming-accent text-white border-gaming-accent' : 'bg-black text-gray-500 border-white/10 hover:border-white/20'}`}
            >
              {f === 'all' ? 'All' : f === 'low' ? 'Low Risk' : f === 'medium' ? 'Medium' : 'High Risk'}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((customer) => (
          <motion.div
            key={customer.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#080112] border border-white/10 rounded-2xl p-6 hover:border-gaming-accent/30 transition-all cursor-pointer group"
            onClick={() => setSelectedCustomer(customer)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gaming-accent/20 flex items-center justify-center text-gaming-accent font-black text-sm">
                  {customer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-gaming-accent transition-colors">{customer.name}</h3>
                  <p className="text-[9px] text-gray-500 font-mono">{customer.email}</p>
                </div>
              </div>
              <RiskBadge risk={customer.riskScore} />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/5 rounded-lg p-2">
                <p className="text-[8px] text-gray-500 uppercase font-bold mb-1">Rentals</p>
                <p className="text-lg font-black text-white">{customer.totalRentals}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <p className="text-[8px] text-gray-500 uppercase font-bold mb-1">Spent</p>
                <p className="text-lg font-black text-emerald-400">₹{customer.totalSpent}</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-[9px] font-mono">
              <div className="flex items-center gap-1">
                <CheckCircle size={10} className="text-emerald-500" />
                <span className="text-gray-400">{customer.completedRentals} done</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={10} className="text-blue-500" />
                <span className="text-gray-400">{customer.activeRentals} active</span>
              </div>
              {customer.totalLateFees > 0 && (
                <div className="flex items-center gap-1">
                  <AlertTriangle size={10} className="text-amber-500" />
                  <span className="text-amber-400">₹{customer.totalLateFees}</span>
                </div>
              )}
            </div>

            {customer.phone && (
              <div className="flex items-center gap-1 mt-3 text-[9px] text-gray-500">
                <Phone size={10} />
                <span>{customer.phone}</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5 border-dashed">
          <Users className="mx-auto h-12 w-12 text-gray-700 mb-4" />
          <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">No customer profiles found</p>
          <p className="text-gray-600 font-mono text-[10px] mt-2">Customers are auto-created from rental bookings</p>
        </div>
      )}

      {/* Customer Detail Modal */}
      <AnimatePresence>
        {selectedCustomer && (
          <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-[#080112] border border-white/10 rounded-3xl p-8 max-w-3xl w-full space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gaming-accent/20 flex items-center justify-center text-gaming-accent font-black text-2xl">
                    {selectedCustomer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white italic uppercase">{selectedCustomer.name}</h2>
                    <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{selectedCustomer.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <RiskBadge risk={selectedCustomer.riskScore} />
                  <button onClick={() => setSelectedCustomer(null)} className="p-2 text-gray-500 hover:text-white"><X size={20} /></button>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-[8px] text-gray-500 uppercase font-bold mb-1">Email</p>
                  <div className="flex items-center gap-2">
                    <Mail size={12} className="text-gaming-accent" />
                    <p className="text-sm text-white font-bold">{selectedCustomer.email}</p>
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-[8px] text-gray-500 uppercase font-bold mb-1">Phone</p>
                  <div className="flex items-center gap-2">
                    <Phone size={12} className="text-gaming-accent" />
                    <p className="text-sm text-white font-bold">{selectedCustomer.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <Package size={16} className="mx-auto mb-1 text-gaming-accent" />
                  <p className="text-[8px] text-gray-500 uppercase font-bold">Total</p>
                  <p className="text-lg font-black text-white">{selectedCustomer.totalRentals}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <CheckCircle size={16} className="mx-auto mb-1 text-emerald-500" />
                  <p className="text-[8px] text-gray-500 uppercase font-bold">Completed</p>
                  <p className="text-lg font-black text-emerald-400">{selectedCustomer.completedRentals}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <XCircle size={16} className="mx-auto mb-1 text-red-500" />
                  <p className="text-[8px] text-gray-500 uppercase font-bold">Cancelled</p>
                  <p className="text-lg font-black text-red-400">{selectedCustomer.cancelledRentals}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <DollarSign size={16} className="mx-auto mb-1 text-amber-500" />
                  <p className="text-[8px] text-gray-500 uppercase font-bold">Spent</p>
                  <p className="text-lg font-black text-amber-400">₹{selectedCustomer.totalSpent}</p>
                </div>
              </div>

              {/* Financial Details */}
              <div className="bg-white/5 rounded-xl p-4 space-y-2">
                <p className="text-[8px] text-gray-500 uppercase font-bold mb-2">Financial Summary</p>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Total Spent</span>
                  <span className="text-white font-bold">₹{selectedCustomer.totalSpent}</span>
                </div>
                {selectedCustomer.totalLateFees > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Late Fees</span>
                    <span className="text-red-400 font-bold">₹{selectedCustomer.totalLateFees}</span>
                  </div>
                )}
                {selectedCustomer.totalRepairCosts > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Repair Costs</span>
                    <span className="text-amber-400 font-bold">₹{selectedCustomer.totalRepairCosts}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Deposit Balance</span>
                  <span className="text-emerald-400 font-bold">₹{selectedCustomer.depositBalance}</span>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-[8px] text-gray-500 uppercase font-bold mb-1">First Rental</p>
                  <p className="text-sm text-white font-bold">{selectedCustomer.firstRentalDate ? new Date(selectedCustomer.firstRentalDate).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-[8px] text-gray-500 uppercase font-bold mb-1">Last Rental</p>
                  <p className="text-sm text-white font-bold">{selectedCustomer.lastRentalDate ? new Date(selectedCustomer.lastRentalDate).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>

              {/* Notes */}
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[8px] text-gray-500 uppercase font-bold">Admin Notes</p>
                  <button
                    onClick={() => { setEditingNote(!editingNote); setNoteText(''); }}
                    className="text-[8px] text-gaming-accent font-bold uppercase hover:underline"
                  >
                    {editingNote ? 'Cancel' : 'Add Note'}
                  </button>
                </div>
                {selectedCustomer.notes && (
                  <div className="bg-black/30 rounded-lg p-3 text-xs text-gray-300 whitespace-pre-wrap max-h-32 overflow-y-auto">
                    {selectedCustomer.notes}
                  </div>
                )}
                {editingNote && (
                  <div className="mt-3 space-y-2">
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-lg p-3 text-white text-xs outline-none focus:border-gaming-accent"
                      rows={3}
                      placeholder="Add a note about this customer..."
                    />
                    <button
                      onClick={handleSaveNote}
                      disabled={!noteText.trim()}
                      className="px-4 py-2 bg-gaming-accent text-black text-[9px] font-bold uppercase tracking-widest rounded-lg hover:bg-[#9333EA] disabled:opacity-50 flex items-center gap-2"
                    >
                      <Save size={12} /> Save Note
                    </button>
                  </div>
                )}
              </div>

              {/* Rental History */}
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-[8px] text-gray-500 uppercase font-bold mb-3">Rental History</p>
                {selectedCustomerRentals.length === 0 ? (
                  <p className="text-xs text-gray-600">No rental history</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedCustomerRentals.map((r) => (
                      <div key={r.id} className="flex items-center justify-between bg-black/30 rounded-lg p-3 text-xs">
                        <div>
                          <p className="text-white font-bold">{r.product}</p>
                          <p className="text-gray-500 font-mono text-[9px]">{new Date(r.startDate).toLocaleDateString()} - {new Date(r.endDate).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-emerald-400 font-bold">₹{r.totalPrice}</p>
                          <p className={`text-[8px] font-bold uppercase ${r.status === 'completed' ? 'text-emerald-500' : r.status === 'active' ? 'text-blue-500' : r.status === 'cancelled' ? 'text-red-500' : 'text-amber-500'}`}>
                            {r.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={() => setSelectedCustomer(null)} className="flex-1 py-3 text-gray-500 font-bold uppercase tracking-widest text-xs border border-white/10 rounded-xl hover:bg-white/5">Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
