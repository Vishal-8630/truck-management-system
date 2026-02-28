import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, ArrowLeft, ArrowRight, MapPin, FileText, Truck, SlidersHorizontal, Search, X } from "lucide-react";
import { useJourneys } from "@/hooks/useJourneys";
import { useBillEntries } from "@/hooks/useLedgers";
import Loading from "@/components/Loading";
import { formatDate } from "@/utils/formatDate";
import Pagination from "@/components/ui/Pagination/Pagination";

const PAGE_SIZE = 20;
const TYPE_OPTIONS = ["All", "Journey", "Invoice"];
const JOURNEY_STATUS_OPTIONS = ["All", "Active", "Completed", "Delayed", "Cancelled"];

const OperationalActivity = () => {
    const navigate = useNavigate();
    const { useJourneysQuery } = useJourneys();
    const { useBillEntriesQuery } = useBillEntries();
    const { data: journeys = [], isLoading: loadingJ } = useJourneysQuery();
    const { data: billEntries = [], isLoading: loadingB } = useBillEntriesQuery();
    const isLoading = loadingJ || loadingB;

    // Combined, sorted by createdAt/date descending
    const base = useMemo(() => {
        const all = [
            ...journeys.map((j: any) => ({ ...j, _type: "journey", _sortDate: new Date(j.createdAt || j.journey_start_date || 0) })),
            ...billEntries.map((b: any) => ({ ...b, _type: "bill", _sortDate: new Date(b.createdAt || b.bill_date || 0) })),
        ];
        return all.sort((a, b) => b._sortDate.getTime() - a._sortDate.getTime());
    }, [journeys, billEntries]);

    // Filters
    const [search, setSearch] = useState("");
    const [type, setType] = useState("All");
    const [journeyStatus, setJourneyStatus] = useState("All");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [page, setPage] = useState(1);

    const filtered = useMemo(() => {
        let list = [...base];
        if (type !== "All") list = list.filter(x => (type === "Journey" ? x._type === "journey" : x._type === "bill"));
        const q = search.trim().toLowerCase();
        if (q) list = list.filter(x =>
            (x._type === "journey"
                ? `${x.truck?.truck_no || ""} ${x.from || ""} ${x.to || ""} ${x.driver?.name || ""}`
                : `${x.bill_no || ""} ${x.billing_party?.name || ""}`)
                .toLowerCase().includes(q)
        );
        if (journeyStatus !== "All") list = list.filter(x => x._type === "journey" && x.status === journeyStatus);
        if (dateFrom) list = list.filter(x => x._sortDate >= new Date(dateFrom));
        if (dateTo) {
            const end = new Date(dateTo);
            end.setHours(23, 59, 59, 999);
            list = list.filter(x => x._sortDate <= end);
        }
        return list;
    }, [base, search, type, journeyStatus, dateFrom, dateTo]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const hasFilters = search || type !== "All" || journeyStatus !== "All" || dateFrom || dateTo;
    const resetFilters = () => { setSearch(""); setType("All"); setJourneyStatus("All"); setDateFrom(""); setDateTo(""); setPage(1); };

    const statusBadge = (status: string) => {
        const map: Record<string, string> = {
            Active: "bg-emerald-100 text-emerald-700",
            Completed: "bg-indigo-100 text-indigo-700",
            Delayed: "bg-amber-100 text-amber-700",
            Cancelled: "bg-rose-100 text-rose-700",
        };
        return map[status] ?? "bg-slate-100 text-slate-600";
    };

    return (
        <div className="flex flex-col gap-8 pb-20 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center gap-4 flex-wrap">
                <button onClick={() => navigate(-1)} className="w-11 h-11 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all">
                    <ArrowLeft size={20} />
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                        <Clock size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-black italic tracking-tight text-slate-900">
                            Operational <span className="text-indigo-600">Activity</span>
                        </h1>
                        <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Full system log — journeys & invoices sorted by date</p>
                    </div>
                </div>
            </div>

            {isLoading && <Loading />}

            {!isLoading && (
                <>
                    {/* Summary (Live Filters) */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: "Matches", value: filtered.length, color: "slate", filter: () => { setType("All"); setPage(1); } },
                            { label: "Journeys", value: filtered.filter(x => x._type === "journey").length, color: "emerald", filter: () => { setType("Journey"); setPage(1); } },
                            { label: "Invoices", value: filtered.filter(x => x._type === "bill").length, color: "indigo", filter: () => { setType("Invoice"); setPage(1); } },
                            { label: "Active", value: filtered.filter(x => x._type === "journey" && x.status === "Active").length, color: "amber", filter: () => { setType("Journey"); setJourneyStatus("Active"); setPage(1); } },
                        ].map((s, i) => (
                            <div key={i} className={`card-premium !p-5 border-${s.color}-100 bg-${s.color}-50/20 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 active:scale-95`}
                                onClick={s.filter}>
                                <p className={`text-3xl font-black italic text-${s.color}-600`}>{s.value}</p>
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
                                    placeholder="Truck no, driver, route, bill no, party..."
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all" />
                            </div>
                            {/* Type */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Record Type</label>
                                <select value={type} onChange={e => { setType(e.target.value); setJourneyStatus("All"); setPage(1); }}
                                    className="py-3 px-4 rounded-xl border border-slate-100 bg-slate-50/50 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all">
                                    {TYPE_OPTIONS.map(o => <option key={o}>{o}</option>)}
                                </select>
                            </div>
                            {/* Journey Status (only meaningful when type = Journey/All) */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Journey Status</label>
                                <select value={journeyStatus} onChange={e => { setJourneyStatus(e.target.value); setPage(1); }}
                                    disabled={type === "Invoice"}
                                    className="py-3 px-4 rounded-xl border border-slate-100 bg-slate-50/50 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all disabled:opacity-40">
                                    {JOURNEY_STATUS_OPTIONS.map(o => <option key={o}>{o}</option>)}
                                </select>
                            </div>
                            {/* Date From */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date From</label>
                                <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }}
                                    className="py-3 px-4 rounded-xl border border-slate-100 bg-slate-50/50 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all" />
                            </div>
                            {/* Date To */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date To</label>
                                <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }}
                                    className="py-3 px-4 rounded-xl border border-slate-100 bg-slate-50/50 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all" />
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/30">
                            <Clock className="w-16 h-16 text-slate-200 mb-4" strokeWidth={1.5} />
                            <p className="text-slate-400 font-black text-lg italic">{hasFilters ? "No results match your filters." : "No activity records found."}</p>
                        </div>
                    ) : (
                        <div className="card-premium !p-0 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100">
                                            {["#", "Type", "Description", "Date", "Details", ""].map(h => (
                                                <th key={h} className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left whitespace-nowrap">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {paginated.map((item, idx) => (
                                            <tr key={`${item._type}-${item._id}`}
                                                className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                                                onClick={() => item._type === "journey"
                                                    ? navigate(`/journey/journey-detail/${item._id}`)
                                                    : navigate(`/bill-entry/bill?bill_no=${item.bill_no}`)}>
                                                <td className="px-5 py-4 text-[10px] font-black text-slate-300">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                                                <td className="px-5 py-4">
                                                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[9px] font-black uppercase ${item._type === "journey" ? "bg-emerald-100 text-emerald-700" : "bg-indigo-100 text-indigo-700"}`}>
                                                        {item._type === "journey" ? <MapPin size={9} /> : <FileText size={9} />}
                                                        {item._type === "journey" ? "Journey" : "Invoice"}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 font-black text-slate-900">
                                                    {item._type === "journey"
                                                        ? <span className="flex items-center gap-2 text-sm">
                                                            <Truck size={13} className="text-emerald-500 shrink-0" />
                                                            <span className="truncate max-w-[160px]">{item.truck?.truck_no || "—"}: {item.from} → {item.to}</span>
                                                        </span>
                                                        : <span className="truncate max-w-[160px] block text-sm">#{item.bill_no} — {item.billing_party?.name || "Manual Party"}</span>
                                                    }
                                                </td>
                                                <td className="px-5 py-4 text-slate-500 font-bold whitespace-nowrap text-xs">{formatDate(item._sortDate)}</td>
                                                <td className="px-5 py-4">
                                                    {item._type === "journey"
                                                        ? <span className={`text-[9px] font-black px-2.5 py-1.5 rounded-full uppercase ${statusBadge(item.status)}`}>{item.status}</span>
                                                        : <span className="text-sm font-black text-slate-900 italic">₹{Number(item.grand_total || 0).toLocaleString()}</span>
                                                    }
                                                </td>
                                                <td className="px-5 py-4">
                                                    <ArrowRight size={14} className="text-slate-200 group-hover:text-indigo-600 transition-colors" />
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

export default OperationalActivity;
