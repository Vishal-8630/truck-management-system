import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSettlements } from "@/hooks/useSettlements";
import Loading from "@/components/Loading";
import { motion } from "framer-motion";
import FilterContainer from "@/components/FilterContainer";
import { SettlementFilters } from "@/filters/settlementFilters";
import { type SettlementType } from "@/types/settlement";
import PaginatedList from "@/components/PaginatedList";
import { formatDate } from "@/utils/formatDate";
import {
    Scale,
    User,
    Calendar,
    ChevronRight,
    TrendingUp,
    Wallet,
    MapPin,
    Milestone,
} from "lucide-react";

/* ---- Status badge colours ---- */
const SETTLED_STYLE = "bg-emerald-50 text-emerald-600 border-emerald-200";
const PENDING_STYLE = "bg-amber-50 text-amber-600 border-amber-200";

const AllSettlements = () => {
    const navigate = useNavigate();
    const { useSettlementsQuery } = useSettlements();
    const { data: settlements = [], isLoading } = useSettlementsQuery();
    const [filteredSettlements, setFilteredSettlements] = useState<SettlementType[]>([]);

    useEffect(() => {
        const sorted = [...settlements].sort((a, b) =>
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        setFilteredSettlements(sorted);
    }, [settlements]);

    if (isLoading) return <Loading />;

    return (
        <div className="flex flex-col gap-10 pb-20">
            {/* ── Header ── */}
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight italic flex items-center gap-4">
                    <Scale className="text-blue-600 w-10 h-10 lg:w-12 lg:h-12" />
                    Driver <span className="text-blue-600">Settlements</span>
                </h1>
                <p className="text-slate-500 font-medium text-lg">
                    Full history of all driver payout settlements and reconciliations.
                </p>
            </div>

            {/* ── Stats row ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                    {
                        label: "Total Settlements",
                        value: settlements.length,
                        icon: <Scale size={18} className="text-blue-500" />,
                        color: "from-blue-50 to-white border-blue-100",
                    },
                    {
                        label: "Pending",
                        value: settlements.filter((s: SettlementType) => !s.is_settled).length,
                        icon: <TrendingUp size={18} className="text-amber-500" />,
                        color: "from-amber-50 to-white border-amber-100",
                    },
                    {
                        label: "Settled",
                        value: settlements.filter((s: SettlementType) => s.is_settled).length,
                        icon: <Wallet size={18} className="text-emerald-500" />,
                        color: "from-emerald-50 to-white border-emerald-100",
                    },
                ].map((stat, i) => (
                    <div key={i} className={`card-premium p-6 flex items-center gap-4 bg-gradient-to-br ${stat.color}`}>
                        <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-slate-100">
                            {stat.icon}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</span>
                            <span className="text-2xl font-extrabold text-slate-900 italic tracking-tight">{stat.value}</span>
                        </div>
                    </div>
                ))}
            </div>

            <FilterContainer
                data={settlements}
                filters={SettlementFilters}
                onFiltered={setFilteredSettlements}
            />
            <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    {filteredSettlements.length} {filteredSettlements.length === 1 ? "Settlement" : "Settlements"} Found
                </span>
            </div>

            <div className="flex flex-col gap-2 min-h-[400px]">
                <PaginatedList
                    items={filteredSettlements}
                    itemsPerPage={9}
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                    renderItem={(settlement) => {
                        const trips = settlement.journeys?.length ?? 0;
                        const fromDate = settlement.period?.from ? formatDate(new Date(settlement.period.from)) : "—";
                        const toDate = settlement.period?.to ? formatDate(new Date(settlement.period.to)) : "—";

                        return (
                            <motion.div
                                key={settlement._id}
                                layout
                                initial={{ opacity: 0, scale: 0.97 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onClick={() =>
                                    navigate(`/journey/driver-detail/${settlement.driver?._id}/settlement/${settlement._id}`)
                                }
                                className="card-premium p-6 group cursor-pointer hover:border-blue-200 hover:ring-4 hover:ring-blue-50 transition-all duration-300 flex flex-col gap-5"
                            >
                                {/* Top row – driver + status */}
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm shrink-0">
                                            <User size={20} />
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Driver</span>
                                            <span className="text-base font-extrabold text-slate-900 uppercase tracking-tight group-hover:text-blue-600 transition-colors leading-tight">
                                                {settlement.driver?.name ?? "—"}
                                            </span>
                                        </div>
                                    </div>
                                    <span className={`shrink-0 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${settlement.is_settled ? SETTLED_STYLE : PENDING_STYLE}`}>
                                        {settlement.is_settled ? "Settled" : "Pending"}
                                    </span>
                                </div>

                                {/* Period */}
                                <div className="flex items-center gap-2 text-slate-500">
                                    <Calendar size={13} className="shrink-0 text-slate-300" />
                                    <span className="text-xs font-bold uppercase tracking-wide">
                                        {fromDate}
                                    </span>
                                    <span className="text-slate-300">→</span>
                                    <span className="text-xs font-bold uppercase tracking-wide">
                                        {toDate}
                                    </span>
                                </div>

                                {/* Stats row */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="flex flex-col gap-0.5 p-3 bg-slate-50 rounded-2xl">
                                        <Milestone size={12} className="text-slate-300 mb-1" />
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Distance</span>
                                        <span className="text-sm font-extrabold text-slate-900 italic">{settlement.total_distance ? `${Math.floor(Number(settlement.total_distance))} km` : "—"}</span>
                                    </div>
                                    <div className="flex flex-col gap-0.5 p-3 bg-slate-50 rounded-2xl">
                                        <MapPin size={12} className="text-slate-300 mb-1" />
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Trips</span>
                                        <span className="text-sm font-extrabold text-slate-900 italic">{trips}</span>
                                    </div>
                                    <div className="flex flex-col gap-0.5 p-3 bg-blue-50 rounded-2xl">
                                        <Wallet size={12} className="text-blue-300 mb-1" />
                                        <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest leading-none">Payout</span>
                                        <span className="text-sm font-extrabold text-blue-700 italic">₹{settlement.driver_total ? Math.ceil(Number(settlement.driver_total)) : "—"}</span>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-4 border-t border-slate-50 gap-2">
                                    <div className="flex flex-col gap-0.5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Overall Amount</span>
                                            <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-dashed hover:border-solid transition-all ${settlement.payment_status === "Balanced" ? "bg-slate-50 text-slate-500 border-slate-200" :
                                                settlement.payment_status === "Driver Needs to Pay" ? "bg-rose-50 text-rose-600 border-rose-200" :
                                                    "bg-blue-50 text-blue-600 border-blue-200"
                                                }`}>
                                                {settlement.payment_status}
                                            </span>
                                        </div>
                                        <span className="text-lg font-black text-slate-900 italic tracking-tight">
                                            ₹{settlement.overall_total ? Math.ceil(Number(settlement.overall_total)) : "—"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-400 shrink-0">
                                        <span className="text-xs font-bold uppercase tracking-widest">View</span>
                                        <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    }}
                />
                {filteredSettlements.length === 0 && (
                    <div className="col-span-full py-32 flex flex-col items-center justify-center bg-white rounded-[2.5rem] border border-dashed border-slate-200 shadow-sm">
                        <Scale size={48} className="text-slate-200 mb-4" />
                        <p className="text-slate-400 font-bold italic">No settlements found matching your criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllSettlements;
