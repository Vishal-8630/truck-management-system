import { useState } from "react";
import { Plus, Minus, HelpCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FAQ = () => {
    const navigate = useNavigate();
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const questions = [
        {
            q: "What regions in India do you cover?",
            a: "Divyanshi Road Lines provides logistics and freight services across all major industrial hubs in India, including North, South, East, and West zones. We have a robust network connecting UP, Rajasthan, Gujarat, Maharashtra, and beyond."
        },
        {
            q: "How can I track my shipment?",
            a: "We offer real-time GPS tracking for our dedicated fleet. For smaller consignments, you can contact our 24/7 hotline with your LR (Loading Receipt) number to get the latest status update."
        },
        {
            q: "What types of trucks are available in your fleet?",
            a: "Our fleet includes a variety of vehicles tailored to different load requirements, including 32 Ft. Single/Multi Axle trucks, 20 Ft. Container trucks, and 14 Ft. carriers for local distribution."
        },
        {
            q: "Do you handle Part Truck Load (PTL) shipments?",
            a: "Yes, we handle both Full Truck Load (FTL) and Part Truck Load (PTL) shipments. Our PTL services are optimized for cost-effectiveness and consolidated for speedy transit."
        },
        {
            q: "Is insurance provided for the transported goods?",
            a: "While we ensure the highest safety standards and secure handling, we recommend taking transit insurance for high-value cargo. We can assist you in coordinating with reputable insurance partners if needed."
        },
        {
            q: "How do I get a quote for my logistics requirements?",
            a: "You can easily get a quote by clicking the 'Get a Quote' button on our homepage and filling in your shipment details, or by calling our direct contact numbers."
        }
    ];

    return (
        <div className="flex flex-col gap-24 pb-20 pt-10 font-plus-jakarta">
            <header className="flex flex-col gap-6 text-center max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest w-fit mx-auto">
                    Information Hub
                </div>
                <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-tight italic">
                    Frequently Asked <span className="text-indigo-600">Questions</span>
                </h1>
                <p className="text-xl text-slate-500 font-medium">
                    Everything you need to know about our logistics, freight, and supply chain services.
                </p>
            </header>

            <div className="max-w-4xl mx-auto w-full flex flex-col gap-4">
                {questions.map((item, idx) => (
                    <div
                        key={idx}
                        className={`group border transition-all duration-500 rounded-[2.5rem] overflow-hidden ${openIndex === idx
                                ? 'bg-white border-indigo-100 shadow-xl shadow-indigo-500/5'
                                : 'bg-slate-50/50 border-slate-100 hover:bg-white hover:border-slate-200'
                            }`}
                    >
                        <button
                            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                            className="w-full px-8 py-10 flex items-center justify-between text-left"
                        >
                            <span className={`text-xl font-bold italic font-serif transition-colors ${openIndex === idx ? 'text-indigo-600' : 'text-slate-900'}`}>{item.q}</span>
                            <div className={`w-12 h-12 rounded-[1.2rem] flex items-center justify-center transition-all duration-500 ${openIndex === idx ? 'bg-indigo-600 text-white rotate-180' : 'bg-white text-slate-400 group-hover:text-indigo-500'
                                }`}>
                                {openIndex === idx ? <Minus size={20} /> : <Plus size={20} />}
                            </div>
                        </button>

                        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${openIndex === idx ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
                            }`}>
                            <div className="px-8 pb-10 border-t border-slate-50 mt-2 pt-6">
                                <p className="text-slate-500 text-lg leading-loose font-medium italic">
                                    {item.a}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <section className="bg-slate-900 rounded-[4rem] p-12 lg:p-20 text-center text-white flex flex-col items-center gap-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-indigo-500/5 blur-3xl rounded-full" />
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-400">
                    <HelpCircle size={32} />
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold italic leading-tight max-w-2xl relative z-10">Still have more questions or specific requirements?</h2>
                <p className="text-slate-400 max-w-xl text-lg relative z-10 italic">
                    Our logistics consultants are ready to answer your specific queries about routes, pricing, and specialized haulage.
                </p>
                <button
                    onClick={() => navigate("/contact")}
                    className="px-12 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-900/40 relative z-10 active:scale-95"
                >
                    Contact Us Directly <ArrowRight size={18} />
                </button>
            </section>
        </div>
    );
};

export default FAQ;
