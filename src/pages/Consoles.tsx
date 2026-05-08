import { motion } from 'framer-motion';
import { PRODUCTS } from '../lib/data';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../lib/utils';
import { CheckCircle2, XCircle, ShoppingBag, Calendar, ArrowRight, Zap } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Consoles() {
  const { addToCart } = useCart();
  const consoles = PRODUCTS.filter(p => p.category === 'console');
  const featuredConsole = consoles[0]; // PS5 Pro

  return (
    <div className="bg-[#080112] min-h-dvh pb-24">
      {/* Hero Section */}
      <section className="relative h-[] flex items-center overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#080112] via-[#080112]/60 to-transparent z-10" />
          <img 
            src={featuredConsole.image} 
            alt={featuredConsole.name}
            className="w-full h-full object-cover opacity-40 scale-110"
          />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gaming-accent/20 border border-gaming-accent/30 rounded-full">
              <Zap className="h-3 w-3 text-gaming-accent" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gaming-accent">Featured Console</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-white italic tracking-tighter uppercase leading-[0.85]">
              {featuredConsole.name}
            </h1>
            <p className="text-gray-400 text-lg font-mono uppercase tracking-widest max-w-lg">
              {featuredConsole.description}
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <button 
                onClick={() => addToCart({ ...featuredConsole, quantity: 1, type: 'buy' })}
                className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest rounded-none skew-x-[-15deg] hover:bg-gaming-accent hover:text-white transition-all flex items-center gap-2"
              >
                <span className="skew-x-[15deg]">Buy Now</span>
              </button>
              <Link to={`/product/${featuredConsole.id}`} className="px-8 py-4 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest rounded-none skew-x-[-15deg] hover:bg-white/10 transition-all flex items-center gap-2">
                <span className="skew-x-[15deg]">View Specs</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase">
              ALL CONSOLES
            </h2>
            <div className="h-1 w-20 bg-gaming-accent rounded-full" />
          </div>
          <div className="flex gap-4">
            <span className="text-gray-500 font-mono text-sm uppercase tracking-widest">Total Units: {consoles.length}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {consoles.map((console, index) => (
            <motion.div
              key={console.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative"
            >
              {/* Card Background & Border */}
              <div className="absolute inset-0 bg-gradient-to-br from-gaming-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[2.5rem] -m-1 blur-xl" />
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-[2.5rem] -m-1 group-hover:from-gaming-accent/30 transition-all duration-500" />
              
              <div className="relative bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-[2.5rem] overflow-hidden p-6 space-y-6 flex flex-col h-full group-hover:border-gaming-accent/50 transition-all duration-500 hover:-translate-y-2 shadow-2xl">
                {/* Image Container */}
                <div className="relative aspect-[4/3] w-full bg-[#0c021a] rounded-[2rem] overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <img 
                    src={console.image} 
                    alt={console.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4 z-20">
                    {console.inStock ? (
                      <div className="bg-black/60 backdrop-blur-md border border-green-500/30 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">In Stock</span>
                      </div>
                    ) : (
                      <div className="bg-black/60 backdrop-blur-md border border-red-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Sold Out</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-4 flex-grow relative z-10">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight group-hover:text-gaming-accent group-hover:drop-shadow-[0_0_8px_rgba(216, 102, 255,0.8)] transition-all duration-300 leading-none">
                      {console.name}
                    </h3>
                  </div>
                  <p className="text-gray-400 text-sm font-medium line-clamp-2 leading-relaxed">
                    {console.description}
                  </p>
                </div>

                {/* Pricing & Actions */}
                <div className="pt-6 border-t border-white/5 space-y-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Buy For</div>
                      <div className="text-3xl font-black text-white italic tracking-tighter drop-shadow-md">
                        {formatCurrency(console.price)}
                      </div>
                    </div>
                    {console.isRental && (
                      <div className="text-right">
                        <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Rent From</div>
                        <div className="text-2xl font-black text-gaming-accent italic tracking-tighter drop-shadow-[0_0_5px_rgba(216, 102, 255,0.4)]">
                          {formatCurrency(console.rentalPrice || 0)}<span className="text-xs text-gray-400 font-normal">/day</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => addToCart({ ...console, quantity: 1, type: 'buy' })}
                      disabled={!console.inStock}
                      className="flex items-center justify-center gap-2 py-4 bg-white text-black font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-gaming-accent hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(216, 102, 255,0.5)]"
                      aria-label={`Add ${console.name} to cart`}
                    >
                      <ShoppingBag size={16} />
                      <span className="hidden sm:inline">Add to Cart</span>
                    </button>
                    {console.isRental ? (
                      <Link 
                        to={`/product/${console.id}`}
                        className="flex items-center justify-center gap-2 py-4 bg-white/5 border border-white/10 text-white font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-white/10 transition-all"
                      >
                        <Calendar size={16} />
                        Rent
                      </Link>
                    ) : (
                      <Link 
                        to={`/product/${console.id}`}
                        className="flex items-center justify-center gap-2 py-4 bg-white/5 border border-white/10 text-white font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-white/10 transition-all"
                      >
                        Details
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}



