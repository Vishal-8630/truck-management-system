import HeroSectionImg from "@/assets/truck.jpg";
import { Truck, Package, Share2, Building2, Settings, Mail, Phone, MapPin, ArrowRight, ShieldCheck, Clock, Headset, Zap, Quote, Star } from "lucide-react";
import ServiceCard from "@/components/ServiceCard";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/api/axios";
import { useMessageStore } from "@/store/useMessageStore";
import QuoteModal from "@/components/QuoteModal/QuoteModal";

const LandingHome = () => {
    const navigate = useNavigate();
    const { hash } = useLocation();
    const iconSize = 28;
    const { addMessage } = useMessageStore();
    const [isQuoteOpen, setIsQuoteOpen] = useState(false);

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        subject: "",
        message: ""
    });
    const [loading, setLoading] = useState(false);

    const cardDate = [
        {
            icon: <Truck size={iconSize} />,
            title: "Freight Services",
            description: "D2D | PTL | SCM | Projects",
            detail: `Divyanshi Road Lines has been instrumental in providing innovative and value added solutions for Indian Corporate and Multinationals. It’s the only leading multi-modal logistics company with single window integrated logistics services for all the elements of the supply chain management in India.`
        },
        {
            icon: <Package size={iconSize} />,
            title: "Transportation",
            description: "Core Transportation & Distribution",
            detail: `In a complex, difficult and uneven geographic terrain like India transportation management plays a crucial role in timely delivery of your products. At Divyanshi Road Lines we oversee and manage the entire distribution process to the most complex locations.`
        },
        {
            icon: <Share2 size={iconSize} />,
            title: "3PL & 4PL",
            description: "Outsourced Logistics Solutions",
            detail: `Outsourcing of logistics function is a business dynamics of growing importance all over the world. A growing awareness that competitive advantage comes from the delivery process as much as from the product has been instrumental in upgrading logistics.`
        },
        {
            icon: <Building2 size={iconSize} />,
            title: "Supply Chain",
            description: "End-to-End Supply Chain Management",
            detail: `The objective of the supply chain is to maximize the overall value generated. The value a supply chain generates is the difference between what the final product is worth to the customer and the effort the supply chain expends.`
        },
        {
            icon: <Settings size={iconSize} />,
            title: "Project Logistics",
            description: "Heavy-lift & Specialized Haulage",
            detail: `Divyanshi Road Lines varied project logistics solutions. Heavy haulage solutions include project planning and implementation. Specialized equipment capable of hauling extremely heavy loads available with us.`
        },
    ];

    const whyChooseUs = [
        {
            icon: <ShieldCheck className="w-8 h-8" />,
            title: "Secure Handling",
            desc: "Your cargo is handled with utmost care and insured for complete peace of mind."
        },
        {
            icon: <Clock className="w-8 h-8" />,
            title: "On-Time Delivery",
            desc: "We value your time. Our optimized routes ensure your shipments arrive exactly when promised."
        },
        {
            icon: <Headset className="w-8 h-8" />,
            title: "24/7 Support",
            desc: "Our dedicated support team is available around the clock to track and manage your logistics."
        },
        {
            icon: <Zap className="w-8 h-8" />,
            title: "Smart Tracking",
            desc: "Monitor your shipment in real-time with our advanced GPS-enabled tracking system."
        }
    ];

    const testimonials = [
        {
            name: "Rajesh Kumar",
            role: "Operations Manager, ABC Mart",
            content: "Divyanshi Road Lines has transformed our supply chain. Their reliability and precision in heavy-lift transport is unmatched in the industry.",
            rating: 5
        },
        {
            name: "Anjali Gupta",
            role: "CEO, Nexa Logistics",
            content: "The level of transparency and real-time tracking they provide gives us huge confidence. Highly recommended for any large scale distribution.",
            rating: 5
        },
        {
            name: "Suresh Meena",
            role: "Fleet Supervisor, Global Exports",
            content: "We've been working with them for 5 years now. Their commitment to safety and deadlines is consistent and impressive.",
            rating: 5
        }
    ];

    useEffect(() => {
        if (hash) {
            const el = document.querySelector(hash);
            if (el) {
                el.scrollIntoView({ behavior: "smooth" });
            }
        }
    }, [hash]);

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
        <div className="flex flex-col gap-24 lg:gap-32 pb-20 overflow-x-hidden">
            {/* Hero Section */}
            <section className="relative pt-12 lg:pt-20">
                <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-indigo-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex flex-col gap-8"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></span>
                            The Future of Logistics
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1] dark:text-white">
                            Reliable <span className="text-indigo-600">Logistics</span> & Supply Chain Partner
                        </h1>
                        <p className="text-lg lg:text-xl text-slate-500 max-w-lg leading-relaxed dark:text-slate-400">
                            Delivering Excellence in Freight, Transportation, and Supply Chain Solutions across India with precision and speed.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={() => setIsQuoteOpen(true)}
                                className="btn-primary flex items-center gap-2 group"
                            >
                                Get a Quote
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <a href="#contact" className="btn-secondary">
                                Contact Us
                            </a>
                        </div>

                        <div className="flex items-center gap-8 mt-4 pt-8 border-t border-slate-100 dark:border-slate-800">
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">15+</p>
                                <p className="text-sm text-slate-400 font-medium">Years Experience</p>
                            </div>
                            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">500+</p>
                                <p className="text-sm text-slate-400 font-medium">Clients Happy</p>
                            </div>
                            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">1M+</p>
                                <p className="text-sm text-slate-400 font-medium">Miles Traveled</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="absolute -inset-4 bg-indigo-100 rounded-[2rem] blur-2xl opacity-30 -z-10 rotate-3 dark:opacity-10"></div>
                        <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800">
                            <img
                                src={HeroSectionImg}
                                alt="Trucking Excellence"
                                className="w-full h-[500px] object-cover hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                        {/* Floating Card */}
                        <div className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl flex items-center gap-4 border border-slate-50 dark:border-slate-700 animate-[float_4s_ease-in-out_infinite]">
                            <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-950 flex items-center justify-center text-orange-600 dark:text-orange-400">
                                <Truck size={24} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-semibold uppercase">Real-Time</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">Global Tracking</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Why Choose Us Section */}
            <section className="flex flex-col gap-12">
                <div className="flex flex-col gap-4 text-center max-w-2xl mx-auto">
                    <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">Why Choose <span className="text-indigo-600">Us</span></h2>
                    <p className="text-slate-500 dark:text-slate-400">We don't just move cargo; we move your business forward with core values of trust and efficiency.</p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {whyChooseUs.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="card-premium flex flex-col items-center text-center gap-4 group"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                                {item.icon}
                            </div>
                            <h3 className="text-xl font-bold">{item.title}</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* About Section */}
            <section className="relative overflow-hidden">
                <div className="bg-indigo-600 rounded-[3rem] p-8 lg:p-20 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>

                    <div className="grid lg:grid-cols-2 gap-12 relative z-10 items-center">
                        <div className="flex flex-col gap-6">
                            <h2 className="text-3xl lg:text-5xl font-bold tracking-tight">About Our Mission</h2>
                            <div className="w-20 h-1.5 bg-white/30 rounded-full"></div>
                            <p className="text-lg lg:text-xl text-indigo-50 leading-relaxed font-light">
                                Divyanshi Road Lines specializes in end-to-end logistics and supply chain management. With decades of expertise, we deliver cost-effective, reliable, and innovative solutions tailored to your business needs.
                            </p>
                            <button
                                onClick={() => navigate("/about")}
                                className="px-8 py-3 bg-white text-indigo-600 rounded-xl font-bold shadow-lg hover:bg-slate-50 transition-colors w-fit"
                            >
                                Learn More
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-3xl border border-white/20">
                                <p className="text-4xl font-bold mb-1">99%</p>
                                <p className="text-xs text-indigo-100 uppercase tracking-widest font-bold">Accuracy rate</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-3xl border border-white/20 mt-8">
                                <p className="text-4xl font-bold mb-1">24/7</p>
                                <p className="text-xs text-indigo-100 uppercase tracking-widest font-bold">Support Ready</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="flex flex-col gap-12">
                <div className="flex flex-col gap-4 text-center max-w-2xl mx-auto">
                    <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white italic">Our Expertise</h2>
                    <p className="text-slate-500 dark:text-slate-400">Comprehensive logistics solutions designed to push your business boundaries and ensures timely delivery.</p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {cardDate.map((card, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <ServiceCard
                                icon={card.icon}
                                title={card.title}
                                description={card.description}
                                detail={card.detail}
                            />
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Tracking Section */}
            <section className="relative">
                <div className="absolute inset-0 bg-slate-50 dark:bg-slate-900/50 -z-10 rounded-[3rem]"></div>
                <div className="max-w-4xl mx-auto p-12 lg:p-20 flex flex-col items-center text-center gap-10">
                    <div className="flex flex-col gap-4">
                        <h2 className="text-3xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">Track Your <span className="text-indigo-600">Shipment</span></h2>
                        <p className="text-slate-500 dark:text-slate-400">Enter your LR Number or Waybill to get real-time status updates.</p>
                    </div>
                    <div className="w-full flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Enter LR Number (e.g. DRL-2024-001)"
                                className="input-field pr-12"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                <Truck className="w-5 h-5" />
                            </div>
                        </div>
                        <button className="btn-primary flex items-center justify-center gap-2 whitespace-nowrap min-w-[160px]">
                            <Zap className="w-4 h-4 fill-white" />
                            Track Now
                        </button>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-8 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            Live GPS Tracking
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                            Instant Notifications
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                            Digital Proof of Delivery
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="flex flex-col gap-12">
                <div className="flex flex-col gap-4 text-center max-w-2xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase tracking-[0.2em] w-fit mx-auto">
                        Client Success
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">What Clients <span className="text-indigo-600">Say</span></h2>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2 }}
                            className="card-premium relative overflow-hidden"
                        >
                            <Quote className="absolute top-6 right-6 w-10 h-10 text-slate-100 dark:text-slate-800 -z-0" />
                            <div className="relative z-10 flex flex-col gap-6 h-full justify-between">
                                <div className="flex gap-1">
                                    {[...Array(t.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-orange-400 text-orange-400" />)}
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 italic leading-relaxed">"{t.content}"</p>
                                <div className="flex items-center gap-4 border-t border-slate-100 dark:border-slate-800 pt-6">
                                    <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400">
                                        {t.name[0]}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white">{t.name}</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="relative pt-12 border-t border-slate-100 dark:border-slate-800">
                <div className="grid lg:grid-cols-2 gap-20">
                    <div className="flex flex-col gap-10">
                        <div className="flex flex-col gap-4 text-center lg:text-left">
                            <h2 className="text-4xl font-bold text-slate-900 dark:text-white">Get in Touch</h2>
                            <p className="text-slate-500 dark:text-slate-400">Have a question or need a quote? Reach out to us today.</p>
                        </div>

                        <div className="flex flex-col gap-6">
                            <div className="flex items-start gap-6 group">
                                <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all duration-300 shadow-sm border border-slate-100 dark:border-slate-800">
                                    <MapPin size={28} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-lg">Our Location</h4>
                                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs pt-1">Plot No.230,231, Sec-6 Near RTO Office, Agra, UP – 282007</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-6 group">
                                <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all duration-300 shadow-sm border border-slate-100 dark:border-slate-800">
                                    <Phone size={28} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-lg">Direct Contact</h4>
                                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed pt-1">+91 8630836045 / +91 7983635608</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-6 group">
                                <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all duration-300 shadow-sm border border-slate-100 dark:border-slate-800">
                                    <Mail size={28} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-lg">Email Address</h4>
                                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed pt-1 font-medium italic">drldivyanshi@gmail.com</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white dark:bg-slate-900 p-8 lg:p-12 rounded-[2.5rem] shadow-premium border border-slate-100 dark:border-slate-800"
                    >
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Send Inquiry</h3>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        placeholder="John Doe"
                                        className="input-field"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="john@example.com"
                                        className="input-field"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Subject</label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleInputChange}
                                    placeholder="Inquiry about freight services"
                                    className="input-field"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your Message</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    placeholder="Tell us about your requirements..."
                                    className="input-field min-h-[120px] resize-none"
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Sending..." : "Send Message"}
                            </button>
                        </form>
                    </motion.div>
                </div>
            </section>

            <QuoteModal
                isOpen={isQuoteOpen}
                onClose={() => setIsQuoteOpen(false)}
            />
        </div>
    );
};

export default LandingHome;
