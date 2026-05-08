import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldCheck, Zap, ArrowLeft, Globe, Cpu, Lock } from 'lucide-react';
import Logo from '../components/Logo';

export default function ComingSoon() {
  return (
    <div className="min-h-dvh bg-[#080112] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Animated Matrix Grid Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div 
          className="absolute inset-0" 
          style={{ 
            backgroundImage: 'linear-gradient(#D866FF 1px, transparent 1px), linear-gradient(90deg, #D866FF 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} 
        />
      </div>

      {/* Orbital Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gaming-accent/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-[#4D008C]/10 blur-[100px] rounded-full pointer-events-none animate-pulse" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-center max-w-2xl space-y-12"
      >
        {/* Header Branding */}
        <div className="flex flex-col items-center gap-6">
          <Logo size={80} showText={false} />
          <div className="space-y-2">
            <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter uppercase leading-none">
              UNDER <span className="text-gaming-accent drop-shadow-[0_0_15px_var(--color-gaming-accent)]">CONSTRUCTION</span>
            </h1>
            <p className="text-[10px] font-mono text-gaming-accent uppercase tracking-[0.5em] animate-pulse">
              Sector_Access_Restricted // Terminal_404
            </p>
          </div>
        </div>

        {/* Feature Teasers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Globe, label: 'Global_Sync', status: 'INIT' },
            { icon: Cpu, label: 'Neural_Nodes', status: 'CALIBRATING' },
            { icon: Lock, label: 'Vault_Security', status: 'ENCRYPTING' }
          ].map((item, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex flex-col items-center gap-3">
              <item.icon size={20} className="text-gray-500" />
              <div className="text-center">
                <p className="text-[8px] font-mono text-gray-600 uppercase tracking-widest">{item.label}</p>
                <p className="text-[9px] font-black text-white uppercase tracking-tighter mt-0.5">{item.status}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Deployment Info */}
        <div className="space-y-6">
          <div className="bg-white/[0.03] border border-white/10 p-8 rounded-[2rem] backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gaming-accent to-transparent" />
            <h2 className="text-xl font-bold text-white uppercase tracking-widest mb-4">ESTIMATED DEPLOYMENT</h2>
            <div className="text-4xl font-black text-gaming-accent italic tracking-tighter mb-2">Q3 2026</div>
            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-[0.2em]">Our engineers are finalizing the protocol layers.</p>
          </div>

          <Link to="/" className="inline-flex items-center gap-2 text-[10px] font-black text-gray-400 hover:text-white uppercase tracking-[0.3em] transition-all group">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Abort & Return to Surface
          </Link>
        </div>
      </motion.div>

      {/* Background Tech Details */}
      <div className="fixed bottom-8 left-8 hidden md:block opacity-20 pointer-events-none">
        <p className="text-[8px] font-mono text-gray-500 uppercase tracking-widest space-y-1">
          System_Uptime: 99.99%<br/>
          Latency: 14ms<br/>
          Node_Status: SECURE
        </p>
      </div>
    </div>
  );
}
