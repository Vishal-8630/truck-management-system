import { useMemo, useState } from "react";
import { useLedgers } from "@/hooks/useLedgers";
import { useNavigate } from "react-router-dom";
import Loading from "@/components/Loading";
import type { LedgerType } from "@/types/ledger";
import { BookOpen, ExternalLink, ArrowDownLeft, ArrowUpRight, Plus, Calendar, Search, X, SlidersHorizontal, ArrowRight } from "lucide-react";
import Pagination from "@/components/ui/Pagination/Pagination";
import { formatDate } from "@/utils/formatDate";

const PAGE_SIZE = 20;

const AllLedgers = () => {
  const navigate = useNavigate();
  const { useLedgersQuery } = useLedgers();
  const { data: ledgers = [], isLoading } = useLedgersQuery();

  // Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [type, setType] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  // Derived Categories
  const categories = useMemo(() => {
    const set = new Set(ledgers.map((l: any) => l.category));
    return ["All", ...Array.from(set).sort()];
  }, [ledgers]);

  // Sorting (Newest First)
  const base = useMemo(() =>
    ([...ledgers]).sort((a: any, b: any) =>
      new Date(b.date || b.createdAt || 0).getTime() - new Date(a.date || a.createdAt || 0).getTime()
    ), [ledgers]);

  const filtered = useMemo(() => {
    let list = [...base];

    // Search (Description, Truck No, Driver Name, Ref No)
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((l: any) =>
        (l.description || "").toLowerCase().includes(q) ||
        (l.category || "").toLowerCase().includes(q) ||
        (l.truck?.truck_no || "").toLowerCase().includes(q) ||
        (l.driver?.name || "").toLowerCase().includes(q) ||
        (l.reference_no || "").toLowerCase().includes(q)
      );
    }

    // Category Filter
    if (category !== "All") {
      list = list.filter((l: any) => l.category === category);
    }

    // Type Filter (Debit/Credit)
    if (type === "Debit") list = list.filter((l: any) => l.debit > 0);
    if (type === "Credit") list = list.filter((l: any) => l.credit > 0);

    // Date Range
    if (dateFrom) list = list.filter((l: any) => new Date(l.date) >= new Date(dateFrom));
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      list = list.filter((l: any) => new Date(l.date) <= end);
    }

    return list;
  }, [base, search, category, type, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const hasFilters = search || category !== "All" || type !== "All" || dateFrom || dateTo;
  const resetFilters = () => { setSearch(""); setCategory("All"); setType("All"); setDateFrom(""); setDateTo(""); setPage(1); };

  // Summary Stats
  const summary = useMemo(() => {
    const totalDebit = filtered.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
    const totalCredit = filtered.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);
    const balance = totalCredit - totalDebit;
    return { totalDebit, totalCredit, balance };
  }, [filtered]);

  return (
    <div className="flex flex-col gap-8 pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-100 shrink-0">
            <BookOpen size={28} />
          </div>
          <div>
            <h1 className="text-3xl lg:text-4xl font-black italic tracking-tight text-slate-900 leading-tight">
              General <span className="text-indigo-600">Ledger</span>
            </h1>
            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Financial audit trail & records</p>
          </div>
        </div>
        <button
          onClick={() => navigate("/ledger/new-ledger")}
          className="flex items-center gap-2 px-8 py-4 bg-slate-900 border-2 border-slate-900 text-white rounded-2xl font-black italic text-sm shadow-xl hover:bg-indigo-600 hover:border-indigo-600 hover:-translate-y-1 transition-all active:scale-95 shrink-0"
        >
          <Plus size={20} className="stroke-[3]" /> NEW TRANSACTION
        </button>
      </div>

      {isLoading && <Loading />}

      {!isLoading && (
        <>
          {/* Live Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Matches", value: filtered.length, color: "slate" },
              { label: "Total Debit", value: `₹${summary.totalDebit.toLocaleString()}`, color: "rose" },
              { label: "Total Credit", value: `₹${summary.totalCredit.toLocaleString()}`, color: "emerald" },
              { label: "Net Balance", value: `₹${summary.balance.toLocaleString()}`, color: summary.balance >= 0 ? "indigo" : "rose" },
            ].map((s, i) => (
              <div key={i} className={`card-premium !p-5 border-${s.color}-100 bg-${s.color}-50/20`}>
                <p className={`text-2xl font-black italic text-${s.color}-600 truncate`}>{s.value}</p>
                <p className={`text-[10px] font-black uppercase tracking-widest text-${s.color}-400 mt-1`}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="card-premium !p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-indigo-600" />
                <span className="text-sm font-black text-slate-700 uppercase tracking-widest">Filters</span>
                {hasFilters && <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600 text-[9px] font-black uppercase">Active</span>}
              </div>
              {hasFilters && (
                <button onClick={resetFilters} className="text-[10px] font-black text-slate-400 hover:text-rose-500 uppercase tracking-widest flex items-center gap-1.5 transition-colors">
                  <X size={12} /> Clear All
                </button>
              )}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-4">
              {/* Search */}
              <div className="relative sm:col-span-2">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search description, truck, driver..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all font-mono" />
              </div>
              {/* Category */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}
                  className="py-3 px-4 rounded-xl border border-slate-100 bg-slate-50/50 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all">
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {/* Type */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Post Type</label>
                <select value={type} onChange={e => { setType(e.target.value); setPage(1); }}
                  className="py-3 px-4 rounded-xl border border-slate-100 bg-slate-50/50 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all">
                  {["All", "Debit", "Credit"].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              {/* Date From */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">From</label>
                <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }}
                  className="py-3 px-4 rounded-xl border border-slate-100 bg-slate-50/50 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all" />
              </div>
              {/* Date To */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">To</label>
                <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }}
                  className="py-3 px-4 rounded-xl border border-slate-100 bg-slate-50/50 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all" />
              </div>
            </div>
          </div>

          {/* Table */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/30">
              <BookOpen className="w-16 h-16 text-slate-200 mb-4" strokeWidth={1.5} />
              <p className="text-slate-400 font-black text-lg italic">{hasFilters ? "No records match your filters." : "No transactions found."}</p>
            </div>
          ) : (
            <div className="card-premium !p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      {["#", "Date", "Category / Description", "Debit", "Credit", "Amount", "Refs", ""].map(h => (
                        <th key={h} className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {paginated.map((entry: LedgerType, idx) => (
                      <tr key={entry._id} className="hover:bg-indigo-50/30 transition-all cursor-pointer group"
                        onClick={() => navigate(`/ledger/ledger-detail/${entry._id}`)}>
                        <td className="px-5 py-4 text-[10px] font-black text-slate-300">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5 text-xs font-black text-slate-900 italic">
                              <Calendar size={12} className="text-indigo-400" />
                              {formatDate(new Date(entry.date))}
                            </div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{entry.transaction_type}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{entry.category}</span>
                            <span className="text-xs font-bold text-slate-600 truncate max-w-[200px]">{entry.description || "—"}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {Number(entry.debit) > 0 ? (
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-rose-600 italic">₹{Number(entry.debit).toLocaleString()}</span>
                              <div className="inline-flex items-center gap-1 text-rose-400 font-black text-[9px] uppercase tracking-tighter shrink-0">
                                <ArrowDownLeft size={8} className="stroke-[3]" /> DEBIT
                              </div>
                            </div>
                          ) : <span className="text-slate-200">—</span>}
                        </td>
                        <td className="px-5 py-4">
                          {Number(entry.credit) > 0 ? (
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-emerald-600 italic">₹{Number(entry.credit).toLocaleString()}</span>
                              <div className="inline-flex items-center gap-1 text-emerald-400 font-black text-[9px] uppercase tracking-tighter shrink-0">
                                <ArrowUpRight size={8} className="stroke-[3]" /> CREDIT
                              </div>
                            </div>
                          ) : <span className="text-slate-200">—</span>}
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm font-black text-slate-900 font-mono italic">₹{Number(entry.amount || 0).toLocaleString()}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            {entry.truck && (
                              <div onClick={(e) => { e.stopPropagation(); navigate(`/journey/truck/${entry.truck?._id}`); }}
                                className="w-8 h-8 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                                <ExternalLink size={12} />
                              </div>
                            )}
                            {entry.driver && (
                              <div onClick={(e) => { e.stopPropagation(); navigate(`/journey/driver-detail/${entry.driver?._id}`); }}
                                className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                                <ExternalLink size={12} />
                              </div>
                            )}
                            {!entry.truck && !entry.driver && <span className="text-slate-200 text-xs italic">—</span>}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <ArrowRight size={14} className="text-slate-200 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all inline" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-slate-50 px-4">
                <Pagination currentPage={page} totalPages={totalPages} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={p => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AllLedgers;
