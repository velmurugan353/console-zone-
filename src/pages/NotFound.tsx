import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-dvh bg-gaming-bg flex items-center justify-center text-center px-4">
      <div>
        <AlertTriangle className="h-20 w-20 text-gaming-accent mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-white mb-4">404 - Page Not Found</h1>
        <p className="text-gaming-muted mb-8 text-lg">
          The page you are looking for might have been removed or is temporarily unavailable.
        </p>
        <Link to="/">
          <button className="px-8 py-3 bg-gaming-accent text-black font-bold rounded-lg hover:bg-gaming-accent/90 transition-colors">
            Return Home
          </button>
        </Link>
      </div>
    </div>
  );
}
