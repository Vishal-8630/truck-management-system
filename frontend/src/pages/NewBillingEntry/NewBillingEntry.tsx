import React, { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { addMessage } from "../../features/message";

import {
  EmptyBillEntry,
  EXTRA_CHARGE_LABELS,
  type BillEntryType,
  type ExtraCharge,
} from "../../types/billEntry";
import type { BillingPartyType } from "../../types/billingParty";

import styles from "./NewBillingEntry.module.scss";
import FormInput from "../../components/FormInput";
import FormSection from "../../components/FormSection";
import {
  addBillEntryAsync,
  selectBillEntryLoading,
} from "../../features/billEntry";
import {
  BILL_INFO_INPUTS,
  BILLING_HIRE_INPUTS,
  CLERK_YARD_INPUTS,
  CONSIGNEE_INPUTS,
  CONSIGNOR_INPUTS,
  INVOICE_INPUTS,
  LR_INFO_INPUTS,
  TAX_TOTAL_INPUTS,
  VEHICLE_PACKAGE_INPUTS,
  type InputType,
  type Option,
} from "./constants";
import type { AppDispatch } from "../../app/store";
import { billingPartySelectors, fetchBillingPartiesAsync } from "../../features/billingParty";

/** -------------------- Component -------------------- **/
const Entry: React.FC = () => {
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const loading = useSelector(selectBillEntryLoading);

  const [entry, setEntry] =
    useState<Omit<BillEntryType, "_id">>(EmptyBillEntry);

  const errorsRef = useRef<Record<string, string>>({});
  const [, forceRender] = useState({});

  const billingParties = useSelector(billingPartySelectors.selectAll);
  const [selectedParty, setSelectedParty] = useState<BillingPartyType>({
    _id: "",
    name: "",
    address: "",
    gst_no: "",
  });
  const [partyError, setPartyError] = useState("");
  const partyRef = useRef<
    HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
  >(null);

  const [state, setState] = useState("UP");

  /** -------------------- Sync Selected Party -------------------- **/
  useEffect(() => {
    setEntry((prev) => ({ ...prev, billing_party: selectedParty }));
  }, [selectedParty]);

  useEffect(() => {
    dispatch(fetchBillingPartiesAsync());
  }, [dispatch]);

  /** -------------------- Calculate Fields -------------------- **/
  useEffect(() => {
    const calculateFields = () => {
      const gstRate = state === "UP" ? 0.09 : 0.18;
      const rate = Number(entry.rate) || 0;
      const advance = Number(entry.advance) || 0;
      const extraTotal = entry.extra_charges.reduce(
        (sum, ec) => sum + Number(ec.amount || 0),
        0
      );
      const gst = Math.round((rate + extraTotal) * gstRate * 100) / 100;
      const subTotal = rate + extraTotal;
      const grandTotal = (state === "UP" ? subTotal + 2 * gst : subTotal + gst) - advance;

      setEntry((prev) => ({
        ...prev,
        cgst: state === "UP" ? String(gst) : "",
        sgst: state === "UP" ? String(gst) : "",
        igst: state !== "UP" ? String(gst) : "",
        sub_total: String(subTotal),
        grand_total: String(grandTotal),
      }));
    };
    calculateFields();
  }, [entry.rate, entry.extra_charges, state, entry.advance]);

  /** -------------------- Handlers -------------------- **/
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (errorsRef.current[name]) {
      errorsRef.current[name] = "";
      forceRender({});
    }

    setEntry((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (
    val: string,
    name: string,
    mode: "select" | "search"
  ) => {
    if (mode === "select") {
      setState(val);
      void name;
    } else {
      if (val === "") {
        setSelectedParty({ _id: "", name: "", address: "", gst_no: "" });
        setPartyError("Please select a Billing Party");
      } else {
        setSelectedParty(billingParties.find((p) => p.name === val) || selectedParty);
        setPartyError("");
      }
    }
  };

  const fetchOptions = (search: string, field: string): Option[] => {
    void field;
    try {
      const filteredBillingParties = billingParties.filter(party => party.name.toLowerCase().includes(search.toLowerCase()));
      if (filteredBillingParties.length > 0) {
        const options: Option[] = filteredBillingParties.map((party: BillingPartyType) => ({
          label: party.name,
          value: party.name,
        }));
        return options;
      } else {
        return [];
      }
    } catch (error: any) {
      dispatch(
        addMessage({ type: "error", text: error.response?.data?.message })
      );
      return [];
    }
  };

  const handleExtraChargeChange = (
    id: string,
    field: string,
    value: string
  ) => {
    setEntry((prev) => ({
      ...prev,
      extra_charges: prev.extra_charges.map((ec) => {
        if (ec._id !== id) return ec;

        let updated = { ...ec, [field]: value };

        if (field === "rate" || field === "per_amount" || field === "amount") {
          const rate = Number(updated.rate) || 0;
          const per_amount = Number(updated.per_amount) || 0;
          updated.amount= (rate * per_amount).toString();
        }

        return updated;
      }),
    }));
  };

  const addExtraCharge = () => {
    setEntry((prev) => ({
      ...prev,
      extra_charges: [
        ...prev.extra_charges,
        { _id: uuidv4(), type: "", amount: "", rate: "", per_amount: "" },
      ],
    }));
  };

  const removeExtraCharge = (id: string) => {
    setEntry((prev) => ({
      ...prev,
      extra_charges: prev.extra_charges.filter((ec) => ec._id !== id),
    }));
  };

  const partyValidation = () => {
    if (selectedParty.name === "") {
      setPartyError("Please select a Billing Party");
      dispatch(
        addMessage({ type: "error", text: "Please select a Billing Party" })
      );
      partyRef.current?.focus();
      return true;
    }
    setPartyError("");
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (partyValidation()) {
      return;
    }

    try {
      const resultAction = await dispatch(addBillEntryAsync(entry));
      if (addBillEntryAsync.fulfilled.match(resultAction)) {
        dispatch(
          addMessage({ type: "success", text: "Entry added successfully" })
        );
        navigate("/bill-entry/all-bill-entries");
      } else if (addBillEntryAsync.rejected.match(resultAction)) {
        const errors = resultAction.payload;
        if (errors && !errors?.general && Object.keys(errors)?.length > 0) {
          errorsRef.current = errors;
          forceRender({});
        }
        dispatch(
          addMessage({
            type: "error",
            text: errors?.general || "Please fill all the required fields",
          })
        );
      }
    } catch {
      dispatch(addMessage({ type: "error", text: "Failed to add bill entry" }));
    }
  };

  /** -------------------- Render Inputs -------------------- **/
  const renderInputs = (inputs: InputType[]) => {
    return inputs.map((input) => {
      let options: Option[] = [];
      let selectMode: "select" | "search" = "select";
      let error: string = errorsRef.current[input.name] || "";
      let value: string = String((entry as any)[input.name] || "");
      let placeholder: string = input.label;
      let inputRef:
        | React.RefObject<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
          >
        | undefined = undefined;

      if (input.name === "billing_party") {
        error = partyError;
        placeholder = "Select a Billing Party";
        value = selectedParty.name;
        selectMode = "search";
        inputRef = partyRef as React.RefObject<HTMLInputElement>;
      }

      if (input.name === "state") {
        value = state;
        placeholder = "";
        options = [
          { label: "UP", value: "UP" },
          { label: "Not UP", value: "Not UP" },
        ];
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

  /** -------------------- JSX -------------------- **/
  return (
    <div className={styles.entryFormContainer}>
      <h1 className={styles.heading}>New Bill Entry</h1>
      <form className={styles.entryForm} onSubmit={handleSubmit}>
        <div className={styles.inputArea}>
          <FormSection title="Bill Information">
            {renderInputs(BILL_INFO_INPUTS)}
            <div className={styles.formGroup}>
              <FormInput
                type="textarea"
                id="address"
                name="address"
                label="Billing Party Address"
                placeholder="Billing Party Address"
                value={selectedParty.address}
                onChange={() => {}}
              />
              <FormInput
                type="input"
                id="gst_no"
                name="gst_no"
                label="GST No."
                placeholder="GST No."
                value={selectedParty.gst_no}
                onChange={() => {}}
              />
            </div>
          </FormSection>

          <FormSection title="LR Information">
            {renderInputs(LR_INFO_INPUTS)}
          </FormSection>
          <FormSection title="Consignor Information">
            {renderInputs(CONSIGNOR_INPUTS)}
          </FormSection>
          <FormSection title="Consignee Information">
            {renderInputs(CONSIGNEE_INPUTS)}
          </FormSection>
          <FormSection title="Vehicle & Package Info">
            {renderInputs(VEHICLE_PACKAGE_INPUTS)}
          </FormSection>
          <FormSection title="Invoice & Eway">
            {renderInputs(INVOICE_INPUTS)}
          </FormSection>
          <FormSection title="Clerk & Yard">
            {renderInputs(CLERK_YARD_INPUTS)}
          </FormSection>
          <FormSection title="Billing & Hire">
            {renderInputs(BILLING_HIRE_INPUTS)}
          </FormSection>

          <FormSection title="Extra Charges">
            <div className={styles.extraChargesSection}>
              {entry.extra_charges.map((ec) => (
                <div key={ec._id} className={styles.extraChargeRow}>
                  {(
                    Object.entries(EXTRA_CHARGE_LABELS) as [
                      keyof ExtraCharge,
                      string
                    ][]
                  ).map(([field, label]) => (
                    <input
                      key={field}
                      value={ec[field as keyof typeof ec]}
                      onChange={(e) =>
                        handleExtraChargeChange(ec._id, field, e.target.value)
                      }
                      placeholder={label}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => removeExtraCharge(ec._id)}
                    className={styles.removeExtraChargeBtn}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                className={styles.addExtraChargeBtn}
                type="button"
                onClick={addExtraCharge}
              >
                Add Extra Charge
              </button>
            </div>
          </FormSection>

          <FormSection title="Tax & Total">
            {renderInputs(TAX_TOTAL_INPUTS)}
          </FormSection>
        </div>

        <div className={styles.buttonContainer}>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            Add Entry
          </button>
        </div>
      </form>
    </div>
  );
};

export default Entry;
