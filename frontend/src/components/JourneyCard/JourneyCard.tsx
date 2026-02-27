import React from "react";
import type { JourneyType } from "@/types/journey";
import { Truck, User, Calendar, CreditCard, ChevronRight, MapPin, Gauge, ShieldCheck, AlertCircle } from "lucide-react";
import { formatDate } from "@/utils/formatDate";
import { motion } from "framer-motion";

interface JourneyCardProps {
  journey: JourneyType;
}

const JourneyCard: React.FC<JourneyCardProps> = ({ journey }) => {
  const isCompleted = journey.status === "Completed";
  const isActive = journey.status === "Active";
  const isDelayed = journey.status === "Delayed";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="card-premium p-0 overflow-hidden group cursor-pointer border-slate-100 dark:border-slate-800 h-full flex flex-col bg-white dark:bg-slate-900"
    >
      {/* Header with Background Pattern */}
      <div className={`
        relative p-6 flex items-center justify-between text-white overflow-hidden
        ${isActive ? 'bg-indigo-600' : isCompleted ? 'bg-emerald-600' : isDelayed ? 'bg-rose-600' : 'bg-slate-600'}
      `}>
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 L100 0 L100 100 Z" fill="currentColor" />
          </svg>
        </div>

        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-[1.25rem] flex items-center justify-center shadow-lg border border-white/20">
            <Truck size={28} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Vehicle Unit</span>
              <div className="px-1.5 py-0.5 rounded bg-white/20 text-[8px] font-black uppercase tracking-wider backdrop-blur-md">
                {journey.status}
              </div>
            </div>
            <span className="text-xl font-black uppercase tracking-tight leading-none mt-1">{journey.truck?.truck_no || "N/A"}</span>
          </div>
        </div>

        <div className="relative z-10 w-10 h-10 rounded-xl border-2 border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-slate-900 transition-all duration-300">
          <ChevronRight size={20} strokeWidth={3} />
        </div>
      </div>

      <div className="p-6 flex flex-col gap-6 flex-1">
        {/* Key Info Strip */}
        <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800/50">
          <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm text-indigo-600 dark:text-indigo-400 border border-slate-50 dark:border-slate-700">
            <User size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">Assigned Driver</span>
            <span className="text-sm font-black text-slate-700 dark:text-slate-200">{(journey.driver as any)?.name || "Not Assigned"}</span>
          </div>
          {isActive && (
            <div className="ml-auto flex items-center gap-1 text-[10px] font-black text-emerald-500 uppercase">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              Live
            </div>
          )}
        </div>

        {/* Visual Route Path */}
        <div className="flex flex-col gap-5 px-2">
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center gap-1 mt-1 shrink-0">
              <div className="w-4 h-4 rounded-full border-4 border-indigo-100 dark:border-indigo-900/50 bg-indigo-600 shadow-sm ring-4 ring-indigo-50 dark:ring-indigo-900/10"></div>
              <div className="w-0.5 h-10 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
              <MapPin size={14} className="text-rose-600" strokeWidth={3} />
            </div>
            <div className="flex flex-col gap-4 flex-1">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">Origin Node</span>
                <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{journey.from || "Base Facility"}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">Destination Target</span>
                <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{journey.to || "Pending Delivery"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Mini-Grid */}
        <div className="grid grid-cols-2 gap-3 mt-auto pt-6 border-t border-slate-50 dark:border-slate-800">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 flex flex-col gap-1">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Calendar size={10} /> Departure
            </span>
            <span className="text-xs font-black text-slate-700 dark:text-slate-300">
              {formatDate(journey.journey_start_date)}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/20 flex flex-col gap-1 text-right">
            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1 justify-end">
              <CreditCard size={10} /> Expense
            </span>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 italic">
              ₹{Number(journey.total_expense || 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Utilization Footer Badge */}
        {isActive && (
          <div className="flex items-center gap-2 pb-2">
            <div className="h-1.5 flex-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '65%' }}
                className="h-full bg-indigo-500"
              />
            </div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest shrink-0">ETA: 2 Days</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default JourneyCard;
