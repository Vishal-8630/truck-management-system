import { useEffect, useState } from "react";
import Loading from "@/components/Loading";
import BillEntriesDropdownView from "@/components/BillEntriesDropdownView";
import { motion } from "framer-motion";
import { fadeInUp } from "@/animations/animations";
import PaginatedList from "@/components/PaginatedList";
import { useBillEntries } from "@/hooks/useLedgers";
import type { BillEntryType } from "@/types/billEntry";
import ExcelButton from "@/components/ExcelButton";
import { BillEntryFilters } from "@/filters/billEntryFilters";
import FilterContainer from "@/components/FilterContainer";
import { FileText, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BillEntries = () => {
  const { useBillEntriesQuery } = useBillEntries();
  const { data: billEntries = [], isLoading } = useBillEntriesQuery();
  const [filteredEntries, setFilteredEntries] = useState<BillEntryType[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setFilteredEntries(billEntries);
  }, [billEntries]);

  if (isLoading) return <Loading />;

  return (
    <div className="flex flex-col gap-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight italic flex items-center gap-4">
            <FileText className="text-indigo-600 w-10 h-10 lg:w-12 lg:h-12" />
            Bill <span className="text-indigo-600">Database</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg">Manage and review all your digital bill entries.</p>
        </div>

        <div className="flex items-center gap-3">
          <ExcelButton data={filteredEntries} fileNamePrefix="Bill_Entries" />
          <button
            onClick={() => navigate('/bill-entry/new-entry')}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold font-heading shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all active:translate-y-0"
          >
            <Plus size={18} />
            New Entry
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] shadow-premium border border-slate-100">
        <FilterContainer
          data={billEntries}
          filters={BillEntryFilters}
          onFiltered={setFilteredEntries}
        />
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-xl font-bold text-slate-900 italic">Recent Entries</h2>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{filteredEntries.length} Record(s) Found</span>
        </div>

        <PaginatedList
          items={filteredEntries}
          itemsPerPage={10}
          renderItem={(entry) => (
            <motion.div
              key={entry._id}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="mb-4 last:mb-0"
            >
              <BillEntriesDropdownView entry={entry} />
            </motion.div>
          )}
        />
      </div>
    </div>
  );
};

export default BillEntries;
