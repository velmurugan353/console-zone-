import { useState, useEffect } from 'react';
import { 
  Search, 
  FileText, 
  Download, 
  Calendar,
  User,
  Hash,
  RefreshCw,
  Clock,
  Eye,
  Plus,
  X,
  Mail,
  CreditCard,
  Zap,
  TrendingUp,
  ChevronDown,
  Check,
  Save,
  Package,
  Wrench,
  SearchCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '../../lib/utils';
import { invoiceService, InvoiceData } from '../../services/invoiceService';
import InvoiceModal from '../../components/admin/InvoiceModal';

type ServiceType = 'order' | 'rental' | 'repair' | 'buyback';

const API_URL = import.meta.env.VITE_API_URL || '';

interface UnifiedTransaction {
  id: string;
  type: 'order' | 'rental' | 'buyback' | 'manual';
  serviceType?: ServiceType;
  customer: string;
  date: string;
  total: number;
  status: string;
  rawData: any;
}

export default function AdminInvoices() {
  const [transactions, setTransactions] = useState<UnifiedTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'order' | 'rental' | 'buyback' | 'manual'>('all');
  const [systemTime] = useState(new Date().toLocaleTimeString());
  
  const [previewData, setPreviewData] = useState<InvoiceData | null>(null);
  const [showManualForm, setShowManualForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);

  // Selector Data
  const [systemProducts, setSystemProducts] = useState<any[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [activeProductIdx, setActiveProductIdx] = useState<number | null>(null);

  // Manual Form State
  const [selectedService, setSelectedService] = useState<ServiceType>('order');
  const [manualInvoice, setManualInvoice] = useState<InvoiceData>({
    type: 'Order',
    invoiceNumber: `INV-MAN-${Date.now().toString().slice(-6)}`,
    date: new Date().toISOString().split('T')[0],
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    items: [{ name: '', description: '', quantity: 1, price: 0, total: 0 }],
    subtotal: 0,
    tax: 0,
    shipping: 0,
    total: 0,
    paymentMethod: 'Custom / Offline'
  });

  const loadInvoices = async () => {
    const token = localStorage.getItem('consolezone_token');
    try {
      const [ordersRes, rentalsRes, productsRes] = await Promise.all([
        fetch(`${API_URL}/api/orders`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/api/rentals`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/api/products`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const ordersData = await ordersRes.json().catch(() => []);
      const rentalsData = await rentalsRes.json().catch(() => []);
      const productsData = await productsRes.json().catch(() => []);

      const orders = Array.isArray(ordersData) ? ordersData.map((o: any) => ({
        id: o._id || o.id,
        type: 'order' as const,
        customer: o.customer,
        date: o.date,
        total: o.total,
        status: o.status,
        rawData: { ...o, id: o._id || o.id }
      })) : [];

      const rentals = Array.isArray(rentalsData) ? rentalsData.map((r: any) => ({
        id: r._id || r.id,
        type: 'rental' as const,
        customer: r.user,
        date: r.startDate,
        total: (r.totalPrice || 0) + (r.deposit || 0),
        status: r.status,
        rawData: { ...r, id: r._id || r.id }
      })) : [];

      setTransactions([...orders, ...rentals].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setSystemProducts(Array.isArray(productsData) ? productsData.map((p: any) => ({ ...p, id: p._id || p.id })) : []);
    } catch (error) {
      console.error("API error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  // Recalculate manual totals
  useEffect(() => {
    const subtotal = manualInvoice.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const total = subtotal + (Number(manualInvoice.shipping) || 0) + (Number(manualInvoice.tax) || 0);
    
    let type: 'Rental' | 'Order' | 'Repair' | 'Buyback' = 'Order';
    if (selectedService === 'rental') type = 'Rental';
    else if (selectedService === 'repair') type = 'Repair';
    else if (selectedService === 'buyback') type = 'Buyback';

    setManualInvoice(prev => ({ ...prev, subtotal, total, type }));
  }, [manualInvoice.items, manualInvoice.shipping, manualInvoice.tax, selectedService]);

  const lookupCustomerByEmail = async () => {
    if (!manualInvoice.customerEmail) return;
    setIsSearchingCustomer(true);
    const token = localStorage.getItem('consolezone_token');
    try {
      const response = await fetch(`${API_URL}/api/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const users = await response.json();
      const user = users.find((u: any) => u.email === manualInvoice.customerEmail);
      
      if (user) {
        setManualInvoice(prev => ({
          ...prev,
          customerName: user.username || prev.customerName,
          customerPhone: user.phone || prev.customerPhone,
          customerAddress: user.address || prev.customerAddress
        }));
      } else {
        alert('Customer profile not found in matrix.');
      }
    } catch (error) {
      console.error('Lookup Failure:', error);
    } finally {
      setIsSearchingCustomer(false);
    }
  };

  const handlePreviewInvoice = (transaction: UnifiedTransaction) => {
    let data: InvoiceData;
    if (transaction.type === 'order') data = invoiceService.formatOrderData(transaction.rawData);
    else if (transaction.type === 'rental') data = invoiceService.formatRentalData(transaction.rawData);
    else if (transaction.type === 'buyback') data = invoiceService.formatSellRequestData(transaction.rawData);
    else data = transaction.rawData;
    setPreviewData(data);
  };

  const handleDownloadInvoice = (transaction: UnifiedTransaction) => {
    let data: InvoiceData;
    if (transaction.type === 'order') data = invoiceService.formatOrderData(transaction.rawData);
    else if (transaction.type === 'rental') data = invoiceService.formatRentalData(transaction.rawData);
    else if (transaction.type === 'buyback') data = invoiceService.formatSellRequestData(transaction.rawData);
    else data = transaction.rawData;
    invoiceService.generatePDF(data);
  };

  const handleSaveManualInvoice = async () => {
    if (!manualInvoice.customerName || manualInvoice.items.some(i => !i.name)) {
      alert('Validation Error: Customer name and item names are required.');
      return;
    }

    setIsSaving(true);
    const token = localStorage.getItem('consolezone_token');
    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          customer: manualInvoice.customerName,
          email: manualInvoice.customerEmail,
          phone: manualInvoice.customerPhone,
          total: manualInvoice.total,
          items: manualInvoice.items.map(i => ({ name: i.name, price: i.price, quantity: i.quantity, type: 'buy' })),
          shippingAddress: manualInvoice.customerAddress,
          paymentMethod: manualInvoice.paymentMethod,
          status: 'delivered',
          date: manualInvoice.date
        })
      });
      if (response.ok) {
        alert('Manual Invoice successfully committed to matrix.');
        setShowManualForm(false);
        resetManualForm();
        loadInvoices();
      }
    } catch (error) {
      console.error('Persistence Failure:', error);
      alert('Error saving invoice.');
    } finally {
      setIsSaving(false);
    }
  };

  const resetManualForm = () => {
    setManualInvoice({
      invoiceNumber: `INV-MAN-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().split('T')[0],
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      customerAddress: '',
      items: [{ name: '', description: '', quantity: 1, price: 0, total: 0 }],
      subtotal: 0,
      tax: 0,
      shipping: 0,
      total: 0,
      paymentMethod: 'Custom / Offline',
      type: 'Order'
    });
    setSelectedService('order');
  };

  const addManualItem = () => {
    setManualInvoice(prev => ({
      ...prev,
      items: [...prev.items, { name: '', description: '', quantity: 1, price: 0, total: 0 }]
    }));
  };

  const removeManualItem = (index: number) => {
    if (manualInvoice.items.length === 1) return;
    setManualInvoice(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateManualItem = (index: number, field: string, value: any) => {
    const newItems = [...manualInvoice.items];
    newItems[index] = { 
      ...newItems[index], 
      [field]: value,
      total: field === 'price' ? value * (newItems[index].quantity || 0) : 
             field === 'quantity' ? (value || 0) * (newItems[index].price || 0) : 
             newItems[index].total
    };
    setManualInvoice(prev => ({ ...prev, items: newItems }));
  };

  const selectProduct = (idx: number, product: any) => {
    const newItems = [...manualInvoice.items];
    newItems[idx] = {
      name: product.name,
      description: product.description?.substring(0, 50) || product.category,
      quantity: 1,
      price: product.price,
      total: product.price
    };
    setManualInvoice(prev => ({ ...prev, items: newItems }));
    setActiveProductIdx(null);
    setProductSearch('');
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = 
      (t.id || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.customer || '').toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const filteredSelectorProducts = systemProducts.filter(p => 
    (p.name || '').toLowerCase().includes(productSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <RefreshCw className="h-10 w-10 text-gaming-accent animate-spin" />
        <p className="text-[10px] font-mono text-gaming-accent uppercase tracking-[0.4em] animate-pulse">Accessing Finance Matrix...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tighter uppercase italic">
            Invoice <span className="text-gaming-accent">Generator</span>
          </h1>
          <p className="text-gray-500 font-mono text-xs mt-1">Centralized Financial Document Matrix</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowManualForm(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-bold font-mono text-xs uppercase tracking-widest hover:bg-white/10 transition-all shadow-lg hover:shadow-gaming-accent/10"
          >
            <Plus className="h-4 w-4 text-gaming-accent" />
            Manual Invoice
          </button>
          <div className="bg-[#080112] border border-white/10 rounded-xl px-4 py-2 flex items-center gap-3">
            <Clock className="h-4 w-4 text-gaming-accent" />
            <span className="text-white font-mono text-[10px] uppercase tracking-widest font-bold">System_Time: {systemTime}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by ID or Customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#080112] border border-white/10 rounded-2xl text-white font-mono text-sm focus:outline-none focus:border-gaming-accent/50"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="flex-1 bg-[#080112] border border-white/10 rounded-2xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-gaming-accent/50 appearance-none cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="order">Orders Only</option>
            <option value="rental">Rentals Only</option>
            <option value="manual">Manual Documents</option>
          </select>
          <button 
            onClick={() => {setSearch(''); setTypeFilter('all');}}
            className="p-3 bg-[#080112] border border-white/10 rounded-2xl text-gray-500 hover:text-white transition-colors"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Transaction List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((t) => (
            <motion.div
              key={`${t.type}-${t.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#080112] border border-white/10 rounded-2xl p-6 hover:border-gaming-accent/30 transition-all group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${
                    t.type === 'order' ? 'bg-blue-500/10 text-blue-500' : 
                    t.type === 'rental' ? 'bg-emerald-500/10 text-emerald-500' : 
                    'bg-purple-500/10 text-purple-500'
                  }`}>
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-gaming-accent font-bold font-mono text-sm tracking-tighter">[{t.id.slice(-8).toUpperCase()}]</span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                        t.type === 'order' ? 'text-blue-400 border-blue-500/20 bg-blue-500/5' : 
                        t.type === 'rental' ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' :
                        'text-purple-400 border-purple-500/20 bg-purple-500/5'
                      }`}>
                        {t.type}
                      </span>
                    </div>
                    <h3 className="text-white font-bold uppercase tracking-tight text-lg">{t.customer || 'Guest User'}</h3>
                    <div className="flex items-center gap-4 text-gray-500 font-mono text-[10px] uppercase">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(t.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-gray-500 text-[9px] font-mono uppercase tracking-widest">Total Valuation</p>
                    <p className="text-xl font-bold text-white tracking-tighter">{formatCurrency(t.total)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePreviewInvoice(t)}
                      className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl font-bold font-mono text-[10px] uppercase tracking-widest hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Preview
                    </button>
                    <button
                      onClick={() => handleDownloadInvoice(t)}
                      className="flex items-center gap-2 px-4 py-2 bg-gaming-accent text-black rounded-xl font-bold font-mono text-[10px] uppercase tracking-widest hover:bg-[#9333EA] transition-all"
                    >
                      <Download className="h-3.5 w-3.5" />
                      PDF
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-20 bg-[#080112] border border-dashed border-white/10 rounded-3xl">
            <Hash className="h-12 w-12 text-gray-800 mx-auto mb-4" />
            <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">No matching records in the matrix</p>
          </div>
        )}
      </div>

      {/* Manual Invoice Modal Form */}
      <AnimatePresence>
        {showManualForm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#080112] border border-white/10 rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-[0_0_100px_rgba(168,85,247,0.15)]"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tighter uppercase italic">Manual <span className="text-gaming-accent">Invoice_Protocol</span></h2>
                  <p className="text-gray-500 font-mono text-[10px] uppercase mt-1">Generate and persist custom documentation</p>
                </div>
                <button onClick={() => setShowManualForm(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-500 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-8 space-y-10">
                {/* Service Type Selection */}
                <div className="space-y-4">
                  <h3 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest flex items-center">
                    <Zap className="mr-2 h-3 w-3 text-gaming-accent" /> Select_Service_Context
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { id: 'order', label: 'Sales Order', icon: Package, color: 'text-blue-400' },
                      { id: 'rental', label: 'Rental Service', icon: Calendar, color: 'text-emerald-400' },
                      { id: 'repair', label: 'Repair Job', icon: Wrench, color: 'text-amber-400' },
                      { id: 'buyback', label: 'Buyback Proc.', icon: TrendingUp, color: 'text-purple-400' }
                    ].map((svc) => (
                      <button
                        key={svc.id}
                        onClick={() => setSelectedService(svc.id as ServiceType)}
                        className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 group ${
                          selectedService === svc.id 
                          ? 'bg-gaming-accent/10 border-gaming-accent/50 shadow-[0_0_15px_rgba(168,85,247,0.1)]' 
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <svc.icon className={`h-6 w-6 ${selectedService === svc.id ? svc.color : 'text-gray-500'}`} />
                        <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${selectedService === svc.id ? 'text-white' : 'text-gray-500'}`}>
                          {svc.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest flex items-center">
                      <Hash className="mr-2 h-3 w-3 text-gaming-accent" /> Document_Meta
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-gray-600 uppercase ml-2">Invoice Number</label>
                        <input
                          type="text"
                          value={manualInvoice.invoiceNumber}
                          onChange={(e) => setManualInvoice(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                          className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-xs focus:outline-none focus:border-gaming-accent"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-gray-600 uppercase ml-2">Protocol Date</label>
                        <input
                          type="date"
                          value={manualInvoice.date}
                          onChange={(e) => setManualInvoice(prev => ({ ...prev, date: e.target.value }))}
                          className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-xs focus:outline-none focus:border-gaming-accent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Customer Info with Email Lookup */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest flex items-center justify-between">
                      <span className="flex items-center"><User className="mr-2 h-3 w-3 text-gaming-accent" /> Customer_Entity</span>
                    </h3>
                    
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <input
                          type="email"
                          placeholder="Customer Email Address"
                          value={manualInvoice.customerEmail}
                          onChange={(e) => setManualInvoice(prev => ({ ...prev, customerEmail: e.target.value }))}
                          className="w-full bg-black border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white font-mono text-xs focus:outline-none focus:border-gaming-accent"
                        />
                      </div>
                      <button 
                        onClick={lookupCustomerByEmail}
                        disabled={isSearchingCustomer}
                        className="px-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-gaming-accent disabled:opacity-50"
                      >
                        {isSearchingCustomer ? <RefreshCw className="h-4 w-4 animate-spin" /> : <SearchCode className="h-4 w-4" />}
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder="Full Name"
                      value={manualInvoice.customerName}
                      onChange={(e) => setManualInvoice(prev => ({ ...prev, customerName: e.target.value }))}
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-xs focus:outline-none focus:border-gaming-accent"
                    />

                    <input
                      type="text"
                      placeholder="Contact Phone"
                      value={manualInvoice.customerPhone}
                      onChange={(e) => setManualInvoice(prev => ({ ...prev, customerPhone: e.target.value }))}
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-xs focus:outline-none focus:border-gaming-accent"
                    />
                    <textarea
                      placeholder="Physical Distribution Address"
                      value={manualInvoice.customerAddress}
                      onChange={(e) => setManualInvoice(prev => ({ ...prev, customerAddress: e.target.value }))}
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-xs focus:outline-none focus:border-gaming-accent min-h-[80px] resize-none"
                    />
                  </div>
                </div>

                {/* Items Matrix */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest">
                      Payload_Matrix
                    </h3>
                    <button
                      onClick={addManualItem}
                      className="text-[10px] font-mono text-gaming-accent hover:text-white flex items-center gap-1 uppercase tracking-widest"
                    >
                      <Plus size={12} /> Add_Item_Entry
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {manualInvoice.items.map((item, idx) => (
                      <div key={idx} className="relative bg-white/[0.02] p-6 rounded-2xl border border-white/5 space-y-4 group transition-colors hover:bg-white/[0.03]">
                        <div className="grid grid-cols-12 gap-4 items-end">
                          <div className="col-span-5 space-y-1 relative">
                            <label className="text-[9px] font-mono text-gray-600 uppercase ml-2">Asset Name</label>
                            <div className="flex gap-2">
                              <input
                                placeholder="Hardware Asset / Service"
                                value={item.name}
                                onChange={(e) => updateManualItem(idx, 'name', e.target.value)}
                                className="w-full bg-black border border-white/5 rounded-xl px-4 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-gaming-accent"
                              />
                              <button 
                                onClick={() => setActiveProductIdx(activeProductIdx === idx ? null : idx)}
                                className="p-2.5 bg-white/5 rounded-xl hover:bg-gaming-accent/20 transition-colors border border-white/5"
                              >
                                <ChevronDown className={`h-4 w-4 text-gaming-accent ${activeProductIdx === idx ? 'rotate-180' : ''}`} />
                              </button>
                            </div>

                            {activeProductIdx === idx && (
                              <div className="absolute top-full mt-2 left-0 right-0 bg-[#0f0f0f] border border-white/10 rounded-2xl shadow-2xl z-50 p-4 space-y-4">
                                <input
                                  autoFocus
                                  placeholder="Search inventory..."
                                  value={productSearch}
                                  onChange={(e) => setProductSearch(e.target.value)}
                                  className="w-full bg-black border border-white/5 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-gaming-accent/50"
                                />
                                <div className="max-h-40 overflow-y-auto space-y-1">
                                  {filteredSelectorProducts.map(p => (
                                    <button
                                      key={p.id}
                                      onClick={() => selectProduct(idx, p)}
                                      className="w-full text-left p-2.5 hover:bg-white/5 rounded-xl flex items-center justify-between group"
                                    >
                                      <div className="flex items-center gap-3">
                                        <img src={p.image} className="w-8 h-8 rounded border border-white/5" />
                                        <div>
                                          <p className="text-xs font-bold text-white uppercase">{p.name}</p>
                                          <p className="text-[9px] text-gray-500 font-mono">{formatCurrency(p.price)}</p>
                                        </div>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="col-span-3 space-y-1">
                            <label className="text-[9px] font-mono text-gray-600 uppercase ml-2">Description</label>
                            <input
                              placeholder="Condition / Specs"
                              value={item.description}
                              onChange={(e) => updateManualItem(idx, 'description', e.target.value)}
                              className="w-full bg-black border border-white/5 rounded-xl px-4 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-gaming-accent"
                            />
                          </div>
                          <div className="col-span-1 space-y-1">
                            <label className="text-[9px] font-mono text-gray-600 uppercase text-center block">Qty</label>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateManualItem(idx, 'quantity', parseInt(e.target.value) || 0)}
                              className="w-full bg-black border border-white/5 rounded-xl px-2 py-2.5 text-white font-mono text-xs text-center focus:outline-none"
                            />
                          </div>
                          <div className="col-span-2 space-y-1">
                            <label className="text-[9px] font-mono text-gray-600 uppercase text-right block mr-2">Price</label>
                            <input
                              type="number"
                              value={item.price}
                              onChange={(e) => updateManualItem(idx, 'price', parseFloat(e.target.value) || 0)}
                              className="w-full bg-black border border-white/5 rounded-xl px-4 py-2.5 text-white font-mono text-xs text-right focus:outline-none"
                            />
                          </div>
                          <div className="col-span-1 flex justify-center pb-2">
                            <button
                              onClick={() => removeManualItem(idx)}
                              className="p-2 text-gray-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-10">
                  <div className="flex-1 space-y-4 max-w-md w-full">
                    <h3 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest flex items-center">
                      <CreditCard className="mr-2 h-3 w-3 text-gaming-accent" /> Payment_Method
                    </h3>
                    <input
                      type="text"
                      value={manualInvoice.paymentMethod}
                      onChange={(e) => setManualInvoice(prev => ({ ...prev, paymentMethod: e.target.value }))}
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-xs focus:outline-none focus:border-gaming-accent"
                    />
                  </div>

                  <div className="w-full max-w-xs space-y-4 bg-white/[0.02] p-8 rounded-3xl border border-white/10">
                    <div className="flex justify-between items-center text-[10px] font-mono text-gray-500">
                      <span>BASE_SUBTOTAL</span>
                      <span className="text-white">{formatCurrency(manualInvoice.subtotal)}</span>
                    </div>
                    <div className="flex justify-between items-center gap-4 text-[10px] font-mono text-gray-500">
                      <span>TAX_OVERHEAD</span>
                      <input
                        type="number"
                        value={manualInvoice.tax}
                        onChange={(e) => setManualInvoice(prev => ({ ...prev, tax: parseFloat(e.target.value) || 0 }))}
                        className="w-24 bg-black border border-white/10 rounded-lg px-3 py-1.5 text-white text-right focus:outline-none focus:border-gaming-accent"
                      />
                    </div>
                    <div className="h-px bg-white/10 my-4"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono text-gray-400 italic font-black uppercase">Final_Valuation</span>
                      <span className="text-2xl font-black text-gaming-accent tracking-tighter">{formatCurrency(manualInvoice.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-white/[0.02] border-t border-white/10 flex justify-end gap-4">
                <button
                  disabled={isSaving}
                  onClick={() => setShowManualForm(false)}
                  className="px-8 py-3 bg-white/5 text-gray-400 rounded-xl font-mono text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5"
                >
                  Abort
                </button>
                <button
                  disabled={isSaving}
                  onClick={handleSaveManualInvoice}
                  className="px-10 py-3 bg-gaming-accent text-black rounded-xl font-black font-mono text-[10px] uppercase tracking-widest hover:bg-[#9333EA] transition-all flex items-center gap-2"
                >
                  {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Persist & Generate
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Invoice Preview Modal */}
      <AnimatePresence>
        {previewData && (
          <InvoiceModal 
            data={previewData} 
            onClose={() => setPreviewData(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
