import { useLocation, useNavigate } from "react-router-dom";
import { formatDate } from "@/utils/formatDate";
import JourneySettlement from "./JourneySettlement";
import type { JourneyType } from "@/types/journey";
import { useSettlements } from "@/hooks/useSettlements";
import { useMessageStore } from "@/store/useMessageStore";
import { FileText, User, Truck, Calendar, Clock, CheckCircle2, ArrowLeft, TrendingUp, Info, Calculator, Wallet } from "lucide-react";

const SettlementPreview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const addMessage = useMessageStore((s) => s.addMessage);
  const { useConfirmSettlementMutation } = useSettlements();
  const confirmMutation = useConfirmSettlementMutation();
  const { data, period, driver, dieselRate, extraExpense } = location.state || {};
  const emptyFieldValue = "—";
  const safeDate = (date?: string) => date ? formatDate(new Date(date)) : emptyFieldValue;

  // New Calculation Logic (Consistent across entire page)
  const kmEarnings = Number(data?.totals?.total_rate_per_km || 0);
  const driverExpense = Number(data?.totals?.total_driver_expense || 0);
  const startingCash = Number(data?.totals?.total_journey_starting_cash || 0);
  const extraDeductions = Number(extraExpense || 0);
  const dieselDiff = Number(data?.totals?.diesel_diff || 0);
  const dieselRateVal = Number(dieselRate || data?.totals?.diesel_rate || 0);

  // Logic: dieselDiff = Used - Given
  // If Given > Used (Shortage) -> diff < 0
  // If Given < Used (Bonus/Efficiency) -> diff > 0
  const isShortage = dieselDiff < 0;
  const isBonus = dieselDiff > 0;
  const dieselAdjustment = Math.abs(dieselDiff) * dieselRateVal;

  const drlSideTotal = kmEarnings + (isBonus ? dieselAdjustment : 0);
  const driverSideTotal = driverExpense + startingCash + extraDeductions + (isShortage ? dieselAdjustment : 0);

  // Revised Rule: A = Driver Side (Earnings + Bonus), B = DRL Side (Advances + Shortage)
  // Result = A - B
  const A = drlSideTotal;     // Step 01: Driver Side (Earnings + Bonus)
  const B = driverSideTotal;  // Step 02: DRL Side (Advances + Shortage)
  const finalBalance = A - B;
  const paymentStatus = finalBalance > 0 ? "DRL Needs to Pay" : finalBalance < 0 ? "Driver Needs to Pay" : "Balanced";

  const handleConfirmSettlementClick = async () => {
    try {
      await confirmMutation.mutateAsync({
        data: {
          ...data,
          totals: {
            ...data.totals,
            overall_total: Math.abs(finalBalance),
            payment_status: paymentStatus
          }
        },
        period,
        driver
      });
      addMessage({ type: "success", text: "Settlement confirmed successfully!" });
      navigate(`/journey/driver-detail/${driver._id}`);
    } catch {
      addMessage({ type: "error", text: "Failed to confirm settlement." });
    }
  };

  if (!data || !period || !driver) {
    return <div className="p-20 text-center"><p className="text-slate-500 font-bold">No preview data available.</p></div>;
  }

  return (
    <div className="flex flex-col gap-10 pb-20 max-w-5xl mx-auto">
      <div className="flex flex-col gap-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest transition-colors w-fit">
          <ArrowLeft size={14} /> Back to Settlement
        </button>
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight italic flex items-center gap-4">
            <FileText className="text-indigo-600 w-10 h-10 lg:w-12 lg:h-12" /> Settlement <span className="text-indigo-600">Report</span>
          </h1>
          <p className="text-slate-500 font-medium italic uppercase tracking-widest text-xs mt-2">Internal Driver Settlement Document</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: <User size={10} />, label: "Driver", value: driver.name, border: "border-l-indigo-500" },
          { icon: <Truck size={10} />, label: "Truck", value: data?.journeys?.[0]?.truck?.truck_no || "—", border: "border-l-slate-800" },
          { icon: <Calendar size={10} />, label: "Period", value: `${safeDate(period.from)} → ${safeDate(period.to)}`, border: "border-l-indigo-600" },
          { icon: <Clock size={10} />, label: "Generated", value: safeDate(String(new Date())), border: "border-l-indigo-200" },
        ].map((card, i) => (
          <div key={i} className={`card-premium p-6 flex flex-col gap-1 bg-white border-l-4 ${card.border}`}>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">{card.icon} {card.label}</span>
            <span className="text-base font-black text-slate-900 truncate">{card.value}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
          <h2 className="text-xl font-black text-slate-900 italic">Trip History Recap</h2>
        </div>
        <div className="flex flex-col">
          {data.journeys.map((j: JourneyType, i: number) => (
            <JourneySettlement key={i} journey={j} count={i + 1} />
          ))}
        </div>
      </div>

      {/* Updated: Calculation Worksheet Section */}
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <Calculator className="text-indigo-600" size={20} />
          <h2 className="text-xl font-black text-slate-900 italic uppercase">Settlement Calculation Worksheet</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Step 01: DRL Side (Earnings) */}
          <div className="card-premium p-8 flex flex-col gap-6 bg-slate-50/50 border-slate-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <TrendingUp size={80} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Step 01</span>
              <h3 className="text-lg font-black text-slate-900 uppercase italic">Driver's Side (A)</h3>
            </div>
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Base Km Earnings</span>
                <span className="text-sm font-black text-slate-900 font-mono italic">₹{kmEarnings.toLocaleString()}</span>
              </div>
              {isBonus && (
                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100 shadow-sm border-b-2 border-b-emerald-200 animate-in slide-in-from-left duration-300">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-emerald-600 uppercase italic">Efficiency Bonus</span>
                    <span className="text-[8px] font-bold text-emerald-400">Used {data?.totals?.total_diesel_used}L vs Given {data?.totals?.total_diesel_quantity}L</span>
                  </div>
                  <span className="text-sm font-black text-emerald-600 font-mono italic">+ ₹{dieselAdjustment.toLocaleString()}</span>
                </div>
              )}
              {!isBonus && (
                <div className="flex items-center justify-between p-4 bg-slate-100/50 rounded-2xl border border-slate-100 border-dashed opacity-60">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest text-[9px]">No Efficiency Bonus</span>
                  <span className="text-xs font-black text-slate-300 font-mono italic">₹0</span>
                </div>
              )}
              <div className="flex items-center justify-between px-2 pt-2">
                <span className="text-[10px] font-black text-indigo-500 uppercase">Sub-Total (A)</span>
                <span className="text-lg font-black text-indigo-600 italic">₹{drlSideTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Step 02: Driver Side (Received) */}
          <div className="card-premium p-8 flex flex-col gap-6 bg-slate-50/50 border-slate-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Wallet size={80} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Step 02</span>
              <h3 className="text-lg font-black text-slate-900 uppercase italic">DRL's Side (B)</h3>
            </div>
            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-100 shadow-sm">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Starting Cash</span>
                <span className="text-sm font-black text-slate-900 font-mono italic">₹{startingCash.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-100 shadow-sm">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Driver Expense</span>
                <span className="text-sm font-black text-slate-900 font-mono italic">₹{driverExpense.toLocaleString()}</span>
              </div>
              {extraDeductions > 0 && (
                <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-100 shadow-sm">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Extra Deductions</span>
                  <span className="text-sm font-black text-rose-600 font-mono italic">₹{extraDeductions.toLocaleString()}</span>
                </div>
              )}
              {isShortage && (
                <div className="flex items-center justify-between p-4 bg-rose-50 rounded-2xl border border-rose-100 shadow-sm border-b-2 border-b-rose-200 animate-in slide-in-from-right duration-300">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-rose-600 uppercase italic">Diesel Shortage</span>
                    <span className="text-[8px] font-bold text-rose-400">Used {data?.totals?.total_diesel_used}L vs Given {data?.totals?.total_diesel_quantity}L</span>
                  </div>
                  <span className="text-sm font-black text-rose-600 font-mono italic">+ ₹{dieselAdjustment.toLocaleString()}</span>
                </div>
              )}
              {!isShortage && (
                <div className="flex items-center justify-between p-4 bg-slate-100/50 rounded-2xl border border-slate-100 border-dashed opacity-60">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest text-[9px]">No Diesel Shortage</span>
                  <span className="text-xs font-black text-slate-300 font-mono italic">₹0</span>
                </div>
              )}
              <div className="flex items-center justify-between px-2 pt-2 mt-auto">
                <span className="text-[10px] font-black text-rose-500 uppercase">Sub-Total (B)</span>
                <span className="text-lg font-black text-rose-600 italic">₹{driverSideTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Step 03: Final Result */}
          <div className={`card-premium p-8 flex flex-col gap-6 border-2 relative overflow-hidden shadow-2xl group scale-105 origin-center ${finalBalance >= 0 ? "bg-slate-900 border-slate-800" : "bg-rose-900 border-rose-800"} text-white transition-all duration-500`}>
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <CheckCircle2 size={100} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em]">Final Balance</span>
              <h3 className="text-lg font-black text-white uppercase italic">Net Settlement</h3>
            </div>
            <div className="space-y-6 relative z-10 my-auto">
              <div className="flex flex-col items-center justify-center gap-2">
                <span className="text-[10px] font-black text-indigo-200 uppercase tracking-widest print:hidden">Equation: A - B</span>
                <div className="flex items-center gap-4 text-2xl font-black italic">
                  <span className="opacity-60 font-mono">₹{drlSideTotal.toLocaleString()}</span>
                  <span className="text-indigo-300 text-3xl font-light">-</span>
                  <span className="opacity-60 font-mono">₹{driverSideTotal.toLocaleString()}</span>
                </div>
              </div>
              <div className="h-px bg-white/20 w-full" />
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-black text-indigo-100 uppercase tracking-[0.3em] font-mono">
                  {paymentStatus.toUpperCase()}
                </span>
                <span className="text-5xl font-black italic tracking-tighter drop-shadow-lg drop-shadow-indigo-500/50">
                  ₹{Math.abs(finalBalance).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 p-8 lg:p-12 rounded-[3rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col gap-12">
          <div>
            <h2 className="text-2xl font-black text-white italic flex items-center gap-3">
              <TrendingUp className="text-indigo-400" /> Consolidated Summary
            </h2>
            <div className="w-20 h-1 bg-indigo-500/30 rounded-full mt-2" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10">
            {[
              { label: "Total Starting Cash", value: `₹${startingCash.toLocaleString()}` },
              { label: "Total Driver Expense", value: `₹${driverExpense.toLocaleString()}` },
              { label: "Total Diesel Expense", value: `₹${data?.totals?.total_diesel_expense}` },
              { label: "Total Distance", value: `${data?.totals?.total_distance} km`, accent: true },
              { label: "Km Earnings", value: `₹${kmEarnings.toLocaleString()}` },
              { label: "Average Mileage", value: `${data?.totals?.avg_mileage} km/l`, accent: true },
              { label: "Diesel Used", value: `${data?.totals?.total_diesel_used} L` },
              { label: "Diesel Given", value: `${data?.totals?.total_diesel_quantity} L` },
              { label: "Diesel Variance", value: `${Math.abs(dieselDiff)} L`, variance: true, diffVal: dieselDiff > 0 ? 1 : -1 },
            ].map((item: any, i) => (
              <div key={i} className="flex flex-col gap-1.5 px-4 border-l border-white/10 hover:border-indigo-500 transition-colors">
                <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">{item.label}</span>
                <span className={`text-xl font-black italic ${item.variance ? (item.diffVal < 0 ? "text-red-400" : "text-emerald-400") : item.accent ? "text-indigo-400" : "text-white"}`}>
                  {item.value}
                </span>
              </div>
            ))}

            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-white/10">
              <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 flex flex-col gap-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DRL's Total Payable</span>
                <span className="text-3xl font-black text-white italic">₹{drlSideTotal.toLocaleString()}</span>
              </div>
              <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 flex flex-col gap-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Driver's Total Received</span>
                <span className="text-3xl font-black text-white italic">₹{driverSideTotal.toLocaleString()}</span>
              </div>
              <div className={`${finalBalance >= 0 ? "bg-indigo-600 shadow-indigo-900/50" : "bg-rose-600 shadow-rose-900/50"} p-8 rounded-[2rem] shadow-xl flex flex-col gap-1 scale-105`}>
                <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">
                  {paymentStatus}
                </span>
                <span className="text-4xl font-black text-white italic">₹{Math.abs(finalBalance).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t border-white/10 print:hidden">
            <div className="flex items-center gap-3 text-slate-400">
              <Info size={16} />
              <p className="text-xs font-bold italic">Confirming will mark all included journeys as settled in the system.</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.print()}
                className="px-8 py-5 bg-slate-800 text-white rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 shadow-2xl hover:bg-slate-700 transition-all active:translate-y-0"
              >
                Print Report
              </button>
              <button
                onClick={handleConfirmSettlementClick}
                disabled={confirmMutation.isPending}
                className="w-full md:w-fit px-12 py-5 bg-white text-slate-900 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 shadow-2xl hover:bg-slate-50 hover:-translate-y-1 transition-all active:translate-y-0 disabled:opacity-60"
              >
                {confirmMutation.isPending ? <span className="animate-spin w-6 h-6 rounded-full border-2 border-slate-300 border-t-slate-900" /> : <CheckCircle2 size={24} className="text-indigo-600" />}
                Confirm Settlement
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          @page { size: auto; margin: 10mm; }
          body { background: white !important; font-size: 10pt; }
          .print\\:hidden, button, .ArrowLeft { display: none !important; }
          .card-premium { border: 1px solid #e2e8f0 !important; box-shadow: none !important; break-inside: avoid; }
          .bg-slate-900 { background: white !important; color: black !important; border: 1px solid #000 !important; padding: 20px !important; }
          .text-white { color: black !important; }
          .text-indigo-400, .text-indigo-300 { color: #4338ca !important; }
          .bg-white\\/5 { background: transparent !important; border: 1px solid #e2e8f0 !important; }
          .bg-indigo-600 { background: #eef2ff !important; color: black !important; border: 2px solid #4338ca !important; }
          .max-w-5xl { max-width: 100% !important; width: 100% !important; margin: 0 !important; }
        }
      `}</style>
    </div>
  );
};

export default SettlementPreview;
