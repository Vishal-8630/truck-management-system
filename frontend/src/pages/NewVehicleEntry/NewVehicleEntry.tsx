import React, { useEffect, useRef, useState } from "react";
import {
  EmptyVehicleEntry,
  type VehicleEntryType,
} from "../../types/vehicleEntry";
import { useDispatch, useSelector } from "react-redux";
import Loading from "../../components/Loading";
import { addMessage } from "../../features/message";
import FormInput from "../../components/FormInput";
import FormSection from "../../components/FormSection";
import { useNavigate } from "react-router-dom";
import {
  addVehicleEntryAsync,
  selectVehicleEntryLoading,
} from "../../features/vehicleEntry";
import type { AppDispatch } from "../../app/store";
import {
  balancePartySelectors,
  fetchBalanceParties,
} from "../../features/balanceParty";
import { Truck, Wallet, Clock, UserSquare, Plus, ArrowLeft, Navigation } from "lucide-react";

interface InputType {
  type: string;
  label: string;
  name: string;
  inputType?: string;
  options?: string[];
}

type Option = { label: string; value: string };

const VEHICLE_INPUTS: InputType[] = [
  { type: "select", label: "Movement", name: "movementType" },
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
  const balanceParties = useSelector(balancePartySelectors.selectAll);
  const errorsRef = useRef<Record<string, string>>({});
  const [, forceRender] = useState({});

  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const loading = useSelector(selectVehicleEntryLoading);

  useEffect(() => {
    dispatch(fetchBalanceParties());
  }, [dispatch]);

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

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    if (name === "party_name") {
      if (!value) {
        setVehicleEntry((prev) => ({
          ...prev,
          balance_party: { _id: "", party_name: "" },
        }));
        return;
      } else {
        const party = balanceParties.find((p) => p.party_name === value)!;
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
        const party = balanceParties.find((p) => p.party_name === val);
        setVehicleEntry((prev) => ({
          ...prev,
          balance_party: party || { _id: "", party_name: "" },
        }));
      }
    }
  };

  const fetchOptions = (search: string, field: string): Option[] => {
    void field;
    const fetchedBalanceParties = balanceParties.filter(
      (party) =>
        party.party_name &&
        party.party_name
          .toLocaleLowerCase()
          .includes(search.toLocaleLowerCase())
    );
    if (fetchedBalanceParties.length > 0) {
      const options: Option[] = fetchedBalanceParties.map((party) => ({
        label: party.party_name,
        value: party.party_name,
      }));
      return options;
    } else return [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleEntry.balance_party?.party_name?.trim()) {
      dispatch(addMessage({ type: "error", text: "Please select a party" }));
      return;
    }
    try {
      const resultAction = await dispatch(addVehicleEntryAsync(vehicleEntry));
      if (addVehicleEntryAsync.fulfilled.match(resultAction)) {
        dispatch(
          addMessage({
            type: "success",
            text: "New vehicle entry added successfully",
          })
        );
        navigate("/vehicle-entry/all-vehicle-entries");
      } else if (addVehicleEntryAsync.rejected.match(resultAction)) {
        const errors = resultAction.payload as Record<string, string>;
        if (errors && Object.keys(errors).length > 0) {
          errorsRef.current = errors;
          forceRender({});
        }
        dispatch(
          addMessage({
            type: "error",
            text: errors?.message || "Please fill all the required fields",
          })
        );
      }
    } catch {
      dispatch(addMessage({ type: "error", text: "Something went wrong" }));
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

      if (input.name === "movementType") {
        options = [
          { label: "From DRL", value: "From DRL" },
          { label: "To DRL", value: "To DRL" },
        ];
        value = vehicleEntry.movementType;
        placeholder = "Select Type";
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
        />
      );
    });
  };

  if (loading) return <Loading />;

  return (
    <div className="flex flex-col gap-10 pb-20">
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
            <Truck className="text-indigo-600 w-10 h-10 lg:w-12 lg:h-12" />
            New Vehicle <span className="text-indigo-600">Entry</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg">Log a new trip or logistics movement for tracking.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 flex flex-col gap-8">
            <FormSection title="Movement & Vehicle" icon={<Navigation size={18} />}>
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
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-slate-100">
          <button
            type="submit"
            disabled={loading}
            className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center gap-3 shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:translate-y-0"
          >
            <Plus size={20} />
            Add Vehicle Entry
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewVehicleEntry;

