import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, ShieldAlert, RefreshCw, AlertTriangle } from "lucide-react";
import EnterpriseKYC from "../../components/kyc/enterprise/EnterpriseKYC";
import { useAuth } from "../../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || '';

export default function UserKYC() {
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState<string | null>(null);
    const [resubmissions, setResubmissions] = useState(0);
    const [canResubmit, setCanResubmit] = useState(true);
    const [isResubmitting, setIsResubmitting] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const checkStatus = async () => {
            if (!user) {
                navigate("/login?redirect=/dashboard/kyc");
                return;
            }

            try {
                const token = localStorage.getItem('consolezone_token');
                const response = await fetch(`${API_URL}/api/kyc/${user.id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const kyc = await response.json().catch(() => ({}));
                    if (kyc.status === 'REVERIFICATION_REQUESTED') {
                        setStatus(null);
                    } else {
                        setStatus(kyc.status);
                    }
                    setRejectionReason(kyc.rejectionReason || null);
                    setResubmissions(user.kyc_resubmissions || 0);
                    setCanResubmit(kyc.resubmissionAllowed !== false);
                } else {
                    setStatus(null);
                }
            } catch (err) {
                console.error("Status check failed", err);
                const mockStatus = (user as any).kyc_status || null;
                setStatus(mockStatus);
            } finally {
                setLoading(false);
            }
        };

        checkStatus();
    }, [user, navigate]);

    const handleResubmit = () => {
        setStatus(null);
        setRejectionReason(null);
    };

    const handleHardReset = async () => {
        if (!window.confirm("WARNING: Execute Identity Matrix Purge? This will permanently delete your KYC records.")) return;
        try {
            const token = localStorage.getItem('consolezone_token');
            const response = await fetch(`${API_URL}/api/kyc/${user?.id}`, { 
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                setStatus(null);
                setRejectionReason(null);
                alert("Matrix Purge Success. Restarting protocol.");
            }
        } catch (e) {
            alert("Reset protocol failed.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-dvh bg-[#0b0b0f] flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gaming-accent/20 border border-gaming-accent/30 flex items-center justify-center animate-pulse">
                    <Loader2 className="text-gaming-accent animate-spin" size={24} />
                </div>
                <p className="text-[10px] font-mono text-gaming-accent/70 uppercase tracking-[0.4em]">Establishing Secure Link...</p>
            </div>
        );
    }

    if (status === 'REJECTED') {
        return (
            <div className="min-h-dvh bg-[#0b0b0f] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-6">
                    <AlertTriangle size={40} />
                </div>
                <h1 className="text-2xl font-black text-white uppercase tracking-widest mb-2">Verification Rejected</h1>
                <p className="text-gaming-accent font-mono text-[10px] mb-4 uppercase tracking-[0.3em] font-bold">{user?.consolezone_id || 'ID_UNASSIGNED'}</p>
                
                {rejectionReason && (
                    <div className="max-w-md bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                        <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">Rejection Reason</p>
                        <p className="text-sm text-gray-300 leading-relaxed">{rejectionReason}</p>
                    </div>
                )}

                <p className="text-gray-400 max-w-md text-sm leading-relaxed mb-4">
                    Your KYC verification was rejected. You can submit a new verification request to try again.
                </p>

                <p className="text-gray-500 text-[10px] mb-6">
                    Resubmission attempts remaining: {3 - resubmissions}
                </p>

                {canResubmit && resubmissions < 3 ? (
                    <button
                        onClick={handleResubmit}
                        disabled={isResubmitting}
                        className="px-8 py-3 bg-gaming-accent text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-gaming-accent transition-all cursor-pointer flex items-center gap-2"
                    >
                        {isResubmitting ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
                        Submit New Verification
                    </button>
                ) : (
                    <div className="px-8 py-3 bg-gray-500/20 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
                        Maximum Attempts Reached
                    </div>
                )}
                
                <button
                    onClick={() => navigate("/dashboard")}
                    className="mt-4 text-gray-500 hover:text-white text-xs font-medium"
                >
                    Return to Profile
                </button>
            </div>
        );
    }

    if (status === 'APPROVED' || status === 'PENDING' || status === 'MANUAL_REVIEW') {
        return (
            <div className="min-h-dvh bg-[#0b0b0f] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-gaming-accent/10 rounded-full flex items-center justify-center text-gaming-accent mb-6 purple-glow">
                    <ShieldAlert size={40} />
                </div>
                <h1 className="text-2xl font-black text-white uppercase tracking-widest mb-2">{status === 'APPROVED' ? 'Verified' : 'Verification Active'}</h1>
                <p className="text-gaming-accent font-mono text-[10px] mb-4 uppercase tracking-[0.3em] font-bold">{user?.consolezone_id || 'ID_UNASSIGNED'}</p>
                <p className="text-gray-400 max-w-md text-sm leading-relaxed mb-8">
                    Your account is currently in <span className="text-gaming-accent font-bold">{status}</span> status. Our automated verification engine is reviewing your submission.
                </p>
                <button
                    onClick={() => navigate("/dashboard")}
                    className="px-8 py-3 bg-gaming-accent text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-gaming-accent transition-all cursor-pointer"
                >
                    Return to Profile
                </button>

                <div className="mt-12 pt-8 border-t border-white/5">
                    <button
                        onClick={handleHardReset}
                        className="text-[8px] font-mono text-gray-700 hover:text-red-500 uppercase tracking-widest transition-colors"
                    >
                        [EXECUTE_IDENTITY_MATRIX_PURGE]
                    </button>
                </div>
            </div>
        );
    }

    return <EnterpriseKYC />;
}


