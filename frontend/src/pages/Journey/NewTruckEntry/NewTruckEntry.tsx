import { useRef, useState } from "react";
import FormInput from "../../../components/FormInput";
import FormSection from "../../../components/FormSection";
import { EmptyTruckType, type TruckType } from "../../../types/truck";
import type { AppDispatch } from "../../../app/store";
import { useDispatch } from "react-redux";
import { addMessage } from "../../../features/message";
import { addTruckEntryAsync } from "../../../features/truck";
import FormInputImage from "../../../components/FormInputImage";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Truck,
  Calendar,
  ShieldCheck,
  ArrowLeft,
  Activity,
  Zap,
  Globe,
  Map,
  CreditCard,
  Droplets
} from "lucide-react";

const DOCUMENTS = [
  {
    label: "Fitness Certificate",
    field: "fitness_doc",
    expiry_label: "Fitness Expiry",
    expiry_field: "fitness_doc_expiry",
    icon: <Activity size={18} />
  },
  {
    label: "Insurance Policy",
    field: "insurance_doc",
    expiry_label: "Insurance Expiry",
    expiry_field: "insurance_doc_expiry",
    icon: <ShieldCheck size={18} />
  },
  {
    label: "National Permit",
    field: "national_permit_doc",
    expiry_label: "Permit Expiry",
    expiry_field: "national_permit_doc_expiry",
    icon: <Globe size={18} />
  },
  {
    label: "State Permit",
    field: "state_permit_doc",
    expiry_label: "Permit Expiry",
    expiry_field: "state_permit_doc_expiry",
    icon: <Map size={18} />
  },
  {
    label: "Road Tax",
    field: "tax_doc",
    expiry_label: "Tax Expiry",
    expiry_field: "tax_doc_expiry",
    icon: <CreditCard size={18} />
  },
  {
    label: "Pollution (PUC)",
    field: "pollution_doc",
    expiry_label: "PUC Expiry",
    expiry_field: "pollution_doc_expiry",
    icon: <Droplets size={18} />
  },
];

const NewTruckEntry = () => {
  const [truck, setTruck] = useState<TruckType>(EmptyTruckType);
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const errorsRef = useRef<Record<string, string>>({});
  const [, forceRender] = useState({});

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    if (errorsRef.current[name]) {
      errorsRef.current[name] = "";
      forceRender({});
    }
    setTruck((prevTruck) => ({
      ...prevTruck,
      [name]: value,
    }));
  };

  const handleFileSelect = (file: File | null, field: keyof TruckType) => {
    setTruck((prev) => ({
      ...prev,
      [field]: file,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();

      Object.entries(truck).forEach(([key, value]) => {
        if (!value) return;

        if (value instanceof File) {
          formData.append(key, value);
        } else if (typeof value === "string") {
          formData.append(key, value);
        } else if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else if (typeof value === "object") {
          formData.append(key, JSON.stringify(value));
        }
      });

      const resultAction = await dispatch(addTruckEntryAsync(formData));
      if (addTruckEntryAsync.fulfilled.match(resultAction)) {
        dispatch(
          addMessage({ type: "success", text: "Truck added successfully" })
        );
        navigate("/journey/all-truck-entries");
      } else if (addTruckEntryAsync.rejected.match(resultAction)) {
        const errors = resultAction.payload;
        if (errors && !errors?.length && Object.keys(errors)?.length > 0) {
          errorsRef.current = errors;
          forceRender({});
        }
        dispatch(
          addMessage({
            type: "error",
            text: errors?.general || "Failed to add new truck"
          })
        )
      }
    } catch (error: any) {
      dispatch(
        addMessage({
          type: "error",
          text: "Something went wrong",
        })
      );
    }
  };

  return (
    <div className="flex flex-col gap-10 pb-20 max-w-6xl mx-auto">
      <div className="flex flex-col gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest transition-colors w-fit"
        >
          <ArrowLeft size={14} />
          Back
        </button>
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight italic flex items-center gap-4">
            <Plus className="text-indigo-600 w-10 h-10 lg:w-12 lg:h-12" />
            Add New <span className="text-indigo-600">Truck</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg">Register a new vehicle with registration and compliance documents.</p>
        </div>
      </div>

      <form className="flex flex-col gap-10" onSubmit={handleSubmit}>
        <div className="card-premium p-8 lg:p-10 bg-white">
          <FormSection title="Vehicle Registration" icon={<Truck size={18} />}>
            <div className="max-w-md">
              <FormInput
                type="text"
                id="truck_no"
                value={truck.truck_no}
                name="truck_no"
                label="Truck Registration Number"
                error={errorsRef.current['truck_no'] || ""}
                placeholder="e.g. HR-55-AL-1234"
                onChange={handleInputChange}
                icon={<Zap size={18} />}
              />
            </div>
          </FormSection>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {DOCUMENTS.map((document) => {
            const imgValue = truck[document.field as keyof TruckType];
            const expiryValue = truck[document.expiry_field as keyof TruckType];

            return (
              <div key={document.field} className="card-premium p-6 flex flex-col gap-6 bg-slate-50/30">
                <FormSection title={document.label} icon={document.icon}>
                  <div className="flex flex-col gap-6">
                    <FormInputImage
                      id={document.field}
                      value={typeof imgValue === "string" ? imgValue : ""}
                      name={document.field}
                      label="Document Scan"
                      isEditMode={true}
                      onFileSelect={(file) =>
                        handleFileSelect(file, document.field as keyof TruckType)
                      }
                    />
                    <FormInput
                      type="date"
                      id={document.expiry_field}
                      value={(expiryValue as string) ?? ""}
                      name={document.expiry_field}
                      label={document.expiry_label}
                      inputType="date"
                      onChange={handleInputChange}
                      icon={<Calendar size={16} />}
                    />
                  </div>
                </FormSection>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-10 border-t border-slate-100">
          <button
            type="submit"
            className="w-full lg:w-fit px-12 py-5 bg-indigo-600 text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:translate-y-0"
          >
            <Plus size={20} strokeWidth={3} />
            Register Vehicle
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewTruckEntry;
