import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, ShieldCheck, User, Phone, MapPin, 
    Fingerprint, FileCheck, Loader2, Eye,
    ExternalLink, Video, CheckCircle2, AlertCircle,
    Download, Calendar, MessageSquare, RefreshCw, XCircle
} from 'lucide-react';
import { KYCData, getKYCStatus, updateKYCStatus } from '../../services/kyc';
import { kycReportService } from '../../services/kycReportService';
import { useAuth } from '../../context/AuthContext';

interface ViewKYCModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    userName: string;
}

export default function ViewKYCModal({ isOpen, onClose, userId, userName }: ViewKYCModalProps) {
    const [loading, setLoading] = useState(true);
    const [kycData, setKycData] = useState<KYCData | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [adminNotes, setAdminNotes] = useState('');
    const [rejectionModal, setRejectionModal] = useState<{ isOpen: boolean, status: 'REJECTED' | 'REVERIFICATION_REQUESTED', reason: string } | null>(null);
    const { user: currentUser } = useAuth();

    const fetchKYC = async () => {
        setLoading(true);
        const data = await getKYCStatus(userId);
        setKycData(data);
        if (data?.adminNotes) setAdminNotes(data.adminNotes);
        setLoading(false);
    };

    useEffect(() => {
        if (isOpen && userId) {
            fetchKYC();
        }
    }, [isOpen, userId]);

    const handleAction = async (status: 'APPROVED' | 'REJECTED' | 'MANUAL_REVIEW' | 'REVERIFICATION_REQUESTED', rejectionReason?: string) => {
        if (!rejectionReason && (status === 'REJECTED' || status === 'REVERIFICATION_REQUESTED')) {
            setRejectionModal({ isOpen: true, status, reason: '' });
            return;
        }

        setIsProcessing(true);
        try {
            await updateKYCStatus(userId, status, adminNotes, currentUser?.name || currentUser?.email, rejectionReason);
            await fetchKYC(); // Refresh
            if (rejectionModal?.isOpen) {
                setRejectionModal(null);
            }
        } catch (error) {
            console.error("Action failed:", error);
            alert("Failed to update status.");
        } finally {
            setIsProcessing(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
            case 'REJECTED': return 'text-red-500 bg-red-500/10 border-red-500/20';
            case 'MANUAL_REVIEW': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
            default: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
        }
    };

    const handleDownload = () => {
        if (kycData) {
            kycReportService.generatePDF({ ...kycData, id: userId });
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/90 backdrop-blur-md"
                    />
                    
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative w-full max-w-4xl bg-[#080112] border border-white/10 rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gaming-accent/10 rounded-lg text-gaming-accent">
                                    <Eye size={20} />
                                </div>
                                <div>
                                    <h3 className="text-white font-black uppercase tracking-widest text-sm">Identity Records: {userName}</h3>
                                    <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Verification Dossier // {userId}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleDownload}
                                    disabled={!kycData}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/5 text-white text-[10px] font-black uppercase tracking-widest rounded-lg border border-white/10 hover:bg-white/10 transition-all disabled:opacity-30"
                                >
                                    <Download size={14} />
                                    Export Dossier
                                </button>
                                <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            {loading ? (
                                <div className="py-20 flex flex-col items-center justify-center gap-4 text-gaming-accent">
                                    <Loader2 className="animate-spin" size={32} />
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">Accessing Secure Records...</p>
                                </div>
                            ) : kycData ? (
                                <div className="space-y-10">
                                    {/* Status Banner */}
                                    <div className={`p-4 rounded-2xl border flex items-center justify-between ${getStatusColor(kycData.status || '')}`}>
                                        <div className="flex items-center gap-3">
                                            <ShieldCheck size={20} />
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Protocol Status</p>
                                                <p className="text-sm font-bold uppercase">{kycData.status}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Trust Score</p>
                                            <p className="text-xl font-black italic">{kycData.trustScore || 0}%</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        {/* Basic Info */}
                                        <div className="space-y-6">
                                            <h4 className="text-[10px] font-black text-gaming-accent uppercase tracking-[0.3em] border-b border-gaming-accent/20 pb-2">Personnel Profile</h4>
                                            
                                            <div className="space-y-4">
                                                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Full Legal Name</p>
                                                    <p className="text-white font-bold uppercase italic tracking-tight">{kycData.fullName}</p>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Mobile Vector</p>
                                                        <p className="text-white font-mono">{kycData.phone}</p>
                                                    </div>
                                                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">D.L. Identification</p>
                                                        <p className="text-white font-mono uppercase">{kycData.drivingLicenseNumber}</p>
                                                    </div>
                                                </div>

                                                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">{kycData.secondaryIdType} Reference</p>
                                                    <p className="text-white font-mono uppercase">{kycData.secondaryIdNumber}</p>
                                                </div>

                                                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Registered Habitation</p>
                                                    <p className="text-white text-xs leading-relaxed uppercase">{kycData.address}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Evidence Assets */}
                                        <div className="space-y-6">
                                            <h4 className="text-[10px] font-black text-gaming-accent uppercase tracking-[0.3em] border-b border-gaming-accent/20 pb-2">Evidence Matrix</h4>
                                            
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest text-center">ID Front Segment</p>
                                                    <div className="aspect-video rounded-xl bg-white/5 border border-white/10 overflow-hidden group relative flex items-center justify-center">
                                                        {kycData.idFrontUrl === 'MANUAL_ENTRY' ? (
                                                            <span className="text-[10px] font-black text-amber-500/50 uppercase">Manual Entry</span>
                                                        ) : (
                                                            <>
                                                                <img src={kycData.idFrontUrl} className="w-full h-full object-cover" />
                                                                <a href={kycData.idFrontUrl} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                                                    <ExternalLink size={16} />
                                                                </a>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest text-center">ID Back Segment</p>
                                                    <div className="aspect-video rounded-xl bg-white/5 border border-white/10 overflow-hidden group relative flex items-center justify-center">
                                                        {kycData.idBackUrl === 'MANUAL_ENTRY' ? (
                                                            <span className="text-[10px] font-black text-amber-500/50 uppercase">Manual Entry</span>
                                                        ) : (
                                                            <>
                                                                <img src={kycData.idBackUrl} className="w-full h-full object-cover" />
                                                                <a href={kycData.idBackUrl} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                                                    <ExternalLink size={16} />
                                                                </a>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest text-center">Bio-Liveness Stream</p>
                                                    <div className="aspect-video rounded-xl bg-white/5 border border-white/10 overflow-hidden group relative flex items-center justify-center">
                                                        {kycData.selfieVideoUrl === 'MANUAL_ENTRY' ? (
                                                            <span className="text-[10px] font-black text-amber-500/50 uppercase">Manual Entry</span>
                                                        ) : (
                                                            <>
                                                                <Video size={24} className="text-gaming-accent" />
                                                                <a href={kycData.selfieVideoUrl} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                                                    <ExternalLink size={16} />
                                                                </a>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest text-center">Biometric Capture</p>
                                                    <div className="aspect-video rounded-xl bg-white/5 border border-white/10 overflow-hidden group relative flex items-center justify-center">
                                                        {kycData.selfieUrl === 'MANUAL_ENTRY' || (!kycData.selfieUrl && kycData.idFrontUrl === 'MANUAL_ENTRY') ? (
                                                            <span className="text-[10px] font-black text-amber-500/50 uppercase">Manual Entry</span>
                                                        ) : kycData.selfieUrl ? (
                                                            <>
                                                                <img src={kycData.selfieUrl} className="w-full h-full object-cover" />
                                                                <a href={kycData.selfieUrl} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                                                    <ExternalLink size={16} />
                                                                </a>
                                                            </>
                                                        ) : (
                                                            <User size={24} className="text-gray-700" />
                                                        )}
                                                    </div>
                                                </div>
                                                {/* Secondary ID Images */}
                                                {kycData.secondaryIdFrontUrl && (
                                                    <div className="space-y-2">
                                                        <p className="text-[8px] font-black text-gaming-accent uppercase tracking-widest text-center">Secondary Front</p>
                                                        <div className="aspect-video rounded-xl bg-white/5 border border-white/10 overflow-hidden group relative flex items-center justify-center">
                                                            <img src={kycData.secondaryIdFrontUrl} className="w-full h-full object-cover" />
                                                            <a href={kycData.secondaryIdFrontUrl} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                                                <ExternalLink size={16} />
                                                            </a>
                                                        </div>
                                                    </div>
                                                )}
                                                {kycData.secondaryIdBackUrl && (
                                                    <div className="space-y-2">
                                                        <p className="text-[8px] font-black text-gaming-accent uppercase tracking-widest text-center">Secondary Back</p>
                                                        <div className="aspect-video rounded-xl bg-white/5 border border-white/10 overflow-hidden group relative flex items-center justify-center">
                                                            <img src={kycData.secondaryIdBackUrl} className="w-full h-full object-cover" />
                                                            <a href={kycData.secondaryIdBackUrl} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                                                <ExternalLink size={16} />
                                                            </a>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Agent Feedbacks */}
                                    <div className="space-y-6">
                                        <h4 className="text-[10px] font-black text-gaming-accent uppercase tracking-[0.3em] border-b border-gaming-accent/20 pb-2">Analysis History</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {kycData.agentReports?.map((report, i) => (
                                                <div key={i} className="bg-black border border-white/5 p-4 rounded-2xl space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[9px] font-black text-white uppercase">{report.agentName}</span>
                                                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${report.status === 'PASS' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>{report.status}</span>
                                                    </div>
                                                    <p className="text-[10px] text-gray-500 leading-tight italic">{report.message}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Admin Findings */}
                                    {(kycData.adminNotes || kycData.verifiedBy) && (
                                        <div className="space-y-6">
                                            <h4 className="text-[10px] font-black text-gaming-accent uppercase tracking-[0.3em] border-b border-gaming-accent/20 pb-2">Administrative Findings</h4>
                                            <div className="bg-gaming-accent/5 border border-gaming-accent/10 rounded-2xl p-6 space-y-6">
                                                {kycData.adminNotes && (
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2 text-gray-500">
                                                            <MessageSquare size={12} />
                                                            <p className="text-[9px] font-black uppercase tracking-widest">Protocol Notes</p>
                                                        </div>
                                                        <p className="text-sm text-gray-300 italic leading-relaxed">
                                                            "{kycData.adminNotes}"
                                                        </p>
                                                    </div>
                                                )}
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-white/5 rounded-lg">
                                                            <ShieldCheck size={14} className="text-gaming-accent" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Verified By</p>
                                                            <p className="text-[10px] font-bold text-white uppercase tracking-tighter">{kycData.verifiedBy || 'System'}</p>
                                                        </div>
                                                    </div>
                                                    {kycData.verifiedAt && (
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-white/5 rounded-lg">
                                                                <Calendar size={14} className="text-gaming-accent" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Verification Date</p>
                                                                <p className="text-[10px] font-bold text-white uppercase tracking-tighter">
                                                                    {new Date(kycData.verifiedAt?.toDate?.() || kycData.verifiedAt).toLocaleString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {/* Admin Override Controls */}
                                    {kycData.status !== 'APPROVED' && (
                                        <div className="space-y-6 pt-6 border-t border-white/10">
                                            <h4 className="text-[10px] font-black text-gaming-accent uppercase tracking-[0.3em] flex items-center gap-3">
                                                <ShieldCheck size={16} /> Authority Override
                                            </h4>
                                            
                                            <div className="space-y-5">
                                                <div className="relative group">
                                                    <MessageSquare className="absolute left-4 top-4 text-gray-600 group-focus-within:text-gaming-accent transition-colors" size={16} />
                                                    <textarea 
                                                        value={adminNotes}
                                                        onChange={(e) => setAdminNotes(e.target.value)}
                                                        placeholder="Execute authority notes, security findings, or discrepancies..."
                                                        className="w-full bg-black border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-xs text-white focus:border-gaming-accent outline-none transition-all resize-none font-medium h-32 shadow-inner ring-offset-black focus:ring-2 ring-gaming-accent/20"
                                                    />
                                                </div>

                                                <div className="flex gap-4">
                                                    <button
                                                        onClick={() => handleAction('APPROVED')}
                                                        disabled={isProcessing}
                                                        className="flex-[2] py-4 bg-emerald-500 text-black rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-emerald-400 transition-all shadow-[0_0_25px_rgba(16,185,129,0.3)] disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-3 italic"
                                                    >
                                                        {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={18} />}
                                                        Authorize Credentials
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction('REVERIFICATION_REQUESTED')}
                                                        disabled={isProcessing}
                                                        className="flex-1 py-4 bg-purple-500/10 text-purple-500 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] border border-purple-500/30 hover:bg-purple-500 hover:text-white transition-all disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-2 italic"
                                                    >
                                                        {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                                                        Re-Verify
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction('REJECTED')}
                                                        disabled={isProcessing}
                                                        className="flex-1 py-4 bg-red-500/10 text-red-500 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] border border-red-500/30 hover:bg-red-500 hover:text-white transition-all disabled:opacity-30 disabled:grayscale italic"
                                                    >
                                                        Blacklist
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="py-20 text-center space-y-4">
                                    <AlertCircle className="mx-auto text-gray-800" size={48} />
                                    <p className="text-gray-600 font-mono text-xs uppercase tracking-widest">No matching identification record detected in the matrix.</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-white/5 bg-white/[0.01] flex justify-end">
                            <button
                                onClick={onClose}
                                className="px-8 py-3 bg-white/5 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-white/10 transition-all border border-white/10"
                            >
                                Terminate Session
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Rejection / Reverification Reason Modal */}
            <AnimatePresence>
                {rejectionModal?.isOpen && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setRejectionModal(null)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative max-w-lg w-full bg-[#080112] border border-white/10 rounded-3xl overflow-hidden shadow-2xl z-[310]"
                        >
                            <div className={`p-6 border-b border-white/5 flex items-center gap-3 ${rejectionModal.status === 'REJECTED' ? 'bg-red-500/10' : 'bg-purple-500/10'}`}>
                                {rejectionModal.status === 'REJECTED' ? (
                                    <XCircle size={24} className="text-red-500" />
                                ) : (
                                    <RefreshCw size={24} className="text-purple-500" />
                                )}
                                <div>
                                    <h3 className={`font-black uppercase tracking-widest text-sm ${rejectionModal.status === 'REJECTED' ? 'text-red-500' : 'text-purple-500'}`}>
                                        {rejectionModal.status === 'REJECTED' ? 'Blacklist Entry' : 'Request Re-Verification'}
                                    </h3>
                                    <p className="text-[10px] font-mono text-gray-500 uppercase">Document Discrepancy Log</p>
                                </div>
                            </div>
                            
                            <div className="p-6 space-y-4">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Reason for Action (Visible to User)</label>
                                <textarea
                                    autoFocus
                                    value={rejectionModal.reason}
                                    onChange={(e) => setRejectionModal(prev => prev ? { ...prev, reason: e.target.value } : null)}
                                    placeholder="Please provide specific details on why the verification failed..."
                                    className="w-full bg-black border border-white/10 rounded-2xl py-4 px-4 text-sm text-white focus:border-gaming-accent outline-none transition-all resize-none font-medium h-32 shadow-inner ring-offset-black focus:ring-2 ring-gaming-accent/20"
                                />
                                
                                <div className="flex gap-4 pt-2">
                                    <button
                                        onClick={() => setRejectionModal(null)}
                                        className="flex-1 py-3 bg-white/5 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all border border-white/10"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        disabled={!rejectionModal.reason.trim()}
                                        onClick={() => handleAction(rejectionModal.status, rejectionModal.reason)}
                                        className={`flex-1 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all disabled:opacity-50 ${rejectionModal.status === 'REJECTED' ? 'bg-red-500 hover:bg-red-400 text-black shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'bg-purple-500 hover:bg-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]'}`}
                                    >
                                        Execute Action
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AnimatePresence>
    );
}
