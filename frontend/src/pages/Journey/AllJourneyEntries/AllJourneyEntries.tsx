import { useState, useRef, useEffect } from "react";
import { useJourneys } from "@/hooks/useJourneys";
import { useTrucks } from "@/hooks/useTrucks";
import { useDrivers } from "@/hooks/useDrivers";
import { useMessageStore } from "@/store/useMessageStore";
import { useNavigate } from "react-router-dom";
import { Milestone, Plus, Sparkles } from "lucide-react";
import Loading from "@/components/Loading";
import { motion, AnimatePresence } from "framer-motion";
import JourneyCard from "@/components/JourneyCard";
import JourneyEntryForm from "@/components/JourneyEntryForm";
import FilterContainer from "@/components/FilterContainer";
import { JourneyFilters } from "@/filters/journeyFilters";
import { type JourneyType } from "@/types/journey";
import PaginatedList from "@/components/PaginatedList";

/* -------------------- Constants -------------------- */
export const TABS = {
  LIST: "list",
  FORM: "form",
} as const;

type ActiveTab = (typeof TABS)[keyof typeof TABS];

const AllJourneyEntries = () => {
  const navigate = useNavigate();
  const addMessage = useMessageStore((s) => s.addMessage);
  const { useJourneysQuery, useAddJourneyMutation } = useJourneys();
  const { useTrucksQuery } = useTrucks();
  const { useDriversQuery } = useDrivers();

  const { data: journeys = [], isLoading: isJourneysLoading } = useJourneysQuery();
  const { data: trucks = [] } = useTrucksQuery();
  const { data: drivers = [] } = useDriversQuery();
  const addJourney = useAddJourneyMutation();

  /* -------------------- Local State -------------------- */
  const [activeTab, setActiveTab] = useState<ActiveTab>(TABS.LIST);
  const [filteredJourneys, setFilteredJourneys] = useState<JourneyType[]>([]);
  const [form, setForm] = useState({
    truck: "",
    driver: "",
    from: "",
    to: "",
    journey_start_date: "",
    journey_end_date: "",
    journey_starting_cash: "",
    distance_km: "",
    loaded_weight: "",
    average_mileage: "",
    starting_kms: "",
    ending_kms: "",
    journey_days: "5",
    journey_summary: "",
    status: "Active" as const,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const truckRef = useRef<any>(null);
  const driverRef = useRef<any>(null);

  /* -------------------- Effects -------------------- */

  useEffect(() => {
    const sorted = [...journeys].sort((a, b) =>
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
    setFilteredJourneys(sorted);
  }, [journeys]);

  /* -------------------- Handlers -------------------- */

  const handleChange = (val: string, name: string) => {
    setForm((prev) => ({ ...prev, [name]: val }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (name === "truck" && val) {
      const truckJourneys = journeys.filter((j) => {
        const truckId = typeof j.truck === "object" ? j.truck?._id : j.truck;
        return truckId === val;
      });

      if (truckJourneys.length > 0) {
        const kmsValues = truckJourneys
          .map((j) => Number(j.ending_kms))
          .filter((kms) => !isNaN(kms));

        if (kmsValues.length > 0) {
          const maxKms = Math.max(...kmsValues);
          setForm((prev) => ({ ...prev, starting_kms: String(maxKms) }));
        }
      }
    }
  };

  const fetchOptions = (search: string, field: string) => {
    const s = search.toLowerCase();
    if (field === "truck") {
      return trucks
        .filter((t) => t.truck_no.toLowerCase().includes(s))
        .map((t) => ({ label: t.truck_no, value: t._id }));
    }
    if (field === "driver") {
      return drivers
        .filter((d) => d.name.toLowerCase().includes(s))
        .map((d) => ({ label: d.name, value: d._id }));
    }
    return [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.truck) {
      setErrors((prev) => ({ ...prev, truck: "Please select a truck" }));
      addMessage({ type: "error", text: "Please select a truck." });
      truckRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      truckRef.current?.focus();
      return;
    }
    if (!form.driver) {
      setErrors((prev) => ({ ...prev, driver: "Please select a driver" }));
      addMessage({ type: "error", text: "Please select a driver." });
      driverRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      driverRef.current?.focus();
      return;
    }
    try {
      const selectedTruck = trucks.find(t => t._id === form.truck);
      const selectedDriver = drivers.find(d => d._id === form.driver);

      if (!selectedTruck || !selectedDriver) {
        addMessage({ type: "error", text: "Selected truck or driver not found." });
        return;
      }

      await addJourney.mutateAsync({
        ...form,
        truck: selectedTruck,
        driver: selectedDriver,
        route: [],
        driver_expenses: [],
        diesel_expenses: [],
        delays: [],
        daily_progress: [],
        issues: [],
        status_updates: [],
        delivery_details: { delivered_to: "", entry_date: "", empty_date: "", remarks: "" },
        settlement: { amount_paid: "", date_paid: "", mode: "", remarks: "" },
        total_driver_expense: "0",
        total_diesel_expense: "0",
        total_expense: "0",
        settled: false,
        settlement_ref: undefined as any,
      });
      addMessage({ type: "success", text: "Journey created successfully!" });
      setForm({
        truck: "",
        driver: "",
        from: "",
        to: "",
        journey_start_date: "",
        journey_end_date: "",
        journey_starting_cash: "",
        distance_km: "",
        loaded_weight: "",
        average_mileage: "",
        starting_kms: "",
        ending_kms: "",
        journey_days: "5",
        journey_summary: "",
        status: "Active",
      });
      setActiveTab(TABS.LIST);
    } catch (err: any) {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors) {
        setErrors(serverErrors);
        addMessage({ type: "error", text: "Please fix the errors below." });
      } else {
        addMessage({ type: "error", text: "Failed to create journey. Please try again." });
      }
    }
  };

  const handleDiscard = () => {
    setForm({
      truck: "",
      driver: "",
      from: "",
      to: "",
      journey_start_date: "",
      journey_end_date: "",
      journey_starting_cash: "",
      distance_km: "",
      loaded_weight: "",
      average_mileage: "",
      starting_kms: "",
      ending_kms: "",
      journey_days: "5",
      journey_summary: "",
      status: "Active",
    });
    setErrors({});
    setActiveTab(TABS.LIST);
  };

  const truckOptions = trucks.map((t) => ({ label: t.truck_no, value: t._id }));
  const driverOptions = drivers.map((d) => ({ label: d.name, value: d._id }));

  /* -------------------- Render -------------------- */
  if (isJourneysLoading) return <Loading />;

  return (
    <div className="flex flex-col gap-10 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight italic flex items-center gap-4 text-left">
            <Milestone className="text-blue-600 w-10 h-10 lg:w-12 lg:h-12" />
            Active <span className="text-blue-600">Journeys</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg text-left">Track and plan truck journeys with route assignments.</p>
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
            All Journeys
          </button>
          <button
            onClick={() => setActiveTab(TABS.FORM)}
            className={`
              px-8 py-3.5 rounded-[1.5rem] font-bold text-sm transition-all flex items-center gap-2
              ${activeTab === TABS.FORM ? 'bg-white text-blue-600 shadow-xl shadow-blue-100/50' : 'text-slate-400 hover:text-slate-600'}
            `}
          >
            <Plus size={16} />
            New Journey
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
            <JourneyEntryForm
              form={form}
              errors={errors}
              isPending={addJourney.isPending}
              truckRef={truckRef}
              driverRef={driverRef}
              truckOptions={truckOptions}
              driverOptions={driverOptions}
              handleChange={handleChange}
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
              data={journeys}
              filters={JourneyFilters}
              onFiltered={setFilteredJourneys}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                {filteredJourneys.length} {filteredJourneys.length === 1 ? "Journey" : "Journeys"} Found
              </span>
            </div>

            <div className="flex flex-col gap-2 min-h-[400px]">
              <PaginatedList
                items={filteredJourneys}
                itemsPerPage={9}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
                renderItem={(journey) => (
                  <div key={journey._id} onClick={() => navigate(`/journey/journey-detail/${journey._id}`)}>
                    <JourneyCard journey={journey} />
                  </div>
                )}
              />
              {filteredJourneys.length === 0 && (
                <div className="col-span-full py-32 flex flex-col items-center justify-center bg-white rounded-[2.5rem] border border-dashed border-slate-200 shadow-sm">
                  <Milestone size={48} className="text-slate-200 mb-4" />
                  <p className="text-slate-400 font-bold italic">No active journeys found matching your criteria.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AllJourneyEntries;
