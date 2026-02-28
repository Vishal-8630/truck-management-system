import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wallet, ArrowLeft, ArrowRight, User, Calendar, Search, X, SlidersHorizontal } from "lucide-react";
import { useSettlements } from "@/hooks/useSettlements";
import Loading from "@/components/Loading";
import { formatDate } from "@/utils/formatDate";
import Pagination from "@/components/ui/Pagination/Pagination";

const PAGE_SIZE = 20;
const PAYMENT_STATUS_OPTIONS = ["All", "DRL needs to pay", "Driver needs to pay", "Balanced"];

const PendingDriverSettlements = () => {
    const navigate = useNavigate();
    const { useSettlementsQuery } = useSettlements();
    const { data: settlements = [], isLoading } = useSettlementsQuery();

    // All unsettled, sorted by period.to (most recent first)
    const base = useMemo(() =>
        settlements
            .filter((s: any) => !s.is_settled)
            .sort((a: any, b: any) => new Date(b.period?.to || b.createdAt || 0).getTime() - new Date(a.period?.to || a.createdAt || 0).getTime()),
        [settlements]);

    // Filters
    const [search, setSearch] = useState("");           // driver name
    const [payStatus, setPayStatus] = useState("All");  // payment direction
    const [minAmount, setMinAmount] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [page, setPage] = useState(1);

    const filtered = useMemo(() => {
        let list = [...base];
        const q = search.trim().toLowerCase();
        if (q) list = list.filter((s: any) => (s.driver?.name || "").toLowerCase().includes(q));
        if (payStatus !== "All") list = list.filter((s: any) => s.payment_status === payStatus);
        if (minAmount) list = list.filter((s: any) => Number(s.overall_total || 0) >= Number(minAmount));
        if (dateFrom) list = list.filter((s: any) => s.period?.to && new Date(s.period.to) >= new Date(dateFrom));
        if (dateTo) list = list.filter((s: any) => s.period?.from && new Date(s.period.from) <= new Date(dateTo));
        return list;
    }, [base, search, payStatus, minAmount, dateFrom, dateTo]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const hasFilters = search || payStatus !== "All" || minAmount || dateFrom || dateTo;
    const resetFilters = () => { setSearch(""); setPayStatus("All"); setMinAmount(""); setDateFrom(""); setDateTo(""); setPage(1); };

    const filteredTotalAmount = filtered.reduce((s: number, x: any) => s + Number(x.overall_total || 0), 0);

    const statCards = [
        { label: "Matches", value: filtered.length, color: "amber" },
        { label: "DRL Owes Driver", value: filtered.filter((s: any) => s.payment_status === "DRL needs to pay").length, color: "rose" },
        { label: "Driver Owes DRL", value: filtered.filter((s: any) => s.payment_status === "Driver needs to pay").length, color: "emerald" },
        { label: "Total Amount", value: `₹${filteredTotalAmount.toLocaleString()}`, color: "indigo" },
    ];

    return (
        <div className="flex flex-col gap-8 pb-20 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center gap-4 flex-wrap">
                <button onClick={() => navigate(-1)} className="w-11 h-11 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 hover:text-amber-600 hover:border-amber-200 transition-all">
                    <ArrowLeft size={20} />
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-200">
                        <Wallet size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-black italic tracking-tight text-slate-900">
                            Driver <span className="text-amber-500">Settlements</span>
                        </h1>
                        <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">All pending driver payout records</p>
                    </div>
                </div>
                <div className="ml-auto px-6 py-3 rounded-2xl bg-amber-50 border border-amber-100">
                    <span className="text-2xl font-black text-amber-600 italic">{base.length}</span>
                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block leading-none">Pending</span>
                </div>
            </div>

            {isLoading && <Loading />}

            {!isLoading && (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {statCards.map((s, i) => (
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
                                <SlidersHorizontal size={16} className="text-amber-500" />
                                <span className="text-sm font-black text-slate-700 uppercase tracking-widest">Filters</span>
                                {hasFilters && <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 text-[9px] font-black uppercase">Active</span>}
                            </div>
                            {hasFilters && (
                                <button onClick={resetFilters} className="text-[10px] font-black text-slate-400 hover:text-rose-500 uppercase tracking-widest flex items-center gap-1.5 transition-colors">
                                    <X size={12} /> Clear All
                                </button>
                            )}
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Driver Search */}
                            <div className="relative sm:col-span-2">
                                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                                    placeholder="Search driver name..."
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-300 transition-all" />
                            </div>
                            {/* Payment Direction */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Direction</label>
                                <select value={payStatus} onChange={e => { setPayStatus(e.target.value); setPage(1); }}
                                    className="py-3 px-4 rounded-xl border border-slate-100 bg-slate-50/50 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-100 transition-all">
                                    {PAYMENT_STATUS_OPTIONS.map(o => <option key={o}>{o}</option>)}
                                </select>
                            </div>
                            {/* Min Amount */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Min Amount (₹)</label>
                                <input type="number" value={minAmount} onChange={e => { setMinAmount(e.target.value); setPage(1); }}
                                    placeholder="e.g. 5000"
                                    className="py-3 px-4 rounded-xl border border-slate-100 bg-slate-50/50 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-100 transition-all" />
                            </div>
                            {/* Period From */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Period From</label>
                                <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }}
                                    className="py-3 px-4 rounded-xl border border-slate-100 bg-slate-50/50 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-100 transition-all" />
                            </div>
                            {/* Period To */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Period To</label>
                                <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }}
                                    className="py-3 px-4 rounded-xl border border-slate-100 bg-slate-50/50 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-100 transition-all" />
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/30">
                            <Wallet className="w-16 h-16 text-slate-200 mb-4" strokeWidth={1.5} />
                            <p className="text-slate-400 font-black text-lg italic">{hasFilters ? "No results match your filters." : "All driver settlements are cleared!"}</p>
                        </div>
                    ) : (
                        <div className="card-premium !p-0 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100">
                                            {["#", "Driver", "Period", "Journeys", "Distance", "Total Amt", "Direction", ""].map(h => (
                                                <th key={h} className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left whitespace-nowrap">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {paginated.map((s: any, idx) => {
                                            const statusColor = s.payment_status === "DRL needs to pay" ? "amber" : s.payment_status === "Driver needs to pay" ? "rose" : "emerald";
                                            return (
                                                <tr key={s._id} className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                                                    onClick={() => navigate(`/journey/driver-detail/${s.driver?._id || s.driver}/settlement/${s._id}`)}>
                                                    <td className="px-5 py-4 text-[10px] font-black text-slate-300">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 shrink-0"><User size={13} /></div>
                                                            <span className="font-black text-slate-900 truncate max-w-[100px]">{s.driver?.name || "—"}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-1.5 font-bold text-slate-600 text-xs whitespace-nowrap">
                                                            <Calendar size={11} className="text-amber-400 shrink-0" />
                                                            {s.period?.from ? formatDate(new Date(s.period.from)) : "?"} – {s.period?.to ? formatDate(new Date(s.period.to)) : "?"}
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4 text-center font-black text-slate-700">{s.journeys?.length ?? 0}</td>
                                                    <td className="px-5 py-4 font-bold text-slate-500 text-xs">{s.total_distance?.toLocaleString() ?? "—"} km</td>
                                                    <td className="px-5 py-4 font-black text-slate-900 italic">₹{Number(s.overall_total || 0).toLocaleString()}</td>
                                                    <td className="px-5 py-4">
                                                        <span className={`text-[9px] font-black px-2.5 py-1.5 rounded-full uppercase bg-${statusColor}-100 text-${statusColor}-700 whitespace-nowrap`}>
                                                            {s.payment_status?.replace("needs to pay", "↗")}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <ArrowRight size={14} className="text-slate-200 group-hover:text-amber-600 transition-colors" />
                                                    </td>
                                                </tr>
                                            );
                                        })}
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

export default PendingDriverSettlements;
