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

  const resetObjValues = () => {
    setLedger((prev) => ({
      ...prev,
      journey: EmptyJourneyType,
      truck: EmptyTruckType,
      driver: EmptyDriverType,
      party: EmptyBillingParty,
      settlement: EmptySettlementType,
      vehicle_entry: EmptyVehicleEntry,
    }));
  };

  const handleChange = (value: string, name: string) => {
    if (errorsRef.current[name]) {
      if (name === "debit" || name === "credit") {
        errorsRef.current["debit"] = ""; errorsRef.current["credit"] = "";
      } else {
        errorsRef.current[name] = "";
      }
      forceRender({});
    }
    setLedger((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (val: string, name: string, mode: "select" | "search") => {
    if (mode === "select") {
      if (name === "category") { resetObjError(); resetObjValues(); }
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

  const handleLedgerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addLedgerMutation.mutateAsync(ledger);
      addMessage({ type: "success", text: "New Ledger entry created successfully" });
      navigate("/ledger/all-ledgers");
    } catch (error: any) {
      const errors = error?.response?.data;
      if (errors && typeof errors === "object") {
        errorsRef.current = errors;
        forceRender({});
      }
      addMessage({ type: "error", text: errors?.general || "Failed to add new ledger entry" });
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
        value = (ledger as any)[input.name]?._id || "";
      }
      if (input.name === "category") { options = LEDGER_CATEGORIES.map((c) => ({ label: c, value: c })); value = ledger?.category || ""; }
      if (input.name === "transaction_type") { options = LEDGER_TRANSACTION_TYPES.map((t) => ({ label: t, value: t })); value = ledger?.transaction_type || ""; }
      if (input.name === "payment_mode") { options = LEDGER_PAYMENT_MODES.map((p) => ({ label: p, value: p })); value = ledger?.payment_mode || ""; }
      if (input.name === "reference_type") { options = LEDGER_REFERENCE_TYPES.map((r) => ({ label: r, value: r })); value = ledger?.reference_type || ""; }

      return (
        <FormInput
          key={input.name}
          type={input.type}
          id={input.name}
          label={input.label}
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
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight italic flex items-center gap-4">
            <BookOpen className="text-blue-600 w-10 h-10 lg:w-12 lg:h-12" /> New Ledger <span className="text-blue-600">Entry</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg mt-2">Record a new financial transaction in the company ledger.</p>
        </div>
      </div>

      <form onSubmit={handleLedgerSubmit} className="flex flex-col gap-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 flex flex-col gap-8">
            <FormSection title="Linked Objects" icon={<Link2 size={18} />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderInputs(LINKED_OBJ_INPUTS)}
              </div>
            </FormSection>
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
          <div className="bg-slate-50/50 p-6 rounded-3xl border border-dashed border-slate-200">
            <MetaFields
              value={ledger.meta}
              isEditMode={true}
              onChange={(meta) => setLedger((prev) => ({ ...prev, meta }))}
            />
          </div>
        </FormSection>

        <div className="flex justify-end pt-6 border-t border-slate-100">
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
