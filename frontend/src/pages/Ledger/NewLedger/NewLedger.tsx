import { useRef, useState } from "react";
import { EmptyLedgerEntry, type LedgerType } from "@/types/ledger";
import type { InputType, Option } from "@/types/form";
import FormSection from "@/components/FormSection";
import FormInput from "@/components/FormInput";
import Button from "@/components/Button";
import { useJourneys } from "@/hooks/useJourneys";
import { useTrucks } from "@/hooks/useTrucks";
import { useDrivers } from "@/hooks/useDrivers";
import { useParties } from "@/hooks/useParties";
import { useSettlements } from "@/hooks/useSettlements";
import { useVehicleEntries } from "@/hooks/useLedgers";
import { useLedgers } from "@/hooks/useLedgers";
import { useMessageStore } from "@/store/useMessageStore";
import { EmptyJourneyType, type JourneyType } from "@/types/journey";
import { EmptyTruckType, type TruckType } from "@/types/truck";
import { EmptyDriverType, type DriverType } from "@/types/driver";
import { EmptyBillingParty, type BillingPartyType } from "@/types/billingParty";
import { EmptySettlementType, type SettlementType } from "@/types/settlement";
import { EmptyVehicleEntry, type VehicleEntryType } from "@/types/vehicleEntry";
import { formatDate } from "@/utils/formatDate";
import {
  LEDGER_CATEGORIES, LEDGER_PAYMENT_MODES,
  LEDGER_REFERENCE_TYPES, LEDGER_TRANSACTION_TYPES,
} from "../ledgerConstants";
import MetaFields from "@/components/MetaFields";
import { useNavigate } from "react-router-dom";
import { BookOpen, Plus, Sparkles, Receipt, Link2, Wallet, ArrowLeft } from "lucide-react";

const CATEGORY_RULES: Record<string, string[]> = {
  "Freight Income": ["party", "truck", "journey"],
  "Diesel Expense": ["truck"],
  "Driver Advance": ["driver"],
  "Driver Settlement": ["driver", "settlement"],
  "In Account": ["party"],
  "Driver Expense": ["driver"],
  "Toll Expense": ["truck"],
  "Repair Expense": ["truck"],
  "Maintenance Expense": ["truck"],
  "Office Expense": [],
  "Payment Received": ["party", "reference_no"],
  "Payment Made": ["reference_no"],
  "Cash Transfer": ["party"],
  "Bank Transfer": ["party"],
  "Other Income": [],
  "Other Expense": [],
};

const LINKED_OBJ_INPUTS: InputType[] = [
  { type: "search", label: "Journey", name: "journey" },
  { type: "search", label: "Truck", name: "truck" },
  { type: "search", label: "Driver", name: "driver" },
  { type: "search", label: "Party", name: "party" },
  { type: "search", label: "Settlement", name: "settlement" },
  { type: "search", label: "Vehicle Entry", name: "vehicle_entry" },
];

const LEDGER_INFO_INPUTS: InputType[] = [
  { type: "date", label: "Transaction Date", name: "date" },
  { type: "select", label: "Category", name: "category" },
  { type: "select", label: "Type", name: "transaction_type" },
  { type: "textarea", label: "Description", name: "description" },
];

const LEDGER_MONEY_INPUTS: InputType[] = [
  { type: "number", label: "Debit", name: "debit" },
  { type: "number", label: "Credit", name: "credit" },
  { type: "select", label: "Mode", name: "payment_mode" },
];

const LEDGER_REFERENCE_INPUTS: InputType[] = [
  { type: "select", label: "Ref Type", name: "reference_type" },
  { type: "text", label: "Ref No.", name: "reference_no" },
  { type: "textarea", label: "Notes", name: "notes" },
];

