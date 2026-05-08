import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, ShieldCheck, User, Phone, MapPin, 
    Fingerprint, FileCheck, Loader2, Save 
} from 'lucide-react';
import { KYCData, submitKYC } from '../../services/kyc';

interface AdminKYCModalProps {
    isOpen: boolean;
    onClose: () => void;
    customer: {
        id: string;
        name: string;
        email: string;
        phone: string;
        address: string;
    };
}

export default function AdminKYCModal({ isOpen, onClose, customer }: AdminKYCModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<Partial<KYCData>>({
        fullName: customer.name,
        phone: customer.phone !== 'Not provided' ? customer.phone : '',
        address: customer.address !== 'No address stored' ? customer.address : '',
        drivingLicenseNumber: '',
        secondaryIdType: 'AADHAR',
        secondaryIdNumber: '',
        idFrontUrl: 'MANUAL_ENTRY',
        idBackUrl: 'MANUAL_ENTRY',
        selfieVideoUrl: 'MANUAL_ENTRY',
        livenessCheck: 'PASSED'
    });

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await submitKYC(customer.id, formData as KYCData);
            alert("KYC Record Created Manually");
            onClose();
        } catch (error) {
            console.error(error);
            alert("Failed to save KYC record");
        } finally {
            setIsSubmitting(false);
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
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />
                    
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative w-full max-w-2xl bg-[#080112] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gaming-accent/10 rounded-lg text-gaming-accent">
                                    <ShieldCheck size={20} />
                                </div>
                                <div>
                                    <h3 className="text-white font-black uppercase tracking-widest text-sm">Manual Verification Entry</h3>
                                    <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">User ID: {customer.id}</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Full Legal Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gaming-accent" size={14} />
                                        <input 
                                            required
                                            type="text"
                                            value={formData.fullName}
                                            onChange={e => setFormData({...formData, fullName: e.target.value})}
                                            className="w-full bg-black border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs text-white focus:border-gaming-accent outline-none transition-all font-bold"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Verification Phone</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gaming-accent" size={14} />
                                        <input 
                                            required
                                            type="tel"
                                            value={formData.phone}
                                            onChange={e => setFormData({...formData, phone: e.target.value})}
                                            className="w-full bg-black border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs text-white focus:border-gaming-accent outline-none transition-all font-mono"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Driving License</label>
                                    <div className="relative">
                                        <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 text-gaming-accent" size={14} />
                                        <input 
                                            required
                                            type="text"
                                            placeholder="DL Number"
                                            value={formData.drivingLicenseNumber}
                                            onChange={e => setFormData({...formData, drivingLicenseNumber: e.target.value})}
                                            className="w-full bg-black border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs text-white focus:border-gaming-accent outline-none transition-all font-mono uppercase"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Secondary ID</label>
                                    <div className="flex gap-2">
                                        <select 
                                            value={formData.secondaryIdType}
                                            onChange={e => setFormData({...formData, secondaryIdType: e.target.value})}
                                            className="bg-black border border-white/10 rounded-xl px-2 py-3 text-[10px] text-white focus:border-gaming-accent outline-none font-black uppercase tracking-tighter"
                                        >
                                            <option value="AADHAR">AADHAR</option>
                                            <option value="PAN">PAN</option>
                                            <option value="VOTER">VOTER</option>
                                            <option value="PASSPORT">PASSPORT</option>
                                        </select>
                                        <div className="relative flex-1">
                                            <FileCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-gaming-accent" size={14} />
                                            <input 
                                                required
                                                type="text"
                                                placeholder="ID Number"
                                                value={formData.secondaryIdNumber}
                                                onChange={e => setFormData({...formData, secondaryIdNumber: e.target.value})}
                                                className="w-full bg-black border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs text-white focus:border-gaming-accent outline-none transition-all font-mono uppercase"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Verified Address</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-4 text-gaming-accent" size={14} />
                                    <textarea 
                                        required
                                        rows={3}
                                        value={formData.address}
                                        onChange={e => setFormData({...formData, address: e.target.value})}
                                        className="w-full bg-black border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs text-white focus:border-gaming-accent outline-none transition-all resize-none font-bold"
                                    />
                                </div>
                            </div>

                            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 flex gap-3">
                                <ShieldCheck className="text-amber-500 shrink-0" size={18} />
                                <p className="text-[9px] text-amber-500/80 font-mono leading-relaxed uppercase tracking-wider">
                                    MANUAL OVERRIDE DETECTED. THIS RECORD WILL BE MARKED AS 'ADMIN_VERIFIED' AND BYPASS BIOMETRIC SCAN REQUIREMENTS.
                                </p>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-4 bg-white/5 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-white/10 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-[2] py-4 bg-gaming-accent text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                    {isSubmitting ? 'Syncing...' : 'Inject KYC Record'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

