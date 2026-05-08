import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Save,
  X,
  Loader2,
  Image,
  Package,
  Tag,
  DollarSign,
  Shield,
  Box,
  Gamepad2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RentalProduct {
  id: string;
  name: string;
  slug: string;
  image: string;
  available: number;
  dailyRate: number;
  weeklyRate?: number;
  monthlyRate?: number;
  deposit: number;
  specs: string[];
  included: string[];
  condition: 'Excellent' | 'Good';
  enabled: boolean;
}

const defaultProduct: Partial<RentalProduct> = {
  name: '',
  slug: '',
  image: '',
  available: 0,
  dailyRate: 0,
  weeklyRate: 0,
  monthlyRate: 0,
  deposit: 0,
  specs: [],
  included: [],
  condition: 'Excellent',
  enabled: true
};

export default function RentalProductManagement() {
  const [products, setProducts] = useState<RentalProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editProduct, setEditProduct] = useState<Partial<RentalProduct>>(defaultProduct);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [specsInput, setSpecsInput] = useState('');
  const [includedInput, setIncludedInput] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('consolezone_token');
      const response = await fetch('/api/rentals', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json().catch(() => []);
        // Catalog products are those without a userId
        const catalogProducts = data.filter((r: any) => !r.userId).map((r: any) => ({
          ...r,
          id: r._id || r.id
        }));
        setProducts(catalogProducts);
      }
    } catch (error) {
      console.error("Failed to load rental products:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  const handleOpenModal = (product?: RentalProduct) => {
    if (product) {
      setEditProduct({ ...product });
      setSpecsInput(product.specs.join('\n'));
      setIncludedInput(product.included.join('\n'));
      setIsEditing(true);
    } else {
      setEditProduct({
        ...defaultProduct
      });
      setSpecsInput('');
      setIncludedInput('');
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditProduct(defaultProduct);
    setSpecsInput('');
    setIncludedInput('');
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    
    const productData = {
      name: editProduct.name || '',
      slug: editProduct.slug || generateSlug(editProduct.name || ''),
      image: editProduct.image || 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&q=80&w=2000',
      available: editProduct.available || 0,
      dailyRate: editProduct.dailyRate || 0,
      weeklyRate: editProduct.weeklyRate || 0,
      monthlyRate: editProduct.monthlyRate || 0,
      deposit: editProduct.deposit || 0,
      specs: specsInput.split('\n').filter(s => s.trim()),
      included: includedInput.split('\n').filter(i => i.trim()),
      condition: editProduct.condition || 'Excellent',
      enabled: editProduct.enabled ?? true
    };

    try {
      const url = isEditing ? `/api/rentals/${editProduct.id}` : '/api/rentals/catalog';
      const method = isEditing ? 'PATCH' : 'POST';
      
      const token = localStorage.getItem('consolezone_token');
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });

      if (response.ok) {
        await loadProducts();
        handleCloseModal();
      } else {
        const err = await response.json().catch(() => ({}));
        alert(`Error: ${err.error || 'Save failed'}`);
      }
    } catch (error) {
      console.error('Save failed:', error);
      alert('Save failed. Check console.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this rental product from the database?')) {
      try {
        const token = localStorage.getItem('consolezone_token');
        const response = await fetch(`/api/rentals/${id}`, { 
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          setProducts(prev => prev.filter(p => p.id !== id));
        }
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const handleToggleEnabled = async (product: RentalProduct) => {
    try {
      const token = localStorage.getItem('consolezone_token');
      const response = await fetch(`/api/rentals/${product.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ enabled: !product.enabled })
      });
      if (response.ok) {
        setProducts(prev => prev.map(p => p.id === product.id ? { ...p, enabled: !product.enabled } : p));
      }
    } catch (error) {
      console.error('Toggle status failed:', error);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.slug.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-gaming-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-8">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Gamepad2 className="h-3 w-3 text-gaming-accent animate-pulse" />
            <span className="text-[10px] font-mono text-gaming-accent uppercase tracking-[0.2em]">Rental Catalog // Matrix Control</span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tighter uppercase italic">Rental <span className="text-gaming-accent">Products</span></h1>
          <p className="text-gray-500 font-mono text-xs mt-1">Manage console rental catalog, pricing, and availability.</p>
        </div>
        
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 px-4 py-2 bg-gaming-accent text-black rounded-xl text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-[#9333EA] transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)]"
        >
          <Plus size={14} />
          <span>Add Product</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search rental products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 pr-4 py-3 bg-[#080112] border border-white/10 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-gaming-accent w-full md:w-96"
        />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`bg-[#080112] border rounded-2xl overflow-hidden transition-all ${product.enabled ? 'border-white/10 hover:border-gaming-accent/50' : 'border-white/5 opacity-60'}`}
          >
            <div className="relative h-40 overflow-hidden">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080112] to-transparent" />
              <div className="absolute top-3 right-3 flex gap-2">
                <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest ${product.enabled ? 'bg-emerald-500 text-black' : 'bg-gray-600 text-white'}`}>
                  {product.enabled ? 'Active' : 'Disabled'}
                </span>
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white uppercase italic tracking-tight">{product.name}</h3>
                <p className="text-[10px] font-mono text-gray-500">/{product.slug}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-lg p-2">
                  <div className="flex items-center gap-1 text-[8px] text-gray-500 uppercase font-bold mb-1">
                    <DollarSign size={10} /> Daily Rate
                  </div>
                  <p className="text-sm font-black text-emerald-400">₹{product.dailyRate}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-2">
                  <div className="flex items-center gap-1 text-[8px] text-gray-500 uppercase font-bold mb-1">
                    <Shield size={10} /> Deposit
                  </div>
                  <p className="text-sm font-black text-amber-400">₹{product.deposit}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono">
                <div className="flex items-center gap-1">
                  <Box size={12} className="text-gaming-accent" />
                  <span className="text-gray-400">Stock:</span>
                  <span className="text-white font-bold">{product.available}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Tag size={12} className="text-gaming-accent" />
                  <span className="text-gray-400">Condition:</span>
                  <span className="text-white font-bold">{product.condition}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-white/5">
                <button
                  onClick={() => handleToggleEnabled(product)}
                  className={`flex-1 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${product.enabled ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'}`}
                >
                  {product.enabled ? 'Disable' : 'Enable'}
                </button>
                <button
                  onClick={() => handleOpenModal(product)}
                  className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="p-2 bg-red-500/10 rounded-lg text-red-500 hover:bg-red-500/20 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5 border-dashed">
          <Package className="mx-auto h-12 w-12 text-gray-700 mb-4" />
          <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">No rental products found</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-[#080112] border border-white/10 rounded-3xl p-6 max-w-2xl w-full my-8 space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-white italic uppercase">
                  {isEditing ? 'Edit' : 'Add'} <span className="text-gaming-accent">Rental Product</span>
                </h2>
                <button onClick={handleCloseModal} className="p-2 text-gray-500 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase font-bold mb-2 block">Product Name *</label>
                    <input
                      type="text"
                      value={editProduct.name || ''}
                      onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                      className="w-full bg-black border border-white/10 rounded-xl p-3 text-white outline-none focus:border-gaming-accent"
                      placeholder="e.g. PlayStation 5 Pro"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase font-bold mb-2 block">Slug</label>
                    <input
                      type="text"
                      value={editProduct.slug || ''}
                      onChange={(e) => setEditProduct({ ...editProduct, slug: e.target.value })}
                      className="w-full bg-black border border-white/10 rounded-xl p-3 text-white outline-none focus:border-gaming-accent"
                      placeholder="ps5-pro"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold mb-2 block">Image URL</label>
                  <input
                    type="text"
                    value={editProduct.image || ''}
                    onChange={(e) => setEditProduct({ ...editProduct, image: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl p-3 text-white outline-none focus:border-gaming-accent"
                    placeholder="https://..."
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase font-bold mb-2 block">Daily Rate</label>
                    <input
                      type="number"
                      value={editProduct.dailyRate || 0}
                      onChange={(e) => setEditProduct({ ...editProduct, dailyRate: Number(e.target.value) })}
                      className="w-full bg-black border border-white/10 rounded-xl p-3 text-white outline-none focus:border-gaming-accent"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase font-bold mb-2 block">Weekly Rate</label>
                    <input
                      type="number"
                      value={editProduct.weeklyRate || 0}
                      onChange={(e) => setEditProduct({ ...editProduct, weeklyRate: Number(e.target.value) })}
                      className="w-full bg-black border border-white/10 rounded-xl p-3 text-white outline-none focus:border-gaming-accent"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase font-bold mb-2 block">Monthly Rate</label>
                    <input
                      type="number"
                      value={editProduct.monthlyRate || 0}
                      onChange={(e) => setEditProduct({ ...editProduct, monthlyRate: Number(e.target.value) })}
                      className="w-full bg-black border border-white/10 rounded-xl p-3 text-white outline-none focus:border-gaming-accent"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase font-bold mb-2 block">Deposit</label>
                    <input
                      type="number"
                      value={editProduct.deposit || 0}
                      onChange={(e) => setEditProduct({ ...editProduct, deposit: Number(e.target.value) })}
                      className="w-full bg-black border border-white/10 rounded-xl p-3 text-white outline-none focus:border-gaming-accent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase font-bold mb-2 block">Available Stock</label>
                    <input
                      type="number"
                      value={editProduct.available || 0}
                      onChange={(e) => setEditProduct({ ...editProduct, available: Number(e.target.value) })}
                      className="w-full bg-black border border-white/10 rounded-xl p-3 text-white outline-none focus:border-gaming-accent"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase font-bold mb-2 block">Condition</label>
                    <select
                      value={editProduct.condition || 'Excellent'}
                      onChange={(e) => setEditProduct({ ...editProduct, condition: e.target.value as 'Excellent' | 'Good' })}
                      className="w-full bg-black border border-white/10 rounded-xl p-3 text-white outline-none focus:border-gaming-accent"
                    >
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold mb-2 block">Specifications (one per line)</label>
                  <textarea
                    rows={3}
                    value={specsInput}
                    onChange={(e) => setSpecsInput(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl p-3 text-white outline-none focus:border-gaming-accent resize-none"
                    placeholder="4K Gaming&#10;1TB SSD&#10;Ray Tracing"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold mb-2 block">Included Items (one per line)</label>
                  <textarea
                    rows={3}
                    value={includedInput}
                    onChange={(e) => setIncludedInput(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl p-3 text-white outline-none focus:border-gaming-accent resize-none"
                    placeholder="Console&#10;Controller&#10;HDMI Cable"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-3 text-gray-500 font-bold uppercase tracking-widest text-xs border border-white/10 rounded-xl hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSubmitting || !editProduct.name}
                  className="flex-1 py-3 bg-gaming-accent text-black font-black uppercase tracking-widest text-xs rounded-xl shadow-[0_0_20px_rgba(216, 102, 255,0.4)] flex items-center justify-center gap-2 hover:bg-[#9333EA] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {isEditing ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
