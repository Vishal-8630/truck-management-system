import React, { useEffect, useRef, useState } from "react";
import {
  EmptyVehicleEntry,
  type VehicleEntryType,
} from "../../types/vehicleEntry";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import Loading from "../../components/Loading";
import { addMessage } from "../../features/message";
import FormInput from "../../components/FormInput";
import styles from "./NewVehicleEntry.module.scss";
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

interface InputType {
  type: string;
  label: string;
  name: string;
  inputType?: string;
  options?: string[];
}

type Option = { label: string; value: string };

const VEHICLE_INPUTS: InputType[] = [
  { type: "select", label: "Movement Type", name: "movementType" },
  { type: "date", label: "Date", name: "date" },
  { type: "input", label: "Vehicle No.", name: "vehicle_no" },
  { type: "textarea", label: "From", name: "from" },
  { type: "textarea", label: "To", name: "to" },
];

const BALANCE_INPUTS: InputType[] = [
  { type: "number", label: "Freight", name: "freight", inputType: "number" },
  {
    type: "number",
    label: "Driver Cash",
    name: "driver_cash",
    inputType: "number",
  },
  { type: "number", label: "Dala", name: "dala", inputType: "number" },
  { type: "number", label: "Kamisan", name: "kamisan", inputType: "number" },
  { type: "number", label: "In AC", name: "in_ac", inputType: "number" },
  { type: "input", label: "Pod Stock", name: "pod_stock" },
  { type: "number", label: "Balance", name: "balance", inputType: "number" },
];

const HALTING_INPUTS: InputType[] = [
  { type: "number", label: "Halting", name: "halting", inputType: "number" },
  { type: "date", label: "Halting In Date", name: "halting_in_date" },
  { type: "date", label: "Halting Out Date", name: "halting_out_date" },
];

const PARTY_DETAIL: InputType[] = [
  { type: "select", label: "Party Name", name: "party_name" },
  { type: "input", label: "Owner", name: "owner", inputType: "text" },
  {
    name: "status",
    label: "Status",
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
        const errors = resultAction.payload;
        if (errors && Object.keys(errors).length > 0) {
          errorsRef.current = errors;
          forceRender({});
        }
        dispatch(
          addMessage({
            type: "error",
            text: errors?.message || "Please fill all the require fields",
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
        placeholder = "";
      }

      if (input.name === "movementType") {
        options = [
          { label: "From DRL", value: "From DRL" },
          { label: "To DRL", value: "To DRL" },
        ];
        value = vehicleEntry.movementType;
        placeholder = "";
      }

      if (input.name === "party_name") {
        value = vehicleEntry.balance_party?.party_name || "";
        placeholder = "Select a Balance Party";
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
    <div className={styles.vehicleFormContainer}>
      <form className={styles.vehicleForm} onSubmit={handleSubmit}>
        <h1 className={styles.heading}>Add New Vehicle Entry</h1>
        <div className={styles.inputArea}>
          <FormSection title="Vehicle Details">
            {renderInputs(VEHICLE_INPUTS)}
          </FormSection>
          <FormSection title="Balance">
            {renderInputs(BALANCE_INPUTS)}
          </FormSection>
          <FormSection title="Halting Details">
            {renderInputs(HALTING_INPUTS)}
          </FormSection>
          <FormSection title="Party Details">
            {renderInputs(PARTY_DETAIL)}
          </FormSection>
        </div>
        <div className={styles.buttonContainer}>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            Add Vehicle Entry
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewVehicleEntry;
