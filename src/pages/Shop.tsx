import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, Search, ShoppingBag, Plus, Check } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function Shop() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const { addToCart, items: cartItems } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/api/products`);
        if (response.ok) {
          const data = await response.json().catch(() => []);
          setProducts(data.map((p: any) => ({ ...p, id: p._id || p.id })));
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || product.category === category;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(products.map(p => p.category))];

  return (
    <div className="max-w-7xl mx-auto px-4 py-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-12 border-b border-white/10 pb-10">
        <div>
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-1.5 bg-gaming-accent/20 rounded-md">
              <ShoppingBag className="h-4 w-4 text-gaming-accent" />
            </div>
            <span className="text-[10px] font-mono text-gaming-accent uppercase tracking-[0.3em] font-bold">Hardware Armory // Direct Sales</span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">The <span className="text-gaming-accent">Armory</span></h1>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-gaming-accent transition-colors" />
            <input
              type="text"
              placeholder="Search gear..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-64 pl-12 pr-4 py-3 bg-[#080112] border border-white/10 rounded-2xl text-white font-mono text-xs focus:outline-none focus:border-gaming-accent/50 transition-all"
            />
          </div>
          <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  category === cat ? 'bg-gaming-accent text-white shadow-[0_0_15px_rgba(216, 102, 255,0.3)]' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gaming-accent"></div>
          <p className="text-[10px] font-mono text-gaming-accent uppercase tracking-[0.4em] animate-pulse">Synchronizing Inventory...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product) => {
            const inCart = cartItems.some(item => item.id === product.id);
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={product.id}
                className="bg-[#080112] border border-white/5 rounded-3xl overflow-hidden group hover:border-gaming-accent/30 transition-all shadow-xl"
              >
                <Link to={`/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-black/40 p-8">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>

                <div className="p-6 space-y-4">
                  <div className="space-y-1">
                    <p className="text-[9px] font-mono text-gaming-accent uppercase tracking-widest font-black">{product.category}</p>
                    <h3 className="text-xl font-bold text-white uppercase tracking-tight italic line-clamp-1">{product.name}</h3>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex flex-col">
                      <p className="text-[8px] font-mono text-gray-600 uppercase tracking-widest">Base Valuation</p>
                      <p className="text-2xl font-black text-white italic tracking-tighter">{formatCurrency(product.price)}</p>
                    </div>
                    <button
                      onClick={() => addToCart({ ...product, quantity: 1, type: 'buy' })}
                      disabled={inCart}
                      className={`p-4 rounded-2xl transition-all ${
                        inCart 
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                        : 'bg-white/5 text-white hover:bg-gaming-accent hover:text-black border border-white/10 hover:border-gaming-accent shadow-lg'
                      }`}
                      aria-label={inCart ? `${product.name} in cart` : `Add ${product.name} to cart`}
                    >
                      {inCart ? <Check size={20} /> : <Plus size={20} />}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {!loading && filteredProducts.length === 0 && (
        <div className="text-center py-20 bg-white/[0.02] border border-dashed border-white/10 rounded-[3rem]">
          <ShoppingBag className="h-12 w-12 text-gray-800 mx-auto mb-4" />
          <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">No matching gear detected in matrix</p>
        </div>
      )}
    </div>
  );
}
