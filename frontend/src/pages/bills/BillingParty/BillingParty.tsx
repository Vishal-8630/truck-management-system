import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BillingPartyForm from "@/components/BillingPartyForm";
import Loading from "@/components/Loading";
import {
  EmptyBillingParty,
  type BillingPartyType,
} from "@/types/billingParty";
import { useMessageStore } from "@/store/useMessageStore";
import { motion, AnimatePresence } from "framer-motion";
import PaginatedList from "@/components/PaginatedList";
import { BillingPartyFilters } from "@/filters/billingPartyFilters";
import FilterContainer from "@/components/FilterContainer";
import { useParties } from "@/hooks/useParties";
import ExcelButton from "@/components/ExcelButton";
import { Users, Sparkles, Plus, Building2, ChevronRight } from "lucide-react";

/* -------------------- Constants -------------------- */
export const TABS = {
  LIST: "list",
  FORM: "form",
} as const;

type ActiveTab = (typeof TABS)[keyof typeof TABS];

const BillingParty = () => {
  const navigate = useNavigate();
  const { useBillingPartiesQuery, useAddBillingPartyMutation } = useParties();
  const { data: billingParties = [], isLoading } = useBillingPartiesQuery();
  const addBillingPartyMutation = useAddBillingPartyMutation();
  const { addMessage } = useMessageStore();

  /* -------------------- Local State -------------------- */
  const [activeTab, setActiveTab] = useState<ActiveTab>(TABS.LIST);

  // "Add Party" form state
  const [party, setParty] =
    useState<Omit<BillingPartyType, "_id">>(EmptyBillingParty);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [filteredParties, setFilteredParties] = useState<BillingPartyType[]>(
    []
  );

  /* -------------------- Effects -------------------- */

  useEffect(() => {
    setFilteredParties(billingParties);
  }, [billingParties]);

  /* -------------------- Handlers: Add Party -------------------- */

  const handleInputChange = (value: string, name: string) => {
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setParty((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await addBillingPartyMutation.mutateAsync(party);
      addMessage({
        type: "success",
        text: "Billing party added successfully",
      });
      setParty(EmptyBillingParty);
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
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight italic flex items-center gap-4">
            <Users className="text-blue-600 w-10 h-10 lg:w-12 lg:h-12" />
            Billing <span className="text-blue-600">Parties</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg">Manage registered companies and billing entities.</p>
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
            Registered List
          </button>
          <button
            onClick={() => setActiveTab(TABS.FORM)}
            className={`
              px-8 py-3.5 rounded-[1.5rem] font-bold text-sm transition-all flex items-center gap-2
              ${activeTab === TABS.FORM ? 'bg-white text-blue-600 shadow-xl shadow-blue-100/50' : 'text-slate-400 hover:text-slate-600'}
            `}
          >
            <Plus size={16} />
            New Registration
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
            <BillingPartyForm
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              party={party}
              errors={errors}
              isPending={addBillingPartyMutation.isPending}
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
              data={billingParties}
              filters={BillingPartyFilters}
              onFiltered={setFilteredParties}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                {filteredParties.length} {filteredParties.length === 1 ? "Party" : "Parties"} Found
              </span>
              <ExcelButton data={filteredParties} fileNamePrefix="Billing_Parties_List" />
            </div>

            <div className="flex flex-col gap-2 min-h-[400px]">
              <PaginatedList
                items={filteredParties}
                itemsPerPage={8}
                renderItem={(p) => (
                  <div
                    key={p._id}
                    onClick={() => navigate(`/bill-entry/billing-party-detail/${p._id}`)}
                    className="card-premium p-6 mb-4 cursor-pointer hover:ring-4 hover:ring-blue-50 hover:border-blue-200 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                          <Building2 size={18} />
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Billing Party</span>
                          <h3 className="text-lg font-black italic text-slate-900">{p.name || "—"}</h3>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">GST Number</span>
                        <p className="text-sm font-bold text-slate-700">{p.gst_no || "—"}</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Address</span>
                        <p className="text-sm font-bold text-slate-700 truncate">{p.address || "—"}</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-end text-slate-400 gap-1">
                      <span className="text-[10px] font-black uppercase tracking-widest">View Details</span>
                      <ChevronRight size={14} />
                    </div>
                  </div>
                )}
              />
              {filteredParties.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/30">
                  <Users className="w-16 h-16 text-slate-200 mb-4" strokeWidth={1.5} />
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

export default BillingParty;
