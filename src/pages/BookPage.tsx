"use client";

import { Suspense, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import BookingForm from "../components/BookingForm";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  Clock, 
  Package, 
  Gamepad2, 
  Zap, 
  Shield,
  ChevronRight,
  Check,
  Plus,
  Minus,
  Tag,
  Gift,
  Truck,
  CreditCard,
  ArrowLeft,
  ArrowRight,
  X
} from "lucide-react";
import { format, addDays, startOfToday, isSameDay, isBefore, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, addMonths, subMonths, isSameMonth } from "date-fns";
import { EditableText, EditableImage } from "../components/Editable";

interface ConsoleOption {
  id: string;
  name: string;
  price: number;
  image: string;
  specs: string[];
}

const consoles: ConsoleOption[] = [
  {
    id: 'ps5',
    name: 'PlayStation 5',
    price: 500,
    image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=300&fit=crop',
    specs: ['4K Gaming', 'Ray Tracing', '120 FPS']
  },
  {
    id: 'xbox',
    name: 'Xbox Series X',
    price: 450,
    image: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=400&h=300&fit=crop',
    specs: ['4K 120FPS', 'Quick Resume', 'Game Pass']
  },
  {
    id: 'switch',
    name: 'Nintendo Switch OLED',
    price: 350,
    image: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400&h=300&fit=crop',
    specs: ['OLED Display', 'Portable', 'HD Rumble']
  }
];

type DurationType = 'daily' | 'weekly' | 'monthly' | 'custom' | null;

