import { motion } from "framer-motion";
import { Truck, Package, Building2, Settings, CheckCircle2, Globe, Clock, ShieldCheck, ArrowRight } from "lucide-react";
import { useState } from "react";
import QuoteModal from "@/components/QuoteModal/QuoteModal";

const Services = () => {
    const [isQuoteOpen, setIsQuoteOpen] = useState(false);

    const serviceItems = [
        {
            icon: <Truck size={32} />,
            title: "Full Truck Load (FTL)",
            desc: "Complete vehicle dedicated to a single shipment. Ideal for bulk industrial, manufacturing, and commercial transport.",
            features: ["Door-to-Door Delivery", "Real-Time Tracking", "Dedicated Transit Times"]
        },
        {
            icon: <Package size={32} />,
            title: "Part Truck Load (PTL)",
            desc: "Cost-effective solutions for smaller shipments that don't require an entire truck. Consolidated freight for speed and value.",
            features: ["Lesser Costs", "Scheduled Consolidations", "Safe Handling"]
        },
        {
            icon: <Building2 size={32} />,
            title: "3PL & 4PL Warehouse",
            desc: "Comprehensive outsourced logistics including storage, pick-pack, and final-mile distribution across India.",
            features: ["Modern Warehousing", "Inventory Management", "Distribution Networks"]
        },
        {
            icon: <Settings size={32} />,
            title: "Project Logistics",
            desc: "Handling extremely heavy, over-dimensional (ODC), and specialized cargo for infrastructure and power projects.",
            features: ["Specialized Equipment", "Route Planning", "On-Site Implementation"]
        }
    ];

    return (
        <div className="flex flex-col gap-24 lg:gap-32 pb-20 pt-10 font-plus-jakarta">
            <header className="flex flex-col gap-6 text-center max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest w-fit mx-auto">
                    Logistics Solutions
                </div>
                <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-tight italic">
                    Powering Your <span className="text-indigo-600">Supply Chain</span>
                </h1>
                <p className="text-xl text-slate-500 font-medium">
                    Comprehensive, technology-driven logistics services designed for the modern Indian market.
                </p>
            </header>

            <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
                {serviceItems.map((service, idx) => (
                    <motion.div
                        key={idx}
                        whileHover={{ y: -8 }}
                        className="group bg-white p-10 rounded-[3rem] shadow-premium border border-slate-50 flex flex-col gap-8 transition-all hover:border-indigo-100"
                    >
                        <div className="flex justify-between items-start">
                            <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-50 text-indigo-600 flex items-center justify-center transition-transform group-hover:scale-110 duration-500">
                                {service.icon}
                            </div>
                            <div className="text-slate-100 flex items-center gap-2 group-hover:text-indigo-600 transition-colors">
                                <span className="text-[10px] font-black uppercase tracking-widest">Premium Service</span>
                                <div className="w-12 h-px bg-current" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <h3 className="text-3xl font-bold text-slate-900 leading-tight font-serif italic">{service.title}</h3>
                            <p className="text-slate-500 text-lg leading-relaxed">{service.desc}</p>
                        </div>

                        <div className="grid sm:grid-cols-1 gap-4 pt-6 border-t border-slate-50">
                            {service.features.map((feat, fIdx) => (
                                <div key={fIdx} className="flex items-center gap-3 text-slate-600 font-bold text-sm tracking-tight">
                                    <CheckCircle2 size={18} className="text-emerald-500" />
                                    {feat}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Redesigned CTA Section */}
            <section className="bg-indigo-600 rounded-[4rem] p-12 lg:p-24 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-400/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

                <div className="grid lg:grid-cols-2 gap-20 relative z-10 items-center">
                    <div className="flex flex-col gap-10">
                        <div className="flex flex-col gap-4">
                            <h2 className="text-4xl lg:text-6xl font-bold leading-tight italic text-white">
                                Nationwide Reach, <br />
                                <span className="text-indigo-200 underline decoration-indigo-400 decoration-4 underline-offset-8">Localized Expertise</span>
                            </h2>
                            <p className="text-indigo-50 text-xl leading-relaxed font-medium opacity-90">
                                We bridge the gap between production and the final recipient with a network spanning every corner of India.
                            </p>
                        </div>
                        <div className="flex flex-col gap-8 pt-4">
                            {[
                                { icon: <Globe size={24} />, title: "All-India Network", desc: "Presence in all major industrial hubs." },
                                { icon: <Clock size={24} />, title: "On-Time Reliability", desc: "Optimized routes for consistent delivery." },
                                { icon: <ShieldCheck size={24} />, title: "Safety & Compliance", desc: "Secure transit for high-value cargo." }
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-6 group">
                                    <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white shrink-0 group-hover:bg-white group-hover:text-indigo-600 transition-all duration-500">
                                        {item.icon}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <h4 className="font-bold text-2xl italic tracking-tight">{item.title}</h4>
                                        <p className="text-indigo-100 text-sm opacity-80">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-xl p-12 lg:p-16 rounded-[4rem] border border-white/20 flex flex-col gap-10 text-center shadow-2xl">
                        <div className="flex flex-col gap-4">
                            <h3 className="text-4xl font-bold leading-tight italic">Ready to move <br /> your cargo?</h3>
                            <p className="text-indigo-50 font-medium opacity-90 text-lg italic">Get a bespoke logistics strategy and <br /> competitive pricing today.</p>
                        </div>
                        <button
                            onClick={() => setIsQuoteOpen(true)}
                            className="px-12 py-6 bg-white text-indigo-600 rounded-[2rem] font-black uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-xl shadow-indigo-900/40 flex items-center justify-center gap-3 active:scale-95 group"
                        >
                            Get a Quote Now
                            <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                        </button>
                    </div>
                </div>
            </section>

            <QuoteModal
                isOpen={isQuoteOpen}
                onClose={() => setIsQuoteOpen(false)}
            />
        </div>
    );
};

export default Services;
