import HeroSectionImg from "@/assets/truck.jpg";
import { Truck, Package, Share2, Building2, Settings, Mail, Phone, MapPin, ArrowRight, ShieldCheck, Clock, Headset, Zap, X } from "lucide-react";
import ServiceCard from "@/components/ServiceCard";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/api/axios";
import { useMessageStore } from "@/store/useMessageStore";
import QuoteModal from "@/components/QuoteModal/QuoteModal";

const clientLogos = [
    {
        name: "Rasik Foils",
        fullName: "Rasik Products Private Limited (Rasik Foils)",
        industry: "Security Packaging & Foils",
        headquarters: "Agra, Uttar Pradesh, India",
        description: "A leading manufacturer and exporter specializing in holographic films, hot stamping foils, and security packaging materials, supplying premium metallic layers to packaging giants across India.",
        imageUrl: "https://images.unsplash.com/photo-1535813547-99c456a41d4a?auto=format&fit=crop&q=80&w=600",
        logoUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200",
        hoverColor: "zinc",
        hoverColorHex: "113, 113, 122",
        icon: (
            <svg className="w-6 h-6 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
                <path d="M12 17v4M8 21h8" />
            </svg>
        )
    },
    {
        name: "Olam",
        fullName: "Olam Group (Olam International)",
        industry: "Global Agri-business & Food",
        headquarters: "Singapore (Global Presence)",
        description: "Olam Group is a major global food and agri-business company supplying cocoa, coffee, nuts, dairy, grains, and agricultural products to over 20,000 corporate customers globally.",
        imageUrl: "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=600",
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Olam_International_logo.png",
        hoverColor: "emerald",
        hoverColorHex: "16, 185, 129",
        icon: (
            <svg className="w-6 h-6 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 21 2c-2.48 4-3 5.5-4.1 11.2A7 7 0 0 1 11 20z" />
            </svg>
        )
    },
    {
        name: "Winter Shoes",
        fullName: "Winter Shoe Co. (Winter Exports)",
        industry: "Leather Footwear Manufacturing",
        headquarters: "Agra, Uttar Pradesh, India",
        description: "Established in 1976, Winter Shoe Co. is a leading Agra-based manufacturer and exporter of premium leather dress shoes, safety boots, and casual footwear to European and Middle Eastern markets.",
        imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=600",
        logoUrl: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&q=80&w=200",
        hoverColor: "blue",
        hoverColorHex: "59, 130, 246",
        icon: (
            <svg className="w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21h18v-2H3v2zm3-4h6v-2H6v2zm9 0h3v-4h-3v4zm-6-6h10V9H9v2zm-3 0h2V7H6v4z" />
            </svg>
        )
    },
    {
        name: "Hindware",
        fullName: "Hindware Limited (formerly HSIL)",
        industry: "Sanitaryware & Home Appliances",
        headquarters: "Gurugram, Haryana, India",
        description: "One of India's most recognized household brands, Hindware is a leading player in premium sanitaryware, high-end faucets, wellness products, and modern kitchen chimneys.",
        imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600",
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e4/Hindware_Sanitaryware_Logo.png",
        hoverColor: "indigo",
        hoverColorHex: "99, 102, 241",
        icon: (
            <svg className="w-6 h-6 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
        )
    },
    {
        name: "Evok",
        fullName: "EVOK Homes (Hindware Home Retail)",
        industry: "Premium Furniture & Interior Decor",
        headquarters: "New Delhi, Delhi, India",
        description: "EVOK is a premium retail chain under the Hindware Group, specialized in offering modern wooden furniture, modular kitchens, luxury decor accessories, and complete home interior solutions.",
        imageUrl: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=600",
        logoUrl: "https://www.evok.in/pub/media/logo/stores/1/Evok-Logo_1.png",
        hoverColor: "orange",
        hoverColorHex: "249, 115, 22",
        icon: (
            <svg className="w-6 h-6 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21V9a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v12m14 0h2a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2h-2m-14 10H3a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h2" />
            </svg>
        )
    },
    {
        name: "Vectus",
        fullName: "Vectus Industries Limited",
        industry: "Water Storage & Plastic Piping",
        headquarters: "Noida, Uttar Pradesh, India",
        description: "Vectus is a major Indian manufacturer of polymer water storage tanks, PVC and CPVC plumbing systems, and agricultural pipes, serving millions of households and irrigation systems.",
        imageUrl: "https://images.unsplash.com/photo-1585128792020-803d29415281?auto=format&fit=crop&q=80&w=600",
        logoUrl: "https://www.vectus.in/assets/images/logo.png",
        hoverColor: "cyan",
        hoverColorHex: "6, 182, 212",
        icon: (
            <svg className="w-6 h-6 text-cyan-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
        )
    },
    {
        name: "Wavin",
        fullName: "Orbia Wavin (Wavin India / Global)",
        industry: "Water Management Infrastructure",
        headquarters: "Zwolle, Netherlands (Global) / Noida, India",
        description: "Wavin is a global giant in stormwater management, sustainable pipeline solutions, and civic plumbing systems, working under the Orbia brand to optimize fluid mechanics.",
        imageUrl: "https://images.unsplash.com/photo-1542060748-10c28b629f6f?auto=format&fit=crop&q=80&w=600",
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f6/Wavin_logo.svg",
        hoverColor: "purple",
        hoverColorHex: "168, 85, 247",
        icon: (
            <svg className="w-6 h-6 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
        )
    },
    {
        name: "Romsons",
        fullName: "Romsons Scientific & Surgical Pvt. Ltd.",
        industry: "Medical Devices & Surgical Supplies",
        headquarters: "Agra, Uttar Pradesh, India",
        description: "Romsons is a premier manufacturer of disposable medical devices, surgical equipment, catheter tubes, and critical care consumables, headquartered in Agra, India, and supplying over 80 countries.",
        imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=600",
        logoUrl: "https://www.romsons.net.in/cdn/shop/files/logo_romsons_new.png",
        hoverColor: "red",
        hoverColorHex: "239, 68, 68",
        icon: (
            <svg className="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
        )
    },
    {
        name: "AVRO Furniture",
        fullName: "AVRO India Limited (AVRO Furniture)",
        industry: "Molded Plastic Furniture",
        headquarters: "Ghaziabad, Uttar Pradesh, India",
        description: "AVRO India is a leading manufacturer of premium plastic molded chairs, tables, and household furniture, celebrated for high durability, ergonomic design, and automated manufacturing.",
        imageUrl: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=600",
        logoUrl: "https://avrofurniture.com/cdn/shop/files/logo_1_200x.png",
        hoverColor: "amber",
        hoverColorHex: "245, 158, 11",
        icon: (
            <svg className="w-6 h-6 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 18v3M20 18v3M12 4v14M4 10h16M4 4h16" />
            </svg>
        )
    },
    {
        name: "Gupta H.C. Overseas",
        fullName: "Gupta H.C. Overseas (I) Pvt. Ltd.",
        industry: "Leather Footwear Exporters",
        headquarters: "Agra, Uttar Pradesh, India",
        description: "Established in 1987, Gupta H.C. Overseas is a leading manufacturer, designer, and star export house of premium fashion leather footwear, sandals, and boots to global markets.",
        imageUrl: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=600",
        logoUrl: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=200",
        hoverColor: "teal",
        hoverColorHex: "20, 184, 166",
        icon: (
            <svg className="w-6 h-6 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
        )
    },
    {
        name: "Swear Healthcare",
        fullName: "Swear Healthcare Private Limited",
        industry: "Medical Supplies & Latex Gloves",
        headquarters: "Dholpur, Rajasthan, India",
        description: "A fast-growing healthcare company manufacturing high-quality sterile latex surgical gloves, nitrile examination gloves, PPE kits, and hospital consumables.",
        imageUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=600",
        logoUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=200",
        hoverColor: "rose",
        hoverColorHex: "244, 63, 94",
        icon: (
            <svg className="w-6 h-6 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
        )
    },
    {
        name: "Dharma Steels",
        fullName: "Dharma Steels Private Limited",
        industry: "Structural Steel & TMT Manufacturing",
        headquarters: "Agra, Uttar Pradesh, India",
        description: "A major manufacturer and distributor of high-durability TMT steel bars, structural angles, steel girders, channels, and heavy infrastructure steel items.",
        imageUrl: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=600",
        logoUrl: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=200",
        hoverColor: "slate",
        hoverColorHex: "71, 85, 105",
        icon: (
            <svg className="w-6 h-6 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
            </svg>
        )
    },
    {
        name: "TSF Shoe",
        fullName: "TSF Shoe Factory (TSF Exports)",
        industry: "Footwear & Leather Manufacturing",
        headquarters: "Agra, Uttar Pradesh, India",
        description: "TSF Shoe is a respected footwear manufacturing company in Agra, producing uniform boots, dress shoes, and handcrafted casual leather footwear for domestic markets.",
        imageUrl: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&q=80&w=600",
        logoUrl: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&q=80&w=200",
        hoverColor: "cyan",
        hoverColorHex: "6, 182, 212",
        icon: (
            <svg className="w-6 h-6 text-cyan-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 16v-2a2 2 0 1 1 4 0v2m8 0v-2a2 2 0 1 1 4 0v2M12 8v8M8 12h8" />
            </svg>
        )
    },
    {
        name: "Kanpack Thermal Insulation",
        fullName: "Kanpack Insulations (Kohinoor Metfoam Private Limited)",
        industry: "Advanced Thermal & Radiant Insulation",
        headquarters: "Agra, Uttar Pradesh, India",
        description: "Kanpack specializes in high-performance thermal insulation foils, energy-saving reflective roof foils, and foam barrier sheets designed to optimize building thermodynamics.",
        imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600",
        logoUrl: "https://kanpackinsulation.com/images/logo.png",
        hoverColor: "yellow",
        hoverColorHex: "234, 179, 8",
        icon: (
            <svg className="w-6 h-6 text-yellow-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 6v12M6 12h12" />
            </svg>
        )
    }
];