export default function BookPage() {
  const [selectedConsole, setSelectedConsole] = useState<ConsoleOption>(consoles[0]);
  const [durationType, setDurationType] = useState<DurationType>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [extraControllers, setExtraControllers] = useState(0);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');

  const today = startOfToday();
  const [viewDate, setViewDate] = useState(startOfMonth(today));

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStartDate = startOfWeek(monthStart);
  const calendarEndDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: calendarStartDate,
    end: calendarEndDate
  });

  const durationPresets = [
    { id: 'daily' as const, label: 'Daily', days: 1, discount: 0 },
    { id: 'weekly' as const, label: 'One Week', days: 7, discount: 10 },
    { id: 'monthly' as const, label: 'Monthly', days: 30, discount: 25 }
  ];

  const calculateDays = useCallback(() => {
    if (durationType === 'daily') return 1;
    if (durationType === 'weekly') return 7;
    if (durationType === 'monthly') return 30;
    if (startDate && endDate) {
      return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }
    return 0;
  }, [durationType, startDate, endDate]);

  const handlePresetSelect = (presetId: DurationType) => {
    setDurationType(presetId);
    if (presetId !== 'custom') {
      const preset = durationPresets.find(p => p.id === presetId);
      if (preset) {
        const start = addDays(today, 1);
        const end = addDays(today, preset.days);
        setStartDate(start);
        setEndDate(end);
      }
    }
  };

  const handleDateSelect = (date: Date) => {
    if (isBefore(date, today)) return;
    
    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate(null);
      setDurationType('custom');
    } else {
      if (isBefore(date, startDate)) {
        setStartDate(date);
        setEndDate(null);
      } else {
        setEndDate(date);
        setDurationType('custom');
      }
    }
  };

  const calculations = useMemo(() => {
    const totalDays = calculateDays();
    const basePrice = selectedConsole.price * totalDays;
    const controllerPrice = extraControllers * 50 * totalDays;
    const subtotal = basePrice + controllerPrice;
    const discount = promoApplied && totalDays > 0 ? subtotal * 0.15 : 0;
    const deliveryFee = totalDays > 0 ? 99 : 0;
    const deposit = selectedConsole.price * 2;
    const total = subtotal - discount + deliveryFee + deposit;

    return { totalDays, basePrice, controllerPrice, subtotal, discount, deliveryFee, deposit, total };
  }, [selectedConsole, durationType, extraControllers, promoApplied, calculateDays]);

  const applyPromo = () => {
    if (promoCode.toUpperCase() === 'GAMER15') {
      setPromoApplied(true);
      setPromoError('');
    } else {
      setPromoError('Invalid promo code');
      setPromoApplied(false);
    }
  };

  return (
    <main className="min-h-dvh bg-[#080112] flex flex-col pt-16 md:flex-row">
      {/* Left Panel: Visuals & Context */}
      <div className="md:w-1/2 lg:w-5/12 bg-[#080112] relative overflow-hidden flex flex-col justify-center p-8 md:p-12 lg:p-20">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <EditableImage
            pageKey="book"
            itemKey="hero_bg"
            defaultSrc="https://picsum.photos/seed/gaming/1920/1080?blur=4"
            alt="Gaming"
            className="w-full h-full object-cover opacity-30 grayscale hover:grayscale-0 transition-all duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-[#080112]" />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 space-y-8"
        >
          <div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4 leading-tight uppercase italic">
              <EditableText pageKey="book" itemKey="title" defaultText="START YOUR NEXT ADVENTURE" />
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-md leading-relaxed">
              <EditableText pageKey="book" itemKey="subtitle" defaultText="Experience premium gaming on your terms. Select your dates and let us handle the rest." />
            </p>
          </div>

          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-4 text-white/80">
              <div className="w-10 h-10 rounded-full bg-gaming-accent/10 flex items-center justify-center text-gaming-accent">
                <Shield size={20} />
              </div>
              <span className="font-bold text-sm tracking-wide">Insured & Secure Equipment</span>
            </div>
            <div className="flex items-center gap-4 text-white/80">
              <div className="w-10 h-10 rounded-full bg-gaming-accent/10 flex items-center justify-center text-gaming-accent">
                <Clock size={20} />
              </div>
              <span className="font-bold text-sm tracking-wide">24/7 Support & Fast Delivery</span>
            </div>
            <div className="flex items-center gap-4 text-white/80">
              <div className="w-10 h-10 rounded-full bg-gaming-accent/10 flex items-center justify-center text-gaming-accent">
                <Truck size={20} />
              </div>
              <span className="font-bold text-sm tracking-wide">Free Delivery Above ?5000</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Panel: Enhanced Booking */}
      <div className="md:w-1/2 lg:w-7/12 bg-[#080112] flex flex-col justify-center p-4 md:p-8 lg:p-12 relative overflow-y-auto max-h-dvh">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="w-full mx-auto space-y-8"
          style={{ maxWidth: 'var(--layout-max-width, 672px)' }}
        >
          {/* Console Selection */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Select Your Console</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {consoles.map((console) => (
                <button
                  key={console.id}
                  onClick={() => setSelectedConsole(console)}
                  className={`relative p-4 rounded-2xl border text-left transition-all ${
                    selectedConsole.id === console.id
                      ? 'bg-gaming-accent/10 border-gaming-accent shadow-[0_0_20px_rgba(168,85,247,0.2)]'
                      : 'bg-white/5 border-white/10 hover:border-white/30'
                  }`}
                >
                  {selectedConsole.id === console.id && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-gaming-accent rounded-full flex items-center justify-center">
                      <Check size={12} className="text-black" />
                    </div>
                  )}
                  <img src={console.image} alt={console.name} className="w-full h-24 object-cover rounded-xl mb-3" referrerPolicy="no-referrer" />
                  <h4 className="text-sm font-bold text-white">{console.name}</h4>
                  <p className="text-lg font-black text-gaming-accent">?{console.price}<span className="text-xs text-gray-500 font-normal">/day</span></p>
                </button>
              ))}
            </div>
          </div>

          {/* Duration Selection */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Select Rental Period</h3>
            
            {/* Duration Presets */}
            <div className="grid grid-cols-3 gap-3">
              {durationPresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetSelect(preset.id as DurationType)}
                  className={`p-4 rounded-xl border text-center transition-all ${
                    durationType === preset.id
                      ? 'bg-gaming-accent border-gaming-accent text-black'
                      : 'bg-white/5 border-white/10 text-white hover:border-white/30'
                  }`}
                >
                  <div className="text-lg font-black">{preset.label}</div>
                  <div className="text-xs opacity-70">{preset.days} Days</div>
                  {preset.discount > 0 && (
                    <div className="text-[10px] font-bold mt-1 text-emerald-600">Save {preset.discount}%</div>
                  )}
                </button>
              ))}
            </div>

            {/* Date Selection */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Calendar size={16} className="text-gaming-accent" />
                  Select Your Dates
                </h4>
                {startDate && endDate && (
                  <button 
                    onClick={() => { setStartDate(null); setEndDate(null); setDurationType(null); }}
                    className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                  >
                    <span className="text-gaming-accent font-bold">
                      {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
                    </span>
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Quick Presets */}
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                {[
                  { id: 'today', label: 'Today' },
                  { id: 'tomorrow', label: 'Tomorrow' },
                  { id: 'week', label: '1 Week' },
                  { id: 'month', label: '1 Month' }
                ].map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      const t = startOfToday();
                      let s = t, e = t;
                      if (preset.id === 'tomorrow') { s = addDays(t, 1); e = s; }
                      else if (preset.id === 'week') { s = addDays(t, 1); e = addDays(t, 7); }
                      else if (preset.id === 'month') { s = addDays(t, 1); e = addDays(t, 30); }
                      setStartDate(s);
                      setEndDate(e);
                      setDurationType(preset.id === 'today' || preset.id === 'tomorrow' ? 'daily' : preset.id === 'week' ? 'weekly' : 'monthly');
                    }}
                    className="px-3 py-1.5 bg-white/5 hover:bg-gaming-accent/20 border border-white/10 hover:border-gaming-accent/50 rounded-lg text-xs font-medium text-gray-300 hover:text-white transition-all whitespace-nowrap"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-4 px-1">
                <button 
                  onClick={() => setViewDate(subMonths(viewDate, 1))}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                >
                  <ArrowLeft size={16} />
                </button>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                  {format(viewDate, 'MMMM yyyy')}
                </h4>
                <button 
                  onClick={() => setViewDate(addMonths(viewDate, 1))}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
              
              <div className="grid grid-cols-7 gap-1 md:gap-2 text-center mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                  <div key={i} className="text-[10px] text-gray-500 font-bold py-1">{day}</div>
                ))}
                {calendarDays.map((date, i) => {
                  const isPast = isBefore(date, today);
                  const isCurrentMonth = isSameMonth(date, monthStart);
                  const isToday = isSameDay(date, today);
                  const isSelected = (startDate && isSameDay(date, startDate)) || (endDate && isSameDay(date, endDate));
                  const isInRange = startDate && endDate && date >= startDate && date <= endDate;
                  
                  return (
                    <button
                      key={i}
                      disabled={isPast || !isCurrentMonth}
                      onClick={() => handleDateSelect(date)}
                      className={`
                        relative p-2 rounded-lg text-xs font-bold transition-all duration-200
                        ${(isPast || !isCurrentMonth) ? 'opacity-20 cursor-not-allowed' : 'hover:scale-105 hover:bg-white/10 hover:shadow-lg'}
                        ${isSelected ? 'bg-gradient-to-r from-gaming-accent to-[#9333EA] text-white shadow-lg shadow-gaming-accent/30' : ''}
                        ${isInRange && !isSelected ? 'bg-gradient-to-r from-gaming-accent/30 to-gaming-accent/30 text-white' : ''}
                        ${!isPast && isCurrentMonth && !isSelected && !isInRange ? 'text-white' : ''}
                        ${isToday && !isSelected ? 'ring-2 ring-[#00d4ff] ring-inset' : ''}
                      `}
                    >
                      {format(date, 'd')}
                      {isToday && (
                        <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#00d4ff] rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Add-ons */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Enhance Your Experience</h3>
            
            {/* Extra Controllers */}
            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gaming-accent/10 flex items-center justify-center">
                  <Gamepad2 size={24} className="text-gaming-accent" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Extra Controller</h4>
                  <p className="text-xs text-gray-500">?50/day per controller</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setExtraControllers(Math.max(0, extraControllers - 1))}
                  className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20"
                >
                  <Minus size={16} />
                </button>
                <span className="w-8 text-center font-bold text-white">{extraControllers}</span>
                <button
                  onClick={() => setExtraControllers(Math.min(4, extraControllers + 1))}
                  className="w-8 h-8 rounded-lg bg-gaming-accent flex items-center justify-center text-black hover:bg-[#9333EA]"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Gaming Headset */}
            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl opacity-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Zap size={24} className="text-blue-500" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Gaming Headset</h4>
                  <p className="text-xs text-gray-500">?75/day</p>
                </div>
              </div>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">Coming Soon</span>
            </div>
          </div>

          {/* Promo Code */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Promo Code</h3>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Enter code (Try GAMER15)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:border-gaming-accent focus:outline-none transition-all text-white"
                />
              </div>
              <button
                onClick={applyPromo}
                disabled={!promoCode}
                className="px-6 bg-gaming-accent text-black font-bold text-sm rounded-xl hover:bg-[#9333EA] transition-all disabled:opacity-50"
              >
                Apply
              </button>
            </div>
            {promoError && <p className="text-red-500 text-xs">{promoError}</p>}
            {promoApplied && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-emerald-500 text-xs font-bold"
              >
                <Check size={14} /> 15% Discount Applied!
              </motion.div>
            )}
          </div>

          {/* Price Summary */}
          <div className="bg-[#111] p-6 border border-white/10 space-y-4" style={{ borderRadius: 'var(--layout-border-radius, 1rem)' }}>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <CreditCard size={20} className="text-gaming-accent" />
              Price Summary
            </h3>
            
            <div className="space-y-3 text-sm">
              {calculations.totalDays > 0 ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{selectedConsole.name} × {calculations.totalDays} days</span>
                    <span className="text-white">?{calculations.basePrice.toLocaleString()}</span>
                  </div>
                  {calculations.controllerPrice > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Extra Controllers × {calculations.totalDays} days</span>
                      <span className="text-white">?{calculations.controllerPrice.toLocaleString()}</span>
                    </div>
                  )}
                  {calculations.discount > 0 && (
                    <div className="flex justify-between text-emerald-500">
                      <span>Discount (15%)</span>
                      <span>-?{calculations.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-400">Delivery Fee</span>
                    <span className="text-white">?{calculations.deliveryFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Refundable Deposit</span>
                    <span className="text-amber-500">?{calculations.deposit.toLocaleString()}</span>
                  </div>
                </>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  Select dates or duration to see pricing
                </div>
              )}
              
              <div className="h-px bg-white/10 my-2" />
              
              <div className="flex justify-between items-end">
                <span className="text-gray-400 font-bold">Total Amount</span>
                <div className="text-right">
                  <span className="text-2xl font-black text-gaming-accent">
                    {calculations.totalDays > 0 ? `?${calculations.total.toLocaleString()}` : '?0'}
                  </span>
                  {calculations.totalDays > 0 && (
                    <p className="text-[10px] text-gray-500">Deposit refundable</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Book Now Button */}
          <motion.button
            whileHover={calculations.totalDays > 0 ? { scale: 1.02 } : {}}
            whileTap={calculations.totalDays > 0 ? { scale: 0.98 } : {}}
            disabled={calculations.totalDays === 0}
            className={`w-full py-4 font-black uppercase tracking-widest text-sm rounded-xl shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all flex items-center justify-center gap-2 ${
              calculations.totalDays > 0
                ? 'bg-gradient-to-r from-gaming-accent to-[#9333EA] text-black hover:shadow-[0_0_40px_rgba(168,85,247,0.6)]'
                : 'bg-white/10 text-gray-500 cursor-not-allowed'
            }`}
          >
            {calculations.totalDays > 0 ? (
              <>Continue to Booking <ChevronRight size={20} /></>
            ) : (
              'Select Dates to Continue'
            )}
          </motion.button>

          <p className="text-center text-[10px] text-gray-500">
            By booking, you agree to our <Link to="/coming-soon" className="text-gaming-accent hover:underline">Terms & Conditions</Link>
          </p>
        </motion.div>
      </div>
    </main>
  );
}

