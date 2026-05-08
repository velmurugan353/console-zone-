import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Check,
  Mail,
  Clock,
  Truck,
  Calendar,
  ChevronRight,
  Home,
  Gamepad2
} from 'lucide-react';
import { RENTAL_CONSOLES } from '../constants/rentals';
import { format } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function BookingConfirmationPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('id');

  const [bookingData, setBookingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fallback console data based on slug
  const consoleData = RENTAL_CONSOLES.find(c => c.slug === slug) || 
                     (bookingData ? { name: bookingData.product, image: bookingData.image } : null);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`${API_URL}/api/rentals`);
        if (response.ok) {
          const allRentals = await response.json().catch(() => []);
          const target = allRentals.find((r: any) => (r._id || r.id) === bookingId);
          if (target) {
            setBookingData(target);
          }
        }
      } catch (error) {
        console.error("Error fetching booking confirmation:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-dvh bg-[#080112] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00d4ff]"></div>
      </div>
    );
  }

  if (!consoleData && !bookingData) {
    return (
      <div className="min-h-dvh bg-[#080112] flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-white">Booking not found</h1>
          <Link to="/rentals" className="text-gaming-accent hover:underline">Back to Rentals</Link>
        </div>
      </div>
    );
  }

  const bookingRef = bookingId ? `ID: ${bookingId.slice(-8).toUpperCase()}` : 'N/A';
  const startDate = bookingData?.startDate ? new Date(bookingData.startDate) : new Date();
  const endDate = bookingData?.endDate ? new Date(bookingData.endDate) : new Date();

  return (
    <div className="min-h-dvh bg-[#080112] text-white pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12 text-center">
        {/* Success Header */}
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 12, stiffness: 200 }}
              className="w-24 h-24 rounded-full bg-[#22c55e] flex items-center justify-center text-black shadow-[0_0_40px_rgba(34,197,94,0.4)]"
            >
              <Check size={48} strokeWidth={4} />
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full border-2 border-[#22c55e]"
            />
          </div>

          <div className="space-y-2">
            <h2 className="text-4xl font-black uppercase tracking-tight text-white">Booking Confirmed!</h2>
            <p className="text-gray-400 font-mono text-sm tracking-widest uppercase">Reference: {bookingRef}</p>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-[#0a0f1e] border border-white/10 rounded-3xl p-8 md:p-12 text-left space-y-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00d4ff]/5 blur-[100px] -mr-32 -mt-32 rounded-full" />

          <div className="flex flex-col md:flex-row gap-8 relative z-10">
            <div className="w-32 h-32 rounded-2xl overflow-hidden bg-black/40 border border-white/5 shrink-0">
              <img src={consoleData?.image || bookingData?.image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h4 className="text-2xl font-black uppercase tracking-tight text-white">{consoleData?.name || bookingData?.product}</h4>
                <div className="mt-2 flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar size={14} className="text-[#00d4ff]" />
                    <span>{format(startDate, 'MMM d')} — {format(endDate, 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Truck size={14} className="text-[#00d4ff]" />
                    <span className="capitalize">{bookingData?.deliveryMethod || 'Pickup'}</span>
                  </div>
                </div>

                {bookingData?.deliveryMethod === 'pickup' && bookingData?.pickupSlot && (
                  <div className="flex flex-wrap gap-3 mt-4">
                    <div className="bg-[#00d4ff]/10 border border-[#00d4ff]/20 rounded-lg px-4 py-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#00d4ff]">Pickup</span>
                      <p className="text-sm font-bold text-white">{bookingData.pickupSlot.label} ({bookingData.pickupSlot.startTime} - {bookingData.pickupSlot.endTime})</p>
                    </div>
                    {bookingData.returnSlot && (
                      <div className="bg-gaming-accent/10 border border-gaming-accent/20 rounded-lg px-4 py-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-gaming-accent">Return</span>
                        <p className="text-sm font-bold text-white">{bookingData.returnSlot.label} ({bookingData.returnSlot.startTime} - {bookingData.returnSlot.endTime})</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full">
                  Paid & Secured
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/20 rounded-full">
                  Deposit Held
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-6 pt-8 border-t border-white/5 relative z-10">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">What Happens Next?</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: <Mail className="h-4 w-4" />, title: 'Confirmation Email', desc: 'We\'ve sent your receipt and rental guide to your email.' },
                { icon: <Clock className="h-4 w-4" />, title: 'Preparation', desc: 'Our team is sanitizing and testing your equipment now.' },
                { icon: <Truck className="h-4 w-4" />, title: 'Delivery/Pickup', desc: 'You\'ll receive a reminder 24 hours before your start date.' }
              ].map((step, i) => (
                <div key={i} className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00d4ff]/10 flex items-center justify-center text-[#00d4ff]">
                    {step.icon}
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-sm font-bold text-white">{step.title}</h5>
                    <p className="text-xs text-gray-400 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4 justify-center pt-4">
          <button
            onClick={() => navigate('/dashboard/rentals')}
            className="group px-12 py-5 bg-[#00d4ff] text-black font-black uppercase tracking-widest text-sm rounded-2xl transition-all hover:shadow-[0_0_30px_rgba(0,212,255,0.4)] flex items-center justify-center gap-2"
          >
            Track My Rental <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-12 py-5 bg-white/5 text-white font-black uppercase tracking-widest text-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
          >
            <Home size={18} /> Back to Home
          </button>
          <button
            onClick={() => navigate('/rentals')}
            className="px-12 py-5 bg-white/5 text-white font-black uppercase tracking-widest text-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
          >
            <Gamepad2 size={18} /> Book Another
          </button>
        </div>
      </div>
    </div>
  );
}
