import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, BellRing, ClipboardList, Shield, Terminal } from 'lucide-react';
import { format } from 'date-fns';
import type { AdminActivityItem } from '../../hooks/useAdminOverview';

interface CommandMatrixProps {
  events: AdminActivityItem[];
  loading?: boolean;
  emptyLabel?: string;
}

const typeIconMap = {
  ORDER: ClipboardList,
  RENTAL: Terminal,
  KYC: Shield,
  SYSTEM: BellRing
} as const;

const severityStyles = {
  critical: 'border-red-500/30 bg-red-500/10 text-red-300',
  high: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  medium: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200',
  low: 'border-white/10 bg-white/[0.04] text-slate-300'
} as const;

const formatEventTime = (timestamp: Date | null) => (timestamp ? format(timestamp, 'HH:mm') : '--:--');

export default function CommandMatrix({
  events,
  loading = false,
  emptyLabel = 'No recent operational signals.'
}: CommandMatrixProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#09111d] shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
            <Terminal size={16} />
          </div>
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.24em] text-white">Live Activity Feed</h3>
            <p className="text-[10px] font-mono uppercase tracking-[0.16em] text-slate-500">Orders, rentals, KYC, and system alerts</p>
          </div>
        </div>
        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.24em] text-emerald-300">
          Live
        </span>
      </div>

      <div className="min-h-[20rem] bg-[radial-gradient(circle_at_top,rgba(0,212,255,0.08),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(9,17,29,0.92))] p-5">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="h-4 w-24 animate-pulse rounded-full bg-white/10" />
                  <div className="h-3 w-10 animate-pulse rounded-full bg-white/10" />
                </div>
                <div className="h-3 w-full animate-pulse rounded-full bg-white/10" />
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="flex h-full min-h-[16rem] flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-white/10 bg-black/20 px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-500">
              <BellRing size={20} />
            </div>
            <div className="space-y-2">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-white">Signal Queue Empty</p>
              <p className="text-sm text-slate-400">{emptyLabel}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {events.map((event) => {
                const EventIcon = typeIconMap[event.type];

                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="rounded-2xl border border-white/10 bg-black/30 p-4 transition-colors hover:border-cyan-400/20 hover:bg-black/40"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-300">
                          <EventIcon size={16} />
                        </div>
                        <div>
                          <div className="mb-1 flex items-center gap-2">
                            <span className={`rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.22em] ${severityStyles[event.severity]}`}>
                              {event.type}
                            </span>
                            {event.severity === 'critical' && <AlertCircle size={12} className="text-red-400" />}
                          </div>
                          <p className="text-[10px] font-mono uppercase tracking-[0.16em] text-slate-500">{formatEventTime(event.timestamp)}</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm leading-6 text-slate-200">{event.message}</p>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
