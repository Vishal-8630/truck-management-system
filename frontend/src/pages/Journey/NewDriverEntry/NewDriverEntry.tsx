import React, { useState } from "react";
import FormInput from "../../../components/FormInput";
import FormSection from "../../../components/FormSection";
import styles from "./NewDriverEntry.module.scss";
import { EmptyDriverType, type DriverType } from "../../../types/driver";
import FormInputImage from "../../../components/FormInputImage";
import { useDispatch } from "react-redux";
import { addMessage } from "../../../features/message";
import { addDriverEntryAsync } from "../../../features/driver";
import type { AppDispatch } from "../../../app/store";
import { useNavigate } from "react-router-dom";

const NewDriverEntry: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const [driver, setDriver] =
    useState<Omit<DriverType, "_id">>(EmptyDriverType);

  // Need to work on this logic
  // const isValidDL = (value: string) =>
  //   /^[A-Z]{2}[0-9]{2}[0-9]{4}[0-9]{7}$/.test(value);

  const handleTextInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    if (name === "phone" || name === "home_phone") {
      const phone_no = value.replace(/[^0-9]/g, "").slice(0, 10);
      setDriver((prev) => ({ ...prev, [name]: phone_no }));
    } else if (name === "adhaar_no") {
      const adhaar_no = value.replace(/[^0-9]/g, "").slice(0, 12);
      const formatted = adhaar_no.replace(/(\d{4})(?=\d)/g, "$1 ");
      setDriver((prev) => ({ ...prev, [name]: formatted }));
    } else if (name === "dl") {
      const dl = value
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 15)
        .replace(
          /^([A-Z]{2})([0-9]{2})([0-9]{4})([0-9]{0,7}).*$/,
          "$1 $2 $3 $4"
        )
        .trim();

      setDriver((prev) => ({ ...prev, [name]: dl }));
    } else {
      setDriver((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileSelect = (file: File | null, field: keyof DriverType) => {
    setDriver((prev) => ({
      ...prev,
      [field]: file,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    /*
     TODO: Need to fix the valid dl logic
    const isDLValid = isValidDL(driver.dl || "");
    if (!isDLValid) {
      dispatch(addMessage({ type: "error", text: "Invalid DL Number" }));
    }
    */

    try {
      const formData = new FormData();

      Object.entries(driver).forEach(([key, value]) => {
        if (!value) return;

        if (value instanceof File) {
          formData.append(key, value);
        } else if (typeof value === 'string') {
          formData.append(key, value);
        } else if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        }
      });

      const resultAction = await dispatch(addDriverEntryAsync(formData));
      if (addDriverEntryAsync.fulfilled.match(resultAction)) {
        dispatch(
          addMessage({ type: "success", text: "Driver added successfully" })
        );
        setDriver(EmptyDriverType);
        navigate("/journey/all-driver-entries");
      } else if (addDriverEntryAsync.rejected.match(resultAction)) {
        const errors = resultAction.payload;
        if (errors) {
          dispatch(addMessage({ type: "error", text: errors.error }));
        }
      }
    } catch {
      dispatch(addMessage({ type: "error", text: "Something went wrong" }));
    }
  };

  return (
    <div className={styles.newDriverEntryContainer}>
      <form className={styles.newDriverForm} onSubmit={handleSubmit}>
        <FormSection title="Add Driver">
          <FormInput
            type="text"
            id="name"
            name="name"
            label="Name"
            value={driver.name}
            placeholder="Name"
            onChange={handleTextInputChange}
          />

          <FormInputImage
            label="Driver Photo"
            id="driver_img"
            name="driver_img"
            isEditMode
            value={
              typeof driver.driver_img === "string" ? driver.driver_img : ""
            }
            onFileSelect={(file) => handleFileSelect(file, "driver_img")}
          />

          <FormInput
            type="textarea"
            id="address"
            name="address"
            label="Address"
            value={driver.address || ""}
            placeholder="Address"
            onChange={handleTextInputChange}
          />

          <FormInput
            type="text"
            id="phone"
            name="phone"
            label="Phone Number"
            value={driver.phone}
            placeholder="Phone Number"
            onChange={handleTextInputChange}
          />

          <FormInput
            type="text"
            id="home_phone"
            name="home_phone"
            label="Home Phone Number"
            value={driver.home_phone || ""}
            placeholder="Home Phone Number"
            onChange={handleTextInputChange}
          />

          <FormInput
            type="text"
            id="adhaar_no"
            name="adhaar_no"
            label="Adhaar Number"
            value={driver.adhaar_no}
            placeholder="Adhaar Number"
            onChange={handleTextInputChange}
          />

          <FormInput
            type="text"
            id="dl"
            name="dl"
            label="Driving License"
            value={driver.dl}
            placeholder="Driving License"
            onChange={handleTextInputChange}
          />

          <FormInputImage
            label="Adhaar Front Image"
            id="adhaar_front_img"
            name="adhaar_front_img"
            isEditMode
            value={
              typeof driver.adhaar_front_img === "string"
                ? driver.adhaar_front_img
                : ""
            }
            onFileSelect={(file) => handleFileSelect(file, "adhaar_front_img")}
          />

          <FormInputImage
            label="Adhaar Back Image"
            id="adhaar_back_img"
            name="adhaar_back_img"
            isEditMode
            value={
              typeof driver.adhaar_back_img === "string"
                ? driver.adhaar_back_img
                : ""
            }
            onFileSelect={(file) => handleFileSelect(file, "adhaar_back_img")}
          />

          <FormInputImage
            label="Driving License Image"
            id="dl_img"
            name="dl_img"
            isEditMode
            value={typeof driver.dl_img === "string" ? driver.dl_img : ""}
            onFileSelect={(file) => handleFileSelect(file, "dl_img")}
          />

          <button type="submit" className={styles.addDriverBtn}>
            Add
          </button>
        </FormSection>
      </form>
    </div>
  );
};

export default NewDriverEntry;
