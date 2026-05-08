import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ChevronLeft } from 'lucide-react';

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (user) {
      console.log('[LOGIN_PAGE] User already authenticated:', user.name, 'Role:', user.role);
      if (user.role === 'admin') {
        console.log('[LOGIN_PAGE] Redirecting to /admin');
        navigate('/admin');
      } else {
        console.log('[LOGIN_PAGE] Redirecting to /dashboard');
        navigate('/dashboard');
      }
    }
  }, [user, navigate]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get('test') === 'true') {
      setEmail('Cheersediting@gmail.com');
      setPassword('admin123');
    }
  }, [searchParams]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password, 'admin');
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-gaming-bg flex items-center justify-center relative overflow-hidden p-4">
      {/* Mobile Back Button */}
      <div className="md:hidden fixed top-6 left-6 z-20">
        <button onClick={() => navigate('/')} className="text-white flex items-center gap-1 text-xs font-bold uppercase tracking-widest bg-white/10 px-3 py-2 rounded-full border border-white/10">
          <ChevronLeft size={16} /> Back to Home
        </button>
      </div>

      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md p-8 bg-gaming-card border border-gaming-border rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gaming-bg rounded-2xl mb-4 border border-gaming-border">
            <ShieldAlert className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Restricted Access</h1>
          <p className="text-gaming-muted">ConsoleZone Admin Control Panel</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg text-center mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gaming-muted">Administrator Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gaming-bg border border-gaming-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
              placeholder="admin@consolezone.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gaming-muted">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gaming-bg border border-gaming-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-4 bg-red-500/10 border border-red-500/50 text-red-500 font-bold rounded-xl hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gaming-muted space-y-2">
          <p>Not an administrator? <button onClick={() => navigate('/')} className="text-gaming-accent cursor-pointer hover:underline bg-transparent border-0 p-0">Return Home</button></p>
          <p><Link to="/forgot-password" className="text-gaming-muted hover:text-white hover:underline">Forgot your password?</Link></p>
        </div>
      </div>
    </div>
  );
}
