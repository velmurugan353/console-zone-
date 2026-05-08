import React, { useState } from 'react';
import {
  ShoppingBag,
  Box,
  Settings,
  Activity,
  ShieldCheck,
  Database,
  RefreshCw,
  Zap,
  Power,
  Lock,
  Unlock,
  Cpu,
  Globe,
  Server,
  Terminal,
  Eye,
  TrendingUp,
  Bell,
  ToggleRight,
  Scale,
  Clock,
  QrCode,
  Camera,
  ClipboardCheck,
  Package,
  ShieldCheck as Shield
} from 'lucide-react';

const MatrixToggle = ({ label, description, icon: Icon, enabled, onToggle }: any) => (
  <div className="bg-[#080112] border border-white/5 p-4 rounded-lg flex items-center justify-between group hover:border-gaming-accent/30 transition-all">
    <div className="flex items-center space-x-4">
      <div className={`p-2 rounded bg-white/5 border border-white/5 group-hover:border-gaming-accent/20 transition-colors`}>
        <Icon className={`h-4 w-4 ${enabled ? 'text-gaming-accent' : 'text-gray-600'}`} />
      </div>
      <div>
        <h4 className="text-[10px] font-mono uppercase tracking-widest text-white">{label}</h4>
        <p className="text-[9px] font-mono text-gray-500 uppercase tracking-tighter">{description}</p>
      </div>
    </div>
    <button
      onClick={onToggle}
      className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${enabled ? 'bg-gaming-accent/40' : 'bg-white/5'}`}
    >
      <div className={`absolute top-1 left-1 w-3 h-3 rounded-full transition-transform duration-300 ${enabled ? 'translate-x-5 bg-gaming-accent' : 'translate-x-0 bg-gray-600'}`} />
    </button>
  </div>
);

const ProtocolCard = ({ title, status, load, icon: Icon }: any) => (
  <div className="bg-[#080112] border border-white/5 p-4 rounded-lg relative overflow-hidden group">
    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
      <Icon className="h-12 w-12 text-gaming-accent" />
    </div>
    <div className="relative z-10">
      <h4 className="text-[9px] font-mono uppercase tracking-[0.2em] text-gray-500 mb-1">{title}</h4>
      <div className="flex items-center space-x-2 mb-3">
        <div className={`h-1.5 w-1.5 rounded-full ${status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
        <span className="text-xs font-mono text-white uppercase tracking-tighter">{status}</span>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-[8px] font-mono text-gray-600">
          <span>LOAD_INDEX</span>
          <span>{load}%</span>
        </div>
        <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-gaming-accent/50" style={{ width: `${load}%` }} />
        </div>
      </div>
    </div>
  </div>
);

export default function AdminControls() {
  const [features, setFeatures] = useState({
    rentals: true,
    sales: true,
    kyc: true,
    inventory: true,
    analytics: true,
    payments: true,
    coupons: true,
    dynamicPricing: true,
    stockAlerts: true,
    autoAvailability: true,
    latePenalties: true,
    rentalReminders: true,
    roiTracking: true,
    autoMaintenance: true,
    qrScanning: true,
    kittingProtocols: true,
    conditionEvidence: true
  });

  const [masterSwitch, setMasterSwitch] = useState(true);

  const toggleFeature = (key: keyof typeof features) => {
    setFeatures(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleAll = () => {
    const newState = !masterSwitch;
    setMasterSwitch(newState);
    setFeatures({
      rentals: newState,
      sales: newState,
      kyc: newState,
      inventory: newState,
      analytics: newState,
      payments: newState,
      coupons: newState,
      dynamicPricing: newState,
      stockAlerts: newState,
      autoAvailability: newState,
      latePenalties: newState,
      rentalReminders: newState,
      roiTracking: newState,
      autoMaintenance: newState,
      qrScanning: newState,
      kittingProtocols: newState,
      conditionEvidence: newState
    });
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-8">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="h-3 w-3 text-gaming-accent animate-pulse" />
            <span className="text-[10px] font-mono text-gaming-accent uppercase tracking-[0.2em]">Root Access // Control Center</span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tighter uppercase italic">System <span className="text-gaming-accent">Controls</span></h1>
          <p className="text-gray-500 font-mono text-xs mt-1">Global Override & Feature Management Protocols</p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right hidden md:block">
            <p className="text-[10px] font-mono text-gray-500 uppercase">Security Level</p>
            <p className="text-xs font-mono text-emerald-500 uppercase tracking-widest">Maximum // Alpha-9</p>
          </div>
          <button
            onClick={toggleAll}
            className={`px-6 py-3 rounded border transition-all flex items-center space-x-3 group ${masterSwitch
              ? 'bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20'
              }`}
          >
            <Power className="h-4 w-4" />
            <span className="text-xs font-mono uppercase tracking-widest font-bold">
              {masterSwitch ? 'Initiate Global Freeze' : 'Enable All Systems'}
            </span>
          </button>
        </div>
      </div>

      {/* Feature Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#080112] border border-white/10 rounded-lg overflow-hidden">
            <div className="p-4 bg-white/[0.02] border-b border-white/10 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Terminal className="h-4 w-4 text-gaming-accent" />
                <h3 className="text-xs font-mono uppercase tracking-widest text-white">Feature Matrix // Functional Nodes</h3>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[9px] font-mono text-gray-500 uppercase">Status:</span>
                <span className={`text-[9px] font-mono uppercase ${masterSwitch ? 'text-emerald-500' : 'text-red-500'}`}>
                  {masterSwitch ? 'Full_Operational' : 'System_Suspended'}
                </span>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <MatrixToggle
                label="Rental Engine"
                description="Core rental logic & booking protocols"
                icon={Activity}
                enabled={features.rentals}
                onToggle={() => toggleFeature('rentals')}
              />
              <MatrixToggle
                label="Sales Protocol"
                description="Direct purchase & checkout systems"
                icon={ShoppingBag}
                enabled={features.sales}
                onToggle={() => toggleFeature('sales')}
              />
              <MatrixToggle
                label="Identity Vault"
                description="KYC verification & user validation"
                icon={ShieldCheck}
                enabled={features.kyc}
                onToggle={() => toggleFeature('kyc')}
              />
              <MatrixToggle
                label="Inventory Sync"
                description="Real-time stock & fleet tracking"
                icon={Box}
                enabled={features.inventory}
                onToggle={() => toggleFeature('inventory')}
              />
              <MatrixToggle
                label="Analytics Core"
                description="Data mining & performance metrics"
                icon={Database}
                enabled={features.analytics}
                onToggle={() => toggleFeature('analytics')}
              />
              <MatrixToggle
                label="Payment Gateway"
                description="Transaction processing & escrow"
                icon={Globe}
                enabled={features.payments}
                onToggle={() => toggleFeature('payments')}
              />
              <MatrixToggle
                label="Coupon Engine"
                description="Discount logic & promo validation"
                icon={Zap}
                enabled={features.coupons}
                onToggle={() => toggleFeature('coupons')}
              />
              <MatrixToggle
                label="Dynamic Pricing"
                description="Auto-adjust PS4/PS5 rates within hysteresis bands"
                icon={TrendingUp}
                enabled={features.dynamicPricing}
                onToggle={() => toggleFeature('dynamicPricing')}
              />
              <MatrixToggle
                label="Smart Stock Alerts"
                description="Low-stock notifications with hysteresis buffering"
                icon={Bell}
                enabled={features.stockAlerts}
                onToggle={() => toggleFeature('stockAlerts')}
              />
              <MatrixToggle
                label="Auto-Availability"
                description="Auto-disable out-of-stock controllers"
                icon={ToggleRight}
                enabled={features.autoAvailability}
                onToggle={() => toggleFeature('autoAvailability')}
              />
              <MatrixToggle
                label="Asset ROI Tracking"
                description="Financial yield & depreciation metrics"
                icon={TrendingUp}
                enabled={features.roiTracking}
                onToggle={() => toggleFeature('roiTracking')}
              />
              <MatrixToggle
                label="Maintenance Cycles"
                description="Intelligent auto-trigger inspection logic"
                icon={RefreshCw}
                enabled={features.autoMaintenance}
                onToggle={() => toggleFeature('autoMaintenance')}
              />
              <MatrixToggle
                label="QR Scan Protocols"
                description="Physical check-in/out verification active"
                icon={QrCode}
                enabled={features.qrScanning}
                onToggle={() => toggleFeature('qrScanning')}
              />
              <MatrixToggle
                label="Kitting Protocol"
                description="Accessory loss prevention & kit validation"
                icon={ClipboardCheck}
                enabled={features.kittingProtocols}
                onToggle={() => toggleFeature('kittingProtocols')}
              />
              <MatrixToggle
                label="Condition Evidence"
                description="Visual post-return evidence log enforcement"
                icon={Camera}
                enabled={features.conditionEvidence}
                onToggle={() => toggleFeature('conditionEvidence')}
              />
              <MatrixToggle
                label="Penalty Enforcement"
                description="Automatically apply fines for late returns"
                icon={Scale}
                enabled={features.latePenalties}
                onToggle={() => toggleFeature('latePenalties')}
              />
              <MatrixToggle
                label="Rental Reminders"
                description="Send SMS/Email for upcoming returns"
                icon={Clock}
                enabled={features.rentalReminders}
                onToggle={() => toggleFeature('rentalReminders')}
              />
            </div>
          </div>

          {/* System Logs */}
          <div className="bg-[#080112] border border-white/10 rounded-lg overflow-hidden">
            <div className="p-4 bg-white/[0.02] border-b border-white/10 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Server className="h-4 w-4 text-gaming-accent" />
                <h3 className="text-xs font-mono uppercase tracking-widest text-white">System Event Logs</h3>
              </div>
              <button className="text-[9px] font-mono text-gaming-accent hover:text-white uppercase tracking-widest">Clear Buffer</button>
            </div>
            <div className="p-4 font-mono text-[10px] space-y-2 max-h-[200px] overflow-y-auto">
              <p className="text-gray-500"><span className="text-gaming-accent">[03:14:22]</span> AUTH_PROTOCOL_INIT: Identity Vault synchronized successfully.</p>
              <p className="text-gray-500"><span className="text-gaming-accent">[03:14:25]</span> INVENTORY_SYNC: Fleet Unit PS5-001 reported 98% health.</p>
              <p className="text-emerald-500/70"><span className="text-gaming-accent">[03:15:01]</span> SYSTEM_STATUS: All nodes reporting optimal performance.</p>
              <p className="text-gray-500"><span className="text-gaming-accent">[03:15:12]</span> RENTAL_ENGINE: New booking request received for Asset #NSW-112.</p>
              <p className="text-gray-500"><span className="text-gaming-accent">[03:16:02]</span> PAYMENT_GATEWAY: Transaction #TXN-9928 processed successfully.</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Protocol Status */}
          <div className="bg-[#080112] border border-white/10 rounded-lg p-6">
            <h3 className="text-xs font-mono uppercase tracking-widest text-white mb-6">Deep Inventory Protocols</h3>
            <div className="grid grid-cols-1 gap-4">
              <ProtocolCard title="Fleet_Health" status="Active" load={92} icon={Cpu} />
              <ProtocolCard title="Asset_Tracking" status="Active" load={45} icon={Globe} />
              <ProtocolCard title="Maintenance_Queue" status="Active" load={12} icon={RefreshCw} />
            </div>
          </div>

          {/* Security Protocols */}
          <div className="bg-[#080112] border border-white/10 rounded-lg p-6">
            <h3 className="text-xs font-mono uppercase tracking-widest text-white mb-6">Security Protocols</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded">
                <div className="flex items-center space-x-3">
                  <Lock className="h-4 w-4 text-emerald-500" />
                  <span className="text-[10px] font-mono text-white uppercase">Firewall Status</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-500 uppercase">Hardened</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded">
                <div className="flex items-center space-x-3">
                  <Unlock className="h-4 w-4 text-amber-500" />
                  <span className="text-[10px] font-mono text-white uppercase">External API</span>
                </div>
                <span className="text-[10px] font-mono text-amber-500 uppercase">Restricted</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded">
                <div className="flex items-center space-x-3">
                  <Eye className="h-4 w-4 text-gaming-accent" />
                  <span className="text-[10px] font-mono text-white uppercase">Traffic Monitor</span>
                </div>
                <span className="text-[10px] font-mono text-gaming-accent uppercase">Active</span>
              </div>
            </div>
            <button className="w-full mt-6 py-2 bg-gaming-accent text-black font-bold rounded text-[10px] font-mono uppercase tracking-widest hover:bg-[#9333EA] transition-all">
              Run Global Security Audit
            </button>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-gaming-accent/10 to-transparent border border-gaming-accent/20 rounded-lg p-6">
            <h3 className="text-xs font-mono uppercase tracking-widest text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full py-2 bg-white/5 border border-white/10 rounded text-[9px] font-mono uppercase tracking-widest text-white hover:bg-white/10 transition-all text-left px-4 flex items-center justify-between group">
                <span>Flush System Cache</span>
                <RefreshCw className="h-3 w-3 text-gray-500 group-hover:rotate-180 transition-transform duration-500" />
              </button>
              <button className="w-full py-2 bg-white/5 border border-white/10 rounded text-[9px] font-mono uppercase tracking-widest text-white hover:bg-white/10 transition-all text-left px-4 flex items-center justify-between group">
                <span>Re-Index Database</span>
                <Database className="h-3 w-3 text-gray-500 group-hover:scale-110 transition-transform" />
              </button>
              <button className="w-full py-2 bg-white/5 border border-white/10 rounded text-[9px] font-mono uppercase tracking-widest text-white hover:bg-white/10 transition-all text-left px-4 flex items-center justify-between group">
                <span>Broadcast System Alert</span>
                <Zap className="h-3 w-3 text-gray-500 group-hover:text-yellow-500 transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
