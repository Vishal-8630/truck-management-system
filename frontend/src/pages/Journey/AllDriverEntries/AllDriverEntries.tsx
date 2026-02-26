import { useState, useRef, useEffect } from "react";
import { useDrivers } from "@/hooks/useDrivers";
import { useMessageStore } from "@/store/useMessageStore";
import Loading from "@/components/Loading";
import { useNavigate } from "react-router-dom";
import { Contact, Plus, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DriverCard from "@/components/DriverCard";
import DriverForm from "@/components/DriverForm";
import FilterContainer from "@/components/FilterContainer";
import { DriverFilters } from "@/filters/driverFilters";
import { type DriverType } from "@/types/driver";

/* -------------------- Constants -------------------- */
export const TABS = {
  LIST: "list",
  FORM: "form",
} as const;

type ActiveTab = (typeof TABS)[keyof typeof TABS];

const EMPTY_FORM = {
  name: "",
  phone: "",
  address: "",
  dl: "",
  licence_expiry: "",
  adhaar_no: "",
  notes: "",
};

const AllDriverEntries = () => {
  const navigate = useNavigate();
  const addMessage = useMessageStore((s) => s.addMessage);
  const { useDriversQuery, useAddDriverMutation } = useDrivers();
  const { data: drivers = [], isLoading } = useDriversQuery();
  const addDriver = useAddDriverMutation();

  /* -------------------- Local State -------------------- */
  const [activeTab, setActiveTab] = useState<ActiveTab>(TABS.LIST);
  const [filteredDrivers, setFilteredDrivers] = useState<DriverType[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [image, setImage] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fieldRefs: Record<string, React.RefObject<any>> = {
    name: useRef<any>(null),
    phone: useRef<any>(null),
    address: useRef<any>(null),
    dl: useRef<any>(null),
    licence_expiry: useRef<any>(null),
    adhaar_no: useRef<any>(null),
    notes: useRef<any>(null),
  };

  /* -------------------- Effects -------------------- */
  useEffect(() => {
    setFilteredDrivers(drivers);
  }, [drivers]);

  /* -------------------- Handlers -------------------- */

  const handleChange = (value: string, name: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!form.name.trim()) {
      setErrors({ name: "Driver name is required." });
      addMessage({ type: "error", text: "Driver name is required." });
      fieldRefs.name.current?.focus();
      return;
    }

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (image) fd.append("driver_img", image);
      await addDriver.mutateAsync(fd);
      addMessage({ type: "success", text: "Driver registered successfully!" });
      setForm(EMPTY_FORM);
      setImage(null);
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
        addMessage({ type: "error", text: "Failed to register driver. Please try again." });
      }
    }
  };

  const handleDiscard = () => {
    setForm(EMPTY_FORM);
    setImage(null);
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
            <Contact className="text-indigo-600 w-10 h-10 lg:w-12 lg:h-12" />
            Driver <span className="text-indigo-600">Profiles</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg text-left">Manage driver records, certifications, and contacts.</p>
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
            All Drivers
          </button>
          <button
            onClick={() => setActiveTab(TABS.FORM)}
            className={`
              px-8 py-3.5 rounded-[1.5rem] font-bold text-sm transition-all flex items-center gap-2
              ${activeTab === TABS.FORM ? 'bg-white text-indigo-600 shadow-xl shadow-indigo-100/50' : 'text-slate-400 hover:text-slate-600'}
            `}
          >
            <Plus size={16} />
            Register Driver
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
            <DriverForm
              form={form}
              errors={errors}
              isPending={addDriver.isPending}
              fieldRefs={fieldRefs}
              handleChange={handleChange}
              onImageSelect={setImage}
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
                data={drivers}
                filters={DriverFilters}
                onFiltered={setFilteredDrivers}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredDrivers.length === 0 ? (
                <div className="col-span-full py-32 flex flex-col items-center justify-center bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <Contact size={48} className="text-slate-200 mb-4" />
                  <p className="text-slate-400 font-bold italic">No drivers found matching your criteria.</p>
                </div>
              ) : (
                filteredDrivers.map((driver) => (
                  <DriverCard
                    key={driver._id}
                    driver={driver}
                    handleClick={(id) => navigate(`/journey/driver-detail/${id}`)}
                  />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AllDriverEntries;
