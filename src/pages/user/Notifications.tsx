import { useState, useEffect } from 'react';
import { 
  Bell, 
  ShoppingBag, 
  Gamepad2, 
  Info, 
  Shield, 
  Zap, 
  Trophy, 
  Terminal,
  Activity,
  Search,
  CheckCircle2,
  Trash2,
  AlertCircle,
  Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notificationService, AppNotification } from '../../services/notificationService';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user) return;
    const unsub = notificationService.subscribe(user.id, (data) => {
      setNotifications(data);
    });
    return () => unsub();
  }, [user]);

  const filtered = notifications.filter(n => {
    const matchesFilter = filter === 'all' || !n.read;
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) || 
                         n.message.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'order': return <ShoppingBag size={18} />;
      case 'rental': return <Gamepad2 size={18} />;
      case 'security': return <Shield size={18} />;
      case 'reward': return <Trophy size={18} />;
      case 'kyc': return <Activity size={18} />;
      default: return <Zap size={18} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'high': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      default: return 'text-gaming-accent bg-gaming-accent/10 border-gaming-accent/20';
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gaming-accent/10 rounded-lg">
              <Terminal className="h-5 w-5 text-gaming-accent" />
            </div>
            <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Signal <span className="text-gaming-accent">Comms</span></h1>
          </div>
          <p className="text-gaming-muted font-mono text-xs uppercase tracking-widest text-gaming-muted">Incoming_Data_Stream // Decryption_Active</p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-gaming-accent text-black shadow-[0_0_15px_rgba(0,240,255,0.3)]' : 'bg-white/5 text-gaming-muted hover:bg-white/10'}`}
          >
            All_Signals
          </button>
          <button 
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'unread' ? 'bg-gaming-accent text-black shadow-[0_0_15px_rgba(0,240,255,0.3)]' : 'bg-white/5 text-gaming-muted hover:bg-white/10'}`}
          >
            Unread_Only
          </button>
        </div>
      </div>

      {/* Search & Bulk Actions */}
      <div className="flex gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gaming-muted group-focus-within:text-gaming-accent transition-colors" />
          <input
            type="text"
            placeholder="FILTER_BY_KEYWORDS..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gaming-card border border-gaming-border rounded-xl py-3 pl-12 pr-4 text-xs font-mono text-white focus:border-gaming-accent outline-none transition-all uppercase"
          />
        </div>
      </div>

      {/* Notification Stream */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filtered.length > 0 ? (
            filtered.map((n) => (
              <motion.div
                key={n.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`group relative bg-gaming-card border transition-all duration-300 ${n.read ? 'border-gaming-border/50 opacity-60' : 'border-gaming-accent/30 bg-gaming-accent/[0.02]'}`}
                style={{ borderRadius: 'var(--layout-border-radius, 1rem)' }}
              >
                {!n.read && (
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-8 bg-gaming-accent rounded-full blur-sm animate-pulse" />
                )}
                
                <div className="p-6 flex gap-6">
                  <div className={`p-4 rounded-xl border h-fit transition-all ${getPriorityColor(n.priority)}`}>
                    {getIcon(n.type)}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className={`font-black uppercase tracking-tight italic ${n.read ? 'text-gaming-muted' : 'text-white text-lg'}`}>
                          {n.title}
                        </h3>
                        <div className="flex items-center gap-3 text-[9px] font-mono uppercase text-gaming-muted">
                          <span className="flex items-center gap-1"><Activity size={10} /> Type: {n.type}</span>
                          <span>//</span>
                          <span className="flex items-center gap-1"><Clock size={10} /> {n.timestamp?.toDate ? format(n.timestamp.toDate(), 'HH:mm:ss yyyy-MM-dd') : 'Synchronizing...'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!n.read && (
                          <button 
                            onClick={() => notificationService.markAsRead(n.id!)}
                            className="p-2 bg-gaming-accent/10 text-gaming-accent rounded-lg hover:bg-gaming-accent hover:text-black transition-all"
                            title="Acknowledge Signal"
                          >
                            <CheckCircle2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className={`text-sm leading-relaxed max-w-2xl ${n.read ? 'text-gray-600' : 'text-gray-400 font-medium'}`}>
                      {n.message}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-32 text-center space-y-6 bg-gaming-card border border-dashed border-gaming-border rounded-[2rem]"
            >
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                <Zap size={40} className="text-gaming-muted opacity-20" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Zero_Signals_Detected</h3>
                <p className="text-gaming-muted font-mono text-[10px] uppercase tracking-widest">Awaiting system transmission...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
