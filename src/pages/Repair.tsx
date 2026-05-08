import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { REPAIR_SERVICES } from '../lib/data';
import { formatCurrency } from '../lib/utils';
import { Wrench, Truck, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { EditableText } from '../components/Editable';

const repairSchema = z.object({
  deviceType: z.string().min(1, "Please select the type of device you need repaired."),
  issueType: z.string().min(1, "Please select the primary issue you are experiencing."),
  description: z.string().min(10, "Please provide at least 10 characters describing the issue in detail."),
  pickupDate: z.string().min(1, "Please select a preferred pickup date.").refine((date) => {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
    return selectedDate >= today;
  }, {
    message: "Pickup date cannot be in the past. Please select today or a future date."
  }),
  pickupTime: z.string().min(1, "Please select a preferred pickup time."),
  phone: z.string().regex(/^\d{10}$/, "Please enter a valid 10-digit mobile number."),
  address: z.string().min(5, "Please provide a complete pickup address (at least 5 characters)."),
});

type RepairFormValues = z.infer<typeof repairSchema>;

export default function Repair() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors }, watch } = useForm<RepairFormValues>({
    resolver: zodResolver(repairSchema)
  });

  const selectedIssue = watch('issueType');
  const serviceDetails = REPAIR_SERVICES.find(s => s.id === selectedIssue);

  const onSubmit = async (data: RepairFormValues) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('consolezone_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/repairs`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to submit repair request');
      }

      setSubmitted(true);
    } catch (err: any) {
      console.error("Repair Submit Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gaming-card border border-gaming-accent/50 p-12 rounded-2xl"
        >
          <div className="w-20 h-20 bg-gaming-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-gaming-accent" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Request Received!</h2>
          <p className="text-gaming-muted mb-8">
            Our technician will review your request and confirm the pickup time shortly.
            You can track the status in your dashboard.
          </p>
          <a href="/dashboard" className="text-gaming-accent hover:underline">Go to Dashboard</a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-12" style={{ maxWidth: 'var(--layout-max-width, 1280px)' }}>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">
          <EditableText pageKey="repair" itemKey="title" defaultText="Console Repair Service" />
        </h1>
        <p className="text-gaming-muted max-w-2xl mx-auto">
          <EditableText pageKey="repair" itemKey="subtitle" defaultText="Professional repairs for all major gaming consoles. We pick up, fix, and deliver back to you." />
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: 'var(--layout-grid-gap, 2rem)' }}>
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="bg-gaming-card border border-gaming-border p-8 space-y-6" style={{ borderRadius: 'var(--layout-border-radius, 0.75rem)' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gaming-muted">Device Type</label>
                <select 
                  {...register('deviceType')}
                  className="w-full bg-gaming-bg border border-gaming-border rounded-lg p-3 text-white focus:border-gaming-accent focus:outline-none"
                >
                  <option value="">Select Console</option>
                  <option value="ps5">PlayStation 5</option>
                  <option value="ps4">PlayStation 4</option>
                  <option value="xbox-x">Xbox Series X/S</option>
                  <option value="switch">Nintendo Switch</option>
                </select>
                {errors.deviceType && <p className="text-red-500 text-xs">{errors.deviceType.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gaming-muted">Issue Type</label>
                <select 
                  {...register('issueType')}
                  className="w-full bg-gaming-bg border border-gaming-border rounded-lg p-3 text-white focus:border-gaming-accent focus:outline-none"
                >
                  <option value="">Select Issue</option>
                  {REPAIR_SERVICES.map(service => (
                    <option key={service.id} value={service.id}>{service.name}</option>
                  ))}
                </select>
                {errors.issueType && <p className="text-red-500 text-xs">{errors.issueType.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gaming-muted">Description</label>
              <textarea 
                {...register('description')}
                rows={4}
                placeholder="Describe the problem in detail..."
                className="w-full bg-gaming-bg border border-gaming-border rounded-lg p-3 text-white focus:border-gaming-accent focus:outline-none"
              ></textarea>
              {errors.description && <p className="text-red-500 text-xs">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gaming-muted">Phone Number</label>
                <input 
                  type="tel"
                  maxLength={10}
                  {...register('phone')}
                  placeholder="10-digit mobile number"
                  className="w-full bg-gaming-bg border border-gaming-border rounded-lg p-3 text-white focus:border-gaming-accent focus:outline-none"
                />
                {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gaming-muted">Pickup Address</label>
                <input 
                  type="text"
                  {...register('address')}
                  placeholder="Full street address"
                  className="w-full bg-gaming-bg border border-gaming-border rounded-lg p-3 text-white focus:border-gaming-accent focus:outline-none"
                />
                {errors.address && <p className="text-red-500 text-xs">{errors.address.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gaming-muted">Preferred Pickup Date</label>
                <input 
                  type="date"
                  {...register('pickupDate')}
                  className="w-full bg-gaming-bg border border-gaming-border rounded-lg p-3 text-white focus:border-gaming-accent focus:outline-none"
                />
                {errors.pickupDate && <p className="text-red-500 text-xs">{errors.pickupDate.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gaming-muted">Preferred Pickup Time</label>
                <input 
                  type="time"
                  {...register('pickupTime')}
                  className="w-full bg-gaming-bg border border-gaming-border rounded-lg p-3 text-white focus:border-gaming-accent focus:outline-none"
                />
                {errors.pickupTime && <p className="text-red-500 text-xs">{errors.pickupTime.message}</p>}
              </div>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gaming-accent text-black font-bold rounded-xl hover:bg-gaming-accent/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Book Repair'}
            </button>
          </form>
        </div>

        {/* Summary Card */}
        <div className="lg:col-span-1">
          <div className="bg-gaming-card border border-gaming-border p-6 sticky top-24" style={{ borderRadius: 'var(--layout-border-radius, 0.75rem)' }}>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <Wrench className="mr-2 h-5 w-5 text-gaming-accent" /> Service Summary
            </h3>
            
            {serviceDetails ? (
              <div className="space-y-4">
                <div className="flex justify-between pb-4 border-b border-gaming-border">
                  <span className="text-gaming-muted">Service</span>
                  <span className="text-white text-right">{serviceDetails.name}</span>
                </div>
                <div className="flex justify-between pb-4 border-b border-gaming-border">
                  <span className="text-gaming-muted">Est. Duration</span>
                  <span className="text-white">{serviceDetails.duration}</span>
                </div>
                <div className="flex justify-between pb-4 border-b border-gaming-border">
                  <span className="text-gaming-muted">Pickup Fee</span>
                  <span className="text-green-500">FREE</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-lg font-bold text-white">Estimated Cost</span>
                  <span className="text-2xl font-bold text-gaming-accent">{formatCurrency(serviceDetails.price)}</span>
                </div>
                <p className="text-xs text-gaming-muted mt-4">
                  *Final price may vary based on internal component damage. We will contact you before proceeding with extra repairs.
                </p>
              </div>
            ) : (
              <div className="text-center py-10 text-gaming-muted">
                Select an issue type to see pricing estimate.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
