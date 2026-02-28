import { motion } from "framer-motion";
import { Truck, Ruler, Weight, ShieldCheck, ChevronRight } from "lucide-react";
import { useState } from "react";
import QuoteModal from "@/components/QuoteModal/QuoteModal";

const Fleet = () => {
    const [isQuoteOpen, setIsQuoteOpen] = useState(false);

    const vehicles = [
        {
            type: "32 Ft. Single Axle",
            capacity: "7 to 9 Tons",
            dimensions: "32' x 8' x 8'",
            bestFor: "Ideal for FMCG, white goods, and industrial components.",
            features: ["Waterproof Container", "GPS Tracking", "Side-opening options"]
        },
        {
            type: "32 Ft. Multi Axle",
            capacity: "14 to 17 Tons",
            dimensions: "32' x 8' x 8'",
            bestFor: "Heavy machinery, construction materials, and bulk cargo.",
            features: ["High Load Capacity", "Air Suspension", "Safe for delicate heavy loads"]
        },
        {
            type: "20 Ft. Container truck",
            capacity: "6 to 8 Tons",
            dimensions: "20' x 8' x 8'",
            bestFor: "Intermediate volume consignments and express deliveries.",
            features: ["Secure Seal", "Express Transit", "Optimized Fuel Efficiency"]
        },
        {
            type: "14 Ft. Open/Closed Truck",
            capacity: "3 to 4.5 Tons",
            dimensions: "14' x 7' x 7'",
            bestFor: "Intra-city and localized distribution for retail goods.",
            features: ["Easy Maneuverability", "Fast Loading", "Doorstep Delivery"]
        }
    ];

    return (
        <div className="flex flex-col gap-20 pb-20 pt-10 font-plus-jakarta">
            <header className="flex flex-col gap-6 text-center max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] w-fit mx-auto">
                    Modern Logistics Fleet
                </div>
                <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-tight italic">
                    High-Performance <span className="text-indigo-600">Transport Fleet</span>
                </h1>
                <p className="text-xl text-slate-500 font-medium">
                    Durable, secure, and diverse vehicle options to handle any load, anywhere in India.
                </p>
            </header>

            <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
                {vehicles.map((v, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ y: -5 }}
                        className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-premium flex flex-col gap-8 group"
                    >
                        <div className="flex justify-between items-center">
                            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                                <Truck size={32} />
                            </div>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest group-hover:text-indigo-600 transition-colors tracking-[0.3em]">Vehicle Entry #{i + 101}</span>
                        </div>

                        <div className="flex flex-col gap-4">
                            <h3 className="text-3xl font-bold text-slate-900 italic font-serif">{v.type}</h3>
                            <p className="text-slate-500 font-medium leading-relaxed">{v.bestFor}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-50">
                            <div className="flex items-center gap-3">
                                <Weight size={20} className="text-indigo-400" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Payload</span>
                                    <span className="text-sm font-bold text-slate-700">{v.capacity}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Ruler size={20} className="text-rose-400" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dimensions</span>
                                    <span className="text-sm font-bold text-slate-700">{v.dimensions}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {v.features.map((f, fi) => (
                                <span key={fi} className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold rounded-lg uppercase tracking-tight">
                                    <ShieldCheck size={10} className="text-emerald-500" />
                                    {f}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>

            <section className="bg-indigo-600 rounded-[3rem] p-12 lg:p-20 text-white flex flex-col items-center gap-10 text-center relative overflow-hidden shadow-2xl shadow-indigo-200">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
                <h2 className="text-3xl lg:text-5xl font-bold leading-tight italic max-w-3xl text-white">Need a specific vehicle for your operation?</h2>
                <p className="text-indigo-100 text-lg max-w-2xl font-medium italic">
                    Whether it's a small local delivery or an interstate freight move, we have the right vehicle to ensure safe and professional transit.
                </p>
                <button
                    onClick={() => setIsQuoteOpen(true)}
                    className="px-12 py-5 bg-white text-indigo-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform flex items-center justify-center gap-3 active:scale-95 group shadow-xl shadow-indigo-900/20"
                >
                    Book Your Truck Now <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </section>

            <QuoteModal
                isOpen={isQuoteOpen}
                onClose={() => setIsQuoteOpen(false)}
            />
        </div>
    );
};

export default Fleet;
