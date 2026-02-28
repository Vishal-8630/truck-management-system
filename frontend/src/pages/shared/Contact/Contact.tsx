import { Phone, MapPin, Clock, ArrowRight } from "lucide-react";
import { useState } from "react";
import api from "@/api/axios";
import { useMessageStore } from "@/store/useMessageStore";

const Contact = () => {
    const { addMessage } = useMessageStore();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        subject: "",
        message: ""
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.fullName || !formData.email || !formData.subject || !formData.message) {
            return addMessage({ type: "error", text: "Please fill in all fields" });
        }

        setLoading(true);
        try {
            const { data } = await api.post("/inquiry", formData);
            addMessage({ type: "success", text: data.message });
            setFormData({ fullName: "", email: "", subject: "", message: "" });
        } catch (err: any) {
            addMessage({
                type: "error",
                text: err.response?.data?.message || "Failed to send inquiry. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-24 lg:gap-32 pb-20 pt-10 font-plus-jakarta">
            <header className="flex flex-col gap-6 text-center max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest w-fit mx-auto">
                    Connect With Us
                </div>
                <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-tight italic">
                    Always Ready to <span className="text-indigo-600">Assist You</span>
                </h1>
                <p className="text-xl text-slate-500 font-medium">
                    Our logistics experts are available 24/7 to solve your transportation and supply chain needs.
                </p>
            </header>

            <div className="grid lg:grid-cols-12 gap-12 max-w-7xl mx-auto items-start">
                <div className="lg:col-span-5 flex flex-col gap-8">
                    <div className="flex flex-col gap-4">
                        <h2 className="text-3xl font-bold text-slate-900 italic font-serif">Office Location</h2>
                        <p className="text-slate-500 font-medium leading-relaxed">
                            Visit our coordination center to discuss large-scale freight solutions and contractual logistics.
                        </p>
                    </div>

                    <div className="flex flex-col gap-6">
                        <div className="flex items-start gap-6 group bg-white p-6 rounded-3xl border border-slate-50 shadow-sm transition-all hover:border-indigo-100">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                                <MapPin size={28} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-lg italic">Agra Center</h4>
                                <p className="text-slate-500 text-sm leading-relaxed max-w-xs pt-1">Plot No.230,231, Sec-6 Near RTO Office, Agra, UP – 282007</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-6 group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-all hover:border-rose-100">
                            <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
                                <Phone size={28} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-lg italic">24/7 Hotline</h4>
                                <p className="text-slate-500 text-sm leading-relaxed pt-1">+91 8630836045 / +91 7983635608</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-6 group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-all hover:border-emerald-100">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                                <Clock size={28} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-lg italic">Operations</h4>
                                <p className="text-slate-500 text-sm leading-relaxed pt-1">Open All Days, 10:00 AM - 08:00 PM (Emergency 24x7)</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1" />

                <div className="lg:col-span-6 bg-white p-10 lg:p-14 rounded-[3.5rem] shadow-premium border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
                    <h3 className="text-3xl font-bold italic font-serif mb-8 text-slate-900 uppercase tracking-tighter relative z-10">Send Us a <span className="text-indigo-600">Direct Message</span></h3>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6 relative z-10">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                className="bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-300 text-slate-700 font-bold"
                                placeholder="Your full name..."
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-300 text-slate-700 font-bold"
                                placeholder="Email address for reply..."
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</label>
                            <input
                                type="text"
                                name="subject"
                                value={formData.subject}
                                onChange={handleInputChange}
                                className="bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-300 text-slate-700 font-bold"
                                placeholder="What is this about?"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Your Message</label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleInputChange}
                                className="bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all min-h-[140px] resize-none placeholder:text-slate-300 text-slate-700 font-bold"
                                placeholder="How can we help you today?"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-indigo-600 text-white rounded-2xl py-5 font-black uppercase tracking-widest text-xs mt-4 flex items-center justify-center gap-3 hover:bg-indigo-500 active:scale-95 transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50 group"
                        >
                            {loading ? "Sending..." : "Send Message"} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>
                </div>
            </div>

            <section className="max-w-7xl mx-auto w-full flex flex-col gap-10">
                <div className="flex flex-col gap-3">
                    <h3 className="text-3xl font-bold italic font-serif text-slate-900">Coverage Map</h3>
                    <div className="w-16 h-1 bg-indigo-600 rounded-full" />
                </div>
                <div className="w-full h-[500px] rounded-[3.5rem] overflow-hidden border border-slate-100 shadow-2xl grayscale hover:grayscale-0 transition-all duration-1000">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14197.887961234479!2d77.94273200000001!3d27.1724285!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3974737a2e5d7a71%3A0xe67c94b79339e1e2!2sAgra%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1708891000000!5m2!1sen!2sin"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen={true}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                </div>
            </section>
        </div>
    );
};

export default Contact;
