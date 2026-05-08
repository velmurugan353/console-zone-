import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Gamepad2, Zap, Shield, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EditableText } from './Editable';

interface Question {
    id: number;
    text: string;
    options: { label: string; value: string; icon: any }[];
}

const QUESTIONS: Question[] = [
    {
        id: 1,
        text: "WHAT IS YOUR CURRENT MISSION PARAMETER?",
        options: [
            { label: "Competitive Gaming", value: "competitive", icon: Zap },
            { label: "Casual Weekend", value: "casual", icon: Gamepad2 },
            { label: "Party / Group Event", value: "party", icon: Rocket }
        ]
    },
    {
        id: 2,
        text: "CHOOSE YOUR PREFERRED ECOSYSTEM",
        options: [
            { label: "PlayStation Matrix", value: "ps", icon: Shield },
            { label: "Xbox Command", value: "xbox", icon: Zap },
            { label: "Nintendo Domain", value: "nintendo", icon: Rocket }
        ]
    }
];

const RECOMMENDATIONS: Record<string, any> = {
    'competitive-ps': {
        title: "ELITE ESPORTS BUNDLE",
        desc: "PlayStation 5 + DualSense Edge™ + Low Latency Monitor Connectivity.",
        productId: "1",
        label: "DEPLOY MISSION"
    },
    'casual-nintendo': {
        title: "COUCH CO-OP COMMAND",
        desc: "Nintendo Switch OLED + 4 Joy-Cons + Mario Kart 8 Deluxe ready.",
        productId: "4",
        label: "START ADVENTURE"
    },
    'party-ps': {
        title: "HQ PARTY MATRIX",
        desc: "PlayStation 5 + 4 Controllers + Full Party Game Suite.",
        productId: "1",
        label: "HOST EVENT"
    }
};

export default function AIConcierge() {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<string[]>([]);
    const [showResult, setShowResult] = useState(false);

    const handleAnswer = (value: string) => {
        const newAnswers = [...answers, value];
        setAnswers(newAnswers);
        if (step < QUESTIONS.length - 1) {
            setStep(step + 1);
        } else {
            setShowResult(true);
        }
    };

    const getResult = () => {
        const key = answers.join('-');
        return RECOMMENDATIONS[key] || RECOMMENDATIONS['competitive-ps'];
    };

    const reset = () => {
        setStep(0);
        setAnswers([]);
        setShowResult(false);
    };

    return (
        <section className="py-24 px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto border-t border-white/5 relative overflow-hidden">
            {/* Decorative pulse background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gaming-accent/5 blur-[150px] rounded-full -z-10 animate-pulse" />

            <div className="text-center mb-16 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gaming-accent/10 border border-gaming-accent/20 rounded-full mb-4">
                    <Sparkles size={12} className="text-gaming-accent" />
                    <span className="text-[10px] font-mono font-bold text-gaming-accent uppercase tracking-widest text-gaming-accent">
                        <EditableText pageKey="components" itemKey="concierge_badge" defaultText="Concierge Alpha-9 v.2.4" />
                    </span>
                </div>
                <h2 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase">
                    <EditableText pageKey="components" itemKey="concierge_title" defaultText="Matchmaker Matrix" />
                </h2>
                <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">
                    <EditableText pageKey="components" itemKey="concierge_subtitle" defaultText="Our AI agent will determine your optimal hardware configuration" />
                </p>
            </div>

            <div className="max-w-4xl mx-auto bg-[#080112] border border-white/10 p-8 md:p-16 min-h-[450px] flex flex-col justify-center relative overflow-hidden shadow-2xl" style={{ borderRadius: 'var(--layout-border-radius, 3rem)' }}>
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Zap size={200} className="text-white" />
                </div>

                {!showResult ? (
                    <div className="relative z-10 space-y-12">
                        <div className="space-y-4">
                            <span className="text-[10px] font-mono text-gaming-accent uppercase tracking-[0.4em]">Step_0{step + 1} // Phase_Initialization</span>
                            <motion.h3
                                key={step}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-2xl md:text-4xl font-black text-white uppercase italic tracking-tight"
                            >
                                {QUESTIONS[step].text}
                            </motion.h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {QUESTIONS[step].options.map((opt, idx) => (
                                <motion.button
                                    key={opt.value}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    onClick={() => handleAnswer(opt.value)}
                                    className="group p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col items-center text-center space-y-4 hover:border-gaming-accent/50 hover:bg-gaming-accent/5 transition-all outline-none"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 group-hover:text-gaming-accent group-hover:bg-gaming-accent/10 transition-all">
                                        <opt.icon size={24} />
                                    </div>
                                    <span className="text-xs font-mono font-bold text-gray-400 group-hover:text-white transition-colors uppercase tracking-widest">{opt.label}</span>
                                </motion.button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative z-10 text-center space-y-8"
                    >
                        <div className="space-y-2">
                            <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-[0.4em] animate-pulse">Analysis_Complete // Optimal_Found</span>
                            <h3 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter shadow-gaming-accent/20">
                                {getResult().title}
                            </h3>
                        </div>

                        <p className="text-gray-400 font-mono text-lg max-w-xl mx-auto uppercase">
                            {getResult().desc}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                            <Link to={`/product/${getResult().productId}`} className="flex-1 sm:flex-none">
                                <button className="w-full px-12 py-5 bg-gaming-accent text-white font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 hover:bg-[#9333ea] transition-all shadow-[0_10px_40px_rgba(168,85,247,0.3)]">
                                    {getResult().label} <ArrowRight size={20} />
                                </button>
                            </Link>
                            <button
                                onClick={reset}
                                className="px-12 py-5 bg-white/5 border border-white/10 text-gray-400 font-bold uppercase tracking-widest rounded-2xl hover:text-white hover:bg-white/10 transition-all"
                            >
                                RE-SCAN CORE
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Console line decor */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gaming-accent/30 to-transparent" />
            </div>
        </section>
    );
}

