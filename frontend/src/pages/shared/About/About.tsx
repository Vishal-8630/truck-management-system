import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Loading from "@/components/Loading";
import { motion } from "framer-motion";
import { CheckCircle2, Target, Eye, Truck, BarChart3, Clock, ShieldCheck, Fuel } from "lucide-react";

const About = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Loading />
  }

  const features = [
    { title: "Real-Time Tracking", desc: "Monitor every vehicle’s live location and status with precision.", icon: <Eye className="w-6 h-6" /> },
    { title: "Fleet Dashboard", desc: "Manage your entire fleet from one powerful, unified interface.", icon: <Truck className="w-6 h-6" /> },
    { title: "Performance Insights", desc: "Track and improve driver efficiency and safety with data.", icon: <BarChart3 className="w-6 h-6" /> },
    { title: "Automated Logs", desc: "Save hours of paperwork with auto-generated trip logs and reports.", icon: <Clock className="w-6 h-6" /> },
    { title: "Fuel & Expense", desc: "Keep operations cost-efficient with transparent expense tracking.", icon: <Fuel className="w-6 h-6" /> },
    { title: "Maintenance", desc: "Stay ahead with proactive service alerts and compliance tracking.", icon: <ShieldCheck className="w-6 h-6" /> }
  ];

  return (
    <div className="flex flex-col gap-24 lg:gap-32 pb-20">
      {/* Header Section */}
      <header className="flex flex-col gap-6 text-center max-w-4xl mx-auto pt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4"
        >
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-tight italic">
            About <span className="text-indigo-600">Divyanshi</span> Road Lines
          </h1>
          <p className="text-xl lg:text-2xl text-slate-500 font-medium">
            Driving India's Logistics Forward — One Mile at a Time
          </p>
        </motion.div>
      </header>

      {/* Intro & Mission */}
      <section className="grid lg:grid-cols-2 gap-16 items-start">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <span className="w-8 h-1 bg-indigo-600 rounded-full"></span>
              Who We Are
            </h2>
            <p className="text-lg text-slate-600 leading-loose">
              Founded with a vision to modernize India’s trucking and logistics industry,
              <span className="font-bold text-slate-900"> Divyanshi Road Lines</span> is a smart management system that connects drivers, fleet owners, and clients. We bring transparency and efficiency to every delivery — ensuring smooth operations from dispatch to destination.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <span className="w-8 h-1 bg-indigo-600 rounded-full"></span>
              Our Mission
            </h2>
            <p className="text-lg text-slate-600 leading-loose">
              Our mission is to simplify logistics through innovation and technology — optimizing truck routes, minimizing downtime, and ensuring on-time deliveries while keeping safety and customer satisfaction at the core of our operations.
            </p>
          </div>
        </div>

        <div className="bg-slate-50 p-8 lg:p-12 rounded-[2.5rem] border border-slate-100 relative">
          <Target className="absolute top-8 right-8 text-indigo-100 w-24 h-24" />
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-slate-900 mb-6 italic">Our Core Values</h3>
            <ul className="flex flex-col gap-4">
              {[
                "Uncompromising Transparency",
                "Technology-Driven Efficiency",
                "Unwavering Customer Trust",
                "Sustainable Logistics Future"
              ].map((val) => (
                <li key={val} className="flex items-center gap-3 text-slate-700 font-medium">
                  <CheckCircle2 className="text-indigo-600 w-5 h-5 shrink-0" />
                  {val}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="flex flex-col gap-12">
        <div className="text-center flex flex-col gap-4">
          <h2 className="text-4xl font-bold text-slate-900">What We Offer</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">Comprehensive solutions for the modern transporter and client.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-[2rem] shadow-premium border border-slate-50 flex flex-col gap-6"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                {feature.icon}
              </div>
              <div className="flex flex-col gap-2">
                <h4 className="text-xl font-bold text-slate-900">{feature.title}</h4>
                <p className="text-slate-500 leading-relaxed text-sm">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Founder Quote */}
      <section className="bg-indigo-600 rounded-[3rem] p-12 lg:p-20 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="flex flex-col items-center text-center gap-10 relative z-10">
          <blockquote className="text-2xl lg:text-4xl font-light italic leading-relaxed max-w-4xl">
            “At Divyanshi Road Lines, we believe logistics should be as fast as the road itself — efficient, transparent, and reliable. Every feature we build aims to empower transporters and drivers alike.”
          </blockquote>
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-1 bg-white/30 rounded-full mb-2"></div>
            <p className="text-xl font-bold tracking-widest uppercase">Gopal Chaudhary</p>
            <p className="text-indigo-200 font-medium uppercase text-xs tracking-[0.2em]">Founder, Divyanshi Road Lines</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-12 flex flex-col gap-8 items-center border-t border-slate-100">
        <h2 className="text-4xl font-bold text-slate-900">Join the Future of Smart Logistics</h2>
        <p className="text-slate-500 max-w-2xl text-lg">
          Ready to make your logistics operations smarter and more efficient? technology meets trust on every route.
        </p>
        <Link
          to="/#contact"
          className="btn-primary py-4 px-12 text-lg shadow-indigo-200"
        >
          Contact Us Today
        </Link>
      </section>
    </div>
  );
};

export default About;

