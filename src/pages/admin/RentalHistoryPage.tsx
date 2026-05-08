import React, { useState, useEffect } from 'react';
import {
  Search,
  Activity,
  Calendar,
  Clock,
  DollarSign,
  User,
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Wrench,
  LogIn,
  LogOut,
  Eye,
  Download,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { rentalAutomationService, RentalHistoryEntry, MaintenanceEntry } from '../../services/rentalAutomation';

export default function RentalHistoryPage() {
  const [activeTab, setActiveTab] = useState<'rentals' | 'maintenance'>('rentals');
  const [rentalHistory, setRentalHistory] = useState<RentalHistoryEntry[]>([]);
  const [maintenanceHistory, setMaintenanceHistory] = useState<MaintenanceEntry[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedEntry, setSelectedEntry] = useState<RentalHistoryEntry | null>(null);
  const [selectedMaintenance, setSelectedMaintenance] = useState<MaintenanceEntry | null>(null);
  const [stats, setStats] = useState<any>({
    totalRentals: 0,
    activeRentals: 0,
    completedRentals: 0,
    cancelledRentals: 0,
    lateRentals: 0,
    totalRevenue: 0,
    totalMaintenanceCost: 0
  });

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const [rentals, maintenance, statsData] = await Promise.all([
      rentalAutomationService.getRentalHistory(),
      rentalAutomationService.getMaintenanceHistory(),
      rentalAutomationService.getStats()
    ]);
    setRentalHistory(rentals);
    setMaintenanceHistory(maintenance);
    setStats(statsData);
  };

  const filteredRentals = rentalHistory.filter(r => {
    const matchesSearch =
      r.customer.toLowerCase().includes(search.toLowerCase()) ||
      r.product.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.unitId.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredMaintenance = maintenanceHistory.filter(m =>
    m.unitId.toLowerCase().includes(search.toLowerCase()) ||
    m.technician.toLowerCase().includes(search.toLowerCase()) ||
    m.type.toLowerCase().includes(search.toLowerCase())
  );

  const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
      pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      active: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      completed: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
      late: 'bg-orange-500/10 text-orange-500 border-orange-500/20'
    };
    return (
      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${styles[status] || styles.pending}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-8">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Activity className="h-3 w-3 text-gaming-accent animate-pulse" />
            <span className="text-[10px] font-mono text-gaming-accent uppercase tracking-[0.2em]">Rental History Database</span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tighter uppercase italic">Rental <span className="text-gaming-accent">History</span></h1>
          <p className="text-gray-500 font-mono text-xs mt-1">Complete rental lifecycle records & maintenance logs.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveTab('rentals')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'rentals' ? 'bg-gaming-accent text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Calendar size={14} /> Rentals
            </button>
            <button
              onClick={() => setActiveTab('maintenance')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'maintenance' ? 'bg-gaming-accent text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Wrench size={14} /> Maintenance
            </button>
          </div>
          <button
            onClick={loadHistory}
            className="p-2 bg-white/5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: 'Total', val: stats.totalRentals, icon: Activity, color: 'text-gaming-accent' },
          { label: 'Active', val: stats.activeRentals, icon: LogOut, color: 'text-blue-500' },
          { label: 'Completed', val: stats.completedRentals, icon: CheckCircle, color: 'text-emerald-500' },
          { label: 'Cancelled', val: stats.cancelledRentals, icon: XCircle, color: 'text-red-500' },
          { label: 'Late', val: stats.lateRentals, icon: AlertTriangle, color: 'text-orange-500' },
          { label: 'Revenue', val: `₹${stats.totalRevenue}`, icon: DollarSign, color: 'text-emerald-400' },
          { label: 'Maint. Cost', val: `₹${stats.totalMaintenanceCost}`, icon: Wrench, color: 'text-amber-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#080112] border border-white/10 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <stat.icon size={14} className={stat.color} />
            </div>
            <p className="text-[8px] text-gray-500 uppercase font-bold tracking-widest">{stat.label}</p>
            <p className={`text-lg font-black ${stat.color}`}>{stat.val}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 bg-[#080112] p-4 rounded-2xl border border-white/10">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search history (Customer, Product, Unit, ID)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 bg-black border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-gaming-accent w-full"
          />
        </div>
        {activeTab === 'rentals' && (
          <div className="flex items-center space-x-2">
            {(['all', 'pending', 'active', 'completed', 'cancelled', 'late'] as const).map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${statusFilter === f ? 'bg-gaming-accent text-white border-gaming-accent' : 'bg-black text-gray-500 border-white/10 hover:border-white/20'}`}
              >
                {f}
              </button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'rentals' && (
          <motion.div key="rentals" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            {/* Rental Records Table */}
            <div className="bg-[#080112] border border-white/10 rounded-2xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-white/[0.02] text-gray-500 text-[10px] font-mono uppercase tracking-widest border-b border-white/5">
                  <tr>
                    <th className="px-4 py-3">Rental_ID</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Unit</th>
                    <th className="px-4 py-3">Dates</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs font-mono text-gray-400">
                  {filteredRentals.map((rental) => (
                    <tr key={rental.id} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="px-4 py-3 text-gaming-accent font-bold text-[9px]">{rental.id}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <User size={12} className="text-gray-600" />
                          <span className="text-white font-bold">{rental.customer}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white">{rental.product}</td>
                      <td className="px-4 py-3 text-gray-500">{rental.unitId || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-[9px]">
                            <Calendar size={10} className="text-gaming-accent" />
                            <span>{new Date(rental.startDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[9px]">
                            <Clock size={10} className="text-red-500" />
                            <span>{new Date(rental.endDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={rental.status} /></td>
                      <td className="px-4 py-3 text-right">
                        <div className="text-right">
                          <p className="text-white font-bold">₹{rental.totalPrice}</p>
                          {rental.lateFee > 0 && <p className="text-red-400 text-[8px]">+₹{rental.lateFee} late</p>}
                          {rental.repairCost > 0 && <p className="text-amber-400 text-[8px]">+₹{rental.repairCost} repair</p>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => setSelectedEntry(rental)}
                            className="p-1.5 hover:bg-gaming-accent/10 rounded text-gray-600 hover:text-gaming-accent transition-colors"
                          >
                            <Eye size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredRentals.length === 0 && (
                <div className="text-center py-20 opacity-50 italic uppercase tracking-widest text-[10px] text-gray-500">
                  No rental records found
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'maintenance' && (
          <motion.div key="maintenance" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="bg-[#080112] border border-white/10 rounded-2xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-white/[0.02] text-gray-500 text-[10px] font-mono uppercase tracking-widest border-b border-white/5">
                  <tr>
                    <th className="px-4 py-3">Maint_ID</th>
                    <th className="px-4 py-3">Unit</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Technician</th>
                    <th className="px-4 py-3">Triggered By</th>
                    <th className="px-4 py-3 text-right">Cost</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs font-mono text-gray-400">
                  {filteredMaintenance.map((entry) => (
                    <tr key={entry.id} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="px-4 py-3 text-amber-500 font-bold text-[9px]">{entry.id}</td>
                      <td className="px-4 py-3 text-white font-bold">{entry.unitId}</td>
                      <td className="px-4 py-3">
                        <span className="text-white">{entry.type}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{new Date(entry.date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-gray-300">{entry.technician}</td>
                      <td className="px-4 py-3 text-gray-500 text-[9px]">{entry.triggeredBy}</td>
                      <td className="px-4 py-3 text-right text-amber-400 font-bold">₹{entry.cost}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedMaintenance(entry)}
                          className="p-1.5 hover:bg-amber-500/10 rounded text-gray-600 hover:text-amber-500 transition-colors"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredMaintenance.length === 0 && (
                <div className="text-center py-20 opacity-50 italic uppercase tracking-widest text-[10px] text-gray-500">
                  No maintenance records found
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rental Detail Modal */}
      <AnimatePresence>
        {selectedEntry && (
          <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-[#080112] border border-white/10 rounded-3xl p-8 max-w-2xl w-full space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-black text-white italic uppercase">{selectedEntry.product}</h2>
                  <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-1">{selectedEntry.id}</p>
                </div>
                <StatusBadge status={selectedEntry.status} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-[8px] text-gray-500 uppercase font-bold mb-1">Customer</p>
                  <p className="text-sm text-white font-bold">{selectedEntry.customer}</p>
                  <p className="text-[9px] text-gray-500">{selectedEntry.email}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-[8px] text-gray-500 uppercase font-bold mb-1">Unit</p>
                  <p className="text-sm text-white font-bold">{selectedEntry.unitId || 'Not assigned'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-[8px] text-gray-500 uppercase font-bold mb-1">Start Date</p>
                  <p className="text-sm text-white font-bold">{new Date(selectedEntry.startDate).toLocaleDateString()}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-[8px] text-gray-500 uppercase font-bold mb-1">End Date</p>
                  <p className="text-sm text-white font-bold">{new Date(selectedEntry.endDate).toLocaleDateString()}</p>
                </div>
              </div>

              {selectedEntry.checkOutAt && (
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-[8px] text-gray-500 uppercase font-bold mb-1">Check-Out At</p>
                  <p className="text-sm text-blue-400 font-bold">{new Date(selectedEntry.checkOutAt).toLocaleString()}</p>
                </div>
              )}

              {selectedEntry.checkInAt && (
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-[8px] text-gray-500 uppercase font-bold mb-1">Check-In At</p>
                  <p className="text-sm text-emerald-400 font-bold">{new Date(selectedEntry.checkInAt).toLocaleString()}</p>
                </div>
              )}

              <div className="bg-white/5 rounded-xl p-4 space-y-2">
                <p className="text-[8px] text-gray-500 uppercase font-bold mb-2">Financial Breakdown</p>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Rental Fee</span>
                  <span className="text-white font-bold">₹{selectedEntry.totalPrice}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Deposit</span>
                  <span className="text-amber-400 font-bold">₹{selectedEntry.deposit}</span>
                </div>
                {selectedEntry.lateFee > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Late Fee</span>
                    <span className="text-red-400 font-bold">₹{selectedEntry.lateFee}</span>
                  </div>
                )}
                {selectedEntry.repairCost > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Repair Cost</span>
                    <span className="text-amber-400 font-bold">₹{selectedEntry.repairCost}</span>
                  </div>
                )}
                {selectedEntry.returnCondition && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Return Condition</span>
                    <span className={`font-bold ${selectedEntry.returnCondition === 'good' ? 'text-emerald-400' : selectedEntry.returnCondition === 'minor' ? 'text-amber-400' : 'text-red-400'}`}>
                      {selectedEntry.returnCondition.toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-xs pt-2 border-t border-white/10">
                  <span className="text-gray-400">Deposit Refunded</span>
                  <span className={`font-bold ${selectedEntry.depositRefunded ? 'text-emerald-400' : 'text-red-400'}`}>
                    {selectedEntry.depositRefunded ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>

              {selectedEntry.notes && (
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-[8px] text-gray-500 uppercase font-bold mb-1">Notes</p>
                  <p className="text-xs text-gray-300">{selectedEntry.notes}</p>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button onClick={() => setSelectedEntry(null)} className="flex-1 py-3 text-gray-500 font-bold uppercase tracking-widest text-xs border border-white/10 rounded-xl hover:bg-white/5">Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Maintenance Detail Modal */}
      <AnimatePresence>
        {selectedMaintenance && (
          <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-[#080112] border border-white/10 rounded-3xl p-8 max-w-lg w-full space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-black text-white italic uppercase flex items-center gap-2">
                    <Wrench className="text-amber-500" /> Maintenance
                  </h2>
                  <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-1">{selectedMaintenance.id}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-[8px] text-gray-500 uppercase font-bold mb-1">Unit</p>
                  <p className="text-sm text-white font-bold">{selectedMaintenance.unitId}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-[8px] text-gray-500 uppercase font-bold mb-1">Type</p>
                    <p className="text-sm text-white font-bold">{selectedMaintenance.type}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-[8px] text-gray-500 uppercase font-bold mb-1">Date</p>
                    <p className="text-sm text-white font-bold">{new Date(selectedMaintenance.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-[8px] text-gray-500 uppercase font-bold mb-1">Technician</p>
                  <p className="text-sm text-white font-bold">{selectedMaintenance.technician}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-[8px] text-gray-500 uppercase font-bold mb-1">Triggered By</p>
                  <p className="text-sm text-amber-400 font-bold">{selectedMaintenance.triggeredBy}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-[8px] text-gray-500 uppercase font-bold mb-1">Notes</p>
                  <p className="text-xs text-gray-300">{selectedMaintenance.notes}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-[8px] text-gray-500 uppercase font-bold mb-1">Cost</p>
                  <p className="text-xl text-amber-400 font-black">₹{selectedMaintenance.cost}</p>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={() => setSelectedMaintenance(null)} className="flex-1 py-3 text-gray-500 font-bold uppercase tracking-widest text-xs border border-white/10 rounded-xl hover:bg-white/5">Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
