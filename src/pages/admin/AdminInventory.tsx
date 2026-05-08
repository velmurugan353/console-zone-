import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Wrench,
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Package, 
  Download, 
  RefreshCw,
  MoreVertical,
  Activity,
  Box,
  LayoutGrid,
  LayoutList,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Zap,
  Save,
  Loader2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '../../lib/utils';

const API_URL = import.meta.env.PROD && !import.meta.env.VITE_API_URL_FORCE 
  ? '' 
  : (import.meta.env.VITE_API_URL || '');

type InventoryStatus = 'Available' | 'Rented' | 'Maintenance' | 'Retired';

interface MaintenanceRecord {
  date: string;
  type: string;
  technician: string;
  notes: string;
  cost: number;
}

interface RentalHistoryRecord {
  id: string;
  customer: string;
  startDate: string;
  endDate: string;
  revenue: number;
}

interface InventoryItem {
  id: string;
  _id?: string;
  name: string;
  category: string;
  status: InventoryStatus;
  health: number;
  lastService: string;
  location: string;
  serialNumber: string;
  purchaseDate: string;
  maintenanceHistory: MaintenanceRecord[];
  rentalHistory: RentalHistoryRecord[];
  usageCount: number;
  basePricePerDay: number;
  dynamicPricingEnabled: boolean;
  image: string;
  purchasePrice: number;
  totalRevenue: number;
  kitRequired: string[];
}

