import { useState, type JSX } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginatedListProps<T> = {
  items: T[];
  itemsPerPage?: number;
  renderItem: (item: T) => JSX.Element;
};

const PaginatedList = <T,>({
  items,
  itemsPerPage = 5,
  renderItem,
}: PaginatedListProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(items.length / itemsPerPage);

  if (items.length === 0) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4">{currentItems.map(renderItem)}</div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm w-fit mx-auto">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-30 disabled:hover:bg-transparent transition-all duration-200"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex items-center gap-2 px-2">
            <span className="text-sm font-bold text-indigo-600 bg-indigo-50 w-8 h-8 flex items-center justify-center rounded-lg">
              {currentPage}
            </span>
            <span className="text-sm font-medium text-slate-400">/</span>
            <span className="text-sm font-medium text-slate-500">{totalPages}</span>
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-30 disabled:hover:bg-transparent transition-all duration-200"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default PaginatedList;

