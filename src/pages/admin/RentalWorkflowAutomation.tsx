import React, { useState, useEffect } from 'react';
import {
  Zap,
  Play,
  Pause,
  ArrowRight,
  Clock,
  Bell,
  Mail,
  Smartphone,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Save,
  Settings,
  Activity,
  DollarSign,
  Calendar,
  LogIn,
  LogOut,
  Shield,
  User,
  Package,
  Wrench,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type WorkflowStep = {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  auto: boolean;
  delayMinutes: number;
  notification: 'email' | 'sms' | 'both' | 'none';
  condition: string;
};

type AutomationRule = {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  threshold: number;
  action: string;
};

const defaultWorkflowSteps: WorkflowStep[] = [
  {
    id: 'booking_confirmed',
    label: 'Booking Confirmed',
    description: 'Customer completes booking & payment',
    icon: <CheckCircle size={16} />,
    enabled: true,
    auto: true,
    delayMinutes: 0,
    notification: 'email',
    condition: 'payment_verified'
  },
  {
    id: 'reminder_24h',
    label: '24h Pickup Reminder',
    description: 'Send reminder before pickup date',
    icon: <Bell size={16} />,
    enabled: true,
    auto: true,
    delayMinutes: 1440,
    notification: 'both',
    condition: '24h_before_start'
  },
  {
    id: 'ready_for_pickup',
    label: 'Ready for Pickup',
    description: 'Console prepared & customer notified',
    icon: <Package size={16} />,
    enabled: true,
    auto: false,
    delayMinutes: 0,
    notification: 'both',
    condition: 'admin_approval'
  },
  {
    id: 'checkout',
    label: 'Check-Out',
    description: 'Console deployed to customer',
    icon: <LogOut size={16} />,
    enabled: true,
    auto: false,
    delayMinutes: 0,
    notification: 'email',
    condition: 'unit_assigned'
  },
  {
    id: 'active_rental',
    label: 'Active Rental',
    description: 'Rental period in progress',
    icon: <Activity size={16} />,
    enabled: true,
    auto: true,
    delayMinutes: 0,
    notification: 'none',
    condition: 'checked_out'
  },
  {
    id: 'return_reminder',
    label: 'Return Reminder',
    description: 'Alert customer about upcoming return',
    icon: <Clock size={16} />,
    enabled: true,
    auto: true,
    delayMinutes: 1440,
    notification: 'both',
    condition: '24h_before_end'
  },
  {
    id: 'overdue_alert',
    label: 'Overdue Alert',
    description: 'Late return detected, penalties applied',
    icon: <AlertTriangle size={16} />,
    enabled: true,
    auto: true,
    delayMinutes: 0,
    notification: 'both',
    condition: 'past_end_date'
  },
  {
    id: 'checkin',
    label: 'Check-In',
    description: 'Console returned & condition assessed',
    icon: <LogIn size={16} />,
    enabled: true,
    auto: false,
    delayMinutes: 0,
    notification: 'email',
    condition: 'condition_verified'
  },
  {
    id: 'deposit_refund',
    label: 'Deposit Refund',
    description: 'Security deposit returned to customer',
    icon: <DollarSign size={16} />,
    enabled: true,
    auto: true,
    delayMinutes: 60,
    notification: 'email',
    condition: 'checkin_complete'
  },
  {
    id: 'completed',
    label: 'Rental Completed',
    description: 'Full cycle complete, unit available',
    icon: <CheckCircle size={16} />,
    enabled: true,
    auto: true,
    delayMinutes: 0,
    notification: 'both',
    condition: 'all_clear'
  }
];

const defaultAutomationRules: AutomationRule[] = [
  {
    id: 'auto_late_penalty',
    label: 'Auto Late Penalty',
    description: 'Apply ₹100/hr penalty for late returns',
    enabled: true,
    threshold: 60,
    action: 'charge_penalty'
  },
  {
    id: 'auto_status_update',
    label: 'Auto Status Updates',
    description: 'Auto-update rental status based on dates',
    enabled: true,
    threshold: 0,
    action: 'update_status'
  },
  {
    id: 'auto_inventory_release',
    label: 'Auto Inventory Release',
    description: 'Release unit back to available after check-in',
    enabled: true,
    threshold: 0,
    action: 'release_unit'
  },
  {
    id: 'auto_maintenance_trigger',
    label: 'Auto Maintenance Trigger',
    description: 'Flag for maintenance if condition is major damage',
    enabled: true,
    threshold: 0,
    action: 'flag_maintenance'
  },
  {
    id: 'auto_deposit_refund',
    label: 'Auto Deposit Refund',
    description: 'Process deposit refund within 60 minutes',
    enabled: true,
    threshold: 60,
    action: 'refund_deposit'
  },
  {
    id: 'auto_cancel_no_show',
    label: 'Auto Cancel No-Show',
    description: 'Cancel & charge if customer doesn\'t pickup within 2h',
    enabled: false,
    threshold: 120,
    action: 'cancel_no_show'
  }
];

export default function RentalWorkflowAutomation() {
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>(defaultWorkflowSteps);
  const [rules, setRules] = useState<AutomationRule[]>(defaultAutomationRules);
  const [activeTab, setActiveTab] = useState<'workflow' | 'rules' | 'monitor'>('workflow');
  const [isSaving, setIsSaving] = useState(false);
  const [monitorLogs, setMonitorLogs] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('rentalWorkflow');
    if (stored) {
      const parsed = JSON.parse(stored);
      setWorkflowSteps(parsed.steps || defaultWorkflowSteps);
      setRules(parsed.rules || defaultAutomationRules);
    }
    setMonitorLogs([
      { time: '14:32:01', event: 'Booking confirmed', rental: '#RNT-0042', status: 'success' },
      { time: '14:32:05', event: 'Payment verified', rental: '#RNT-0042', status: 'success' },
      { time: '14:35:00', event: 'Ready for pickup triggered', rental: '#RNT-0042', status: 'pending' },
      { time: '15:00:00', event: 'Check-out completed', rental: '#RNT-0041', status: 'success' },
      { time: '16:20:00', event: 'Return reminder sent', rental: '#RNT-0039', status: 'success' },
      { time: '18:00:00', event: 'Overdue alert triggered', rental: '#RNT-0038', status: 'warning' },
    ]);
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    localStorage.setItem('rentalWorkflow', JSON.stringify({ steps: workflowSteps, rules }));
    setTimeout(() => setIsSaving(false), 1000);
  };

  const toggleStep = (id: string) => {
    setWorkflowSteps(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const toggleStepAuto = (id: string) => {
    setWorkflowSteps(prev => prev.map(s => s.id === id ? { ...s, auto: !s.auto } : s));
  };

  const updateStep = (id: string, field: keyof WorkflowStep, value: any) => {
    setWorkflowSteps(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const updateRule = (id: string, field: keyof AutomationRule, value: any) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const enabledCount = workflowSteps.filter(s => s.enabled).length;
  const autoCount = workflowSteps.filter(s => s.auto).length;
  const rulesEnabled = rules.filter(r => r.enabled).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-8">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="h-3 w-3 text-gaming-accent animate-pulse" />
            <span className="text-[10px] font-mono text-gaming-accent uppercase tracking-[0.2em]">Rental Workflow Automation</span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tighter uppercase italic">Workflow <span className="text-gaming-accent">Engine</span></h1>
          <p className="text-gray-500 font-mono text-xs mt-1">Automate rental lifecycle from booking to completion.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            {[
              { id: 'workflow', label: 'Workflow', icon: Activity },
              { id: 'rules', label: 'Rules', icon: Settings },
              { id: 'monitor', label: 'Monitor', icon: Bell },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-gaming-accent text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <tab.icon size={14} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-3 rounded-xl bg-white text-black font-bold uppercase tracking-widest hover:bg-gaming-accent hover:text-white transition-all flex items-center gap-2"
          >
            {isSaving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
            Save
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Steps', val: `${enabledCount}/${workflowSteps.length}`, icon: Activity, color: 'text-gaming-accent' },
          { label: 'Auto Steps', val: `${autoCount}`, icon: Zap, color: 'text-emerald-500' },
          { label: 'Rules Active', val: `${rulesEnabled}/${rules.length}`, icon: Settings, color: 'text-amber-500' },
          { label: 'Events Today', val: monitorLogs.length, icon: Bell, color: 'text-blue-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#080112] border border-white/10 rounded-xl p-4 flex items-center gap-4">
            <div className={`p-3 bg-white/5 rounded-xl ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">{stat.label}</p>
              <p className={`text-xl font-black ${stat.color}`}>{stat.val}</p>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'workflow' && (
          <motion.div key="workflow" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
            {/* Visual Flow */}
            <div className="bg-[#080112] border border-white/10 rounded-2xl p-6">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                <Activity size={16} className="text-gaming-accent" /> Rental Lifecycle Flow
              </h3>

              <div className="flex flex-wrap items-center gap-3 justify-center">
                {workflowSteps.map((step, i) => (
                  <React.Fragment key={step.id}>
                    <div className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all min-w-[120px] ${step.enabled ? 'border-gaming-accent bg-gaming-accent/10' : 'border-white/10 bg-white/5 opacity-50'}`}>
                      <div className={step.enabled ? 'text-gaming-accent' : 'text-gray-600'}>
                        {step.icon}
                      </div>
                      <p className="text-[8px] font-bold text-white uppercase mt-2 text-center">{step.label}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {step.auto && <Zap size={8} className="text-emerald-500" />}
                        {step.notification !== 'none' && <Bell size={8} className="text-amber-500" />}
                      </div>
                    </div>
                    {i < workflowSteps.length - 1 && (
                      <ArrowRight size={16} className="text-gray-600" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Step Configuration */}
            <div className="bg-[#080112] border border-white/10 rounded-2xl p-6">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                <Settings size={16} className="text-gaming-accent" /> Step Configuration
              </h3>

              <div className="space-y-4">
                {workflowSteps.map((step) => (
                  <div key={step.id} className={`p-4 rounded-xl border transition-all ${step.enabled ? 'border-white/10 bg-white/[0.02]' : 'border-white/5 bg-white/[0.01] opacity-60'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={step.enabled ? 'text-gaming-accent' : 'text-gray-600'}>{step.icon}</div>
                        <div>
                          <p className="text-sm font-bold text-white uppercase">{step.label}</p>
                          <p className="text-[9px] text-gray-500">{step.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleStepAuto(step.id)}
                          className={`px-2 py-1 rounded text-[8px] font-bold uppercase tracking-widest ${step.auto ? 'bg-emerald-500/20 text-emerald-500' : 'bg-white/5 text-gray-500'}`}
                        >
                          {step.auto ? 'Auto' : 'Manual'}
                        </button>
                        <button
                          onClick={() => toggleStep(step.id)}
                          className={`relative w-10 h-5 rounded-full transition-colors ${step.enabled ? 'bg-gaming-accent/40' : 'bg-white/10'}`}
                        >
                          <div className={`absolute top-1 w-3 h-3 rounded-full transition-transform ${step.enabled ? 'translate-x-6 bg-gaming-accent' : 'translate-x-1 bg-gray-600'}`} />
                        </button>
                      </div>
                    </div>

                    {step.enabled && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 pt-3 border-t border-white/5">
                        <div>
                          <label className="text-[8px] text-gray-500 uppercase font-bold mb-1 block">Notification</label>
                          <select
                            value={step.notification}
                            onChange={(e) => updateStep(step.id, 'notification', e.target.value)}
                            className="w-full bg-black border border-white/10 rounded-lg p-2 text-white text-xs outline-none focus:border-gaming-accent"
                          >
                            <option value="none">None</option>
                            <option value="email">Email Only</option>
                            <option value="sms">SMS Only</option>
                            <option value="both">Email + SMS</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[8px] text-gray-500 uppercase font-bold mb-1 block">Delay (minutes)</label>
                          <input
                            type="number"
                            value={step.delayMinutes}
                            onChange={(e) => updateStep(step.id, 'delayMinutes', Number(e.target.value))}
                            className="w-full bg-black border border-white/10 rounded-lg p-2 text-white text-xs outline-none focus:border-gaming-accent"
                          />
                        </div>
                        <div>
                          <label className="text-[8px] text-gray-500 uppercase font-bold mb-1 block">Condition</label>
                          <input
                            type="text"
                            value={step.condition}
                            onChange={(e) => updateStep(step.id, 'condition', e.target.value)}
                            className="w-full bg-black border border-white/10 rounded-lg p-2 text-white text-xs outline-none focus:border-gaming-accent"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'rules' && (
          <motion.div key="rules" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
            <div className="bg-[#080112] border border-white/10 rounded-2xl p-6">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                <Settings size={16} className="text-gaming-accent" /> Automation Rules
              </h3>

              <div className="space-y-4">
                {rules.map((rule) => (
                  <div key={rule.id} className={`p-4 rounded-xl border transition-all ${rule.enabled ? 'border-white/10 bg-white/[0.02]' : 'border-white/5 bg-white/[0.01] opacity-60'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm font-bold text-white uppercase">{rule.label}</p>
                        <p className="text-[9px] text-gray-500">{rule.description}</p>
                      </div>
                      <button
                        onClick={() => toggleRule(rule.id)}
                        className={`relative w-10 h-5 rounded-full transition-colors ${rule.enabled ? 'bg-gaming-accent/40' : 'bg-white/10'}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 rounded-full transition-transform ${rule.enabled ? 'translate-x-6 bg-gaming-accent' : 'translate-x-1 bg-gray-600'}`} />
                      </button>
                    </div>

                    {rule.enabled && (
                      <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-white/5">
                        <div>
                          <label className="text-[8px] text-gray-500 uppercase font-bold mb-1 block">Threshold (minutes)</label>
                          <input
                            type="number"
                            value={rule.threshold}
                            onChange={(e) => updateRule(rule.id, 'threshold', Number(e.target.value))}
                            className="w-full bg-black border border-white/10 rounded-lg p-2 text-white text-xs outline-none focus:border-gaming-accent"
                          />
                        </div>
                        <div>
                          <label className="text-[8px] text-gray-500 uppercase font-bold mb-1 block">Action</label>
                          <input
                            type="text"
                            value={rule.action}
                            onChange={(e) => updateRule(rule.id, 'action', e.target.value)}
                            className="w-full bg-black border border-white/10 rounded-lg p-2 text-white text-xs outline-none focus:border-gaming-accent"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'monitor' && (
          <motion.div key="monitor" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
            <div className="bg-[#080112] border border-white/10 rounded-2xl p-6">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                <Bell size={16} className="text-gaming-accent" /> Live Event Log
              </h3>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {monitorLogs.map((log, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                    <span className="text-[9px] text-gray-600 font-mono w-20">{log.time}</span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                      log.status === 'success' ? 'bg-emerald-500/10 text-emerald-500' :
                      log.status === 'warning' ? 'bg-amber-500/10 text-amber-500' :
                      'bg-red-500/10 text-red-500'
                    }`}>
                      {log.status}
                    </span>
                    <span className="text-xs text-white font-bold">{log.event}</span>
                    <span className="text-[9px] text-gray-500 font-mono ml-auto">{log.rental}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
