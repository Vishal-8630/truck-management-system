import { useEffect, useRef, useState } from "react";
import styles from "./NewLedger.module.scss";
import { EmptyLedgerEntry, type LedgerType } from "../../../types/ledger";
import type { InputType, Option } from "../../NewBillingEntry/constants";
import FormSection from "../../../components/FormSection";
import FormInput from "../../../components/FormInput";
import { useSelector } from "react-redux";
import {
  fetchJourneyEntriesAsync,
  journeySelectors,
} from "../../../features/journey";
import {
  fetchTrucksEntriesAsync,
  truckSelectors,
} from "../../../features/truck";
import {
  driverSelectors,
  fetchDriverEntriesAsync,
} from "../../../features/driver";
import {
  billingPartySelectors,
  fetchBillingPartiesAsync,
} from "../../../features/billingParty";
import {
  fetchSettlementsAsync,
  settlementSelectors,
} from "../../../features/settlement";
import {
  fetchVehicleEntriesAsync,
  vehicleEntrySelectors,
} from "../../../features/vehicleEntry";
import type { AppDispatch } from "../../../app/store";
import { useDispatch } from "react-redux";
import { EmptyJourneyType, type JourneyType } from "../../../types/journey";
import { EmptyTruckType, type TruckType } from "../../../types/truck";
import { EmptyDriverType, type DriverType } from "../../../types/driver";
import {
  EmptyBillingParty,
  type BillingPartyType,
} from "../../../types/billingParty";
import {
  EmptySettlementType,
  type SettlementType,
} from "../../../types/settlement";
import {
  EmptyVehicleEntry,
  type VehicleEntryType,
} from "../../../types/vehicleEntry";
import { formatDate } from "../../../utils/formatDate";
import {
  LEDGER_CATEGORIES,
  LEDGER_PAYMENT_MODES,
  LEDGER_REFERENCE_TYPES,
  LEDGER_TRANSACTION_TYPES,
} from "../ledgerConstants";
import MetaFields from "../../../components/MetaFields";
import { addMessage } from "../../../features/message";
import { addLedgerEntryAsync } from "../../../features/ledger";
import { useNavigate } from "react-router-dom";

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
  { type: "select", label: "Transaction Type", name: "transaction_type" },
  {
    type: "textarea",
    label: "Description",
    name: "description",
  },
];

const LEDGER_MONEY_INPUTS: InputType[] = [
  { type: "number", label: "Debit", name: "debit" },
  { type: "number", label: "Credit", name: "credit" },
  { type: "select", label: "Payment Mode", name: "payment_mode" },
];

const LEDGER_REFERENCE_INPUTS: InputType[] = [
  { type: "select", label: "Reference Type", name: "reference_type" },
  { type: "text", label: "Reference Number", name: "reference_no" },
  { type: "textarea", label: "Notes", name: "notes" },
];

