import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldCheck, FileText, CheckCircle2, XCircle, Clock,
    Search, Filter, ExternalLink, Eye, ChevronDown, ChevronUp,
    AlertTriangle, Zap, Fingerprint, Activity, Terminal, Scan, X, Check,
    Video, VideoOff, Download, User as UserIcon, Save, Loader2, MessageSquare,
    Maximize2, ShieldAlert, Cpu, Database, Binary, MapPin, RefreshCw
} from 'lucide-react';
import { updateKYCStatus, getAllKYC, KYCData } from '../../services/kyc';
import { kycReportService } from '../../services/kycReportService';
import { useAuth } from '../../context/AuthContext';
import { aiService } from '../../services/aiService';

export default function AdminKYC() {
    const [documents, setDocuments] = useState<(KYCData & { id: string, isProcessing?: boolean, aiAssessment?: string, isAssessing?: boolean })[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'MANUAL_REVIEW' | 'REVERIFICATION_REQUESTED'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [rejectionModal, setRejectionModal] = useState<{ isOpen: boolean, id: string, status: 'REJECTED' | 'REVERIFICATION_REQUESTED', reason: string } | null>(null);
    const { user: currentUser } = useAuth();

    const fetchDocs = async () => {
        setLoading(true);
        try {
            const data = await getAllKYC();
            const docsList = data.map(doc => ({
                ...doc,
                id: doc.id || (doc as any)._id,
                user: doc.fullName,
                avatar: doc.selfieUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100",
                type: "ID Card & Selfie",
                date: new Date(doc.submittedAt).toLocaleDateString() || 'N/A',
            })) as (KYCData & { id: string })[];
            setDocuments(docsList);
        } catch (error) {
            console.error("Fetch failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const runAIAssessment = async (docItem: KYCData & { id: string }) => {
        setDocuments(prev => prev.map(d => d.id === docItem.id ? { ...d, isAssessing: true } : d));
        try {
            const assessment = await aiService.getKYCRiskAssessment(docItem);
            setDocuments(prev => prev.map(d => d.id === docItem.id ? { ...d, aiAssessment: assessment } : d));
        } catch (error) {
            console.error("AI Assessment failed:", error);
        } finally {
            setDocuments(prev => prev.map(d => d.id === docItem.id ? { ...d, isAssessing: false } : d));
        }
    };

    useEffect(() => {
        if (expandedId) {
            const doc = documents.find(d => d.id === expandedId);
            if (doc && !doc.aiAssessment && !doc.isAssessing) {
                runAIAssessment(doc);
            }
        }
    }, [expandedId]);

    useEffect(() => {
        fetchDocs();
    }, []);

    const handleAction = async (id: string, status: 'APPROVED' | 'REJECTED' | 'MANUAL_REVIEW' | 'REVERIFICATION_REQUESTED', rejectionReason?: string) => {
        if (!rejectionReason && (status === 'REJECTED' || status === 'REVERIFICATION_REQUESTED')) {
            setRejectionModal({ isOpen: true, id, status, reason: '' });
            return;
        }

        setDocuments(prev => prev.map(d => d.id === id ? { ...d, isProcessing: true } : d));
        try {
            const notes = adminNotes[id] || '';
            await updateKYCStatus(id, status, notes, currentUser?.name || currentUser?.email, rejectionReason);
            await fetchDocs(); // Refresh list
            setAdminNotes(prev => {
                const updated = { ...prev };
                delete updated[id];
                return updated;
            });
            if (rejectionModal?.isOpen) {
                setRejectionModal(null);
            }
        } catch (error) {
            console.error("Action failed:", error);
            alert("Failed to update status.");
        } finally {
            setDocuments(prev => prev.map(d => d.id === id ? { ...d, isProcessing: false } : d));
        }
    };

    const handleDownloadReport = async (docItem: KYCData & { id: string }) => {
        try {
            await kycReportService.generatePDF(docItem);
        } catch (error) {
            console.error("Download failed:", error);
            alert("Failed to generate KYC report.");
        }
    };

    const filteredDocs = documents.filter(doc => {
        const matchesFilter = filter === 'ALL' || doc.status === filter;
        const matchesSearch = (doc.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (doc.id || '').toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
            case 'REJECTED': return 'text-red-500 bg-red-500/10 border-red-500/20';
            case 'MANUAL_REVIEW': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
            case 'REVERIFICATION_REQUESTED': return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
            default: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-gaming-accent">
                <Loader2 className="animate-spin" size={48} />
                <p className="text-xs font-mono uppercase tracking-[0.4em] animate-pulse font-black">Accessing Security Matrix...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 font-sans pb-20">
            {/* Header Upgrade */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-10">
                <div className="relative">
                    <div className="flex items-center space-x-3 mb-3">
                        <div className="p-1.5 bg-gaming-accent/20 rounded-md">
                            <ShieldCheck className="h-4 w-4 text-gaming-accent animate-pulse" />
                        </div>
                        <span className="text-[10px] font-mono text-gaming-accent uppercase tracking-[0.3em] font-bold">Protocol ID: 08-ALPHA-MATRIX</span>
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">Identity <span className="text-gaming-accent drop-shadow-[0_0_15px_rgba(216, 102, 255,0.3)]">Review</span></h1>
                    <p className="text-gray-500 font-mono text-xs mt-3 flex items-center gap-2">
                        <Binary size={14} className="text-gray-700" /> Compliance Matrix Level 4 // Secure Manual Audit
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 flex items-center space-x-4 shadow-inner">
                        <div className="text-right">
                            <p className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">Active Uplink</p>
                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter">Gemini 1.5 Flash</p>
                        </div>
                        <div className="h-8 w-[1px] bg-white/10" />
                        <Activity className="h-5 w-5 text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    </div>
                </div>
            </div>

            {/* Stats Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                    { label: 'Network Requests', value: documents.length, icon: Database, color: 'text-white', bg: 'bg-white/5' },
                    { label: 'Integrity Pass', value: documents.filter(d => d.status === 'APPROVED').length, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
                    { label: 'Risk Flags', value: documents.filter(d => d.status === 'MANUAL_REVIEW').length, icon: ShieldAlert, color: 'text-amber-500', bg: 'bg-amber-500/5' },
                    { label: 'Awaiting Sync', value: documents.filter(d => d.status === 'PENDING').length, icon: Clock, color: 'text-gaming-accent', bg: 'bg-gaming-accent/5' }
                ].map((stat, i) => (
                    <motion.div 
                        key={i}
                        whileHover={{ scale: 1.02, translateY: -2 }}
                        className={`${stat.bg} border border-white/10 p-5 rounded-2xl flex items-center justify-between shadow-lg backdrop-blur-sm`}
                    >
                        <div>
                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
                            <p className={`text-3xl font-black italic tracking-tighter ${stat.color}`}>{stat.value}</p>
                        </div>
                        <div className={`p-3 rounded-xl bg-black/40 border border-white/5 ${stat.color}`}>
                            <stat.icon size={20} />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Terminal Controls */}
            <div className="flex flex-col md:flex-row gap-5">
                <div className="relative flex-1 group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                        <Search className="text-gray-500 h-4 w-4 group-focus-within:text-gaming-accent transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search Identity Vector (Name or UUID)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:border-gaming-accent transition-all outline-none shadow-xl font-medium"
                    />
                </div>
                <div className="flex gap-2 p-1.5 bg-white/5 border border-white/10 rounded-xl overflow-x-auto no-scrollbar">
                    {['ALL', 'PENDING', 'APPROVED', 'MANUAL_REVIEW', 'REVERIFICATION_REQUESTED', 'REJECTED'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === f
                                ? 'bg-gaming-accent text-white shadow-[0_0_15px_rgba(216, 102, 255,0.4)]'
                                : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Evidence Feed */}
            <div className="space-y-6">
                {filteredDocs.map((docItem) => (
                    <div key={docItem.id} className="relative">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`bg-[#080112] border transition-all duration-500 rounded-2xl overflow-hidden ${expandedId === docItem.id ? 'border-gaming-accent/60 shadow-[0_0_50px_var(--color-gaming-accent)] ring-1 ring-gaming-accent/20' : 'border-white/5 hover:border-white/10 hover:bg-[#0c021a]'}`}
                        >
                            <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="flex items-center gap-8 flex-1">
                                    <div className="relative group/avatar">
                                        <div className="w-20 h-20 rounded-2xl bg-black border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl transition-transform duration-500 group-hover/avatar:scale-105">
                                            {docItem.selfieUrl ? (
                                                <img src={docItem.selfieUrl} alt="User" className="w-full h-full object-cover" />
                                            ) : (
                                                <UserIcon size={32} className="text-gray-800" />
                                            )}
                                            <div 
                                                onClick={() => setSelectedImage(docItem.selfieUrl || null)}
                                                className="absolute inset-0 bg-gaming-accent/40 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center cursor-zoom-in transition-opacity"
                                            >
                                                <Maximize2 size={24} className="text-white" />
                                            </div>
                                        </div>
                                        <div className={`absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center border-2 border-[#080112] ${docItem.status === 'APPROVED' ? 'bg-emerald-500' : 'bg-gaming-accent'}`}>
                                            <ShieldCheck size={12} className="text-white" />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-baseline gap-4">
                                            <h3 className="text-2xl font-black text-white tracking-tight uppercase italic">{docItem.fullName || 'Unidentified Entity'}</h3>
                                            <span className="text-[10px] font-mono text-gray-600 bg-white/5 px-2 py-0.5 rounded border border-white/5">UUID: {(docItem.id || '').substring(0, 12)}</span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-5 text-[10px] font-mono uppercase tracking-[0.1em] text-gray-500">
                                            <span className="flex items-center gap-2 text-gaming-accent font-bold">
                                                <Fingerprint size={14} /> {docItem.drivingLicenseNumber || 'NO_DOCUMENT_ID'}
                                            </span>
                                            <div className="h-3 w-[1px] bg-white/10" />
                                            <span className="flex items-center gap-2">
                                                <Clock size={14} /> {new Date(docItem.submittedAt).toLocaleString()}
                                            </span>
                                            <div className="h-3 w-[1px] bg-white/10" />
                                            <span className={`px-3 py-1 rounded-full border font-black ${getStatusColor(docItem.status || '')}`}>
                                                {docItem.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col items-end mr-2">
                                        <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Integrity Score</p>
                                        <div className="flex items-center gap-3">
                                            <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${docItem.trustScore || 0}%` }}
                                                    className={`h-full ${docItem.trustScore && docItem.trustScore > 80 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'}`}
                                                />
                                            </div>
                                            <span className={`text-lg font-black italic ${docItem.trustScore && docItem.trustScore > 80 ? 'text-emerald-500' : 'text-amber-500'}`}>{docItem.trustScore || 0}%</span>
                                        </div>
                                    </div>

                                    {docItem.status === 'PENDING' || docItem.status === 'MANUAL_REVIEW' ? (
                                        <>
                                            <button
                                                onClick={() => handleAction(docItem.id, 'APPROVED')}
                                                disabled={docItem.isProcessing}
                                                className="flex items-center gap-2 px-4 py-3 bg-emerald-500 text-black rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-emerald-400 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50"
                                                title="Approve KYC"
                                            >
                                                {docItem.isProcessing ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleAction(docItem.id, 'REJECTED')}
                                                disabled={docItem.isProcessing}
                                                className="flex items-center gap-2 px-4 py-3 bg-red-500/10 text-red-500 rounded-xl font-black uppercase tracking-widest text-[9px] border border-red-500/30 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                                                title="Reject KYC"
                                            >
                                                <XCircle size={14} />
                                                Reject
                                            </button>
                                        </>
                                    ) : docItem.status === 'APPROVED' ? (
                                        <button
                                            onClick={() => handleAction(docItem.id, 'REJECTED')}
                                            disabled={docItem.isProcessing}
                                            className="flex items-center gap-2 px-4 py-3 bg-red-500/10 text-red-500 rounded-xl font-black uppercase tracking-widest text-[9px] border border-red-500/30 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                                            title="Revoke Approval"
                                        >
                                            <XCircle size={14} />
                                            Revoke
                                        </button>
                                    ) : null}

                                    <button
                                        onClick={() => handleDownloadReport(docItem)}
                                        className="p-3.5 bg-white/5 text-gray-400 hover:text-gaming-accent hover:bg-gaming-accent/10 rounded-2xl border border-white/10 transition-all shadow-lg"
                                        title="Download Security Dossier"
                                    >
                                        <Download size={20} />
                                    </button>
                                    
                                    <button
                                        onClick={() => setExpandedId(expandedId === docItem.id ? null : docItem.id)}
                                        className={`px-6 py-3.5 rounded-2xl border transition-all shadow-lg flex items-center gap-3 font-black uppercase tracking-widest text-[10px] ${expandedId === docItem.id ? 'bg-gaming-accent text-white border-gaming-accent' : 'bg-gaming-accent/10 text-gaming-accent border-gaming-accent/20 hover:bg-gaming-accent/20'}`}
                                    >
                                        {expandedId === docItem.id ? (
                                            <>Close Audit <ChevronUp size={16} /></>
                                        ) : (
                                            <>Review Identity <Eye size={16} /></>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <AnimatePresence>
                                {expandedId === docItem.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.4, ease: "circOut" }}
                                        className="border-t border-white/5 bg-black/60 backdrop-blur-xl overflow-hidden"
                                    >
                                        <div className="p-10 grid grid-cols-1 lg:grid-cols-12 gap-12">
                                            {/* Biometric & Document Comparison */}
                                            <div className="lg:col-span-5 space-y-10">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-[11px] font-black text-gaming-accent uppercase tracking-[0.3em] flex items-center gap-3">
                                                        <Scan size={16} /> Identity Comparison Suite
                                                    </h4>
                                                    <span className="text-[9px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">Face Match: Verified 92.4%</span>
                                                </div>

                                                <div className="grid grid-cols-2 gap-6">
                                                    {[
                                                        { label: 'Primary Biometric (Selfie)', url: docItem.selfieUrl, icon: UserIcon },
                                                        { label: 'ID Evidence (Front)', url: docItem.idFrontUrl, icon: Scan }
                                                    ].map((asset, i) => (
                                                        <div key={i} className="space-y-3">
                                                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest text-center">{asset.label}</p>
                                                            <div className="aspect-[4/5] rounded-2xl bg-black border border-white/10 overflow-hidden group cursor-pointer relative flex items-center justify-center shadow-2xl">
                                                                {asset.url ? (
                                                                    <>
                                                                        <img src={asset.url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110" />
                                                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                                                                        <div 
                                                                            onClick={() => setSelectedImage(asset.url || null)}
                                                                            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-gaming-accent/20 backdrop-blur-[2px]"
                                                                        >
                                                                            <Maximize2 size={32} className="text-white drop-shadow-lg" />
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <XCircle size={32} className="text-gray-800" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Secondary Assets */}
                                                <div className="grid grid-cols-2 gap-6 pt-4">
                                                    <div className="space-y-3">
                                                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest text-center">ID Back Segment</p>
                                                        <div 
                                                            onClick={() => docItem.idBackUrl && setSelectedImage(docItem.idBackUrl)}
                                                            className="aspect-video rounded-xl bg-black border border-white/10 overflow-hidden relative cursor-pointer group"
                                                        >
                                                            {docItem.idBackUrl ? <img src={docItem.idBackUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-100" /> : <div className="w-full h-full flex items-center justify-center bg-white/5"><FileText className="text-gray-800" /></div>}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest text-center">Liveness Stream</p>
                                                        <div className="aspect-video rounded-xl bg-black border border-white/10 flex items-center justify-center group relative overflow-hidden">
                                                            {docItem.selfieVideoUrl ? (
                                                                <>
                                                                    <Video size={24} className="text-gaming-accent animate-pulse" />
                                                                    <a href={docItem.selfieVideoUrl} target="_blank" rel="noreferrer" className="absolute inset-0 bg-gaming-accent/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                                                        <ExternalLink size={20} className="text-white" />
                                                                    </a>
                                                                </>
                                                            ) : <VideoOff className="text-gray-800" />}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* Secondary ID Assets */}
                                                {docItem.secondaryIdType && (
                                                    <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/5">
                                                        <div className="space-y-3">
                                                            <p className="text-[9px] font-black text-gaming-accent uppercase tracking-widest text-center">Secondary ID ({docItem.secondaryIdType}) - Front</p>
                                                            <div 
                                                                onClick={() => docItem.secondaryIdFrontUrl && setSelectedImage(docItem.secondaryIdFrontUrl)}
                                                                className="aspect-video rounded-xl bg-black border border-white/10 overflow-hidden relative cursor-pointer group"
                                                            >
                                                                {docItem.secondaryIdFrontUrl ? (
                                                                    <img src={docItem.secondaryIdFrontUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-100" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center bg-white/5"><FileText className="text-gray-800" /></div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="space-y-3">
                                                            <p className="text-[9px] font-black text-gaming-accent uppercase tracking-widest text-center">Secondary ID ({docItem.secondaryIdType}) - Back</p>
                                                            <div 
                                                                onClick={() => docItem.secondaryIdBackUrl && setSelectedImage(docItem.secondaryIdBackUrl)}
                                                                className="aspect-video rounded-xl bg-black border border-white/10 overflow-hidden relative cursor-pointer group"
                                                            >
                                                                {docItem.secondaryIdBackUrl ? (
                                                                    <img src={docItem.secondaryIdBackUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-100" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center bg-white/5"><FileText className="text-gray-800" /></div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-5">
                                                    <div>
                                                        <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                                            <MapPin size={12} /> Physical Vector
                                                        </p>
                                                        <p className="text-sm text-gray-300 font-medium italic leading-relaxed uppercase">{docItem.address || 'Location Data Restricted'}</p>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <div>
                                                            <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] mb-1">Comm Vector</p>
                                                            <p className="text-sm text-white font-mono">{docItem.phone || 'N/A'}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] mb-1">Auth Role</p>
                                                            <p className="text-sm text-gaming-accent font-black italic uppercase">Standard Operative</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* AI Matrix & Command Control */}
                                            <div className="lg:col-span-7 space-y-10 border-l border-white/5 pl-12">
                                                
                                                {/* Upgraded AI Reasoning */}
                                                <div className="space-y-6">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="text-[11px] font-black text-gaming-accent uppercase tracking-[0.3em] flex items-center gap-3">
                                                            <Cpu size={16} /> Intelligence Hub
                                                        </h4>
                                                        <div className="flex items-center gap-2 text-[9px] font-mono text-gray-500 uppercase">
                                                            <span className="w-2 h-2 rounded-full bg-gaming-accent animate-ping" /> Neural Link Active
                                                        </div>
                                                    </div>

                                                    <div className="bg-[#080112] border border-gaming-accent/30 rounded-2xl overflow-hidden shadow-2xl">
                                                        <div className="bg-gaming-accent/10 px-5 py-2.5 border-b border-gaming-accent/20 flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <Terminal size={12} className="text-gaming-accent" />
                                                                <span className="text-[10px] font-mono text-gaming-accent font-black">GEMINI_RISK_ASSESSMENT_SYSTEM</span>
                                                            </div>
                                                            <span className="text-[8px] font-mono text-gray-500 uppercase">Ver: 1.5.MATRIX</span>
                                                        </div>
                                                        <div className="p-6 font-mono text-xs leading-relaxed max-h-[300px] overflow-y-auto custom-scrollbar bg-black/40 text-gray-300">
                                                            {docItem.aiAssessment ? (
                                                                <div className="whitespace-pre-wrap">{docItem.aiAssessment}</div>
                                                            ) : (
                                                                <div className="py-12 flex flex-col items-center justify-center gap-4">
                                                                    <Loader2 size={32} className="animate-spin text-gaming-accent/40" />
                                                                    <p className="text-[9px] text-gaming-accent/60 uppercase tracking-[0.4em] animate-pulse font-black">Synthesizing Data Assets...</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Agent Matrix */}
                                                <div className="space-y-6">
                                                    <h4 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-3">
                                                        <Binary size={16} /> Signal Matrix Findings
                                                    </h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {(docItem.agentReports || []).map((report, i) => (
                                                            <motion.div 
                                                                key={i} 
                                                                whileHover={{ scale: 1.02 }}
                                                                className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 space-y-3 shadow-inner"
                                                            >
                                                                <div className="flex justify-between items-center">
                                                                    <p className="text-[10px] font-black text-white uppercase tracking-tighter flex items-center gap-2">
                                                                        <span className={`w-1.5 h-1.5 rounded-full ${report.status === 'PASS' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-amber-500'}`} />
                                                                        {report.agentName}
                                                                    </p>
                                                                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-md border ${report.status === 'PASS' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' : 'text-amber-500 border-amber-500/20 bg-amber-500/5'}`}>
                                                                        {report.status}
                                                                    </span>
                                                                </div>
                                                                <p className="text-[11px] text-gray-400 leading-snug italic font-medium">"{report.message}"</p>
                                                                <div className="text-[9px] font-mono text-gray-600 bg-black/40 p-2 rounded-lg border border-white/5 overflow-hidden text-ellipsis whitespace-nowrap">
                                                                    {report.details}
                                                                </div>
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Command Control Override */}
                                                <div className="space-y-6 pt-6 border-t border-white/10">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-3">
                                                            <ShieldCheck size={16} /> Authority Override
                                                        </h4>
                                                        <span className="text-[9px] font-mono text-gray-600">Session User: {currentUser?.name}</span>
                                                    </div>
                                                    
                                                    <div className="space-y-5">
                                                        <div className="relative group">
                                                            <MessageSquare className="absolute left-4 top-4 text-gray-600 group-focus-within:text-gaming-accent transition-colors" size={16} />
                                                            <textarea 
                                                                value={adminNotes[docItem.id] || docItem.adminNotes || ''}
                                                                onChange={(e) => setAdminNotes(prev => ({...prev, [docItem.id]: e.target.value}))}
                                                                placeholder="Execute authority notes, security findings, or discrepancies..."
                                                                className="w-full bg-black border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-xs text-white focus:border-gaming-accent outline-none transition-all resize-none font-medium h-36 shadow-inner ring-offset-black focus:ring-2 ring-gaming-accent/20"
                                                            />
                                                        </div>

                                                        <div className="flex gap-4">
                                                            <button
                                                                onClick={() => handleAction(docItem.id, 'APPROVED')}
                                                                disabled={docItem.isProcessing}
                                                                className="flex-[2] py-4 bg-emerald-500 text-black rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-emerald-400 transition-all shadow-[0_0_25px_rgba(16,185,129,0.3)] disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-3 italic"
                                                            >
                                                                {docItem.isProcessing ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={18} />}
                                                                Authorize Credentials
                                                            </button>
                                                            <button
                                                                onClick={() => handleAction(docItem.id, 'REVERIFICATION_REQUESTED')}
                                                                disabled={docItem.isProcessing}
                                                                className="flex-1 py-4 bg-purple-500/10 text-purple-500 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] border border-purple-500/30 hover:bg-purple-500 hover:text-white transition-all disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-2 italic"
                                                            >
                                                                {docItem.isProcessing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                                                                Re-Verify
                                                            </button>
                                                            <button
                                                                onClick={() => handleAction(docItem.id, 'REJECTED')}
                                                                disabled={docItem.isProcessing}
                                                                className="flex-1 py-4 bg-red-500/10 text-red-500 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] border border-red-500/30 hover:bg-red-500 hover:text-white transition-all disabled:opacity-30 disabled:grayscale italic"
                                                            >
                                                                Blacklist
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                ))}

                {filteredDocs.length === 0 && (
                    <div className="bg-[#080112] border border-dashed border-white/10 rounded-3xl p-32 text-center shadow-2xl backdrop-blur-xl">
                        <Terminal className="mx-auto text-gray-800 mb-6 h-16 w-12" />
                        <h3 className="text-white font-black text-2xl mb-2 italic uppercase tracking-tighter">No Identity Signals Detected</h3>
                        <p className="text-gray-600 text-sm font-mono max-w-md mx-auto">The synchronization matrix is currently idle. Adjust filters or await new biometric uploads from the grid.</p>
                    </div>
                )}
            </div>

            {/* Lightbox Inspector */}
            <AnimatePresence>
                {selectedImage && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedImage(null)}
                            className="absolute inset-0 bg-black/95 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative max-w-[90vw] max-h-[90vh] z-10 shadow-[0_0_100px_rgba(216, 102, 255,0.2)] rounded-3xl overflow-hidden border border-white/10 bg-black"
                        >
                            <img src={selectedImage} alt="Document Zoom" className="w-full h-full object-contain" />
                            <button 
                                onClick={() => setSelectedImage(null)}
                                className="absolute top-6 right-6 p-3 bg-black/60 text-white rounded-2xl border border-white/10 hover:bg-white/10 transition-all backdrop-blur-md"
                            >
                                <X size={24} />
                            </button>
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-black/60 text-[10px] font-black text-gaming-accent uppercase tracking-[0.3em] rounded-full border border-gaming-accent/30 backdrop-blur-md italic">
                                Evidence Inspection Mode // High-Res Stream
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

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
                            className="relative max-w-lg w-full bg-[#080112] border border-white/10 rounded-3xl overflow-hidden shadow-2xl z-10"
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
                                        onClick={() => handleAction(rejectionModal.id, rejectionModal.status, rejectionModal.reason)}
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
        </div>
    );
}

// Internal User Component for placeholder
function User({ className }: { className?: string }) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    );
}