export default function AdminInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | InventoryStatus>('All');
  const [isAdding, setIsAdding] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [editForm, setEditForm] = useState<Partial<InventoryItem>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [maintenanceItem, setMaintenanceItem] = useState<InventoryItem | null>(null);
  const [maintenanceForm, setMaintenanceForm] = useState({
    type: 'Routine Check',
    technician: 'Mike Tech',
    notes: '',
    cost: 0,
    healthUpdate: 100,
    nextStatus: 'Available' as InventoryStatus
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('consolezone_token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [inventoryRes, productsRes] = await Promise.all([
        fetch(`${API_URL}/api/inventory`, { headers }),
        fetch(`${API_URL}/api/products`, { headers })
      ]);
      
      const invData = await inventoryRes.json().catch(() => []);
      const prodData = await productsRes.json().catch(() => []);
      
      setInventory(invData.map((item: any) => ({ ...item, id: item.id || item._id })));
      setProducts(prodData.filter((p: any) => p.category === 'console' || p.category === 'vr'));
    } catch (error) {
      console.error("Fetch failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSeedInventory = async () => {
    if (!confirm("Initialize hardware matrix seeding protocol?")) return;
    
    const token = localStorage.getItem('consolezone_token');
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/inventory/seed`, { 
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Fleet provisioned successfully.');
        fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: InventoryStatus) => {
    const token = localStorage.getItem('consolezone_token');
    try {
      await fetch(`${API_URL}/api/inventory/${id}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteAsset = async (id: string) => {
    if (!confirm("Decommission this asset from the matrix?")) return;
    const token = localStorage.getItem('consolezone_token');
    try {
      await fetch(`${API_URL}/api/inventory/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const newItem = {
      name: editForm.name,
      category: editForm.category || 'Console',
      status: 'Available',
      health: 100,
      usageCount: 0,
      serialNumber: editForm.serialNumber,
      basePricePerDay: editForm.basePricePerDay,
      purchasePrice: editForm.purchasePrice || 0,
      image: editForm.image || '',
      kitRequired: ['Console', 'Controller', 'Power Lead']
    };

    const token = localStorage.getItem('consolezone_token');
    try {
      const res = await fetch(`${API_URL}/api/inventory`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newItem)
      });
      
      if (res.ok) {
        setIsAdding(false);
        setEditForm({});
        fetchData();
        alert('Asset successfully committed to matrix.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMaintenanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintenanceItem) return;
    setIsSubmitting(true);

    const token = localStorage.getItem('consolezone_token');
    try {
      const res = await fetch(`${API_URL}/api/inventory/${maintenanceItem.id}/maintenance`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(maintenanceForm)
      });

      if (res.ok) {
        setMaintenanceItem(null);
        setMaintenanceForm({
          type: 'Routine Check',
          technician: 'Mike Tech',
          notes: '',
          cost: 0,
          healthUpdate: 100,
          nextStatus: 'Available'
        });
        fetchData();
        alert('Maintenance protocol logged successfully.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                         item.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
                         item.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const StatusBadge = ({ status }: { status: string }) => {
    const s = status.toLowerCase();
    const styles: any = {
      'available': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      'rented': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      'maintenance': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      'retired': 'bg-red-500/10 text-red-500 border-red-500/20',
      'damaged': 'bg-red-500/10 text-red-500 border-red-500/20'
    };
    return (
      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${styles[s] || styles['available']}`}>
        {status}
      </span>
    );
  };

  const HealthBar = ({ health }: { health: number }) => {
    const color = health > 90 ? 'bg-emerald-500' : health > 70 ? 'bg-amber-500' : 'bg-red-500';
    return (
      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${health}%` }}
          className={`${color} h-full shadow-[0_0_8px_rgba(var(--accent-rgb),0.5)]`}
        />
      </div>
    );
  };

  if (loading && inventory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-8 w-8 text-gaming-accent animate-spin" />
        <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Synchronizing Matrix...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Fleet Overview Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-8">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Package className="h-3 w-3 text-gaming-accent animate-pulse" />
            <span className="text-[10px] font-mono text-gaming-accent uppercase tracking-[0.2em]">Hardware Matrix // Operational Fleet</span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tighter uppercase italic">Inventory <span className="text-gaming-accent">Matrix</span></h1>
          <p className="text-gray-500 font-mono text-xs mt-1">Global Asset Oversight & Telemetry // Sector_Alpha</p>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={handleSeedInventory}
            className="bg-white/5 border border-white/10 hover:border-gaming-accent/50 px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Initialize Fleet
          </button>
          <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex items-center gap-4">
            <div className="text-right">
              <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest text-right">Nodes_Active</p>
              <p className="text-xl font-black text-white italic tracking-tighter">{inventory.length}</p>
            </div>
            <div className="p-3 bg-gaming-accent/10 rounded-xl border border-gaming-accent/20 text-gaming-accent">
              <Box className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-[#080112] p-4 rounded-2xl border border-white/10">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search hardware matrix (ID, Serial, Name)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 bg-black border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-gaming-accent w-full"
          />
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-white/5 rounded-xl p-1 border border-white/10 mr-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-gaming-accent text-black shadow-[0_0_10px_rgba(168,85,247,0.4)]' : 'text-gray-500 hover:text-white'}`}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-gaming-accent text-black shadow-[0_0_10px_rgba(168,85,247,0.4)]' : 'text-gray-500 hover:text-white'}`}
            >
              <LayoutList size={16} />
            </button>
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="appearance-none flex items-center space-x-2 pl-8 pr-8 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-mono font-bold uppercase tracking-widest text-white transition-all cursor-pointer focus:outline-none focus:border-gaming-accent"
            >
              <option value="All">All Status</option>
              <option value="Available">Available</option>
              <option value="Rented">Rented</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Retired">Retired</option>
            </select>
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white pointer-events-none" />
          </div>
          <button
            onClick={() => {
              setEditForm({});
              setIsAdding(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-gaming-accent text-black rounded-xl text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-[#9333EA] transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)]"
          >
            <Plus size={14} />
            <span>Add Asset</span>
          </button>
        </div>
      </div>

      {/* Inventory Grid */}
      {filteredInventory.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5 border-dashed">
          <Box className="mx-auto h-12 w-12 text-gray-700 mb-4" />
          <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">No entries matching query in matrix</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInventory.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="group bg-[#080112] border border-white/10 rounded-2xl overflow-hidden hover:border-gaming-accent/50 transition-all shadow-xl"
            >
              <div className="p-6 space-y-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-gaming-accent uppercase tracking-widest">[{item.id.substring(0, 8)}]</span>
                      <StatusBadge status={item.status} />
                    </div>
                    <h3 className="text-xl font-bold text-white group-hover:text-gaming-accent transition-colors uppercase tracking-tight italic">{item.name}</h3>
                  </div>
                  <button onClick={() => setSelectedItem(item)} className="p-2 text-gray-500 hover:text-white transition-colors"><MoreHorizontal size={16} /></button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
                    <p className="text-[9px] font-mono font-bold text-gray-600 uppercase tracking-widest mb-1">Location</p>
                    <div className="flex items-center gap-1.5"><MapPin size={12} className="text-gaming-accent" /><p className="text-xs text-white font-mono uppercase">{item.location}</p></div>
                  </div>
                  <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
                    <p className="text-[9px] font-mono font-bold text-gray-600 uppercase tracking-widest mb-1">Usage_Pulse</p>
                    <div className="flex items-center gap-1.5"><RefreshCw size={12} className="text-emerald-500" /><p className="text-xs text-white font-mono uppercase">{item.usageCount || 0} Cycles</p></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[9px] font-mono font-bold uppercase tracking-widest">
                    <span className="text-gray-500">System Integrity</span>
                    <span className={item.health > 90 ? 'text-emerald-500' : 'text-amber-500'}>{item.health}%</span>
                  </div>
                  <HealthBar health={item.health} />
                </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs font-black text-white italic tracking-tighter">{formatCurrency(item.basePricePerDay)}<span className="text-[8px] text-gray-500 not-italic ml-1">/DAY</span></span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setSelectedItem(item)}
                      className="text-[9px] font-mono font-bold text-gaming-accent uppercase tracking-widest hover:underline flex items-center gap-1"
                    >
                      Details <ChevronRight size={10} />
                    </button>
                    <button 
                      onClick={() => setMaintenanceItem(item)}
                      className="p-2 hover:bg-amber-500/10 rounded text-gray-600 hover:text-amber-500 transition-colors"
                      title="Maintenance Control"
                    >
                      <Wrench size={14}/>
                    </button>
                    <button onClick={() => handleDeleteAsset(item.id)} className="p-2 hover:bg-red-500/10 rounded text-gray-600 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                    <button onClick={() => setSelectedItem(item)} className="text-[9px] font-mono font-black text-gaming-accent uppercase tracking-widest hover:underline flex items-center gap-1">Details <ChevronRight size={10} /></button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-[#080112] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead className="bg-white/[0.02] text-gray-500 text-[10px] font-mono uppercase tracking-widest border-b border-white/5">
              <tr>
                <th className="px-6 py-4">Node_ID</th>
                <th className="px-6 py-4">Hardware</th>
                <th className="px-6 py-4">Serial</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Integrity</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs font-mono text-gray-400">
              {filteredInventory.map(item => (
                <tr key={item.id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-6 py-4 text-gaming-accent font-bold">[{item.id.substring(0, 8)}]</td>
                  <td className="px-6 py-4 text-white font-bold">{item.name}</td>
                  <td className="px-6 py-4 text-gray-500">{item.serialNumber}</td>
                  <td className="px-6 py-4"><StatusBadge status={item.status} /></td>
                  <td className="px-6 py-4 w-48"><HealthBar health={item.health} /></td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => setMaintenanceItem(item)}
                        className="p-2 hover:bg-amber-500/10 rounded text-gray-600 hover:text-amber-500"
                        title="Maintenance Control"
                      >
                        <Wrench size={14}/>
                      </button>
                      <button onClick={() => setSelectedItem(item)} className="p-2 hover:bg-white/5 rounded text-gray-600 hover:text-white"><Edit2 size={14}/></button>
                      <button onClick={() => handleDeleteAsset(item.id)} className="p-2 hover:bg-red-500/10 rounded text-gray-600 hover:text-red-500"><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && !maintenanceItem && (
          <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-[#080112] border border-white/10 rounded-3xl p-8 max-w-3xl w-full space-y-6 shadow-[0_0_50px_rgba(0,0,0,0.5)] max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-black text-white italic uppercase italic tracking-tighter">{selectedItem.name}</h2>
                  <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-1">ID: {selectedItem.id} // SN: {selectedItem.serialNumber}</p>
                </div>
                <button onClick={() => setSelectedItem(null)} className="p-2 text-gray-500 hover:text-white"><X size={20} /></button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-[8px] text-gray-500 uppercase font-bold mb-1">Status</p>
                  <StatusBadge status={selectedItem.status} />
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-[8px] text-gray-500 uppercase font-bold mb-1">Health</p>
                  <p className={`text-lg font-black ${selectedItem.health > 90 ? 'text-emerald-500' : selectedItem.health > 70 ? 'text-amber-500' : 'text-red-500'}`}>{selectedItem.health}%</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-[8px] text-gray-500 uppercase font-bold mb-1">Usage</p>
                  <p className="text-lg font-black text-white">{selectedItem.usageCount || 0}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-[8px] text-gray-500 uppercase font-bold mb-1">Daily Rate</p>
                  <p className="text-lg font-black text-gaming-accent">₹{selectedItem.basePricePerDay}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white/[0.02] rounded-xl p-4 border border-white/10">
                  <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                    <RefreshCw size={14} className="text-emerald-500" /> Rental History
                  </h3>
                  {selectedItem.rentalHistory && selectedItem.rentalHistory.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {selectedItem.rentalHistory.map((r, i) => (
                        <div key={i} className="flex items-center justify-between bg-black/30 rounded-lg p-3 text-xs">
                          <div>
                            <p className="text-white font-bold">{r.customer}</p>
                            <p className="text-gray-500 font-mono">{new Date(r.startDate).toLocaleDateString()} - {new Date(r.endDate).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-emerald-400 font-bold">₹{r.revenue}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-xs font-mono">No rental history recorded.</p>
                  )}
                </div>

                <div className="bg-white/[0.02] rounded-xl p-4 border border-white/10">
                  <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Activity size={14} className="text-amber-500" /> Maintenance History
                  </h3>
                  {selectedItem.maintenanceHistory && selectedItem.maintenanceHistory.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {selectedItem.maintenanceHistory.map((m, i) => (
                        <div key={i} className="flex items-center justify-between bg-black/30 rounded-lg p-3 text-xs">
                          <div>
                            <p className="text-white font-bold">{m.type}</p>
                            <p className="text-gray-500 font-mono">{new Date(m.date).toLocaleDateString()} - {m.technician}</p>
                            <p className="text-gray-600">{m.notes}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-amber-400 font-bold">₹{m.cost}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-xs font-mono">No maintenance history recorded.</p>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-white/10">
                <button onClick={() => { setSelectedItem(null); setMaintenanceItem(selectedItem); }} className="flex-1 py-3 bg-amber-500 text-black font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-amber-400 flex items-center justify-center gap-2">
                  <Activity size={14} /> Add Maintenance
                </button>
                <button onClick={() => setSelectedItem(null)} className="flex-1 py-3 text-gray-500 font-bold uppercase tracking-widest text-xs border border-white/10 rounded-xl hover:bg-white/5">Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Maintenance Modal */}
      <AnimatePresence>
        {maintenanceItem && (
          <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-[#080112] border border-white/10 rounded-3xl p-8 max-w-2xl w-full space-y-6 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-black text-white italic uppercase italic tracking-tighter">Maintenance <span className="text-amber-500">Control</span></h2>
                  <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-1">Asset: {maintenanceItem.name} // SN: {maintenanceItem.serialNumber}</p>
                </div>
                <StatusBadge status={maintenanceItem.status} />
              </div>

              <form onSubmit={handleMaintenanceSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-gray-500 uppercase">Service Type</label>
                    <select 
                      className="w-full bg-black border border-white/10 rounded-xl p-3 text-white outline-none focus:border-amber-500 text-sm"
                      value={maintenanceForm.type}
                      onChange={e => setMaintenanceForm({...maintenanceForm, type: e.target.value})}
                    >
                      <option>Routine Check</option>
                      <option>Deep Cleaning</option>
                      <option>Thermal Paste Refresh</option>
                      <option>Component Repair</option>
                      <option>Controller Drift Fix</option>
                      <option>Firmware Update</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-gray-500 uppercase">Technician</label>
                    <select 
                      className="w-full bg-black border border-white/10 rounded-xl p-3 text-white outline-none focus:border-amber-500 text-sm"
                      value={maintenanceForm.technician}
                      onChange={e => setMaintenanceForm({...maintenanceForm, technician: e.target.value})}
                    >
                      <option>Mike Tech</option>
                      <option>Sarah Fix</option>
                      <option>Dave Repair</option>
                      <option>Alex Matrix</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-gray-500 uppercase">Diagnostic Notes</label>
                  <textarea 
                    required 
                    className="w-full bg-black border border-white/10 rounded-xl p-4 text-white outline-none focus:border-amber-500 min-h-[100px] text-sm" 
                    placeholder="Enter detailed maintenance logs..."
                    value={maintenanceForm.notes}
                    onChange={e => setMaintenanceForm({...maintenanceForm, notes: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-gray-500 uppercase">Service Cost (₹)</label>
                    <input 
                      type="number" 
                      className="w-full bg-black border border-white/10 rounded-xl p-3 text-white outline-none focus:border-amber-500 text-sm" 
                      value={maintenanceForm.cost}
                      onChange={e => setMaintenanceForm({...maintenanceForm, cost: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-gray-500 uppercase">Integrity Update (%)</label>
                    <input 
                      type="number" 
                      max="100"
                      className="w-full bg-black border border-white/10 rounded-xl p-3 text-white outline-none focus:border-amber-500 text-sm" 
                      value={maintenanceForm.healthUpdate}
                      onChange={e => setMaintenanceForm({...maintenanceForm, healthUpdate: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-gray-500 uppercase">Post-Service Status</label>
                    <select 
                      className="w-full bg-black border border-white/10 rounded-xl p-3 text-white outline-none focus:border-amber-500 text-sm"
                      value={maintenanceForm.nextStatus}
                      onChange={e => setMaintenanceForm({...maintenanceForm, nextStatus: e.target.value as InventoryStatus})}
                    >
                      <option value="Available">Available</option>
                      <option value="Maintenance">Stay in Maintenance</option>
                      <option value="Retired">Retired</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setMaintenanceItem(null)} className="flex-1 py-4 text-gray-500 font-bold uppercase tracking-widest text-xs">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 py-4 bg-amber-500 text-black font-black uppercase tracking-widest text-xs rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2">
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Apply Protocol
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#080112] border border-white/10 rounded-3xl p-8 max-w-lg w-full space-y-6">
            <h2 className="text-2xl font-black text-white italic uppercase italic tracking-tighter">Provision <span className="text-gaming-accent">Asset</span></h2>
            <form onSubmit={handleAddAsset} className="space-y-4">
              <input required type="text" placeholder="Hardware Name" className="w-full bg-black border border-white/10 rounded-xl p-4 text-white outline-none focus:border-gaming-accent" onChange={e => setEditForm({...editForm, name: e.target.value})} />
              <input required type="text" placeholder="Serial Number" className="w-full bg-black border border-white/10 rounded-xl p-4 text-white outline-none focus:border-gaming-accent" onChange={e => setEditForm({...editForm, serialNumber: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input required type="number" placeholder="Daily Rate" className="bg-black border border-white/10 rounded-xl p-4 text-white outline-none focus:border-gaming-accent" onChange={e => setEditForm({...editForm, basePricePerDay: Number(e.target.value)})} />
                <input required type="number" placeholder="Asset Value" className="bg-black border border-white/10 rounded-xl p-4 text-white outline-none focus:border-gaming-accent" onChange={e => setEditForm({...editForm, purchasePrice: Number(e.target.value)})} />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-4 text-gray-500 font-bold uppercase tracking-widest text-xs">Abort</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-4 bg-gaming-accent text-black font-black uppercase tracking-widest text-xs rounded-xl shadow-[0_0_20px_rgba(216, 102, 255,0.4)] flex items-center justify-center gap-2">
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Initiate
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
