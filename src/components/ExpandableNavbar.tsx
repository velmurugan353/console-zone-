import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import './ExpandableNavbar.css';

interface NavLinkProps {
  to: string;
  icon: string;
  title: string;
  badge?: number;
  className?: string;
  onClick?: () => void;
}

function NavLink({ to, icon, title, badge, className, onClick }: NavLinkProps) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link 
      to={to} 
      className={cn("link", isActive && "active", className)}
      onClick={onClick}
    >
      <span className="link-icon">{icon}</span>
      <span className="link-title">{title}</span>
      {badge !== undefined && badge > 0 && (
        <span className="nav-badge">{badge}</span>
      )}
    </Link>
  );
}

export default function ExpandableNavbar({ onAuthClick }: { onAuthClick?: () => void }) {
  const { cartCount } = useCart();
  const { user, isAdmin } = useAuth();

  const navLinks = [
    { name: 'Home', path: '/', icon: 'home' },
    { name: 'Shop', path: '/shop', icon: 'shopping_bag' },
    { name: 'Rentals', path: '/rentals', icon: 'calendar_month' },
    { name: 'Sell', path: '/sell', icon: 'sell' },
    { name: 'Repair', path: '/repair', icon: 'build' },
  ];

  return (
    <div className="expandable-nav-container">
      <div className="menu">
        <Link to="/" className="link bg-gaming-accent/20 hover:bg-gaming-accent transition-colors flex items-center justify-center" style={{ width: '50px' }}>
          <span className="link-icon m-0" style={{ color: '#000' }}>videogame_asset</span>
        </Link>

        {navLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            icon={link.icon}
            title={link.name}
          />
        ))}

        <NavLink
          to="/cart"
          icon="shopping_cart"
          title="Cart"
          badge={cartCount}
        />

        {user ? (
          <NavLink
            to="/dashboard"
            icon="account_circle"
            title={user.name.split(' ')[0]}
          />
        ) : (
          <button
            onClick={onAuthClick}
            className="link border-none bg-transparent cursor-pointer"
            style={{ outline: 'none' }}
          >
            <span className="link-icon">login</span>
            <span className="link-title">Login</span>
          </button>
        )}
      </div>
    </div>
  );
}
