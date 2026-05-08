import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Upload, DollarSign, ArrowRight, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { EditableText } from '../components/Editable';

interface SellFormData {
  productName: string;
  category: string;
  condition: string;
  description: string;
  expectedPrice: number;
}

export default function Sell() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<SellFormData>();

  const onSubmit = async (data: SellFormData) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('consolezone_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/sell-requests`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to submit sell request');
      }

      setSubmitted(true);
    } catch (err: any) {
      console.error("Sell Submit Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/[0.02] backdrop-blur-xl border border-white/10 p-12 rounded-[2rem] shadow-2xl"
        >
          <div className="w-20 h-20 bg-gaming-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-gaming-accent" />
          </div>
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">Request Logged!</h2>
          <p className="text-gray-400 font-mono text-xs uppercase tracking-widest mb-8 leading-relaxed">
            Our procurement team will evaluate your hardware and contact you within 24 standard cycles with an offer.
          </p>
          <a href="/dashboard" className="inline-block py-4 px-8 bg-white text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-gray-200 transition-all">Go to Dashboard</a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-24 min-h-dvh relative flex flex-col justify-center" style={{ maxWidth: 'var(--layout-max-width, 768px)' }}>
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-1/2 bg-gaming-accent/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="text-center mb-16 relative z-10">
        <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter uppercase mb-4 drop-shadow-[0_0_15px_rgba(216, 102, 255,0.4)]">
          <EditableText pageKey="sell" itemKey="title" defaultText="SELL YOUR GEAR" />
        </h1>
        <p className="text-gray-400 font-mono text-sm uppercase tracking-widest">
          <EditableText pageKey="sell" itemKey="subtitle" defaultText="Turn your old consoles and games into cash. Fill out the form below to get started." />
        </p>
        <div className="h-1 w-20 bg-gradient-to-r from-transparent via-gaming-accent to-transparent mx-auto rounded-full mt-6" />
      </div>

      <div className="relative group z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-gaming-accent/20 to-[#4D008C]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[2rem] blur-xl" />
        
        <form onSubmit={handleSubmit(onSubmit)} className="relative bg-white/[0.02] backdrop-blur-xl border border-white/10 p-8 md:p-12 space-y-8 shadow-2xl transition-all duration-500 hover:border-gaming-accent/50" style={{ borderRadius: 'var(--layout-border-radius, 2rem)' }}>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Product Name</label>
            <input
              type="text"
              {...register('productName')}
              placeholder="e.g. PlayStation 4 Pro 1TB"
              className="w-full bg-[#080112]/50 border border-white/10 rounded-xl py-4 px-4 text-sm font-bold text-white focus:border-gaming-accent focus:ring-1 focus:ring-gaming-accent outline-none transition-all shadow-inner"
            />
            {errors.productName && <p className="text-red-500 text-[10px] font-mono uppercase tracking-widest mt-1">{errors.productName.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Category</label>
              <select
                {...register('category')}
                className="w-full bg-[#080112]/50 border border-white/10 rounded-xl py-4 px-4 text-sm font-bold text-white focus:border-gaming-accent focus:ring-1 focus:ring-gaming-accent outline-none transition-all appearance-none shadow-inner"
              >
                <option value="" className="bg-[#080112]">Select Category</option>
                <option value="console" className="bg-[#080112]">Console</option>
                <option value="controller" className="bg-[#080112]">Controller</option>
                <option value="game" className="bg-[#080112]">Game</option>
                <option value="accessory" className="bg-[#080112]">Accessory</option>
              </select>
              {errors.category && <p className="text-red-500 text-[10px] font-mono uppercase tracking-widest mt-1">{errors.category.message}</p>}
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Condition</label>
              <select
                {...register('condition')}
                className="w-full bg-[#080112]/50 border border-white/10 rounded-xl py-4 px-4 text-sm font-bold text-white focus:border-gaming-accent focus:ring-1 focus:ring-gaming-accent outline-none transition-all appearance-none shadow-inner"
              >
                <option value="" className="bg-[#080112]">Select Condition</option>
                <option value="new" className="bg-[#080112]">Like New (Box Open)</option>
                <option value="good" className="bg-[#080112]">Good (Minor Scratches)</option>
                <option value="fair" className="bg-[#080112]">Fair (Visible Wear)</option>
                <option value="broken" className="bg-[#080112]">Broken / For Parts</option>
              </select>
              {errors.condition && <p className="text-red-500 text-[10px] font-mono uppercase tracking-widest mt-1">{errors.condition.message}</p>}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Description</label>
            <textarea
              {...register('description')}
              rows={4}
              placeholder="Describe any defects, included accessories, or history..."
              className="w-full bg-[#080112]/50 border border-white/10 rounded-xl py-4 px-4 text-sm text-gray-300 focus:border-gaming-accent focus:ring-1 focus:ring-gaming-accent outline-none transition-all shadow-inner resize-none"
            ></textarea>
            {errors.description && <p className="text-red-500 text-[10px] font-mono uppercase tracking-widest mt-1">{errors.description.message}</p>}
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Expected Price (₹)</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gaming-accent" />
              <input
                type="number"
                {...register('expectedPrice', { valueAsNumber: true })}
                placeholder="0.00"
                className="w-full bg-[#080112]/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-xl font-black italic tracking-tighter text-white focus:border-gaming-accent focus:ring-1 focus:ring-gaming-accent outline-none transition-all shadow-inner"
              />
            </div>
            {errors.expectedPrice && <p className="text-red-500 text-[10px] font-mono uppercase tracking-widest mt-1">{errors.expectedPrice.message}</p>}
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Upload Images</label>
            <div className="border-2 border-dashed border-white/10 rounded-xl p-10 text-center hover:border-gaming-accent hover:bg-gaming-accent/5 transition-all cursor-pointer bg-[#080112]/50 group">
              <Upload className="h-10 w-10 text-gray-600 group-hover:text-gaming-accent group-hover:scale-110 transition-all mx-auto mb-4" />
              <p className="text-sm font-bold text-white uppercase tracking-widest">Click to upload or drag and drop</p>
              <p className="text-[10px] font-mono text-gray-500 mt-2 uppercase tracking-widest">JPG, PNG up to 5MB</p>
            </div>
          </div>

          <div className="pt-4 space-y-4">
            {error && <p className="text-red-500 text-[10px] font-mono uppercase tracking-widest text-center">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-gaming-accent text-black font-black text-sm uppercase tracking-widest rounded-xl hover:shadow-[0_0_30px_rgba(216, 102, 255,0.4)] transition-all flex items-center justify-center gap-2 group/btn disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Listing'}
              {!loading && <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
