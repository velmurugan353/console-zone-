import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Gamepad2, User, Mail, Lock, ArrowRight, Phone, AlertCircle } from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(email, password, name, phone);
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-gaming-bg flex items-center justify-center relative overflow-hidden pt-20 pb-12">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gaming-accent/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gaming-secondary/20 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md p-8 bg-gaming-card border border-gaming-border rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gaming-bg rounded-2xl mb-4 border border-gaming-border">
            <Gamepad2 className="h-8 w-8 text-gaming-accent" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-gaming-muted">Join the ultimate gaming community</p>
        </div>

        {error && (
            <div className="mb-4 bg-red-500/20 border border-red-500/50 text-red-100 p-3 rounded-xl flex items-center gap-2">
                <AlertCircle size={16} className="text-red-400" />
                <span className="text-sm">{error}</span>
            </div>
        )}

        <form className="space-y-4" onSubmit={handleRegister}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gaming-muted">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gaming-muted" />
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gaming-bg border border-gaming-border rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-gaming-accent transition-colors"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gaming-muted">Mobile Number (10 Digits)</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gaming-muted" />
              <input 
                type="tel" 
                required
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-gaming-bg border border-gaming-border focus:border-gaming-accent rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none transition-colors"
                placeholder="9876543210"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gaming-muted">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gaming-muted" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gaming-bg border border-gaming-border rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-gaming-accent transition-colors"
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gaming-muted">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gaming-muted" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gaming-bg border border-gaming-border rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-gaming-accent transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input type="checkbox" id="terms" required className="rounded bg-gaming-bg border-gaming-border text-gaming-accent focus:ring-gaming-accent" />
            <label htmlFor="terms" className="text-sm text-gaming-muted">
              I agree to the <Link to="/terms" className="text-gaming-accent hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-gaming-accent hover:underline">Privacy Policy</Link>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 font-bold rounded-xl transition-colors flex items-center justify-center group mt-6 bg-white text-black hover:bg-gray-200 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Create Account'}
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gaming-muted">
          <p>Already have an account? <Link to="/login" className="text-gaming-accent cursor-pointer hover:underline">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
