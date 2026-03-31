import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EmptyVehicleEntry, type VehicleEntryType } from "@/types/vehicleEntry";
import Loading from "@/components/Loading";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp } from "@/animations/animations";
import { VehicleEntryFilters } from "@/filters/vehicleEntryFilters";
import PaginatedList from "@/components/PaginatedList";
import FilterContainer from "@/components/FilterContainer";
import VehicleEntryForm from "@/components/VehicleEntryForm/VehicleEntryForm";
import { useVehicleEntries } from "@/hooks/useLedgers";
import { useParties } from "@/hooks/useParties";
import { useMessageStore } from "@/store/useMessageStore";
import ExcelButton from "@/components/ExcelButton";
import { Truck, Plus, Sparkles, ChevronRight, Calendar } from "lucide-react";
import { formatDate } from "@/utils/formatDate";

/* -------------------- Constants -------------------- */
export const TABS = {
  LIST: "list",
  FORM: "form",
} as const;

type ActiveTab = (typeof TABS)[keyof typeof TABS];

const VehicleEntries = () => {
  const navigate = useNavigate();
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
        const party = balanceParties.find((p: any) => p._id === val);
        setEntry((prev) => ({
          ...prev,
          balance_party: party || { _id: "", party_name: "" },
        }));
      }
    }
  };

  const fetchOptions = (search: string, field: string): any[] => {
    void field;
    const s = search.trim().toLowerCase();
    
    const uniqueOptionsMap = new Map<string, any>();
    
    for (const party of balanceParties) {
      const label = party.party_name;
      
      if (!s || label.toLowerCase().includes(s)) {
        if (!uniqueOptionsMap.has(label)) {
          uniqueOptionsMap.set(label, { label, value: party._id });
        }
      }
      if (s && uniqueOptionsMap.size >= 15) break;
      if (!s && uniqueOptionsMap.size >= 4) break;
    }

    return Array.from(uniqueOptionsMap.values());
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
                    <div
                      onClick={() => navigate(`/vehicle-entry/vehicle-entry-detail/${v._id}`)}
                      className="card-premium p-6 cursor-pointer hover:ring-4 hover:ring-blue-50 hover:border-blue-200 transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Truck size={18} />
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vehicle No.</span>
                            <h3 className="text-lg font-black italic text-slate-900">{v.vehicle_no || "—"}</h3>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${v.status === "Received" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                          {v.status || "Pending"}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="rounded-xl bg-slate-50 p-3">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Date</span>
                          <p className="text-sm font-bold text-slate-700 flex items-center gap-1">
                            <Calendar size={12} className="text-slate-300" />
                            {v.date ? formatDate(new Date(v.date)) : "—"}
                          </p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-3">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Route</span>
                          <p className="text-sm font-bold text-slate-700 truncate">{v.from || "—"} → {v.to || "—"}</p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-3">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Freight</span>
                          <p className="text-sm font-bold text-slate-700">₹{v.freight || "0"}</p>
                        </div>
                        <div className="rounded-xl bg-blue-50 p-3">
                          <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">Balance</span>
                          <p className="text-sm font-black text-blue-700">₹{v.balance || "0"}</p>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-end text-slate-400 gap-1">
                        <span className="text-[10px] font-black uppercase tracking-widest">View Details</span>
                        <ChevronRight size={14} />
                      </div>
                    </div>
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
