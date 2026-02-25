import HeroSectionImg from "../../assets/truck.jpg";
import { Truck, Package, Share2, Building2, Settings, Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import ServiceCard from "../../components/ServiceCard";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Home = () => {
  const navigate = useNavigate();
  const { hash } = useLocation();
  const iconSize = 28;
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

  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [hash]);

  return (
    <div className="flex flex-col gap-24 lg:gap-32 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 lg:pt-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></span>
              The Future of Logistics
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1]">
              Reliable <span className="text-indigo-600">Logistics</span> & Supply Chain Partner
            </h1>
            <p className="text-lg lg:text-xl text-slate-500 max-w-lg leading-relaxed">
              Delivering Excellence in Freight, Transportation, and Supply Chain Solutions across India with precision and speed.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="btn-primary flex items-center gap-2 group">
                Get a Quote
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <a href="#contact" className="btn-secondary">
                Contact Us
              </a>
            </div>

            <div className="flex items-center gap-8 mt-4 pt-8 border-t border-slate-100">
              <div>
                <p className="text-2xl font-bold text-slate-900">15+</p>
                <p className="text-sm text-slate-400 font-medium">Years Experience</p>
              </div>
              <div className="w-px h-8 bg-slate-100"></div>
              <div>
                <p className="text-2xl font-bold text-slate-900">500+</p>
                <p className="text-sm text-slate-400 font-medium">Clients Happy</p>
              </div>
              <div className="w-px h-8 bg-slate-100"></div>
              <div>
                <p className="text-2xl font-bold text-slate-900">1M+</p>
                <p className="text-sm text-slate-400 font-medium">Miles Traveled</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-indigo-100 rounded-[2rem] blur-2xl opacity-30 -z-10 rotate-3"></div>
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white">
              <img
                src={HeroSectionImg}
                alt="Trucking Excellence"
                className="w-full h-[500px] object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            {/* Floating Card */}
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-4 border border-slate-50">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                <Truck size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Real-Time</p>
                <p className="text-sm font-bold text-slate-900">Global Tracking</p>
              </div>
            </div>
          </motion.div>
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
                <p className="text-3xl font-bold mb-1">99%</p>
                <p className="text-xs text-indigo-100 uppercase tracking-widest font-bold">Accuracy rate</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-3xl border border-white/20 mt-8">
                <p className="text-3xl font-bold mb-1">24/7</p>
                <p className="text-xs text-indigo-100 uppercase tracking-widest font-bold">Support Ready</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="flex flex-col gap-12">
        <div className="flex flex-col gap-4 text-center max-w-2xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 italic">Our Expertise</h2>
          <p className="text-slate-500">Comprehensive logistics solutions designed to push your business boundaries and ensures timely delivery.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {cardDate.map((card, index) => (
            <ServiceCard
              key={index}
              icon={card.icon}
              title={card.title}
              description={card.description}
              detail={card.detail}
            />
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="relative pt-12 border-t border-slate-100">
        <div className="grid lg:grid-cols-2 gap-20">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-4 text-center lg:text-left">
              <h2 className="text-4xl font-bold text-slate-900">Get in Touch</h2>
              <p className="text-slate-500">Have a question or need a quote? Reach out to us today.</p>
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex items-start gap-6 group">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all duration-300 shadow-sm border border-slate-100">
                  <MapPin size={28} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">Our Location</h4>
                  <p className="text-slate-500 leading-relaxed max-w-xs pt-1">Plot No.230,231, Sec-6 Near RTO Office, Agra, UP – 282007</p>
                </div>
              </div>

              <div className="flex items-start gap-6 group">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all duration-300 shadow-sm border border-slate-100">
                  <Phone size={28} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">Direct Contact</h4>
                  <p className="text-slate-500 leading-relaxed pt-1">+91 8630836045 / +91 7983635608</p>
                </div>
              </div>

              <div className="flex items-start gap-6 group">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all duration-300 shadow-sm border border-slate-100">
                  <Mail size={28} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">Email Address</h4>
                  <p className="text-slate-500 leading-relaxed pt-1 font-medium">drldivyanshi@gmail.com</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 lg:p-12 rounded-[2.5rem] shadow-premium border border-slate-100">
            <h3 className="text-2xl font-bold text-slate-900 mb-8">Send Inquiry</h3>
            <form className="flex flex-col gap-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                  <input type="text" placeholder="John Doe" className="input-field" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                  <input type="email" placeholder="john@example.com" className="input-field" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Subject</label>
                <input type="text" placeholder="Inquiry about freight services" className="input-field" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your Message</label>
                <textarea placeholder="Tell us about your requirements..." className="input-field min-h-[120px] resize-none"></textarea>
              </div>
              <button className="btn-primary py-4 text-lg">Send Message</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

