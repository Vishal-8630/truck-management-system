import { useEffect, useRef, useState } from "react";
import { EmptyVehicleEntry, type VehicleEntryType } from "@/types/vehicleEntry";
import Loading from "@/components/Loading";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp } from "@/animations/animations";
import VehicleEntryDropdown from "@/components/VehicleEntryDropdown";
import { VehicleEntryFilters } from "@/filters/vehicleEntryFilters";
import PaginatedList from "@/components/PaginatedList";
import FilterContainer from "@/components/FilterContainer";
import VehicleEntryForm from "@/components/VehicleEntryForm/VehicleEntryForm";
import { useVehicleEntries } from "@/hooks/useLedgers";
import { useParties } from "@/hooks/useParties";
import { useItemStates } from "@/hooks/useItemStates";
import { useMessageStore } from "@/store/useMessageStore";
import ExcelButton from "@/components/ExcelButton";
import { Truck, Plus, Sparkles } from "lucide-react";

/* -------------------- Constants -------------------- */
export const TABS = {
  LIST: "list",
  FORM: "form",
} as const;

type ActiveTab = (typeof TABS)[keyof typeof TABS];

const VehicleEntries = () => {
  const { useVehicleEntriesQuery, useAddVehicleEntryMutation } = useVehicleEntries();
  const { data: vehicleEntries = [], isLoading } = useVehicleEntriesQuery();
  const { useBalancePartiesQuery } = useParties();
  const { data: balanceParties = [] } = useBalancePartiesQuery();
  const addVehicleEntryMutation = useAddVehicleEntryMutation();
  const { addMessage } = useMessageStore();

  /* -------------------- Local State -------------------- */
  const [activeTab, setActiveTab] = useState<ActiveTab>(TABS.LIST);
  const [filteredEntries, setFilteredEntries] = useState<VehicleEntryType[]>([]);
  const [entry, setEntry] = useState<VehicleEntryType>(EmptyVehicleEntry);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const partyRef = useRef<any>(null);

  const { itemStates, updateItem, updateDraft, toggleEditing, toggleOpen } =
    useItemStates<VehicleEntryType>(vehicleEntries);

  /* -------------------- Effects -------------------- */

  useEffect(() => {
    setFilteredEntries(vehicleEntries);
  }, [vehicleEntries]);

  useEffect(() => {
    const freight = Number(entry.freight) || 0;
    const driver_cash = Number(entry.driver_cash) || 0;
    const dala = Number(entry.dala) || 0;
    const kamisan = Number(entry.kamisan) || 0;
    const in_ac = Number(entry.in_ac) || 0;
    const halting = Number(entry.halting) || 0;
    const balance = freight - (driver_cash + dala + kamisan + in_ac) + halting;
    setEntry((prev) => ({ ...prev, balance: String(balance) }));
  }, [
    entry.freight,
    entry.driver_cash,
    entry.dala,
    entry.kamisan,
    entry.in_ac,
    entry.halting,
  ]);

  /* -------------------- Handlers -------------------- */

  const onVehicleEntryUpdate = (updatedVehicleEntry: VehicleEntryType) => {
    setFilteredEntries((prev) =>
      prev.map((v) =>
        v._id === updatedVehicleEntry._id ? updatedVehicleEntry : v
      )
    );
  };

  const handleChange = (value: string, name: string) => {
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setEntry((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (
    val: string,
    name: string,
    mode: "select" | "search"
  ) => {
    if (mode === "select") {
      setEntry((prev) => ({ ...prev, [name]: val }));
    } else {
      if (val === "") {
        setEntry((prev) => ({
          ...prev,
          balance_party: { _id: "", party_name: "" },
        }));
      } else {
        const party = balanceParties.find((p: any) => p.party_name === val);
        setEntry((prev) => ({
          ...prev,
          balance_party: party || { _id: "", party_name: "" },
        }));
      }
    }
  };

  const fetchOptions = (search: string, field: string): any[] => {
    void field;
    const filtered = balanceParties.filter(
      (party: any) =>
        party.party_name &&
        party.party_name
          .toLocaleLowerCase()
          .includes(search.toLocaleLowerCase())
    );
    return filtered.map((party: any) => ({
      label: party.party_name,
      value: party.party_name,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entry.balance_party?.party_name?.trim()) {
      setErrors((prev) => ({ ...prev, party_name: "Please select a party" }));
      addMessage({ type: "error", text: "Please select a party" });
      partyRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      partyRef.current?.focus();
      return;
    }
    try {
      await addVehicleEntryMutation.mutateAsync(entry);
      addMessage({
        type: "success",
        text: "New vehicle entry added successfully",
      });
      setEntry(EmptyVehicleEntry);
      setActiveTab(TABS.LIST);
    } catch (err: any) {
      const serverErrors = err.response?.data?.errors || err;
      setErrors(serverErrors);
      addMessage({
        type: "error",
        text: serverErrors.message || serverErrors.general || "Please fill all the required fields",
      });
    }
  };

  const handleDiscard = () => {
    setEntry(EmptyVehicleEntry);
    setErrors({});
    setActiveTab(TABS.LIST);
  };

  /* -------------------- Render -------------------- */

  if (isLoading) return <Loading />;

  return (
    <div className="flex flex-col gap-10 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight italic flex items-center gap-4 text-left">
            <Truck className="text-blue-600 w-10 h-10 lg:w-12 lg:h-12" />
            Vehicle <span className="text-blue-600">Logs</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg text-left">Track and manage vehicle logs and entries.</p>
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
            Recent Logs
          </button>
          <button
            onClick={() => setActiveTab(TABS.FORM)}
            className={`
              px-8 py-3.5 rounded-[1.5rem] font-bold text-sm transition-all flex items-center gap-2
              ${activeTab === TABS.FORM ? 'bg-white text-blue-600 shadow-xl shadow-blue-100/50' : 'text-slate-400 hover:text-slate-600'}
            `}
          >
            <Plus size={16} />
            New Log
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
            <VehicleEntryForm
              vehicleEntry={entry}
              errors={errors}
              isPending={addVehicleEntryMutation.isPending}
              partyRef={partyRef}
              handleChange={handleChange}
              handleSelectChange={handleSelectChange}
              fetchOptions={fetchOptions}
              handleSubmit={handleSubmit}
              onDiscard={handleDiscard}
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
              data={vehicleEntries}
              filters={VehicleEntryFilters}
              onFiltered={setFilteredEntries}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                {filteredEntries.length} {filteredEntries.length === 1 ? "Log" : "Logs"} Found
              </span>
              <ExcelButton data={filteredEntries} fileNamePrefix="Vehicle_Entries_List" />
            </div>

            <div className="flex flex-col gap-2 min-h-[400px]">
              <PaginatedList
                items={filteredEntries}
                itemsPerPage={10}
                renderItem={(v) => (
                  <motion.div
                    key={v._id}
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    className="mb-4 last:mb-0"
                  >
                    <VehicleEntryDropdown
                      vehicleEntry={v}
                      itemState={itemStates[v._id]}
                      updateItem={updateItem}
                      updateDraft={updateDraft}
                      toggleEditing={toggleEditing}
                      toggleOpen={toggleOpen}
                      onVehicleEntryUpdate={onVehicleEntryUpdate}
                    />
                  </motion.div>
                )}
              />
              {filteredEntries.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/30">
                  <Truck className="w-16 h-16 text-slate-200 mb-4" strokeWidth={1.5} />
                  <p className="text-slate-400 font-bold">No registered logs found matching your criteria</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VehicleEntries;
