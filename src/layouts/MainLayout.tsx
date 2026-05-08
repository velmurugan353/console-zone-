import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Gamepad2, Twitter, Instagram, Facebook, Mail } from 'lucide-react';

interface MainLayoutProps {
  children: ReactNode;
  onAuthClick?: () => void;
}

export default function MainLayout({ children, onAuthClick }: MainLayoutProps) {
  return (
    <div className="min-h-dvh flex flex-col bg-gaming-bg text-gaming-text font-sans selection:bg-gaming-accent selection:text-black">
      <Navbar onAuthClick={onAuthClick ? onAuthClick : () => { }} />
      <main className="flex-grow pt-16 w-full">
        {children}
      </main>
      <footer className="bg-gaming-card border-t border-gaming-border mt-20 w-full">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-12" style={{ maxWidth: 'var(--layout-max-width, 1280px)' }}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Gamepad2 className="h-6 w-6 text-gaming-accent" />
                <span className="text-xl font-bold text-white">ConsoleZone</span>
              </div>
              <p className="text-sm text-gaming-muted">
                The ultimate destination for gaming gear. Rent, buy, sell, and repair all in one place.
              </p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-sm text-gaming-muted">
                <li><Link to="/shop" className="hover:text-gaming-accent transition-colors">Shop Gear</Link></li>
                <li><Link to="/rentals" className="hover:text-gaming-accent transition-colors">Rent Gear</Link></li>
                <li><Link to="/sell" className="hover:text-gaming-accent transition-colors">Sell Your Device</Link></li>
                <li><Link to="/repair" className="hover:text-gaming-accent transition-colors">Book Repair</Link></li>
                <li><Link to="/login" className="hover:text-gaming-accent transition-colors">Admin Login</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gaming-muted">
                <li><Link to="/support" className="hover:text-gaming-accent transition-colors">Help Center</Link></li>
                <li><Link to="/coming-soon" className="hover:text-gaming-accent transition-colors">Terms of Service</Link></li>
                <li><Link to="/coming-soon" className="hover:text-gaming-accent transition-colors">Privacy Policy</Link></li>
                <li><Link to="/support" className="hover:text-gaming-accent transition-colors">Contact Us</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Connect</h3>
              <div className="flex space-x-4">
                <a href="https://twitter.com/consolezone" target="_blank" rel="noopener noreferrer" className="text-gaming-muted hover:text-gaming-accent transition-colors"><Twitter className="h-5 w-5" /></a>
                <a href="https://instagram.com/consolezone" target="_blank" rel="noopener noreferrer" className="text-gaming-muted hover:text-gaming-accent transition-colors"><Instagram className="h-5 w-5" /></a>
                <a href="https://facebook.com/consolezone" target="_blank" rel="noopener noreferrer" className="text-gaming-muted hover:text-gaming-accent transition-colors"><Facebook className="h-5 w-5" /></a>
                <a href="mailto:support@consolezone.com" className="text-gaming-muted hover:text-gaming-accent transition-colors"><Mail className="h-5 w-5" /></a>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gaming-border text-center text-sm text-gaming-muted">
            © {new Date().getFullYear()} ConsoleZone. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
