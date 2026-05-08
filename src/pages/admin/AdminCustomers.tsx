import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  User,
  RefreshCw,
  ChevronDown
} from 'lucide-react';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || '';

interface Customer {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
  consolezone_id?: string;
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'admin' | 'user'>('all');

  const loadCustomers = async () => {
    const token = localStorage.getItem('consolezone_token');
    try {
      const response = await fetch(`${API_URL}/api/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json().catch(() => []);
        setCustomers(data.map((u: any) => ({ 
          ...u, 
          id: u._id,
          username: u.username || 'Anonymous User'
        })));
      }
    } catch (error) {
      console.error("API error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleUpdateRole = async (userId: string, newRole: 'user' | 'admin') => {
    const token = localStorage.getItem('consolezone_token');
    try {
      const response = await fetch(`${API_URL}/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      if (response.ok) {
        setCustomers(prev => prev.map(c => c.id === userId ? { ...c, role: newRole } : c));
      }
    } catch (error) {
      console.error("Update role failed:", error);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      (customer.username || '').toLowerCase().includes(search.toLowerCase()) ||
      (customer.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (customer.consolezone_id || '').toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || customer.role === filter;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <RefreshCw className="h-10 w-10 text-gaming-accent animate-spin" />
        <p className="text-[10px] font-mono text-gaming-accent uppercase tracking-[0.4em] animate-pulse">Syncing User Matrix...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-4xl font-bold text-white tracking-tighter uppercase italic">User <span className="text-gaming-accent">Database</span></h1>
        <p className="text-gray-500 font-mono text-xs mt-1">Direct MongoDB Node Access // Customer Registry</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-[#080112] p-4 rounded-2xl border border-white/10">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name, email, or ConsoleZone ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 bg-black border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-gaming-accent w-full"
          />
        </div>
        <div className="relative">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="appearance-none bg-black border border-white/10 rounded-xl pl-4 pr-10 py-2 text-white font-mono text-xs focus:outline-none focus:border-gaming-accent"
          >
            <option value="all">All Roles</option>
            <option value="admin">Administrators</option>
            <option value="user">Standard Users</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-500 pointer-events-none" />
        </div>
      </div>

      <div className="bg-[#080112] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/[0.02] text-gray-500 text-[10px] font-mono uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">User Identity</th>
                <th className="px-6 py-4">Security Level</th>
                <th className="px-6 py-4">Registered</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs font-mono text-gray-400">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gaming-accent/10 flex items-center justify-center text-gaming-accent">
                        <User size={14} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="text-white font-bold">{customer.username}</div>
                          <span className="text-[8px] font-mono text-gaming-accent border border-gaming-accent/20 px-1 rounded bg-gaming-accent/5">
                            {customer.consolezone_id || 'NO_ID'}
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-600">{customer.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-tighter ${
                      customer.role === 'admin' ? 'text-gaming-accent border-gaming-accent/20 bg-gaming-accent/10' : 'text-gray-400 border-white/10 bg-white/5'
                    }`}>
                      {customer.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleUpdateRole(customer.id, customer.role === 'admin' ? 'user' : 'admin')}
                      className="px-3 py-1 bg-white/5 border border-white/10 rounded hover:bg-gaming-accent/20 hover:text-gaming-accent transition-all text-[9px] font-black uppercase"
                    >
                      Toggle Role
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
