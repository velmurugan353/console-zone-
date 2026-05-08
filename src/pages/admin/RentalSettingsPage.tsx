"use client";

import React, { useState } from "react";
import {
    Gamepad2,
    Tag,
    Save,
    RefreshCw,
    LucideIcon
} from "lucide-react";
import { motion } from "framer-motion";
import { getControllerSettings, saveControllerSettings, resetControllerSettings, type ControllerSettings } from '../../services/controller-settings';
import { getCatalogSettings, saveCatalogSettings, resetCatalogSettings, type CatalogSettings } from '../../services/catalog-settings';

export default function RentalSettingsPage({ hideHeader = false }: { hideHeader?: boolean }) {
    // Controller Settings State
    const [controllerSettings, setControllerSettings] = useState<ControllerSettings>(getControllerSettings());

    const handleResetControllerSettings = () => {
        if (confirm('Reset controller settings to defaults?')) {
            resetControllerSettings();
            setControllerSettings(getControllerSettings());
        }
    };

    // Catalog Settings State
    const [catalogSettings, setCatalogSettings] = useState(getCatalogSettings());

    const handleResetCatalogSettings = () => {
        if (confirm('Reset catalog configuration to defaults?')) {
            resetCatalogSettings();
            setCatalogSettings(getCatalogSettings());
        }
    };

    // Save All Settings
    const handleSaveSettings = () => {
        try {
            saveControllerSettings(controllerSettings);
            saveCatalogSettings(catalogSettings);

            const btn = document.getElementById('save-rental-settings');
            if (btn) {
                const originalText = btn.innerText;
                btn.innerText = 'Saved!';
                setTimeout(() => btn.innerText = originalText, 2000);
            }
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    };

    return (
        <div className={`space-y-8 ${!hideHeader ? 'animate-in fade-in duration-500' : ''}`}>
            {/* Header */}
            {!hideHeader && (
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black italic tracking-tighter uppercase">Rental <span className="text-gaming-accent">Management</span></h1>
                        <p className="text-gray-400 text-sm mt-1">Configure console rates, features, and controller pricing.</p>
                    </div>
                    <button
                        id="save-rental-settings"
                        onClick={handleSaveSettings}
                        className="px-6 py-3 rounded-xl bg-white text-black font-bold uppercase tracking-widest hover:bg-gaming-accent hover:text-white transition-all flex items-center gap-2"
                    >
                        <Save size={18} />
                        Save Changes
                    </button>
                </div>
            )}

            {hideHeader && (
                <div className="flex justify-end">
                    <button
                        id="save-rental-settings"
                        onClick={handleSaveSettings}
                        className="px-6 py-3 rounded-xl bg-gaming-accent text-white font-bold uppercase tracking-widest hover:bg-[#9333EA] transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                    >
                        <Save size={18} />
                        Save All Catalog Changes
                    </button>
                </div>
            )}

            <div className="space-y-6">
                {/* Controller Pricing Settings */}
                <ControlSection title="Controller Configuration" icon={<Gamepad2 className="text-gaming-accent" size={20} />}>
                    <div className="space-y-6">
                        {/* Max Quantity */}
                        <div>
                            <label className="text-[10px] text-gray-500 uppercase font-bold mb-2 block">Maximum Controllers Per Rental</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={controllerSettings.maxQuantity}
                                    onChange={(e) => setControllerSettings({ ...controllerSettings, maxQuantity: Number(e.target.value) })}
                                    className="w-24 bg-white/5 border border-white/10 rounded-xl p-3 text-white text-center font-bold outline-none focus:border-gaming-accent"
                                />
                                <p className="text-xs text-gray-400">Customers can select up to this many controllers</p>

                                <button
                                    onClick={handleResetControllerSettings}
                                    className="ml-auto text-xs text-gray-400 hover:text-gaming-accent transition-colors flex items-center gap-1"
                                >
                                    <RefreshCw size={12} />
                                    Reset Defaults
                                </button>
                            </div>
                        </div>

                        {/* Pricing Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(Object.keys(controllerSettings.pricing) as Array<keyof typeof controllerSettings.pricing>).map((platform) => (
                                <div key={platform} className="bg-white/5 border border-white/10 rounded-xl p-4">
                                    <h4 className="text-white font-bold text-sm mb-4 flex items-center gap-2 uppercase">
                                        <Gamepad2 size={16} className={platform.includes('ps') ? 'text-blue-400' : platform.includes('xbox') ? 'text-emerald-400' : 'text-red-400'} />
                                        {platform} Controllers
                                    </h4>
                                    <div className="space-y-3">
                                        {(['DAILY', 'WEEKLY', 'MONTHLY'] as const).map((plan) => (
                                            <div key={plan}>
                                                <label className="text-[9px] text-gray-500 uppercase font-bold mb-1 block">{plan}</label>
                                                <input
                                                    type="number"
                                                    value={controllerSettings.pricing[platform][plan] || 0}
                                                    onChange={(e) => setControllerSettings({
                                                        ...controllerSettings,
                                                        pricing: {
                                                            ...controllerSettings.pricing,
                                                            [platform]: { ...controllerSettings.pricing[platform], [plan]: Number(e.target.value) }
                                                        }
                                                    })}
                                                    className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white text-sm outline-none focus:border-gaming-accent"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </ControlSection>

                {/* Catalog Configuration */}
                <ControlSection title="Catalog Configuration" icon={<Tag className="text-gaming-accent" size={20} />}>
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-[10px] text-gray-500 uppercase font-bold">Base Console Rates & Features</label>
                            <button
                                onClick={handleResetCatalogSettings}
                                className="text-xs text-gray-400 hover:text-gaming-accent transition-colors flex items-center gap-1"
                            >
                                <RefreshCw size={12} />
                                Reset Defaults
                            </button>
                        </div>
                        <div className="grid grid-cols-1 gap-8">
                            {Object.keys(catalogSettings).map(catName => (
                                <div key={catName} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                                    <div className="bg-white/[0.03] p-4 border-b border-white/10 flex items-center justify-between">
                                        <h4 className="text-white font-black text-sm uppercase tracking-widest flex items-center gap-2 italic">
                                            <div className="w-1.5 h-1.5 rounded-full bg-gaming-accent" />
                                            {catName}
                                        </h4>
                                        <div className="flex items-center gap-6">
                                            <div className="flex flex-col items-end">
                                                <span className="text-[8px] text-gray-500 uppercase font-bold">Base Security Deposit</span>
                                                <input
                                                    type="number"
                                                    value={catalogSettings[catName].securityDeposit || 0}
                                                    onChange={(e) => {
                                                        const newVal = Number(e.target.value);
                                                        setCatalogSettings(prev => ({
                                                            ...prev,
                                                            [catName]: { ...prev[catName], securityDeposit: newVal }
                                                        }));
                                                    }}
                                                    className="w-24 bg-black/40 border border-white/10 rounded px-2 py-0.5 text-emerald-400 text-[10px] font-mono outline-none focus:border-emerald-500 text-right"
                                                />
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-[8px] text-gray-500 uppercase font-bold">Matrix Stock Count</span>
                                                <input
                                                    type="number"
                                                    value={catalogSettings[catName].totalStock || 0}
                                                    onChange={(e) => {
                                                        const newVal = Number(e.target.value);
                                                        setCatalogSettings(prev => ({
                                                            ...prev,
                                                            [catName]: { ...prev[catName], totalStock: newVal }
                                                        }));
                                                    }}
                                                    className="w-16 bg-black/40 border border-white/10 rounded px-2 py-0.5 text-gaming-accent text-[10px] font-mono outline-none focus:border-gaming-accent text-right"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {(['daily', 'weekly', 'monthly'] as const).map((plan) => {
                                            const planConfig = (catalogSettings as any)[catName][plan];
                                            if (!planConfig) return null;

                                            return (
                                                <div key={plan} className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-4">
                                                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                                        <label className="text-[10px] text-gaming-accent uppercase font-black tracking-tighter">{plan} Protocol</label>
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-[9px] text-gray-500 font-mono italic">Rate:</span>
                                                            <input
                                                                type="number"
                                                                value={planConfig.price}
                                                                onChange={(e) => {
                                                                    const newVal = Number(e.target.value);
                                                                    setCatalogSettings(prev => ({
                                                                        ...prev,
                                                                        [catName]: {
                                                                            ...prev[catName],
                                                                            [plan]: {
                                                                                ...prev[catName][plan],
                                                                                price: newVal
                                                                            }
                                                                        }
                                                                    }));
                                                                }}
                                                                className="w-20 bg-transparent text-white text-xs font-black font-mono outline-none focus:text-gaming-accent text-right"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-[8px] text-gray-500 uppercase font-black mb-2 block">Feature Set (Matrix Layout)</label>
                                                        <textarea
                                                            rows={5}
                                                            value={planConfig.features.join('\n')}
                                                            onChange={(e) => {
                                                                const newFeatures = e.target.value.split('\n');
                                                                setCatalogSettings(prev => ({
                                                                    ...prev,
                                                                    [catName]: {
                                                                        ...prev[catName],
                                                                        [plan]: {
                                                                            ...prev[catName][plan],
                                                                            features: newFeatures
                                                                        }
                                                                    }
                                                                }));
                                                            }}
                                                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white text-[10px] outline-none focus:border-gaming-accent resize-none font-mono leading-relaxed"
                                                            placeholder="Enter one feature per line..."
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </ControlSection>
            </div>
        </div>
    );
}

function ControlSection({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) {
    return (
        <div className="bg-[#080112] border border-white/10 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                {icon}
            </div>
            <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
                {icon} {title}
            </h3>
            {children}
        </div>
    );
}

