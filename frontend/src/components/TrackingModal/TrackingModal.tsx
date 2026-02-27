import { motion } from "framer-motion";
import { X, Truck, MapPin, Calendar, Clock, CheckCircle2, Navigation, PackageCheck, ShieldAlert } from "lucide-react";
import { formatDate } from "@/utils/formatDate";

interface TrackingModalProps {
    isOpen: boolean;
    onClose: () => void;
    trackingData: any;
    isLoading: boolean;
}

const TrackingModal = ({ isOpen, onClose, trackingData, isLoading }: TrackingModalProps) => {
    if (!isOpen) return null;

    const steps = [
        { label: "Booked", icon: <Calendar size={18} />, status: "Booking Center" },
        { label: "In Transit", icon: <Truck size={18} />, status: "Active" },
        { label: "Delivered", icon: <PackageCheck size={18} />, status: "Completed" },
    ];

    const getCurrentStep = () => {
        if (!trackingData) return 0;
        if (trackingData.status === "Completed") return 2;
        if (trackingData.status === "Active" || trackingData.status === "Processing") return 1;
        return 0;
    };

    const currentStep = getCurrentStep();

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 lg:p-6">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800"
            >
                {/* Header */}
                <div className="bg-indigo-600 p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                    <div className="relative z-10 flex justify-between items-start">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-indigo-200">Shipment Status</span>
                            <h2 className="text-3xl font-black italic tracking-tight uppercase">Track Result</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className="p-8 lg:p-10 flex flex-col gap-10">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Searching Logistics Database...</p>
                        </div>
                    ) : trackingData ? (
                        <>
                            {/* Tracker Visual */}
                            <div className="relative flex justify-between items-start pt-4">
                                <div className="absolute top-[22px] left-6 right-6 h-1 bg-slate-100 dark:bg-slate-800 rounded-full">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                                        className="h-full bg-indigo-600 rounded-full"
                                    />
                                </div>

                                {steps.map((step, idx) => (
                                    <div key={idx} className="relative z-10 flex flex-col items-center gap-3">
                                        <div className={`
                      w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg
                      ${idx <= currentStep
                                                ? 'bg-indigo-600 text-white shadow-indigo-200 dark:shadow-indigo-900/20'
                                                : 'bg-white dark:bg-slate-800 text-slate-300 border border-slate-100 dark:border-slate-700 shadow-none'}
                    `}>
                                            {idx < currentStep ? <CheckCircle2 size={20} /> : step.icon}
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${idx <= currentStep ? 'text-indigo-600' : 'text-slate-300'}`}>
                                            {step.label}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Data Grid */}
                            <div className="grid grid-cols-2 gap-8">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <MapPin size={12} className="text-indigo-500" /> Current Location
                                    </span>
                                    <p className="text-lg font-black text-slate-900 dark:text-white uppercase italic">{trackingData.last_location}</p>
                                    <span className="text-[10px] text-slate-400 font-bold">Updated: {formatDate(new Date(trackingData.last_update))}</span>
                                </div>

                                <div className="flex flex-col gap-1 text-right">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 justify-end">
                                        ETA Delivery <Clock size={12} className="text-indigo-500" />
                                    </span>
                                    <p className="text-lg font-black text-slate-900 dark:text-white uppercase italic">
                                        {trackingData.estimated_delivery === "TBD" ? "TBD" : formatDate(new Date(trackingData.estimated_delivery))}
                                    </p>
                                    <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">{trackingData.status === 'Completed' ? 'Delivered' : 'On Track'}</span>
                                </div>

                                <div className="col-span-2 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">LR Number</span>
                                        <p className="text-sm font-black text-indigo-600">{trackingData.lr_no}</p>
                                    </div>
                                    <div className="flex flex-col gap-1 text-right">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Route</span>
                                        <p className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase italic">
                                            {trackingData.origin} <Navigation size={10} className="inline mx-1" /> {trackingData.destination}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
                            <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-500">
                                <ShieldAlert size={32} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white italic">Shipment Not Found</h3>
                                <p className="text-sm text-slate-500 font-medium">Please verify the LR number and try again. Contact support if the issue persists.</p>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-center">
                        <button
                            onClick={onClose}
                            className="px-10 py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all"
                        >
                            Close Tracking
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default TrackingModal;
