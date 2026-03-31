import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Loading from "@/components/Loading";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp } from "@/animations/animations";
import PaginatedList from "@/components/PaginatedList";
import { useBillEntries } from "@/hooks/useLedgers";
import { useParties } from "@/hooks/useParties";
import { useMessageStore } from "@/store/useMessageStore";
import type { BillEntryType } from "@/types/billEntry";
import { EmptyBillEntry } from "@/types/billEntry";
import type { BillingPartyType } from "@/types/billingParty";
import ExcelButton from "@/components/ExcelButton";
import { BillEntryFilters } from "@/filters/billEntryFilters";
import FilterContainer from "@/components/FilterContainer";
import BillEntryForm from "@/components/BillEntryForm/BillEntryForm";
import DeleteConfirm from "@/components/DeleteConfirm";
import { FileText, Plus, Sparkles, ChevronRight, Calendar, IndianRupee } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDate } from "@/utils/formatDate";

/* -------------------- Constants -------------------- */
export const TABS = {
  LIST: "list",
  FORM: "form",
} as const;

type ActiveTab = (typeof TABS)[keyof typeof TABS];

const BillEntries = () => {
  const navigate = useNavigate();
  const { useBillEntriesQuery, useAddBillEntryMutation } = useBillEntries();
  const { data: billEntries = [], isLoading } = useBillEntriesQuery();
  const { useBillingPartiesQuery } = useParties();
  const { data: billingParties = [] } = useBillingPartiesQuery();
  const addBillEntryMutation = useAddBillEntryMutation();
  const { addMessage } = useMessageStore();

  /* -------------------- Local State -------------------- */
  const [activeTab, setActiveTab] = useState<ActiveTab>(TABS.LIST);
  const [filteredEntries, setFilteredEntries] = useState<BillEntryType[]>([]);
  const [entry, setEntry] = useState<Omit<BillEntryType, "_id">>(EmptyBillEntry);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [selectedParty, setSelectedParty] = useState<BillingPartyType>({
    _id: "",
    name: "",
    address: "",
    gst_no: "",
  });
  const [partyError, setPartyError] = useState("");
  const partyRef = useRef<any>(null);

  const [state, setState] = useState("UP");
  const [deleteChargeId, setDeleteChargeId] = useState<string | null>(null);

  /* -------------------- Effects -------------------- */

  useEffect(() => {
    setFilteredEntries(billEntries);
  }, [billEntries]);

  useEffect(() => {
    setEntry((prev) => ({ ...prev, billing_party: selectedParty }));
  }, [selectedParty]);

  useEffect(() => {
    const gstRate = state === "UP" ? 0.09 : 0.18;
    const rate = Number(entry.rate) || 0;
    const advance = Number(entry.advance) || 0;
    const extraTotal = entry.extra_charges.reduce(
      (sum, ec) => sum + Number(ec.amount || 0),
      0
    );
    const gst = Math.round((rate + extraTotal) * gstRate * 100) / 100;
    const subTotal = rate + extraTotal;
    const grandTotal = (state === "UP" ? subTotal + 2 * gst : subTotal + gst) - advance;

    setEntry((prev) => ({
      ...prev,
      cgst: state === "UP" ? String(gst) : "",
      sgst: state === "UP" ? String(gst) : "",
      igst: state !== "UP" ? String(gst) : "",
      sub_total: String(subTotal),
      grand_total: String(grandTotal),
    }));
  }, [entry.rate, entry.extra_charges, state, entry.advance]);

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
    void name;
    if (mode === "select") {
      setState(val);
    } else {
      if (val === "") {
        setSelectedParty({ _id: "", name: "", address: "", gst_no: "" });
        setPartyError("Please select a Billing Party");
      } else {
        const found = billingParties.find((p: any) => p._id === val);
        if (found) {
          setSelectedParty(found);
          setPartyError("");
        }
      }
    }
  };

  const fetchOptions = (search: string, field: string): any[] => {
    void field;
    const s = search.trim().toLowerCase();
    const uniqueOptionsMap = new Map<string, any>();
    
    for (const party of billingParties) {
      const label = `${party.name}${party.address ? ` | ${party.address}` : ""}`;
      
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

  const handleExtraChargeChange = (
    id: string,
    field: string,
    value: string
  ) => {
    setEntry((prev) => ({
      ...prev,
      extra_charges: prev.extra_charges.map((ec) => {
        if (ec._id !== id) return ec;
        let updated = { ...ec, [field]: value };
        if (field === "rate" || field === "per_amount" || field === "amount") {
          const rate = Number(updated.rate) || 0;
          const per_amount = Number(updated.per_amount) || 0;
          updated.amount = (rate * per_amount).toString();
        }
        return updated;
      }),
    }));
  };

  const addExtraCharge = () => {
    setEntry((prev) => ({
      ...prev,
      extra_charges: [
        ...prev.extra_charges,
        { _id: uuidv4(), type: "", amount: "", rate: "", per_amount: "" },
      ],
    }));
  };

  const removeExtraCharge = (id: string) => {
    setEntry((prev) => ({
      ...prev,
      extra_charges: prev.extra_charges.filter((ec) => ec._id !== id),
    }));
    setDeleteChargeId(null);
  };

  const partyValidation = () => {
    if (selectedParty.name === "") {
      setPartyError("Please select a Billing Party");
      addMessage({ type: "error", text: "Please select a Billing Party" });
      partyRef.current?.focus();
      return true;
    }
    setPartyError("");
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (partyValidation()) return;
    try {
      await addBillEntryMutation.mutateAsync(entry);
      addMessage({ type: "success", text: "Entry added successfully" });
      setEntry(EmptyBillEntry);
      setSelectedParty({ _id: "", name: "", address: "", gst_no: "" });
      setActiveTab(TABS.LIST);
    } catch (err: any) {
      const serverErrors = err.response?.data?.errors || err;
      setErrors(serverErrors);
      addMessage({
        type: "error",
        text: serverErrors?.general || "Please fill all the required fields",
      });
    }
  };

  const handleDiscard = () => {
    setEntry(EmptyBillEntry);
    setSelectedParty({ _id: "", name: "", address: "", gst_no: "" });
    setActiveTab(TABS.LIST);
  }

  /* -------------------- Render -------------------- */
  if (isLoading) return <Loading />;

  return (
    <div className="flex flex-col gap-10 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight italic flex items-center gap-4 text-left">
            <FileText className="text-indigo-600 w-10 h-10 lg:w-12 lg:h-12" />
            Bill <span className="text-indigo-600">Database</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg text-left">Manage and review all your digital bill entries.</p>
        </div>

        <div className="flex bg-slate-100/50 p-1.5 rounded-[2rem] w-fit shadow-inner border border-slate-100">
          <button
            onClick={() => setActiveTab(TABS.LIST)}
            className={`
                            px-8 py-3.5 rounded-[1.5rem] font-bold text-sm transition-all flex items-center gap-2
                            ${activeTab === TABS.LIST ? 'bg-white text-indigo-600 shadow-xl shadow-indigo-100/50' : 'text-slate-400 hover:text-slate-600'}
                        `}
          >
            <Sparkles size={16} />
            Recent Entries
          </button>
          <button
            onClick={() => setActiveTab(TABS.FORM)}
            className={`
                            px-8 py-3.5 rounded-[1.5rem] font-bold text-sm transition-all flex items-center gap-2
                            ${activeTab === TABS.FORM ? 'bg-white text-indigo-600 shadow-xl shadow-indigo-100/50' : 'text-slate-400 hover:text-slate-600'}
                        `}
          >
            <Plus size={16} />
            New Bill Entry
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
            <BillEntryForm
              entry={entry}
              errors={errors}
              isPending={addBillEntryMutation.isPending}
              state={state}
              selectedParty={selectedParty}
              partyError={partyError}
              partyRef={partyRef}
              handleChange={handleChange}
              handleSelectChange={handleSelectChange}
              fetchOptions={fetchOptions}
              handleExtraChargeChange={handleExtraChargeChange}
              addExtraCharge={addExtraCharge}
              setDeleteChargeId={setDeleteChargeId}
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
              data={billEntries}
              filters={BillEntryFilters}
              onFiltered={setFilteredEntries}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                {filteredEntries.length} {filteredEntries.length === 1 ? "Entry" : "Entries"} Found
              </span>
              <ExcelButton data={filteredEntries} fileNamePrefix="Bill_Entries_List" />
            </div>

            <div className="flex flex-col gap-2 min-h-[400px]">
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
                    <div
                      onClick={() => navigate(`/bill-entry/bill-entry-detail/${entry._id}`)}
                      className="card-premium p-6 cursor-pointer hover:ring-4 hover:ring-indigo-50 hover:border-indigo-200 transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bill Number</span>
                          <h3 className="text-xl font-black italic text-slate-900">{entry.bill_no || "—"}</h3>
                        </div>
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest">
                          <FileText size={12} />
                          Bill
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="rounded-xl bg-slate-50 p-3">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Party</span>
                          <p className="text-sm font-bold text-slate-700 truncate">{entry.billing_party?.name || "—"}</p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-3">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">LR No.</span>
                          <p className="text-sm font-bold text-slate-700">{entry.lr_no || "—"}</p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-3">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Bill Date</span>
                          <p className="text-sm font-bold text-slate-700 flex items-center gap-1">
                            <Calendar size={12} className="text-slate-300" />
                            {entry.bill_date ? formatDate(new Date(entry.bill_date)) : "—"}
                          </p>
                        </div>
                        <div className="rounded-xl bg-indigo-50 p-3">
                          <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Grand Total</span>
                          <p className="text-sm font-black text-indigo-700 flex items-center gap-1">
                            <IndianRupee size={12} />
                            {entry.grand_total || "0"}
                          </p>
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
                  <FileText className="w-16 h-16 text-slate-200 mb-4" strokeWidth={1.5} />
                  <p className="text-slate-400 font-bold">No registered entries found matching your criteria</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <DeleteConfirm
        isOpen={deleteChargeId !== null}
        onClose={() => setDeleteChargeId(null)}
        onConfirm={() => deleteChargeId && removeExtraCharge(deleteChargeId)}
        title="Remove Charge?"
        message="Are you sure you want to remove this extra charge? This will recalculate the bill total."
      />
    </div>
  );
};

export default BillEntries;
