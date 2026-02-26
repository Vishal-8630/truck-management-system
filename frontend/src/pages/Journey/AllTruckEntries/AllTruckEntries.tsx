import { useState, useRef, useEffect } from "react";
import { useTrucks } from "@/hooks/useTrucks";
import Loading from "@/components/Loading";
import { useNavigate } from "react-router-dom";
import { Truck, Plus, ChevronRight, Gauge, Sparkles } from "lucide-react";
import { useMessageStore } from "@/store/useMessageStore";
import { motion, AnimatePresence } from "framer-motion";
import TruckForm from "@/components/TruckForm";
import FilterContainer from "@/components/FilterContainer";
import { TruckFilters } from "@/filters/truckFilters";
import { type TruckType } from "@/types/truck";

/* -------------------- Constants -------------------- */
export const TABS = {
  LIST: "list",
  FORM: "form",
} as const;

type ActiveTab = (typeof TABS)[keyof typeof TABS];

const AllTruckEntries = () => {
  const navigate = useNavigate();
  const addMessage = useMessageStore((s) => s.addMessage);
  const { useTrucksQuery, useAddTruckMutation } = useTrucks();
  const { data: trucks = [], isLoading: isTrucksLoading } = useTrucksQuery();
  const addTruck = useAddTruckMutation();

  /* -------------------- Local State -------------------- */
  const [activeTab, setActiveTab] = useState<ActiveTab>(TABS.LIST);
  const [filteredTrucks, setFilteredTrucks] = useState<TruckType[]>([]);
  const [form, setForm] = useState({
    truck_no: "",
    model: "",
    year: "",
    notes: "",
    fitness_doc_expiry: "",
    insurance_doc_expiry: "",
    national_permit_doc_expiry: "",
    state_permit_doc_expiry: "",
    tax_doc_expiry: "",
    pollution_doc_expiry: "",
  });

  const [docs, setDocs] = useState<Record<string, File | null>>({
    fitness_doc: null,
    insurance_doc: null,
    national_permit_doc: null,
    state_permit_doc: null,
    tax_doc: null,
    pollution_doc: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const fieldRefs: Record<string, React.RefObject<any>> = {
    truck_no: useRef<any>(null),
    model: useRef<any>(null),
    year: useRef<any>(null),
    notes: useRef<any>(null),
    fitness_doc_expiry: useRef<any>(null),
    insurance_doc_expiry: useRef<any>(null),
    national_permit_doc_expiry: useRef<any>(null),
    state_permit_doc_expiry: useRef<any>(null),
    tax_doc_expiry: useRef<any>(null),
    pollution_doc_expiry: useRef<any>(null),
  };

  /* -------------------- Effects -------------------- */
  useEffect(() => {
    setFilteredTrucks(trucks);
  }, [trucks]);

  /* -------------------- Handlers -------------------- */

  const handleChange = (value: string, name: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFileSelect = (file: File | null, name: string) => {
    setDocs(prev => ({ ...prev, [name]: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!form.truck_no.trim()) {
      setErrors({ truck_no: "Truck registration number is required." });
      addMessage({ type: "error", text: "Truck registration number is required." });
      fieldRefs.truck_no.current?.focus();
      return;
    }

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      Object.entries(docs).forEach(([k, v]) => {
        if (v) fd.append(k, v);
      });
      await addTruck.mutateAsync(fd);
      addMessage({ type: "success", text: "Truck registered successfully!" });
      setForm({
        truck_no: "",
        model: "",
        year: "",
        notes: "",
        fitness_doc_expiry: "",
        insurance_doc_expiry: "",
        national_permit_doc_expiry: "",
        state_permit_doc_expiry: "",
        tax_doc_expiry: "",
        pollution_doc_expiry: "",
      });
      setDocs({
        fitness_doc: null,
        insurance_doc: null,
        national_permit_doc: null,
        state_permit_doc: null,
        tax_doc: null,
        pollution_doc: null,
      });
      setActiveTab(TABS.LIST);
    } catch (err: any) {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors && typeof serverErrors === "object") {
        setErrors(serverErrors);
        const firstErrorKey = Object.keys(serverErrors)[0];
        const firstErrorField = fieldRefs[firstErrorKey];
        if (firstErrorField?.current) {
          firstErrorField.current.scrollIntoView({ behavior: "smooth", block: "center" });
          setTimeout(() => firstErrorField.current?.focus(), 500);
        }
        const firstErrorMsg = Object.values(serverErrors)[0] as string;
        addMessage({ type: "error", text: firstErrorMsg || "Please fix the errors below." });
      } else {
        addMessage({ type: "error", text: "Failed to register truck. Please try again." });
      }
    }
  };

  const handleDiscard = () => {
    setForm({
      truck_no: "",
      model: "",
      year: "",
      notes: "",
      fitness_doc_expiry: "",
      insurance_doc_expiry: "",
      national_permit_doc_expiry: "",
      state_permit_doc_expiry: "",
      tax_doc_expiry: "",
      pollution_doc_expiry: "",
    });
    setDocs({
      fitness_doc: null,
      insurance_doc: null,
      national_permit_doc: null,
      state_permit_doc: null,
      tax_doc: null,
      pollution_doc: null,
    });
    setErrors({});
    setActiveTab(TABS.LIST);
  };

  /* -------------------- Render -------------------- */

  if (isTrucksLoading) return <Loading />;

  return (
    <div className="flex flex-col gap-10 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight italic flex items-center gap-4 text-left">
            <Truck className="text-indigo-600 w-10 h-10 lg:w-12 lg:h-12" />
            Vehicle <span className="text-indigo-600">Fleet</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg text-left">Manage and monitor all company trucks and carriers.</p>
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
            Fleet Inventory
          </button>
          <button
            onClick={() => setActiveTab(TABS.FORM)}
            className={`
              px-8 py-3.5 rounded-[1.5rem] font-bold text-sm transition-all flex items-center gap-2
              ${activeTab === TABS.FORM ? 'bg-white text-indigo-600 shadow-xl shadow-indigo-100/50' : 'text-slate-400 hover:text-slate-600'}
            `}
          >
            <Plus size={16} />
            Register Truck
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
            <TruckForm
              form={form}
              errors={errors}
              isPending={addTruck.isPending}
              fieldRefs={fieldRefs}
              handleChange={handleChange}
              handleFileSelect={handleFileSelect}
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
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
              <FilterContainer
                data={trucks}
                filters={TruckFilters}
                onFiltered={setFilteredTrucks}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTrucks.length === 0 ? (
                <div className="col-span-full py-24 flex flex-col items-center justify-center bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <Truck size={40} className="text-slate-200 mb-3" />
                  <p className="text-slate-400 font-bold italic">No trucks found matching your criteria.</p>
                </div>
              ) : (
                filteredTrucks.map((truck) => (
                  <div
                    key={truck._id}
                    onClick={() => navigate(`/journey/truck/${truck._id}`)}
                    className="card-premium p-6 group cursor-pointer hover:border-indigo-200 hover:ring-4 hover:ring-indigo-50 transition-all duration-300 flex flex-col gap-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                        <Truck size={24} />
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Status</span>
                        <span className="inline-flex items-center gap-1.5 text-emerald-500 font-bold text-[10px] uppercase">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Active
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Registration No.</span>
                      <span className="text-xl font-extrabold text-slate-900 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{truck.truck_no}</span>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-50">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Gauge size={14} />
                        <span className="text-xs font-bold">Details</span>
                      </div>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AllTruckEntries;
