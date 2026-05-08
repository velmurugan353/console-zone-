import { useState, useEffect } from 'react';
import { formatCurrency } from '../../lib/utils';
import { Wrench, CheckCircle, Clock, XCircle, Search, Filter, AlertTriangle, Activity, ShieldCheck, Zap, User, Edit2, Save, Mail, Phone, Plus, Package, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { automationService } from '../../services/automationService';
import { notificationService } from '../../services/notificationService';
import { aiService } from '../../services/aiService';

const API_URL = import.meta.env.VITE_API_URL || '';

type RepairStatus = 'pending' | 'diagnosing' | 'awaiting_parts' | 'in_progress' | 'testing' | 'completed' | 'cancelled';
type RepairPriority = 'low' | 'medium' | 'high' | 'critical';

interface RepairPart {
  id: string;
  name: string;
  cost: number;
  quantity: number;
}

interface RepairLog {
  date: string;
  action: string;
  note?: string;
  user: string;
}

interface RepairRequest {
  id: string;
  _id?: string;
  customer: string;
  email: string;
  phone?: string;
  device: string;
  serialNumber?: string;
  issue: string;
  date: string;
  status: RepairStatus;
  priority: RepairPriority;
  technician?: string;
  estimatedCost?: number;
  laborCost?: number;
  parts?: RepairPart[];
  history?: RepairLog[];
  completionDate?: string;
  warrantyPeriod?: number; // months
}

const TECHNICIANS = [
  { id: 'T1', name: 'Mike Tech', specialty: 'Consoles' },
  { id: 'T2', name: 'Sarah Fix', specialty: 'Controllers' },
  { id: 'T3', name: 'Dave Repair', specialty: 'Handhelds' },
  { id: 'T4', name: 'Alex Matrix', specialty: 'Microsoldering' }
];

const MOCK_REPAIRS: RepairRequest[] = [
  {
    id: 'REP-2001',
    customer: 'John Doe',
    email: 'john@example.com',
    phone: '9876543210',
    device: 'PlayStation 5',
    serialNumber: 'SN-PS5-8821',
    issue: 'HDMI Port Replacement',
    date: new Date().toISOString().split('T')[0],
    status: 'in_progress',
    priority: 'high',
    technician: 'Mike Tech',
    estimatedCost: 8500,
    laborCost: 3500,
    parts: [{ id: 'P1', name: 'PS5 HDMI Port', cost: 1200, quantity: 1 }],
    history: [
      { date: new Date().toLocaleString(), action: 'Ticket Created', user: 'System' },
      { date: new Date().toLocaleString(), action: 'Technician Assigned', note: 'Assigned to Mike Tech', user: 'Admin' }
    ]
  }
];

export default function AdminRepairs() {
  const [repairs, setRepairs] = useState<RepairRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [selectedRepair, setSelectedRepair] = useState<RepairRequest | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<RepairRequest>>({});
  const [diagnosis, setDiagnosis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const fetchRepairs = async () => {
    const token = localStorage.getItem('consolezone_token');
    try {
      const response = await fetch(`${API_URL}/api/repairs`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json().catch(() => []);
        setRepairs(data.map((r: any) => ({ ...r, id: r._id })));
      }
    } catch (error) {
      console.error("Fetch repairs failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepairs();
  }, []);

  const handleAIDiagnosis = async () => {
    if (!selectedRepair) return;
    setIsAnalyzing(true);
    setDiagnosis(null);
    const result = await aiService.getRepairDiagnosis(selectedRepair.device, selectedRepair.issue);
    setDiagnosis(result);
    setIsAnalyzing(false);
  };

  const handleSeedRepairs = async () => {
    if (!confirm('This will seed the Repair Matrix with mock data. Proceed?')) return;
    setLoading(true);
    const token = localStorage.getItem('consolezone_token');
    try {
      for (const repair of MOCK_REPAIRS) {
        await fetch(`${API_URL}/api/repairs`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(repair)
        });
      }
      fetchRepairs();
      alert('Repair Matrix seeded successfully.');
    } catch (error) {
      console.error("Error seeding repairs:", error);
      alert('Failed to seed repairs.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = async () => {
    if (isEditing) {
      if (selectedRepair) {
        const updatedRepair = { ...selectedRepair, ...editForm } as RepairRequest;
        const newLogs: RepairLog[] = [...(selectedRepair.history || [])];
        
        if (editForm.status && editForm.status !== selectedRepair.status) {
          newLogs.push({
            date: new Date().toLocaleString(),
            action: 'Protocol Update',
            note: `Status shifted to ${editForm.status.replace('_', ' ')}`,
            user: 'Admin'
          });
        }

        const finalUpdate = { ...editForm, history: newLogs };
        const token = localStorage.getItem('consolezone_token');
        try {
          const response = await fetch(`${API_URL}/api/repairs/${selectedRepair.id}`, {
            method: 'PATCH',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(finalUpdate)
          });
          
          if (response.ok) {
            const updated = await response.json().catch(() => ({}));
            const final = { ...updated, id: updated._id };
            setSelectedRepair(final);
            setRepairs(prev => prev.map(r => r.id === final.id ? final : r));
          }
        } catch (error) {
          console.error('Failed to update repair:', error);
          alert('Failed to save changes to database.');
        }
      }
      setIsEditing(false);
    } else {
      setEditForm(selectedRepair || {});
      setIsEditing(true);
    }
  };

  const handleAppendPart = async () => {
    if (!selectedRepair) return;
    const partName = prompt('Enter part name:');
    const partCost = parseFloat(prompt('Enter part cost (₹):') || '0');
    if (!partName) return;

    const newPart: RepairPart = {
      id: `P-${Date.now()}`,
      name: partName,
      cost: partCost,
      quantity: 1
    };

    const updatedParts = [...(selectedRepair.parts || []), newPart];
    const newLog: RepairLog = {
      date: new Date().toLocaleString(),
      action: 'Part Allocated',
      note: `Added ${partName} to manifest`,
      user: 'Admin'
    };

    const updatedHistory = [...(selectedRepair.history || []), newLog];

    const token = localStorage.getItem('consolezone_token');
    try {
      const response = await fetch(`${API_URL}/api/repairs/${selectedRepair.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          parts: updatedParts,
          history: updatedHistory
        })
      });
      
      if (response.ok) {
        const updated = await response.json().catch(() => ({}));
        const final = { ...updated, id: updated._id };
        setSelectedRepair(final);
        setRepairs(prev => prev.map(r => r.id === final.id ? final : r));
      }
    } catch (error) {
      console.error('Failed to add part:', error);
    }
  };

  const handleEditChange = (field: keyof RepairRequest, value: any) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const closeRepairModal = () => {
    setSelectedRepair(null);
    setIsEditing(false);
  };

  const handleStatusChange = async (id: string, newStatus: RepairStatus) => {
    const repair = repairs.find(r => r.id === id);
    if (!repair) return;

    const token = localStorage.getItem('consolezone_token');
    try {
      const response = await fetch(`${API_URL}/api/repairs/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        const updated = await response.json().catch(() => ({}));
        const final = { ...updated, id: updated._id };
        setRepairs(prev => prev.map(r => r.id === id ? final : r));
        if (selectedRepair?.id === id) {
          setSelectedRequest(final);
        }
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handlePriorityChange = async (id: string, newPriority: RepairPriority) => {
    const token = localStorage.getItem('consolezone_token');
    try {
      const response = await fetch(`${API_URL}/api/repairs/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ priority: newPriority })
      });
      
      if (response.ok) {
        const updated = await response.json().catch(() => ({}));
        const final = { ...updated, id: updated._id };
        setRepairs(prev => prev.map(r => r.id === id ? final : r));
        if (selectedRepair?.id === id) {
          setSelectedRepair(final);
        }
      }
    } catch (error) {
      console.error('Failed to update priority:', error);
    }
  };

  const handleManualNotification = (type: 'update' | 'quote' | 'custom') => {
    if (!selectedRepair) return;
    alert(`Notification protocol triggered for ${selectedRepair.customer}`);
  };

  const filteredRepairs = repairs.filter(repair => {
    const matchesSearch =
      (repair.customer || '').toLowerCase().includes(search.toLowerCase()) ||
      (repair.device || '').toLowerCase().includes(search.toLowerCase()) ||
      repair.id.toLowerCase().includes(search.toLowerCase());

    const matchesFilter = filter === 'all' || repair.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: RepairStatus) => {
    switch (status) {
      case 'pending': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'diagnosing': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'completed': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'cancelled': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
    }
  };

  const getPriorityColor = (priority: RepairPriority) => {
    switch (priority) {
      case 'critical': return 'text-white bg-red-600 border-red-600';
      case 'high': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    }
  };

  const getStatusIcon = (status: RepairStatus) => {
    switch (status) {
      case 'pending': return <Clock size={14} />;
      case 'diagnosing': return <Activity size={14} />;
      case 'completed': return <CheckCircle size={14} />;
      default: return <Wrench size={14} />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gaming-accent"></div>
        <p className="text-[10px] font-mono text-gaming-accent uppercase tracking-widest animate-pulse">Accessing Matrix...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Repair Command Center Modal */}
      <AnimatePresence>
        {selectedRepair && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="bg-[#080112] border border-white/10 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col my-8"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${getStatusColor(selectedRepair.status)}`}>
                    {getStatusIcon(selectedRepair.status)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic flex items-center gap-3">
                      Repair_Command_Center
                      <span className="text-gray-600 not-italic font-mono text-xs tracking-widest bg-white/5 px-2 py-1 rounded">#{selectedRepair.id}</span>
                    </h3>
                    <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-1">Operational Matrix v4.2 // Active Node</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleEditToggle}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isEditing ? 'bg-gaming-accent text-black shadow-[0_0_20px_rgba(168,85,247,0.4)]' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                  >
                    {isEditing ? <><Save size={14} /> Save Protocol</> : <><Edit2 size={14} /> Modify Node</>}
                  </button>
                  <button
                    onClick={closeRepairModal}
                    className="p-2 bg-white/5 text-gray-500 hover:text-white rounded-xl transition-colors"
                  >
                    <XCircle size={24} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 lg:p-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  
                  {/* LEFT: Identity & Hardware */}
                  <div className="lg:col-span-1 space-y-8">
                    <div className="space-y-6">
                      <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] border-b border-white/5 pb-2">Node_Identity</h4>
                      
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 group">
                          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gaming-accent">
                            <User size={24} />
                          </div>
                          <div className="flex-1">
                            <p className="text-[8px] font-mono text-gray-600 uppercase mb-1">Customer</p>
                            {isEditing ? (
                              <input
                                type="text"
                                value={editForm.customer || ''}
                                onChange={(e) => handleEditChange('customer', e.target.value)}
                                className="w-full bg-black border border-white/10 rounded-lg px-2 py-1 text-sm text-white font-bold"
                              />
                            ) : (
                              <p className="text-sm font-black text-white uppercase">{selectedRepair.customer}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500">
                            <Mail size={20} />
                          </div>
                          <div className="flex-1">
                            <p className="text-[8px] font-mono text-gray-600 uppercase mb-1">Email_Anchor</p>
                            <p className="text-xs font-mono text-gray-400">{selectedRepair.email}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6 pt-4">
                      <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] border-b border-white/5 pb-2">Hardware_Specs</h4>
                      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-4">
                        <div>
                          <p className="text-[8px] font-mono text-gray-600 uppercase mb-1">Host_Device</p>
                          <p className="text-lg font-black text-white uppercase italic tracking-tighter">{selectedRepair.device}</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-mono text-gray-600 uppercase mb-1">Fault_Detection</p>
                          <p className="text-xs text-gray-400 leading-relaxed font-medium">{selectedRepair.issue}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CENTER: Status & AI */}
                  <div className="lg:col-span-1 space-y-8">
                    <div className="space-y-6">
                      <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] border-b border-white/5 pb-2">Operational_Status</h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[8px] font-mono text-gray-600 uppercase ml-1">Priority_Level</label>
                          <select
                            value={isEditing ? (editForm.priority || selectedRepair.priority) : selectedRepair.priority}
                            onChange={(e) => {
                              const newPriority = e.target.value as RepairPriority;
                              if (isEditing) {
                                handleEditChange('priority', newPriority);
                              } else {
                                handlePriorityChange(selectedRepair.id, newPriority);
                              }
                            }}
                            className={`w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest focus:outline-none transition-all ${getPriorityColor(isEditing ? (editForm.priority || selectedRepair.priority) : selectedRepair.priority)}`}
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[8px] font-mono text-gray-600 uppercase ml-1">Current_Protocol</label>
                          <select
                            value={isEditing ? (editForm.status || selectedRepair.status) : selectedRepair.status}
                            onChange={(e) => {
                              const newStatus = e.target.value as RepairStatus;
                              if (isEditing) {
                                handleEditChange('status', newStatus);
                              } else {
                                handleStatusChange(selectedRepair.id, newStatus);
                              }
                            }}
                            className={`w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest focus:outline-none transition-all ${getStatusColor(isEditing ? (editForm.status || selectedRepair.status) : selectedRepair.status)}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="diagnosing">Diagnosing</option>
                            <option value="awaiting_parts">Awaiting Parts</option>
                            <option value="in_progress">In Progress</option>
                            <option value="testing">Testing</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6 pt-4">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">AI_Diagnosis_Matrix</h4>
                        <button
                          onClick={handleAIDiagnosis}
                          disabled={isAnalyzing}
                          className="text-[9px] font-black text-gaming-accent hover:text-white transition-colors flex items-center gap-1 uppercase tracking-widest disabled:opacity-50"
                        >
                          <Zap size={10} className={isAnalyzing ? 'animate-pulse' : ''} />
                          {isAnalyzing ? 'Processing...' : 'Run Analysis'}
                        </button>
                      </div>
                      
                      <div className="relative min-h-[150px] bg-black/40 border border-gaming-accent/20 rounded-2xl p-6 overflow-hidden">
                        {diagnosis ? (
                          <div className="text-[10px] font-mono text-gray-300 leading-relaxed space-y-2">
                            <p className="text-gaming-accent font-black uppercase tracking-tighter">Diagnostic Report Output:</p>
                            <div className="whitespace-pre-wrap">{diagnosis}</div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-center space-y-3 pt-10">
                            <Activity className="text-gray-800" size={32} />
                            <p className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">Awaiting Fault Analysis Scan</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* RIGHT: Parts & Financials */}
                  <div className="lg:col-span-1 space-y-8">
                    <div className="space-y-6">
                      <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] border-b border-white/5 pb-2">Financial_Ledger</h4>
                      <div className="bg-gaming-accent/5 border border-gaming-accent/10 rounded-2xl p-6 space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono text-gray-500 uppercase">Labor_Node</span>
                          {isEditing ? (
                            <input
                              type="number"
                              value={editForm.laborCost || 0}
                              onChange={(e) => handleEditChange('laborCost', parseFloat(e.target.value))}
                              className="w-20 bg-black border border-white/10 rounded px-2 py-1 text-xs text-right text-white font-bold"
                            />
                          ) : (
                            <span className="text-xs font-bold text-white">{formatCurrency(selectedRepair.laborCost || 0)}</span>
                          )}
                        </div>
                        <div className="pt-4 border-t border-gaming-accent/20 flex justify-between items-end">
                          <div>
                            <p className="text-[10px] font-black text-gaming-accent uppercase tracking-[0.2em]">Total_Valuation</p>
                          </div>
                          <span className="text-2xl font-black text-white tracking-tighter italic">
                            {formatCurrency((selectedRepair.estimatedCost || 0) + (editForm.laborCost || selectedRepair.laborCost || 0))}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Bar Footer */}
              <div className="p-6 bg-white/[0.02] border-t border-white/10 flex justify-end items-center gap-4">
                <button
                  onClick={() => handleManualNotification('update')}
                  className="px-4 py-2 bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500/20 transition-all rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                >
                  <Activity size={14} /> Push Status Update
                </button>
                <button
                  onClick={() => setSelectedRepair(null)}
                  className="px-6 py-3 bg-gaming-accent text-black font-black rounded-2xl text-xs uppercase tracking-[0.2em] hover:bg-[#9333EA] transition-all"
                >
                  Close Matrix
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white tracking-tighter uppercase italic">Repair <span className="text-gaming-accent">Matrix</span></h1>
        <p className="text-gray-500 font-mono text-xs mt-1">Hardware Diagnostics & Service Lifecycle Management</p>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-[#080112] p-4 rounded-2xl border border-white/10">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search repair matrix..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 bg-black border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-gaming-accent w-full"
          />
        </div>
        <div className="flex items-center space-x-3">
          <Filter className="h-4 w-4 text-gray-500" />
          {(['all', 'pending', 'diagnosing', 'in_progress', 'completed'] as const).map(f => (
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

      {/* Content Matrix */}
      <div className="bg-[#080112] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/[0.02] text-gray-500 text-[10px] font-mono uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Ticket ID</th>
                <th className="px-6 py-4">Identity</th>
                <th className="px-6 py-4">Hardware & Issue</th>
                <th className="px-6 py-4">Status Protocol</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs font-mono text-gray-400">
              {filteredRepairs.map((repair) => (
                <tr key={repair.id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-6 py-4 text-gaming-accent font-bold tracking-tighter">[{repair.id.slice(-8).toUpperCase()}]</td>
                  <td className="px-6 py-4">
                    <div className="text-white uppercase font-bold">{repair.customer}</div>
                    <div className="text-[10px] text-gray-600">{repair.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-300 uppercase font-bold tracking-tight">{repair.device}</div>
                    <div className="text-[10px] text-gray-600 uppercase truncate max-w-[150px]">{repair.issue}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 text-[9px] font-black rounded border uppercase tracking-widest ${getStatusColor(repair.status)}`}>
                      {repair.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedRepair(repair)}
                      className="p-2 bg-white/5 hover:bg-gaming-accent/20 border border-white/5 text-gray-400 hover:text-white rounded-xl transition-all"
                    >
                      <Zap className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {repairs.length === 0 && (
          <div className="text-center py-20">
            <button
              onClick={handleSeedRepairs}
              className="px-6 py-2 bg-gaming-accent text-black rounded-xl font-black uppercase tracking-widest hover:bg-[#9333EA] shadow-[0_0_20px_rgba(168,85,247,0.4)]"
            >
              Seed Mock Repairs
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
