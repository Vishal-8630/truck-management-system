import React, { useEffect, useRef, useState } from "react";
import {
  EmptyVehicleEntry,
  type VehicleEntryType,
} from "@/types/vehicleEntry";
import { useMessageStore } from "@/store/useMessageStore";
import FormInput from "@/components/FormInput";
import FormSection from "@/components/FormSection";
import Button from "@/components/Button";
import { useNavigate } from "react-router-dom";
import { useVehicleEntries } from "@/hooks/useLedgers";
import { useParties } from "@/hooks/useParties";
import { Wallet, Clock, UserSquare, Plus, ArrowLeft, Milestone, Calculator } from "lucide-react";

interface InputType {
  type: string;
  label: string;
  name: string;
  inputType?: string;
  options?: string[];
}

type Option = { label: string; value: string };

const VEHICLE_INPUTS: InputType[] = [
  { type: "date", label: "Log Date", name: "date" },
  { type: "input", label: "Vehicle Registration", name: "vehicle_no" },
  { type: "textarea", label: "Origin City", name: "from" },
  { type: "textarea", label: "Destination City", name: "to" },
];

const BALANCE_INPUTS: InputType[] = [
  { type: "number", label: "Freight", name: "freight", inputType: "number" },
  {
    type: "number",
    label: "Driver Cash",
    name: "driver_cash",
    inputType: "number",
  },
  { type: "number", label: "Dala Charges", name: "dala", inputType: "number" },
  { type: "number", label: "Kamisan", name: "kamisan", inputType: "number" },
  { type: "number", label: "In AC Amount", name: "in_ac", inputType: "number" },
  { type: "input", label: "Pod Stock Ref", name: "pod_stock" },
  { type: "number", label: "Calculated Balance", name: "balance", inputType: "number" },
];

const HALTING_INPUTS: InputType[] = [
  { type: "number", label: "Halting Charges", name: "halting", inputType: "number" },
  { type: "date", label: "In-Date", name: "halting_in_date" },
  { type: "date", label: "Out-Date", name: "halting_out_date" },
];

const PARTY_DETAIL: InputType[] = [
  { type: "select", label: "Select Party", name: "party_name" },
  { type: "input", label: "Owner Name", name: "owner", inputType: "text" },
  {
    name: "status",
    label: "Record Status",
    type: "select",
  },
];

