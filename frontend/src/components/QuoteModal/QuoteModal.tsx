import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Truck, MapPin, Calendar, Package, Weight, User, Phone, Mail, Send } from 'lucide-react';
import api from '@/api/axios';
import { useMessageStore } from '@/store/useMessageStore';
import Button from '@/components/Button';

interface QuoteModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const QuoteModal: React.FC<QuoteModalProps> = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const { addMessage } = useMessageStore();

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phoneNumber: "",
        pickupLocation: "",
        dropLocation: "",
        cargoType: "",
        weight: "",
        truckType: "",
        pickupDate: "",
        message: ""
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const nextStep = () => {
        if (step === 1 && (!formData.pickupLocation || !formData.dropLocation || !formData.pickupDate)) {
            return addMessage({ type: "error", text: "Please fill pickup, drop, and date" });
        }
        if (step === 2 && (!formData.cargoType || !formData.weight || !formData.truckType)) {
            return addMessage({ type: "error", text: "Please fill load and vehicle details" });
        }
        setStep(prev => prev + 1);
    };

    const prevStep = () => setStep(prev => prev - 1);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.fullName || !formData.email || !formData.phoneNumber) {
            return addMessage({ type: "error", text: "Please fill contact details" });
        }

        setLoading(true);
        try {
            const { data } = await api.post("/quote", formData);
            addMessage({ type: "success", text: data.message });
            onClose();
            // Reset after close
            setTimeout(() => {
                setStep(1);
                setFormData({
                    fullName: "", email: "", phoneNumber: "", pickupLocation: "", dropLocation: "",
                    cargoType: "", weight: "", truckType: "", pickupDate: "", message: ""
                });
            }, 500);
        } catch (err: any) {
            addMessage({
                type: "error",
                text: err.response?.data?.message || "Failed to send quote request.",
            });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-premium overflow-hidden border border-white/20"
                >
                    {/* Header */}
                    <div className="bg-indigo-600 p-8 text-white relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <h2 className="text-3xl font-bold flex items-center gap-2 italic">
                                    Get a <span className="text-indigo-200">Quote</span>
                                </h2>
                                <p className="text-indigo-100 text-sm mt-1">Step {step} of 3: {step === 1 ? 'Route Info' : step === 2 ? 'Load Details' : 'Contact Info'}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                title="Close"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-6 h-1.5 bg-white/20 rounded-full relative overflow-hidden">
                            <motion.div
                                className="absolute inset-y-0 left-0 bg-white"
                                initial={{ width: "33.3%" }}
                                animate={{ width: `${(step / 3) * 100}%` }}
                            />
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 lg:p-12">
                        <div className="min-h-[250px]">
                            {step === 1 && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex flex-col gap-6"
                                >
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <MapPin size={14} className="text-indigo-500" /> Pickup From
                                            </label>
                                            <input
                                                type="text"
                                                name="pickupLocation"
                                                value={formData.pickupLocation}
                                                onChange={handleInputChange}
                                                placeholder="e.g. Agra, UP"
                                                className="input-field"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <MapPin size={14} className="text-rose-500" /> Drop To
                                            </label>
                                            <input
                                                type="text"
                                                name="dropLocation"
                                                value={formData.dropLocation}
                                                onChange={handleInputChange}
                                                placeholder="e.g. Mumbai, MH"
                                                className="input-field"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Calendar size={14} className="text-indigo-500" /> Pickup Date
                                        </label>
                                        <input
                                            type="date"
                                            name="pickupDate"
                                            value={formData.pickupDate}
                                            onChange={handleInputChange}
                                            className="input-field"
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex flex-col gap-6"
                                >
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <Package size={14} className="text-indigo-500" /> Cargo Type
                                            </label>
                                            <input
                                                type="text"
                                                name="cargoType"
                                                value={formData.cargoType}
                                                onChange={handleInputChange}
                                                placeholder="e.g. Furniture, Steel"
                                                className="input-field"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <Weight size={14} className="text-indigo-500" /> Weight (Approx)
                                            </label>
                                            <input
                                                type="text"
                                                name="weight"
                                                value={formData.weight}
                                                onChange={handleInputChange}
                                                placeholder="e.g. 10 Tonnes"
                                                className="input-field"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Truck size={14} className="text-indigo-500" /> Required Truck Type
                                        </label>
                                        <select
                                            name="truckType"
                                            value={formData.truckType}
                                            onChange={handleInputChange}
                                            className="input-field appearance-none"
                                        >
                                            <option value="">Select Trailer / Truck</option>
                                            <option value="Open Truck - 19ft">Open Truck - 19ft</option>
                                            <option value="Container - 20ft">Container - 20ft</option>
                                            <option value="Container - 32ft MX">Container - 32ft MX</option>
                                            <option value="Taurus 10-Wheeler">Taurus 10-Wheeler</option>
                                            <option value="Trailer - 40ft">Trailer - 40ft</option>
                                        </select>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex flex-col gap-6"
                                >
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <User size={14} className="text-indigo-500" /> Full Name
                                            </label>
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
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <Phone size={14} className="text-indigo-500" /> Phone Number
                                            </label>
                                            <input
                                                type="text"
                                                name="phoneNumber"
                                                value={formData.phoneNumber}
                                                onChange={handleInputChange}
                                                placeholder="+91 XXXXX XXXXX"
                                                className="input-field"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Mail size={14} className="text-indigo-500" /> Email Address
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="john@example.com"
                                            className="input-field"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-4 mt-8 pt-8 border-t border-slate-100">
                            {step > 1 && (
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="px-8 py-4 bg-slate-50 text-slate-500 rounded-2xl font-bold flex-1 hover:bg-slate-100 transition-colors"
                                >
                                    Previous
                                </button>
                            )}
                            {step < 3 ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold flex-1 shadow-indigo-200 shadow-xl hover:bg-indigo-700 transition-colors"
                                >
                                    Next Step
                                </button>
                            ) : (
                                <Button
                                    type="submit"
                                    isLoading={loading}
                                    className="py-4 text-lg flex-1 shadow-indigo-200"
                                    icon={<Send size={20} />}
                                >
                                    Request Estimate
                                </Button>
                            )}
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default QuoteModal;
