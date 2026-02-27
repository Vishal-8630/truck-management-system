import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Linkedin, Facebook, Twitter, ShieldCheck } from "lucide-react";

const BottomBar = () => {
  return (
    <div className="bg-slate-900 text-white pt-24 pb-12 px-6 transition-colors duration-500 border-t border-white/5 font-plus-jakarta relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-indigo-500/10 blur-[120px] rounded-full -z-0"></div>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-4 gap-12 relative z-10">
        <div className="flex flex-col gap-6 lg:col-span-1">
          <h2 className="text-3xl font-bold flex items-center gap-2 italic">
            <span className="text-indigo-400">Divyanshi</span> Road Lines
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed font-medium">
            Powering India's supply chain with technology-driven logistics, safe transit, and uncompromising transparency since 2009.
          </p>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-indigo-500/20 hover:border-indigo-500/50 transition-all">
              <Linkedin size={18} className="text-slate-400 hover:text-indigo-400" />
            </a>
            <a href="#" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-indigo-500/20 hover:border-indigo-500/50 transition-all">
              <Facebook size={18} className="text-slate-400 hover:text-indigo-400" />
            </a>
            <a href="#" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-indigo-500/20 hover:border-indigo-500/50 transition-all">
              <Twitter size={18} className="text-slate-400 hover:text-indigo-400" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 lg:col-span-2">
          <div className="flex flex-col gap-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Navigation</h4>
            <div className="flex flex-col gap-4 text-sm font-bold text-slate-400">
              <Link to="/" className="hover:text-indigo-400 transition-colors w-fit">Home</Link>
              <Link to="/about" className="hover:text-indigo-400 transition-colors w-fit">About Company</Link>
              <Link to="/services" className="hover:text-indigo-400 transition-colors w-fit">Our Services</Link>
              <Link to="/fleet" className="hover:text-indigo-400 transition-colors w-fit">Vehicle Fleet</Link>
              <Link to="/contact" className="hover:text-indigo-400 transition-colors w-fit">Contact Us</Link>
              <Link to="/faq" className="hover:text-indigo-400 transition-colors w-fit">FAQ</Link>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Legal</h4>
            <div className="flex flex-col gap-4 text-sm font-bold text-slate-400">
              <Link to="/privacy-policy" className="hover:text-indigo-400 transition-colors w-fit">Privacy Policy</Link>
              <Link to="/terms-and-conditions" className="hover:text-indigo-400 transition-colors w-fit">Terms of Service</Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-1">
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Get in Touch</h4>
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <MapPin size={18} className="text-indigo-400 mt-1 shrink-0" />
              <p className="text-sm text-slate-400 leading-relaxed">
                Plot No.230,231, Sec-6 Near RTO Office, Agra, UP – 282007
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={18} className="text-indigo-400 shrink-0" />
              <p className="text-sm text-slate-400">+91 8630836045</p>
            </div>
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-indigo-400 shrink-0" />
              <a href="mailto:drldivyanshi@gmail.com" className="text-sm text-slate-400 hover:text-white transition-colors">
                drldivyanshi@gmail.com
              </a>
            </div>
          </div>
          {/* Trust Badge */}
          <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
            <ShieldCheck className="text-green-500 w-8 h-8 shrink-0" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-300">ISO Certified</p>
              <p className="text-[11px] text-slate-500 italic">Trusted Logistics Partner</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-12 mt-20 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          © {new Date().getFullYear()} Divyanshi Road Lines Private Limited. All rights reserved.
        </p>
        <div className="flex gap-6 items-center">
          <div className="flex gap-2 items-center">
            <div className="w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-[10px] font-black text-indigo-400">IN</div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mainland India</span>
          </div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-l border-white/10 pl-6 hidden sm:block">
            Designed for Excellence
          </div>
        </div>
      </div>
    </div>
  );
};

export default BottomBar;
