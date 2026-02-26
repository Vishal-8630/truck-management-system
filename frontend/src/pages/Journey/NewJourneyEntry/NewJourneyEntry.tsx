import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useJourneys } from "@/hooks/useJourneys";
import { useTrucks } from "@/hooks/useTrucks";
import { useDrivers } from "@/hooks/useDrivers";
import { useMessageStore } from "@/store/useMessageStore";
import FormInput from "@/components/FormInput";
import FormSection from "@/components/FormSection";
import Button from "@/components/Button";
import { Milestone, Save, ArrowLeft, Truck, User, MapPin, Calendar, Zap, FileText, Calculator } from "lucide-react";

const NewJourneyEntry = () => {
  const navigate = useNavigate();
  const addMessage = useMessageStore((s) => s.addMessage);
  const { useAddJourneyMutation } = useJourneys();
  const { useTrucksQuery } = useTrucks();
  const { useDriversQuery } = useDrivers();
  const addJourney = useAddJourneyMutation();
  const { data: trucks = [] } = useTrucksQuery();
  const { data: drivers = [] } = useDriversQuery();

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

  const handleChange = (name: string, value: string) => setForm((prev) => ({ ...prev, [name]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.truck || !form.driver) {
      addMessage({ type: "error", text: "Please select a truck and driver." });
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
      navigate("/journey/all-journey-entries");
    } catch {
      addMessage({ type: "error", text: "Failed to create journey. Please try again." });
    }
  };

  const truckOptions = trucks.map((t) => ({ label: t.truck_no, value: t._id }));
  const driverOptions = drivers.map((d) => ({ label: d.name, value: d._id }));

  return (
    <div className="flex flex-col gap-10 pb-24">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-all text-sm font-semibold mb-2 w-fit"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight italic flex items-center gap-4">
            <Milestone className="text-blue-600 w-10 h-10 lg:w-12 lg:h-12" />
            Plan New <span className="text-blue-600">Journey</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg">Register a new truck journey with route and assignment details.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 flex flex-col gap-8">
            <FormSection title="Assignment" icon={<Truck size={18} />}>
              <div className="grid sm:grid-cols-2 gap-6">
                <FormInput
                  type="select"
                  label="Select Truck"
                  name="truck"
                  value={form.truck}
                  onChange={(val) => handleChange("truck", val)}
                  options={truckOptions}
                />
                <FormInput
                  type="select"
                  label="Assigned Driver"
                  name="driver"
                  value={form.driver}
                  onChange={(val) => handleChange("driver", val)}
                  options={driverOptions}
                />
              </div>
            </FormSection>

            <FormSection title="Route Details" icon={<MapPin size={18} />}>
              <div className="grid sm:grid-cols-2 gap-6">
                <FormInput
                  type="input"
                  inputType="text"
                  label="Starting Location"
                  name="from"
                  placeholder="e.g. Mumbai"
                  value={form.from}
                  onChange={(val) => handleChange("from", val)}
                />
                <FormInput
                  type="input"
                  inputType="text"
                  label="Destination"
                  name="to"
                  placeholder="e.g. Delhi"
                  value={form.to}
                  onChange={(val) => handleChange("to", val)}
                />
              </div>
            </FormSection>

            <FormSection title="Timelines & Funds" icon={<Calendar size={18} />}>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormInput type="date" label="Start Date" name="journey_start_date" value={form.journey_start_date} onChange={(val) => handleChange("journey_start_date", val)} />
                <FormInput type="date" label="Estimated Arrival" name="journey_end_date" value={form.journey_end_date} onChange={(val) => handleChange("journey_end_date", val)} />
                <FormInput type="number" label="Starting Cash (₹)" name="journey_starting_cash" value={form.journey_starting_cash} onChange={(val) => handleChange("journey_starting_cash", val)} />
                <FormInput type="number" label="Planned Days" name="journey_days" value={form.journey_days} onChange={(val) => handleChange("journey_days", val)} />
              </div>
            </FormSection>

            <FormSection title="Odometer & Payload" icon={<Zap size={18} />}>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormInput type="number" label="Starting KMs" name="starting_kms" value={form.starting_kms} onChange={(val) => handleChange("starting_kms", val)} />
                <FormInput type="number" label="Target Distance (km)" name="distance_km" value={form.distance_km} onChange={(val) => handleChange("distance_km", val)} />
                <FormInput type="number" label="Loaded Weight (kg)" name="loaded_weight" value={form.loaded_weight} onChange={(val) => handleChange("loaded_weight", val)} />
                <FormInput type="number" label="Expected Mileage" name="average_mileage" value={form.average_mileage} onChange={(val) => handleChange("average_mileage", val)} />
              </div>
            </FormSection>

            <FormSection title="Journey Summary" icon={<FileText size={18} />}>
              <FormInput
                type="textarea"
                label="Brief Description"
                name="journey_summary"
                placeholder="Details about the trip, priority, or cargo..."
                value={form.journey_summary}
                onChange={(val) => handleChange("journey_summary", val)}
              />
            </FormSection>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-8 sticky top-24">
            <FormSection title="Plan Actions" icon={<Calculator size={18} />}>
              <div className="flex flex-col gap-4">
                <p className="text-sm text-slate-500 font-medium">Verify truck compliance and driver availability before planning.</p>
                <Button
                  type="submit"
                  isLoading={addJourney.isPending}
                  icon={<Save size={20} />}
                  className="py-5 shadow-blue-500/30 w-full"
                >
                  Create Journey
                </Button>
                <button
                  type="button"
                  onClick={() => navigate('/journey/all-journey-entries')}
                  className="py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors uppercase tracking-widest text-[10px]"
                >
                  Discard Plan
                </button>
              </div>
            </FormSection>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewJourneyEntry;
