import React, { useState, useEffect } from 'react';
import {
  Mail,
  Smartphone,
  MessageSquare,
  Bell,
  Settings,
  Save,
  RefreshCw,
  Activity,
  Send,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Edit,
  Zap,
  Filter,
  Search,
  BarChart3,
  Users,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { notificationWorkflowService, NotificationTemplate, NotificationLog, ChannelConfig, NotificationSettings } from '../../services/notificationWorkflow';

export default function NotificationWorkflowPage() {
  const [activeTab, setActiveTab] = useState<'templates' | 'channels' | 'logs' | 'settings'>('templates');
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>(notificationWorkflowService.getSettings());
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<NotificationLog | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setTemplates(notificationWorkflowService.getTemplates());
    setSettings(notificationWorkflowService.getSettings());
    setLogs(notificationWorkflowService.getLogs());
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      loadData();
      setIsSaving(false);
    }, 1000);
  };

  const handleToggleTemplate = (id: string) => {
    notificationWorkflowService.toggleTemplate(id);
    loadData();
  };

  const handleToggleChannel = (id: string) => {
    notificationWorkflowService.toggleChannel(id);
    loadData();
  };

  const handleUpdateChannel = (id: string, updates: Partial<ChannelConfig>) => {
    notificationWorkflowService.updateChannel(id, updates);
    loadData();
  };

  const handleUpdateSettings = (updates: Partial<NotificationSettings>) => {
    notificationWorkflowService.updateSettings(updates);
    setSettings(notificationWorkflowService.getSettings());
  };

  const handleSaveTemplate = () => {
    if (!editingTemplate) return;
    notificationWorkflowService.updateTemplate(editingTemplate.id, editingTemplate);
    setEditingTemplate(null);
    loadData();
  };

  const handleTestNotification = async (template: NotificationTemplate) => {
    const testData = {
      customerId: 'TEST-001',
      customerName: 'Test User',
      customerEmail: 'test@example.com',
      customerPhone: '+919876543210',
      productName: 'PlayStation 5',
      startDate: '2026-04-10',
      endDate: '2026-04-15',
      totalPrice: 2500,
      deposit: 5000,
      rentalId: 'TEST-RNT-001',
      unitId: 'PS5-001',
      checkOutAt: new Date().toLocaleString(),
      condition: 'good',
      lateFee: 0,
      repairCost: 0,
      totalCharges: 0,
      reason: 'Test notification',
      refundStatus: 'Refund processed'
    };

    const result = await notificationWorkflowService.triggerWorkflow(template.trigger, testData);
    if (result) {
      loadData();
      alert(`Test notification sent via ${result.channels.join(', ')}`);
    }
  };

  const filteredLogs = logs.filter(l => {
    const matchesSearch =
      l.customerName.toLowerCase().includes(search.toLowerCase()) ||
      l.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
      l.templateName.toLowerCase().includes(search.toLowerCase()) ||
      l.id.toLowerCase().includes(search.toLowerCase());
    const matchesChannel = channelFilter === 'all' || l.channels.includes(channelFilter as any);
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchesSearch && matchesChannel && matchesStatus;
  });

  const stats = notificationWorkflowService.getStats();

  const channelIcons: Record<string, React.ReactNode> = {
    email: <Mail size={14} />,
    sms: <Smartphone size={14} />,
    whatsapp: <MessageSquare size={14} />,
    inapp: <Bell size={14} />
  };

  const channelColors: Record<string, string> = {
    email: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    sms: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    whatsapp: 'text-green-400 bg-green-400/10 border-green-400/20',
    inapp: 'text-purple-400 bg-purple-400/10 border-purple-400/20'
  };

  const statusColors: Record<string, string> = {
    sent: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    delivered: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    opened: 'text-green-400 bg-green-400/10 border-green-400/20',
    failed: 'text-red-400 bg-red-400/10 border-red-400/20',
    pending: 'text-amber-400 bg-amber-400/10 border-amber-400/20'
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-8">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="h-3 w-3 text-gaming-accent animate-pulse" />
            <span className="text-[10px] font-mono text-gaming-accent uppercase tracking-[0.2em]">Notification Workflow Engine</span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tighter uppercase italic">Notification <span className="text-gaming-accent">Center</span></h1>
          <p className="text-gray-500 font-mono text-xs mt-1">Email, SMS, WhatsApp & In-App automation.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            {[
              { id: 'templates', label: 'Templates', icon: Edit },
              { id: 'channels', label: 'Channels', icon: Send },
              { id: 'logs', label: 'Logs', icon: Activity },
              { id: 'settings', label: 'Settings', icon: Settings },
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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Sent', val: stats.total, icon: Send, color: 'text-gaming-accent' },
          { label: 'Delivered', val: stats.sent, icon: CheckCircle, color: 'text-emerald-500' },
          { label: 'Failed', val: stats.failed, icon: XCircle, color: 'text-red-500' },
          { label: 'Today', val: stats.todayCount, icon: Calendar, color: 'text-blue-500' },
          { label: 'Success Rate', val: `${stats.successRate}%`, icon: BarChart3, color: 'text-amber-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#080112] border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <stat.icon size={16} className={stat.color} />
            </div>
            <p className="text-[8px] text-gray-500 uppercase font-bold tracking-widest">{stat.label}</p>
            <p className={`text-xl font-black ${stat.color}`}>{stat.val}</p>
          </div>
        ))}
      </div>

      {/* Channel Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(['email', 'sms', 'whatsapp', 'inapp'] as const).map((ch) => (
          <div key={ch} className="bg-[#080112] border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-2 rounded-lg ${channelColors[ch]}`}>
                {channelIcons[ch]}
              </div>
              <div>
                <p className="text-xs font-bold text-white uppercase">{ch}</p>
                <p className="text-[8px] text-gray-500">{stats.byChannel[ch] || 0} sent</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[8px] text-gray-500 uppercase">Status</span>
              <span className={`text-[8px] font-bold uppercase ${settings.channels.find(c => c.id === ch)?.enabled ? 'text-emerald-500' : 'text-red-500'}`}>
                {settings.channels.find(c => c.id === ch)?.enabled ? 'Active' : 'Disabled'}
              </span>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'templates' && (
          <motion.div key="templates" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
            <div className="bg-[#080112] border border-white/10 rounded-2xl p-6">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                <Edit size={16} className="text-gaming-accent" /> Notification Templates
              </h3>

              <div className="space-y-3">
                {templates.map((template) => (
                  <div key={template.id} className={`p-4 rounded-xl border transition-all ${template.enabled ? 'border-white/10 bg-white/[0.02]' : 'border-white/5 bg-white/[0.01] opacity-60'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="text-sm font-bold text-white uppercase">{template.name}</p>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase border ${template.category === 'Transactional' ? 'text-blue-400 bg-blue-400/10 border-blue-400/20' : 'text-gray-400 bg-gray-400/10 border-gray-400/20'}`}>
                            {template.category}
                          </span>
                        </div>
                        <p className="text-[9px] text-gray-500 font-mono">Trigger: {template.trigger}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTestNotification(template)}
                          className="px-2 py-1 rounded text-[8px] font-bold uppercase tracking-widest bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                        >
                          Test
                        </button>
                        <button
                          onClick={() => setEditingTemplate({ ...template })}
                          className="px-2 py-1 rounded text-[8px] font-bold uppercase tracking-widest bg-gaming-accent/10 text-gaming-accent hover:bg-gaming-accent/20"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleTemplate(template.id)}
                          className={`relative w-10 h-5 rounded-full transition-colors ${template.enabled ? 'bg-gaming-accent/40' : 'bg-white/10'}`}
                        >
                          <div className={`absolute top-1 w-3 h-3 rounded-full transition-transform ${template.enabled ? 'translate-x-6 bg-gaming-accent' : 'translate-x-1 bg-gray-600'}`} />
                        </button>
                      </div>
                    </div>

                    {template.enabled && (
                      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-white/5">
                        {template.channels.map((ch) => (
                          <span key={ch} className={`flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-bold uppercase border ${channelColors[ch]}`}>
                            {channelIcons[ch]}
                            {ch}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'channels' && (
          <motion.div key="channels" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
            <div className="bg-[#080112] border border-white/10 rounded-2xl p-6">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                <Send size={16} className="text-gaming-accent" /> Channel Configuration
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {settings.channels.map((channel) => (
                  <div key={channel.id} className={`p-6 rounded-xl border transition-all ${channel.enabled ? 'border-white/10 bg-white/[0.02]' : 'border-white/5 bg-white/[0.01] opacity-60'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl ${channelColors[channel.id]}`}>
                          {channelIcons[channel.id]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white uppercase">{channel.name}</p>
                          <p className="text-[9px] text-gray-500">{channel.provider}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggleChannel(channel.id)}
                        className={`relative w-10 h-5 rounded-full transition-colors ${channel.enabled ? 'bg-gaming-accent/40' : 'bg-white/10'}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 rounded-full transition-transform ${channel.enabled ? 'translate-x-6 bg-gaming-accent' : 'translate-x-1 bg-gray-600'}`} />
                      </button>
                    </div>

                    {channel.enabled && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-[8px] text-gray-500 uppercase font-bold mb-1 block">API Key</label>
                          <input
                            type="password"
                            value={channel.apiKey}
                            onChange={(e) => handleUpdateChannel(channel.id, { apiKey: e.target.value })}
                            className="w-full bg-black border border-white/10 rounded-lg p-2 text-white text-xs outline-none focus:border-gaming-accent"
                            placeholder="sk-..."
                          />
                        </div>
                        {channel.id === 'email' && (
                          <div>
                            <label className="text-[8px] text-gray-500 uppercase font-bold mb-1 block">From Address</label>
                            <input
                              type="text"
                              value={channel.fromAddress}
                              onChange={(e) => handleUpdateChannel(channel.id, { fromAddress: e.target.value })}
                              className="w-full bg-black border border-white/10 rounded-lg p-2 text-white text-xs outline-none focus:border-gaming-accent"
                              placeholder="noreply@consolezone.com"
                            />
                          </div>
                        )}
                        {(channel.id === 'sms' || channel.id === 'whatsapp') && (
                          <div>
                            <label className="text-[8px] text-gray-500 uppercase font-bold mb-1 block">From Phone</label>
                            <input
                              type="text"
                              value={channel.fromPhone}
                              onChange={(e) => handleUpdateChannel(channel.id, { fromPhone: e.target.value })}
                              className="w-full bg-black border border-white/10 rounded-lg p-2 text-white text-xs outline-none focus:border-gaming-accent"
                              placeholder="+91XXXXXXXXXX"
                            />
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[8px] text-gray-500 uppercase font-bold mb-1 block">Rate Limit/hr</label>
                            <input
                              type="number"
                              value={channel.rateLimit}
                              onChange={(e) => handleUpdateChannel(channel.id, { rateLimit: Number(e.target.value) })}
                              className="w-full bg-black border border-white/10 rounded-lg p-2 text-white text-xs outline-none focus:border-gaming-accent"
                            />
                          </div>
                          <div>
                            <label className="text-[8px] text-gray-500 uppercase font-bold mb-1 block">Daily Limit</label>
                            <input
                              type="number"
                              value={channel.dailyLimit}
                              onChange={(e) => handleUpdateChannel(channel.id, { dailyLimit: Number(e.target.value) })}
                              className="w-full bg-black border border-white/10 rounded-lg p-2 text-white text-xs outline-none focus:border-gaming-accent"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] text-gray-500 uppercase font-bold">Test Mode</span>
                          <button
                            onClick={() => handleUpdateChannel(channel.id, { testMode: !channel.testMode })}
                            className={`relative w-10 h-5 rounded-full transition-colors ${channel.testMode ? 'bg-amber-500/40' : 'bg-white/10'}`}
                          >
                            <div className={`absolute top-1 w-3 h-3 rounded-full transition-transform ${channel.testMode ? 'translate-x-6 bg-amber-500' : 'translate-x-1 bg-gray-600'}`} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'logs' && (
          <motion.div key="logs" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 bg-[#080112] p-4 rounded-2xl border border-white/10">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search logs (Customer, Email, Template, ID)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-black border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-gaming-accent w-full"
                />
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={channelFilter}
                  onChange={(e) => setChannelFilter(e.target.value)}
                  className="bg-black border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-gaming-accent"
                >
                  <option value="all">All Channels</option>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="inapp">In-App</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-black border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-gaming-accent"
                >
                  <option value="all">All Status</option>
                  <option value="sent">Sent</option>
                  <option value="delivered">Delivered</option>
                  <option value="opened">Opened</option>
                  <option value="failed">Failed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            {/* Logs Table */}
            <div className="bg-[#080112] border border-white/10 rounded-2xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-white/[0.02] text-gray-500 text-[10px] font-mono uppercase tracking-widest border-b border-white/5">
                  <tr>
                    <th className="px-4 py-3">Time</th>
                    <th className="px-4 py-3">Template</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Channels</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs font-mono text-gray-400">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="px-4 py-3 text-[9px] text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-white font-bold text-[9px]">{log.templateName}</td>
                      <td className="px-4 py-3">
                        <p className="text-white text-xs">{log.customerName}</p>
                        <p className="text-gray-500 text-[9px]">{log.customerEmail}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {log.channels.map((ch) => (
                            <span key={ch} className={`flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-bold uppercase border ${channelColors[ch]}`}>
                              {channelIcons[ch]}
                              {ch}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase border ${statusColors[log.status] || statusColors.pending}`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="p-1.5 hover:bg-gaming-accent/10 rounded text-gray-600 hover:text-gaming-accent transition-colors"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredLogs.length === 0 && (
                <div className="text-center py-20 opacity-50 italic uppercase tracking-widest text-[10px] text-gray-500">
                  No notification logs found
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div key="settings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
            <div className="bg-[#080112] border border-white/10 rounded-2xl p-6">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                <Settings size={16} className="text-gaming-accent" /> Global Settings
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-[10px] text-gray-500 uppercase font-bold">Delivery</h4>
                  <div>
                    <label className="text-[8px] text-gray-500 uppercase font-bold mb-1 block">Retry Attempts</label>
                    <input
                      type="number"
                      value={settings.retryAttempts}
                      onChange={(e) => handleUpdateSettings({ retryAttempts: Number(e.target.value) })}
                      className="w-full bg-black border border-white/10 rounded-lg p-2 text-white text-xs outline-none focus:border-gaming-accent"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] text-gray-500 uppercase font-bold mb-1 block">Retry Delay (minutes)</label>
                    <input
                      type="number"
                      value={settings.retryDelayMinutes}
                      onChange={(e) => handleUpdateSettings({ retryDelayMinutes: Number(e.target.value) })}
                      className="w-full bg-black border border-white/10 rounded-lg p-2 text-white text-xs outline-none focus:border-gaming-accent"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] text-gray-500 uppercase font-bold mb-1 block">Batch Size</label>
                    <input
                      type="number"
                      value={settings.batchSize}
                      onChange={(e) => handleUpdateSettings({ batchSize: Number(e.target.value) })}
                      className="w-full bg-black border border-white/10 rounded-lg p-2 text-white text-xs outline-none focus:border-gaming-accent"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] text-gray-500 uppercase font-bold">Quiet Hours</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[8px] text-gray-500 uppercase font-bold mb-1 block">Start</label>
                      <input
                        type="time"
                        value={settings.quietHoursStart}
                        onChange={(e) => handleUpdateSettings({ quietHoursStart: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded-lg p-2 text-white text-xs outline-none focus:border-gaming-accent"
                      />
                    </div>
                    <div>
                      <label className="text-[8px] text-gray-500 uppercase font-bold mb-1 block">End</label>
                      <input
                        type="time"
                        value={settings.quietHoursEnd}
                        onChange={(e) => handleUpdateSettings({ quietHoursEnd: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded-lg p-2 text-white text-xs outline-none focus:border-gaming-accent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[8px] text-gray-500 uppercase font-bold mb-1 block">Fallback Channel</label>
                    <select
                      value={settings.fallbackChannel}
                      onChange={(e) => handleUpdateSettings({ fallbackChannel: e.target.value as any })}
                      className="w-full bg-black border border-white/10 rounded-lg p-2 text-white text-xs outline-none focus:border-gaming-accent"
                    >
                      <option value="email">Email</option>
                      <option value="sms">SMS</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="inapp">In-App</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[8px] text-gray-500 uppercase font-bold mb-1 block">Log Retention (days)</label>
                    <input
                      type="number"
                      value={settings.logRetentionDays}
                      onChange={(e) => handleUpdateSettings({ logRetentionDays: Number(e.target.value) })}
                      className="w-full bg-black border border-white/10 rounded-lg p-2 text-white text-xs outline-none focus:border-gaming-accent"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Template Modal */}
      <AnimatePresence>
        {editingTemplate && (
          <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-[#080112] border border-white/10 rounded-3xl p-8 max-w-2xl w-full space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-black text-white italic uppercase">Edit Template</h2>
                <button onClick={() => setEditingTemplate(null)} className="p-2 text-gray-500 hover:text-white"><XCircle size={20} /></button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[8px] text-gray-500 uppercase font-bold mb-1 block">Name</label>
                  <input
                    type="text"
                    value={editingTemplate.name}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-lg p-2 text-white text-xs outline-none focus:border-gaming-accent"
                  />
                </div>
                <div>
                  <label className="text-[8px] text-gray-500 uppercase font-bold mb-1 block">Subject</label>
                  <input
                    type="text"
                    value={editingTemplate.subject}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-lg p-2 text-white text-xs outline-none focus:border-gaming-accent"
                  />
                </div>
                <div>
                  <label className="text-[8px] text-gray-500 uppercase font-bold mb-1 block">Body</label>
                  <textarea
                    value={editingTemplate.body}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, body: e.target.value })}
                    rows={6}
                    className="w-full bg-black border border-white/10 rounded-lg p-2 text-white text-xs outline-none focus:border-gaming-accent resize-none"
                  />
                </div>
                <div>
                  <label className="text-[8px] text-gray-500 uppercase font-bold mb-2 block">Channels</label>
                  <div className="flex gap-2">
                    {(['email', 'sms', 'whatsapp', 'inapp'] as const).map((ch) => (
                      <button
                        key={ch}
                        onClick={() => {
                          const channels = editingTemplate.channels.includes(ch)
                            ? editingTemplate.channels.filter(c => c !== ch)
                            : [...editingTemplate.channels, ch];
                          setEditingTemplate({ ...editingTemplate, channels });
                        }}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase border transition-all ${editingTemplate.channels.includes(ch) ? channelColors[ch] : 'bg-white/5 text-gray-500 border-white/10'}`}
                      >
                        {channelIcons[ch]}
                        {ch}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setEditingTemplate(null)} className="flex-1 py-3 text-gray-500 font-bold uppercase tracking-widest text-xs border border-white/10 rounded-xl hover:bg-white/5">Cancel</button>
                <button onClick={handleSaveTemplate} className="flex-1 py-3 bg-gaming-accent text-black font-black uppercase tracking-widest text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-[#9333EA]">
                  <Save size={14} /> Save Template
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Log Detail Modal */}
      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-[#080112] border border-white/10 rounded-3xl p-8 max-w-lg w-full space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-black text-white italic uppercase">{selectedLog.templateName}</h2>
                  <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-1">{selectedLog.id}</p>
                </div>
                <button onClick={() => setSelectedLog(null)} className="p-2 text-gray-500 hover:text-white"><XCircle size={20} /></button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-[8px] text-gray-500 uppercase font-bold mb-1">Customer</p>
                    <p className="text-sm text-white font-bold">{selectedLog.customerName}</p>
                    <p className="text-[9px] text-gray-500">{selectedLog.customerEmail}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-[8px] text-gray-500 uppercase font-bold mb-1">Sent At</p>
                    <p className="text-sm text-white font-bold">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-[8px] text-gray-500 uppercase font-bold mb-2">Channels</p>
                  <div className="flex gap-2">
                    {selectedLog.channels.map((ch) => (
                      <span key={ch} className={`flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-bold uppercase border ${channelColors[ch]}`}>
                        {channelIcons[ch]}
                        {ch}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-[8px] text-gray-500 uppercase font-bold mb-1">Status</p>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase border ${statusColors[selectedLog.status] || statusColors.pending}`}>
                    {selectedLog.status}
                  </span>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-[8px] text-gray-500 uppercase font-bold mb-1">Subject</p>
                  <p className="text-xs text-white">{selectedLog.subject}</p>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-[8px] text-gray-500 uppercase font-bold mb-1">Body</p>
                  <p className="text-xs text-gray-300 whitespace-pre-wrap">{selectedLog.body}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setSelectedLog(null)} className="flex-1 py-3 text-gray-500 font-bold uppercase tracking-widest text-xs border border-white/10 rounded-xl hover:bg-white/5">Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
