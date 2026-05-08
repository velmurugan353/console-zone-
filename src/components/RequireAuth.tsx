import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck } from 'lucide-react';

interface RequireAuthProps {
    children: React.ReactNode;
    onLoginRequired?: () => void;
}

export default function RequireAuth({ children, onLoginRequired }: RequireAuthProps) {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    useEffect(() => {
        if (!loading && !isAuthenticated && onLoginRequired) {
            onLoginRequired();
        }
    }, [isAuthenticated, loading, onLoginRequired]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-dvh bg-[#080112] gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gaming-accent"></div>
                <p className="text-[10px] font-mono text-gaming-accent/70 uppercase tracking-[0.4em]">Verifying Credentials...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        if (onLoginRequired) {
            return (
                <div className="min-h-dvh bg-[#080112] flex items-center justify-center">
                    <div className="text-center space-y-6 p-8 bg-white/5 border border-white/10 rounded-3xl max-w-md mx-auto">
                        <div className="w-16 h-16 bg-gaming-accent/10 rounded-2xl flex items-center justify-center mx-auto">
                            <ShieldCheck className="h-8 w-8 text-gaming-accent" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2 uppercase tracking-tight">Authentication Required</h2>
                            <p className="text-gray-400 text-sm">Please log in to your account to access this secure deployment zone.</p>
                        </div>
                        <button 
                            onClick={onLoginRequired}
                            className="w-full py-4 bg-gaming-accent text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all"
                        >
                            Log In / Sign Up
                        </button>
                    </div>
                </div>
            );
        }
        // Drop them on the home page smoothly; the useEffect catches this state and fires the Modal
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return <>{children}</>;
}

