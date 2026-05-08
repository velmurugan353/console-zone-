import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Star, ShieldCheck, Truck, RefreshCw, ChevronLeft, Check, Plus } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { useCart } from '../context/CartContext';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart, items: cartItems } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${API_URL}/api/products`);
        if (response.ok) {
          const data = await response.json().catch(() => []);
          const target = data.find((p: any) => (p._id || p.id) === id);
          if (target) {
            setProduct({ ...target, id: target._id || target.id });
          }
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080112] flex items-center justify-center">
        <RefreshCw className="h-12 w-12 text-gaming-accent animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#080112] flex items-center justify-center text-center p-4">
        <div className="space-y-6">
          <h1 className="text-4xl font-black text-white uppercase italic">Product Offline</h1>
          <p className="text-gray-500 font-mono">This asset has been decommissioned or moved in the matrix.</p>
          <Link to="/shop">
            <button className="px-8 py-3 bg-gaming-accent text-black font-black uppercase tracking-widest text-xs rounded-xl">Return to Armory</button>
          </Link>
        </div>
      </div>
    );
  }

  const inCart = cartItems.some(item => item.id === product.id);

  return (
    <div className="min-h-screen bg-[#080112] text-white pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <Link to="/shop" className="inline-flex items-center gap-2 text-gray-500 hover:text-gaming-accent mb-12 transition-colors group">
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-mono uppercase tracking-[0.2em]">Return to Armory</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Visuals */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative bg-black/40 border border-white/5 rounded-[3rem] p-12 flex items-center justify-center overflow-hidden"
          >
            <img src={product.image} alt={product.name} className="w-full max-w-md aspect-square object-contain relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-br from-gaming-accent/10 via-transparent to-transparent opacity-50" />
          </motion.div>

          {/* Intel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-10"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-gaming-accent/10 text-gaming-accent text-[9px] font-black uppercase tracking-widest rounded-full border border-gaming-accent/20">
                  {product.category}
                </span>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star size={12} fill="currentColor" />
                  <span className="text-xs font-bold font-mono">4.9</span>
                </div>
              </div>
              <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-tight">{product.name}</h1>
              <p className="text-gray-400 text-lg leading-relaxed max-w-xl">{product.description}</p>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col">
                <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mb-1">Acquisition Cost</p>
                <p className="text-5xl font-black text-gaming-accent italic tracking-tighter">{formatCurrency(product.price)}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                  <Truck size={18} className="text-gaming-accent" />
                  <p className="text-[10px] font-black uppercase text-white">Fast Logistics</p>
                  <p className="text-[9px] text-gray-500 font-mono uppercase">24-48 Hour Fulfillment</p>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                  <ShieldCheck size={18} className="text-gaming-accent" />
                  <p className="text-[10px] font-black uppercase text-white">Full Warranty</p>
                  <p className="text-[9px] text-gray-500 font-mono uppercase">Direct Matrix Support</p>
                </div>
              </div>

              <button
                onClick={() => addToCart({ ...product, quantity: 1, type: 'buy' })}
                disabled={inCart}
                className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-3 ${
                  inCart
                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                  : 'bg-gaming-accent text-black hover:bg-[#9333EA] hover:shadow-[0_0_40px_rgba(216, 102, 255,0.4)]'
                }`}
              >
                {inCart ? <><Check size={18} /> IN PAYLOAD</> : <><Plus size={18} /> ADD TO ARMORY</>}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
