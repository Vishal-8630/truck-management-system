import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTrucks } from "@/hooks/useTrucks";
import { useMessageStore } from "@/store/useMessageStore";
import FormInput from "@/components/FormInput";
import FormSection from "@/components/FormSection";
import FormInputImage from "@/components/ui/FormInputImage";
import Button from "@/components/Button";
import { Truck, Save, ArrowLeft, FileText, ShieldCheck, Image as ImageIcon, Activity } from "lucide-react";

const NewTruckEntry = () => {
  const navigate = useNavigate();
  const addMessage = useMessageStore((s) => s.addMessage);
  const { useAddTruckMutation } = useTrucks();
  const addTruck = useAddTruckMutation();

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

  const errorsRef = useRef<Record<string, string>>({});
  const [, forceRender] = useState({});

  const fieldRefs: Record<string, React.RefObject<HTMLInputElement | HTMLTextAreaElement>> = {
    truck_no: useRef<HTMLInputElement>(null!),
    model: useRef<HTMLInputElement>(null!),
    year: useRef<HTMLInputElement>(null!),
    notes: useRef<HTMLTextAreaElement>(null!),
    fitness_doc_expiry: useRef<HTMLInputElement>(null!),
    insurance_doc_expiry: useRef<HTMLInputElement>(null!),
    national_permit_doc_expiry: useRef<HTMLInputElement>(null!),
    state_permit_doc_expiry: useRef<HTMLInputElement>(null!),
    tax_doc_expiry: useRef<HTMLInputElement>(null!),
    pollution_doc_expiry: useRef<HTMLInputElement>(null!),
  };

  const [docs, setDocs] = useState<Record<string, File | null>>({
    fitness_doc: null,
    insurance_doc: null,
    national_permit_doc: null,
    state_permit_doc: null,
    tax_doc: null,
    pollution_doc: null,
  });

  const handleChange = (value: string, name: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errorsRef.current[name]) {
      errorsRef.current[name] = "";
      forceRender({});
    }
  };

  const handleFileSelect = (file: File | null, name: string) => {
    setDocs(prev => ({ ...prev, [name]: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    errorsRef.current = {};
    forceRender({});

    if (!form.truck_no.trim()) {
      errorsRef.current.truck_no = "Truck registration number is required.";
      forceRender({});
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
      navigate("/journey/all-truck-entries");
    } catch (err: any) {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors && typeof serverErrors === "object") {
        errorsRef.current = serverErrors;
        forceRender({});

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

  return (
    <div className="flex flex-col gap-10 pb-24">
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
            <Truck className="text-blue-600 w-10 h-10 lg:w-12 lg:h-12" />
            Register New <span className="text-blue-600">Truck</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg">Add a new truck to the fleet registry with compliance tracking.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 flex flex-col gap-8">
            <FormSection title="Truck Specifications" icon={<Activity size={18} />}>
              <div className="grid sm:grid-cols-2 gap-6">
                <FormInput
                  type="input"
                  inputType="text"
                  label="Registration No."
                  name="truck_no"
                  placeholder="e.g. UP 80 AX 1234"
                  value={form.truck_no}
                  onChange={handleChange}
                  error={errorsRef.current.truck_no}
                  inputRef={fieldRefs.truck_no}
                />
                <FormInput
                  type="input"
                  inputType="text"
                  label="Model"
                  name="model"
                  placeholder="e.g. Tata Prima"
                  value={form.model}
                  onChange={handleChange}
                  error={errorsRef.current.model}
                  inputRef={fieldRefs.model}
                />
                <FormInput
                  type="input"
                  inputType="text"
                  label="Year"
                  name="year"
                  placeholder="e.g. 2023"
                  value={form.year}
                  onChange={handleChange}
                  error={errorsRef.current.year}
                  inputRef={fieldRefs.year}
                />
              </div>
              <div className="mt-4">
                <FormInput
                  type="textarea"
                  label="Additional Notes"
                  name="notes"
                  placeholder="Engine details, maintenance history, etc."
                  value={form.notes}
                  onChange={handleChange}
                  error={errorsRef.current.notes}
                  inputRef={fieldRefs.notes}
                />
              </div>
            </FormSection>

            <FormSection title="Compliance Expiry Dates" icon={<ShieldCheck size={18} />}>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormInput type="date" label="Fitness Expiry" name="fitness_doc_expiry" value={form.fitness_doc_expiry} onChange={handleChange} error={errorsRef.current.fitness_doc_expiry} inputRef={fieldRefs.fitness_doc_expiry} />
                <FormInput type="date" label="Insurance Expiry" name="insurance_doc_expiry" value={form.insurance_doc_expiry} onChange={handleChange} error={errorsRef.current.insurance_doc_expiry} inputRef={fieldRefs.insurance_doc_expiry} />
                <FormInput type="date" label="National Permit" name="national_permit_doc_expiry" value={form.national_permit_doc_expiry} onChange={handleChange} error={errorsRef.current.national_permit_doc_expiry} inputRef={fieldRefs.national_permit_doc_expiry} />
                <FormInput type="date" label="State Permit" name="state_permit_doc_expiry" value={form.state_permit_doc_expiry} onChange={handleChange} error={errorsRef.current.state_permit_doc_expiry} inputRef={fieldRefs.state_permit_doc_expiry} />
                <FormInput type="date" label="Tax Expiry" name="tax_doc_expiry" value={form.tax_doc_expiry} onChange={handleChange} error={errorsRef.current.tax_doc_expiry} inputRef={fieldRefs.tax_doc_expiry} />
                <FormInput type="date" label="Pollution Expiry" name="pollution_doc_expiry" value={form.pollution_doc_expiry} onChange={handleChange} error={errorsRef.current.pollution_doc_expiry} inputRef={fieldRefs.pollution_doc_expiry} />
              </div>
            </FormSection>

            <FormSection title="Document Uploads" icon={<ImageIcon size={18} />}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(["fitness_doc", "insurance_doc", "national_permit_doc", "state_permit_doc", "tax_doc", "pollution_doc"] as const).map((doc) => (
                  <FormInputImage
                    key={doc}
                    id={doc}
                    name={doc}
                    label={doc.replace(/_/g, " ")}
                    isEditMode={true}
                    onFileSelect={(file) => handleFileSelect(file, doc)}
                  />
                ))}
              </div>
            </FormSection>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-8 sticky top-24">
            <FormSection title="Registry Actions" icon={<FileText size={18} />}>
              <div className="flex flex-col gap-4">
                <p className="text-sm text-slate-500 font-medium">Please ensure all compliance dates are accurate for automated alerts.</p>
                <Button
                  type="submit"
                  isLoading={addTruck.isPending}
                  icon={<Save size={20} />}
                  className="py-5 shadow-blue-500/30 w-full"
                >
                  Register Truck
                </Button>
                <button
                  type="button"
                  onClick={() => navigate('/journey/all-truck-entries')}
                  className="py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors uppercase tracking-widest text-[10px]"
                >
                  Cancel Registration
                </button>
              </div>
            </FormSection>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewTruckEntry;
