import { useEffect, useState } from "react";
import BalancePartyDropDown from "@/components/BalancePartyDropDown";
import Loading from "@/components/Loading";
import {
  EmptyBalanceParty,
  type BalancePartyType,
} from "@/types/balanceParty";
import { useMessageStore } from "@/store/useMessageStore";
import { motion, AnimatePresence } from "framer-motion";
import PaginatedList from "@/components/PaginatedList";
import { BalancePartyFilters } from "@/filters/balancePartyFilters";
import FilterContainer from "@/components/FilterContainer";
import BalancePartyForm from "@/components/BalancePartyForm";
import { useParties } from "@/hooks/useParties";
import { useItemStates } from "@/hooks/useItemStates";
import ExcelButton from "@/components/ExcelButton";
import { UserSquare, Plus, Sparkles, Building2 } from "lucide-react";

/* -------------------- Constants -------------------- */
export const TABS = {
  LIST: "list",
  FORM: "form",
} as const;

type ActiveTab = (typeof TABS)[keyof typeof TABS];

const BalanceParties = () => {
  const { useBalancePartiesQuery, useAddBalancePartyMutation } = useParties();
  const { data: balanceParties = [], isLoading } = useBalancePartiesQuery();
  const addBalancePartyMutation = useAddBalancePartyMutation();
  const { addMessage } = useMessageStore();

  /* -------------------- Local State -------------------- */
  const [activeTab, setActiveTab] = useState<ActiveTab>(TABS.LIST);

  // "Add Party" form state
  const [party, setParty] =
    useState<Omit<BalancePartyType, "_id">>(EmptyBalanceParty);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [filteredParties, setFilteredParties] = useState<BalancePartyType[]>(
    []
  );

  const { itemStates, updateItem, updateDraft, toggleEditing, toggleOpen } =
    useItemStates<BalancePartyType>(balanceParties);

  /* -------------------- Effects -------------------- */

  useEffect(() => {
    setFilteredParties(balanceParties);
  }, [balanceParties]);

  /* -------------------- Handlers: Add Party -------------------- */

  const handleInputChange = (value: string, name: string) => {
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setParty((prev) => ({ ...prev, [name]: value as any }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await addBalancePartyMutation.mutateAsync(party);
      addMessage({
        type: "success",
        text: "Balance party added successfully",
      });
      setParty(EmptyBalanceParty);
      setActiveTab(TABS.LIST);
    } catch (err: any) {
      const serverErrors = err.response?.data?.errors || err;
      setErrors(serverErrors);
      addMessage({ type: "error", text: serverErrors.general || "Please fill all the required fields" });
    }
  };

  /* -------------------- Render -------------------- */

  if (isLoading) return <Loading />;

  return (
    <div className="flex flex-col gap-10 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight italic flex items-center gap-4 text-left">
            <UserSquare className="text-blue-600 w-10 h-10 lg:w-12 lg:h-12" />
            Balance <span className="text-blue-600">Parties</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg text-left">Manage and track outstanding party balances.</p>
        </div>

        <div className="flex bg-slate-100/50 p-1.5 rounded-[2rem] w-fit shadow-inner border border-slate-100">
          <button
            onClick={() => setActiveTab(TABS.LIST)}
            className={`
              px-8 py-3.5 rounded-[1.5rem] font-bold text-sm transition-all flex items-center gap-2
              ${activeTab === TABS.LIST ? 'bg-white text-blue-600 shadow-xl shadow-blue-100/50' : 'text-slate-400 hover:text-slate-600'}
            `}
          >
            <Sparkles size={16} />
            Active Parties
          </button>
          <button
            onClick={() => setActiveTab(TABS.FORM)}
            className={`
              px-8 py-3.5 rounded-[1.5rem] font-bold text-sm transition-all flex items-center gap-2
              ${activeTab === TABS.FORM ? 'bg-white text-blue-600 shadow-xl shadow-blue-100/50' : 'text-slate-400 hover:text-slate-600'}
            `}
          >
            <Plus size={16} />
            New Account
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === TABS.FORM ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full"
          >
            <BalancePartyForm
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              party={party}
              errors={errors}
              isPending={addBalancePartyMutation.isPending}
            />
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex flex-col gap-8"
          >
            <FilterContainer
              data={balanceParties}
              filters={BalancePartyFilters}
              onFiltered={setFilteredParties}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                {filteredParties.length} {filteredParties.length === 1 ? "Party" : "Parties"} Found
              </span>
              <ExcelButton data={filteredParties} fileNamePrefix="Balance_Parties_List" />
            </div>

            <div className="flex flex-col gap-2 min-h-[400px]">
              <PaginatedList
                items={filteredParties}
                itemsPerPage={10}
                renderItem={(p) => (
                  <BalancePartyDropDown
                    key={p._id}
                    balanceParty={p}
                    itemState={itemStates[p._id]}
                    updateItem={updateItem}
                    updateDraft={updateDraft}
                    toggleEditing={toggleEditing}
                    toggleOpen={toggleOpen}
                  />
                )}
              />
              {filteredParties.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/30">
                  <Building2 className="w-16 h-16 text-slate-200 mb-4" strokeWidth={1.5} />
                  <p className="text-slate-400 font-bold">No registered parties found matching your criteria</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BalanceParties;
