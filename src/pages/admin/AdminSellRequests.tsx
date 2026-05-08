import { useState, useEffect } from 'react';
import { formatCurrency } from '../../lib/utils';
import { 
  CheckCircle, 
  XCircle, 
  Search, 
  Filter, 
  AlertTriangle, 
  Activity, 
  Zap, 
  User, 
  DollarSign, 
  TrendingUp, 
  Edit2, 
  Save,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { automationService } from '../../services/automationService';
import { notificationService } from '../../services/notificationService';
import { aiService } from '../../services/aiService';
import InvoiceModal from '../../components/admin/InvoiceModal';
import { invoiceService } from '../../services/invoiceService';

const API_URL = import.meta.env.VITE_API_URL || '';

type SellRequestStatus = 'pending' | 'offered' | 'accepted' | 'rejected' | 'completed';

interface SellRequest {
  id: string;
  _id?: string;
  customer: string;
  email: string;
  device: string;
  condition: string;
  estimatedValue: number;
  customerOffer?: number;
  adminOffer?: number;
  date: string;
  status: SellRequestStatus;
  images: string[];
}

export default function AdminSellRequests() {
  const [requests, setRequests] = useState<SellRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<SellRequest | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<SellRequest>>({});
  const [marketAnalysis, setMarketAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);

  const fetchRequests = async () => {
    const token = localStorage.getItem('consolezone_token');
    try {
      const response = await fetch(`${API_URL}/api/sell-requests`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json().catch(() => []);
        setRequests(data.map((r: any) => ({ ...r, id: r._id })));
      }
    } catch (error) {
      console.error("Fetch sell requests failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAIMarketAnalysis = async () => {
    if (!selectedRequest) return;
    setIsAnalyzing(true);
    setMarketAnalysis(null);
    const result = await aiService.getMarketValue(selectedRequest.device, selectedRequest.condition);
    setMarketAnalysis(result);
    setIsAnalyzing(false);
  };

  const handleStatusChange = async (id: string, newStatus: SellRequestStatus) => {
    const request = requests.find(r => r.id === id);
    if (!request) return;

    const token = localStorage.getItem('consolezone_token');
    try {
      const response = await fetch(`${API_URL}/api/sell-requests/${id}`, {
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
        setRequests(prev => prev.map(r => r.id === id ? final : r));
        if (selectedRequest?.id === id) {
          setSelectedRequest(final);
        }
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleEditToggle = async () => {
    if (isEditing) {
      if (selectedRequest) {
        const token = localStorage.getItem('consolezone_token');
        try {
          const response = await fetch(`${API_URL}/api/sell-requests/${selectedRequest.id}`, {
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
            setSelectedRequest(final);
            setRequests(prev => prev.map(r => r.id === final.id ? final : r));
          }
        } catch (error) {
          console.error('Failed to update sell request:', error);
        }
      }
      setIsEditing(false);
    } else {
      setEditForm(selectedRequest || {});
      setIsEditing(true);
    }
  };

  const handleEditChange = (field: keyof SellRequest, value: any) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch =
      (request.customer || '').toLowerCase().includes(search.toLowerCase()) ||
      (request.device || '').toLowerCase().includes(search.toLowerCase()) ||
      request.id.toLowerCase().includes(search.toLowerCase());

    const matchesFilter = filter === 'all' || request.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: SellRequestStatus) => {
    switch (status) {
      case 'offered': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'accepted': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'rejected': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'pending': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'completed': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gaming-accent"></div>
        <p className="text-[10px] font-mono text-gaming-accent uppercase tracking-widest animate-pulse">Syncing Matrix...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Detail Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#080112] border border-white/10 rounded-2xl w-full max-w-md p-8 shadow-2xl"
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-widest text-gaming-accent">Acquisition_Protocol</h3>
                  <p className="text-2xl font-bold text-white tracking-tighter uppercase italic">Request Details</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowInvoice(true)}
                    className="p-2 bg-white/5 rounded-full text-gaming-accent border border-gaming-accent/20 hover:bg-white/10 transition-colors"
                  >
                    <FileText size={20} />
                  </button>
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-500 hover:text-white"
                  >
                    <XCircle size={24} />
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                  {selectedRequest.images && selectedRequest.images[0] && (
                    <img src={selectedRequest.images[0]} alt={selectedRequest.device} className="w-20 h-20 rounded-lg object-cover border border-white/10" />
                  )}
                  <div>
                    <h4 className="font-bold text-white text-lg uppercase tracking-tight">{selectedRequest.device}</h4>
                    <p className="text-gaming-accent font-mono text-xs uppercase mt-1">Condition: {selectedRequest.condition}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/[0.02] p-4 border border-white/5 rounded-xl">
                    <span className="text-gray-500 block text-[10px] font-mono uppercase mb-1">Status</span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded border uppercase tracking-tighter ${getStatusColor(selectedRequest.status)}`}>
                      {selectedRequest.status}
                    </span>
                  </div>
                  <div className="bg-white/[0.02] p-4 border border-white/5 rounded-xl">
                    <span className="text-gray-500 block text-[10px] font-mono uppercase mb-1">Valuation</span>
                    <span className="text-white font-mono text-sm font-bold">{formatCurrency(selectedRequest.estimatedValue)}</span>
                  </div>
                </div>

                <div className="bg-white/[0.02] p-4 border border-white/5 rounded-xl">
                  <span className="text-gray-500 block text-[10px] font-mono uppercase mb-1">Admin Offer</span>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-gaming-accent" />
                    <input
                      type="number"
                      value={isEditing ? (editForm.adminOffer || '') : (selectedRequest.adminOffer || '')}
                      onChange={(e) => handleEditChange('adminOffer', parseFloat(e.target.value))}
                      disabled={!isEditing}
                      className="bg-black border border-white/10 rounded px-2 py-1 text-white font-mono text-sm focus:outline-none focus:border-gaming-accent w-full"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleEditToggle}
                    className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isEditing ? 'bg-gaming-accent text-black' : 'bg-white/5 text-white'}`}
                  >
                    {isEditing ? 'Save Offer' : 'Edit Request'}
                  </button>
                  {selectedRequest.status === 'pending' && (
                    <button
                      onClick={() => handleStatusChange(selectedRequest.id, 'offered')}
                      className="flex-1 py-3 bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all"
                    >
                      Send Offer
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div>
        <h1 className="text-4xl font-bold text-white tracking-tighter uppercase italic">Acquisition <span className="text-gaming-accent">Matrix</span></h1>
        <p className="text-gray-500 font-mono text-xs mt-1">Direct Hardware Buyback & Resale Acquisitions</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-[#080112] p-4 rounded-2xl border border-white/10">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search acquisition matrix..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 bg-black border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-gaming-accent w-full"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-black border border-white/10 rounded-xl px-4 py-2 text-white font-mono text-xs focus:outline-none focus:border-gaming-accent"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="offered">Offered</option>
          <option value="accepted">Accepted</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="bg-[#080112] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/[0.02] text-gray-500 text-[10px] font-mono uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Request ID</th>
                <th className="px-6 py-4">Hardware</th>
                <th className="px-6 py-4">Valuation</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs font-mono text-gray-400">
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-6 py-4 text-gaming-accent font-bold">[{request.id.slice(-8).toUpperCase()}]</td>
                  <td className="px-6 py-4 text-white font-bold">{request.device}</td>
                  <td className="px-6 py-4">{formatCurrency(request.estimatedValue)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded border uppercase tracking-tighter ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="p-2 hover:bg-gaming-accent/20 rounded transition-all text-gray-500 hover:text-white"
                    >
                      <Zap size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showInvoice && selectedRequest && (
        <InvoiceModal 
          data={invoiceService.formatSellRequestData(selectedRequest)} 
          onClose={() => setShowInvoice(false)} 
        />
      )}
    </div>
  );
}
