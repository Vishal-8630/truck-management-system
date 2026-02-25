import React, { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Save, FileText } from "lucide-react";

import { addMessage } from "../../features/message";

import {
  EmptyBillEntry,
  EXTRA_CHARGE_LABELS,
  type BillEntryType,
  type ExtraCharge,
} from "../../types/billEntry";
import type { BillingPartyType } from "../../types/billingParty";

import FormInput from "../../components/FormInput";
import FormSection from "../../components/FormSection";
import Button from "../../components/Button";
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
          updated.amount = (rate * per_amount).toString();
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
    <div className="flex flex-col gap-10 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight italic flex items-center gap-4">
          <FileText className="text-indigo-600 w-10 h-10 lg:w-12 lg:h-12" />
          New <span className="text-indigo-600">Bill</span> Entry
        </h1>
        <p className="text-slate-500 font-medium text-lg">Create a professional digital bill for your logistics trip.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <div className="flex flex-col gap-8">
            <div className="bg-white p-8 lg:p-10 rounded-[2.5rem] shadow-premium border border-slate-100 h-full">
              <FormSection title="Bill Information">
                <div className="grid sm:grid-cols-2 gap-6">
                  {renderInputs(BILL_INFO_INPUTS)}
                </div>
                <div className="grid gap-6 mt-6">
                  <FormInput
                    type="textarea"
                    id="address"
                    name="address"
                    label="Billing Party Address"
                    placeholder="Auto-populated address..."
                    value={selectedParty.address}
                    onChange={() => { }}
                    className="h-24"
                  />
                  <FormInput
                    type="input"
                    id="gst_no"
                    name="gst_no"
                    label="GST No."
                    placeholder="Auto-populated GSTIN..."
                    value={selectedParty.gst_no}
                    onChange={() => { }}
                  />
                </div>
              </FormSection>
            </div>

            <div className="bg-white p-8 lg:p-10 rounded-[2.5rem] shadow-premium border border-slate-100 h-full">
              <FormSection title="LR & Consignor Info">
                <div className="grid sm:grid-cols-2 gap-6">
                  {renderInputs([...LR_INFO_INPUTS, ...CONSIGNOR_INPUTS])}
                </div>
              </FormSection>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <div className="bg-white p-8 lg:p-10 rounded-[2.5rem] shadow-premium border border-slate-100 h-full">
              <FormSection title="Recipient & Vehicle">
                <div className="grid sm:grid-cols-2 gap-6">
                  {renderInputs([...CONSIGNEE_INPUTS, ...VEHICLE_PACKAGE_INPUTS])}
                </div>
              </FormSection>
            </div>

            <div className="bg-white p-8 lg:p-10 rounded-[2.5rem] shadow-premium border border-slate-100 h-full">
              <FormSection title="Operations & Billing">
                <div className="grid sm:grid-cols-2 gap-6">
                  {renderInputs([...INVOICE_INPUTS, ...CLERK_YARD_INPUTS, ...BILLING_HIRE_INPUTS])}
                </div>
              </FormSection>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 lg:p-10 rounded-[2.5rem] shadow-premium border border-slate-100">
          <FormSection title="Extra Charges">
            <div className="flex flex-col gap-4">
              {entry.extra_charges.map((ec) => (
                <div key={ec._id} className="grid grid-cols-2 lg:grid-cols-5 gap-4 items-end bg-slate-50 p-6 rounded-3xl border border-slate-100 relative group">
                  {(
                    Object.entries(EXTRA_CHARGE_LABELS) as [
                      keyof ExtraCharge,
                      string
                    ][]
                  ).map(([field, label]) => (
                    <div key={field} className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">{label}</label>
                      <input
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 text-sm font-medium"
                        value={ec[field as keyof typeof ec]}
                        onChange={(e) =>
                          handleExtraChargeChange(ec._id, field, e.target.value)
                        }
                        placeholder={label}
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => removeExtraCharge(ec._id)}
                    className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 w-fit lg:ml-auto"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addExtraCharge}
                className="flex items-center justify-center gap-2 py-4 px-6 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 font-bold hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50/50 transition-all duration-200"
              >
                <Plus size={20} />
                Add Extra Charge
              </button>
            </div>
          </FormSection>
        </div>

        <div className="bg-slate-900 p-8 lg:p-12 rounded-[2.5rem] shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>

          <div className="relative z-10 flex flex-col gap-10">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-bold text-white italic">Final Settlement</h2>
              <p className="text-slate-400 text-sm font-medium">Automatic calculations based on rate and extra charges.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {renderInputs(TAX_TOTAL_INPUTS).map((input, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm">
                  {input}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-6 pt-6 border-t border-white/10">
              <button
                type="button"
                onClick={() => navigate('/bill-entry/all-bill-entries')}
                className="px-8 py-4 text-slate-400 font-bold hover:text-white transition-colors"
              >
                Cancel
              </button>
              <Button
                type="submit"
                text="Save Bill Entry"
                variant="primary"
                loading={loading}
                disabled={loading}
                icon={<Save size={20} />}
                className="py-4 px-12 text-lg shadow-indigo-500/20"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Entry;

