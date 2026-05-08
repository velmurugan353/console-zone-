import React, { useState } from 'react';
import { User, Lock, Mail, AlertCircle, X, ChevronLeft } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import './AuthModal.css';

export default function AuthModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const { login, register, loginWithGoogle } = useAuth();
    const [isRegistering, setIsRegistering] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGoogleSuccess = async (credentialResponse: any) => {
        setError('');
        setLoading(true);
        try {
            await loginWithGoogle(credentialResponse.credential);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Google Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            console.log('AuthModal: Starting registration for', email);
            await register(email, password, name);
            console.log('AuthModal: Registration successful, logging in...');
            // Optionally auto-login after register
            await login(email, password);
            console.log('AuthModal: Login successful');
            onClose();
        } catch (err: any) {
            console.error('AuthModal: Registration/Login error:', err);
            setError(err.message || 'Failed to register');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 auth-wrapper">
            {/* Mobile Close Button */}
            <button 
                onClick={onClose}
                className="md:hidden fixed top-6 right-6 p-2 bg-white/10 rounded-full text-white z-[110] border border-white/20"
            >
                <X size={24} />
            </button>

            <div className={`container ${isRegistering ? 'active' : ''}`}>
                {/* Background Shapes */}
                <div className="curved-shape"></div>
                <div className="curved-shape2"></div>

                {error && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-3/4 bg-red-500/20 border border-red-500/50 text-red-100 p-3 rounded-xl flex items-center gap-2 z-50 shadow-2xl backdrop-blur-sm">
                        <AlertCircle size={16} className="text-red-400" />
                        <span className="text-xs font-mono">{error}</span>
                    </div>
                )}

                {/* Login Form */}
                <div className="form-box bg-transparent Login">
                    <div className="md:hidden mb-4">
                        <button onClick={onClose} className="text-white flex items-center gap-1 text-xs font-bold uppercase tracking-widest">
                            <ChevronLeft size={16} /> Back
                        </button>
                    </div>
                    <h2 className="animation" style={{ '--D': 0, '--S': 21 } as React.CSSProperties}>Login</h2>
                    <form className="relative" onSubmit={handleLogin}>
                        <div className="input-box animation" style={{ '--D': 1, '--S': 22 } as React.CSSProperties}>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <label>Email</label>
                            <User size={18} className="text-gray-400 absolute top-1/2 right-0 -translate-y-1/2" />
                        </div>

                        <div className="input-box animation" style={{ '--D': 2, '--S': 23 } as React.CSSProperties}>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <label>Password</label>
                            <Lock size={18} className="text-gray-400 absolute top-1/2 right-0 -translate-y-1/2" />
                        </div>

                        <div className="input-box animation mt-6" style={{ '--D': 3, '--S': 24 } as React.CSSProperties}>
                            <button className="auth-btn" type="submit" disabled={loading}>
                                {loading ? 'Processing...' : 'Login'}
                            </button>
                        </div>

                        <div className="mt-6 flex flex-col items-center gap-4 animation" style={{ '--D': 3.5, '--S': 24.5 } as React.CSSProperties}>
                            <div className="w-full flex justify-center">
                                <GoogleLogin 
                                    onSuccess={handleGoogleSuccess}
                                    onError={() => setError('Google Login Failed')}
                                    theme="filled_black"
                                    shape="circle"
                                    width="250px"
                                />
                            </div>
                        </div>

                        <div className="regi-link animation" style={{ '--D': 4, '--S': 25 } as React.CSSProperties}>
                            <p>Don't have an account? <br />
                                <button type="button" onClick={() => { setIsRegistering(true); setError(''); }} className="text-gaming-accent font-bold hover:underline bg-transparent border-0 mt-1 cursor-pointer">
                                    Sign Up
                                </button>
                            </p>
                        </div>
                    </form>
                </div>

                {/* Login Info Block */}
                <div className="info-content Login">
                    <h2 className="animation" style={{ '--D': 0, '--S': 20 } as React.CSSProperties}>WELCOME BACK!</h2>
                    <p className="animation" style={{ '--D': 1, '--S': 21 } as React.CSSProperties}>We are happy to have you with us again. If you need anything, we are here to help.</p>
                </div>

                {/* Register Form */}
                <div className="form-box bg-transparent Register">
                    <div className="md:hidden mb-4">
                        <button type="button" onClick={() => setIsRegistering(false)} className="text-white flex items-center gap-1 text-xs font-bold uppercase tracking-widest">
                            <ChevronLeft size={16} /> Back to Login
                        </button>
                    </div>
                    <h2 className="animation" style={{ '--li': 17, '--S': 0 } as React.CSSProperties}>Register</h2>
                    <form className="relative" onSubmit={handleRegister}>
                        <div className="input-box animation" style={{ '--li': 18, '--S': 1 } as React.CSSProperties}>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <label>Username</label>
                            <User size={18} className="text-gray-400 absolute top-1/2 right-0 -translate-y-1/2" />
                        </div>

                        <div className="input-box animation" style={{ '--li': 18.5, '--S': 1.5 } as React.CSSProperties}>
                            <input
                                type="tel"
                                required
                                maxLength={10}
                                value={phone}
                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                            />
                            <label>Mobile (10 Digits)</label>
                            <User size={18} className="text-gray-400 absolute top-1/2 right-0 -translate-y-1/2" />
                        </div>

                        <div className="input-box animation" style={{ '--li': 19, '--S': 2 } as React.CSSProperties}>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <label>Email</label>
                            <Mail size={18} className="text-gray-400 absolute top-1/2 right-0 -translate-y-1/2" />
                        </div>

                        <div className="input-box animation" style={{ '--li': 19, '--S': 3 } as React.CSSProperties}>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <label>Password</label>
                            <Lock size={18} className="text-gray-400 absolute top-1/2 right-0 -translate-y-1/2" />
                        </div>

                        <div className="input-box animation mt-6" style={{ '--li': 20, '--S': 4 } as React.CSSProperties}>
                            <button className="auth-btn" type="submit" disabled={loading}>
                                {loading ? 'Processing...' : 'Register'}
                            </button>
                        </div>

                        <div className="regi-link animation" style={{ '--li': 21, '--S': 5 } as React.CSSProperties}>
                            <p>Already have an account? <br />
                                <button type="button" onClick={() => { setIsRegistering(false); setError(''); }} className="text-gaming-accent font-bold hover:underline bg-transparent border-0 mt-1 cursor-pointer">
                                    Sign In
                                </button>
                            </p>
                        </div>
                    </form>
                </div>

                {/* Register Info Block */}
                <div className="info-content Register">
                    <h2 className="animation" style={{ '--li': 17, '--S': 0 } as React.CSSProperties}>WELCOME!</h2>
                    <p className="animation" style={{ '--li': 18, '--S': 1 } as React.CSSProperties}>We're delighted to have you here. If you need any assistance, feel free to reach out.</p>
                </div>
            </div>

            <button
                onClick={onClose}
                className="absolute top-8 right-8 text-white hover:text-gray-300 font-mono tracking-wider font-bold z-50"
            >
                Close [X]
            </button>
        </div>
    );
}
