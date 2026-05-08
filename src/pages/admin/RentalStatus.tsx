import { useState } from 'react';
import { Search, Filter, Clock, CheckCircle, AlertTriangle, Calendar } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

type RentalStatus = 'Active' | 'Pending' | 'Completed' | 'Late';

interface RentalRecord {
  id: string;
  customerName: string;
  productName: string;
  startDate: string;
  endDate: string;
  status: RentalStatus;
  image: string;
}

const MOCK_RENTAL_STATUS: RentalRecord[] = [
  {
    id: 'RS-101',
    customerName: 'Alex Thompson',
    productName: 'DualSense Edge Controller',
    startDate: '2024-03-01',
    endDate: '2024-03-05',
    status: 'Active',
    image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'RS-102',
    customerName: 'Sarah Jenkins',
    productName: 'Xbox Wireless Controller',
    startDate: '2024-03-10',
    endDate: '2024-03-15',
    status: 'Pending',
    image: 'https://images.unsplash.com/photo-1621259182902-3b836c824e22?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'RS-103',
    customerName: 'Michael Chen',
    productName: 'Nintendo Switch Pro Controller',
    startDate: '2024-02-20',
    endDate: '2024-02-25',
    status: 'Completed',
    image: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'RS-104',
    customerName: 'Emma Rodriguez',
    productName: 'Pulse 3D Wireless Headset',
    startDate: '2024-02-25',
    endDate: '2024-03-02',
    status: 'Late',
    image: 'https://images.unsplash.com/photo-1622979135225-d2ba269fb1bd?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'RS-105',
    customerName: 'David Miller',
    productName: 'Razer Wolverine V2',
    startDate: '2024-03-05',
    endDate: '2024-03-12',
    status: 'Active',
    image: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&q=80&w=200'
  }
];

export default function RentalStatus() {
  const [rentals] = useState<RentalRecord[]>(MOCK_RENTAL_STATUS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const filteredRentals = rentals.filter(rental => {
    const matchesSearch = 
      rental.customerName.toLowerCase().includes(search.toLowerCase()) ||
      rental.productName.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || rental.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusStyles = (status: RentalStatus) => {
    switch (status) {
      case 'Active': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'Pending': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'Completed': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'Late': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: RentalStatus) => {
    switch (status) {
      case 'Active': return <Clock className="h-3 w-3" />;
      case 'Pending': return <Calendar className="h-3 w-3" />;
      case 'Completed': return <CheckCircle className="h-3 w-3" />;
      case 'Late': return <AlertTriangle className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Rental Status</h1>
        <p className="text-gaming-muted mt-2">Monitor active and upcoming rentals across all categories.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-gaming-card p-4 rounded-xl border border-gaming-border">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gaming-muted" />
          <input 
            type="text" 
            placeholder="Search by customer or product..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 bg-gaming-bg border border-gaming-border rounded-lg text-white focus:outline-none focus:border-gaming-accent w-full"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gaming-muted" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gaming-bg border border-gaming-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gaming-accent min-w-[140px]"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Late">Late</option>
          </select>
        </div>
      </div>

      <div className="bg-gaming-card border border-gaming-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gaming-bg text-gaming-muted text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Customer Name</th>
                <th className="px-6 py-4">Console</th>
                <th className="px-6 py-4">Start Date</th>
                <th className="px-6 py-4">End Date</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gaming-border text-sm text-gaming-text">
              {filteredRentals.map((rental) => (
                <tr key={rental.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{rental.customerName}</div>
                    <div className="text-xs text-gaming-muted font-mono">{rental.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <img src={rental.image} alt={rental.productName} className="w-8 h-8 rounded object-cover" />
                      <span className="text-white">{rental.productName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono">{rental.startDate}</td>
                  <td className="px-6 py-4 font-mono">{rental.endDate}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusStyles(rental.status)}`}>
                      {getStatusIcon(rental.status)}
                      {rental.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredRentals.length === 0 && (
          <div className="text-center py-12 text-gaming-muted">
            No rentals found matching your search criteria.
          </div>
        )}
      </div>
    </div>
  );
}