const NewVehicleEntry = () => {
  const [vehicleEntry, setVehicleEntry] =
    useState<VehicleEntryType>(EmptyVehicleEntry);
  const { useBalancePartiesQuery } = useParties();
  const { data: balanceParties = [] } = useBalancePartiesQuery();
  const { useAddVehicleEntryMutation } = useVehicleEntries();
  const addVehicleEntryMutation = useAddVehicleEntryMutation();
  const { addMessage } = useMessageStore();

  const errorsRef = useRef<Record<string, string>>({});
  const partyRef = useRef<HTMLInputElement>(null!);
  const [, forceRender] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    const freight = Number(vehicleEntry.freight) || 0;
    const driver_cash = Number(vehicleEntry.driver_cash) || 0;
    const dala = Number(vehicleEntry.dala) || 0;
    const kamisan = Number(vehicleEntry.kamisan) || 0;
    const in_ac = Number(vehicleEntry.in_ac) || 0;
    const halting = Number(vehicleEntry.halting) || 0;
    const balance = freight - (driver_cash + dala + kamisan + in_ac) + halting;
    setVehicleEntry((prev) => ({ ...prev, balance: String(balance) }));
  }, [
    vehicleEntry.freight,
    vehicleEntry.driver_cash,
    vehicleEntry.dala,
    vehicleEntry.kamisan,
    vehicleEntry.in_ac,
    vehicleEntry.halting,
  ]);

  const handleChange = (value: string, name: string) => {
    if (name === "party_name") {
      if (!value) {
        setVehicleEntry((prev) => ({
          ...prev,
          balance_party: { _id: "", party_name: "" },
        }));
        return;
      } else {
        const party = balanceParties.find((p: any) => p.party_name === value)!;
        setVehicleEntry((prev) => ({
          ...prev,
          balance_party: party,
        }));
      }
      return;
    }
    if (errorsRef.current[name]) {
      errorsRef.current[name] = "";
      forceRender({});
    }
    setVehicleEntry((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (
    val: string,
    name: string,
    mode: "select" | "search"
  ) => {
    if (mode === "select") {
      setVehicleEntry((prev) => ({ ...prev, [name]: val }));
    } else {
      if (val === "") {
        setVehicleEntry((prev) => ({
          ...prev,
          balance_party: { _id: "", party_name: "" },
        }));
      } else {
        const party = balanceParties.find((p: any) => p._id === val);
        setVehicleEntry((prev) => ({
          ...prev,
          balance_party: party || { _id: "", party_name: "" },
        }));
      }
    }
  };

  const fetchOptions = (search: string, field: string): Option[] => {
    void field;
    const s = search.trim().toLowerCase();
    const uniqueOptionsMap = new Map<string, any>();
    
    for (const party of balanceParties) {
      const label = party.party_name;
      
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleEntry.balance_party?.party_name?.trim()) {
      errorsRef.current["party_name"] = "Please select a party";
      addMessage({ type: "error", text: "Please select a party" });
      forceRender({});
      partyRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      partyRef.current?.focus();
      return;
    }
    try {
      await addVehicleEntryMutation.mutateAsync(vehicleEntry);
      addMessage({
        type: "success",
        text: "New vehicle entry added successfully",
      });
      navigate("/vehicle-entry/all-vehicle-entries");
    } catch (err: any) {
      const serverErrors = err.response?.data?.errors || err;
      if (serverErrors && Object.keys(serverErrors).length > 0) {
        errorsRef.current = serverErrors;
        forceRender({});
      }
      addMessage({
        type: "error",
        text: serverErrors.message || serverErrors.general || "Please fill all the required fields",
      });
    }
  };

  const renderInputs = (inputs: InputType[]) => {
    return inputs.map((input) => {
      let options: Option[] = [];
      let selectMode: "select" | "search" = "select";
      let value: string = String(
        vehicleEntry[input.name as keyof VehicleEntryType] || ""
      );
      let placeholder: string = input.label;

      if (input.name === "status") {
        options = [
          { label: "Pending", value: "Pending" },
          { label: "Received", value: "Received" },
        ];
        value = vehicleEntry.status;
        placeholder = "Select Status";
      }


      if (input.name === "party_name") {
        value = vehicleEntry.balance_party?.party_name || "";
        placeholder = "Search Party...";
        selectMode = "search";
      }

      return (
        <FormInput
          key={input.name}
          type={input.type}
          id={input.name}
          label={input.label}
          name={input.name}
          value={value}
          placeholder={placeholder}
          selectMode={selectMode}
          options={options}
          inputType={input.inputType}
          error={errorsRef.current[input.name]}
          onChange={handleChange}
          onSelectChange={handleSelectChange}
          fetchOptions={fetchOptions}
          inputRef={input.name === "party_name" ? partyRef : undefined}
        />
      );
    });
  };

  return (
    <div className="flex flex-col gap-10 pb-20">
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
            New Vehicle <span className="text-blue-600">Entry</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg">Log a new trip for tracking.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 flex flex-col gap-8">
            <FormSection title="Movement & Vehicle" icon={<Milestone size={18} />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderInputs(VEHICLE_INPUTS)}
              </div>
            </FormSection>

            <FormSection title="Financial Settlement" icon={<Wallet size={18} />}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {renderInputs(BALANCE_INPUTS)}
              </div>
            </FormSection>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-8 sticky top-24">
            <FormSection title="Halting & Delays" icon={<Clock size={18} />}>
              <div className="flex flex-col gap-6">
                {renderInputs(HALTING_INPUTS)}
              </div>
            </FormSection>

            <FormSection title="Party Association" icon={<UserSquare size={18} />}>
              <div className="flex flex-col gap-6">
                {renderInputs(PARTY_DETAIL)}
              </div>
            </FormSection>

            {/* Calculation Breakdown Note */}
            <div className="bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-[2rem] p-6 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <Calculator size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Calculation Guide</span>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-bold uppercase tracking-tighter">Gross Amount</span>
                  <span className="text-slate-900 dark:text-slate-100 font-black">Freight + Halting</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-bold uppercase tracking-tighter">Total Deductions</span>
                  <span className="text-slate-900 dark:text-slate-100 font-black">Cash + Dala + Kamisan + A/C</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-bold uppercase tracking-tighter">Net Balance</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-black">Gross - Deductions</span>
                </div>
              </div>
              <div className="pt-3 border-t border-indigo-100 dark:border-indigo-900/30">
                <p className="text-[10px] text-indigo-500/70 dark:text-indigo-400/60 font-medium italic leading-relaxed">
                  * Net Balance is the final amount payable to the party after accounting for all expenses and haltings.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-slate-100">
          <Button
            type="submit"
            isLoading={addVehicleEntryMutation.isPending}
            icon={<Plus size={20} />}
            className="w-fit px-12"
          >
            Add Vehicle Entry
          </Button>
        </div>
      </form >
    </div >
  );
};

export default NewVehicleEntry;
