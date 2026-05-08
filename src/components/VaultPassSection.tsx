import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Truck, Clock, Gem, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EditableText } from './Editable';

export default function VaultPassSection() {
    const benefits = [
        { icon: Truck, title: "Zero Delivery Cost", desc: "Priority doorstep deployment on all rentals" },
        { icon: ShieldCheck, title: "Reduced Deposit", desc: "No-collateral access to Legacy & Pro hardware" },
        { icon: Clock, title: "Early Deployment", desc: "48-hour early access to new game titles" },
        { icon: Gem, title: "Vault Protection", desc: "Complimentary damage coverage on all assets" }
    ];

    return (
        <section className="py-24 px-4 sm:px-6 lg:px-8 w-full">
            <div className="relative overflow-hidden bg-[#080112] border border-white/10 group mx-auto" style={{ borderRadius: 'var(--layout-border-radius, 3.5rem)', maxWidth: 'var(--layout-max-width, 1280px)' }}>
                {/* Animated Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-gaming-accent/10 via-transparent to-gaming-secondary/5 opacity-50 group-hover:opacity-100 transition-opacity" />

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2">
                    {/* Left Side: Content */}
                    <div className="p-8 md:p-16 space-y-8">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
                                <Gem size={12} className="text-amber-500" />
                                <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest">
                                    <EditableText pageKey="components" itemKey="vault_pass_badge" defaultText="Premium Membership" />
                                </span>
                            </div>
                            <h2 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter uppercase leading-[0.9]">
                                <EditableText pageKey="components" itemKey="vault_pass_title" defaultText="THE VAULT PASS" />
                            </h2>
                            <p className="text-gray-400 font-mono text-sm max-w-md uppercase tracking-wider">
                                <EditableText pageKey="components" itemKey="vault_pass_subtitle" defaultText="Unlock the ultimate hardware ecosystem with our elite subscription tier. Designed for professional gamers and tech enthusiasts." />
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {benefits.map((item, idx) => (
                                <div key={idx} className="space-y-2">
                                    <div className="flex items-center gap-2 text-white">
                                        <item.icon size={16} className="text-amber-500" />
                                        <span className="text-xs font-bold uppercase tracking-tight">{item.title}</span>
                                    </div>
                                    <p className="text-[10px] text-gray-500 font-mono uppercase">{item.desc}</p>
                                </div>
                            ))}
                        </div>

                        <div className="pt-8">
                            <button className="px-10 py-5 bg-gradient-to-r from-amber-400 to-amber-600 text-black font-black uppercase tracking-widest rounded-2xl flex items-center gap-3 hover:scale-105 transition-all shadow-[0_10px_50px_rgba(251,191,36,0.2)] cursor-not-allowed opacity-75">
                                COMING SOON
                            </button>
                        </div>
                    </div>

                    {/* Right Side: Visual Component */}
                    <div className="relative hidden lg:flex items-center justify-center bg-white/[0.02] border-l border-white/5 overflow-hidden">
                        <div className="absolute inset-0 overflow-hidden">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 blur-[100px] rounded-full animate-pulse" />
                        </div>

                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="relative w-72 h-[450px] bg-gradient-to-b from-[#0c021a] to-black rounded-3xl border border-white/10 shadow-2xl p-8 flex flex-col justify-between"
                        >
                            <div className="flex justify-between items-start">
                                <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                                    <Zap size={20} className="text-amber-500" />
                                </div>
                                <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">NFC_CHIP_ACTIVE</span>
                            </div>

                            <div className="space-y-1">
                                <p className="text-[10px] font-mono text-gray-600 uppercase">Vault Member</p>
                                <p className="text-xl font-bold text-white tracking-widest uppercase italic">MASTER_CHIEF_117</p>
                            </div>

                            <div className="space-y-4">
                                <div className="h-[1px] w-full bg-white/5" />
                                <div className="flex justify-between text-[10px] font-mono">
                                    <span className="text-gray-500 uppercase">Level</span>
                                    <span className="text-amber-500">LEGENDARY (XP: 14,200)</span>
                                </div>
                                <div className="flex justify-between text-[10px] font-mono">
                                    <span className="text-gray-500 uppercase">Valid Thru</span>
                                    <span className="text-white font-bold">12 / 2026</span>
                                </div>
                            </div>

                            {/* Card glow effect */}
                            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none rounded-t-3xl" />
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}


