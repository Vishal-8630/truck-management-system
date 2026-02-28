import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Scale, ArrowLeft, ArrowRight, MapPin, Truck, User, Search, X, SlidersHorizontal } from "lucide-react";
import { useJourneys } from "@/hooks/useJourneys";
import Loading from "@/components/Loading";
import { formatDate } from "@/utils/formatDate";
import Pagination from "@/components/ui/Pagination/Pagination";

const PAGE_SIZE = 20;

const PAYMENT_STATUS_OPTIONS = ["All", "Pending", "Partially Paid"];

const UnsettledJourneys = () => {
    const navigate = useNavigate();
    const { useJourneysQuery } = useJourneys();
    const { data: journeys = [], isLoading } = useJourneysQuery();

    // Filters
    const [search, setSearch] = useState(""); // searches truck no or driver
    const [paymentStatus, setPaymentStatus] = useState("All");
    const [overdueDays, setOverdueDays] = useState("All"); // "All" | "7+" | "14+" | "30+"
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [page, setPage] = useState(1);

    const baseUnsettled = useMemo(() =>
        journeys.filter((j: any) =>
            j.status === "Completed" &&
            (!j.journey_settlement_status || j.journey_settlement_status === "Unsettled")
        ).sort((a: any, b: any) => new Date(b.journey_end_date || b.createdAt || 0).getTime() - new Date(a.journey_end_date || a.createdAt || 0).getTime()),
        [journeys]);

    const filtered = useMemo(() => {
        let list = [...baseUnsettled];
        const q = search.trim().toLowerCase();
        if (q) list = list.filter((j: any) =>
            (j.truck?.truck_no || "").toLowerCase().includes(q) ||
            (j.driver?.name || "").toLowerCase().includes(q) ||
            (j.from || "").toLowerCase().includes(q) ||
            (j.to || "").toLowerCase().includes(q)
        );
        if (paymentStatus !== "All") list = list.filter((j: any) => j.party_payment_status === paymentStatus);
        if (dateFrom) list = list.filter((j: any) => j.journey_end_date && new Date(j.journey_end_date) >= new Date(dateFrom));
        if (dateTo) list = list.filter((j: any) => j.journey_end_date && new Date(j.journey_end_date) <= new Date(dateTo));
        if (overdueDays !== "All") {
            const minDays = parseInt(overdueDays);
            list = list.filter((j: any) => {
                const days = Math.floor((Date.now() - new Date(j.journey_end_date).getTime()) / 86400000);
                return days >= minDays;
            });
        }
        return list;
    }, [baseUnsettled, search, paymentStatus, dateFrom, dateTo, overdueDays]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const resetFilters = () => {
        setSearch(""); setPaymentStatus("All"); setOverdueDays("All"); setDateFrom(""); setDateTo(""); setPage(1);
    };
    const hasFilters = search || paymentStatus !== "All" || overdueDays !== "All" || dateFrom || dateTo;

    const statCards = [
        { label: "Matches", value: filtered.length, color: "indigo" },
        { label: "Overdue >7d", value: filtered.filter((j: any) => (Date.now() - new Date(j.journey_end_date).getTime()) > 7 * 86400000).length, color: "rose" },
        { label: "Partially Paid", value: filtered.filter((j: any) => j.party_payment_status === "Partially Paid").length, color: "amber" },
        { label: "Total Unsettled", value: baseUnsettled.length, color: "slate" },
    ];

    return (
        <div className="flex flex-col gap-8 pb-20 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center gap-4 flex-wrap">
                <button onClick={() => navigate(-1)} className="w-11 h-11 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all">
                    <ArrowLeft size={20} />
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                        <Scale size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-black italic tracking-tight text-slate-900">
                            Journey <span className="text-indigo-600">Settlement</span>
                        </h1>
                        <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Completed journeys awaiting financial settlement</p>
                    </div>
                </div>
                <div className="ml-auto px-6 py-3 rounded-2xl bg-indigo-50 border border-indigo-100">
                    <span className="text-2xl font-black text-indigo-600 italic">{baseUnsettled.length}</span>
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block leading-none">Unsettled</span>
                </div>
            </div>

            {isLoading && <Loading />}

            {!isLoading && (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {statCards.map((s, i) => (
                            <div key={i} className={`card-premium !p-5 border-${s.color}-100 bg-${s.color}-50/20`}>
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
                            <div className="relative col-span-full sm:col-span-2">
                                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                                    placeholder="Search truck, driver, from, to..."
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
                                />
                            </div>
                            {/* Party Payment Status */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Party Payment</label>
                                <select value={paymentStatus} onChange={e => { setPaymentStatus(e.target.value); setPage(1); }}
                                    className="py-3 px-4 rounded-xl border border-slate-100 bg-slate-50/50 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all">
                                    {PAYMENT_STATUS_OPTIONS.map(o => <option key={o}>{o}</option>)}
                                </select>
                            </div>
                            {/* Overdue */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Overdue Since</label>
                                <select value={overdueDays} onChange={e => { setOverdueDays(e.target.value); setPage(1); }}
                                    className="py-3 px-4 rounded-xl border border-slate-100 bg-slate-50/50 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all">
                                    {["All", "7", "14", "30"].map(o => <option key={o} value={o}>{o === "All" ? "All" : `${o}+ days`}</option>)}
                                </select>
                            </div>
                            {/* Date From */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">End Date From</label>
                                <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }}
                                    className="py-3 px-4 rounded-xl border border-slate-100 bg-slate-50/50 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all" />
                            </div>
                            {/* Date To */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">End Date To</label>
                                <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }}
                                    className="py-3 px-4 rounded-xl border border-slate-100 bg-slate-50/50 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all" />
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/30">
                            <Scale className="w-16 h-16 text-slate-200 mb-4" strokeWidth={1.5} />
                            <p className="text-slate-400 font-black text-lg italic">{hasFilters ? "No results match your filters." : "All journeys are settled!"}</p>
                        </div>
                    ) : (
                        <div className="card-premium !p-0 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100">
                                            {["#", "Truck", "Driver", "Route", "End Date", "Days Since", "Party Payment", ""].map(h => (
                                                <th key={h} className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left whitespace-nowrap">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {paginated.map((j: any, idx) => {
                                            const days = Math.floor((Date.now() - new Date(j.journey_end_date).getTime()) / 86400000);
                                            const isOverdue = days > 7;
                                            return (
                                                <tr key={j._id} className="hover:bg-slate-50/80 transition-colors group cursor-pointer" onClick={() => navigate(`/journey/journey-detail/${j._id}`)}>
                                                    <td className="px-5 py-4 text-[10px] font-black text-slate-300">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                                                    <td className="px-5 py-4 font-black text-slate-900">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0"><Truck size={13} /></div>
                                                            {j.truck?.truck_no || "—"}
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-2 font-bold text-slate-700">
                                                            <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0"><User size={12} /></div>
                                                            <span className="truncate max-w-[100px]">{j.driver?.name || "—"}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-1 font-bold text-slate-600 text-xs">
                                                            <MapPin size={11} className="text-indigo-400 shrink-0" />
                                                            <span className="truncate max-w-[120px]">{j.from} → {j.to}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4 text-slate-500 font-bold whitespace-nowrap text-xs">{j.journey_end_date ? formatDate(new Date(j.journey_end_date)) : "—"}</td>
                                                    <td className="px-5 py-4">
                                                        <span className={`text-xs font-black italic ${isOverdue ? "text-rose-600" : "text-slate-500"}`}>{isNaN(days) ? "—" : `${days}d`}{isOverdue ? " ⚠️" : ""}</span>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <span className={`text-[9px] font-black px-2.5 py-1.5 rounded-full uppercase ${j.party_payment_status === "Partially Paid" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
                                                            {j.party_payment_status}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <ArrowRight size={14} className="text-slate-200 group-hover:text-indigo-600 transition-colors" />
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

export default UnsettledJourneys;
