import { useState } from 'react';
import { formatCurrency } from '../../lib/utils';
import { CheckCircle, XCircle, Search, Filter, Eye, DollarSign, RefreshCw, ShieldCheck, Box } from 'lucide-react';
import { Link } from 'react-router-dom';

type RequestStatus = 'pending' | 'approved' | 'rejected' | 'purchased';

interface UsedConsoleRequest {
  id: string;
  customer: string;
  model: string;
  condition: 'New' | 'Like New' | 'Good' | 'Fair' | 'Poor';
  serialNumber: string;
  expectedPrice: number;
  offeredPrice?: number;
  status: RequestStatus;
  date: string;
  image: string;
  kycStatus: 'Verified' | 'Pending' | 'Flagged';
}

const MOCK_REQUESTS: UsedConsoleRequest[] = [
  {
    id: 'UC-3001',
    customer: 'Mike Johnson',
    model: 'PlayStation 4 Pro',
    condition: 'Good',
    serialNumber: 'PS4-99887766',
    expectedPrice: 200.00,
    status: 'pending',
    date: '2023-10-26',
    image: 'https://images.unsplash.com/photo-1507457379470-08b800bebc67?auto=format&fit=crop&q=80&w=200',
    kycStatus: 'Verified'
  },
  {
    id: 'UC-3002',
    customer: 'Emily Davis',
    model: 'Xbox One S',
    condition: 'Like New',
    serialNumber: 'XB1-11223344',
    expectedPrice: 150.00,
    offeredPrice: 140.00,
    status: 'approved',
    date: '2023-10-25',
    image: 'https://images.unsplash.com/photo-1621259182902-3b836c824e22?auto=format&fit=crop&q=80&w=200',
    kycStatus: 'Verified'
  },
  {
    id: 'UC-3003',
    customer: 'Chris Wilson',
    model: 'Nintendo Switch Lite',
    condition: 'Fair',
    serialNumber: 'NSW-55667788',
    expectedPrice: 100.00,
    status: 'rejected',
    date: '2023-10-23',
    image: 'https://images.unsplash.com/photo-1618519764620-7403abdbdfe9?auto=format&fit=crop&q=80&w=200',
    kycStatus: 'Pending'
  }
];

