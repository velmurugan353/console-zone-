import React from 'react';

const AdminPlaceholder = ({ title }: { title: string }) => (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold text-white">{title}</h1>
    <div className="bg-[#111] p-8 rounded-2xl border border-white/10 text-center">
      <p className="text-gray-400">This module is under construction.</p>
    </div>
  </div>
);

export const AdminProducts = () => <AdminPlaceholder title="Product Management" />;
export const AdminRentals = () => <AdminPlaceholder title="Rental Devices" />;
export const AdminRepairs = () => <AdminPlaceholder title="Repair Services" />;
export const AdminUsedConsoles = () => <AdminPlaceholder title="Used Console Requests" />;
export const AdminOrders = () => <AdminPlaceholder title="Order Management" />;
export const AdminCustomers = () => <AdminPlaceholder title="Customer Management" />;
export const AdminAnalytics = () => <AdminPlaceholder title="Analytics & Reports" />;
export const AdminSettings = () => <AdminPlaceholder title="System Settings" />;
