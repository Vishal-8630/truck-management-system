import { motion } from "framer-motion";
import {
    Truck,
    MapPin,
    FileText,
    ChevronRight,
    Plus,
    TrendingUp,
    AlertCircle,
    LayoutDashboard,
    Bell,
    Search,
    Settings,
    ArrowUpRight,
    ShieldAlert,
    History,
    CheckCircle2,
    Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { useTrucks } from "@/hooks/useTrucks";
import { useJourneys } from "@/hooks/useJourneys";
import { useBillEntries } from "@/hooks/useLedgers";
import { useEffect, useState, useMemo } from "react";
import api from "@/api/axios";

const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();

    // Data Fetching
    const { useTrucksQuery } = useTrucks();
    const { useJourneysQuery } = useJourneys();
    const { useBillEntriesQuery } = useBillEntries();

    const { data: trucks = [] } = useTrucksQuery();
    const { data: journeys = [] } = useJourneysQuery();
    const { data: billEntries = [] } = useBillEntriesQuery();

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
        const alerts: { truck: string, doc: string, expiry: string, daysLeft: number }[] = [];
        const today = new Date();

        trucks.forEach(truck => {
            const docFields = [
                { key: 'fitness_doc_expiry', label: 'Fitness' },
                { key: 'insurance_doc_expiry', label: 'Insurance' },
                { key: 'pollution_doc_expiry', label: 'Pollution' },
                { key: 'tax_doc_expiry', label: 'Tax' }
            ];

            docFields.forEach(field => {
                const expiryDateStr = (truck as any)[field.key];
                if (expiryDateStr) {
                    const expiryDate = new Date(expiryDateStr);
                    const diffTime = expiryDate.getTime() - today.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    if (diffDays <= 15) {
                        alerts.push({
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

    // Compute Revenue
    const totalRevenue = useMemo(() => {
        return billEntries.reduce((sum, entry) => sum + (Number(entry.grand_total) || 0), 0);
    }, [billEntries]);

    // Combined Recent Activity
    const recentActivity = useMemo(() => {
        const act: any[] = [
            ...journeys.map(j => ({ ...j, type: 'journey', sortDate: new Date(j.createdAt || 0) })),
            ...billEntries.map(b => ({ ...b, type: 'bill', sortDate: new Date(b.createdAt || 0) }))
        ];
        return act.sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime()).slice(0, 5);
    }, [journeys, billEntries]);

    const stats = [
        {
            label: "Active Journeys",
            value: journeys.filter(j => j.status === 'Active').length,
            icon: <MapPin className="text-emerald-500" />,
            trend: "+2 this week",
            color: "emerald"
        },
        {
            label: "Total Fleet",
            value: trucks.length,
            icon: <Truck className="text-blue-500" />,
            trend: "All Operational",
            color: "blue"
        },
        {
            label: "Total Revenue",
            value: `₹${(totalRevenue / 100000).toFixed(1)}L`,
            icon: <TrendingUp className="text-indigo-500" />,
            trend: "MTD Growth",
            color: "indigo"
        },
        {
            label: "New Inquiries",
            value: inquiryCount,
            icon: <Bell className="text-rose-500" />,
            trend: "Needs Review",
            color: "rose"
        }
    ];

    const quickActions = [
        {
            title: "New Bill Entry",
            desc: "Record a new LR or Billing Entry",
            icon: <Plus className="w-6 h-6" />,
            link: "/bill-entry/all-bill-entries",
            color: "bg-indigo-600"
        },
        {
            title: "Start Journey",
            desc: "Dispatch a vehicle & driver",
            icon: <MapPin className="w-6 h-6" />,
            link: "/journey/all-journey-entries",
            color: "bg-emerald-600"
        },
        {
            title: "Manage Fleet",
            desc: "Add or update truck details",
            icon: <Truck className="w-6 h-6" />,
            link: "/journey/all-truck-entries",
            color: "bg-blue-600"
        },
        {
            title: "Settlements",
            desc: "Review driver payouts",
            icon: <History className="w-6 h-6" />,
            link: "/journey/all-settlements",
            color: "bg-orange-600"
        }
    ];

    return (
        <div className="flex flex-col gap-8 pb-20 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                            <LayoutDashboard size={24} />
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                            System <span className="text-indigo-600">Overview</span>
                        </h1>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium ml-15">
                        Welcome back, <span className="text-slate-900 dark:text-white font-bold">{user?.fullname || 'Admin'}</span>. Here's what's happening today.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group hidden sm:block">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search anything..."
                            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl py-3 pl-12 pr-6 text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64 shadow-sm"
                        />
                    </div>
                    <button className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-indigo-600 transition-colors shadow-sm">
                        <Settings size={20} />
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="card-premium relative group overflow-hidden"
                    >
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}-50 dark:bg-${stat.color}-900/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500`}></div>
                        <div className="relative z-10 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <div className={`w-12 h-12 rounded-xl bg-${stat.color}-50 dark:bg-${stat.color}-900/20 flex items-center justify-center text-xl`}>
                                    {stat.icon}
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-600 dark:text-${stat.color}-400`}>
                                    {stat.trend}
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <p className="text-3xl font-black text-slate-900 dark:text-white leading-none">{stat.value}</p>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Main Grid Content */}
            <div className="grid lg:grid-cols-12 gap-8">

                {/* Left Column: Quick Actions & Alerts */}
                <div className="lg:col-span-8 flex flex-col gap-8">

                    {/* Quick Actions Grid */}
                    <section className="flex flex-col gap-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                Launch <span className="text-indigo-600">Pad</span>
                            </h3>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {quickActions.map((action, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => navigate(action.link)}
                                    className="card-premium !p-6 flex items-center gap-5 hover:-translate-y-1 transition-all group"
                                >
                                    <div className={`w-14 h-14 shrink-0 rounded-2xl ${action.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                                        {action.icon}
                                    </div>
                                    <div className="flex flex-col items-start text-left">
                                        <p className="font-bold text-slate-900 dark:text-white">{action.title}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{action.desc}</p>
                                    </div>
                                    <ChevronRight className="ml-auto text-slate-300 group-hover:text-indigo-600 transition-colors" size={20} />
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Compliance Alerts */}
                    {documentAlerts.length > 0 && (
                        <section className="flex flex-col gap-4">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    Compliance <span className="text-rose-600">Alerts</span>
                                    <span className="ml-2 px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 text-[10px] uppercase font-black">{documentAlerts.length}</span>
                                </h3>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {documentAlerts.slice(0, 4).map((alert, i) => (
                                    <div key={i} className="card-premium !p-5 border-rose-100 dark:border-rose-900/30 bg-rose-50/20 dark:bg-rose-950/10 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-rose-600 shadow-sm border border-rose-100">
                                            <ShieldAlert size={20} />
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">{alert.truck}</p>
                                            <p className="text-xs text-rose-600 font-bold">{alert.doc} expiring {alert.daysLeft < 0 ? 'Exposed' : `in ${alert.daysLeft} days`}</p>
                                        </div>
                                        <button
                                            onClick={() => navigate("/journey/all-truck-entries")}
                                            className="ml-auto p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:text-rose-600 transition-colors"
                                        >
                                            <ArrowUpRight size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Activity Feed */}
                    <section className="flex flex-col gap-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                Recent <span className="text-indigo-600">Activity</span>
                            </h3>
                            <button className="text-xs font-black uppercase tracking-widest text-indigo-600 hover:underline">View Journal</button>
                        </div>
                        <div className="card-premium !p-0 overflow-hidden divide-y divide-slate-50 dark:divide-slate-800">
                            {recentActivity.length === 0 ? (
                                <div className="p-12 text-center text-slate-400 font-bold italic">No recent activity detected.</div>
                            ) : (
                                recentActivity.map((item, i) => (
                                    <div key={i} className="p-6 flex items-center gap-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${item.type === 'journey' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
                                            }`}>
                                            {item.type === 'journey' ? <MapPin size={20} /> : <FileText size={20} />}
                                        </div>
                                        <div className="flex flex-col flex-1">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                {item.type === 'journey'
                                                    ? `New Journey: ${item.truck.truck_no || item.truck}`
                                                    : `Bill Issued: ₹${item.grand_total} for ${item.billing_party?.name || 'Party'}`}
                                            </p>
                                            <p className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                                                <Clock size={12} className="text-slate-400" />
                                                {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        <button className="px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                                            Inspect
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>

                {/* Right Column: Fleet Status & Performance */}
                <div className="lg:col-span-4 flex flex-col gap-8">

                    {/* Fleet Status Card */}
                    <section className="flex flex-col gap-4">
                        <h3 className="text-xl font-bold px-2">Fleet <span className="text-indigo-600">Status</span></h3>
                        <div className="card-premium flex flex-col gap-8">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none">Utilization</p>
                                    <p className="text-2xl font-black mt-1">{((journeys.filter(j => j.status === 'Active').length / (trucks.length || 1)) * 100).toFixed(0)}%</p>
                                </div>
                                <div className="w-16 h-16 rounded-full border-4 border-slate-100 dark:border-slate-800 flex items-center justify-center relative">
                                    <div className="w-full h-full rounded-full border-4 border-emerald-500 border-t-transparent animate-spin-slow absolute inset-0 -m-1"></div>
                                    <CheckCircle2 className="text-emerald-500" size={24} />
                                </div>
                            </div>

                            <div className="flex flex-col gap-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                        <span className="text-sm font-bold">On the Road</span>
                                    </div>
                                    <span className="text-sm font-black">{journeys.filter(j => j.status === 'Active').length} Units</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-800"></div>
                                        <span className="text-sm font-bold">Idle / Maintenance</span>
                                    </div>
                                    <span className="text-sm font-black">{trucks.length - journeys.filter(j => j.status === 'Active').length} Units</span>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate("/journey/all-journey-entries")}
                                className="w-full py-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-[0.2em] hover:bg-indigo-600 hover:text-white transition-all"
                            >
                                Track All Units
                            </button>
                        </div>
                    </section>

                    {/* Quick Insights Placeholder */}
                    <div className="p-8 rounded-[2.5rem] bg-indigo-600 text-white relative overflow-hidden shadow-xl shadow-indigo-200 dark:shadow-none">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                        <div className="relative z-10 flex flex-col gap-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                                    <AlertCircle size={20} />
                                </div>
                                <span className="font-bold tracking-tight">System Health</span>
                            </div>
                            <p className="text-sm text-indigo-50 mb-4 leading-relaxed font-medium">
                                Your platform is currently optimized. Sync status is 100% and backup was completed {new Date().getHours()}h ago.
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-white/10 rounded-[1.25rem] border border-white/20">
                                    <p className="text-[10px] font-black uppercase opacity-60">Uptime</p>
                                    <p className="font-bold">99.9%</p>
                                </div>
                                <div className="p-3 bg-white/10 rounded-[1.25rem] border border-white/20">
                                    <p className="text-[10px] font-black uppercase opacity-60">Avg Load</p>
                                    <p className="font-bold">42ms</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Dashboard;
