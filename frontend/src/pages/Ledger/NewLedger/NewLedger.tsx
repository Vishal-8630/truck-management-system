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

const LIKED_OBJ_INPUTS: InputType[] = [
  { type: "search", label: "Journey", name: "journey" },
  { type: "search", label: "Truck", name: "truck" },
  { type: "search", label: "Driver", name: "driver" },
  { type: "search", label: "Party", name: "party" },
  { type: "search", label: "Settlement", name: "settlement" },
  { type: "search", label: "Vehicle Entry", name: "vehicle_entry" },
];

const NewLedger = () => {
  const [ledger, setLedger] =
    useState<Omit<LedgerType, "_id">>(EmptyLedgerEntry);

  const errorsRef = useRef<Record<string, string>>({});
  const [, forceRender] = useState({});

  const dispatch: AppDispatch = useDispatch();

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

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    if (errorsRef.current[name]) {
      errorsRef.current[name] = "";
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
      setLedger((prev) => ({ ...prev, [name]: val }));
    } else {
      switch (name) {
        case "journey": {
          const journey =
            val !== "" ? journies.find((j) => j._id === val) : EmptyJourneyType;
          setLedger((prev) => ({ ...prev, journey }));
          break;
        }
        case "truck": {
          const truck =
            val !== ""
              ? trucks.find((t) => t.truck_no === val)
              : EmptyTruckType;
          setLedger((prev) => ({ ...prev, truck }));
          break;
        }
        case "driver": {
          const driver =
            val !== "" ? drivers.find((d) => d.name === val) : EmptyDriverType;
          setLedger((prev) => ({ ...prev, driver }));
          break;
        }
        case "party": {
          const party =
            val !== ""
              ? parties.find((p) => p.name === val)
              : EmptyBillingParty;
          setLedger((prev) => ({ ...prev, party }));
          break;
        }
        case "settlement": {
          const settlement =
            val !== ""
              ? settlements.find((s) => s._id === val)
              : EmptySettlementType;
          setLedger((prev) => ({ ...prev, settlement }));
          break;
        }
        case "vehicle_entry": {
          const vehicleEntry =
            val !== ""
              ? vehicleEntries.find((ve) => ve._id === val)
              : EmptyVehicleEntry;
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
            value: t.truck_no,
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
            value: d.name,
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
              value: p.name,
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
        // value = `${ledger.journey?.truck?.truck_no} | ${ledger.journey?.driver?.name}`;
      }

      if (input.name === "truck") {
        placeholder = "Select a Truck";
      }

      if (input.name === "driver") {
      }

      if (input.name === "party") {
      }

      if (input.name === "settlement") {
      }

      if (input.name === "vehicle_entry") {
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
      <form className={styles.ledgerForm}>
        <FormSection title="Linked Information">
          {renderInputs(LIKED_OBJ_INPUTS)}
        </FormSection>
      </form>
    </div>
  );
};

export default NewLedger;
