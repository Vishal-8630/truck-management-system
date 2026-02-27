import { motion } from "framer-motion";
import {
    Truck,
    MapPin,
    FileText,
    ChevronRight,
    Plus,
    TrendingUp,
    LayoutDashboard,
    Bell,
    Search,
    Settings,
    ArrowUpRight,
    ShieldAlert,
    Clock,
    Scale,
    ArrowRight,
    Wallet
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { useTrucks } from "@/hooks/useTrucks";
import { useJourneys } from "@/hooks/useJourneys";
import { useBillEntries } from "@/hooks/useLedgers";
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

    const { data: trucks = [] } = useTrucksQuery();
    const { data: journeys = [] } = useJourneysQuery();
    const { data: billEntries = [] } = useBillEntriesQuery();
    const { data: settlements = [] } = useSettlementsQuery();

    const [inquiryCount, setInquiryCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchFocused, setIsSearchFocused] = useState(false);

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

        // Keyboard Shortcuts
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('universal-search-input')?.focus();
            }
            if (e.key === 'Escape') {
                setSearchQuery("");
                setIsSearchFocused(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
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

                    if (diffDays <= 30) { // Show everything expiring within a month
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

    // Pending Settlements
    const pendingSettlements = useMemo(() => {
        return settlements.filter((s: any) => !s.is_settled);
    }, [settlements]);

    // Upcoming Dates (Renewals + Active Journeys)
    const upcomingEvents = useMemo(() => {
        const events = documentAlerts.map(a => ({
            title: `${a.truck}: ${a.doc} Renewal`,
            date: a.expiry,
            type: 'renewal',
            color: 'rose',
            link: `/journey/truck/${a.truckId}`
        }));
        return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 5);
    }, [documentAlerts]);

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
        return act.sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime()).slice(0, 10);
    }, [journeys, billEntries]);

    // Universal Search Results
    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return { trucks: [], journeys: [], bills: [] };

        const query = searchQuery.toLowerCase();
        return {
            trucks: trucks.filter(t => t.truck_no.toLowerCase().includes(query)).slice(0, 3),
            journeys: journeys.filter(j =>
                (j.truck?.truck_no || "").toLowerCase().includes(query) ||
                j.from.toLowerCase().includes(query) ||
                j.to.toLowerCase().includes(query)
            ).slice(0, 3),
            bills: billEntries.filter(b =>
                (b.bill_no || "").toLowerCase().includes(query) ||
                (b.billing_party?.name || "").toLowerCase().includes(query)
            ).slice(0, 3)
        };
    }, [searchQuery, trucks, journeys, billEntries]);

    const stats = [
        {
            label: "Active Units",
            value: journeys.filter(j => j.status === 'Active').length,
            icon: <MapPin className="text-emerald-500" />,
            trend: "On Road",
            color: "emerald"
        },
        {
            label: "Pending Settlements",
            value: pendingSettlements.length,
            icon: <Scale className="text-amber-500" />,
            trend: "Awaiting Action",
            color: "amber"
        },
        {
            label: "Period Revenue",
            value: `₹${(totalRevenue / 100000).toFixed(1)}L`,
            icon: <TrendingUp className="text-indigo-500" />,
            trend: "Overall Sales",
            color: "indigo"
        },
        {
            label: "New Inquiries",
            value: inquiryCount,
            icon: <Bell className="text-rose-500" />,
            trend: "Leads",
            color: "rose"
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
                    <div className="relative group hidden lg:block">
                        <Search className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${isSearchFocused ? 'text-indigo-600' : 'text-slate-400'}`} size={18} />
                        <input
                            id="universal-search-input"
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                            placeholder="Universal search..."
                            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl py-4 pl-14 pr-16 text-sm font-bold focus:ring-4 focus:ring-indigo-50 outline-none w-80 shadow-sm transition-all"
                        />

                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            {searchQuery ? (
                                <button onClick={() => setSearchQuery("")} className="p-1 hover:bg-slate-50 rounded-md text-slate-400 hover:text-rose-500 transition-colors">
                                    <Plus className="rotate-45" size={16} />
                                </button>
                            ) : (
                                <div className="px-1.5 py-0.5 rounded border border-slate-100 bg-slate-50 text-[10px] font-black text-slate-400 flex items-center gap-1 cursor-default opacity-0 group-hover:opacity-100 transition-opacity">
                                    <kbd className="font-sans">Ctrl</kbd>
                                    <span className="text-[8px]">K</span>
                                </div>
                            )}
                        </div>

                        {/* Search Results Dropdown */}
                        {isSearchFocused && searchQuery && (
                            <div className="absolute top-full mt-4 left-0 w-[400px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl p-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                                {Object.values(searchResults).every(arr => arr.length === 0) ? (
                                    <div className="py-10 text-center flex flex-col items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                                            <Search size={20} />
                                        </div>
                                        <p className="text-sm font-bold text-slate-400 italic">No matches found for "{searchQuery}"</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-6">
                                        {searchResults.trucks.length > 0 && (
                                            <div className="flex flex-col gap-3">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Vehicles</p>
                                                {searchResults.trucks.map(t => (
                                                    <button key={t._id} onClick={() => navigate(`/journey/truck/${t._id}`)} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl transition-all text-left group">
                                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                            <Truck size={20} />
                                                        </div>
                                                        <span className="text-sm font-black text-slate-900">{t.truck_no}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        {searchResults.journeys.length > 0 && (
                                            <div className="flex flex-col gap-3">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Journeys</p>
                                                {searchResults.journeys.map(j => (
                                                    <button key={j._id} onClick={() => navigate(`/journey/journey-detail/${j._id}`)} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl transition-all text-left group">
                                                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                            <MapPin size={20} />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-black text-slate-900 underline decoration-emerald-100">{j.from} → {j.to}</span>
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase">{j.truck?.truck_no || 'Manual Entry'}</span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        {searchResults.bills.length > 0 && (
                                            <div className="flex flex-col gap-3">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Invoices</p>
                                                {searchResults.bills.map(b => (
                                                    <button key={b._id} onClick={() => navigate(`/bill-entry/bill?bill_no=${b.bill_no}`)} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl transition-all text-left group">
                                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                            <FileText size={20} />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-black text-slate-900 underline decoration-indigo-100 italic">#{b.bill_no}</span>
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase">{b.billing_party?.name || 'Manual Party'}</span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
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

                {/* Left Column: Quick Actions & Alerts */}
                <div className="lg:col-span-8 flex flex-col gap-10">

                    {/* Quick Actions Grid */}
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

                    {/* Compliance Alerts & Critical Renewals */}
                    {documentAlerts.length > 0 && (
                        <section className="flex flex-col gap-6">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-2xl font-black flex items-center gap-3 italic">
                                    Compliance <span className="text-rose-600 underline decoration-rose-200 underline-offset-8">Critical</span>
                                    <span className="ml-2 px-3 py-1 rounded-xl bg-rose-50 text-rose-600 text-[10px] uppercase font-black border border-rose-100">{documentAlerts.length} Issues</span>
                                </h3>
                                <button
                                    onClick={() => navigate("/journey/all-truck-entries")}
                                    className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-600 flex items-center gap-2 transition-all"
                                >
                                    Review Fleet <ChevronRight size={14} />
                                </button>
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
                                                {alert.doc} <span className="text-rose-500">•</span> {formatDate(new Date(alert.expiry))}
                                            </p>
                                        </div>
                                        <div className="p-2 rounded-lg bg-white opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ArrowUpRight size={16} className="text-rose-600" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Activity Feed */}
                    <section className="flex flex-col gap-6">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-2xl font-black flex items-center gap-3 italic">
                                Operational <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-8">Activity</span>
                                <span className="px-3 py-1 rounded-xl bg-slate-50 text-slate-400 text-[10px] uppercase font-black border border-slate-100">Live Feed</span>
                            </h3>
                        </div>
                        <div className="card-premium !p-0 overflow-hidden divide-y divide-slate-50 shadow-2xl shadow-slate-100/50">
                            {recentActivity.length === 0 ? (
                                <div className="p-20 text-center flex flex-col items-center gap-4">
                                    <Clock size={48} className="text-slate-200" />
                                    <p className="text-slate-400 font-bold italic">No recent activity detected in the system logs.</p>
                                </div>
                            ) : (
                                recentActivity.map((item, i) => (
                                    <div key={i} className="p-6 flex items-center gap-6 hover:bg-slate-50/80 transition-all group cursor-default">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform ${item.type === 'journey' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
                                            }`}>
                                            {item.type === 'journey' ? <MapPin size={24} /> : <FileText size={24} />}
                                        </div>
                                        <div className="flex flex-col flex-1 gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${item.type === 'journey' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                                    {item.type}
                                                </span>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                                    {formatDate(new Date(item.createdAt))}
                                                </p>
                                            </div>
                                            <p className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight">
                                                {item.type === 'journey'
                                                    ? `Journey Dispatched: Truck ${item.truck.truck_no || item.truck}`
                                                    : `Invoice Created: ₹${item.grand_total} for ${item.billing_party?.name || 'Party'}`}
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

                {/* Right Column: Fleet Status & Insights */}
                <div className="lg:col-span-4 flex flex-col gap-10">

                    {/* Pending Settlements Card */}
                    {pendingSettlements.length > 0 && (
                        <section className="flex flex-col gap-6">
                            <h3 className="text-2xl font-black px-2 italic">Awaiting <span className="text-amber-600">Settlement</span></h3>
                            <div className="card-premium flex flex-col gap-6 !p-6 border-amber-100 bg-amber-50/10">
                                <div className="flex flex-col gap-4">
                                    {pendingSettlements.slice(0, 3).map((s: any, i) => (
                                        <div key={i} className="flex flex-col gap-3 p-4 bg-white rounded-2xl border border-amber-100 shadow-sm relative overflow-hidden group hover:border-amber-400 transition-all cursor-pointer" onClick={() => navigate(`/journey/driver-detail/${s.driver?._id}/settlement/${s._id}`)}>
                                            <div className="flex items-center justify-between relative z-10">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.driver?.name}</span>
                                                    <span className="text-lg font-black text-slate-900 italic tracking-tight">₹{Math.ceil(s.overall_total || 0)}</span>
                                                </div>
                                                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                                                    <Wallet size={20} />
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                                                <span>{s.journeys?.length || 0} Trips</span>
                                                <span className="flex items-center gap-1 text-amber-600">Pending <ArrowRight size={10} /></span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => navigate("/journey/all-settlements")}
                                    className="w-full py-4 rounded-xl bg-amber-600 text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-amber-700 hover:shadow-xl transition-all shadow-lg shadow-amber-100"
                                >
                                    Manage All Payouts
                                </button>
                            </div>
                        </section>
                    )}

                    {/* Upcoming Events / Dates */}
                    <section className="flex flex-col gap-6">
                        <h3 className="text-2xl font-black px-2 italic">Upcoming <span className="text-indigo-600">Dates</span></h3>
                        <div className="card-premium !p-0 overflow-hidden flex flex-col divide-y divide-slate-50">
                            {upcomingEvents.map((event, i) => (
                                <div
                                    key={i}
                                    className="p-5 flex items-center gap-5 hover:bg-slate-50 transition-all cursor-pointer group"
                                    onClick={() => navigate(event.link)}
                                >
                                    <div className={`w-12 h-12 rounded-2xl bg-${event.color}-50 text-${event.color}-600 flex flex-col items-center justify-center shrink-0 border border-${event.color}-100`}>
                                        <span className="text-[8px] font-black uppercase leading-none">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                                        <span className="text-lg font-black leading-none">{new Date(event.date).getDate()}</span>
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <p className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight leading-tight">{event.title}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Renewal Window</p>
                                    </div>
                                    <ChevronRight size={16} className="ml-auto text-slate-300 group-hover:text-indigo-600 transition-all group-hover:translate-x-1" />
                                </div>
                            ))}
                            {upcomingEvents.length === 0 && (
                                <div className="p-10 text-center text-slate-400 font-bold italic">No upcoming events scheduled.</div>
                            )}
                        </div>
                    </section>

                    {/* Fleet Utilization Snapshot */}
                    <section className="flex flex-col gap-6">
                        <div className="card-premium !p-8 bg-slate-900 border-slate-800 text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>

                            <div className="relative z-10 flex flex-col gap-8">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col gap-1">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none">Utilization Index</p>
                                        <p className="text-4xl font-black italic tracking-tighter">
                                            {((journeys.filter(j => j.status === 'Active').length / (trucks.length || 1)) * 100).toFixed(0)}%
                                        </p>
                                    </div>
                                    <div className="w-20 h-20 rounded-full border-4 border-slate-800 flex items-center justify-center relative">
                                        <div className="w-full h-full rounded-full border-4 border-emerald-500 border-t-transparent animate-spin-slow absolute inset-0 -m-1"></div>
                                        <Truck className="text-emerald-500" size={32} strokeWidth={2.5} />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"></div>
                                            <span className="text-xs font-black uppercase tracking-widest">On Road</span>
                                        </div>
                                        <span className="text-lg font-black italic">{journeys.filter(j => j.status === 'Active').length} Units</span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2.5 h-2.5 rounded-full bg-slate-600"></div>
                                            <span className="text-xs font-black uppercase tracking-widest">Parked / IDLE</span>
                                        </div>
                                        <span className="text-lg font-black italic text-slate-400">{trucks.length - journeys.filter(j => j.status === 'Active').length} Units</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate("/journey/all-journey-entries")}
                                    className="w-full py-4 rounded-xl bg-indigo-600 text-white font-black text-[10px] uppercase tracking-[0.3em] hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20"
                                >
                                    Real-Time Tracking
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
