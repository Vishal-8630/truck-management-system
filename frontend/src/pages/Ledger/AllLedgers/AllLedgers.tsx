import { useLedgers } from "@/hooks/useLedgers";
import { useNavigate, Link } from "react-router-dom";
import Loading from "@/components/Loading";
import type { LedgerType } from "@/types/ledger";
import { BookOpen, Eye, ExternalLink, ArrowDownLeft, ArrowUpRight, Plus, Calendar } from "lucide-react";

const AllLedgers = () => {
  const navigate = useNavigate();
  const { useLedgersQuery } = useLedgers();
  const { data: ledgers = [], isLoading } = useLedgersQuery();

  if (isLoading) return <Loading />;

  return (
    <div className="flex flex-col gap-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight italic flex items-center gap-4">
            <BookOpen className="text-indigo-600 w-10 h-10 lg:w-12 lg:h-12" />
            General <span className="text-indigo-600">Ledger</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg">Comprehensive financial tracking and history.</p>
        </div>
        <button
          onClick={() => navigate("/ledger/new-ledger")}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all active:translate-y-0"
        >
          <Plus size={18} /> New Transaction
        </button>
      </div>

      <div className="card-premium overflow-hidden border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                {["Date", "Category", "Type", "Debit", "Credit", "Amount", "Refs", "Action"].map((h, i) => (
                  <th key={i} className="px-6 py-4 text-[10px] font-bold text-slate-400 border-r border-slate-100 uppercase tracking-widest whitespace-nowrap last:border-r-0">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {ledgers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <BookOpen size={40} className="text-slate-200" />
                      <span className="text-slate-400 font-bold italic tracking-tight">No ledger entries found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                ledgers.map((entry: LedgerType) => (
                  <tr key={entry._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-300" />
                        <span className="text-sm font-bold text-slate-700">{new Date(entry.date).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">{entry.category}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {entry.debit ? (
                        <div className="inline-flex items-center gap-1 text-red-500 font-bold text-[10px] uppercase tracking-tighter bg-red-50 px-2 py-0.5 rounded-full">
                          <ArrowDownLeft size={10} /> Debit
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 text-emerald-500 font-bold text-[10px] uppercase tracking-tighter bg-emerald-50 px-2 py-0.5 rounded-full">
                          <ArrowUpRight size={10} /> Credit
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`text-sm font-bold ${entry.debit ? "text-red-500 font-mono" : "text-slate-300"}`}>
                        {entry.debit ? `₹${entry.debit}` : "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`text-sm font-bold ${entry.credit ? "text-emerald-500 font-mono" : "text-slate-300"}`}>
                        {entry.credit ? `₹${entry.credit}` : "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-extrabold text-slate-900 font-mono">₹{entry.amount}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {entry.truck && (
                          <Link title="View Truck" to={`/journey/truck/${entry.truck._id}`} className="w-7 h-7 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                            <ExternalLink size={12} />
                          </Link>
                        )}
                        {entry.driver && (
                          <Link title="View Driver" to={`/journey/driver-detail/${entry.driver._id}`} className="w-7 h-7 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                            <ExternalLink size={12} />
                          </Link>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/ledger/ledger-detail/${entry._id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-indigo-600 transition-all opacity-0 group-hover:opacity-100 shadow-lg shadow-slate-100"
                      >
                        <Eye size={12} /> Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AllLedgers;
