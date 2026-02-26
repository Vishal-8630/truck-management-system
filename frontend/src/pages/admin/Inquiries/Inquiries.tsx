import { useState, useEffect } from "react";
import { Mail, Calendar, Filter, CheckCircle, Clock, Eye } from "lucide-react";
import api from "@/api/axios";
import Loading from "@/components/Loading";
import { useMessageStore } from "@/store/useMessageStore";

interface Inquiry {
    _id: string;
    fullName: string;
    email: string;
    subject: string;
    message: string;
    status: 'Pending' | 'Reviewed' | 'Replied';
    createdAt: string;
}

const Inquiries = () => {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("");
    const [monthFilter, setMonthFilter] = useState("");
    const { addMessage } = useMessageStore();

    const fetchInquiries = async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/inquiry");
            setInquiries(data.data);
        } catch (error) {
            addMessage({ type: "error", text: "Failed to fetch inquiries" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInquiries();
    }, []);

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            await api.patch(`/inquiry/${id}`, { status: newStatus });
            addMessage({ type: "success", text: "Status updated successfully" });
            fetchInquiries();
        } catch (error) {
            addMessage({ type: "error", text: "Failed to update status" });
        }
    };

    const filteredInquiries = inquiries.filter(item => {
        const itemDate = new Date(item.createdAt);
        const itemMonth = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, "0")}`;

        const matchesStatus = statusFilter ? item.status === statusFilter : true;
        const matchesMonth = monthFilter ? itemMonth === monthFilter : true;

        return matchesStatus && matchesMonth;
    });

    if (loading) return <Loading />;

    return (
        <div className="flex flex-col gap-10 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight italic flex items-center gap-4">
                        <Mail className="text-indigo-600 w-10 h-10 lg:w-12 lg:h-12" />
                        Website <span className="text-indigo-600">Inquiries</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-lg">Manage messages and contact requests from the website.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2">
                    <Filter size={18} className="text-slate-400" />
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Filters:</span>
                </div>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                    <option value="">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Reviewed">Reviewed</option>
                    <option value="Replied">Replied</option>
                </select>

                <input
                    type="month"
                    value={monthFilter}
                    onChange={(e) => setMonthFilter(e.target.value)}
                    className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                />

                <button
                    onClick={() => { setStatusFilter(""); setMonthFilter(""); }}
                    className="text-xs font-bold text-indigo-600 hover:underline px-2"
                >
                    Clear All
                </button>
            </div>

            <div className="card-premium overflow-hidden border-slate-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                {["Date", "Contact", "Subject", "Message", "Status", "Actions"].map((h, i) => (
                                    <th key={i} className="px-6 py-4 text-[10px] font-bold text-slate-400 border-r border-slate-100 uppercase tracking-widest whitespace-nowrap last:border-r-0">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredInquiries.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Mail size={40} className="text-slate-200" />
                                            <span className="text-slate-400 font-bold italic tracking-tight">No inquiries found</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredInquiries.map((item) => (
                                    <tr key={item._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-slate-300" />
                                                <span className="text-sm font-bold text-slate-700">{new Date(item.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 max-w-[200px]">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-900">{item.fullName}</span>
                                                <span className="text-xs text-slate-500 truncate">{item.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-sm text-slate-700">{item.subject}</td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-slate-500 line-clamp-2 max-w-xs">{item.message}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${item.status === 'Replied' ? 'bg-emerald-50 text-emerald-600' :
                                                item.status === 'Reviewed' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
                                                }`}>
                                                {item.status === 'Pending' && <Clock size={10} />}
                                                {item.status === 'Reviewed' && <Eye size={10} />}
                                                {item.status === 'Replied' && <CheckCircle size={10} />}
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <select
                                                    value={item.status}
                                                    onChange={(e) => updateStatus(item._id, e.target.value)}
                                                    className="text-[10px] font-bold bg-white border border-slate-200 rounded-lg p-1 outline-none hover:border-indigo-500 transition-colors"
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Reviewed">Reviewed</option>
                                                    <option value="Replied">Replied</option>
                                                </select>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Inquiries;
