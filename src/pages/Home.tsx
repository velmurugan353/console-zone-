import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, ShoppingBag, Gamepad2, RefreshCw } from "lucide-react";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../lib/utils";
import { EditableText, EditableImage } from "../components/Editable";
import { useState, useEffect } from "react";

import VaultPassSection from "../components/VaultPassSection";

const API_URL = import.meta.env.VITE_API_URL || '';

export default function Home() {
    const { addToCart } = useCart();
    const [rentalProducts, setRentalProducts] = useState<any[]>([]);
    const [loadingRentals, setLoadingRentals] = useState(true);

    useEffect(() => {
        const fetchRentals = async () => {
            try {
                const response = await fetch(`${API_URL}/api/rentals`);
                if (response.ok) {
                    const data = await response.json().catch(() => []);
                    // Filter only enabled catalog items
                    const enabledCatalog = data
                        .filter((r: any) => r.slug && !r.userId && r.enabled !== false)
                        .slice(0, 3)
                        .map((r: any) => ({
                            id: r._id || r.id,
                            name: r.name,
                            desc: r.specs?.join(', ') || "Premium gaming console",
                            price: r.dailyRate,
                            badge1: "RENTAL",
                            badge2: r.condition || "ELITE",
                            label: "RENT FROM",
                            image: r.image,
                            slug: r.slug
                        }));
                    setRentalProducts(enabledCatalog);
                }
            } catch (error) {
                console.error("Error fetching home rentals:", error);
            } finally {
                setLoadingRentals(false);
            }
        };
        fetchRentals();
    }, []);

    const featuredProducts = [
        {
            id: '1', // Matches existing PS5 id
            name: "PS5 Console (Pre-Owned)",
            desc: "Meticulously tested pre-owned PS5. Includes 6 months warranty.",
            price: 44990,
            badge1: "PURCHASE",
            badge2: "GOLD GRADE",
            label: "BUY FOR",
            image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&q=80&w=1000"
        },
        {
            id: '3', // Matches existing Controller id
            name: "DualSense Edge™ Pro Controller",
            desc: "High-performance wireless controller for personalized play.",
            price: 5990,
            badge1: "PURCHASE",
            badge2: "ELITE GEAR",
            label: "BUY FOR",
            image: "https://images.unsplash.com/photo-1580327344181-c1163234e5a0?auto=format&fit=crop&q=80&w=1000"
        },
        {
            id: '5', // Matches VR
            name: "Meta Quest 3",
            desc: "Dive into mixed reality with the most powerful Meta Quest yet.",
            price: 49990,
            badge1: "PURCHASE",
            badge2: "VR READY",
            label: "BUY FOR",
            image: "https://images.unsplash.com/photo-1622979135225-d2ba269fb1bd?auto=format&fit=crop&q=80&w=1000"
        }
    ];

    return (
        <div className="min-h-dvh bg-gaming-bg overflow-hidden">
            {/* Hero Section */}
            <section className="relative h-dvh flex flex-col items-center justify-center text-center px-4 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-gaming-bg/50 via-gaming-bg/80 to-gaming-bg z-10" />
                    <EditableImage
                        pageKey="home"
                        itemKey="hero_bg"
                        defaultSrc="https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=2000"
                        alt="Background"
                        className="w-full h-full object-cover opacity-50"
                    />
                </div>

                <div className="relative z-20 max-w-5xl mx-auto space-y-8">
                    <motion.h1
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-5xl md:text-8xl font-black text-white italic tracking-tighter uppercase leading-[0.9]"
                    >
                        <EditableText pageKey="home" itemKey="hero_title" defaultText="LEVEL UP YOUR GAMING" />
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="text-gaming-text opacity-80 text-lg md:text-xl font-mono uppercase tracking-widest max-w-2xl mx-auto"
                    >
                        <EditableText pageKey="home" itemKey="hero_subtitle" defaultText="Premium Console Rentals Delivered to Your Doorstep" />
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex flex-col sm:flex-row gap-6 justify-center mt-8"
                    >
                        <Link to="/rentals" className="group">
                            <button className="px-12 py-5 bg-gaming-accent text-white font-black uppercase tracking-[0.2em] rounded-none skew-x-[-20deg] flex items-center gap-3 hover:shadow-[0_0_30px_rgba(216, 102, 255,0.6)] transition-all">
                                <span className="skew-x-[20deg] block text-lg font-black">Explore Rentals</span>
                                <ArrowRight className="w-6 h-6 skew-x-[20deg]" strokeWidth={3} />
                            </button>
                        </Link>

                        <Link to="/shop" className="group">
                            <button className="px-12 py-5 bg-white/5 border border-white/10 text-white font-black uppercase tracking-[0.2em] rounded-none skew-x-[-20deg] backdrop-blur-sm hover:bg-white/10 hover:border-gaming-accent/50 transition-colors">
                                <span className="skew-x-[20deg] block text-lg font-black">Shop Now</span>
                            </button>
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Flash Sale Banner */}
            <section className="px-4 sm:px-6 lg:px-8 w-full mx-auto mb-24 -mt-20 relative z-30" style={{ maxWidth: 'var(--layout-max-width, 1280px)' }}>
                <div className="relative group overflow-hidden rounded-[3rem] bg-gradient-to-r from-gaming-accent to-gaming-secondary p-1" style={{ borderRadius: 'var(--layout-border-radius, 3rem)' }}>
                    <div className="relative bg-gaming-card rounded-[2.9rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden" style={{ borderRadius: 'calc(var(--layout-border-radius, 3rem) - 0.1rem)' }}>
                        {/* Decorative Background Element */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-gaming-accent/10 blur-[100px] -translate-y-1/2 translate-x-1/2" />

                        <div className="relative z-10 space-y-6 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gaming-accent/20 border border-gaming-accent/30 rounded-full">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gaming-accent opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-gaming-accent"></span>
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gaming-accent">
                                    <EditableText pageKey="home" itemKey="flash_sale_badge" defaultText="Weekend Flash Sale" />
                                </span>
                            </div>
                            <h2 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase leading-[0.9]">
                                <EditableText pageKey="home" itemKey="flash_sale_title" defaultText="GET 20% OFF ON YOUR FIRST RENTAL" />
                            </h2>
                            <p className="text-gaming-muted font-mono text-sm uppercase tracking-widest max-w-md">
                                <EditableText pageKey="home" itemKey="flash_sale_subtitle" defaultText="Use code GAMER20 at checkout. Mission ends in 48 hours." />
                            </p>
                        </div>

                        <div className="relative z-10 w-full md:w-auto">
                            <Link to="/rentals">
                                <button className="w-full md:w-auto px-12 py-6 bg-white text-black font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-gaming-accent hover:text-white transition-all shadow-[0_20px_50px_rgba(0,0,0,0.3)]" style={{ borderRadius: 'var(--layout-border-radius, 1rem)' }}>
                                    <EditableText pageKey="home" itemKey="flash_sale_btn" defaultText="CLAIM DISCOUNT" />
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Vault Pass Premium Membership */}
            <VaultPassSection />

            {/* Featured Products Section ("Slay Style") */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 w-full mx-auto border-t border-gaming-border" style={{ maxWidth: 'var(--layout-max-width, 1280px)' }}>
                <div className="text-center mb-16 mx-auto w-full" style={{ maxWidth: 'var(--layout-max-width, 1280px)' }}>
                    <h2 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase mb-4">
                        <EditableText pageKey="home" itemKey="featured_title" defaultText="START SHOPPING" />
                    </h2>
                    <div className="h-1 w-20 bg-gaming-accent mx-auto rounded-full" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 mb-24 mx-auto w-full" style={{ gap: 'var(--layout-grid-gap, 2rem)', maxWidth: 'var(--layout-max-width, 1280px)' }}>
                    {featuredProducts.map((item) => (
                        <div key={item.id} className="group bg-gaming-card border border-gaming-border overflow-hidden flex flex-col p-6 space-y-6 hover:border-gaming-accent/50 transition-colors" style={{ borderRadius: 'var(--layout-border-radius, 2.5rem)' }}>
                            <div className="relative aspect-square w-full bg-gaming-bg overflow-hidden flex items-center justify-center p-8" style={{ borderRadius: 'calc(var(--layout-border-radius, 2.5rem) - 0.5rem)' }}>
                                <span className="absolute top-4 left-4 bg-gaming-accent text-black text-[8px] font-black px-3 py-1 rounded uppercase tracking-[0.2em] z-10">
                                    FEATURED
                                </span>
                                <img 
                                  src={item.image} 
                                  alt={item.name} 
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                  loading="lazy"
                                />
                            </div>

                            <div className="space-y-4 px-2">
                                <h3 className="text-xl font-black text-white uppercase tracking-tight">{item.name}</h3>
                                <p className="text-gaming-muted text-xs line-clamp-2">{item.desc}</p>
                                <div className="flex gap-2">
                                    <span className="text-[9px] font-black uppercase px-3 py-1 rounded border border-gaming-border text-gaming-muted">{item.badge1}</span>
                                    <span className="text-[9px] font-black uppercase px-3 py-1 rounded border border-gaming-accent/30 text-gaming-accent">{item.badge2}</span>
                                </div>
                                <div className="pt-4 flex items-center justify-between">
                                    <div>
                                        <div className="text-[9px] text-gaming-muted font-bold uppercase">{item.label}</div>
                                        <div className="text-2xl font-black text-white italic tracking-tighter">{formatCurrency(item.price)}</div>
                                    </div>
                                    <button
                                        onClick={() => addToCart({
                                            id: item.id,
                                            name: item.name,
                                            price: item.price,
                                            image: item.image,
                                            quantity: 1,
                                            type: 'buy'
                                        })}
                                        className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-gaming-accent transition-all text-white hover:text-black"
                                        aria-label={`Add ${item.name} to cart`}
                                    >
                                        <ShoppingBag size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center mb-16 mx-auto w-full" style={{ maxWidth: 'var(--layout-max-width, 1280px)' }}>
                    <h2 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase mb-4">
                        <EditableText pageKey="home" itemKey="rentals_title" defaultText="RENTAL PRODUCTS" />
                    </h2>
                    <div className="h-1 w-20 bg-gaming-accent mx-auto rounded-full" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 mb-24 mx-auto w-full" style={{ gap: 'var(--layout-grid-gap, 2rem)', maxWidth: 'var(--layout-max-width, 1280px)' }}>
                    {loadingRentals ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-12 gap-4">
                            <RefreshCw className="h-8 w-8 text-gaming-accent animate-spin" />
                            <p className="text-[10px] font-mono text-gaming-accent uppercase tracking-[0.4em]">Querying Rental Matrix...</p>
                        </div>
                    ) : rentalProducts.map((item) => (
                        <div key={item.id} className="group bg-gaming-card border border-gaming-border overflow-hidden flex flex-col p-6 space-y-6 hover:border-gaming-accent/50 transition-colors" style={{ borderRadius: 'var(--layout-border-radius, 2.5rem)' }}>
                            <div className="relative aspect-square w-full bg-gaming-bg overflow-hidden flex items-center justify-center p-8" style={{ borderRadius: 'calc(var(--layout-border-radius, 2.5rem) - 0.5rem)' }}>
                                <img 
                                  src={item.image} 
                                  alt={item.name} 
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                  loading="lazy"
                                />
                            </div>

                            <div className="space-y-4 px-2">
                                <h3 className="text-xl font-black text-white uppercase tracking-tight">{item.name}</h3>
                                <p className="text-gaming-muted text-xs line-clamp-2">{item.desc}</p>
                                <div className="flex gap-2">
                                    <span className="text-[9px] font-black uppercase px-3 py-1 rounded border border-gaming-border text-gaming-muted">{item.badge1}</span>
                                    <span className="text-[9px] font-black uppercase px-3 py-1 rounded border border-gaming-accent/30 text-gaming-accent">{item.badge2}</span>
                                </div>
                                <div className="pt-4 flex items-center justify-between">
                                    <div>
                                        <div className="text-[9px] text-gaming-muted font-bold uppercase">{item.label}</div>
                                        <div className="text-2xl font-black text-white italic tracking-tighter">{formatCurrency(item.price)}<span className="text-sm text-gaming-muted font-normal">/day</span></div>
                                    </div>
                                    <Link
                                        to={`/rentals/${item.slug}/book`}
                                        className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-gaming-accent transition-all text-white hover:text-black"
                                    >
                                        <ArrowRight size={20} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* User Reviews Section */}
                <div className="pt-32 pb-16 mx-auto w-full relative" style={{ maxWidth: 'var(--layout-max-width, 1280px)' }}>
                    {/* Background Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-gaming-accent/5 blur-[120px] rounded-full pointer-events-none" />
                    
                    <div className="text-center mb-16 mx-auto w-full relative z-10" style={{ maxWidth: 'var(--layout-max-width, 1280px)' }}>
                        <h2 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase mb-4 drop-shadow-[0_0_15px_rgba(216, 102, 255,0.3)]">
                            <EditableText pageKey="home" itemKey="reviews_title" defaultText="WHAT GAMERS SAY" />
                        </h2>
                        <div className="h-1 w-20 bg-gradient-to-r from-transparent via-gaming-accent to-transparent mx-auto rounded-full" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 relative z-10" style={{ gap: 'var(--layout-grid-gap, 2rem)' }}>
                        {[
                            { name: "Arjun R.", rating: 5, comment: "Rental process was super smooth. The PS5 arrived in pristine condition. Highly recommended!", location: "Chennai" },
                            { name: "Sarah K.", rating: 5, comment: "Sold my old PS4 for a great price. Payout was instant as promised. Best place to sell gear.", location: "Bangalore" },
                            { name: "Vivek M.", rating: 5, comment: "The 144Hz monitor rental changed my weekend tournament experience. Professional service!", location: "Mumbai" }
                        ].map((review, i) => (
                            <div key={i} className="bg-white/[0.02] backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] space-y-6 relative group overflow-hidden hover:border-gaming-accent/50 transition-all duration-500 hover:-translate-y-2 shadow-2xl" style={{ borderRadius: 'var(--layout-border-radius, 2.5rem)' }}>
                                {/* Glassmorphism Highlight */}
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                
                                <div className="absolute -top-4 -right-4 p-8 opacity-5 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500">
                                    <Gamepad2 size={100} className="text-gaming-accent -rotate-12" />
                                </div>
                                <div className="flex text-gaming-accent gap-1 drop-shadow-[0_0_5px_rgba(216, 102, 255,0.5)]">
                                    {[...Array(review.rating)].map((_, i) => <span key={i} className="text-xl">★</span>)}
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed italic relative z-10">
                                    "<EditableText pageKey="home" itemKey={`review_comment_${i}`} defaultText={review.comment} />"
                                </p>
                                <div className="flex items-center gap-4 relative z-10 pt-4 border-t border-white/5">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gaming-accent to-[#4D008C] flex items-center justify-center font-black text-sm text-white shadow-[0_0_15px_rgba(216, 102, 255,0.4)]">
                                        {review.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="text-white font-bold text-sm uppercase tracking-wider">{review.name}</div>
                                        <div className="text-gaming-accent text-[10px] font-black uppercase tracking-[0.2em]">{review.location}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FAQ & Contact Section */}
                <div className="py-24 mx-auto w-full border-t border-white/10 bg-gradient-to-b from-transparent to-black/50" style={{ maxWidth: 'var(--layout-max-width, 1280px)' }}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 px-4 sm:px-6 lg:px-8">
                        {/* FAQ */}
                        <div>
                            <div className="mb-12">
                                <h2 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase mb-4 drop-shadow-[0_0_15px_rgba(216, 102, 255,0.3)]">
                                    MISSION SUPPORT
                                </h2>
                                <p className="text-gray-400 font-mono text-xs uppercase tracking-widest">Knowledge Base // Comm-Link</p>
                                <div className="h-1 w-20 bg-gradient-to-r from-gaming-accent to-transparent mt-4 rounded-full" />
                            </div>

                            <div className="space-y-4">
                                {[
                                    { q: "How does the rental deposit work?", a: "We take a minimal security deposit which is 100% refundable upon return of the console in original condition." },
                                    { q: "What documents are needed for KYC?", a: "Just a valid ID proof (Aadhar/Voter ID) and a quick liveness selfie video. The process is fully automated and takes less than 2 minutes." },
                                    { q: "Do you offer doorstep delivery?", a: "Yes! We offer same-day doorstep delivery and pickup across all major operational zones." },
                                    { q: "Can I buy a console I'm currently renting?", a: "Absolutely! We offer special conversion prices if you decide to permanently own your rental gear." }
                                ].map((faq, i) => (
                                    <div key={i} className="bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-gaming-accent/50 transition-all cursor-pointer group">
                                        <h3 className="text-white font-black uppercase text-xs md:text-sm tracking-widest flex items-center justify-between">
                                            {faq.q}
                                            <ArrowRight size={18} className="text-gaming-accent group-hover:translate-x-1 transition-transform" />
                                        </h3>
                                        <p className="mt-4 text-gray-400 text-xs md:text-sm leading-relaxed group-hover:text-white transition-colors">{faq.a}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Contact Card */}
                        <div className="flex flex-col justify-center">
                            <div className="bg-[#080112] border border-[#4D008C] rounded-[3rem] p-8 md:p-12 relative overflow-hidden shadow-[0_0_50px_rgba(77,0,140,0.2)]">
                                {/* Animated Glow */}
                                <div className="absolute -top-24 -right-24 w-64 h-64 bg-gaming-accent/20 blur-[80px] rounded-full animate-pulse" />
                                
                                <div className="relative z-10 space-y-8">
                                    <div>
                                        <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-2">Direct Uplink</h3>
                                        <p className="text-gray-400 text-sm font-mono tracking-widest uppercase">Need immediate assistance? Establish connection.</p>
                                    </div>

                                    <form className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <input type="text" placeholder="CALLSIGN (NAME)" className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-gaming-accent transition-colors" />
                                            <input type="email" placeholder="COMM-LINK (EMAIL)" className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-gaming-accent transition-colors" />
                                        </div>
                                        <textarea placeholder="TRANSMIT MESSAGE..." rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-gaming-accent transition-colors resize-none" />
                                        <button type="button" className="w-full py-5 bg-gaming-accent text-white font-black uppercase tracking-[0.2em] rounded-xl hover:shadow-[0_0_30px_rgba(216, 102, 255,0.4)] transition-all flex items-center justify-center gap-3">
                                            Send Transmission <ArrowRight size={18} />
                                        </button>
                                    </form>

                                    <div className="pt-8 border-t border-white/10 grid grid-cols-2 gap-4 text-center">
                                        <div>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Support Hotline</p>
                                            <p className="text-white font-mono text-sm">+91 98765 43210</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Base of Operations</p>
                                            <p className="text-white font-mono text-sm">Chennai, TN</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </section>
        </div>
    );
}
