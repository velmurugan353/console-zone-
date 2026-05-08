import { useLocation } from 'react-router-dom';
import { Construction } from 'lucide-react';

export default function AdminPlaceholder() {
  const location = useLocation();
  const pageName = location.pathname.split('/').pop();

  return (
    <div className="flex flex-col items-center justify-center h-[] text-center">
      <div className="p-6 bg-gaming-card rounded-full mb-6 border border-gaming-border">
        <Construction className="h-12 w-12 text-gaming-accent" />
      </div>
      <h1 className="text-3xl font-bold text-white mb-2 capitalize">{pageName} Management</h1>
      <p className="text-gaming-muted max-w-md">
        This module is currently under development. Check back soon for full functionality.
      </p>
    </div>
  );
}
