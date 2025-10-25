import { useState } from "react";
import FormInput from "../../../components/FormInput";
import FormSection from "../../../components/FormSection";
import styles from "./NewTruckEntry.module.scss";
import { EmptyTruckType, type TruckType } from "../../../types/truck";
import type { AppDispatch } from "../../../app/store";
import { useDispatch } from "react-redux";
import { addMessage } from "../../../features/message";
import { addTruckEntryAsync } from "../../../features/truck";
import FormInputImage from "../../../components/FormInputImage";

const DOCUMENTS = [
  {
    label: "Fitness Document",
    field: "fitness_doc",
    expiry_label: "Fitness Document Expiry",
    expiry_field: "fitness_doc_expiry",
  },
  {
    label: "Insurance Document",
    field: "insurance_doc",
    expiry_label: "Insurance Document Expiry",
    expiry_field: "insurance_doc_expiry",
  },
  {
    label: "National Permit Document",
    field: "national_permit_doc",
    expiry_label: "National Permit Document Expiry",
    expiry_field: "national_permit_doc_expiry",
  },
  {
    label: "State Permit Document",
    field: "state_permit_doc",
    expiry_label: "State Permit Document Expiry",
    expiry_field: "state_permit_doc_expiry",
  },
  {
    label: "Tax Document",
    field: "tax_doc",
    expiry_label: "Tax Document Expiry",
    expiry_field: "tax_doc_expiry",
  },
  {
    label: "Pollution Document",
    field: "pollution_doc",
    expiry_label: "Pollution Document Expiry",
    expiry_field: "pollution_doc_expiry",
  },
];

const NewTruckEntry = () => {
  const [truck, setTruck] = useState<TruckType>(EmptyTruckType);
  const dispatch: AppDispatch = useDispatch();

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setTruck((prevTruck) => ({
      ...prevTruck,
      [name]: value,
    }));
  };

  const handleFileSelect = (file: File | null, field: keyof TruckType) => {
    setTruck((prev) => ({
      ...prev,
      [field]: file,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();

      Object.entries(truck).forEach(([key, value]) => {
        if (!value) return;

        if (value instanceof File) {
          formData.append(key, value);
        } else if (typeof value === "string") {
          formData.append(key, value);
        } else if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else if (typeof value === "object") {
          formData.append(key, JSON.stringify(value));
        }
      });

      const resultAction = await dispatch(addTruckEntryAsync(formData));
      if (addTruckEntryAsync.fulfilled.match(resultAction)) {
        dispatch(
          addMessage({ type: "success", text: "Truck added successfully" })
        );
      } else if (addTruckEntryAsync.rejected.match(resultAction)) {
        const error = resultAction.payload;
        if (error) {
          dispatch(
            addMessage({ type: "error", text: error || "Failed to add truck" })
          );
        }
      }
    } catch (error: any) {
      console.log("Error: ", error.response);
      dispatch(
        addMessage({
          type: "error",
          text: error.response.data.message || "Something went wrong",
        })
      );
    }
  };

  return (
    <div className={styles.newTruckContainer}>
      <h1 className={styles.heading}>Add New Truck</h1>
      <form className={styles.truckForm} onSubmit={handleSubmit}>
        <div className={styles.fieldContainer}>
          <FormSection title="Truck Detail">
            <FormInput
              type="text"
              id="truck_no"
              value={truck.truck_no}
              name="truck_no"
              label="Truck Number"
              placeholder="Enter Truck Number"
              onChange={handleInputChange}
            />
          </FormSection>
          {DOCUMENTS.map((document) => {
            const imgValue = truck[document.field as keyof TruckType];
            const expiryValue = truck[document.expiry_field as keyof TruckType];
            
            return <FormSection key={document.field} title={document.label}>
              <FormInputImage
                id={document.field}
                value={imgValue === 'string' ? imgValue : ''}
                name={document.field}
                label={document.label}
                onFileSelect={(file) => handleFileSelect(file, document.field as keyof TruckType)}
              />
              <FormInput
                type="date"
                id={document.expiry_field}
                value={expiryValue as string ?? ''}
                name={document.expiry_field}
                label={document.expiry_label}
                inputType="date"
                onChange={handleInputChange}
              />
            </FormSection>
          })}
        </div>
        <button className={styles.btn}>Add Truck</button>
      </form>
    </div>
  );
};

export default NewTruckEntry;
