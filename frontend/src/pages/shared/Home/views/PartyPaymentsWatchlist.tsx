import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wallet, ArrowLeft, ArrowRight, Truck, SlidersHorizontal, Search, X, Calendar, User, FileText } from "lucide-react";
import { useVehicleEntries } from "@/hooks/useLedgers";
import Loading from "@/components/Loading";
import { formatDate } from "@/utils/formatDate";
import Pagination from "@/components/ui/Pagination/Pagination";

const PAGE_SIZE = 20;

const PartyPaymentsWatchlist = () => {
    const navigate = useNavigate();
    const { useVehicleEntriesQuery } = useVehicleEntries();
    const { data: entries = [], isLoading } = useVehicleEntriesQuery();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filters
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("Pending"); // Default to Pending as requested
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [movementType, setMovementType] = useState("All");
    const [page, setPage] = useState(1);

    // Base data sorted newest first
    const base = useMemo(() =>
        ([...entries]).sort((a: any, b: any) =>
            new Date(b.date || b.createdAt || 0).getTime() - new Date(a.date || a.createdAt || 0).getTime()
        ), [entries]);

    const filtered = useMemo(() => {
        let list = [...base];

        // Status Filter (Pending/Received)
        if (statusFilter !== "All") {
            list = list.filter((e: any) => (e.status || "Pending") === statusFilter);
        }

        // Movement Type Filter
        if (movementType !== "All") {
            list = list.filter((e: any) => e.movementType === movementType);
        }

        // Search Filter (Vehicle No, Party Name, Route)
        const q = search.trim().toLowerCase();
        if (q) {
            list = list.filter((e: any) =>
                (e.vehicle_no || "").toLowerCase().includes(q) ||
                (e.balance_party?.party_name || "").toLowerCase().includes(q) ||
                (e.from || "").toLowerCase().includes(q) ||
                (e.to || "").toLowerCase().includes(q)
            );
        }

        // Date Range
        if (dateFrom) list = list.filter((e: any) => new Date(e.date) >= new Date(dateFrom));
        if (dateTo) {
            const end = new Date(dateTo);
            end.setHours(23, 59, 59, 999);
            list = list.filter((e: any) => new Date(e.date) <= end);
        }

        return list;
    }, [base, search, statusFilter, dateFrom, dateTo, movementType]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const hasFilters = search || statusFilter !== "Pending" || dateFrom || dateTo || movementType !== "All";
    const resetFilters = () => { setSearch(""); setStatusFilter("Pending"); setDateFrom(""); setDateTo(""); setMovementType("All"); setPage(1); };

    // Live Summary Stats based on current filtered result
    const stats = [
        { label: "Matches", value: filtered.length, color: "indigo" },
        { label: "Pending", value: filtered.filter((e: any) => e.status === "Pending").length, color: "rose" },
        { label: "Received", value: filtered.filter((e: any) => e.status === "Received").length, color: "emerald" },
        { label: "Total Balance", value: `₹${filtered.reduce((sum, e) => sum + (Number(e.balance) || 0), 0).toLocaleString()}`, color: "slate" },
    ];

    return (
        <div className="flex flex-col gap-8 pb-20 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center gap-4 flex-wrap">
                <button onClick={() => navigate(-1)} className="w-11 h-11 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all">
                    <ArrowLeft size={20} />
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                        <Wallet size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-black italic tracking-tight text-slate-900">
                            Vehicle <span className="text-indigo-600">Logs</span>
                        </h1>
                        <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Party payment management via Vehicle Entry Logs</p>
                    </div>
                </div>
                <div className="ml-auto px-6 py-3 rounded-2xl bg-indigo-50 border border-indigo-100">
                    <span className="text-2xl font-black text-indigo-600 italic">
                        {entries.filter((e: any) => e.status === "Pending").length}
                    </span>
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block leading-none text-right">Pending Total</span>
                </div>
            </div>

            {isLoading && <Loading />}

            {!isLoading && (
                <>
                    {/* Live Summary Cards (reactive to filters) */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {stats.map((s, i) => (
                            <div key={i} className={`card-premium !p-5 border-${s.color}-100 bg-${s.color}-50/20 shadow-sm hover:shadow-md transition-all truncate`}>
                                <p className={`text-2xl font-black italic text-${s.color}-600`}>{s.value}</p>
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
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Search */}
                            <div className="relative sm:col-span-2">
                                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                                    placeholder="Search Vehicle No, Party, or City..."
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all" />
                            </div>
                            {/* Status */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</label>
                                <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                                    className="py-3 px-4 rounded-xl border border-slate-100 bg-slate-50/50 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all">
                                    {["All", "Pending", "Received"].map(o => <option key={o}>{o}</option>)}
                                </select>
                            </div>
                            {/* Movement Type */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Movement Type</label>
                                <select value={movementType} onChange={e => { setMovementType(e.target.value); setPage(1); }}
                                    className="py-3 px-4 rounded-xl border border-slate-100 bg-slate-50/50 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all">
                                    {["All", "From DRL", "To DRL"].map(o => <option key={o}>{o}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/30">
                            <FileText className="w-16 h-16 text-slate-200 mb-4" strokeWidth={1.5} />
                            <p className="text-slate-400 font-black text-lg italic">{hasFilters ? "No logs match your filters." : "No vehicle logs found."}</p>
                        </div>
                    ) : (
                        <div className="card-premium !p-0 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100">
                                            {["#", "Vehicle No", "Party Name", "Route", "Date", "Balance", "Status", ""].map(h => (
                                                <th key={h} className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left whitespace-nowrap">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 text-xs">
                                        {paginated.map((e: any, idx) => (
                                            <tr key={e._id} className="hover:bg-indigo-50/30 transition-colors cursor-pointer group"
                                                onClick={() => navigate(`/all-entries`)}>
                                                <td className="px-5 py-4 text-[10px] font-black text-slate-300">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                                                <td className="px-5 py-4 font-black">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0"><Truck size={13} /></div>
                                                        <span className="text-slate-900">{e.vehicle_no || "—"}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2 font-bold text-slate-700">
                                                        <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0"><User size={12} /></div>
                                                        <span className="truncate max-w-[140px] uppercase">{e.balance_party?.party_name || "—"}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="font-bold text-slate-500 uppercase tracking-tight">
                                                        {e.from} → {e.to}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-slate-600 font-bold whitespace-nowrap">
                                                    <div className="flex items-center gap-1.5 text-[10px]">
                                                        <Calendar size={12} className="text-indigo-400" />
                                                        {formatDate(new Date(e.date || e.createdAt))}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 font-black text-indigo-600 italic">₹{Number(e.balance || 0).toLocaleString()}</td>
                                                <td className="px-5 py-4">
                                                    <span className={`text-[9px] font-black px-2.5 py-1.5 rounded-full uppercase ${e.status === "Pending" ? "bg-rose-100 text-rose-700" :
                                                            "bg-emerald-100 text-emerald-700"
                                                        }`}>
                                                        {e.status}
                                                    </span>
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

export default PartyPaymentsWatchlist;
