import { useEffect, useRef, useState } from "react";
import { EmptyLedgerEntry, type LedgerType } from "../../../types/ledger";
import type { InputType, Option } from "../../NewBillingEntry/constants";
import FormSection from "../../../components/FormSection";
import FormInput from "../../../components/FormInput";
import { useSelector, useDispatch } from "react-redux";
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
  {
    type: "textarea",
    label: "Description",
    name: "description",
  },
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
            label: `${j.truck.truck_no} | ${j.driver.name} | ${j.from} | ${j.to
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
        const errors = resultAction.payload as Record<string, string>;
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
        placeholder = "Search Journey...";
        value = ledger?.journey?._id || "";
        selectMode = "search";
      }

      if (input.name === "truck") {
        placeholder = "Search Truck...";
        value = ledger?.truck?._id || "";
        selectMode = "search";
      }

      if (input.name === "driver") {
        placeholder = "Search Driver...";
        value = ledger?.driver?._id || "";
        selectMode = "search";
      }

      if (input.name === "party") {
        placeholder = "Search Party...";
        value = ledger?.party?._id || "";
        selectMode = "search";
      }

      if (input.name === "settlement") {
        placeholder = "Search Settlement...";
        value = ledger?.settlement?._id || "";
        selectMode = "search";
      }

      if (input.name === "vehicle_entry") {
        placeholder = "Search Vehicle Entry...";
        value = ledger?.vehicle_entry?._id || "";
        selectMode = "search";
      }

      if (input.name === "category") {
        placeholder = "Select Category";
        value = ledger?.category || "";
        selectMode = "select";
        options = LEDGER_CATEGORIES.map((c) => ({
          label: c,
          value: c,
        }));
      }

      if (input.name === "transaction_type") {
        placeholder = "Select Type";
        value = ledger?.transaction_type || "";
        selectMode = "select";
        options = LEDGER_TRANSACTION_TYPES.map((t) => ({
          label: t,
          value: t,
        }));
      }

      if (input.name === "payment_mode") {
        placeholder = "Select Mode";
        value = ledger?.payment_mode || "";
        options = LEDGER_PAYMENT_MODES.map((p) => ({
          label: p,
          value: p,
        }));
      }

      if (input.name === "reference_type") {
        placeholder = "Select Reference";
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
            <BookOpen className="text-indigo-600 w-10 h-10 lg:w-12 lg:h-12" />
            New Ledger <span className="text-indigo-600">Entry</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg">Record a new financial transaction in the company ledger.</p>
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
              <div className="flex flex-col gap-6">
                {renderInputs(LEDGER_MONEY_INPUTS)}
              </div>
            </FormSection>

            <FormSection title="Traceability" icon={<Sparkles size={18} />}>
              <div className="flex flex-col gap-6">
                {renderInputs(LEDGER_REFERENCE_INPUTS)}
              </div>
            </FormSection>
          </div>
        </div>

        <FormSection title="Additional Metadata" icon={<Plus size={18} />}>
          <div className="bg-slate-50/50 p-6 rounded-2xl border border-dashed border-slate-200">
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
          </div>
        </FormSection>

        <div className="flex justify-end pt-6 border-t border-slate-100">
          <button
            type="submit"
            className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center gap-3 shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:translate-y-0"
          >
            <Plus size={20} />
            Create Ledger Entry
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewLedger;

