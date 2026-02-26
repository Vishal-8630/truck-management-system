import { Shield, Scale, FileText, Ban, AlertCircle } from "lucide-react";

const TermsConditions = () => {
    return (
        <div className="flex flex-col gap-16 pb-20 pt-10">
            <header className="flex flex-col gap-4 text-center max-w-3xl mx-auto">
                <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-slate-900 italic">
                    Terms & <span className="text-indigo-600">Conditions</span>
                </h1>
                <p className="text-slate-500 font-medium">Last Updated: February 2026</p>
            </header>

            <div className="grid lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
                <div className="lg:col-span-2 flex flex-col gap-10">
                    <section className="flex flex-col gap-4">
                        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                            <Scale className="text-indigo-600 w-6 h-6" /> 1. Acceptance of Terms
                        </h2>
                        <p className="text-slate-600 leading-relaxed">
                            By accessing and using the services of Divyanshi Road Lines, you agree to comply with and be bound by these Terms and Conditions. Our services include but are not limited to freight transportation, supply chain management, and vehicle tracking systems.
                        </p>
                    </section>

                    <section className="flex flex-col gap-4">
                        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                            <Shield className="text-indigo-600 w-6 h-6" /> 2. Service Description
                        </h2>
                        <p className="text-slate-600 leading-relaxed">
                            Divyanshi Road Lines provides logistics solutions across India. We facilitate the movement of goods, management of fleets, and real-time shipment monitoring. We reserve the right to modify or discontinue any part of the service with or without notice.
                        </p>
                    </section>

                    <section className="flex flex-col gap-4">
                        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                            <FileText className="text-indigo-600 w-6 h-6" /> 3. User Obligations
                        </h2>
                        <ul className="list-disc list-inside text-slate-600 flex flex-col gap-2">
                            <li>Users must provide accurate information for all booking and inquiries.</li>
                            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                            <li>Unauthorized use of our management system is strictly prohibited.</li>
                        </ul>
                    </section>

                    <section className="flex flex-col gap-4">
                        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                            <Ban className="text-indigo-600 w-6 h-6" /> 4. Prohibited Activities
                        </h2>
                        <p className="text-slate-600 leading-relaxed">
                            Users are prohibited from using the platform for any illegal purpose, including the transportation of prohibited or hazardous materials without proper documentation and authorization.
                        </p>
                    </section>
                </div>

                <aside className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 h-fit sticky top-32">
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-3 text-indigo-600">
                            <AlertCircle size={24} />
                            <h4 className="font-bold uppercase tracking-wider text-sm">Important Note</h4>
                        </div>
                        <p className="text-sm text-slate-500 leading-normal">
                            These terms are legally binding. If you do not agree with any part of these terms, you must not use our services or platform.
                        </p>
                        <div className="pt-6 border-t border-slate-200">
                            <h5 className="font-bold text-slate-900 mb-2">Need Help?</h5>
                            <p className="text-xs text-slate-400">If you have any questions regarding these terms, please contact our support team at drldivyanshi@gmail.com</p>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default TermsConditions;
