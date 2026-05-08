import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Gamepad2, 
  Wrench, 
  ShoppingBag, 
  Users, 
  Settings, 
  LogOut,
  BarChart3,
  RefreshCw,
  Box,
  ShieldCheck,
  Zap,
  Activity,
  FileText,
  User,
  Palette,
  Calendar
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';
import { useAdminNotifications } from '../../hooks/useAdminNotifications';
import Logo from '../Logo';

const sidebarItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { name: 'Control Center', icon: Zap, path: '/admin/controls' },
  { name: 'Site Customizer', icon: Palette, path: '/admin/customizer' },
  { name: 'Operations Matrix', icon: Activity, path: '/admin/operations' },
  { name: 'Active Rentals', icon: Calendar, path: '/admin/rentals' },
  { name: 'Content Matrix', icon: Zap, path: '/admin/content' },
  { name: 'Products', icon: Package, path: '/admin/products' },
  { name: 'Fleet Inventory', icon: Box, path: '/admin/inventory' },
  { name: 'Customers', icon: Users, path: '/admin/customers' },
  { name: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
  { name: 'Invoices', icon: FileText, path: '/admin/invoices' },
  { name: 'Identity Vault', icon: ShieldCheck, path: '/admin/kyc' },
  { name: 'Settings', icon: Settings, path: '/admin/settings' },
  { name: 'Customer View', icon: User, path: '/dashboard' },
];

export default function AdminSidebar() {
  const location = useLocation();
  const { notifications } = useAdminNotifications();

  const getBadgeCount = (itemName: string) => {
    switch (itemName) {
      case 'Operations Matrix':
        return notifications.filter(n => !n.read && (n.type === 'order' || n.type === 'rental' || n.type === 'reward')).length;
      case 'Identity Vault':
        return notifications.filter(n => !n.read && n.type === 'kyc').length;
      default:
        return 0;
    }
  };

  return (
    <div className="w-64 bg-[#111] border-r border-white/10 h-dvh fixed left-0 top-0 flex flex-col">
      <div className="p-7 border-b border-white/10">
        <Link to="/" className="flex items-center">
          <Logo size={48} />
          <span className="text-[10px] ml-2 text-gray-500 font-mono uppercase tracking-[0.2em] mt-1 italic opacity-50">Admin</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {sidebarItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative overflow-hidden",
                isActive 
                  ? "bg-gaming-accent/10 text-gaming-accent" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-gaming-accent rounded-r-full"
                />
              )}
              <item.icon className={cn("h-5 w-5", isActive ? "text-gaming-accent" : "text-gray-500 group-hover:text-white")} />
              <span className="font-medium flex-1">{item.name}</span>
              {getBadgeCount(item.name) > 0 && (
                <span className="bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                  {getBadgeCount(item.name)}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button className="flex items-center space-x-3 px-3 py-2.5 w-full rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}