const LandingHome = () => {
    const navigate = useNavigate();
    const { hash } = useLocation();
    const iconSize = 28;
    const [isQuoteOpen, setIsQuoteOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<typeof clientLogos[0] | null>(null);

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

            {/* Valuable Customers Section */}
            <section className="relative flex flex-col gap-14 overflow-hidden py-24 bg-transparent">
                {/* Decorative background blur shapes */}
                <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

                <style>{`
                  @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                  }
                  .animate-marquee-custom {
                    display: flex;
                    width: max-content;
                    animation: marquee 35s linear infinite;
                  }
                  .animate-marquee-custom:hover {
                    animation-play-state: paused;
                  }
                `}</style>
                
                <div className="flex flex-col gap-5 text-center max-w-3xl mx-auto px-4 relative z-10">
                    <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-indigo-50/80 dark:bg-indigo-950/80 border border-indigo-100/50 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-[0.25em] w-fit mx-auto shadow-sm">
                        <Building2 size={12} className="animate-pulse" />
                        Industry Leaders
                    </div>
                    <h2 className="text-4xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
                        Valuable <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Customers</span>
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto font-medium">
                        Powering supply chains and freight distribution networks for India's premier conglomerates.
                    </p>
                </div>

                <div className="relative w-full flex overflow-x-hidden py-4 group/marquee">
                    {/* Shadow fades on sides */}
                    <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-50/50 via-slate-50/20 to-transparent dark:from-slate-950/50 dark:via-slate-950/20 z-10 pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-50/50 via-slate-50/20 to-transparent dark:from-slate-950/50 dark:via-slate-950/20 z-10 pointer-events-none" />

                    <div className="animate-marquee-custom gap-12 pr-12">
                        {clientLogos.map((logo, idx) => (
                            <div 
                                key={idx} 
                                onClick={() => setSelectedClient(logo)}
                                className={`cursor-pointer flex items-center gap-6 px-10 py-6 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-premium border border-slate-100 dark:border-slate-800/80 hover:border-indigo-500/30 transition-all duration-500 ease-out group-hover/marquee:opacity-40 hover:!opacity-100 hover:!scale-105 hover:-translate-y-3 hover:shadow-2xl group shrink-0 ${
                                    idx % 2 === 0 ? "hover:rotate-1" : "hover:-rotate-1"
                                }`}
                            >
                                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-[1.5rem] border border-slate-100/50 dark:border-slate-700/50 flex items-center justify-center shrink-0 overflow-hidden p-3 transition-all duration-300 group-hover:scale-105">
                                    {logo.logoUrl ? (
                                        <img 
                                            src={logo.logoUrl} 
                                            alt={logo.name} 
                                            className="w-full h-full object-contain filter brightness-95 group-hover:brightness-100 group-hover:contrast-105 transition-all" 
                                            onError={(e) => {
                                                (e.target as HTMLElement).style.display = 'none';
                                                const parent = (e.target as HTMLElement).parentElement;
                                                if (parent) {
                                                    const svgPlaceholder = parent.querySelector('.svg-placeholder');
                                                    if (svgPlaceholder) (svgPlaceholder as HTMLElement).style.display = 'block';
                                                }
                                            }}
                                        />
                                    ) : null}
                                    <div className="svg-placeholder" style={{ display: logo.logoUrl ? 'none' : 'block' }}>
                                        {logo.icon}
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 transition-colors leading-tight">{logo.name}</span>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none pt-1">{logo.industry.split(' & ')[0]}</span>
                                </div>
                            </div>
                        ))}
                        {/* Duplicate for seamless loop */}
                        {clientLogos.map((logo, idx) => (
                            <div 
                                key={`dup-${idx}`} 
                                onClick={() => setSelectedClient(logo)}
                                className={`cursor-pointer flex items-center gap-6 px-10 py-6 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-premium border border-slate-100 dark:border-slate-800/80 hover:border-indigo-500/30 transition-all duration-500 ease-out group-hover/marquee:opacity-40 hover:!opacity-100 hover:!scale-105 hover:-translate-y-3 hover:shadow-2xl group shrink-0 ${
                                    idx % 2 === 0 ? "hover:rotate-1" : "hover:-rotate-1"
                                }`}
                            >
                                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-[1.5rem] border border-slate-100/50 dark:border-slate-700/50 flex items-center justify-center shrink-0 overflow-hidden p-3 transition-all duration-300 group-hover:scale-105">
                                    {logo.logoUrl ? (
                                        <img 
                                            src={logo.logoUrl} 
                                            alt={logo.name} 
                                            className="w-full h-full object-contain filter brightness-95 group-hover:brightness-100 group-hover:contrast-105 transition-all" 
                                            onError={(e) => {
                                                (e.target as HTMLElement).style.display = 'none';
                                                const parent = (e.target as HTMLElement).parentElement;
                                                if (parent) {
                                                    const svgPlaceholder = parent.querySelector('.svg-placeholder');
                                                    if (svgPlaceholder) (svgPlaceholder as HTMLElement).style.display = 'block';
                                                }
                                            }}
                                        />
                                    ) : null}
                                    <div className="svg-placeholder" style={{ display: logo.logoUrl ? 'none' : 'block' }}>
                                        {logo.icon}
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 transition-colors leading-tight">{logo.name}</span>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none pt-1">{logo.industry.split(' & ')[0]}</span>
                                </div>
                            </div>
                        ))}
                    </div>
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

            {/* Customer Details Modal */}
            <AnimatePresence>
                {selectedClient && (
                    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedClient(null)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />

                        {/* Modal Box */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", duration: 0.5 }}
                            className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 w-full max-w-2xl overflow-hidden relative z-10"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedClient(null)}
                                className="absolute top-6 right-6 z-20 p-2.5 rounded-full bg-slate-900/10 text-white hover:bg-slate-900/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 transition-all"
                            >
                                <X size={20} />
                            </button>

                            {/* Header image cover representing industry */}
                            <div className="h-48 w-full relative">
                                <img
                                    src={selectedClient.imageUrl}
                                    alt={selectedClient.industry}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                                <div className="absolute bottom-6 left-8 flex items-end gap-4">
                                    <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-xl flex items-center justify-center p-2.5 border border-slate-100 dark:border-slate-700 shrink-0">
                                        {selectedClient.logoUrl ? (
                                            <img
                                                src={selectedClient.logoUrl}
                                                alt={selectedClient.name}
                                                className="w-full h-full object-contain"
                                                onError={(e) => {
                                                    (e.target as HTMLElement).style.display = 'none';
                                                    const parent = (e.target as HTMLElement).parentElement;
                                                    if (parent) {
                                                        const placeholder = parent.querySelector('.modal-svg-placeholder');
                                                        if (placeholder) (placeholder as HTMLElement).style.display = 'block';
                                                    }
                                                }}
                                            />
                                        ) : null}
                                        <div className="modal-svg-placeholder" style={{ display: selectedClient.logoUrl ? 'none' : 'block' }}>
                                            {selectedClient.icon}
                                        </div>
                                    </div>
                                    <div className="text-white">
                                        <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">{selectedClient.industry}</span>
                                        <h3 className="text-2xl font-black tracking-tight">{selectedClient.name}</h3>
                                    </div>
                                </div>
                            </div>

                            {/* Details Content */}
                            <div className="p-8 flex flex-col gap-6">
                                <div className="flex flex-col gap-2">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Registered Name</h4>
                                    <p className="text-lg font-bold text-slate-900 dark:text-white leading-snug">{selectedClient.fullName}</p>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">About the Corporate Partner</h4>
                                    <p className="text-slate-600 dark:text-slate-300 text-sm font-medium leading-relaxed">{selectedClient.description}</p>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-slate-50 dark:border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                                            <MapPin size={20} />
                                        </div>
                                        <div>
                                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Headquarters</h5>
                                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{selectedClient.headquarters}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                                            <Building2 size={20} />
                                        </div>
                                        <div>
                                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Industry Sector</h5>
                                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{selectedClient.industry}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-end">
                                    <button
                                        onClick={() => setSelectedClient(null)}
                                        className="btn-primary !px-6 !py-2.5 text-xs font-black uppercase tracking-wider"
                                    >
                                        Close Details
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <QuoteModal
                isOpen={isQuoteOpen}
                onClose={() => setIsQuoteOpen(false)}
            />


        </div>
    );
};

export default LandingHome;
