import { useState } from 'react';
import {
  Tag,
  Plus,
  Search,
  MoreVertical,
  Copy,
  Trash2,
  Edit2,
  Users,
  Calendar,
  Activity
} from 'lucide-react';

const coupons = [
  {
    id: '1',
    code: 'GAMER20',
    discount: '20%',
    type: 'Percentage',
    usage: 145,
    limit: 500,
    expiry: '2024-12-31',
    status: 'Active',
    color: 'from-gaming-accent to-[#9333EA]'
  },
  {
    id: '2',
    code: 'WELCOME50',
    discount: '?50',
    type: 'Fixed Amount',
    usage: 89,
    limit: 200,
    expiry: '2024-06-30',
    status: 'Active',
    color: 'from-[#3B82F6] to-[#2563EB]'
  },
  {
    id: '3',
    code: 'REPAIR10',
    discount: '10%',
    type: 'Percentage',
    usage: 32,
    limit: 100,
    expiry: '2024-04-15',
    status: 'Expired',
    color: 'from-[#10B981] to-[#059669]'
  },
  {
    id: '4',
    code: 'SUMMER24',
    discount: '15%',
    type: 'Percentage',
    usage: 0,
    limit: 1000,
    expiry: '2024-08-31',
    status: 'Scheduled',
    color: 'from-[#F59E0B] to-[#D97706]'
  }
];

export default function AdminCoupons() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Coupons & Discounts</h1>
          <p className="text-gray-400 mt-2">Create and manage promotional offers.</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-gaming-accent text-white rounded-xl hover:bg-[#9333EA] transition-colors shadow-lg shadow-gaming-accent/20">
          <Plus className="h-4 w-4" />
          <span>Create Coupon</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#111] p-6 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <Users className="h-5 w-5 text-gaming-accent" />
            <span className="text-xs text-green-400 font-medium">+12% this month</span>
          </div>
          <p className="text-gray-400 text-sm">Total Coupon Users</p>
          <p className="text-2xl font-bold text-white mt-1">1,245</p>
        </div>
        <div className="bg-[#111] p-6 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <Activity className="h-5 w-5 text-[#3B82F6]" />
            <span className="text-xs text-green-400 font-medium">85% success rate</span>
          </div>
          <p className="text-gray-400 text-sm">Active Campaigns</p>
          <p className="text-2xl font-bold text-white mt-1">8</p>
        </div>
        <div className="bg-[#111] p-6 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <Tag className="h-5 w-5 text-[#10B981]" />
            <span className="text-xs text-gray-400 font-medium">Last 30 days</span>
          </div>
          <p className="text-gray-400 text-sm">Total Discount Value</p>
          <p className="text-2xl font-bold text-white mt-1">?12,450.00</p>
        </div>
      </div>

      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search coupon codes..."
            className="w-full bg-[#111] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-gaming-accent transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((coupon) => (
          <div key={coupon.id} className="bg-[#111] rounded-2xl border border-white/10 overflow-hidden group hover:border-gaming-accent/50 transition-all">
            <div className={`h-24 bg-gradient-to-r ${coupon.color} p-6 flex justify-between items-start relative overflow-hidden`}>
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <Tag className="h-24 w-24 rotate-12" />
              </div>
              <div>
                <h3 className="text-white font-bold text-2xl tracking-wider">{coupon.code}</h3>
                <p className="text-white/80 text-sm font-medium">{coupon.type}</p>
              </div>
              <div className="bg-white/20 backdrop-blur-md rounded-lg px-3 py-1 text-white font-bold">
                {coupon.discount}
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Usage Status</span>
                <span className="text-white font-medium">{coupon.usage} / {coupon.limit}</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${coupon.color}`}
                  style={{ width: `${(coupon.usage / coupon.limit) * 100}%` }}
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="h-3 w-3 mr-1" />
                  Expires: {coupon.expiry}
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${coupon.status === 'Active' ? 'bg-green-500/10 text-green-400' :
                    coupon.status === 'Expired' ? 'bg-red-500/10 text-red-400' :
                      'bg-yellow-500/10 text-yellow-400'
                  }`}>
                  {coupon.status}
                </span>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex space-x-2">
                  <button className="p-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 transition-colors">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button className="p-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 transition-colors">
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <button className="p-2 bg-red-500/5 text-red-500/50 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

