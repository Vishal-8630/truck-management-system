import { useLocation, useNavigate } from "react-router-dom";
import { formatDate } from "../../../../utils/formatDate";
import JourneySettlement from "./JourneySettlement";
import type { JourneyType } from "../../../../types/journey";
import type { AppDispatch } from "../../../../app/store";
import { useDispatch } from "react-redux";
import { confirmSettlementAsync } from "../../../../features/settlement";
import { addMessage } from "../../../../features/message";
import { FileText, User, Truck, Calendar, Clock, CheckCircle2, ArrowLeft, TrendingUp, Info } from "lucide-react";

const SettlementPreview = () => {
  const location = useLocation();
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const { data, period, driver } = location.state || {};
  const emptyFieldValue = "—";

  const safeDate = (date?: string) =>
    date ? formatDate(new Date(date)) : emptyFieldValue;

  const handleConfirmSettlementClick = async () => {
    try {
      const resultAction = await dispatch(confirmSettlementAsync({ data, period, driver }));

      if (confirmSettlementAsync.fulfilled.match(resultAction)) {
        navigate(`/journey/driver-detail/${driver._id}`);
        dispatch(addMessage({ type: "success", text: "Settlement confirmed" }));
      } else if (confirmSettlementAsync.rejected.match(resultAction)) {
        const error = resultAction.payload;
        if (error) {
          dispatch(addMessage({ type: "error", text: "Failed to confirm settlement" }));
        }
      }
    } catch (error: any) {
      console.log("Error while confirming settlement: ", error);
    }
  }

  if (!data || !period || !driver) {
    return <div className="p-20 text-center"><p className="text-slate-500 font-bold">No preview data available.</p></div>;
  }

  return (
    <div className="flex flex-col gap-10 pb-20 max-w-5xl mx-auto">
      <div className="flex flex-col gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest transition-colors w-fit"
        >
          <ArrowLeft size={14} />
          Back to Settlement
        </button>
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight italic flex items-center gap-4">
            <FileText className="text-indigo-600 w-10 h-10 lg:w-12 lg:h-12" />
            Settlement <span className="text-indigo-600">Report</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg italic uppercase tracking-widest text-xs">Internal Driver Settlement Document</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-premium p-6 flex flex-col gap-1 bg-white border-l-4 border-l-indigo-500">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <User size={10} /> Driver
          </span>
          <span className="text-lg font-black text-slate-900 truncate">{driver.name}</span>
        </div>
        <div className="card-premium p-6 flex flex-col gap-1 bg-white border-l-4 border-l-slate-800">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <Truck size={10} /> Truck
          </span>
          <span className="text-lg font-black text-slate-900">{data?.journeys?.[0]?.truck?.truck_no || "—"}</span>
        </div>
        <div className="card-premium p-6 flex flex-col gap-1 bg-white border-l-4 border-l-indigo-600">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <Calendar size={10} /> Period
          </span>
          <span className="text-sm font-black text-slate-700">{safeDate(period.from)} <span className="text-slate-300">→</span> {safeDate(period.to)}</span>
        </div>
        <div className="card-premium p-6 flex flex-col gap-1 bg-white border-l-4 border-l-indigo-200">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <Clock size={10} /> Generated
          </span>
          <span className="text-sm font-black text-slate-700">{safeDate(String(new Date()))}</span>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
          <h2 className="text-xl font-black text-slate-900 italic">Trip History Recap</h2>
        </div>
        <div className="flex flex-col">
          {data.journeys.map((j: JourneyType, i: number) => (
            <JourneySettlement key={i} journey={j} count={i + 1} />
          ))}
        </div>
      </div>

      <div className="bg-slate-900 p-8 lg:p-12 rounded-[3rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col gap-12">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black text-white italic flex items-center gap-3">
              <TrendingUp className="text-indigo-400" />
              Consolidated Summary
            </h2>
            <div className="w-20 h-1 bg-indigo-500/30 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10">
            <div className="flex flex-col gap-1.5 px-4 border-l border-white/10 hover:border-indigo-500 transition-colors">
              <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Total Starting Cash</span>
              <span className="text-xl font-black text-white italic">₹{data?.totals?.total_journey_starting_cash}</span>
            </div>
            <div className="flex flex-col gap-1.5 px-4 border-l border-white/10 hover:border-indigo-500 transition-colors">
              <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Total Driver Expense</span>
              <span className="text-xl font-black text-white italic">₹{data?.totals?.total_driver_expense}</span>
            </div>
            <div className="flex flex-col gap-1.5 px-4 border-l border-white/10 hover:border-indigo-500 transition-colors">
              <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Total Diesel Expense</span>
              <span className="text-xl font-black text-white italic">₹{data?.totals?.total_diesel_expense}</span>
            </div>
            <div className="flex flex-col gap-1.5 px-4 border-l border-white/10 hover:border-indigo-500 transition-colors">
              <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Total Distance Covered</span>
              <span className="text-xl font-black text-indigo-400 italic">{data?.totals?.total_distance} <span className="text-xs uppercase">km</span></span>
            </div>
            <div className="flex flex-col gap-1.5 px-4 border-l border-white/10 hover:border-indigo-500 transition-colors">
              <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Overall Earnings (Km)</span>
              <span className="text-xl font-black text-white italic">₹{data?.totals?.total_rate_per_km}</span>
            </div>
            <div className="flex flex-col gap-1.5 px-4 border-l border-white/10 hover:border-indigo-500 transition-colors">
              <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Average Mileage</span>
              <span className="text-xl font-black text-indigo-400 italic">{data?.totals?.avg_mileage} <span className="text-xs uppercase">km/l</span></span>
            </div>
            <div className="flex flex-col gap-1.5 px-4 border-l border-white/10 hover:border-indigo-500 transition-colors">
              <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Total Diesel Used</span>
              <span className="text-xl font-black text-white italic">{data?.totals?.total_diesel_used} <span className="text-xs uppercase">L</span></span>
            </div>
            <div className="flex flex-col gap-1.5 px-4 border-l border-white/10 hover:border-indigo-500 transition-colors">
              <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Total Diesel Given</span>
              <span className="text-xl font-black text-white italic">{data?.totals?.total_diesel_quantity} <span className="text-xs uppercase">L</span></span>
            </div>
            <div className="flex flex-col gap-1.5 px-4 border-l border-white/10 hover:border-indigo-500 transition-colors">
              <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Diesel Variance</span>
              <span className={`text-xl font-black italic ${Number(data?.totals?.diesel_diff) < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {data?.totals?.diesel_diff} <span className="text-xs uppercase">L</span>
              </span>
            </div>

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

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t border-white/10">
            <div className="flex items-center gap-3 text-slate-400">
              <Info size={16} />
              <p className="text-xs font-bold italic">Confirming will mark all included journeys as settled in the system.</p>
            </div>
            <button
              onClick={handleConfirmSettlementClick}
              className="w-full md:w-fit px-12 py-5 bg-white text-slate-900 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 shadow-2xl hover:bg-slate-50 hover:-translate-y-1 transition-all active:translate-y-0"
            >
              <CheckCircle2 size={24} className="text-indigo-600" />
              Confirm Settlement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettlementPreview;
