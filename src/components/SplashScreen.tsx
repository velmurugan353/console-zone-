import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';

export default function SplashScreen() {
  const [isVisible, setIsOpen] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setIsOpen(false), 500);
          return 100;
        }
        return prev + 5;
      });
    }, 100);

    return () => clearInterval(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-[#080112] flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Animated Grid Background */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div 
              className="absolute inset-0" 
              style={{ 
                backgroundImage: 'linear-gradient(#D866FF 1px, transparent 1px), linear-gradient(90deg, #D866FF 1px, transparent 1px)',
                backgroundSize: '40px 40px'
              }} 
            />
          </div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative"
          >
            <Logo size={120} showText={false} />
            
            {/* Orbital Rings */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-10 border-2 border-dashed border-[#4D008C]/30 rounded-full"
            />
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-20 border border-dotted border-gaming-accent/20 rounded-full"
            />
          </motion.div>

          <div className="mt-20 w-64 space-y-4">
            <div className="flex justify-between items-end">
              <p className="text-[10px] font-mono text-gaming-accent uppercase tracking-[0.4em] animate-pulse">Initializing_Node</p>
              <p className="text-xs font-black text-white font-mono">{progress}%</p>
            </div>
            
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
              <motion.div 
                className="h-full bg-gaming-accent"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                style={{ boxShadow: '0 0 15px #D866FF' }}
              />
            </div>
            
            <p className="text-center text-[8px] font-mono text-gray-600 uppercase tracking-widest leading-relaxed">
              Establishing Secure Uplink...<br/>
              Neural_Matrix_Sync: PASS
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
