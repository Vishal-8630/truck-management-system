import { ShieldAlert, Database, Search, Lock, UserCheck } from "lucide-react";

const PrivacyPolicy = () => {
    return (
        <div className="flex flex-col gap-16 pb-20 pt-10 font-plus-jakarta">
            <header className="flex flex-col gap-4 text-center max-w-3xl mx-auto">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <ShieldAlert size={28} />
                </div>
                <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-slate-900 italic">
                    Privacy <span className="text-indigo-600">Policy</span>
                </h1>
                <p className="text-slate-500 font-medium">Protecting your logistics and operational data.</p>
            </header>

            <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
                <section className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
                            <Database size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">1. Data Collection</h2>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                        Divyanshi Road Lines collects information necessary for logistics operations, including user contact information, shipment details, and real-time location tracking data for fleets. This ensures that we can provide accurate delivery services and transparent tracking.
                    </p>
                </section>

                <section className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-rose-50 p-3 rounded-xl text-rose-600">
                            <Search size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">2. How We Use Data</h2>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                        Data is used uniquely for service optimization: improving truck routes, managing delivery schedules, ensuring driver safety, and communicating shipment status to our clients. We do not sell your operational data to third parties.
                    </p>
                </section>

                <section className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
                            <Lock size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">3. Data Security</h2>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                        We implement industry-standard security protocols to protect all data stored within our management system. This includes encrypted connections and restricted access controls for all logistics databases.
                    </p>
                </section>

                <section className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600">
                            <UserCheck size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">4. Your Control</h2>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                        You have the right to request access to your information or withdrawal of certain data points, subject to operational requirements and legal compliance. For any data-related queries, please reach out to our privacy team.
                    </p>
                </section>
            </div>

            <div className="bg-slate-900 rounded-[3rem] p-12 text-center text-white max-w-4xl mx-auto flex flex-col gap-6 mt-10">
                <h3 className="text-2xl font-bold italic tracking-tighter">Your Data, Your Trust</h3>
                <p className="text-slate-400 leading-relaxed max-w-2xl mx-auto italic font-medium">
                    “Privacy in logistics is more than just compliance — it's the foundation of every delivery we make and every client relationship we build.”
                </p>
                <div className="w-12 h-1 bg-white/20 rounded-full mx-auto"></div>
                <p className="text-indigo-400 font-bold tracking-widest uppercase text-xs">Divyanshi Road Lines Data Protection Team</p>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
