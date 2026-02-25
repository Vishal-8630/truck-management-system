import React, { useEffect, useRef, useState } from "react";
import { EmptyJourneyType, type JourneyType } from "../../../types/journey";
import type { InputType, Option } from "../../NewBillingEntry/constants";
import FormSection from "../../../components/FormSection";
import FormInput from "../../../components/FormInput";
import type { AppDispatch } from "../../../app/store";
import { useDispatch, useSelector } from "react-redux";
import { addJourneyEntryAsync } from "../../../features/journey";
import {
  fetchTrucksEntriesAsync,
  truckSelectors,
} from "../../../features/truck";
import {
  driverSelectors,
  fetchDriverEntriesAsync,
} from "../../../features/driver";
import { EmptyTruckType, type TruckType } from "../../../types/truck";
import { EmptyDriverType, type DriverType } from "../../../types/driver";
import { addMessage } from "../../../features/message";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Truck,
  User,
  MapPin,
  Navigation,
  Calendar,
  Wallet,
  TrendingUp,
  ArrowLeft
} from "lucide-react";

const JOURNEY_FIELD_INPUTS: InputType[] = [
  { type: "select", label: "Truck", name: "truck", icon: <Truck size={18} /> },
  { type: "select", label: "Driver", name: "driver", icon: <User size={18} /> },
  { type: "input", label: "From", name: "from", inputType: "text", icon: <MapPin size={18} /> },
  { type: "input", label: "To", name: "to", inputType: "text", icon: <Navigation size={18} /> },
  {
    type: "input",
    label: "Starting Kms",
    name: "starting_kms",
    inputType: "number",
    icon: <TrendingUp size={18} />
  },
  {
    type: "number",
    label: "Journey Days",
    name: "journey_days",
    inputType: "number",
    icon: <Calendar size={18} />
  },
  {
    type: "number",
    label: "Starting Cash",
    name: "journey_starting_cash",
    inputType: "number",
    icon: <Wallet size={18} />
  },
  {
    type: "number",
    label: "Truck Mileage",
    name: "average_mileage",
    inputType: "number",
    icon: <Truck size={18} />
  },
];

const NewJourneyEntry = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const [journey, setJourney] =
    useState<Omit<JourneyType, "_id">>(EmptyJourneyType);

  const errorsRef = useRef<Record<string, string>>({});
  const [, forceRender] = useState({});

  const trucks = useSelector(truckSelectors.selectAll);
  const drivers = useSelector(driverSelectors.selectAll);

  const [selectedTruck, setSelectedTruck] = useState<TruckType>(EmptyTruckType);
  const [selectedDriver, setSelectDriver] =
    useState<DriverType>(EmptyDriverType);

  const truckRef = useRef<
    HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
  >(null);
  const driverRef = useRef<
    HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
  >(null);

  useEffect(() => {
    dispatch(fetchTrucksEntriesAsync());
    dispatch(fetchDriverEntriesAsync());
  }, [dispatch]);

  useEffect(() => {
    setJourney((prev) => ({ ...prev, truck: selectedTruck }));
  }, [selectedTruck]);

  useEffect(() => {
    setJourney((prev) => ({ ...prev, driver: selectedDriver }));
  }, [selectedDriver]);

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

    setJourney((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (
    val: string,
    name: string,
    mode: "select" | "search"
  ) => {
    if (mode === "search") {
      if (val === "") {
        name === "truck"
          ? setSelectedTruck(EmptyTruckType)
          : setSelectDriver(EmptyDriverType);
      } else {
        if (name === "truck") {
          setSelectedTruck(
            trucks.find((t) => t.truck_no === val) || selectedTruck
          );
          errorsRef.current.truck = "";
        } else {
          setSelectDriver(
            drivers.find((d) => d.name === val) || selectedDriver
          );
          errorsRef.current.driver = "";
        }
      }
    }
  };

  const fetchOptions = (search: string, field: string): Option[] => {
    if (field === "truck") {
      const filteredTrucks = trucks.filter((t) =>
        t.truck_no.toLowerCase().includes(search.toLowerCase())
      );
      if (filteredTrucks.length > 0) {
        const options: Option[] = filteredTrucks.map((t: TruckType) => ({
          label: t.truck_no,
          value: t.truck_no,
        }));
        return options;
      }
    } else if (field === "driver") {
      const filteredDrivers = drivers.filter((d) =>
        d.name.toLowerCase().includes(search.toLowerCase())
      );
      if (filteredDrivers.length > 0) {
        const options: Option[] = filteredDrivers.map((d: DriverType) => ({
          label: d.name,
          value: d.name,
        }));
        return options;
      }
    }
    return [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const resultAction = await dispatch(addJourneyEntryAsync(journey));
      if (addJourneyEntryAsync.fulfilled.match(resultAction)) {
        dispatch(
          addMessage({ type: "success", text: "Journey added successfully" })
        );
        navigate("/journey/all-journey-entries");
      } else if (addJourneyEntryAsync.rejected.match(resultAction)) {
        const errors = resultAction.payload;
        if (errors && !errors?.general && Object.keys(errors)?.length > 0) {
          errorsRef.current = errors;
          forceRender({});
        }
        dispatch(
          addMessage({
            type: "error",
            text: errors?.general || "Failed to add new journey",
          })
        );
      }
    } catch (error: any) {
      dispatch(addMessage({ type: "error", text: "Something went wrong" }));
    }
  };

  const renderInputs = (inputs: InputType[]) => {
    return inputs.map((input) => {
      let error: string = errorsRef.current[input.name] || "";
      let value: string = String(
        journey[input.name as keyof Omit<JourneyType, "_id">] || ""
      );
      let placeholder: string = input.label;
      let inputRef:
        | React.RefObject<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
        | undefined = undefined;

      if (input.name === "truck") {
        placeholder = "Search truck registration...";
        value = selectedTruck.truck_no;
        inputRef = truckRef as React.RefObject<HTMLInputElement>;
      }

      if (input.name === "driver") {
        placeholder = "Search driver by name...";
        value = selectedDriver.name;
        inputRef = driverRef as React.RefObject<HTMLInputElement>;
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
          options={[]}
          error={error}
          selectMode="search"
          inputType={input.inputType}
          inputRef={inputRef}
          onChange={handleInputChange}
          onSelectChange={handleSelectChange}
          fetchOptions={fetchOptions}
          icon={input.icon}
        />
      );
    });
  };

  return (
    <div className="flex flex-col gap-10 pb-20 max-w-4xl mx-auto">
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
            New <span className="text-indigo-600">Journey</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg">Initialize a new trip with truck and driver details.</p>
        </div>
      </div>

      <form className="grid grid-cols-1 gap-8" onSubmit={handleSubmit}>
        <div className="card-premium p-8 lg:p-10 flex flex-col gap-10">
          <FormSection title="Journey Information" icon={<Navigation size={18} />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {renderInputs(JOURNEY_FIELD_INPUTS)}
            </div>
          </FormSection>

          <div className="flex justify-end pt-6 border-t border-slate-100">
            <button
              type="submit"
              className="w-full lg:w-fit px-12 py-5 bg-indigo-600 text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:translate-y-0"
            >
              <Plus size={20} strokeWidth={3} />
              Start Journey
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewJourneyEntry;
