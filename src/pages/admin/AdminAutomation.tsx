import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Mail, 
  MessageSquare, 
  Phone, 
  Settings, 
  Save, 
  RefreshCw, 
  Bell, 
  ShieldCheck,
  Activity,
  Terminal,
  Cpu,
  Database,
  HardDrive,
  FileText,
  Layout,
  Globe,
  ArrowUpRight,
  Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { notificationService, DEFAULT_TEMPLATES, NotificationTemplate } from '../../services/notificationService';
import { automationService, DEFAULT_RULES, AutomationRules } from '../../services/automationService';
import { googleAutomationService, AutomationLog } from '../../services/googleAutomationService';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';

const RuleToggle = ({ label, description, enabled, onToggle }: any) => (
  <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-lg hover:border-gaming-accent/20 transition-all group">
    <div>
      <h4 className="text-[10px] font-mono uppercase tracking-widest text-white group-hover:text-gaming-accent transition-colors">{label}</h4>
      <p className="text-[9px] font-mono text-gray-500 uppercase tracking-tighter">{description}</p>
    </div>
    <button 
      onClick={onToggle}
      className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${enabled ? 'bg-gaming-accent/40' : 'bg-white/5'}`}
    >
      <div className={`absolute top-1 left-1 w-3 h-3 rounded-full transition-transform duration-300 ${enabled ? 'translate-x-5 bg-gaming-accent' : 'translate-x-0 bg-gray-600'}`} />
    </button>
  </div>
);

export default function AdminAutomation() {
  const [templates, setTemplates] = useState<NotificationTemplate[]>(notificationService.getTemplates());
  const [rules, setRules] = useState<AutomationRules>(automationService.getRules());
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'workflows' | 'google' | 'templates'>('workflows');

  useEffect(() => {
    const unsub = googleAutomationService.subscribeToLogs((data) => {
      setLogs(data);
    });
    return () => unsub();
  }, []);

  const handleToggleRule = (key: keyof AutomationRules) => {
    const newRules = { ...rules, [key]: !rules[key] };
    automationService.updateRules(newRules);
    setRules(newRules);
  };

  const handleSaveAll = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1000);
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Neural Agent Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gaming-accent/10 rounded-lg">
              <Bot className="h-6 w-6 text-gaming-accent animate-bounce" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Neural Logistics <span className="text-gaming-accent">Agent</span></h1>
              <p className="text-gaming-muted font-mono text-[10px] uppercase tracking-[0.2em]">Autonomous_Synchronization_Core // v4.2.0</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-[#080112] p-1 rounded-xl border border-white/10">
            {[
              { id: 'workflows', label: 'Logic', icon: Cpu },
              { id: 'google', label: 'Google_Ecosystem', icon: Globe },
              { id: 'templates', label: 'Signals', icon: Bell },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  activeTab === tab.id ? "bg-gaming-accent text-black shadow-lg" : "text-gray-500 hover:text-white"
                )}
              >
                <tab.icon size={14} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {activeTab === 'google' && (
              <motion.div
                key="google"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                {/* Google Integration Matrix */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { id: 'gmail', name: 'Gmail_Protocol', desc: 'Auto-transmit mission data to customers', icon: Mail, color: 'text-red-400', bg: 'bg-red-500/10' },
                    { id: 'sheets', name: 'Sheets_Sync', desc: 'Real-time telemetry logging to master grid', icon: FileText, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                    { id: 'drive', name: 'Drive_Vault', desc: 'Automated identity folder provisioning', icon: Database, color: 'text-blue-400', bg: 'bg-blue-500/10' }
                  ].map((service) => (
                    <div key={service.id} className="bg-gaming-card border border-gaming-border p-6 rounded-3xl space-y-4 hover:border-gaming-accent/30 transition-all group">
                      <div className={cn("p-3 rounded-2xl w-fit", service.bg)}>
                        <service.icon className={cn("h-6 w-6", service.color)} />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-widest">{service.name}</h3>
                        <p className="text-[10px] text-gray-500 uppercase font-mono mt-1 leading-relaxed">{service.desc}</p>
                      </div>
                      <div className="pt-4 flex items-center justify-between border-t border-white/5">
                        <span className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[8px] font-mono text-emerald-500 uppercase font-black">Link_Active</span>
                        </span>
                        <Settings size={12} className="text-gray-600 hover:text-white cursor-pointer" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Real-Time Telemetry Log */}
                <div className="bg-gaming-card border border-gaming-border rounded-3xl overflow-hidden shadow-2xl">
                  <div className="p-6 border-b border-white/5 bg-black/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Terminal className="h-4 w-4 text-gaming-accent" />
                      <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Neural_Logistics_Telemetry</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gaming-accent animate-ping" />
                      <span className="text-[8px] font-mono text-gaming-muted uppercase">Listening_For_Inbound_Data</span>
                    </div>
                  </div>
                  <div className="p-4 bg-black/40 min-h-[400px]">
                    <div className="space-y-2">
                      {logs.map((log, i) => (
                        <div key={log.id || i} className="flex items-center gap-4 p-3 bg-white/[0.02] border border-white/5 rounded-xl group hover:bg-white/[0.04] transition-all font-mono">
                          <span className="text-[9px] text-gray-600 shrink-0">{log.timestamp?.toDate ? format(log.timestamp.toDate(), 'HH:mm:ss') : '00:00:00'}</span>
                          <span className={cn(
                            "text-[9px] font-black uppercase px-2 py-0.5 rounded shrink-0",
                            log.service === 'Gmail' ? 'text-red-400 bg-red-400/10' :
                            log.service === 'Sheets' ? 'text-emerald-400 bg-emerald-400/10' :
                            'text-blue-400 bg-blue-400/10'
                          )}>{log.service}</span>
                          <span className="text-[10px] text-white italic tracking-tighter shrink-0">{log.action}</span>
                          <span className="text-[9px] text-gray-500 truncate shrink">» {log.target}</span>
                          <div className="flex-grow" />
                          <span className="text-[8px] text-emerald-500 font-black uppercase bg-emerald-500/10 px-2 py-0.5 rounded">Success</span>
                        </div>
                      ))}
                      {logs.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-32 opacity-20">
                          <RefreshCw className="h-12 w-12 animate-spin-slow mb-4" />
                          <p className="text-[10px] font-mono uppercase tracking-[0.3em]">Calibrating_Neural_Buffers...</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'workflows' && (
              <motion.div
                key="workflows"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="bg-gaming-card border border-gaming-border rounded-3xl p-8 space-y-8">
                  <div className="flex items-center gap-3">
                    <Cpu className="h-5 w-5 text-gaming-accent" />
                    <h2 className="text-xl font-bold text-white uppercase tracking-tight italic">Workflow_Directives</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-gaming-accent uppercase tracking-[0.2em] border-b border-gaming-accent/20 pb-2">E-Commerce Protocols</h4>
                      <RuleToggle 
                        label="Auto Stock Reduction" 
                        description="Decrement inventory count on transaction success" 
                        enabled={rules.autoReduceStock}
                        onToggle={() => handleToggleRule('autoReduceStock')}
                      />
                      <RuleToggle 
                        label="Disable Null Stock" 
                        description="Automatically delist items with zero availability" 
                        enabled={rules.autoDisableOutOfStock}
                        onToggle={() => handleToggleRule('autoDisableOutOfStock')}
                      />
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-gaming-accent uppercase tracking-[0.2em] border-b border-gaming-accent/20 pb-2">Rental Lifecycle</h4>
                      <RuleToggle 
                        label="Date Grid Blocking" 
                        description="Prevent calendar collisions for active assets" 
                        enabled={rules.autoBlockRentalDates}
                        onToggle={() => handleToggleRule('autoBlockRentalDates')}
                      />
                      <RuleToggle 
                        label="Penalty Enforcement" 
                        description="Trigger credit deductions for overdue assets" 
                        enabled={rules.autoApplyLatePenalty}
                        onToggle={() => handleToggleRule('autoApplyLatePenalty')}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Global Agent Control Sidebar */}
        <div className="space-y-6">
          <div className="bg-gaming-card border border-gaming-border rounded-3xl p-8 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Zap className="h-16 w-12 text-gaming-accent" />
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest italic flex items-center gap-2">
              <Settings className="h-4 w-4 text-gaming-accent" />
              Agent_Override
            </h3>
            
            <div className="space-y-4">
              <button 
                onClick={handleSaveAll}
                className="w-full py-4 bg-gaming-accent text-black rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:scale-105 transition-all shadow-[0_15px_30px_rgba(0,240,255,0.2)] flex items-center justify-center gap-3"
              >
                {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Commit_All_Protocols
              </button>
              
              <button className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-white/10 transition-all flex items-center justify-center gap-3">
                <RefreshCw className="h-4 w-4" />
                Force_Full_Sync
              </button>
            </div>

            <div className="pt-6 border-t border-white/5 space-y-4">
              <div className="flex justify-between items-center text-[9px] font-mono text-gray-500 uppercase">
                <span>Neural_Load</span>
                <span className="text-gaming-accent">Low</span>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gaming-accent/40 w-[12%]" />
              </div>
              <p className="text-[8px] text-gaming-muted leading-relaxed font-mono uppercase">
                All automation sub-routines operating within nominal parameters. Neural buffer clear.
              </p>
            </div>
          </div>

          {/* Quick Stats Widget */}
          <div className="bg-gradient-to-br from-gaming-accent/10 to-gaming-secondary/10 border border-gaming-accent/20 rounded-3xl p-8">
            <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-4 italic">Operational_Pulse</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[8px] font-mono text-gray-500 uppercase">Total_Syncs</p>
                <p className="text-xl font-bold text-white">1,242</p>
              </div>
              <div className="space-y-1">
                <p className="text-[8px] font-mono text-gray-500 uppercase">Success_Rate</p>
                <p className="text-xl font-bold text-emerald-500">99.9%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

