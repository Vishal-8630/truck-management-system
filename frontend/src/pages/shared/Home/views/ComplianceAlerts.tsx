import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft, ArrowRight, Truck, SlidersHorizontal, X, Search } from "lucide-react";
import { useTrucks } from "@/hooks/useTrucks";
import Loading from "@/components/Loading";
import { formatDate } from "@/utils/formatDate";
import Pagination from "@/components/ui/Pagination/Pagination";

const PAGE_SIZE = 20;
const SEVERITY_OPTIONS = ["All", "Expired", "Critical", "Warning", "OK"];
const DOC_TYPE_OPTIONS = ["All", "Insurance", "Fitness", "Pollution/PUC", "Tax", "National Permit", "State Permit"];

interface Alert {
    truckId: string;
    truck_no: string;
    docType: string;
    expiryDate: Date;
    daysLeft: number;
    severity: "Expired" | "Critical" | "Warning" | "OK";
}

const ComplianceAlerts = () => {
    const navigate = useNavigate();
    const { useTrucksQuery } = useTrucks();
    const { data: trucks = [], isLoading } = useTrucksQuery();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Build alerts from all truck doc expiry fields using CORRECT field names from DB
    const allAlerts: Alert[] = useMemo(() => {
        const alerts: Alert[] = [];
        trucks.forEach((t: any) => {
            const docs: { key: string; label: string }[] = [
                { key: "insurance_doc_expiry", label: "Insurance" },
                { key: "fitness_doc_expiry", label: "Fitness" },
                { key: "pollution_doc_expiry", label: "Pollution/PUC" },
                { key: "tax_doc_expiry", label: "Tax" },
                { key: "national_permit_doc_expiry", label: "National Permit" },
                { key: "state_permit_doc_expiry", label: "State Permit" },
            ];
            docs.forEach(({ key, label }) => {
                const val = t[key];
                if (!val) return; // skip if doc date not set at all
                const exp = new Date(val);
                if (isNaN(exp.getTime())) return; // skip invalid dates
                const daysLeft = Math.ceil((exp.getTime() - today.getTime()) / 86400000);
                const severity: Alert["severity"] =
                    daysLeft < 0 ? "Expired" :
                        daysLeft <= 7 ? "Critical" :
                            daysLeft <= 30 ? "Warning" : "OK";
                alerts.push({ truckId: t._id, truck_no: t.truck_no, docType: label, expiryDate: exp, daysLeft, severity });
            });
        });
        // Sort: most urgent (smallest daysLeft) first
        return alerts.sort((a, b) => a.daysLeft - b.daysLeft);
    }, [trucks]);

    // Filters
    const [search, setSearch] = useState("");
    const [severity, setSeverity] = useState("All");
    const [docType, setDocType] = useState("All");
    const [maxDays, setMaxDays] = useState(""); // show only those expiring within N days
    const [page, setPage] = useState(1);

    const filtered = useMemo(() => {
        let list = [...allAlerts];
        const q = search.trim().toLowerCase();
        if (q) list = list.filter(a => a.truck_no.toLowerCase().includes(q) || a.docType.toLowerCase().includes(q));
        if (severity !== "All") list = list.filter(a => a.severity === severity);
        if (docType !== "All") list = list.filter(a => a.docType === docType);
        if (maxDays) list = list.filter(a => a.daysLeft <= Number(maxDays));
        return list;
    }, [allAlerts, search, severity, docType, maxDays]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const hasFilters = search || severity !== "All" || docType !== "All" || maxDays;
    const resetFilters = () => { setSearch(""); setSeverity("All"); setDocType("All"); setMaxDays(""); setPage(1); };

    const expiredCount = allAlerts.filter(a => a.severity === "Expired").length;
    const criticalCount = allAlerts.filter(a => a.severity === "Critical").length;
    const warningCount = allAlerts.filter(a => a.severity === "Warning").length;

    const severityStyle = (s: string): string => ({
        Expired: "bg-rose-100 text-rose-700",
        Critical: "bg-orange-100 text-orange-700",
        Warning: "bg-amber-100 text-amber-700",
        OK: "bg-emerald-100 text-emerald-700",
    } as Record<string, string>)[s] ?? "bg-slate-100 text-slate-600";

    return (
        <div className="flex flex-col gap-8 pb-20 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center gap-4 flex-wrap">
                <button onClick={() => navigate(-1)} className="w-11 h-11 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 hover:text-rose-600 hover:border-rose-200 transition-all">
                    <ArrowLeft size={20} />
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-200">
                        <ShieldAlert size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-black italic tracking-tight text-slate-900">
                            Compliance <span className="text-rose-600">Alerts</span>
                        </h1>
                        <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">All fleet document expiry dates — Expired · Critical · Warning · OK</p>
                    </div>
                </div>
                <div className="ml-auto px-6 py-3 rounded-2xl bg-rose-50 border border-rose-100">
                    <span className="text-2xl font-black text-rose-600 italic">{allAlerts.length}</span>
                    <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest block leading-none">Issues</span>
                </div>
            </div>

            {isLoading && <Loading />}

            {!isLoading && (
                <>
                    {/* Summary (Live Filters) */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {[
                            { label: "Matches", value: filtered.length, color: "slate", key: "All" },
                            { label: "Expired", value: filtered.filter(a => a.severity === "Expired").length, color: "rose", key: "Expired" },
                            { label: "Critical", value: filtered.filter(a => a.severity === "Critical").length, color: "orange", key: "Critical" },
                            { label: "Warning", value: filtered.filter(a => a.severity === "Warning").length, color: "amber", key: "Warning" },
                            { label: "Compliant", value: filtered.filter(a => a.severity === "OK").length, color: "emerald", key: "OK" },
                        ].map((s, i) => (
                            <div key={i}
                                className={`card-premium !p-5 border-${s.color}-100 bg-${s.color}-50/20 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 active:scale-95`}
                                onClick={() => { setSeverity(s.key); setPage(1); }}>
                                <p className={`text-3xl font-black italic text-${s.color}-600`}>{s.value}</p>
                                <p className={`text-[10px] font-black uppercase tracking-widest text-${s.color}-400 mt-1`}>{s.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Filters */}
                    <div className="card-premium !p-6 flex flex-col gap-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <SlidersHorizontal size={16} className="text-rose-500" />
                                <span className="text-sm font-black text-slate-700 uppercase tracking-widest">Filters</span>
                                {hasFilters && <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 text-[9px] font-black uppercase">Active</span>}
                            </div>
                            {hasFilters && (
                                <button onClick={resetFilters} className="text-[10px] font-black text-slate-400 hover:text-rose-500 uppercase tracking-widest flex items-center gap-1.5 transition-colors">
                                    <X size={12} /> Clear All
                                </button>
                            )}
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="relative sm:col-span-2 lg:col-span-1">
                                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                                    placeholder="Search truck no. or doc type..."
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-300 transition-all" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Severity</label>
                                <select value={severity} onChange={e => { setSeverity(e.target.value); setPage(1); }}
                                    className="py-3 px-4 rounded-xl border border-slate-100 bg-slate-50/50 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all">
                                    {SEVERITY_OPTIONS.map(o => <option key={o}>{o}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Document Type</label>
                                <select value={docType} onChange={e => { setDocType(e.target.value); setPage(1); }}
                                    className="py-3 px-4 rounded-xl border border-slate-100 bg-slate-50/50 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all">
                                    {DOC_TYPE_OPTIONS.map(o => <option key={o}>{o}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expiry Within (days)</label>
                                <input type="number" value={maxDays} onChange={e => { setMaxDays(e.target.value); setPage(1); }}
                                    placeholder="e.g. 14"
                                    className="py-3 px-4 rounded-xl border border-slate-100 bg-slate-50/50 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all" />
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/30">
                            <ShieldAlert className="w-16 h-16 text-slate-200 mb-4" strokeWidth={1.5} />
                            <p className="text-slate-400 font-black text-lg italic">{hasFilters ? "No results match your filters." : "Fleet fully compliant — no alerts!"}</p>
                        </div>
                    ) : (
                        <div className="card-premium !p-0 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100">
                                            {["#", "Truck", "Document", "Expiry Date", "Days Left", "Severity", ""].map(h => (
                                                <th key={h} className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left whitespace-nowrap">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {paginated.map((a, idx) => (
                                            <tr key={`${a.truckId}-${a.docType}`}
                                                className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                                                onClick={() => navigate(`/journey/truck-detail/${a.truckId}`)}>
                                                <td className="px-5 py-4 text-[10px] font-black text-slate-300">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                                                <td className="px-5 py-4 font-black text-slate-900">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 shrink-0"><Truck size={13} /></div>
                                                        {a.truck_no}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 font-bold text-slate-700">{a.docType}</td>
                                                <td className="px-5 py-4 text-slate-500 font-bold whitespace-nowrap text-xs">{formatDate(a.expiryDate)}</td>
                                                <td className="px-5 py-4">
                                                    <span className={`text-xs font-black italic ${a.daysLeft < 0 ? "text-rose-600" : a.daysLeft <= 7 ? "text-orange-600" : a.daysLeft <= 30 ? "text-amber-600" : "text-emerald-600"}`}>
                                                        {a.daysLeft < 0 ? `${Math.abs(a.daysLeft)}d ago` : `${a.daysLeft}d left`}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className={`text-[9px] font-black px-2.5 py-1.5 rounded-full uppercase ${severityStyle(a.severity)}`}>
                                                        {a.severity}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <ArrowRight size={14} className="text-slate-200 group-hover:text-rose-600 transition-colors" />
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

export default ComplianceAlerts;
