import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShoppingBag, Calendar, DollarSign, Activity, ShieldCheck, RefreshCw, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminOrders from './AdminOrders';
import AdminRentals from './AdminRentals';
import AdminSellRequests from './AdminSellRequests';
import AdminInventory from './AdminInventory';
import AdminInvoices from './AdminInvoices';

type OperationTab = 'orders' | 'rentals' | 'sell-requests' | 'inventory' | 'invoices';

const tabs: { id: OperationTab; name: string; icon: any }[] = [
  { id: 'orders', name: 'Orders', icon: ShoppingBag },
  { id: 'rentals', name: 'Rentals', icon: Calendar },
  { id: 'inventory', name: 'Inventory', icon: Activity },
  { id: 'sell-requests', name: 'Sell Requests', icon: DollarSign },
  { id: 'invoices', name: 'Invoices', icon: FileText },
];

export default function AdminOperations() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as OperationTab;
  const [activeTab, setActiveTab] = useState<OperationTab>(tabParam || 'orders');
  const [systemTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    if (tabParam && tabs.find(t => t.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tabId: OperationTab) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-8">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Activity className="h-3 w-3 text-gaming-accent animate-pulse" />
            <span className="text-[10px] font-mono text-gaming-accent uppercase tracking-[0.2em]">System Operations // Matrix Control</span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tighter uppercase italic">Operations <span className="text-gaming-accent">Matrix</span></h1>
          <p className="text-gray-500 font-mono text-xs mt-1">Unified Management Protocol // Orders, Rentals & Acquisitions</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 flex items-center space-x-3">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">All Protocols Active</span>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex items-center space-x-2 px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-bold uppercase tracking-widest text-[9px] md:text-[10px] transition-all duration-300 border whitespace-nowrap ${activeTab === tab.id
                ? 'bg-gaming-accent text-white border-gaming-accent shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                : 'bg-white/5 text-gray-500 border-white/10 hover:bg-white/10 hover:text-white'
              }`}
          >
            <tab.icon className={`h-3.5 w-3.5 ${activeTab === tab.id ? 'animate-bounce' : ''}`} />
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-[#080112] border border-white/10 rounded-2xl p-6 shadow-2xl"
      >
        <AnimatePresence mode="wait">
          {activeTab === 'orders' && <AdminOrders />}
          {activeTab === 'rentals' && <AdminRentals />}
          {activeTab === 'inventory' && <AdminInventory />}
          {activeTab === 'sell-requests' && <AdminSellRequests />}
          {activeTab === 'invoices' && <AdminInvoices />}
        </AnimatePresence>
      </motion.div>

      {/* Footer Info */}
      <div className="flex items-center justify-between pt-8 border-t border-white/10 text-[10px] font-mono text-gray-600 uppercase tracking-[0.3em]">
        <span>Matrix Version 4.2.0-STABLE</span>
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1">
            <RefreshCw className="h-3 w-3 animate-spin-slow" />
            <span>Auto-Sync Enabled</span>
          </span>
          <span>Last Update: {systemTime}</span>
        </div>
      </div>
    </div>
  );
}
