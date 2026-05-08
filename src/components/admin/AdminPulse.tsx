import { useState, useEffect } from 'react';
import { 
  Zap, 
  Activity, 
  ShoppingBag, 
  ShieldCheck, 
  Calendar, 
  AlertTriangle,
  Clock,
  Terminal,
  Cpu,
  RefreshCw,
  X,
  Bell
} from 'lucide-react';
import { notificationService, AppNotification } from '../../services/notificationService';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';

export default function AdminPulse() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const unsub = notificationService.subscribe('admin', (data) => {
      setNotifications(data);
    });
    return () => unsub();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'order': return <ShoppingBag size={14} className="text-emerald-500" />;
      case 'rental': return <Calendar size={14} className="text-blue-500" />;
      case 'security': return <ShieldCheck size={14} className="text-red-500" />;
      case 'kyc': return <Activity size={14} className="text-amber-500" />;
      default: return <Zap size={14} className="text-gaming-accent" />;
    }
  };

  return (
    <>
      {/* Pulse Toggle Button (Desktop) */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed right-6 bottom-6 z-50 p-4 bg-gaming-accent text-black rounded-full shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:scale-110 transition-all group"
        >
          <Bell size={24} className="group-hover:rotate-12 transition-transform" />
          {notifications.filter(n => !n.read).length > 0 && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-black">
              {notifications.filter(n => !n.read).length}
            </span>
          )}
        </button>
      )}

      <aside className={cn(
        "fixed right-0 top-0 h-full bg-gaming-card border-l border-gaming-border z-40 transition-all duration-500 flex flex-col",
        isOpen ? "w-80 translate-x-0" : "w-80 translate-x-full"
      )}>
        {/* Header */}
        <div className="p-6 border-b border-gaming-border flex items-center justify-between shrink-0 bg-black/20">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Activity className="h-5 w-5 text-gaming-accent animate-pulse" />
              <div className="absolute inset-0 bg-gaming-accent/20 blur-lg animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase italic tracking-tighter">Operations <span className="text-gaming-accent">Pulse</span></h2>
              <p className="text-[8px] font-mono text-gaming-muted uppercase tracking-[0.2em]">Real-Time_System_Sync</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 text-gaming-muted hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Live Feed */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4 scrollbar-hide">
          <AnimatePresence mode="popLayout">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={cn(
                    "p-4 rounded-xl border transition-all relative group",
                    n.read ? "bg-white/[0.01] border-white/5 opacity-60" : "bg-white/[0.03] border-white/10 hover:border-gaming-accent/30"
                  )}
                >
                  <div className="flex gap-3">
                    <div className="mt-1 p-2 bg-black/40 rounded-lg border border-white/5 shrink-0">
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-[10px] font-black text-white uppercase truncate tracking-tighter">
                          {n.title}
                        </h4>
                        <span className="text-[8px] font-mono text-gaming-muted whitespace-nowrap">
                          {n.timestamp?.toDate ? format(n.timestamp.toDate(), 'HH:mm') : 'NOW'}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 leading-tight line-clamp-2 uppercase font-mono">
                        {n.message}
                      </p>
                    </div>
                  </div>
                  {!n.read && (
                    <button 
                      onClick={() => notificationService.markAsRead(n.id!)}
                      className="absolute top-2 right-2 p-1 bg-gaming-accent/10 text-gaming-accent rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <RefreshCw size={10} />
                    </button>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="py-20 text-center space-y-4">
                <Cpu size={32} className="text-gaming-muted mx-auto opacity-20" />
                <p className="text-[9px] font-mono text-gaming-muted uppercase tracking-widest leading-relaxed">
                  Awaiting_Inbound<br />Data_Packets...
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Hardware Info */}
        <div className="p-4 border-t border-gaming-border bg-black/40 space-y-3">
          <div className="flex justify-between text-[8px] font-mono text-gray-500 uppercase">
            <span>Bandwidth_Link</span>
            <span className="text-emerald-500">98.2 Gbps</span>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500/40 w-[92%]" />
          </div>
          <div className="flex items-center gap-2 text-[8px] font-mono text-gaming-muted">
            <Terminal size={10} />
            <span>Root_Daemon_v4.0.1</span>
          </div>
        </div>
      </aside>
    </>
  );
}
