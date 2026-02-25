import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchSettlementsAsync,
  selectSettlementLoading,
  settlementSelectors,
} from "../../../../features/settlement";
import { useEffect, useRef } from "react";
import type { AppDispatch } from "../../../../app/store";
import Loading from "../../../../components/Loading";
import type { JourneyType } from "../../../../types/journey";
import { formatDate } from "../../../../utils/formatDate";
import { usePDFPrint } from "../../../../hooks/usePDFPrint";
import { usePDFDownload } from "../../../../hooks/usePDFDownload";
import {
  FileText,
  Printer,
  Download,
  ArrowLeft,
  Calendar,
  User,
  TrendingUp,
  Wallet,
  Scale,
  Hash,
  MapPin,
  Navigation,
  Fuel,
  Calculator,
  Clock
} from "lucide-react";

const SettlementDetail = () => {
  const { settlementId } = useParams();
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const settlements = useSelector(settlementSelectors.selectAll);
  const loading = useSelector(selectSettlementLoading);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(fetchSettlementsAsync());
  }, [dispatch, settlementId]);

  const settlement = settlements.find(
    (settlement) => settlement._id === settlementId
  );

  const handlePrint = usePDFPrint({
    ref: printRef,
    data: settlement,
    emptyMessage: "Please select a settlement first",
    endpoint: "/invoice/generate-pdf",
    serverMode: true,
  });

  const handleDownloadPDF = usePDFDownload({
    ref: printRef,
    data: settlement,
    emptyMessage: "Please select a settlement first",
    filename: `Settlement-${settlement?.driver.name}-${new Date().toISOString().split("T")[0]
      }.pdf`,
    endpoint: "/invoice/generate-pdf",
    serverMode: true,
  });

  if (loading && !settlement) return <Loading />;
  if (!settlement) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <Scale size={48} className="text-slate-200" />
      <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No settlement data found</p>
      <button
        onClick={() => navigate(-1)}
        className="text-indigo-600 font-black text-xs uppercase tracking-widest hover:underline"
      >
        Go Back
      </button>
    </div>
  );

  return (
    <div className="flex flex-col gap-10 pb-20 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest transition-colors w-fit"
          >
            <ArrowLeft size={14} />
            Back to Settlements
          </button>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 text-white">
              <FileText size={24} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-3xl font-black italic tracking-tight text-slate-900 uppercase leading-none">Settlement <span className="text-indigo-600">Summary</span></h1>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">Driver Payout & Trip Reconciliation</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 md:flex-none px-6 py-4 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-95 shadow-sm"
          >
            <Printer size={16} />
            Print
          </button>

          <button
            onClick={handleDownloadPDF}
            className="flex-1 md:flex-none px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
          >
            <Download size={16} />
            Save PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="card-premium p-6 flex items-center gap-4 bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <User size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">Driver Name</span>
            <span className="text-lg font-black text-slate-900 truncate uppercase mt-1">{settlement.driver?.name}</span>
          </div>
        </div>

        <div className="card-premium p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <Calendar size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Period</span>
            <span className="text-lg font-black text-slate-900 mt-1">
              {formatDate(new Date(settlement.period.from))}
              <span className="text-slate-300 mx-2">→</span>
              {formatDate(new Date(settlement.period.to))}
            </span>
          </div>
        </div>

        <div className="card-premium p-6 flex items-center gap-4 bg-emerald-50/50 border-emerald-100">
          <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-100 animate-pulse-slow">
            <TrendingUp size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest leading-none mb-1">Calculation Status</span>
            <span className="text-lg font-black text-emerald-600 uppercase mt-1 italic tracking-widest">{settlement.status}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {[
          { label: 'Rate Per Km', value: `₹${settlement.rate_per_km}`, icon: <Scale size={16} className="text-blue-500" /> },
          { label: 'Diesel Rate', value: `₹${settlement.diesel_rate}`, icon: <Fuel size={16} className="text-amber-500" /> },
          { label: 'Avg Mileage', value: `${settlement.avg_mileage} Kmpl`, icon: <TrendingUp size={16} className="text-indigo-500" /> },
          { label: 'Total Distance', value: `${settlement.total_distance} Km`, icon: <Navigation size={16} className="text-purple-500" /> },
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

      <div className="card-premium overflow-hidden border-slate-100 shadow-xl shadow-slate-100/50">
        <div className="px-8 py-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
            <Hash size={14} className="text-indigo-500" />
            Journey Breakdown
          </h3>
          <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest shadow-sm">
            {settlement.journeys.length} Entries
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">#</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Route</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Distance</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Diesel (T/U)</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Drv Expense</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Initial Cash</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {settlement.journeys.map((j: JourneyType, i: number) => {
                const distance = Number(j.ending_kms) - Number(j.starting_kms);
                const dieselTaken = j.diesel_expenses?.reduce((total: number, d: any) => total + Number(d.quantity), 0) || 0;
                const dieselUsed = Math.floor(distance / Number(settlement.avg_mileage || 1));
                const expense = Number(j.journey_starting_cash || 0);

                return (
                  <tr key={j._id || i} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-6 py-5">
                      <span className="text-xs font-bold text-slate-300 group-hover:text-indigo-600 transition-colors">{(i + 1).toString().padStart(2, '0')}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-slate-700 uppercase tracking-tight italic">{j.from}</span>
                          <ArrowLeft size={10} className="text-slate-300 rotate-180" />
                          <span className="text-sm font-black text-slate-700 uppercase tracking-tight italic">{j.to}</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <MapPin size={10} />
                          Route Leg
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-black text-slate-900 tracking-tight">{Math.floor(distance)} <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">Km</span></span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-amber-600 tracking-tight">{Math.ceil(dieselTaken)}L</span>
                        <span className="text-slate-300">/</span>
                        <span className="text-sm font-black text-slate-600 tracking-tight">{dieselUsed}L</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-black text-slate-900 tracking-tight italic">₹{j.total_driver_expense}</span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className="text-sm font-black text-indigo-600 tracking-tight">₹{Math.ceil(expense)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            <tfoot className="bg-slate-50/80">
              <tr>
                <td colSpan={2} className="px-6 py-5 text-right">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Grand Totals</span>
                </td>
                <td className="px-6 py-5">
                  <span className="text-sm font-black text-slate-900">
                    {Math.floor(settlement.journeys.reduce((sum, j) => sum + (Number(j.ending_kms) - Number(j.starting_kms)), 0))}
                    <span className="text-[10px] text-slate-400 uppercase ml-1">Km</span>
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-amber-600">
                      {Math.ceil(settlement.journeys.reduce((sum, j) => sum + (j.diesel_expenses?.reduce((t: number, d: any) => t + Number(d.quantity), 0) || 0), 0))}L
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="text-sm font-black text-slate-900 italic">
                    ₹{Math.ceil(settlement.journeys.reduce((sum, j) => sum + Number(j.total_driver_expense || 0), 0))}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <span className="text-base font-black text-indigo-600">
                    ₹{Math.ceil(settlement.journeys.reduce((sum, j) => sum + Number(j.journey_starting_cash || 0), 0))}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card-premium p-8 flex flex-col gap-6 bg-slate-50/50 border-slate-100">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
            <Calculator size={14} className="text-indigo-500" />
            Calculation Logic
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Diesel Difference</span>
              <span className="text-sm font-black text-slate-900 tracking-tight italic">{settlement.diesel_diff} Liters</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Kilometer Earnings</span>
              <span className="text-sm font-black text-indigo-600 tracking-tight italic">
                ₹{settlement.journeys.reduce((sum, j) => sum + (Number(j.ending_kms) - Number(j.starting_kms)), 0) * Number(settlement.rate_per_km || 0)}
              </span>
            </div>
          </div>
        </div>

        <div className="card-premium p-8 flex flex-col gap-6 bg-slate-900 border-slate-800 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2 relative z-10">
            <Wallet size={14} className="text-indigo-400" />
            Net Settlement
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Driver Payout</span>
              <span className="text-2xl font-black text-indigo-400 italic">₹{settlement.driver_total}</span>
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Owner Share</span>
              <span className="text-2xl font-black text-slate-300 italic">₹{settlement.owner_total}</span>
            </div>
            <div className="md:col-span-2 p-6 rounded-2xl bg-indigo-600 flex items-center justify-between shadow-xl shadow-indigo-900/20">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest leading-none">Overall Settlement Amount</span>
                <span className="text-3xl font-black italic tracking-tighter">₹{settlement.overall_total}</span>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Scale size={28} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🖨️ Hidden Print-Only View */}
      <div className="hidden">
        <div ref={printRef} className="p-12 text-slate-900 bg-white font-serif max-w-[800px] mx-auto border border-slate-200">
          {/* Standard Header */}
          <div className="text-center flex flex-col gap-1 mb-8 border-b-2 border-slate-900 pb-6 relative">
            <div className="absolute top-0 right-0 text-[10px] font-bold uppercase tracking-widest text-slate-400 rotate-90 origin-top-right translate-y-4">Jurisdiction: Mathura Only</div>
            <h1 className="text-4xl font-black uppercase tracking-tighter italic scale-y-110 mb-2">Divyanshi Road Lines</h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-600 mb-2">Fleet Owner • Transport Contractors • Commission Agent</p>
            <div className="text-[10px] font-medium leading-relaxed max-w-md mx-auto">
              <strong>H.O:</strong> Near Essar Fuel Pump, Lohvan Bhagichi, Laxmi Nagar, Mathura - 281001 <br />
              <strong>B.O:</strong> Near Kuber Jee Dharam Kanta, Shashtripuram, Agra - 281305 <br />
              <strong>Contact:</strong> 8630836045, 7983635608 | <strong>Email:</strong> drldivyashi@gmail.com
            </div>
          </div>

          <div className="flex justify-between items-center mb-8 bg-slate-50 p-4 border border-slate-100 rounded-lg">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Driver</span>
              <span className="text-lg font-black uppercase">{settlement.driver?.name}</span>
            </div>
            <div className="text-right flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Settlement Period</span>
              <span className="text-sm font-bold">{formatDate(new Date(settlement.period.from))} to {formatDate(new Date(settlement.period.to))}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-8 border-y-2 border-slate-100 py-6">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 italic">Total Distance</span>
              <span className="text-xl font-black italic">{Number(settlement.total_distance)} Km</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 italic">Avg Mileage</span>
              <span className="text-xl font-black italic">{Number(settlement.avg_mileage)} Kmpl</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 italic">Rate/Km</span>
              <span className="text-xl font-black italic">₹{Number(settlement.rate_per_km)}</span>
            </div>
          </div>

          <table className="w-full mb-10 border border-slate-900 border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="p-3 text-left text-[10px] font-black uppercase border border-slate-900">#</th>
                <th className="p-3 text-left text-[10px] font-black uppercase border border-slate-900">Route (From - To)</th>
                <th className="p-3 text-right text-[10px] font-black uppercase border border-slate-900">Km</th>
                <th className="p-3 text-right text-[10px] font-black uppercase border border-slate-900">Diesel</th>
                <th className="p-3 text-right text-[10px] font-black uppercase border border-slate-900">Exp</th>
              </tr>
            </thead>
            <tbody>
              {settlement.journeys.map((j: JourneyType, i: number) => {
                const distance = Number(j.ending_kms) - Number(j.starting_kms);
                const dieselTaken = j.diesel_expenses?.reduce((total: number, d: any) => total + Number(d.quantity), 0) || 0;
                return (
                  <tr key={i} className="border-b border-slate-200">
                    <td className="p-3 text-xs font-bold border-r border-slate-200">{i + 1}</td>
                    <td className="p-3 text-xs font-black uppercase border-r border-slate-200">{j.from} - {j.to}</td>
                    <td className="p-3 text-xs font-bold text-right border-r border-slate-200">{Math.floor(distance)}</td>
                    <td className="p-3 text-xs font-bold text-right border-r border-slate-200">{Math.ceil(dieselTaken)}L</td>
                    <td className="p-3 text-xs font-bold text-right">₹{j.total_driver_expense}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 font-black">
                <td colSpan={2} className="p-3 text-right text-[10px] uppercase border border-slate-900">Grand Totals</td>
                <td className="p-3 text-right text-xs border border-slate-900">{settlement.total_distance}</td>
                <td className="p-3 text-right text-xs border border-slate-900">{Math.ceil(settlement.journeys.reduce((sum, j) => sum + (j.diesel_expenses?.reduce((t: number, d: any) => t + Number(d.quantity), 0) || 0), 0))}L</td>
                <td className="p-3 text-right text-xs border border-slate-900">₹{Math.ceil(settlement.journeys.reduce((sum, j) => sum + Number(j.total_driver_expense || 0), 0))}</td>
              </tr>
            </tfoot>
          </table>

          <div className="flex justify-end">
            <div className="w-1/2 flex flex-col gap-3">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400">Km Earnings (x{settlement.rate_per_km})</span>
                <span className="text-sm font-bold italic">₹{Number(settlement.total_distance) * Number(settlement.rate_per_km)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400">Diesel Diff ({settlement.diesel_diff}L)</span>
                <span className="text-sm font-bold italic">- ₹{Math.abs(Number(settlement.diesel_diff) * Number(settlement.diesel_rate))}</span>
              </div>
              <div className="flex justify-between p-4 bg-slate-900 text-white rounded-lg mt-2">
                <span className="text-xs font-black uppercase">Final Payout</span>
                <span className="text-xl font-black italic">₹{settlement.driver_total}</span>
              </div>
            </div>
          </div>

          <div className="mt-20 flex justify-between px-4 italic">
            <div className="flex flex-col items-center">
              <div className="w-32 border-b border-slate-900 mb-2"></div>
              <span className="text-[10px] font-bold uppercase">Receiver's Signature</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-32 border-b border-slate-900 mb-2"></div>
              <span className="text-[10px] font-bold uppercase">Authorized Signatory</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettlementDetail;
