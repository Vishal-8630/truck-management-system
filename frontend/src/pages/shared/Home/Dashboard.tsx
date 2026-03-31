import { motion } from "framer-motion";
import {
    Truck,
    MapPin,
    FileText,
    ChevronRight,
    Plus,
    LayoutDashboard,
    Bell,
    Settings,
    ShieldAlert,
    Scale,
    ArrowRight,
    Wallet,
    Calendar
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { useTrucks } from "@/hooks/useTrucks";
import { useJourneys } from "@/hooks/useJourneys";
import { useBillEntries, useLedgers, useVehicleEntries } from "@/hooks/useLedgers";
import { useSettlements } from "@/hooks/useSettlements";
import { useEffect, useState, useMemo } from "react";
import api from "@/api/axios";
import { formatDate } from "@/utils/formatDate";

const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();

    // Data Fetching
    const { useTrucksQuery } = useTrucks();
    const { useJourneysQuery } = useJourneys();
    const { useBillEntriesQuery } = useBillEntries();
    const { useSettlementsQuery } = useSettlements();
    const { useLedgersQuery } = useLedgers();
    const { useVehicleEntriesQuery } = useVehicleEntries();

    const { data: trucks = [] } = useTrucksQuery();
    const { data: journeys = [] } = useJourneysQuery();
    const { data: billEntries = [] } = useBillEntriesQuery();
    const { data: settlements = [] } = useSettlementsQuery();
    const { data: ledgers = [] } = useLedgersQuery();
    const { data: vehicleEntries = [] } = useVehicleEntriesQuery();

    const [inquiryCount, setInquiryCount] = useState(0);

    useEffect(() => {
        const fetchInquiries = async () => {
            try {
                const { data } = await api.get("/inquiry");
                setInquiryCount(data.data?.filter((i: any) => i.status === 'Pending').length || 0);
            } catch (error) {
                console.error("Failed to fetch inquiries");
            }
        };
        fetchInquiries();
    }, []);

    // Compute Expirations
    const documentAlerts = useMemo(() => {
        const alerts: { truckId: string, truck: string, doc: string, expiry: string, daysLeft: number }[] = [];
        const today = new Date();

        trucks.forEach(truck => {
            const docFields = [
                { key: 'fitness_doc_expiry', label: 'Fitness' },
                { key: 'insurance_doc_expiry', label: 'Insurance' },
                { key: 'pollution_doc_expiry', label: 'Pollution' },
                { key: 'tax_doc_expiry', label: 'Tax' },
                { key: 'national_permit_doc_expiry', label: 'National Permit' },
                { key: 'state_permit_doc_expiry', label: 'State Permit' }
            ];

            docFields.forEach(field => {
                const expiryDateStr = (truck as any)[field.key];
                if (expiryDateStr) {
                    const expiryDate = new Date(expiryDateStr);
                    const diffTime = expiryDate.getTime() - today.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    if (diffDays <= 30) {
                        alerts.push({
                            truckId: truck._id,
                            truck: truck.truck_no,
                            doc: field.label,
                            expiry: expiryDateStr,
                            daysLeft: diffDays
                        });
                    }
                }
            });
        });
        return alerts.sort((a, b) => a.daysLeft - b.daysLeft);
    }, [trucks]);

    // Pending Settlements (Driver)
    const unsettledJourneys = useMemo(() => {
        return journeys.filter(j =>
            j.status === 'Completed' &&
            (!j.journey_settlement_status || j.journey_settlement_status === 'Unsettled')
        );
    }, [journeys]);

    // Active Settlement Records (In Progress)
    const pendingSettlements = useMemo(() => {
        return settlements.filter((s: any) => !s.is_settled);
    }, [settlements]);

    // Party Payment Alerts
    const pendingPartyPayments = useMemo(() => {
        return vehicleEntries.filter((e: any) => e.status === 'Pending')
            .sort((a: any, b: any) => new Date(b.date || b.createdAt || 0).getTime() - new Date(a.date || a.createdAt || 0).getTime());
    }, [vehicleEntries]);

    // Missing Progress Updates
    const missedCheckpoints = useMemo(() => {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        return journeys.filter(j => {
            if (j.status !== 'Active') return false;
            const todayProgress = j.daily_progress?.find((p: any) => {
                if (!p.date) return false;
                try {
                    return new Date(p.date).toISOString().split('T')[0] === todayStr;
                } catch {
                    return false;
                }
            });
            return !todayProgress || !todayProgress.location || todayProgress.location.trim() === "";
        });
    }, [journeys]);

    // Upcoming Checkpoints
    const upcomingCheckpoints = useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        return journeys.filter(j => j.status === 'Active')
            .map(j => {
                const nextProgress = j.daily_progress?.find((p: any) => {
                    if (!p.date) return false;
                    try {
                        const isFuture = new Date(p.date).toISOString().split('T')[0] > todayStr;
                        const isNotUpdated = !p.location || p.location.trim() === "";
                        return isFuture && isNotUpdated;
                    } catch {
                        return false;
                    }
                });
                return nextProgress ? { journey: j, next: nextProgress } : null;
            }).filter(Boolean).slice(0, 5);
    }, [journeys]);

    // Combined Recent Activity
    const recentActivity = useMemo(() => {
        const act: any[] = [
            ...journeys.map(j => ({ ...j, type: 'journey', sortDate: new Date(j.createdAt || 0) })),
            ...billEntries.map(b => ({ ...b, type: 'bill', sortDate: new Date(b.createdAt || 0) }))
        ];
        return act.sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime()).slice(0, 10);
    }, [journeys, billEntries]);

    // Financial Performance
    const financialSummary = useMemo(() => {
        const months: Record<string, { label: string, credit: number, debit: number, rawDate: Date }> = {};
        const today = new Date();

        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
            months[key] = {
                label: d.toLocaleString('default', { month: 'short' }),
                credit: 0,
                debit: 0,
                rawDate: d
            };
        }

        ledgers.forEach(entry => {
            const d = new Date(entry.date);
            const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
            if (months[key]) {
                months[key].credit += Number(entry.credit) || 0;
                months[key].debit += Number(entry.debit) || 0;
            }
        });

        return Object.values(months).sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime());
    }, [ledgers]);

    const maxFinanceValue = useMemo(() => {
        const values = financialSummary.flatMap(m => [m.credit, m.debit]);
        return Math.max(...values, 1000);
    }, [financialSummary]);

    const stats = [
        {
            label: "Update Missing",
            value: missedCheckpoints.length,
            icon: <MapPin className="text-rose-500" />,
            trend: "Missed Checkpoints",
            color: "rose"
        },
        {
            label: "Unsettled",
            value: unsettledJourneys.length + pendingSettlements.length,
            icon: <Scale className="text-amber-500" />,
            trend: "Awaiting Action",
            color: "amber"
        },
        {
            label: "Pending Bills",
            value: pendingPartyPayments.length,
            icon: <Wallet className="text-indigo-500" />,
            trend: "Party Payments",
            color: "indigo"
        },
        {
            label: "New Inquiries",
            value: inquiryCount,
            icon: <Bell className="text-slate-500" />,
            trend: "Leads",
            color: "slate"
        }
    ];

    const quickActions = [
        {
            title: "New Bill Entry",
            desc: "Add LR or Billing Record",
            icon: <Plus className="w-6 h-6" />,
            link: "/bill-entry/all-bill-entries",
            color: "bg-indigo-600"
        },
        {
            title: "Start Journey",
            desc: "Dispatch Truck & Driver",
            icon: <MapPin className="w-6 h-6" />,
            link: "/journey/all-journey-entries",
            color: "bg-emerald-600"
        },
        {
            title: "Fleet Master",
            desc: "Update Vehicles & Docs",
            icon: <Truck className="w-6 h-6" />,
            link: "/journey/all-truck-entries",
            color: "bg-blue-600"
        },
        {
            title: "Quick Bill Search",
            desc: "Find & Print Invoice",
            icon: <FileText className="w-6 h-6" />,
            link: "/bill-entry/bill",
            color: "bg-slate-800"
        }
    ];

    return (
        <div className="flex flex-col gap-10 pb-20 animate-in fade-in duration-700 max-w-[1600px] mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-[1.5rem] bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-100 dark:shadow-none rotate-3">
                            <LayoutDashboard size={28} />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-3xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white italic">
                                Control <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-8">Center</span>
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 font-bold text-sm uppercase tracking-widest ml-1">
                                Operational Intelligence for {user?.fullname || 'Admin'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate("/profile")}
                        className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-indigo-600 hover:shadow-lg transition-all shadow-sm group"
                        title="User Profile & Settings"
                    >
                        <Settings size={22} className="group-hover:rotate-45 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="card-premium relative group overflow-hidden !p-7 hover:border-indigo-200 transition-all duration-500"
                    >
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-50 dark:bg-${stat.color}-900/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700 blur-2xl`}></div>
                        <div className="relative z-10 flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                                <div className={`w-14 h-14 rounded-2xl bg-${stat.color}-50 dark:bg-${stat.color}-900/20 flex items-center justify-center text-2xl shadow-sm border border-${stat.color}-100/50`}>
                                    {stat.icon}
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-600 dark:text-${stat.color}-400 border border-${stat.color}-100/50`}>
                                        {stat.trend}
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <p className="text-4xl font-black text-slate-900 dark:text-white leading-none italic tracking-tighter">{stat.value}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-3">{stat.label}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Main Grid Content */}
            <div className="grid lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 flex flex-col gap-10">
                    <section className="flex flex-col gap-6">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-2xl font-black flex items-center gap-3 italic">
                                Smart <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-8">Shortcuts</span>
                            </h3>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-5">
                            {quickActions.map((action, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => navigate(action.link)}
                                    className="card-premium !p-6 flex items-center gap-6 group hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-300"
                                >
                                    <div className={`w-16 h-16 shrink-0 rounded-[1.25rem] ${action.color} text-white flex items-center justify-center shadow-lg group-hover:rotate-12 transition-all duration-500`}>
                                        {action.icon}
                                    </div>
                                    <div className="flex flex-col items-start text-left">
                                        <p className="text-lg font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{action.title}</p>
                                        <p className="text-xs font-bold text-slate-400 mt-1">{action.desc}</p>
                                    </div>
                                    <ArrowRight className="ml-auto text-slate-200 group-hover:text-indigo-600 transition-all group-hover:translate-x-1" size={24} />
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="flex flex-col gap-6">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-2xl font-black flex items-center gap-3 italic">
                                Financial <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-8">Pulse</span>
                            </h3>
                            <button onClick={() => navigate("/ledger/all-ledgers")} className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:tracking-[0.2em] transition-all flex items-center gap-2 group">
                                View Full Ledger <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                        <div className="card-premium !p-8 flex flex-col gap-10">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                <div className="flex flex-col gap-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Monthly Performance</p>
                                    <h4 className="text-lg font-black text-slate-900 dark:text-white italic">Cash Flow Overview</h4>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-100"></div>
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Inflow (Credit)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-rose-500 shadow-lg shadow-rose-100"></div>
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Outflow (Debit)</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-end justify-between gap-2 h-44 sm:h-64 pt-4 border-b border-slate-50 relative">
                                {financialSummary.map((m, idx) => (
                                    <div key={idx} className="flex-1 flex flex-col items-center gap-4 group h-full">
                                        <div className="w-full flex items-end justify-center gap-1 sm:gap-2 h-full">
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: `${(m.credit / (maxFinanceValue || 1)) * 100}%` }}
                                                transition={{ delay: idx * 0.1, duration: 1 }}
                                                className="w-3 sm:w-6 lg:w-8 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-lg relative group-hover:shadow-lg group-hover:shadow-emerald-100 transition-all cursor-pointer"
                                            >
                                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 bg-slate-900 text-white text-[10px] font-black px-2 py-1.5 rounded-lg transition-opacity z-20 shadow-xl pointer-events-none">
                                                    CR: â‚¹{m.credit.toLocaleString()}
                                                </div>
                                            </motion.div>
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: `${(m.debit / (maxFinanceValue || 1)) * 100}%` }}
                                                transition={{ delay: idx * 0.1 + 0.2, duration: 1 }}
                                                className="w-3 sm:w-6 lg:w-8 bg-gradient-to-t from-rose-500 to-rose-400 rounded-t-lg relative group-hover:shadow-lg group-hover:shadow-rose-100 transition-all cursor-pointer"
                                            >
                                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 bg-slate-900 text-white text-[10px] font-black px-2 py-1.5 rounded-lg transition-opacity z-20 shadow-xl pointer-events-none">
                                                    DR: â‚¹{m.debit.toLocaleString()}
                                                </div>
                                            </motion.div>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.label}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="p-5 rounded-2xl border border-slate-50 bg-slate-50/50 flex flex-col gap-1">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Month</span>
                                    <span className={`text-xl font-black italic tracking-tight ${financialSummary[5].credit >= financialSummary[5].debit ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {financialSummary[5].credit >= financialSummary[5].debit ? '+' : '-'} â‚¹{Math.abs(financialSummary[5].credit - financialSummary[5].debit).toLocaleString()}
                                    </span>
                                </div>
                                <div className="p-5 rounded-2xl border border-slate-50 bg-slate-50/50 flex flex-col gap-1">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Revenue Impact</span>
                                    <span className="text-sm font-black italic tracking-tight text-slate-900 leading-tight">System Managed</span>
                                </div>
                                <div className="p-5 rounded-2xl border border-slate-50 bg-slate-50/50 flex flex-col gap-1">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Balance Status</span>
                                    <span className="text-[10px] font-black px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 w-fit mt-1">OPERATIONAL</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {documentAlerts.length > 0 && (
                        <section className="flex flex-col gap-6">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-2xl font-black flex items-center gap-3 italic">
                                    Compliance <span className="text-rose-600 underline decoration-rose-200 underline-offset-8">Critical</span>
                                    <span className="ml-2 px-3 py-1 rounded-xl bg-rose-50 text-rose-600 text-[10px] uppercase font-black border border-rose-100">{documentAlerts.length} Issues</span>
                                </h3>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {documentAlerts.slice(0, 6).map((alert, i) => (
                                    <div
                                        key={i}
                                        onClick={() => navigate(`/journey/truck/${alert.truckId}`)}
                                        className="card-premium !p-5 border-rose-100 bg-rose-50/10 flex items-center gap-5 cursor-pointer hover:bg-rose-50/30 hover:border-rose-200 transition-all group"
                                    >
                                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-rose-600 shadow-sm border border-rose-100 group-hover:scale-110 transition-transform">
                                            <ShieldAlert size={24} />
                                        </div>
                                        <div className="flex flex-col flex-1">
                                            <div className="flex items-center justify-between">
                                                <p className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tighter">{alert.truck}</p>
                                                <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-md ${alert.daysLeft < 0 ? 'bg-rose-600 text-white' : 'bg-rose-100 text-rose-600'}`}>
                                                    {alert.daysLeft < 0 ? 'EXPIRED' : `${alert.daysLeft}D LEFT`}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 font-bold mt-1">
                                                {alert.doc} â€¢ {formatDate(new Date(alert.expiry))}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    <div className="flex flex-col gap-10">
                        <section className="flex flex-col gap-6">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-2xl font-black flex items-center gap-3 italic">
                                    Journey <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-8">Operations</span>
                                </h3>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="card-premium flex flex-col gap-4 !bg-slate-50/50 border-slate-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Checkpoint Alerts</p>
                                        <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                                            <Bell size={16} />
                                        </div>
                                    </div>
                                    {missedCheckpoints.length > 0 ? (
                                        <div className="flex flex-col gap-3">
                                            {missedCheckpoints.slice(0, 3).map((j: any) => (
                                                <div key={j._id} onClick={() => navigate(`/journey/journey-detail/${j._id}`)} className="flex items-center gap-4 p-3 bg-white rounded-xl border border-rose-100 hover:border-rose-300 transition-all cursor-pointer group">
                                                    <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                                                        <MapPin size={18} />
                                                    </div>
                                                    <div className="flex flex-col overflow-hidden">
                                                        <span className="text-sm font-black text-slate-900 truncate">{j.truck?.truck_no}</span>
                                                        <span className="text-[10px] font-bold text-rose-500 uppercase">Update Missing</span>
                                                    </div>
                                                    <ChevronRight size={14} className="ml-auto text-slate-300 group-hover:translate-x-1 transition-all" />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-6 text-center text-xs font-bold text-slate-400 italic">All updated.</div>
                                    )}
                                </div>
                                <div className="card-premium flex flex-col gap-4 !bg-slate-50/50 border-slate-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Coming Up</p>
                                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                            <ArrowRight size={16} />
                                        </div>
                                    </div>
                                    {upcomingCheckpoints.length > 0 ? (
                                        <div className="flex flex-col gap-3">
                                            {upcomingCheckpoints.map((item: any, i) => (
                                                <div key={i} onClick={() => navigate(`/journey/journey-detail/${item.journey._id}`)} className="flex items-center gap-4 p-3 bg-white rounded-xl border border-indigo-100 hover:border-indigo-300 transition-all cursor-pointer group">
                                                    <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                                                        <Calendar size={18} />
                                                    </div>
                                                    <div className="flex flex-col overflow-hidden">
                                                        <span className="text-sm font-black text-slate-900 truncate">Day {item.next.day_number}: {item.journey.truck?.truck_no}</span>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase">{formatDate(new Date(item.next.date))}</span>
                                                    </div>
                                                    <ChevronRight size={14} className="ml-auto text-slate-300 group-hover:translate-x-1 transition-all" />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-6 text-center text-xs font-bold text-slate-400 italic">None found.</div>
                                    )}
                                </div>
                            </div>
                        </section>

                        <section className="flex flex-col gap-6">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-2xl font-black flex items-center gap-3 italic">
                                    Recent <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-8">Activity</span>
                                </h3>
                            </div>
                            <div className="card-premium !p-0 overflow-hidden divide-y divide-slate-50 shadow-2xl shadow-slate-100/50">
                                {recentActivity.length === 0 ? (
                                    <div className="p-20 text-center text-slate-400 font-bold italic">No recent activity.</div>
                                ) : (
                                    recentActivity.map((item, i) => (
                                        <div key={i} className="p-6 flex items-center gap-6 hover:bg-slate-50/80 transition-all group cursor-default">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform ${item.type === 'journey' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                                {item.type === 'journey' ? <MapPin size={24} /> : <FileText size={24} />}
                                            </div>
                                            <div className="flex flex-col flex-1 gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${item.type === 'journey' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                                        {item.type}
                                                    </span>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                                        {formatDate(new Date(item.sortDate))}
                                                    </p>
                                                </div>
                                                <p className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight">
                                                    {item.type === 'journey'
                                                        ? `Journey: ${item.truck?.truck_no || "N/A"}`
                                                        : `Invoice: â‚¹${item.grand_total} for ${item.billing_party?.name || 'Party'}`}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    if (item.type === 'journey') navigate(`/journey/journey-detail/${item._id}`);
                                                    else navigate(`/bill-entry/bill?bill_no=${item.bill_no}`);
                                                }}
                                                className="px-6 py-3 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:shadow-lg transition-all"
                                            >
                                                Inspect
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    </div>
                </div>

                <div className="lg:col-span-4 flex flex-col gap-10">
                    <section className="flex flex-col gap-10">
                        <div className="flex flex-col gap-6">
                            <h3 className="text-2xl font-black px-2 italic">Driver <span className="text-amber-600">Settlements</span></h3>
                            <div className="card-premium flex flex-col gap-6 !p-6 border-amber-100 bg-amber-50/10">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Required</p>
                                </div>
                                <div className="flex flex-col gap-3">
                                    {pendingSettlements.length > 0 ? (
                                        pendingSettlements.slice(0, 3).map((s: any, i: number) => (
                                            <div key={`pending-s-${i}`} className="flex flex-col gap-3 p-4 bg-white rounded-2xl border border-amber-100 shadow-sm relative overflow-hidden group hover:border-amber-400 transition-all cursor-pointer" onClick={() => navigate(`/journey/driver-detail/${s.driver?._id || s.driver}/settlement/${s._id}`)}>
                                                <div className="flex items-center justify-between relative z-10">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Draft</span>
                                                        <span className="text-base font-black text-slate-900 italic tracking-tight uppercase underline decoration-amber-200 underline-offset-4 decoration-2">{s.driver?.name}</span>
                                                    </div>
                                                    <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
                                                        <Wallet size={18} />
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between mt-1 pt-2 border-t border-slate-50">
                                                    <span className="text-[9px] font-bold text-slate-500 uppercase">{formatDate(new Date(s.period.from))}</span>
                                                    <span className="text-[9px] font-black text-amber-600 uppercase flex items-center gap-1">Awaiting <ArrowRight size={8} /></span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-6 text-center text-xs font-bold text-slate-400 italic bg-white rounded-2xl border border-amber-100">None.</div>
                                    )}
                                </div>
                                <button
                                    onClick={() => navigate("/journey/all-settlements")}
                                    className="w-full py-4 rounded-xl bg-amber-600 text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-amber-700 hover:shadow-xl transition-all shadow-lg shadow-amber-100"
                                >
                                    Settlement Center
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
