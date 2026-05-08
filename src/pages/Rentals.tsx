import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../lib/utils';
import { RENTAL_CONSOLES, RentalConsole } from '../constants/rentals';
import { EditableText } from '../components/Editable';
import { getCatalogSettings } from '../services/catalog-settings';
import { getControllerSettings } from '../services/controller-settings';

const API_URL = import.meta.env.VITE_API_URL || '';

const GAMES_LIST = [
  "GTA V", "Red Dead Redemption 2", "PUBG: Battlegrounds", "Tomb Raider Collection", "Uncharted 4",
  "Uncharted Lost Legacy", "God of War", "God of War Ragnarok", "God of War 3", "Spider-Man Miles Morales",
  "Marvel's Spider-Man 2", "Mortal Kombat 11", "Tekken 6", "It Takes Two", "A Way Out", "WWE 2K23", "WWE 2K24",
  "FIFA 23", "FIFA 24", "Assassin's Creed Collection", "Batman Arkham Knight", "Days Gone", "Devil May Cry 5",
  "The Evil Within", "Resident Evil 4", "Resident Evil Village", "The Last of Us Remastered Part 1", "Death Stranding",        
  "Detroit: Become Human", "F1 22", "F1 23", "Far Cry 3,4,5,6", "Ghost of Tsushima", "Horizon Zero Dawn",
  "Infamous Second Son", "Just Cause 4", "Kena: Bridge of Spirits", "Marvel's Guardians of the Galaxy",
  "Need for Speed Payback", "Watch Dogs 1 & 2", "Watch Dogs Legion", "Call of Duty: Black Ops Cold War",
  "Ratchet & Clank: Rift Apart", "Need for Speed Unbound", "Batman Gotham Knights", "Outlast 2", "Dead Island 2",
  "The Callisto Protocol"
];

