import { useParams, useNavigate } from "react-router-dom";
import { useRef } from "react";
import { useSettlements } from "@/hooks/useSettlements";
import Loading from "@/components/Loading";
import type { JourneyType } from "@/types/journey";
import { formatDate } from "@/utils/formatDate";
import { usePDFPrint } from "@/hooks/usePDFPrint";
import { usePDFDownload } from "@/hooks/usePDFDownload";
import { useMessageStore } from "@/store/useMessageStore";
import {
  FileText, Printer, Download, ArrowLeft, User, TrendingUp,
  Wallet, Scale, Hash, MapPin, Milestone, Fuel, Calculator, CheckCircle2,
  RefreshCcw,
} from "lucide-react";

const SettlementDetail = () => {
  const { settlementId } = useParams<{ settlementId: string }>();
  const navigate = useNavigate();
  const addMessage = useMessageStore((s) => s.addMessage);
  const { useSettlementsQuery, useMarkSettledMutation, useUnmarkSettledMutation, useRecalculateSettlementMutation } = useSettlements();
  const { data: settlements = [], isLoading } = useSettlementsQuery();
  const markSettled = useMarkSettledMutation();
  const unmarkSettled = useUnmarkSettledMutation();
  const recalculateMutation = useRecalculateSettlementMutation();
  const printRef = useRef<HTMLDivElement>(null);

  const settlement = settlements.find((s: any) => s._id === settlementId);

  const handlePrint = usePDFPrint({
    ref: printRef,
    data: settlement,
    emptyMessage: "Please select a settlement first",
    endpoint: "/invoice/generate-pdf",
    serverMode: false,
  });

  const handleDownloadPDF = usePDFDownload({
    ref: printRef,
    data: settlement,
    emptyMessage: "Please select a settlement first",
    filename: `Settlement-${settlement?.driver?.name || "Driver"}-${new Date().toISOString().split("T")[0]}.pdf`,
    endpoint: "/invoice/generate-pdf",
    serverMode: false,
  });

  if (isLoading && !settlement) return <Loading />;
  if (!settlement) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <Scale size={48} className="text-slate-200" />
      <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No settlement data found</p>
      <button onClick={() => navigate(-1)} className="text-blue-600 font-black text-xs uppercase tracking-widest hover:underline">Go Back</button>
    </div>
  );

  const driverName = settlement.driver?.name ?? "Driver";

  // Calculation Logic
  const kmEarnings = Number(settlement.total_distance || 0) * Number(settlement.rate_per_km || 0);
  const driverExpense = Number(settlement.journeys.reduce((sum: number, j: any) => sum + Number(j.total_driver_expense || 0), 0));
  const startingCash = Number(settlement.journeys.reduce((sum: number, j: any) => sum + Number(j.journey_starting_cash || 0), 0));
  const dieselDiff = Number(settlement.diesel_diff || 0);
  const dieselRate = Number(settlement.diesel_rate || 0);

  const totalDieselGiven = settlement.journeys.reduce((sum: number, j: any) => sum + (j.diesel_expenses?.reduce((t: number, d: any) => t + Number(d.quantity), 0) || 0), 0);
  const totalDieselUsed = Math.floor(Number(settlement.total_distance || 0) / Number(settlement.avg_mileage || 1));

  // Logic: dieselDiff = Used - Given
  // If Given > Used (Shortage) -> diff < 0
  // If Given < Used (Bonus/Efficiency) -> diff > 0
  const isShortage = dieselDiff > 0;
  const isBonus = dieselDiff < 0;
  const dieselAdjustment = Math.abs(dieselDiff) * dieselRate;

  const drlSideTotal = kmEarnings + (isBonus ? dieselAdjustment : 0);
  const driverSideTotal = driverExpense + startingCash + (isShortage ? dieselAdjustment : 0);

  // Revised Rule: A = Driver Side (Earnings + Bonus), B = DRL Side (Advances + Shortage)
  // Result = A - B
  const A = drlSideTotal;
  const B = driverSideTotal;
  const finalBalance = A - B;
  const paymentStatusText = finalBalance > 0 ? "DRL Needs to Pay" : finalBalance < 0 ? "Driver Needs to Pay" : "Balanced";

  return (
    <div className="flex flex-col gap-10 pb-20 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
        <div className="flex flex-col gap-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold text-xs uppercase tracking-widest transition-colors w-fit">
            <ArrowLeft size={14} /> Back to History
          </button>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 text-white">
              <FileText size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-black italic tracking-tight text-slate-900 uppercase leading-none">Settlement <span className="text-blue-600">Detail</span></h1>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">#{settlement.settlement_no} • {formatDate(new Date(settlement.period.from))} - {formatDate(new Date(settlement.period.to))}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {settlement.is_settled ? (
            <>
              <div className="flex items-center gap-2 px-5 py-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl font-black text-xs uppercase tracking-widest">
                <CheckCircle2 size={16} />
                Settled{settlement.settled_at ? ` on ${formatDate(new Date(settlement.settled_at))}` : ""}
              </div>
              <button
                onClick={async () => {
                  try {
                    await unmarkSettled.mutateAsync(settlement._id);
                    addMessage({ type: "success", text: "Settlement marked as unsettled." });
                  } catch {
                    addMessage({ type: "error", text: "Failed to unmark settlement." });
                  }
                }}
                disabled={unmarkSettled.isPending}
                className="flex items-center gap-2 px-5 py-3.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-100 transition-all disabled:opacity-60"
              >
                <CheckCircle2 size={16} />
                {unmarkSettled.isPending ? "Reverting…" : "Mark as Unsettled"}
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={async () => {
                  try {
                    await markSettled.mutateAsync(settlement._id);
                    addMessage({ type: "success", text: "Settlement marked as settled!" });
                  } catch {
                    addMessage({ type: "error", text: "Failed to mark as settled. Please try again." });
                  }
                }}
                disabled={markSettled.isPending}
                className="flex items-center gap-2 px-5 py-3.5 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-60"
              >
                <CheckCircle2 size={16} />
                {markSettled.isPending ? "Marking…" : "Mark as Settled"}
              </button>
              <button
                onClick={async () => {
                  try {
                    await recalculateMutation.mutateAsync(settlement._id);
                    addMessage({ type: "success", text: "Settlement recalculated successfully!" });
                  } catch {
                    addMessage({ type: "error", text: "Failed to recalculate settlement." });
                  }
                }}
                disabled={recalculateMutation.isPending}
                className="flex items-center gap-2 px-5 py-3.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-100 transition-all disabled:opacity-60"
              >
                <RefreshCcw size={16} className={recalculateMutation.isPending ? "animate-spin" : ""} />
                {recalculateMutation.isPending ? "Recalculating…" : "Recalculate"}
              </button>
            </div>
          )}
          <button onClick={handlePrint} className="flex-1 md:flex-none px-6 py-4 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
            <Printer size={16} /> Print
          </button>
          <button onClick={handleDownloadPDF} className="flex-1 md:flex-none px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg">
            <Download size={16} /> Save PDF
          </button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 print:hidden">
        <div className="card-premium p-8 flex flex-col gap-4 border-l-4 border-l-blue-600">
          <div className="p-3 bg-blue-50 rounded-2xl w-fit">
            <User className="text-blue-600" size={24} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Driver</span>
            <p className="text-2xl font-black text-slate-900 italic truncate">{driverName}</p>
          </div>
        </div>

        <div className="card-premium p-8 flex flex-col gap-4 border-l-4 border-l-slate-800">
          <div className="p-3 bg-slate-100 rounded-2xl w-fit">
            <Scale className="text-slate-900" size={24} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Account Balance</span>
            <p className="text-2xl font-black text-slate-900 italic">₹{Math.abs(finalBalance).toLocaleString()}</p>
            <span className={`text-[10px] font-black uppercase tracking-widest ${finalBalance > 0 ? "text-indigo-500 font-black italic" : finalBalance < 0 ? "text-rose-500" : "text-slate-500"}`}>
              {paymentStatusText}
            </span>
          </div>
        </div>

        <div className="card-premium p-8 flex flex-col gap-4 border-l-4 border-l-indigo-600">
          <div className="p-3 bg-indigo-50 rounded-2xl w-fit">
            <CheckCircle2 className="text-indigo-600" size={24} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Status</span>
            <p className="text-2xl font-black text-slate-900 italic uppercase">{paymentStatusText}</p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 print:hidden">
        {[
          { label: "Rate Per Km", value: `₹${settlement.rate_per_km}`, icon: <Scale size={16} className="text-blue-500" /> },
          { label: "Diesel Rate", value: `₹${settlement.diesel_rate}`, icon: <Fuel size={16} className="text-amber-500" /> },
          { label: "Avg Mileage", value: `${settlement.avg_mileage} Kmpl`, icon: <TrendingUp size={16} className="text-blue-500" /> },
          { label: "Total Distance", value: `${settlement.total_distance} Km`, icon: <Milestone size={16} className="text-purple-500" /> },
        ].map((stat, i) => (
          <div key={i} className="card-premium p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
              {stat.icon}
            </div>
            <span className="text-xl font-black text-slate-900 italic tracking-tight">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Journey Breakdown Table */}
      <div className="card-premium overflow-hidden border-slate-100 shadow-xl shadow-slate-100/50 print:hidden">
        <div className="px-8 py-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
            <Hash size={14} className="text-blue-500" /> Journey Breakdown
          </h3>
          <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest shadow-sm">
            {settlement.journeys.length} Entries
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                {["#", "Route", "Distance", "Diesel (T/U)", "Drv Expense", "Initial Cash"].map((h, i) => (
                  <th key={i} className={`px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 ${i > 3 ? "text-right" : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {settlement.journeys.map((j: JourneyType, i: number) => {
                const distance = Number(j.ending_kms) - Number(j.starting_kms);
                const dieselTaken = j.diesel_expenses?.reduce((sum: number, d: any) => sum + Number(d.quantity), 0) || 0;
                const dieselUsed = Math.floor(distance / Number(settlement.avg_mileage || 1));
                return (
                  <tr key={j._id || i} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-5 text-xs font-bold text-slate-300 group-hover:text-blue-600">{(i + 1).toString().padStart(2, "0")}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-700 uppercase italic">{j.from}</span>
                        <MapPin size={10} className="text-slate-300" />
                        <span className="text-sm font-black text-slate-700 uppercase italic">{j.to}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-black text-slate-900">{Math.floor(distance)} <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">Km</span></td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-amber-600">{Math.ceil(dieselTaken)}L</span>
                        <span className="text-slate-300">/</span>
                        <span className="text-sm font-black text-slate-600">{dieselUsed}L</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-black text-slate-900 italic">₹{j.total_driver_expense}</td>
                    <td className="px-6 py-5 text-right text-sm font-black text-blue-600">₹{Math.ceil(Number(j.journey_starting_cash || 0))}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-50/80">
              <tr>
                <td colSpan={2} className="px-6 py-5 text-right text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Grand Totals</td>
                <td className="px-6 py-5 text-sm font-black text-slate-900">{Math.floor(settlement.total_distance)} <span className="text-[10px] text-slate-400 uppercase ml-1">Km</span></td>
                <td className="px-6 py-5 text-sm font-black text-amber-600">{Math.ceil(totalDieselGiven)}L</td>
                <td className="px-6 py-5 text-sm font-black text-slate-900 italic">₹{Math.ceil(driverExpense)}</td>
                <td className="px-6 py-5 text-right text-base font-black text-blue-600">₹{Math.ceil(startingCash)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Calculation Worksheet Section */}
      <div className="flex flex-col gap-8 print:hidden">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <Calculator className="text-blue-600" size={20} />
          <h2 className="text-xl font-black text-slate-900 italic uppercase">Settlement Calculation Worksheet</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Step 01: DRL Side (Payables) */}
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
                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100 shadow-sm border-b-2 border-b-emerald-200">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-emerald-600 uppercase italic">Efficiency Bonus</span>
                    <span className="text-[8px] font-bold text-emerald-400">Used {totalDieselUsed}L vs Given {totalDieselGiven}L</span>
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
              <div className="flex items-center justify-between px-2 pt-2 mt-auto">
                <span className="text-[10px] font-black text-blue-500 uppercase">Sub-Total (A)</span>
                <span className="text-lg font-black text-blue-600 italic">₹{drlSideTotal.toLocaleString()}</span>
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
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Initial Cash</span>
                <span className="text-sm font-black text-slate-900 font-mono italic">₹{startingCash.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Driver Expense</span>
                <span className="text-sm font-black text-slate-900 font-mono italic">₹{driverExpense.toLocaleString()}</span>
              </div>
              {isShortage && (
                <div className="flex items-center justify-between p-4 bg-rose-50 rounded-2xl border border-rose-100 shadow-sm border-b-2 border-b-rose-200">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-rose-600 uppercase italic">Diesel Shortage</span>
                    <span className="text-[8px] font-bold text-rose-400">Used {totalDieselUsed}L vs Given {totalDieselGiven}L</span>
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
          <div className={`card-premium p-8 flex flex-col gap-6 border-2 relative overflow-hidden shadow-2xl group scale-105 origin-center ${finalBalance > 0 ? "bg-slate-900 border-slate-800" : finalBalance < 0 ? "bg-rose-900 border-rose-800" : "bg-slate-500 border-slate-400"} text-white transition-all duration-500`}>
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <CheckCircle2 size={100} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Final Balance</span>
              <h3 className="text-lg font-black text-white uppercase italic">Net Settlement</h3>
            </div>
            <div className="space-y-6 relative z-10 my-auto">
              <div className="flex flex-col items-center justify-center gap-2">
                <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest print:hidden">Equation: A - B</span>
                <div className="flex items-center gap-4 text-2xl font-black italic">
                  <span className="opacity-60 font-mono">₹{drlSideTotal.toLocaleString()}</span>
                  <span className="text-blue-400 text-3xl font-light">-</span>
                  <span className="opacity-60 font-mono">₹{driverSideTotal.toLocaleString()}</span>
                </div>
              </div>
              <div className="h-px bg-white/20 w-full" />
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-black text-blue-100 uppercase tracking-[0.3em] font-mono">
                  {paymentStatusText.toUpperCase()}
                </span>
                <span className="text-5xl font-black italic tracking-tighter drop-shadow-lg text-blue-400">
                  ₹{Math.abs(finalBalance).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden print ref (PDF/Report View) */}
      <div className="hidden">
        <div ref={printRef} className="p-10 text-slate-900 bg-white font-serif w-[200mm] mx-auto border border-slate-300">
          <div className="text-center flex flex-col gap-1 mb-8 border-b-2 border-slate-900 pb-6 uppercase">
            <h1 className="text-4xl font-black tracking-tighter italic mb-1">Divyanshi Road Lines</h1>
            <p className="text-[9px] font-bold tracking-[0.4em] text-slate-500 mb-2">Fleet Owner • Transport Contractors • Commission Agent</p>
            <div className="text-[9px] font-medium leading-relaxed max-w-lg mx-auto normal-case">
              <strong>H.O:</strong> Near Essar Fuel Pump, Lohvan Bhagichi, Laxmi Nagar, Mathura - 281001<br />
              <strong>B.O:</strong> Near Kuber Jee Dharam Kanta, Shashtripuram, Agra - 281305<br />
              <strong>Contact:</strong> 8630836045, 7983635608 | <strong>Email:</strong> drldivyashi@gmail.com
            </div>
          </div>

          <div className="flex justify-between items-center mb-6 bg-slate-50 p-5 border border-slate-200 rounded-xl">
            <div>
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Driver / Vehicle Info</span>
              <p className="text-xl font-black uppercase italic tracking-tight">{driverName}</p>
              <p className="text-xs font-bold text-slate-500 mt-1 uppercase">Vehicle: {settlement.journeys?.[0]?.truck?.truck_no || "N/A"}</p>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Settlement Period</span>
              <p className="text-lg font-black italic">{formatDate(new Date(settlement.period.from))} → {formatDate(new Date(settlement.period.to))}</p>
              <p className="text-[10px] font-bold text-blue-600 mt-1 uppercase tracking-widest">{paymentStatusText}</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Distance", value: `${settlement.total_distance} Km` },
              { label: "Rate Per Km", value: `₹${settlement.rate_per_km}` },
              { label: "Diesel Rate", value: `₹${settlement.diesel_rate}` },
              { label: "Avg Mileage", value: `${settlement.avg_mileage} Kmpl` },
            ].map((stat, i) => (
              <div key={i} className="p-3 border border-slate-200 rounded-lg flex flex-col gap-1 items-center bg-slate-50/30">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">{stat.label}</span>
                <span className="text-sm font-black italic">{stat.value}</span>
              </div>
            ))}
          </div>

          <table className="w-full mb-8 border border-slate-900 border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white">
                {["#", "Route Details", "Kms", "Diesel (T/U)", "Initial Cash", "Expense"].map((h, i) => (
                  <th key={i} className="p-2.5 text-left text-[9px] font-black uppercase border border-slate-900">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {settlement.journeys.map((j: JourneyType, i: number) => {
                const distance = Number(j.ending_kms) - Number(j.starting_kms);
                const dieselTaken = j.diesel_expenses?.reduce((t: number, d: any) => t + Number(d.quantity), 0) || 0;
                const dieselUsed = Math.floor(distance / Number(settlement.avg_mileage || 1));
                return (
                  <tr key={i} className="border-b border-slate-200 font-bold">
                    <td className="p-2.5 text-[10px] border-r border-slate-200">{i + 1}</td>
                    <td className="p-2.5 text-[10px] uppercase border-r border-slate-200">{j.from} - {j.to}</td>
                    <td className="p-2.5 text-[10px] text-right border-r border-slate-200">{Math.floor(distance)}</td>
                    <td className="p-2.5 text-[10px] text-right border-r border-slate-200">{Math.ceil(dieselTaken)} / {dieselUsed}L</td>
                    <td className="p-2.5 text-[10px] text-right border-r border-slate-200">₹{j.journey_starting_cash || 0}</td>
                    <td className="p-2.5 text-[10px] text-right">₹{j.total_driver_expense}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-100 font-black">
              <tr>
                <td colSpan={2} className="p-2.5 text-[9px] uppercase text-right">Totals:</td>
                <td className="p-2.5 text-[10px] text-right border-r border-slate-900">{settlement.total_distance}</td>
                <td className="p-2.5 text-[10px] text-right border-r border-slate-900">
                  {Math.ceil(totalDieselGiven)}L
                </td>
                <td className="p-2.5 text-[10px] text-right border-r border-slate-900">₹{Math.ceil(startingCash)}</td>
                <td className="p-2.5 text-[10px] text-right">₹{Math.ceil(driverExpense)}</td>
              </tr>
            </tfoot>
          </table>

          <div className="flex justify-between items-start gap-10">
            <div className="flex-1">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-200 pb-2">Calculation Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-slate-500 uppercase">Step 01: Driver Side (A)</span>
                    <span className="font-mono">₹{drlSideTotal.toLocaleString()}</span>
                  </div>
                  <div className="pl-4 space-y-1 opacity-60 italic text-[9px]">
                    <div className="flex justify-between"><span>Base Km Earnings:</span> <span>₹{kmEarnings.toLocaleString()}</span></div>
                    {isBonus && <div className="flex justify-between"><span>Efficiency Bonus:</span> <span>+ ₹{dieselAdjustment.toLocaleString()}</span></div>}
                  </div>

                  <div className="flex justify-between text-[10px] font-bold pt-2 border-t border-slate-100">
                    <span className="text-slate-500 uppercase">Step 02: DRL Side (B)</span>
                    <span className="font-mono">₹{driverSideTotal.toLocaleString()}</span>
                  </div>
                  <div className="pl-4 space-y-1 opacity-60 italic text-[9px]">
                    <div className="flex justify-between"><span>Initial Advances:</span> <span>₹{(startingCash + driverExpense).toLocaleString()}</span></div>
                    {isShortage && <div className="flex justify-between"><span>Diesel Shortage:</span> <span>+ ₹{dieselAdjustment.toLocaleString()}</span></div>}
                  </div>
                </div>
              </div>
            </div>

            <div className="w-[300px] flex flex-col gap-3">

              <div className={`${finalBalance >= 0 ? "bg-slate-900" : "bg-rose-900"} p-5 text-white rounded-2xl shadow-xl flex items-center justify-between`}>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-60">
                    {paymentStatusText}
                  </span>
                  <span className="text-2xl font-black italic tracking-tighter">₹{Math.abs(finalBalance).toLocaleString()}</span>
                </div>
                <CheckCircle2 size={32} className="opacity-20" />
              </div>
            </div>
          </div>

          <div className="mt-20 flex justify-between px-8 italic font-bold">
            <div className="flex flex-col items-center gap-4">
              <div className="w-40 border-b border-slate-900" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Driver's Signature</span>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="w-40 border-b border-slate-900" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Authorized Signatory</span>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">This is a computer generated document. No physical signature required.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettlementDetail;