export default function AdminUsedConsoles() {
  const [requests, setRequests] = useState<UsedConsoleRequest[]>(MOCK_REQUESTS);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<UsedConsoleRequest | null>(null);
  const [offerAmount, setOfferAmount] = useState<string>('');

  const handleStatusChange = (id: string, newStatus: RequestStatus, offer?: number) => {
    setRequests(requests.map(r =>
      r.id === id ? { ...r, status: newStatus, offeredPrice: offer || r.offeredPrice } : r
    ));
    setSelectedRequest(null);
    setOfferAmount('');
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch =
      req.customer.toLowerCase().includes(search.toLowerCase()) ||
      req.model.toLowerCase().includes(search.toLowerCase()) ||
      req.id.toLowerCase().includes(search.toLowerCase());

    const matchesFilter = filter === 'all' || req.status === filter;

    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case 'approved': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'purchased': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'rejected': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'pending': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Offer Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#080112] border border-white/10 rounded-lg w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xs font-mono uppercase tracking-widest text-gaming-accent">Request_Review</h3>
                <p className="text-xl font-bold text-white tracking-tighter uppercase italic">Asset Acquisition</p>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-4 p-3 bg-white/[0.02] border border-white/5 rounded">
                <img src={selectedRequest.image} alt={selectedRequest.model} className="w-16 h-16 rounded object-cover border border-white/10" />
                <div>
                  <h4 className="font-bold text-white text-sm uppercase tracking-tight">{selectedRequest.model}</h4>
                  <p className="text-gray-500 text-[10px] font-mono uppercase">{selectedRequest.customer}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/[0.02] p-3 border border-white/5 rounded">
                  <span className="text-gray-500 block text-[9px] font-mono uppercase mb-1">Condition</span>
                  <span className="text-white font-mono text-xs uppercase">{selectedRequest.condition}</span>
                </div>
                <div className="bg-white/[0.02] p-3 border border-white/5 rounded">
                  <span className="text-gray-500 block text-[9px] font-mono uppercase mb-1">Expected Price</span>
                  <span className="text-gaming-accent font-mono text-sm font-bold">{formatCurrency(selectedRequest.expectedPrice)}</span>
                </div>
              </div>

              <div className="bg-white/[0.02] p-3 border border-white/5 rounded">
                <span className="text-gray-500 block text-[9px] font-mono uppercase mb-1">Serial Number</span>
                <span className="text-white font-mono text-xs tracking-widest">{selectedRequest.serialNumber}</span>
              </div>

              {selectedRequest.status === 'pending' && (
                <div className="pt-6 border-t border-white/10 space-y-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-gray-400 mb-2">Acquisition Offer (?)</label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        value={offerAmount}
                        onChange={(e) => setOfferAmount(e.target.value)}
                        placeholder={selectedRequest.expectedPrice.toString()}
                        className="flex-1 bg-black border border-white/10 rounded p-2 text-white font-mono text-sm focus:border-gaming-accent focus:outline-none"
                      />
                      <button
                        onClick={() => handleStatusChange(selectedRequest.id, 'approved', parseFloat(offerAmount))}
                        disabled={!offerAmount}
                        className="px-4 py-2 bg-gaming-accent text-black font-bold rounded text-xs uppercase tracking-widest hover:bg-[#9333EA] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        Send Offer
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => handleStatusChange(selectedRequest.id, 'rejected')}
                    className="w-full py-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded text-[10px] font-mono uppercase tracking-widest hover:bg-red-500/20 transition-all"
                  >
                    Reject Acquisition
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-8">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <RefreshCw className="h-3 w-3 text-gaming-accent animate-spin-slow" />
            <span className="text-[10px] font-mono text-gaming-accent uppercase tracking-[0.2em]">Asset Acquisition // Used Consoles</span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tighter uppercase italic">Hardware <span className="text-gaming-accent">Matrix</span></h1>
          <p className="text-gray-500 font-mono text-xs mt-1">Deep Inventory & Identity Protocols // Used Console Requests</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-right hidden md:block">
            <p className="text-[10px] font-mono text-gray-500 uppercase">Pending Requests</p>
            <p className="text-xs font-mono text-white">{requests.filter(r => r.status === 'pending').length} Units</p>
          </div>
          <button className="px-4 py-2 bg-white/5 border border-white/10 rounded text-xs font-mono text-white hover:bg-white/10 transition-all flex items-center space-x-2">
            <Box className="h-3 w-3" />
            <span>Export Matrix</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-[#080112] p-4 rounded-lg border border-white/5">
        <div className="relative flex-grow w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search acquisition matrix..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 bg-black border border-white/10 rounded text-white font-mono text-xs focus:outline-none focus:border-gaming-accent w-full"
          />
        </div>
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-black border border-white/10 rounded px-4 py-2 text-white font-mono text-xs focus:outline-none focus:border-gaming-accent flex-grow md:flex-grow-0"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="purchased">Purchased</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#080112] border border-white/10 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/[0.02] text-gray-500 text-[10px] font-mono uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Asset ID</th>
                <th className="px-6 py-4">Identity / Date</th>
                <th className="px-6 py-4">Hardware Details</th>
                <th className="px-6 py-4">Valuation</th>
                <th className="px-6 py-4">Protocol Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs font-mono text-gray-400">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-6 py-4 text-gaming-accent font-bold tracking-tighter">[{req.id}]</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-white uppercase font-bold">{req.customer}</span>
                      <span className={`px-1 rounded text-[8px] border ${req.kycStatus === 'Verified' ? 'text-emerald-500 border-emerald-500/20' :
                          req.kycStatus === 'Pending' ? 'text-amber-500 border-amber-500/20' :
                            'text-red-500 border-red-500/20'
                        }`}>
                        {req.kycStatus}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-600">{req.date}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <img src={req.image} alt={req.model} className="w-8 h-8 rounded object-cover border border-white/10" />
                      <div>
                        <div className="text-gray-300 uppercase font-bold tracking-tight">{req.model}</div>
                        <div className="text-[9px] text-gray-600 uppercase">Cond: {req.condition}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-600 line-through text-[10px]">{formatCurrency(req.expectedPrice)}</div>
                    {req.offeredPrice && (
                      <div className="text-gaming-accent font-bold">{formatCurrency(req.offeredPrice)}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded border uppercase tracking-tighter ${getStatusColor(req.status)}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      {req.status === 'pending' && (
                        <button
                          onClick={() => {
                            setSelectedRequest(req);
                            setOfferAmount(req.expectedPrice.toString());
                          }}
                          className="p-2 bg-gaming-accent/10 text-gaming-accent hover:bg-gaming-accent/20 border border-gaming-accent/20 rounded transition-all"
                          title="Review & Offer"
                        >
                          <DollarSign className="h-4 w-4" />
                        </button>
                      )}
                      {req.status === 'approved' && (
                        <button
                          onClick={() => handleStatusChange(req.id, 'purchased')}
                          className="p-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20 rounded transition-all"
                          title="Mark Purchased"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      <button className="p-2 hover:bg-white/5 rounded transition-colors text-gray-600 hover:text-white border border-transparent hover:border-white/10">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRequests.length === 0 && (
          <div className="text-center py-12 text-gray-600 font-mono text-xs uppercase tracking-widest">
            Acquisition Matrix Empty // No matching records
          </div>
        )}
      </div>
    </div>
  );
}

