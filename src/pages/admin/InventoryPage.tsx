import React, { useState } from 'react';
import AdminInventory from './AdminInventory';
import RentalSettingsPage from './RentalSettingsPage';
import { ArrowLeft, Box, LayoutList, Settings2, Tag, Gamepad2 } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';

export default function InventoryPage() {
    const [activeTab, setActiveTab] = useState<'matrix' | 'settings'>('matrix');

    return (
        <div className="space-y-8">
            {/* Breadcrumbs / Back */}
            <div className="flex items-center justify-between">
                <Link 
                    to="/admin" 
                    className="flex items-center space-x-2 text-gray-500 hover:text-gaming-accent transition-colors group"
                >
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-mono uppercase tracking-widest">Return to Command Center</span>
                </Link>
                
                <div className="flex items-center space-x-2">
                    <Box className="h-4 w-4 text-gaming-accent" />
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.3em]">System_Asset_Management</span>
                </div>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
                <div>
                    <div className="flex items-center space-x-2 mb-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-[0.2em]">Inventory Matrix // Online</span>
                    </div>
                    <h1 className="text-5xl font-bold text-white tracking-tighter uppercase italic">
                        Rental <span className="text-gaming-accent">Inventory</span>
                    </h1>
                    <p className="text-gray-500 font-mono text-xs mt-2 max-w-2xl">
                        Real-time hardware asset tracking, health diagnostics, and catalog pricing controls.
                    </p>
                </div>

                {/* Tab Switcher */}
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                    <button
                        onClick={() => setActiveTab('matrix')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                            activeTab === 'matrix' 
                            ? 'bg-gaming-accent text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]' 
                            : 'text-gray-500 hover:text-gray-300'
                        }`}
                    >
                        <LayoutList size={14} />
                        Asset Matrix
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                            activeTab === 'settings' 
                            ? 'bg-gaming-accent text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]' 
                            : 'text-gray-500 hover:text-gray-300'
                        }`}
                    >
                        <Settings2 size={14} />
                        Catalog Controls
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeTab === 'matrix' ? (
                        <AdminInventory />
                    ) : (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2">
                                    <RentalSettingsPage hideHeader />
                                </div>
                                <div className="space-y-6">
                                    <div className="bg-[#080112] border border-gaming-accent/30 rounded-2xl p-6 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                            <Tag className="text-gaming-accent" size={40} />
                                        </div>
                                        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Tag className="text-gaming-accent" size={16} />
                                            Pricing Protocol
                                        </h3>
                                        <p className="text-xs text-gray-400 font-mono leading-relaxed">
                                            Updates to base console rates and controller pricing are propagated globally across all rental nodes immediately upon saving.
                                        </p>
                                    </div>

                                    <div className="bg-[#080112] border border-white/10 rounded-2xl p-6">
                                        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Gamepad2 className="text-gaming-accent" size={16} />
                                            Active Fleet Status
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-mono text-gray-500 uppercase">Total Units</span>
                                                <span className="text-sm font-black text-white font-mono">1,284</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-mono text-gray-500 uppercase">Available</span>
                                                <span className="text-sm font-black text-emerald-500 font-mono">842</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-mono text-gray-500 uppercase">Rented</span>
                                                <span className="text-sm font-black text-blue-500 font-mono">312</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-mono text-gray-500 uppercase">Maintenance</span>
                                                <span className="text-sm font-black text-amber-500 font-mono">130</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Footer Matrix Info */}
            <div className="flex items-center justify-between pt-12 border-t border-white/10 text-[9px] font-mono text-gray-700 uppercase tracking-[0.4em]">
                <span>Asset Database v2.4.0</span>
                <span>All hardware units encrypted and tracked via GPS-Matrix</span>
            </div>
        </div>
    );
}

