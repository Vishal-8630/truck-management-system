import React, { useEffect, useRef, useState } from "react";
import styles from "./NewJourneyEntry.module.scss";
import { EmptyJourneyType, type JourneyType } from "../../../types/journey";
import type { InputType, Option } from "../../NewBillingEntry/constants";
import FormSection from "../../../components/FormSection";
import FormInput from "../../../components/FormInput";
import type { AppDispatch } from "../../../app/store";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
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

const JOURNEY_FIELD_INPUTS: InputType[] = [
  { type: "select", label: "Truck", name: "truck" },
  { type: "select", label: "Driver", name: "driver" },
  { type: "input", label: "From", name: "from", inputType: "text" },
  { type: "input", label: "To", name: "to", inputType: "text" },
  {
    type: "number",
    label: "Journey Days",
    name: "journey_days",
    inputType: "number",
  },
  {
    type: "number",
    label: "Distance (Km)",
    name: "distance_km",
    inputType: "number",
  },
  {
    type: "number",
    label: "Weight (Kg)",
    name: "loaded_weight",
    inputType: "number",
  },
];

const NewJourneyEntry = () => {
  const dispatch: AppDispatch = useDispatch();

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
        name === "truck"
          ? setSelectedTruck(
              trucks.find((t) => t.truck_no === val) || selectedTruck
            )
          : setSelectDriver(
              drivers.find((d) => d.name === val) || selectedDriver
            );
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
        dispatch(addMessage({ type: "success", text: "Journey added successfully" }));
      } else if (addJourneyEntryAsync.rejected.match(resultAction)) {
        const errors = resultAction.payload;
        if (errors) {
          console.log("Errors while adding new journey", errors);
          dispatch(addMessage({ type: "error", text: "Failed to add new journey" }));
        }
      }
    } catch (error: any) {
      console.log("Error: ", error);
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
      let inputRef: React.RefObject<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      > | undefined = undefined;

      if (input.name === 'truck') {
        placeholder = "Select a Truck";
        value = selectedTruck.truck_no;
        inputRef = truckRef as React.RefObject<HTMLInputElement>;
      }

      if (input.name === 'driver') {
        placeholder = "Select a Driver";
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
        />
      );
    });
  };

  return (
    <div className={styles.newJourneyContainer}>
      <h1 className={styles.heading}>All Truck Journey</h1>
      <form className={styles.journeyForm} onSubmit={handleSubmit}>
        <FormSection title="Journey Details">
          {renderInputs(JOURNEY_FIELD_INPUTS)}
          <button className={styles.btn}>Add Journey</button>
        </FormSection>
      </form>
    </div>
  );
};

export default NewJourneyEntry;
