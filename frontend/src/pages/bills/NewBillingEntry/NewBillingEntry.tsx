import React, { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Save, FileText, CreditCard, Calculator, ArrowLeft, Milestone, Receipt } from "lucide-react";

import { useMessageStore } from "@/store/useMessageStore";

import {
  EmptyBillEntry,
  EXTRA_CHARGE_LABELS,
  type BillEntryType,
  type ExtraCharge,
} from "@/types/billEntry";
import { type BillingPartyType } from "@/types/billingParty";

import FormInput from "@/components/FormInput";
import FormSection from "@/components/FormSection";
import Button from "@/components/Button";
import { useBillEntries } from "@/hooks/useLedgers";
import { useParties } from "@/hooks/useParties";
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

/** -------------------- Component -------------------- **/
const Entry: React.FC = () => {
  const navigate = useNavigate();
  const { useAddBillEntryMutation } = useBillEntries();
  const addBillEntryMutation = useAddBillEntryMutation();
  const { useBillingPartiesQuery } = useParties();
  const { data: billingParties = [] } = useBillingPartiesQuery();
  const { addMessage } = useMessageStore();

  const [entry, setEntry] = useState<Omit<BillEntryType, "_id">>(EmptyBillEntry);

  const errorsRef = useRef<Record<string, string>>({});
  const [, forceRender] = useState({});

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
  const handleChange = (value: string, name: string) => {
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
    } else {
      if (val === "") {
        setSelectedParty({ _id: "", name: "", address: "", gst_no: "" });
        setPartyError("Please select a Billing Party");
        if (errorsRef.current[name]) {
          errorsRef.current[name] = "";
          forceRender({});
        }
      } else {
        const found = billingParties.find((p: any) => p.name === val);
        if (found) {
          setSelectedParty(found);
          setPartyError("");
          if (errorsRef.current[name]) {
            errorsRef.current[name] = "";
            forceRender({});
          }
        }
      }
    }
  };

  const fetchOptions = (search: string, field: string): Option[] => {
    void field;
    try {
      const filteredBillingParties = billingParties.filter((party: any) => party.name.toLowerCase().includes(search.toLowerCase()));
      if (filteredBillingParties.length > 0) {
        return filteredBillingParties.map((party: BillingPartyType) => ({
          label: party.name,
          value: party.name,
        }));
      } else {
        return [];
      }
    } catch (error: any) {
      addMessage({ type: "error", text: error.message || "Failed to fetch options" });
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
      addMessage({ type: "error", text: "Please select a Billing Party" });
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
      await addBillEntryMutation.mutateAsync(entry);
      addMessage({ type: "success", text: "Entry added successfully" });
      navigate("/bill-entry/all-bill-entries");
    } catch (err: any) {
      const errors = err.response?.data?.errors || err;
      if (errors && !errors?.general && Object.keys(errors)?.length > 0) {
        errorsRef.current = errors;
        forceRender({});
      }
      addMessage({
        type: "error",
        text: errors?.general || "Please fill all the required fields",
      });
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
        error = partyError || errorsRef.current["billing_party"];
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
          noResultsMessage="Party does not exist. Please add details."
        />
      );
    });
  };

  /** -------------------- JSX -------------------- **/
  return (
    <div className="flex flex-col gap-10 pb-20">
      <div className="flex flex-col gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-all text-sm font-semibold mb-2 w-fit"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight italic flex items-center gap-4">
            <FileText className="text-blue-600 w-10 h-10 lg:w-12 lg:h-12" />
            New <span className="text-blue-600">Bill</span> Entry
          </h1>
          <p className="text-slate-500 font-medium text-lg">Create a professional digital bill for your logistics trip.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 flex flex-col gap-8">
            <FormSection title="Bill & Party Info" icon={<CreditCard size={18} />}>
              <div className="grid sm:grid-cols-2 gap-6">
                {renderInputs(BILL_INFO_INPUTS)}
              </div>
              <div className="grid sm:grid-cols-2 gap-6 mt-6 pt-6 border-t border-slate-50">
                <FormInput
                  type="textarea"
                  label="Billing Party Address"
                  name="address"
                  placeholder="Auto-populated..."
                  value={selectedParty.address}
                  onChange={() => { }}
                  readOnly
                />
                <FormInput
                  type="input"
                  label="GST No."
                  name="gst_no"
                  placeholder="Auto-populated..."
                  value={selectedParty.gst_no}
                  onChange={() => { }}
                  readOnly
                />
              </div>
            </FormSection>

            <FormSection title="Consignment Details" icon={<Milestone size={18} />}>
              <div className="grid sm:grid-cols-2 gap-6">
                {renderInputs([...LR_INFO_INPUTS, ...CONSIGNOR_INPUTS, ...CONSIGNEE_INPUTS, ...VEHICLE_PACKAGE_INPUTS])}
              </div>
            </FormSection>

            <FormSection title="Extra Charges" icon={<Plus size={18} />}>
              <div className="flex flex-col gap-4">
                {entry.extra_charges.map((ec) => (
                  <div key={ec._id} className="grid grid-cols-2 lg:grid-cols-5 gap-4 items-end bg-slate-50/50 p-6 rounded-3xl border border-slate-100 relative group/charge">
                    {(Object.entries(EXTRA_CHARGE_LABELS) as [keyof ExtraCharge, string][]).map(([field, label]) => (
                      <div key={field} className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{label}</label>
                        <input
                          className="input-field py-2 px-4 rounded-xl text-sm"
                          value={ec[field as keyof typeof ec]}
                          onChange={(e) => handleExtraChargeChange(ec._id, field, e.target.value)}
                          placeholder={label}
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => removeExtraCharge(ec._id)}
                      className="p-3 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-200 w-fit lg:ml-auto"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addExtraCharge}
                  className="flex items-center justify-center gap-2 py-4 px-6 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 font-bold hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/30 transition-all duration-300"
                >
                  <Plus size={18} />
                  <span className="uppercase tracking-widest text-[10px] font-black">Add Extra Charge</span>
                </button>
              </div>
            </FormSection>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-8 sticky top-24">
            <FormSection title="Billing & Accounts" icon={<Calculator size={18} />}>
              <div className="flex flex-col gap-6">
                {renderInputs([...INVOICE_INPUTS, ...CLERK_YARD_INPUTS, ...BILLING_HIRE_INPUTS])}
              </div>
            </FormSection>

            <FormSection title="Total Summary" icon={<Receipt size={18} />}>
              <div className="flex flex-col gap-6">
                {renderInputs(TAX_TOTAL_INPUTS)}
              </div>
            </FormSection>

            <div className="flex flex-col gap-4">
              <Button
                type="submit"
                isLoading={addBillEntryMutation.isPending}
                icon={<Save size={20} />}
                className="py-5 shadow-blue-500/30"
              >
                Save Bill Entry
              </Button>
              <button
                type="button"
                onClick={() => navigate('/bill-entry/all-bill-entries')}
                className="py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors uppercase tracking-widest text-[10px]"
              >
                Discard Changes
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Entry;
