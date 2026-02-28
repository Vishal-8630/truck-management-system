import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalPages, totalItems, pageSize, onPageChange }: PaginationProps) => {
    if (totalPages <= 1) return null;

    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalItems);

    // Build page numbers with ellipsis
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        pages.push(1);
        if (currentPage > 3) pages.push("...");
        for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
            pages.push(i);
        }
        if (currentPage < totalPages - 2) pages.push("...");
        pages.push(totalPages);
    }

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Showing <span className="text-slate-700 font-black">{start}–{end}</span> of <span className="text-slate-700 font-black">{totalItems}</span> records
            </p>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-9 h-9 rounded-xl border border-slate-100 bg-white flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                    <ChevronLeft size={16} />
                </button>
                {pages.map((p, i) =>
                    p === "..." ? (
                        <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-slate-300 font-black text-sm">…</span>
                    ) : (
                        <button
                            key={p}
                            onClick={() => onPageChange(p as number)}
                            className={`w-9 h-9 rounded-xl text-xs font-black transition-all shadow-sm border ${currentPage === p
                                ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100"
                                : "bg-white border-slate-100 text-slate-500 hover:text-indigo-600 hover:border-indigo-200"
                                }`}
                        >
                            {p}
                        </button>
                    )
                )}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="w-9 h-9 rounded-xl border border-slate-100 bg-white flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
