import React, { useState, useMemo } from 'react';
import { Calendar, CreditCard, Truck, Store, Gamepad2, Plus, Minus, Shield, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCatalogSettings } from '../services/catalog-settings';
import { getControllerSettings } from '../services/controller-settings';

const API_URL = import.meta.env.VITE_API_URL || '';

const consoleOptions = [
  { value: 'ps5', label: 'PlayStation 5' },
  { value: 'xbox', label: 'Xbox Series X' },
  { value: 'ps4', label: 'PlayStation 4 Pro' },
  { value: 'switch', label: 'Nintendo Switch OLED' }
];

const timeSlots = [
  '10:00 AM - 12:00 PM',
  '12:00 PM - 02:00 PM',
  '02:00 PM - 04:00 PM',
  '04:00 PM - 06:00 PM',
  '06:00 PM - 08:00 PM'
];

const BookingForm = () => {
  const [step, setStep] = useState(1);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isFirstBooking, setIsFirstBooking] = useState(false);
  
  const [formData, setFormData] = useState({
    consoleType: 'ps5',
    durationType: 'daily' as 'daily' | 'weekly' | 'monthly',
    startDate: '',
    endDate: '',
    timeSlot: '10:00 AM - 12:00 PM',
    deliveryMethod: 'pickup' as 'pickup' | 'delivery',
    address: '',
    phone: '',
    extraControllers: 0,
    name: '',
    email: ''
  });

  React.useEffect(() => {
    const checkRentalHistory = async () => {
      if (user) {
        try {
          const token = localStorage.getItem('consolezone_token');
          const response = await fetch(`${API_URL}/api/rentals/user/${user.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            const rentals = await response.json().catch(() => []);
            const isFirst = rentals.length === 0;
            setIsFirstBooking(isFirst);

            if (isFirst) {
              setFormData(prev => ({ ...prev, deliveryMethod: 'delivery' }));
            }
          }
        } catch (error) {
          console.error("Error checking rental history:", error);
        }
      }
    };
    checkRentalHistory();
  }, [user]);

  const catalog = getCatalogSettings();
  const controllers = getControllerSettings();

  const idToKey: Record<string, string> = {
    'ps5': 'Sony PlayStation 5',
    'xbox': 'Xbox Series X',
    'ps4': 'PlayStation 4 Pro',
    'switch': 'Nintendo Switch OLED'
  };

  const { pricing, ctrlRate, totalDays, totals } = useMemo(() => {
    const key = idToKey[formData.consoleType] || 'Sony PlayStation 5';
    const config = catalog[key] || catalog['Sony PlayStation 5'];
    const ctrlPricing = controllers.pricing[formData.consoleType as keyof typeof controllers.pricing] || controllers.pricing.ps5;

    let days = 1;
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    }

    let baseRate = config.daily.price;
    let durationLabel = `${days} Day${days > 1 ? 's' : ''}`;

    if (formData.durationType === 'weekly') {
      baseRate = config.weekly.price;
      durationLabel = '1 Week';
      days = 7;
    } else if (formData.durationType === 'monthly') {
      baseRate = config.monthly.price;
      durationLabel = '1 Month';
      days = 30;
    }

    const ctrlDailyRate = formData.durationType === 'monthly' ? ctrlPricing.MONTHLY :
                         formData.durationType === 'weekly' ? ctrlPricing.WEEKLY :
                         ctrlPricing.DAILY;
    
    const addonsCost = formData.extraControllers * ctrlDailyRate * (formData.durationType === 'daily' ? days : 1);
    const deliveryFee = formData.deliveryMethod === 'delivery' ? 199 : 0;
    const deposit = config.securityDeposit || 5000;
    const subtotal = baseRate + addonsCost;
    const total = subtotal + deliveryFee + deposit;

    return {
      pricing: config,
      ctrlRate: ctrlDailyRate,
      totalDays: days,
      totals: { baseRate, addonsCost, deliveryFee, deposit, subtotal, total, durationLabel }
    };
  }, [formData.consoleType, formData.durationType, formData.startDate, formData.endDate, formData.extraControllers, formData.deliveryMethod]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleControllerChange = (delta: number) => {
    setFormData(prev => ({
      ...prev,
      extraControllers: Math.max(0, Math.min(prev.extraControllers + delta, controllers.maxQuantity))
    }));
  };

  const nextStep = () => {
    if (step === 2 && !user) {
      navigate('/login?redirect=/book');
      return;
    }
    if (step === 2 && user?.kyc_status !== 'APPROVED') {
      sessionStorage.setItem('redirectAfterKYC', '/book');
      navigate('/dashboard/kyc');
      return;
    }
    setStep(prev => prev + 1);
  };

  const prevStep = () => setStep(prev => prev - 1);

  return (
    <div className="bg-[#111] p-6 rounded-2xl border border-white/10 shadow-xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Book Your Console</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <span className={`flex items-center ${step >= 1 ? 'text-gaming-accent' : ''}`}>
            <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center mr-2 text-xs">1</span>
            Select
          </span>
          <div className="w-6 h-px bg-white/10"></div>
          <span className={`flex items-center ${step >= 2 ? 'text-gaming-accent' : ''}`}>
            <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center mr-2 text-xs">2</span>
            Delivery
          </span>
          <div className="w-6 h-px bg-white/10"></div>
          <span className={`flex items-center ${step >= 3 ? 'text-gaming-accent' : ''}`}>
            <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center mr-2 text-xs">3</span>
            Confirm
          </span>
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Select Console</label>
            <select
              name="consoleType"
              value={formData.consoleType}
              onChange={handleInputChange}
              className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-gaming-accent focus:outline-none transition-colors"
            >
              {consoleOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Rental Duration</label>
            <div className="grid grid-cols-3 gap-2">
              {(['daily', 'weekly', 'monthly'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setFormData(prev => ({ ...prev, durationType: type }))}
                  className={`p-3 rounded-lg text-sm font-medium transition-all ${
                    formData.durationType === type
                      ? 'bg-gaming-accent text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Start Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-3 pl-10 text-white focus:border-gaming-accent focus:outline-none transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">End Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  min={formData.startDate}
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-3 pl-10 text-white focus:border-gaming-accent focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Time Slot</label>
            <select
              name="timeSlot"
              value={formData.timeSlot}
              onChange={handleInputChange}
              className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-gaming-accent focus:outline-none transition-colors"
            >
              {timeSlots.map(slot => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Extra Controllers (+₹{ctrlRate}/day each)
            </label>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleControllerChange(-1)}
                className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <Minus size={18} />
              </button>
              <span className="text-white font-bold text-xl w-8 text-center">{formData.extraControllers}</span>
              <button
                onClick={() => handleControllerChange(1)}
                className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <Plus size={18} />
              </button>
              <span className="text-gray-400 text-sm">Max {controllers.maxQuantity}</span>
            </div>
          </div>

          <button
            onClick={nextStep}
            className="w-full bg-gaming-accent hover:bg-[#9333EA] text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center"
          >
            Continue
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-3">Delivery Method</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                disabled={isFirstBooking}
                onClick={() => setFormData(prev => ({ ...prev, deliveryMethod: 'pickup' }))}
                className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center relative overflow-hidden ${
                  formData.deliveryMethod === 'pickup'
                    ? 'border-gaming-accent bg-gaming-accent/10'
                    : 'border-white/10 hover:border-white/30'
                } ${isFirstBooking ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
              >
                {isFirstBooking && (
                  <div className="absolute top-0 right-0 bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-bl uppercase font-bold">
                    Not Available
                  </div>
                )}
                <Store className="w-6 h-6 mb-2 text-white" />
                <span className="text-white font-medium">Pickup</span>
                <span className="text-gray-500 text-xs mt-1">Free</span>
              </button>
              <button
                onClick={() => setFormData(prev => ({ ...prev, deliveryMethod: 'delivery' }))}
                className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center ${
                  formData.deliveryMethod === 'delivery'
                    ? 'border-gaming-accent bg-gaming-accent/10'
                    : 'border-white/10 hover:border-white/30'
                }`}
              >
                <Truck className="w-6 h-6 mb-2 text-white" />
                <span className="text-white font-medium">Delivery</span>
                <span className="text-gray-500 text-xs mt-1">₹199</span>
              </button>
            </div>
            {isFirstBooking && (
              <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
                <Info size={14} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-red-400 uppercase font-bold leading-tight">
                  First-time orders require Home Delivery for security validation. Store pickup will be available for your subsequent deployments.
                </p>
              </div>
            )}
          </div>

          {formData.deliveryMethod === 'delivery' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Delivery Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter your full address..."
                  rows={3}
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-gaming-accent focus:outline-none transition-colors resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-gaming-accent focus:outline-none transition-colors"
                />
              </div>
            </>
          )}

          <div className="flex space-x-4">
            <button
              onClick={prevStep}
              className="w-1/3 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-lg transition-colors"
            >
              Back
            </button>
            <button
              onClick={nextStep}
              className="w-2/3 bg-gaming-accent hover:bg-[#9333EA] text-white font-bold py-3 rounded-lg transition-colors"
            >
              Review Booking
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div className="bg-white/5 rounded-lg p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Console</span>
              <span className="text-white font-medium">{consoleOptions.find(c => c.value === formData.consoleType)?.label}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Duration</span>
              <span className="text-white font-medium">{totals.durationLabel}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Delivery</span>
              <span className="text-white font-medium capitalize">{formData.deliveryMethod}</span>
            </div>
            {formData.extraControllers > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Extra Controllers</span>
                <span className="text-white font-medium">x{formData.extraControllers}</span>
              </div>
            )}
            
            <div className="border-t border-white/10 pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Rental Cost</span>
                <span className="text-white">₹{totals.baseRate.toLocaleString()}</span>
              </div>
              {totals.addonsCost > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Add-ons</span>
                  <span className="text-white">₹{totals.addonsCost.toLocaleString()}</span>
                </div>
              )}
              {totals.deliveryFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Delivery Fee</span>
                  <span className="text-white">₹{totals.deliveryFee}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Security Deposit (Refundable)</span>
                <span className="text-white">₹{totals.deposit.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="border-t border-white/10 pt-3 flex justify-between">
              <span className="text-white font-medium">Total Due Now</span>
              <span className="text-gaming-accent font-bold text-xl">₹{totals.total.toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 flex items-start space-x-3">
            <Shield className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
            <div className="text-xs text-green-400">
              <p className="font-medium mb-1">Security Deposit Refundable</p>
              <p className="text-green-500/70">Your deposit will be fully refunded within 48 hours of return, subject to condition assessment.</p>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={prevStep}
              className="w-1/3 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-lg transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => alert("Booking confirmed! Redirecting to payment...")}
              className="w-2/3 bg-gaming-accent hover:bg-[#9333EA] text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Pay & Book
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingForm;