const NewLedger = () => {
  const [ledger, setLedger] =
    useState<Omit<LedgerType, "_id">>(EmptyLedgerEntry);

  const errorsRef = useRef<Record<string, string>>({});
  const [, forceRender] = useState({});

  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const journies = useSelector(journeySelectors.selectAll);
  const trucks = useSelector(truckSelectors.selectAll);
  const drivers = useSelector(driverSelectors.selectAll);
  const parties = useSelector(billingPartySelectors.selectAll);
  const settlements = useSelector(settlementSelectors.selectAll);
  const vehicleEntries = useSelector(vehicleEntrySelectors.selectAll);

  useEffect(() => {
    dispatch(fetchJourneyEntriesAsync());
    dispatch(fetchTrucksEntriesAsync());
    dispatch(fetchDriverEntriesAsync());
    dispatch(fetchBillingPartiesAsync());
    dispatch(fetchSettlementsAsync());
    dispatch(fetchVehicleEntriesAsync());
  }, [dispatch]);

  const resetObjError = () => {
    errorsRef.current["journey"] = "";
    errorsRef.current["truck"] = "";
    errorsRef.current["driver"] = "";
    errorsRef.current["party"] = "";
    errorsRef.current["settlement"] = "";
    errorsRef.current["vehicle_entry"] = "";
  };

  const resetObjValues = () => {
    setLedger((prev) => ({
      ...prev,
      journey: EmptyJourneyType,
      truck: EmptyTruckType,
      driver: EmptyDriverType,
      party: EmptyBillingParty,
      settlement: EmptySettlementType,
      vehicle_entry: EmptyVehicleEntry
    }));
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    if (errorsRef.current[name]) {
      if (name === "debit" || name === "credit") {
        errorsRef.current["debit"] = "";
        errorsRef.current["credit"] = "";
      } else {
        errorsRef.current[name] = "";
      }
      forceRender({});
    }

    setLedger((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (
    val: string,
    name: string,
    mode: "select" | "search"
  ) => {
    if (mode === "select") {
      if (name === "category") {
        resetObjError();
        resetObjValues();
      }
      setLedger((prev) => ({ ...prev, [name]: val }));
    } else {
      switch (name) {
        case "journey": {
          const journey =
            val !== "" ? journies.find((j) => j._id === val) : EmptyJourneyType;
          const driver = journey?.driver;
          const truck = journey?.truck;
          setLedger((prev) => ({ ...prev, journey, driver, truck }));
          errorsRef.current["journey"] = "";
          break;
        }
        case "truck": {
          const truck =
            val !== ""
              ? trucks.find((t) => t._id === val)
              : EmptyTruckType;
          errorsRef.current["truck"] = "";
          setLedger((prev) => ({ ...prev, truck }));
          break;
        }
        case "driver": {
          const driver =
            val !== "" ? drivers.find((d) => d._id === val) : EmptyDriverType;
          errorsRef.current["driver"] = "";
          setLedger((prev) => ({ ...prev, driver }));
          break;
        }
        case "party": {
          const party =
            val !== ""
              ? parties.find((p) => p._id === val)
              : EmptyBillingParty;
          errorsRef.current["party"] = "";
          setLedger((prev) => ({ ...prev, party }));
          break;
        }
        case "settlement": {
          const settlement =
            val !== ""
              ? settlements.find((s) => s._id === val)
              : EmptySettlementType;
          errorsRef.current["settlement"] = "";
          setLedger((prev) => ({ ...prev, settlement }));
          break;
        }
        case "vehicle_entry": {
          const vehicleEntry =
            val !== ""
              ? vehicleEntries.find((ve) => ve._id === val)
              : EmptyVehicleEntry;
          errorsRef.current["vehicle_entry"] = "";
          setLedger((prev) => ({ ...prev, vehicle_entry: vehicleEntry }));
          break;
        }
      }
    }
  };

  const fetchOptions = (search: string, field: string): Option[] => {
    switch (field) {
      case "journey": {
        const filteredJournies = journies.filter((j) => {
          if (
            j.truck.truck_no.toLowerCase().includes(search.toLowerCase()) ||
            j.driver.name.toLowerCase().includes(search.toLowerCase()) ||
            j.from.toLowerCase().includes(search.toLowerCase()) ||
            j.to.toLowerCase().includes(search.toLowerCase())
          ) {
            return true;
          }
          return false;
        });
        if (filteredJournies.length > 0) {
          const options: Option[] = filteredJournies.map((j: JourneyType) => ({
            label: `${j.truck.truck_no} | ${j.driver.name} | ${j.from} | ${
              j.to
            } | ${formatDate(new Date(j.journey_start_date))}`,
            value: j._id,
          }));
          return options;
        } else {
          return [];
        }
      }
      case "truck": {
        const filteredTrucks = trucks.filter((t) =>
          t.truck_no.toLowerCase().includes(search.toLowerCase())
        );
        if (filteredTrucks.length > 0) {
          const options: Option[] = filteredTrucks.map((t: TruckType) => ({
            label: t.truck_no,
            value: t._id,
          }));
          return options;
        } else {
          return [];
        }
      }
      case "driver": {
        const filteredDrivers = drivers.filter((d) =>
          d.name.toLowerCase().includes(search.toLowerCase())
        );
        if (filteredDrivers.length > 0) {
          const options: Option[] = filteredDrivers.map((d: DriverType) => ({
            label: d.name,
            value: d._id,
          }));
          return options;
        } else {
          return [];
        }
      }
      case "party": {
        const filteredParties = parties.filter((p) =>
          p.name.toLowerCase().includes(search.toLowerCase())
        );
        if (filteredParties.length > 0) {
          const options: Option[] = filteredParties.map(
            (p: BillingPartyType) => ({
              label: p.name,
              value: p._id,
            })
          );
          return options;
        } else {
          return [];
        }
      }
      case "settlement": {
        const filteredSettlements = settlements.filter((s) =>
          s.driver.name.toLowerCase().includes(search.toLowerCase())
        );
        if (filteredSettlements.length > 0) {
          const options: Option[] = filteredSettlements.map(
            (s: SettlementType) => ({
              label: `${s.driver.name} | ${formatDate(
                new Date(s.period.from)
              )} | ${formatDate(new Date(s.period.to))}`,
              value: s._id,
            })
          );
          return options;
        } else {
          return [];
        }
      }
      case "vehicle_entry": {
        const filteredVehicleEntries = vehicleEntries.filter((ve) => {
          if (
            ve.vehicle_no.toLowerCase().includes(search.toLowerCase()) ||
            ve.from.toLowerCase().includes(search.toLowerCase()) ||
            ve.to.toLowerCase().includes(search.toLowerCase())
          ) {
            return true;
          }
          return false;
        });
        if (filteredVehicleEntries.length > 0) {
          const options: Option[] = filteredVehicleEntries.map(
            (ve: VehicleEntryType) => ({
              label: `${ve.vehicle_no} | ${ve.from} | ${ve.to}`,
              value: ve._id,
            })
          );
          return options;
        } else {
          return [];
        }
      }
      default:
        return [];
    }
  };

  const handleLedgerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const resultAction = await dispatch(addLedgerEntryAsync(ledger));
      if (addLedgerEntryAsync.fulfilled.match(resultAction)) {
        dispatch(
          addMessage({
            type: "success",
            text: "New Ledger entry created successfully",
          })
        );
        navigate("/ledger/all-ledgers");
      } else if (addLedgerEntryAsync.rejected.match(resultAction)) {
        const errors = resultAction.payload;
        if (errors && Object.keys(errors).length > 0) {
          errorsRef.current = errors;
          forceRender({});
        }
        dispatch(
          addMessage({
            type: "error",
            text: errors?.general || "Failed to add new ledger entry",
          })
        );
      }
    } catch (error: any) {
      dispatch(addMessage({ type: "error", text: "Something went wrong" }));
    }
  };

  /** -------------------- Render Inputs -------------------- **/
  const renderInputs = (inputs: InputType[]) => {
    return inputs.map((input) => {
      let options: Option[] = [];
      let selectMode: "select" | "search" = "select";
      let error: string = errorsRef.current[input.name] || "";
      let value: string = String((ledger as any)[input.name] || "");
      let placeholder: string = input.label;
      let inputRef:
        | React.RefObject<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
          >
        | undefined = undefined;

      if (input.name === "journey") {
        placeholder = "Select a Journey";
        value = ledger?.journey?._id || "";
        selectMode = "search";
      }

      if (input.name === "truck") {
        placeholder = "Select a Truck";
        value = ledger?.truck?._id || "";
        selectMode = "search";
      }

      if (input.name === "driver") {
        placeholder = "Select a Driver";
        value = ledger?.driver?._id || "";
        selectMode = "search";
      }

      if (input.name === "party") {
        placeholder = "Select a Party";
        value = ledger?.party?._id || "";
        selectMode = "search";
      }

      if (input.name === "settlement") {
        placeholder = "Select a Settlement";
        value = ledger?.settlement?._id || "";
        selectMode = "search";
      }

      if (input.name === "vehicle_entry") {
        placeholder = "Select a Vehicle Entry";
        value = ledger?.vehicle_entry?._id || "";
        selectMode = "search";
      }

      if (input.name === "category") {
        placeholder = "Select a Category";
        value = ledger?.category || "";
        selectMode = "select";
        options = LEDGER_CATEGORIES.map((c) => ({
          label: c,
          value: c,
        }));
      }

      if (input.name === "transaction_type") {
        placeholder = "Select a Transaction Type";
        value = ledger?.transaction_type || "";
        selectMode = "select";
        options = LEDGER_TRANSACTION_TYPES.map((t) => ({
          label: t,
          value: t,
        }));
      }

      if (input.name === "payment_mode") {
        placeholder = "Select a Payment Mode";
        value = ledger?.payment_mode || "";
        options = LEDGER_PAYMENT_MODES.map((p) => ({
          label: p,
          value: p,
        }));
      }

      if (input.name === "reference_type") {
        placeholder = "Select a Reference Type";
        value = ledger?.reference_type || "";
        options = LEDGER_REFERENCE_TYPES.map((r) => ({
          label: r,
          value: r,
        }));
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
          options={options}
          error={error}
          selectMode={selectMode}
          inputType={input.inputType}
          inputRef={inputRef || undefined}
          onChange={handleChange}
          onSelectChange={(val, name, mode) =>
            handleSelectChange(val, name, mode)
          }
          fetchOptions={fetchOptions}
        />
      );
    });
  };

  return (
    <div className={styles.ledgerContainer}>
      <h1 className={styles.heading}>New Ledger Entry</h1>
      <form className={styles.ledgerForm} onSubmit={handleLedgerSubmit}>
        <div className={styles.inputArea}>
          <FormSection title="Linked Information">
            {renderInputs(LINKED_OBJ_INPUTS)}
          </FormSection>
          <FormSection title="Ledger Information">
            {renderInputs(LEDGER_INFO_INPUTS)}
          </FormSection>
          <FormSection title="Payment Information">
            {renderInputs(LEDGER_MONEY_INPUTS)}
          </FormSection>
          <FormSection title="Reference Information">
            {renderInputs(LEDGER_REFERENCE_INPUTS)}
          </FormSection>
          <FormSection title="Additional Information (Meta)">
            <MetaFields
              value={ledger.meta}
              isEditMode={true}
              onChange={(meta) =>
                setLedger((prev) => ({
                  ...prev,
                  meta,
                }))
              }
            />
          </FormSection>
        </div>
        <div className={styles.buttonArea}>
          <button type="submit" className={styles.submitBtn}>
            Add Ledger
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewLedger;
