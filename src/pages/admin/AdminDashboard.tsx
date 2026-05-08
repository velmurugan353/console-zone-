import {
  Activity,
  AlertCircle,
  ArrowRight,
  BellRing,
  Box,
  CalendarClock,
  ClipboardList,
  ShieldCheck,
  Sparkles,
  Wallet
} from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Area, AreaChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import CommandMatrix from '../../components/admin/CommandMatrix';
import {
  type AdminPriorityItem,
  type AdminInventoryBreakdownItem,
  useAdminOverview
} from '../../hooks/useAdminOverview';
import { formatCurrency } from '../../lib/utils';

type StatTone = 'cyan' | 'emerald' | 'amber' | 'red';

const toneStyles: Record<StatTone, string> = {
  cyan: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-300',
  emerald: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
  amber: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
  red: 'border-red-500/20 bg-red-500/10 text-red-300'
};

const priorityBadgeStyles = {
  critical: 'border-red-500/20 bg-red-500/10 text-red-300',
  high: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
  medium: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-300',
  low: 'border-white/10 bg-white/[0.04] text-slate-300'
} as const;

const formatPanelTimestamp = (value: Date | null) => (value ? format(value, 'MMM d, HH:mm') : 'No timestamp');

const StatCard = ({
  label,
  value,
  helper,
  tone,
  loading,
  icon: Icon
}: {
  label: string;
  value: string;
  helper: string;
  tone: StatTone;
  loading: boolean;
  icon: typeof Wallet;
}) => (
  <div className="rounded-3xl border border-white/10 bg-[#0b1320] p-5 shadow-[0_16px_50px_rgba(0,0,0,0.25)]">
    <div className="mb-5 flex items-start justify-between gap-3">
      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${toneStyles[tone]}`}>
        <Icon size={18} />
      </div>
      <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">
        Live
      </span>
    </div>
    <p className="mb-2 text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">{label}</p>
    {loading ? (
      <div className="space-y-3">
        <div className="h-8 w-2/3 animate-pulse rounded-2xl bg-white/10" />
        <div className="h-3 w-1/2 animate-pulse rounded-full bg-white/10" />
      </div>
    ) : (
      <>
        <p className="text-2xl font-black tracking-tight text-white">{value}</p>
        <p className="mt-2 text-sm text-slate-400">{helper}</p>
      </>
    )}
  </div>
);

const PanelShell = ({
  title,
  subtitle,
  children,
  action
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  action?: ReactNode;
}) => (
  <section className="rounded-3xl border border-white/10 bg-[#0b1320] shadow-[0_16px_50px_rgba(0,0,0,0.25)]">
    <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="text-[11px] font-black uppercase tracking-[0.24em] text-white">{title}</h2>
        <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
      </div>
      {action}
    </div>
    <div className="p-5">{children}</div>
  </section>
);

const PriorityQueueList = ({ items, loading }: { items: AdminPriorityItem[]; loading: boolean }) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="mb-3 h-4 w-32 animate-pulse rounded-full bg-white/10" />
            <div className="h-3 w-full animate-pulse rounded-full bg-white/10" />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[16rem] flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-white/10 bg-black/20 px-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-500">
          <Sparkles size={20} />
        </div>
        <div className="space-y-2">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-white">Queue Clear</p>
          <p className="text-sm text-slate-400">No priority items need attention right now.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <Link
          key={item.id}
          to={item.actionPath}
          className="block rounded-2xl border border-white/10 bg-black/25 p-4 transition-all hover:border-cyan-400/20 hover:bg-black/35"
        >
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <span className={`rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.22em] ${priorityBadgeStyles[item.severity]}`}>
              {item.kind}
            </span>
            <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-slate-500">
              {formatPanelTimestamp(item.timestamp)}
            </span>
          </div>
          <p className="text-sm font-bold text-white">{item.title}</p>
          <p className="mt-1 text-sm text-slate-400">{item.subtitle}</p>
        </Link>
      ))}
    </div>
  );
};

const FleetBreakdown = ({
  items,
  loading
}: {
  items: AdminInventoryBreakdownItem[];
  loading: boolean;
}) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <div className="h-3 w-20 animate-pulse rounded-full bg-white/10" />
            <div className="h-3 w-12 animate-pulse rounded-full bg-white/10" />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return <p className="text-sm text-slate-400">Inventory status data has not been populated yet.</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.name} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-sm text-slate-300">{item.name}</span>
          </div>
          <span className="text-sm font-black text-white">{item.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function AdminDashboard() {
  const {
    loading,
    error,
    lastUpdated,
    metrics,
    revenueTrend,
    inventoryDistribution,
    priorityQueue,
    activityFeed
  } = useAdminOverview();

  const quickActions = [
    { label: 'Manage Rentals', description: 'Active rental sessions and fleet tracking', path: '/admin/operations?tab=rentals', icon: CalendarClock },
    { label: 'View Inventory', description: 'Inspect readiness, maintenance, and fleet health', path: '/admin/inventory', icon: Box },
    { label: 'Review KYC', description: 'Handle pending and manual review identity cases', path: '/admin/kyc', icon: ShieldCheck },
    { label: 'Direct Operations', description: 'Unified management for all mission logs', path: '/admin/operations', icon: ClipboardList }
  ];

  return (
    <div className="space-y-6 pb-16">
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-amber-200">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em]">Partial Data Warning</p>
            <p className="mt-1 text-sm text-amber-100/80">{error}</p>
          </div>
        </div>
      )}

      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(0,212,255,0.16),transparent_28%),linear-gradient(135deg,#0d1727,#08101a_65%,#071019)] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.34)] lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-emerald-300">
                System Online
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                Live Ops Shell
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Operational overview for revenue, fleet, identity, and signal health.</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300">
                The admin shell is now centered on live throughput, active rental pressure, fleet readiness, and the queue that actually needs attention.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-2">
                <Activity size={16} className="text-cyan-300" />
                Last sync {lastUpdated ? format(lastUpdated, 'MMM d, HH:mm:ss') : 'waiting for first snapshot'}
              </span>
              <span className="flex items-center gap-2">
                <BellRing size={16} className="text-amber-300" />
                {metrics.criticalSignals} critical signals
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Link
              to="/admin/operations"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-3 text-sm font-black text-cyan-200 transition-all hover:border-cyan-300/40 hover:bg-cyan-400/15"
            >
              Open Operations <ArrowRight size={16} />
            </Link>
            <Link
              to="/admin/inventory"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-black text-white transition-all hover:border-cyan-400/20 hover:text-cyan-200"
            >
              View Inventory
            </Link>
            <Link
              to="/admin/kyc"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-black text-white transition-all hover:border-cyan-400/20 hover:text-cyan-200"
            >
              Review KYC
            </Link>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard
          label="Gross Revenue"
          value={formatCurrency(metrics.grossRevenue)}
          helper="Orders plus rental revenue and late fees"
          tone="cyan"
          loading={loading}
          icon={Wallet}
        />
        <StatCard
          label="Orders In Flight"
          value={String(metrics.ordersInFlight)}
          helper="Pending, processing, and shipped orders"
          tone="emerald"
          loading={loading}
          icon={ClipboardList}
        />
        <Link to="/admin/rentals">
          <StatCard
            label="Active Rentals"
            value={String(metrics.activeRentals)}
            helper="Pending, active, and late rental sessions"
            tone="amber"
            loading={loading}
            icon={CalendarClock}
          />
        </Link>
        <StatCard
          label="Fleet Ready"
          value={`${metrics.fleetReady} / ${inventoryDistribution.reduce((sum, item) => sum + item.value, 0) || 0}`}
          helper={`${Math.round(metrics.fleetReadyRate * 100)}% currently available`}
          tone="cyan"
          loading={loading}
          icon={Box}
        />
        <StatCard
          label="KYC Queue"
          value={String(metrics.kycQueue)}
          helper="Pending and manual-review identity checks"
          tone="amber"
          loading={loading}
          icon={ShieldCheck}
        />
        <StatCard
          label="Critical Signals"
          value={String(metrics.criticalSignals)}
          helper="Unread high and critical admin notifications"
          tone={metrics.criticalSignals > 0 ? 'red' : 'emerald'}
          loading={loading}
          icon={BellRing}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <PanelShell
            title="Revenue Trend"
            subtitle="Combined order and rental revenue for the last seven days."
            action={
              <Link to="/admin/invoices" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300 transition-colors hover:text-cyan-200">
                View invoices <ArrowRight size={12} />
              </Link>
            }
          >
            {loading ? (
              <div className="h-[18rem] animate-pulse rounded-3xl bg-white/[0.05]" />
            ) : (
              <div className="h-[18rem]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueTrend}>
                    <defs>
                      <linearGradient id="overviewRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#08111c',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '16px',
                        color: '#f8fafc'
                      }}
                      formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#00d4ff"
                      strokeWidth={3}
                      fill="url(#overviewRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </PanelShell>

          <PanelShell
            title="Priority Queue"
            subtitle="The next issues the team should triage, ordered by operational urgency."
            action={
              <Link to="/admin/operations" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300 transition-colors hover:text-cyan-200">
                Open operations <ArrowRight size={12} />
              </Link>
            }
          >
            <PriorityQueueList items={priorityQueue} loading={loading} />
          </PanelShell>
        </div>

        <div className="space-y-6">
          <PanelShell
            title="Activity Feed"
            subtitle="Recent events across notifications, orders, rentals, and KYC."
          >
            <CommandMatrix events={activityFeed} loading={loading} emptyLabel="No recent activity has been recorded yet." />
          </PanelShell>

          <PanelShell
            title="Fleet Distribution"
            subtitle="Current inventory breakdown by normalized readiness state."
            action={
              <Link to="/admin/inventory" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300 transition-colors hover:text-cyan-200">
                Inspect fleet <ArrowRight size={12} />
              </Link>
            }
          >
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
              <div className="h-[14rem]">
                {loading ? (
                  <div className="h-full animate-pulse rounded-3xl bg-white/[0.05]" />
                ) : inventoryDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={inventoryDistribution}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={52}
                        outerRadius={76}
                        paddingAngle={4}
                      >
                        {inventoryDistribution.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#08111c',
                          border: '1px solid rgba(255,255,255,0.12)',
                          borderRadius: '16px',
                          color: '#f8fafc'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-white/10 bg-black/20 px-6 text-center text-sm text-slate-400">
                    No inventory status data available.
                  </div>
                )}
              </div>
              <FleetBreakdown items={inventoryDistribution} loading={loading} />
            </div>
          </PanelShell>
        </div>
      </div>

      <PanelShell
        title="Quick Actions"
        subtitle="Jump straight into the admin workflows that need direct action."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              to={action.path}
              className="group rounded-3xl border border-white/10 bg-black/20 p-5 transition-all hover:border-cyan-400/20 hover:bg-black/30"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
                <action.icon size={18} />
              </div>
              <p className="text-sm font-black text-white">{action.label}</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">{action.description}</p>
              <div className="mt-5 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300 transition-colors group-hover:text-cyan-200">
                Open <ArrowRight size={12} />
              </div>
            </Link>
          ))}
        </div>
      </PanelShell>
    </div>
  );
}
