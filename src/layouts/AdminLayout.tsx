import { useEffect, useMemo, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  Bell,
  Box,
  Calendar,
  Cpu,
  DollarSign,
  FileText,
  Gamepad2,
  LayoutDashboard,
  LogOut,
  Menu,
  Palette,
  RefreshCw,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Users,
  Wrench,
  X,
  Zap
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { useAdminNotifications } from '../hooks/useAdminNotifications';
import { cn } from '../lib/utils';
import { useLayoutMach } from '../services/layoutMachService';

interface AdminRouteMeta {
  title: string;
  description: string;
  eyebrow: string;
}

const ROUTE_META: Record<string, AdminRouteMeta> = {
  '/admin': {
    title: 'Overview',
    description: 'Live operations, fleet readiness, revenue flow, and identity pressure.',
    eyebrow: 'Admin shell'
  },
  '/admin/controls': {
    title: 'Control Center',
    description: 'Operational feature gates, platform controls, and system toggles.',
    eyebrow: 'System controls'
  },
  '/admin/analytics': {
    title: 'Analytics',
    description: 'Business performance, demand movement, and platform health signals.',
    eyebrow: 'Performance'
  },
  '/admin/products': {
    title: 'Products',
    description: 'Catalog inventory, pricing posture, and published product readiness.',
    eyebrow: 'Catalog'
  },
  '/admin/customers': {
    title: 'Customers',
    description: 'Account health, tier movement, and KYC visibility for active users.',
    eyebrow: 'Users'
  },
  '/admin/invoices': {
    title: 'Invoices',
    description: 'Billing output, invoice generation, and finance follow-through.',
    eyebrow: 'Finance'
  },
  '/admin/kyc': {
    title: 'KYC Review',
    description: 'Identity verification queue, trust scores, and manual review cases.',
    eyebrow: 'Identity'
  },
  '/admin/coupons': {
    title: 'Coupons',
    description: 'Promotion health, code usage, and commercial incentive controls.',
    eyebrow: 'Growth'
  },
  '/admin/customizer': {
    title: 'Customizer',
    description: 'Admin UI tuning, appearance presets, and design system overrides.',
    eyebrow: 'Interface'
  },
  '/admin/content': {
    title: 'Content',
    description: 'Homepage and surface content controls for live storefront messaging.',
    eyebrow: 'Content'
  },
  '/admin/settings': {
    title: 'Settings',
    description: 'Platform configuration, defaults, and administrative preferences.',
    eyebrow: 'Configuration'
  },
  '/admin/operations': {
    title: 'Operations',
    description: 'Unified task handling across orders, rentals, inventory, and invoicing.',
    eyebrow: 'Operations'
  },
  '/admin/rentals': {
    title: 'Active Rentals',
    description: 'Track active rental sessions, monitor return windows, and handle fleet logistics.',
    eyebrow: 'Logistics'
  },
  '/admin/rental-products': {
    title: 'Rental Products',
    description: 'Manage rental console catalog, pricing, stock, and availability.',
    eyebrow: 'Catalog'
  },
  '/admin/inventory': {
    title: 'Inventory',
    description: 'Track rental devices, maintenance, and fleet health.',
    eyebrow: 'Fleet'
  }
};

const OPERATIONS_META: Record<string, string> = {
  orders: 'Monitor fulfilment pressure, tracking, and shipment blockers.',
  rentals: 'Track active sessions, late returns, and booking flow pressure.',
  inventory: 'Inspect asset readiness, stock movement, and maintenance drift.',
  'sell-requests': 'Handle incoming acquisition requests and offer decisions.',
  invoices: 'Review generated invoices and unresolved billing actions.'
};

const sidebarGroups = [
  {
    title: 'Dashboard',
    links: [
      { name: 'Overview', path: '/admin', icon: LayoutDashboard },
      { name: 'Control Center', path: '/admin/controls', icon: Zap },
      { name: 'Analytics', path: '/admin/analytics', icon: Activity }
    ]
  },
  {
    title: 'Catalog',
    links: [
      { name: 'Products', path: '/admin/products', icon: Box },
      { name: 'Rental Products', path: '/admin/rental-products', icon: Gamepad2 },

    ]
  },
  {
    title: 'Operations',
    links: [
      { name: 'Orders', path: '/admin/operations?tab=orders', icon: ShoppingBag },
      { name: 'Rentals', path: '/admin/rentals', icon: Calendar },
      { name: 'Inventory', path: '/admin/inventory', icon: Activity },
      { name: 'Rental History', path: '/admin/rental-history', icon: FileText },
      { name: 'Customer Profiles', path: '/admin/customer-profiles', icon: Users },
      { name: 'Sell Requests', path: '/admin/operations?tab=sell-requests', icon: DollarSign }
    ]
  },
  {
    title: 'Users & Finance',
    links: [
      { name: 'User Matrix', path: '/admin/customers', icon: Users },
      { name: 'Invoices', path: '/admin/invoices', icon: FileText },
      { name: 'KYC Review', path: '/admin/kyc', icon: ShieldCheck },
      { name: 'Coupons', path: '/admin/coupons', icon: Tag }
    ]
  },
  {
    title: 'System',
    links: [
      { name: 'Customizer', path: '/admin/customizer', icon: Palette },
      { name: 'Content', path: '/admin/content', icon: LayoutDashboard },
      { name: 'Settings', path: '/admin/settings', icon: Settings }
    ]
  },
  {
    title: 'Support',
    links: [
      { name: 'Repair Requests', path: '/admin/repairs', icon: Wrench },
    ]
  }
];

const getNotificationTimestamp = (value: unknown) => {
  if (value && typeof value === 'object' && 'toDate' in value && typeof (value as { toDate?: unknown }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate();
  }

  const parsed = value ? new Date(value as string) : null;
  return parsed && !Number.isNaN(parsed.getTime()) ? parsed : null;
};

const notificationPriorityStyles = {
  critical: 'border-red-500/20 bg-red-500/10 text-red-300',
  high: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
  normal: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-300',
  low: 'border-white/10 bg-white/[0.04] text-slate-300'
} as const;

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user, isAdmin, loading } = useAuth();
  const { mode, protocol } = useLayoutMach();
  const { notifications, unreadCount, markRead } = useAdminNotifications();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  useEffect(() => {
    console.log('[ADMIN_LAYOUT] Auth Check - Loading:', loading, 'User:', user?.name, 'Role:', user?.role, 'IsAdmin:', isAdmin);
    if (!loading && (!user || !isAdmin)) {
      console.warn('[ADMIN_LAYOUT] Unauthorized access detected. Redirecting to login...');
      navigate('/login');
    }
  }, [user, isAdmin, navigate, loading]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsNotifOpen(false);
  }, [location.pathname, location.search, mode]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsNotifOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const currentMeta = useMemo(() => {
    if (location.pathname === '/admin/operations') {
      const tab = new URLSearchParams(location.search).get('tab') || 'orders';
      return {
        ...ROUTE_META['/admin/operations'],
        description: OPERATIONS_META[tab] || ROUTE_META['/admin/operations'].description
      };
    }

    return ROUTE_META[location.pathname] || ROUTE_META['/admin'];
  }, [location.pathname, location.search]);

  const isLinkActive = (path: string) => {
    if (path.includes('?')) {
      const [pathname, search] = path.split('?');
      return location.pathname === pathname && location.search.includes(search);
    }
    return location.pathname === path;
  };

  const userInitial = (user?.name || user?.email || 'A').charAt(0).toUpperCase();

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#050b14]">
        <div className="h-12 w-12 animate-spin rounded-full border-y-2 border-cyan-300" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#050b14] p-4">
        <div className="mx-auto max-w-md space-y-6 rounded-[2rem] border border-white/10 bg-[#0b1320] p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-red-500/20 bg-red-500/10 text-red-400">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-red-300">Access restricted</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-white">Administrator access is required for this shell.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">Authenticate with an administrator account to continue into the control environment.</p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/login')}
              className="w-full rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-4 text-sm font-black text-cyan-200 transition-colors hover:bg-cyan-400/15"
            >
              Authenticate admin
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-sm font-bold text-slate-300 transition-colors hover:bg-white/[0.07]"
            >
              Return to storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-[#050b14] text-slate-100">
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex h-dvh flex-col border-r border-white/10 bg-[#09111d]/95 backdrop-blur-xl transition-all duration-300',
          mode === 'phone' ? (isMobileMenuOpen ? 'w-72 translate-x-0' : 'w-72 -translate-x-full') : mode === 'tab' ? 'w-24' : 'w-72'
        )}
      >
        <div className={cn('border-b border-white/10 p-6', mode === 'tab' ? 'flex justify-center' : 'space-y-2')}>
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
              <Gamepad2 size={20} />
            </div>
            {mode !== 'tab' && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">ConsoleZone</p>
                <p className="text-lg font-black tracking-tight text-white">Admin Shell</p>
              </div>
            )}
          </Link>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
          {sidebarGroups.map((group) => (
            <div key={group.title} className="space-y-2">
              {mode !== 'tab' && <p className="px-4 text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">{group.title}</p>}
              <div className="space-y-1.5">
                {group.links.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    title={mode === 'tab' ? link.name : ''}
                    className={cn(
                      'flex items-center rounded-2xl border text-sm font-bold transition-all',
                      mode === 'tab' ? 'justify-center px-0 py-3.5' : 'gap-3 px-4 py-3',
                      isLinkActive(link.path)
                        ? 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200 shadow-[0_0_0_1px_rgba(34,211,238,0.08)]'
                        : 'border-transparent text-slate-400 hover:border-white/10 hover:bg-white/[0.04] hover:text-white'
                    )}
                  >
                    <link.icon className={cn('shrink-0', mode === 'tab' ? 'h-5 w-5' : 'h-4 w-4')} />
                    {mode !== 'tab' && <span>{link.name}</span>}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="space-y-4 border-t border-white/10 p-4">
          <div className={cn('rounded-2xl border border-white/10 bg-white/[0.03] p-4', mode === 'tab' && 'px-3')}>
            <div className={cn('flex items-center gap-3', mode === 'tab' && 'justify-center')}>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
                <Cpu size={18} />
              </div>
              {mode !== 'tab' && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300">{protocol.agentName}</p>
                  <p className="mt-1 text-xs text-slate-400">{protocol.description}</p>
                </div>
              )}
            </div>
          </div>

          <div className={cn('rounded-2xl border border-white/10 bg-black/20 p-4', mode === 'tab' && 'px-3')}>
            <div className={cn('flex items-center gap-3', mode === 'tab' && 'justify-center')}>
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="h-10 w-10 rounded-2xl border border-white/10 object-cover" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-sm font-black text-white">
                  {userInitial}
                </div>
              )}
              {mode !== 'tab' && (
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white">{user.name}</p>
                  <p className="truncate text-xs text-slate-400">{user.email}</p>
                </div>
              )}
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className={cn(
                'mt-4 flex w-full items-center rounded-2xl border border-red-500/15 bg-red-500/10 text-sm font-bold text-red-300 transition-colors hover:bg-red-500/15',
                mode === 'tab' ? 'justify-center px-0 py-3' : 'gap-3 px-4 py-3'
              )}
            >
              <LogOut size={16} />
              {mode !== 'tab' && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      <main
        className={cn(
          'min-h-dvh transition-all duration-300',
          mode === 'phone' ? 'ml-0' : mode === 'tab' ? 'ml-24' : 'ml-72'
        )}
      >
        <div className="px-4 py-4 md:px-6 lg:px-8">
          <header className="sticky top-0 z-30 mb-6 rounded-[2rem] border border-white/10 bg-[#08111c]/90 px-4 py-4 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl md:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-3">
                {mode === 'phone' && (
                  <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen((previous) => !previous)}
                    aria-label="Toggle admin navigation"
                    className="mt-1 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-300 transition-colors hover:bg-white/[0.08] hover:text-white"
                  >
                    {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                  </button>
                )}
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300">{currentMeta.eyebrow}</p>
                  <h1 className="mt-1 text-2xl font-black tracking-tight text-white">{currentMeta.title}</h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{currentMeta.description}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                  <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-500">Viewport protocol</p>
                  <p className="mt-1 text-sm font-bold text-white">{protocol.agentName}</p>
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsNotifOpen((previous) => !previous)}
                    aria-label="Toggle admin notifications"
                    aria-expanded={isNotifOpen}
                    className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-300 transition-colors hover:bg-white/[0.08] hover:text-white"
                  >
                    <Bell size={18} className={unreadCount > 0 ? 'text-cyan-300' : ''} />
                    {unreadCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full border border-[#08111c] bg-red-500 px-1 text-[9px] font-black text-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {isNotifOpen && (
                      <>
                        <div className="fixed inset-0 z-[-1]" onClick={() => setIsNotifOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.96 }}
                          className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-3xl border border-white/10 bg-[#09111d] shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
                        >
                          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300">Notifications</p>
                              <p className="mt-1 text-sm text-slate-400">Recent admin alerts and action signals.</p>
                            </div>
                            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">
                              {unreadCount} unread
                            </span>
                          </div>

                          <div className="max-h-[24rem] overflow-y-auto">
                            {notifications.length > 0 ? (
                              notifications.slice(0, 6).map((notification) => {
                                const priority = (notification.priority || 'low') as keyof typeof notificationPriorityStyles;
                                const timestamp = getNotificationTimestamp(notification.timestamp);

                                return (
                                  <button
                                    key={notification.id}
                                    type="button"
                                    onClick={async () => {
                                      if (!notification.read && notification.id) {
                                        await markRead(notification.id);
                                      }
                                      if (notification.actionPath) {
                                        navigate(notification.actionPath);
                                      }
                                      setIsNotifOpen(false);
                                    }}
                                    className={cn(
                                      'w-full border-b border-white/10 px-5 py-4 text-left transition-colors hover:bg-white/[0.04]',
                                      !notification.read ? 'bg-cyan-400/[0.04]' : 'bg-transparent'
                                    )}
                                  >
                                    <div className="mb-2 flex items-center justify-between gap-3">
                                      <span className={`rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.22em] ${notificationPriorityStyles[priority] || notificationPriorityStyles.low}`}>
                                        {priority}
                                      </span>
                                      <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-slate-500">
                                        {timestamp ? format(timestamp, 'HH:mm') : 'now'}
                                      </span>
                                    </div>
                                    <p className="text-sm font-bold text-white">{notification.title}</p>
                                    <p className="mt-1 line-clamp-2 text-sm text-slate-400">{notification.message}</p>
                                  </button>
                                );
                              })
                            ) : (
                              <div className="px-6 py-12 text-center">
                                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">No signals</p>
                                <p className="mt-2 text-sm text-slate-400">The admin queue is quiet right now.</p>
                              </div>
                            )}
                          </div>

                          <Link
                            to="/admin/operations"
                            className="block border-t border-white/10 px-5 py-4 text-center text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300 transition-colors hover:bg-white/[0.04] hover:text-cyan-200"
                            onClick={() => setIsNotifOpen(false)}
                          >
                            Open operations log
                          </Link>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </header>

          <Outlet />
        </div>
      </main>
    </div>
  );
}
