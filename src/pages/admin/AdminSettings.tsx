import React, { useState } from 'react';
import { Save, Bell, Shield, Globe, Database, Mail } from 'lucide-react';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    siteName: 'ConsoleZone',
    supportEmail: 'support@consolezone.com',
    currency: 'USD',
    maintenanceMode: false,
    emailNotifications: true,
    autoApproveRentals: false,
    requireDeposit: true
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-gaming-muted">Configure system-wide preferences and controls.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* General Settings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#111] p-6 rounded-2xl border border-white/10">
            <div className="flex items-center space-x-3 mb-6">
              <Globe className="h-5 w-5 text-gaming-accent" />
              <h3 className="text-lg font-bold text-white">General Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Site Name</label>
                <input
                  type="text"
                  name="siteName"
                  value={settings.siteName}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-gaming-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Support Email</label>
                <input
                  type="email"
                  name="supportEmail"
                  value={settings.supportEmail}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-gaming-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Currency</label>
                <select
                  name="currency"
                  value={settings.currency}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-gaming-accent focus:outline-none"
                >
                  <option value="INR">INR (?)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-[#111] p-6 rounded-2xl border border-white/10">
            <div className="flex items-center space-x-3 mb-6">
              <Shield className="h-5 w-5 text-gaming-accent" />
              <h3 className="text-lg font-bold text-white">Security & Access</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div>
                  <h4 className="text-white font-medium">Maintenance Mode</h4>
                  <p className="text-sm text-gray-400">Disable public access to the site</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="maintenanceMode"
                    checked={settings.maintenanceMode}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gaming-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gaming-accent"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div>
                  <h4 className="text-white font-medium">Require Security Deposit</h4>
                  <p className="text-sm text-gray-400">Mandatory deposit for all rentals</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="requireDeposit"
                    checked={settings.requireDeposit}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gaming-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gaming-accent"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          <div className="bg-[#111] p-6 rounded-2xl border border-white/10">
            <div className="flex items-center space-x-3 mb-6">
              <Bell className="h-5 w-5 text-gaming-accent" />
              <h3 className="text-lg font-bold text-white">Notifications</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Email Alerts</span>
                <input
                  type="checkbox"
                  name="emailNotifications"
                  checked={settings.emailNotifications}
                  onChange={handleChange}
                  className="accent-gaming-accent w-5 h-5"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">New Order Alerts</span>
                <input type="checkbox" defaultChecked className="accent-gaming-accent w-5 h-5" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Rental Reminders</span>
                <input type="checkbox" defaultChecked className="accent-gaming-accent w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-[#111] p-6 rounded-2xl border border-white/10">
            <div className="flex items-center space-x-3 mb-6">
              <Database className="h-5 w-5 text-gaming-accent" />
              <h3 className="text-lg font-bold text-white">Data Management</h3>
            </div>

            <div className="space-y-3">
              <button className="w-full py-2 px-4 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors text-sm font-medium flex items-center justify-center">
                Export All Data (CSV)
              </button>
              <button className="w-full py-2 px-4 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors text-sm font-medium flex items-center justify-center">
                Backup Database
              </button>
            </div>
          </div>

          <button className="w-full py-3 bg-gaming-accent hover:bg-[#9333EA] text-white font-bold rounded-xl transition-colors flex items-center justify-center shadow-lg shadow-gaming-accent/20">
            <Save className="h-5 w-5 mr-2" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

