import React from "react";
import type { JourneyType } from "../../types/journey";
import { Truck, User, Calendar, CreditCard, ChevronRight, Navigation } from "lucide-react";
import { formatDate } from "../../utils/formatDate";

interface JourneyCardProps {
  journey: JourneyType;
}

const JourneyCard: React.FC<JourneyCardProps> = ({ journey }) => {
  return (
    <div className="card-premium p-0 overflow-hidden hover:-translate-y-1 transition-all duration-300 group cursor-pointer border-slate-100 h-full flex flex-col">
      <div className="bg-indigo-600 p-6 flex items-center justify-between text-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg">
            <Truck size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Truck No.</span>
            <span className="text-lg font-extrabold uppercase tracking-tight leading-none">{journey.truck.truck_no}</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-indigo-600 transition-colors">
          <ChevronRight size={20} />
        </div>
      </div>

      <div className="p-6 flex flex-col gap-6 flex-1">
        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-indigo-600">
            <User size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Assigned Driver</span>
            <span className="font-bold text-slate-700">{journey.driver.name}</span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center gap-1 mt-1">
              <div className="w-3 h-3 rounded-full bg-indigo-500 border-2 border-white shadow-sm ring-4 ring-indigo-50"></div>
              <div className="w-0.5 h-10 bg-slate-100 rounded-full"></div>
              <Navigation size={12} className="text-slate-300 rotate-180" />
            </div>
            <div className="flex flex-col gap-4 flex-1">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Origin</span>
                <span className="text-sm font-bold text-slate-900">{journey.from}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Destination</span>
                <span className="text-sm font-bold text-slate-900">{journey.to}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
              <Calendar size={10} /> Date
            </span>
            <span className="text-xs font-bold text-slate-600">{formatDate(new Date(journey.journey_start_date))}</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1 justify-end">
              <CreditCard size={10} /> Expenses
            </span>
            <span className="text-sm font-extrabold text-indigo-600">₹{journey.total_expense || "0"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JourneyCard;

