import { useCallback, useEffect, useState } from "react";
import type { BalancePartyType } from "@/types/vehicleEntry";
import { useParties } from "@/hooks/useParties";
import { motion } from "framer-motion";
import { fadeInUp } from "@/animations/animations";
import BalancePartyDropDown from "@/components/BalancePartyDropDown";
import PaginatedList from "@/components/PaginatedList";
import FilterContainer from "@/components/FilterContainer";
import Loading from "@/components/Loading";
import { useItemStates } from "@/hooks/useItemStates";
import ExcelButton from "@/components/ExcelButton";
import { BalancePartyFilters } from "@/filters/balancePartyFilters";
import { UserSquare, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BalanceParties = () => {
  const { useBalancePartiesQuery } = useParties();
  const { data: balanceParties = [], isLoading } = useBalancePartiesQuery();
  const navigate = useNavigate();

  const [filteredBalanceParties, setFilteredBalanceParties] = useState<BalancePartyType[]>([]);

  const { itemStates, updateItem, updateDraft, toggleEditing, toggleOpen } =
    useItemStates<BalancePartyType>(balanceParties);

  useEffect(() => {
    setFilteredBalanceParties(balanceParties);
  }, [balanceParties]);

  const renderItem = useCallback(
    (p: BalancePartyType) => (
      <motion.div
        key={p._id}
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="mb-4 last:mb-0"
      >
        <BalancePartyDropDown
          balanceParty={p}
          itemState={itemStates[p._id]}
          updateItem={updateItem}
          updateDraft={updateDraft}
          toggleEditing={toggleEditing}
          toggleOpen={toggleOpen}
        />
      </motion.div>
    ),
    [itemStates, updateItem, updateDraft, toggleEditing, toggleOpen]
  );

  if (isLoading) return <Loading />;

  return (
    <div className="flex flex-col gap-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight italic flex items-center gap-4">
            <UserSquare className="text-blue-600 w-10 h-10 lg:w-12 lg:h-12" />
            Balance <span className="text-blue-600">Parties</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg">Manage and track outstanding party balances.</p>
        </div>

        <div className="flex items-center gap-3">
          <ExcelButton data={filteredBalanceParties} fileNamePrefix="Balance_Parties" />
          <button
            onClick={() => navigate('/vehicle-entry/new-balance-party')}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold font-heading shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all active:translate-y-0"
          >
            <Plus size={18} />
            New Party
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] shadow-premium border border-slate-100">
        <FilterContainer
          data={balanceParties}
          filters={BalancePartyFilters}
          onFiltered={setFilteredBalanceParties}
        />
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-xl font-bold text-slate-900 italic">Active Parties</h2>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{filteredBalanceParties.length} Account(s)</span>
        </div>

        <PaginatedList
          items={filteredBalanceParties}
          itemsPerPage={10}
          renderItem={renderItem}
        />
      </div>
    </div>
  );
};

export default BalanceParties;