export default function Rentals() {
  const [rentals, setRentals] = useState<RentalConsole[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('ps5');

  useEffect(() => {
    const fetchRentals = async () => {
      try {
        const response = await fetch(`${API_URL}/api/rentals`);
        if (response.ok) {
          const data = await response.json().catch(() => []);
          // Filter only the catalog/product definition rentals (not individual bookings)
          const catalogItems = data.filter((r: any) => r.slug && !r.userId && r.enabled !== false).map((r: any) => ({ 
            ...r, 
            id: r.slug, // Use slug as ID for the tabs matching the getPlans logic
            _originalId: r._id || r.id,
            inStock: r.available > 0
          }));
          
          if (catalogItems.length > 0) {
            setRentals(catalogItems);
            setActiveTab(catalogItems[0].id);
          } else {
            // Fallback
            setRentals(RENTAL_CONSOLES);
          }
        }
      } catch (error) {
        console.error("Error fetching rentals:", error);
        setRentals(RENTAL_CONSOLES);
      } finally {
        setLoading(false);
      }
    };

    fetchRentals();
  }, []);

  const activeStock = rentals.find(s => s.id === activeTab) || rentals[0];

  // Dynamic plan generator using Admin Catalog Settings
  const getPlans = (consoleId: string) => {
    const catalog = getCatalogSettings();
    const controllers = getControllerSettings();

    // Map console IDs to catalog keys
    const idToKey: Record<string, string> = {
      'ps5': 'Sony PlayStation 5',
      'xbox-series-x': 'Xbox Series X',
      'ps4': 'PlayStation 4 Pro',
      'nintendo-switch-oled': 'Nintendo Switch OLED',
      'meta-quest-3': 'Meta Quest 3'
    };

    const key = idToKey[consoleId] || idToKey['ps5'];
    const config = catalog[key] || catalog['Sony PlayStation 5'];
    
    // Use dynamic stock and deposit from catalog or live data
    const currentStock = config.totalStock !== undefined ? config.totalStock : (activeStock?.available || 0);
    const currentDeposit = config.securityDeposit || activeStock?.deposit || 0;

    // Map console IDs to controller keys
    const idToCtrl: Record<string, keyof typeof controllers.pricing> = {
      'ps5': 'ps5',
      'xbox-series-x': 'xbox',
      'ps4': 'ps4',
      'nintendo-switch-oled': 'switch',
      'meta-quest-3': 'vr'
    };
    const ctrlKey = idToCtrl[consoleId] || 'ps5';
    const ctrlPricing = controllers.pricing[ctrlKey];

    return [
      { 
        duration: "Day", 
        price: config.daily.price, 
        features: config.daily.features, 
        extraController: ctrlPricing.DAILY, 
        color: "bg-[#1a1a1a]", 
        recommended: false,
        available: currentStock,
        deposit: currentDeposit
      },
      { 
        duration: "Week", 
        price: config.weekly.price, 
        features: config.weekly.features, 
        extraController: ctrlPricing.WEEKLY, 
        color: "bg-gaming-accent", 
        recommended: true,
        available: currentStock,
        deposit: currentDeposit
      },
      { 
        duration: "Month", 
        price: config.monthly.price, 
        features: config.monthly.features, 
        extraController: ctrlPricing.MONTHLY, 
        color: "bg-[#1a1a1a]", 
        recommended: false,
        available: currentStock,
        deposit: currentDeposit
      }
    ];
  };

  if (loading) {
    return (
      <div className="min-h-dvh bg-[#080112] flex items-center justify-center">
        <RefreshCw className="h-8 w-8 text-gaming-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#080112]">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] md:h-[80vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden pt-20 md:pt-0">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#080112]/50 via-[#080112]/80 to-[#080112] z-10" />
          <img
            src={activeStock?.image}
            alt="Background"
            className="w-full h-full object-cover opacity-50 transition-opacity duration-700"
            loading="lazy"
          />
        </div>

        <div className="relative z-20 max-w-5xl mx-auto space-y-8">
          <motion.h1
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl sm:text-5xl md:text-8xl font-black text-white italic tracking-tighter uppercase leading-[0.9] drop-shadow-[0_0_20px_rgba(216, 102, 255,0.4)]"
          >
            {activeStock ? activeStock.name.split(' ').slice(0, 2).join(' ') : "RENTALS"}
          </motion.h1>
          <p className="text-gray-300 text-sm sm:text-lg md:text-xl font-mono uppercase tracking-widest max-w-2xl mx-auto opacity-80 px-4">
            <EditableText pageKey="rentals" itemKey="hero_subtitle" defaultText="Select from our elite fleet of current-gen and classic consoles" />
          </p>

          <div className="flex bg-white/[0.02] backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 overflow-x-auto max-w-[95vw] md:max-w-max mt-4 md:mt-8 scrollbar-hide mx-auto shadow-2xl">
            {rentals.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-4 sm:px-6 md:px-10 py-3 md:py-4 rounded-xl font-black uppercase tracking-widest text-[10px] sm:text-xs md:text-sm transition-all duration-300 whitespace-nowrap ${activeTab === item.id
                  ? 'bg-gradient-to-r from-gaming-accent to-[#4D008C] text-white shadow-[0_0_20px_rgba(216, 102, 255,0.5)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                {item.name.split(' ').slice(0, 2).join(' ')}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 mx-auto w-full" style={{ maxWidth: 'var(--layout-max-width, 1280px)' }}>
        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <AnimatePresence mode="wait">
            {activeTab && getPlans(activeTab).map((plan: any, index: number) => (
              <motion.div
                key={plan.duration}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className={`group relative bg-[#0c021a] border border-white/10 rounded-[2rem] md:rounded-3xl overflow-hidden hover:border-gaming-accent/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(216, 102, 255,0.2)] flex flex-col ${plan.recommended ? 'ring-2 ring-gaming-accent shadow-[0_0_40px_var(--color-gaming-accent)]' : ''}`}
              >
                {plan.recommended && (
                  <div className="absolute top-0 inset-x-0 h-1 md:h-1.5 bg-gaming-accent shadow-[0_0_15px_var(--color-gaming-accent)] z-20" />        
                )}

                <div className={`p-6 md:p-10 ${plan.recommended ? 'text-white' : 'text-white'} text-center relative overflow-hidden`}>
                  {plan.recommended ? (
                    <div className="absolute inset-0 bg-gradient-to-br from-gaming-accent to-[#4D008C] opacity-90" />
                  ) : (
                    <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-xl" />
                  )}

                  <h3 className="font-display text-xl md:text-2xl font-black uppercase tracking-widest relative z-10">{plan.duration}</h3>
                  <div className="mt-3 md:mt-4 relative z-10 flex flex-col items-center justify-center gap-1">
                    <span className="text-4xl md:text-5xl font-black tracking-tighter drop-shadow-md">{formatCurrency(plan.price)}</span>
                    <span className={`text-[8px] md:text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border backdrop-blur-md ${plan.available > 0 ? (plan.recommended ? 'bg-black/20 text-white border-white/20' : 'bg-green-500/10 text-green-500 border-green-500/20') : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                      {plan.available > 0 ? `${plan.available} Units Available` : 'Out of Stock'}
                    </span>
                  </div>
                  {plan.recommended && (
                    <span className="absolute top-4 right-4 bg-white text-black text-[8px] md:text-[10px] font-black px-3 py-1 rounded-full uppercase z-10 shadow-lg">Best Value</span>
                  )}
                </div>

                <div className="p-6 md:p-8 flex-1 flex flex-col bg-gradient-to-b from-[#0c021a] to-[#080112]">
                  <ul className="space-y-3 md:space-y-4 mb-8 md:mb-10 flex-1">
                    {plan.features.map((feature: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-gray-300 group/item">
                        <div className={`mt-1 w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center shrink-0 ${plan.recommended ? 'bg-white/20 text-white' : 'bg-gaming-accent/10 text-gaming-accent'}`}>
                          <Check size={10} strokeWidth={4} />
                        </div>
                        <span className="text-xs md:text-sm font-medium group-hover/item:text-white transition-colors">{feature}</span>   
                      </li>
                    ))}
                    <li className="flex items-center gap-3 text-gray-500 pt-4 md:pt-6 border-t border-white/5">
                      <ArrowRight size={16} className="shrink-0 opacity-50" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Extra Controller: <span className="text-white">{formatCurrency(plan.extraController)}</span></span>
                    </li>
                  </ul>

                  <div className="space-y-4 pt-4">
                    <Link
                      to={`/rentals/${activeStock?.slug}/book`}
                      className={`group/btn relative overflow-hidden block w-full text-center py-4 md:py-5 rounded-2xl font-black text-base md:text-lg transition-all ${plan.available > 0
                        ? (plan.recommended ? 'bg-white text-black shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:scale-[1.02]' : 'bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-gaming-accent/50')      
                        : 'bg-white/5 text-gray-600 border border-white/5 cursor-not-allowed grayscale'
                        }`}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2 tracking-widest uppercase">        
                        {plan.available > 0 ? (
                          <>RENT NOW <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" /></>
                        ) : <span className="flex items-center gap-2"><ArrowRight size={18} className="rotate-45" /> SOLD OUT</span>}
                      </span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Games List */}
        <div className="w-full px-4 sm:px-6 lg:px-8 mx-auto" style={{ maxWidth: 'var(--layout-max-width, 1280px)' }}>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              <EditableText pageKey="rentals" itemKey="games_title" defaultText="INCLUDED GAMES LIBRARY" />
            </h2>
            <p className="text-gray-400">
              <EditableText pageKey="rentals" itemKey="games_subtitle" defaultText="All rentals come with access to our massive library of top-tier titles." />
            </p>
          </div>

          <div className="bg-[#0a0a0a] border border-gaming-accent/30 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gaming-accent/5 rounded-3xl" />
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8">
              {GAMES_LIST.map((game, i) => (
                <div key={i} className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors group/game cursor-default">
                  <div className="w-1 h-1 rounded-full bg-gaming-accent group-hover/game:scale-150 transition-transform" />
                  <span className="text-sm font-medium tracking-tight uppercase font-mono">{game}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <span className="inline-block px-4 py-1 rounded-full bg-white/10 text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black italic">And many more...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
