import { useLocation, useNavigate } from "react-router-dom";
import { formatDate } from "@/utils/formatDate";
import JourneySettlement from "./JourneySettlement";
import type { JourneyType } from "@/types/journey";
import { useSettlements } from "@/hooks/useSettlements";
import { useMessageStore } from "@/store/useMessageStore";
import { FileText, User, Truck, Calendar, Clock, CheckCircle2, ArrowLeft, TrendingUp, Info } from "lucide-react";

const SettlementPreview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const addMessage = useMessageStore((s) => s.addMessage);
  const { useConfirmSettlementMutation } = useSettlements();
  const confirmMutation = useConfirmSettlementMutation();
  const { data, period, driver } = location.state || {};
  const emptyFieldValue = "—";
  const safeDate = (date?: string) => date ? formatDate(new Date(date)) : emptyFieldValue;

  const handleConfirmSettlementClick = async () => {
    try {
      await confirmMutation.mutateAsync({ data, period, driver });
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
              { label: "Total Starting Cash", value: `₹${data?.totals?.total_journey_starting_cash}` },
              { label: "Total Driver Expense", value: `₹${data?.totals?.total_driver_expense}` },
              { label: "Total Diesel Expense", value: `₹${data?.totals?.total_diesel_expense}` },
              { label: "Total Distance", value: `${data?.totals?.total_distance} km`, accent: true },
              { label: "Km Earnings", value: `₹${data?.totals?.total_rate_per_km}` },
              { label: "Average Mileage", value: `${data?.totals?.avg_mileage} km/l`, accent: true },
              { label: "Diesel Used", value: `${data?.totals?.total_diesel_used} L` },
              { label: "Diesel Given", value: `${data?.totals?.total_diesel_quantity} L` },
              { label: "Diesel Variance", value: `${data?.totals?.diesel_diff} L`, variance: true, diffVal: data?.totals?.diesel_diff },
            ].map((item: any, i) => (
              <div key={i} className="flex flex-col gap-1.5 px-4 border-l border-white/10 hover:border-indigo-500 transition-colors">
                <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">{item.label}</span>
                <span className={`text-xl font-black italic ${item.variance ? (Number(item.diffVal) < 0 ? "text-red-400" : "text-emerald-400") : item.accent ? "text-indigo-400" : "text-white"}`}>
                  {item.value}
                </span>
              </div>
            ))}

            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-white/10">
              <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 flex flex-col gap-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Driver's Payout</span>
                <span className="text-3xl font-black text-white italic">₹{data?.totals?.driver_total}</span>
              </div>
              <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 flex flex-col gap-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Owner's Share</span>
                <span className="text-3xl font-black text-white italic">₹{data?.totals?.owner_total}</span>
              </div>
              <div className="bg-indigo-600 p-8 rounded-[2rem] shadow-xl shadow-indigo-900/50 flex flex-col gap-1 scale-105">
                <span className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Net Payable</span>
                <span className="text-4xl font-black text-white italic">₹{data?.totals?.overall_total}</span>
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
