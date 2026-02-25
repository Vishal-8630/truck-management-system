import React from "react";
import type { JourneyType } from "../../../../types/journey";
import { formatDate } from "../../../../utils/formatDate";
import { Calendar, Fuel, Wallet, AlertCircle, CheckCircle2 } from "lucide-react";

interface JourneySettlementProps {
  journey: JourneyType;
  count: number;
}

const JourneySettlement: React.FC<JourneySettlementProps> = ({
  journey,
  count,
}) => {
  const emptyFieldValue = "—";

  const safeDate = (date?: string) =>
    date ? formatDate(new Date(date)) : emptyFieldValue;

  return (
    <div className="card-premium overflow-hidden mb-10 border-slate-100 shadow-lg">
      <div className="bg-slate-900 p-6 lg:px-10 flex flex-col gap-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-indigo-500 rounded text-[10px] font-black uppercase tracking-widest">Journey #{String(count)}</span>
              <span className="text-xl font-black italic tracking-tight">{journey.from} <span className="text-indigo-400 mx-1">→</span> {journey.to}</span>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest leading-none mb-1 flex items-center gap-1">
                <Calendar size={10} /> Started
              </span>
              <span className="text-sm font-black">{safeDate(journey.journey_start_date)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest leading-none mb-1 flex items-center gap-1">
                <Calendar size={10} /> Ended
              </span>
              <span className="text-sm font-black">{safeDate(journey.journey_end_date)}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-4 flex items-center gap-2 relative z-10">
          {journey.settled ? (
            <>
              <CheckCircle2 size={14} className="text-emerald-400" />
              <span className="text-xs font-bold text-emerald-100 italic">This journey is settled and will not be included in this calculation.</span>
            </>
          ) : (
            <>
              <AlertCircle size={14} className="text-indigo-300" />
              <span className="text-xs font-bold text-indigo-100 italic">This journey is pending and will be settled now.</span>
            </>
          )}
        </div>
      </div>

      <div className="p-6 lg:p-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Driver Expenses */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
            <Wallet size={18} className="text-indigo-600" />
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest italic">Driver Expenses</h3>
          </div>

          <div className="overflow-hidden border border-slate-100 rounded-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason</th>
                  <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                  <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {journey.driver_expenses.map((expense, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-xs font-bold text-slate-700">{expense.reason}</td>
                    <td className="px-4 py-3 text-xs font-black text-slate-900 font-mono text-right">₹{expense.amount}</td>
                    <td className="px-4 py-3 text-xs font-bold text-slate-500 text-right">{safeDate(expense.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-indigo-50/50 p-4 rounded-2xl flex items-center justify-between border border-indigo-100/50">
            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Total Expense</span>
            <span className="text-lg font-black text-indigo-900 font-mono italic">₹{journey.total_driver_expense}</span>
          </div>
        </div>

        {/* Diesel Expenses */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
            <Fuel size={18} className="text-indigo-600" />
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest italic">Diesel Expenses</h3>
          </div>

          <div className="overflow-hidden border border-slate-100 rounded-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantity</th>
                  <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                  <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {journey.diesel_expenses.map((expense, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-xs font-bold text-slate-700">{expense.quantity} L</td>
                    <td className="px-4 py-3 text-xs font-black text-slate-900 font-mono text-right">₹{expense.amount}</td>
                    <td className="px-4 py-3 text-xs font-bold text-slate-500 text-right">{safeDate(expense.filling_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-indigo-50/50 p-4 rounded-2xl flex items-center justify-between border border-indigo-100/50">
            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Total Diesel Cost</span>
            <span className="text-lg font-black text-indigo-900 font-mono italic">₹{journey.total_diesel_expense}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JourneySettlement;