const NewLedger = () => {
  const [ledger, setLedger] = useState<Omit<LedgerType, "_id">>(EmptyLedgerEntry);

  const errorsRef = useRef<Record<string, string>>({});
  const [, forceRender] = useState({});

  const fieldRefs: Record<string, React.RefObject<HTMLInputElement>> = {
    journey: useRef<HTMLInputElement>(null!),
    truck: useRef<HTMLInputElement>(null!),
    driver: useRef<HTMLInputElement>(null!),
    party: useRef<HTMLInputElement>(null!),
    settlement: useRef<HTMLInputElement>(null!),
    vehicle_entry: useRef<HTMLInputElement>(null!),
    reference_no: useRef<HTMLInputElement>(null!),
    category: useRef<HTMLInputElement>(null!),
    date: useRef<HTMLInputElement>(null!),
    transaction_type: useRef<HTMLInputElement>(null!),
    debit: useRef<HTMLInputElement>(null!),
    credit: useRef<HTMLInputElement>(null!),
    payment_mode: useRef<HTMLInputElement>(null!),
    reference_type: useRef<HTMLInputElement>(null!),
  };

  const lookupSectionRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const addMessage = useMessageStore((s) => s.addMessage);

  const { useJourneysQuery } = useJourneys();
  const { useTrucksQuery } = useTrucks();
  const { useDriversQuery } = useDrivers();
  const { useBillingPartiesQuery } = useParties();
  const { useSettlementsQuery } = useSettlements();
  const { useVehicleEntriesQuery } = useVehicleEntries();
  const { useAddLedgerMutation } = useLedgers();

  const { data: journies = [] } = useJourneysQuery();
  const { data: trucks = [] } = useTrucksQuery();
  const { data: drivers = [] } = useDriversQuery();
  const { data: parties = [] } = useBillingPartiesQuery();
  const { data: settlements = [] } = useSettlementsQuery();
  const { data: vehicleEntries = [] } = useVehicleEntriesQuery();
  const addLedgerMutation = useAddLedgerMutation();

  const resetObjError = () => {
    ["journey", "truck", "driver", "party", "settlement", "vehicle_entry"].forEach((k) => {
      errorsRef.current[k] = "";
    });
  };



  const handleChange = (value: string, name: string) => {
    // For complex objects, we ignore handleChange as handleSelectChange takes care of them
    if (["journey", "truck", "driver", "party", "settlement", "vehicle_entry", "category", "transaction_type", "payment_mode", "reference_type"].includes(name)) return;

    if (errorsRef.current[name]) {
      if (name === "debit" || name === "credit") {
        errorsRef.current["debit"] = "";
        errorsRef.current["credit"] = "";
      } else {
        errorsRef.current[name] = "";
      }
      forceRender({});
    }

    // Convert numeric fields to numbers
    const finalValue = (name === "debit" || name === "credit") ? (parseFloat(value) || 0) : value;
    setLedger((prev) => ({ ...prev, [name]: finalValue }));
  };

  const handleSelectChange = (val: string, name: string, mode: "select" | "search") => {
    if (mode === "select") {
      if (name === "category") { resetObjError(); }
      if (errorsRef.current[name]) {
        errorsRef.current[name] = "";
        forceRender({});
      }
      setLedger((prev) => ({ ...prev, [name]: val }));
    } else {
      switch (name) {
        case "journey": {
          const journey = val !== "" ? journies.find((j: JourneyType) => j._id === val) : EmptyJourneyType;
          const driver = (journey as any)?.driver;
          const truck = (journey as any)?.truck;
          setLedger((prev) => ({ ...prev, journey, driver, truck }));
          errorsRef.current["journey"] = "";
          break;
        }
        case "truck": {
          const truck = val !== "" ? trucks.find((t: TruckType) => t._id === val) : EmptyTruckType;
          errorsRef.current["truck"] = "";
          setLedger((prev) => ({ ...prev, truck }));
          break;
        }
        case "driver": {
          const driver = val !== "" ? drivers.find((d: DriverType) => d._id === val) : EmptyDriverType;
          errorsRef.current["driver"] = "";
          setLedger((prev) => ({ ...prev, driver }));
          break;
        }
        case "party": {
          const party = val !== "" ? parties.find((p: BillingPartyType) => p._id === val) : EmptyBillingParty;
          errorsRef.current["party"] = "";
          setLedger((prev) => ({ ...prev, party }));
          break;
        }
        case "settlement": {
          const settlement = val !== "" ? settlements.find((s: SettlementType) => s._id === val) : EmptySettlementType;
          errorsRef.current["settlement"] = "";
          setLedger((prev) => ({ ...prev, settlement }));
          break;
        }
        case "vehicle_entry": {
          const vehicle_entry = val !== "" ? vehicleEntries.find((ve: VehicleEntryType) => ve._id === val) : EmptyVehicleEntry;
          errorsRef.current["vehicle_entry"] = "";
          setLedger((prev) => ({ ...prev, vehicle_entry }));
          break;
        }
      }
    }
  };

  const fetchOptions = (search: string, field: string): Option[] => {
    const s = search.toLowerCase();
    switch (field) {
      case "journey": {
        return journies
          .filter((j: JourneyType) => j.truck?.truck_no?.toLowerCase().includes(s) || (j.driver as any)?.name?.toLowerCase().includes(s) || j.from.toLowerCase().includes(s) || j.to.toLowerCase().includes(s))
          .map((j: JourneyType) => ({ label: `${j.truck?.truck_no} | ${(j.driver as any)?.name} | ${j.from} | ${j.to} | ${formatDate(new Date(j.journey_start_date))}`, value: j._id }));
      }
      case "truck": return trucks.filter((t: TruckType) => t.truck_no.toLowerCase().includes(s)).map((t: TruckType) => ({ label: t.truck_no, value: t._id }));
      case "driver": return drivers.filter((d: DriverType) => d.name?.toLowerCase().includes(s)).map((d: DriverType) => ({ label: d.name, value: d._id }));
      case "party": return parties.filter((p: BillingPartyType) => p.name.toLowerCase().includes(s)).map((p: BillingPartyType) => ({ label: p.name, value: p._id }));
      case "settlement": return settlements.filter((s_: SettlementType) => (s_.driver as any)?.name?.toLowerCase().includes(s)).map((s_: SettlementType) => ({ label: `${(s_.driver as any)?.name} | ${formatDate(new Date(s_.period.from))} | ${formatDate(new Date(s_.period.to))}`, value: s_._id }));
      case "vehicle_entry": return vehicleEntries.filter((ve: VehicleEntryType) => ve.vehicle_no.toLowerCase().includes(s) || ve.from.toLowerCase().includes(s) || ve.to.toLowerCase().includes(s)).map((ve: VehicleEntryType) => ({ label: `${ve.vehicle_no} | ${ve.from} | ${ve.to}`, value: ve._id }));
      default: return [];
    }
  };

  const getRequiredFields = () => {
    return CATEGORY_RULES[ledger.category] || [];
  };

  const handleLedgerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation based on Category Rules
    const required = getRequiredFields();
    const newErrors: Record<string, string> = {};
    let firstErrorField: string | null = null;

    required.forEach(field => {
      const val = (ledger as any)[field];
      const isObject = val && typeof val === 'object';
      const isEmpty = isObject ? !val._id : (!val || val === "");

      if (isEmpty) {
        newErrors[field] = `${field.replace(/_/g, " ").toUpperCase()} is required for ${ledger.category}`;
        if (!firstErrorField) firstErrorField = field;
      }
    });

    // Check for "At least one lookup" rule
    const lookupFields = ["journey", "truck", "driver", "party", "settlement", "vehicle_entry"];
    const hasLookup = lookupFields.some(field => {
      const val = (ledger as any)[field];
      return val && (val._id || (typeof val === "string" && val !== ""));
    });

    if (!hasLookup && Object.keys(newErrors).length === 0) {
      addMessage({ type: "error", text: "At least one lookup (Party, Truck, Journey, etc.) must be selected" });
      newErrors.general = "Please link this entry to at least one record";

      lookupSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return; // Stop submission
    }

    if (Object.keys(newErrors).length > 0) {
      errorsRef.current = newErrors;
      forceRender({});
      addMessage({ type: "error", text: `Please fill required fields for ${ledger.category}` });

      if (firstErrorField && (fieldRefs as any)[firstErrorField]) {
        const el = (fieldRefs as any)[firstErrorField].current;
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          setTimeout(() => el.focus(), 500);
        }
      }
      return;
    }

    try {
      await addLedgerMutation.mutateAsync(ledger);
      addMessage({ type: "success", text: "New Ledger entry created successfully" });
      navigate("/ledger/all-ledgers");
    } catch (error: any) {
      const responseData = error?.response?.data;
      const errors = responseData?.errors || responseData;

      if (errors && typeof errors === "object") {
        errorsRef.current = errors;
        forceRender({});

        // Try to focus the first field with a backend error
        const firstErrorKey = Object.keys(errors).find(key => fieldRefs[key]);
        if (firstErrorKey) {
          const el = fieldRefs[firstErrorKey].current;
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            setTimeout(() => el.focus(), 500);
          }
        }
      }

      const firstErr = Object.values(errors).find(v => typeof v === 'string') as string;
      addMessage({
        type: "error",
        text: errors?.general || firstErr || responseData?.message || "Failed to add new ledger entry",
      });
    }
  };

  const renderInputs = (inputs: InputType[]) => {
    return inputs.map((input) => {
      let options: Option[] = [];
      let selectMode: "select" | "search" = "select";
      const error = errorsRef.current[input.name] || "";
      let value = String((ledger as any)[input.name] || "");

      if (["journey", "truck", "driver", "party", "settlement", "vehicle_entry"].includes(input.name)) {
        selectMode = "search";
        const obj = (ledger as any)[input.name];
        value = obj?._id || "";
        if (obj && obj._id) {
          let label = "";
          if (input.name === "truck") label = obj.truck_no;
          else if (input.name === "driver") label = obj.name;
          else if (input.name === "party") label = obj.name;
          else if (input.name === "journey") label = `${obj.truck?.truck_no} | ${obj.driver?.name} | ${obj.from} | ${obj.to} | ${formatDate(new Date(obj.journey_start_date))}`;
          else if (input.name === "settlement") label = `${obj.driver?.name} | ${formatDate(new Date(obj.period?.from))} | ${formatDate(new Date(obj.period?.to))}`;
          else if (input.name === "vehicle_entry") label = `${obj.vehicle_no} | ${obj.from} | ${obj.to}`;
          if (label && !label.includes("undefined")) options = [{ label, value: obj._id }];
        }
      }
      if (input.name === "category") { options = LEDGER_CATEGORIES.map((c) => ({ label: c, value: c })); value = ledger?.category || ""; }
      if (input.name === "transaction_type") { options = LEDGER_TRANSACTION_TYPES.map((t) => ({ label: t, value: t })); value = ledger?.transaction_type || ""; }
      if (input.name === "payment_mode") { options = LEDGER_PAYMENT_MODES.map((p) => ({ label: p, value: p })); value = ledger?.payment_mode || ""; }
      if (input.name === "reference_type") { options = LEDGER_REFERENCE_TYPES.map((r) => ({ label: r, value: r })); value = ledger?.reference_type || ""; }

      const isFieldRequired = getRequiredFields().includes(input.name);
      const labelWithAsterisk = (
        <span className="flex items-center gap-1">
          {input.label}
          {isFieldRequired && <span className="text-rose-500 font-bold">*</span>}
        </span>
      );

      return (
        <FormInput
          key={input.name}
          type={input.type}
          id={input.name}
          label={labelWithAsterisk as any}
          name={input.name}
          value={value}
          placeholder={input.label}
          options={options}
          error={error}
          selectMode={selectMode}
          inputType={input.inputType}
          onChange={handleChange}
          onSelectChange={(val, name, mode) => handleSelectChange(val, name, mode)}
          fetchOptions={fetchOptions}
          inputRef={(fieldRefs as any)[input.name]}
        />
      );
    });
  };

  return (
    <div className="flex flex-col gap-10 pb-20">
      <div className="flex flex-col gap-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold text-xs uppercase tracking-widest transition-colors w-fit">
          <ArrowLeft size={16} /> Back
        </button>
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-tight italic flex items-center gap-4 transition-colors">
            <BookOpen className="text-blue-600 dark:text-blue-400 w-10 h-10 lg:w-12 lg:h-12" /> New Ledger <span className="text-blue-600 dark:text-blue-400">Entry</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg mt-2">Record a new financial transaction in the company ledger.</p>
        </div>
      </div>

      <form onSubmit={handleLedgerSubmit} className="flex flex-col gap-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 flex flex-col gap-8">
            <div ref={lookupSectionRef}>
              <FormSection title="Linked Objects" icon={<Link2 size={18} />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderInputs(LINKED_OBJ_INPUTS)}
                </div>
              </FormSection>
            </div>
            <FormSection title="Transaction Details" icon={<Receipt size={18} />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderInputs(LEDGER_INFO_INPUTS)}
              </div>
            </FormSection>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-8 sticky top-24">
            <FormSection title="Financials" icon={<Wallet size={18} />}>
              <div className="flex flex-col gap-6">{renderInputs(LEDGER_MONEY_INPUTS)}</div>
            </FormSection>
            <FormSection title="Traceability" icon={<Sparkles size={18} />}>
              <div className="flex flex-col gap-6">{renderInputs(LEDGER_REFERENCE_INPUTS)}</div>
            </FormSection>
          </div>
        </div>

        <FormSection title="Additional Metadata" icon={<Plus size={18} />}>
          <div className="bg-slate-50/50 dark:bg-slate-900/50 p-6 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <MetaFields
              value={ledger.meta}
              isEditMode={true}
              onChange={(meta) => setLedger((prev) => ({ ...prev, meta }))}
            />
          </div>
        </FormSection>

        <div className="flex justify-end pt-6 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="submit"
            isLoading={addLedgerMutation.isPending}
            icon={<Plus size={20} />}
            className="w-fit px-12"
          >
            Create Ledger Entry
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewLedger;
