import React from "react";
import { Save, CreditCard, Milestone, Calculator, Receipt, Plus, Trash2 } from "lucide-react";
import FormInput from "@/components/FormInput";
import FormSection from "@/components/FormSection";
import Button from "@/components/Button";
import { EXTRA_CHARGE_LABELS, type BillEntryType, type ExtraCharge } from "@/types/billEntry";
import { type BillingPartyType } from "@/types/billingParty";
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
} from "@/pages/bills/NewBillingEntry/constants";

interface BillEntryFormProps {
    entry: Omit<BillEntryType, "_id">;
    errors: Record<string, string>;
    isPending: boolean;
    state: string;
    selectedParty: BillingPartyType;
    partyError: string;
    partyRef: React.RefObject<any>;
    handleChange: (value: string, name: string) => void;
    handleSelectChange: (val: string, name: string, mode: "select" | "search") => void;
    fetchOptions: (search: string, field: string) => Option[];
    handleExtraChargeChange: (id: string, field: string, value: string) => void;
    addExtraCharge: () => void;
    setDeleteChargeId: (id: string | null) => void;
    handleSubmit: (e: React.FormEvent) => void;
    onDiscard: () => void;
}

const BillEntryForm: React.FC<BillEntryFormProps> = ({
    entry,
    errors,
    isPending,
    state,
    selectedParty,
    partyError,
    partyRef,
    handleChange,
    handleSelectChange,
    fetchOptions,
    handleExtraChargeChange,
    addExtraCharge,
    setDeleteChargeId,
    handleSubmit,
    onDiscard,
}) => {
    const renderInputs = (inputs: InputType[]) => {
        return inputs.map((input) => {
            let options: Option[] = [];
            let selectMode: "select" | "search" = "select";
            let error: string = errors[input.name] || "";
            let value: string = String((entry as any)[input.name] || "");
            let placeholder: string = input.label;
            let inputRef: React.RefObject<any> | undefined = undefined;

            if (input.name === "billing_party") {
                error = partyError || errors["billing_party"];
                placeholder = "Select a Billing Party";
                value = selectedParty.name;
                selectMode = "search";
                inputRef = partyRef;
            }

            if (input.name === "state") {
                value = state;
                placeholder = "";
                options = [
                    { label: "UP", value: "UP" },
                    { label: "Not UP", value: "Not UP" },
                ];
            }

            const getHelpText = () => {
                if (input.name === "state") {
                    return state === "UP" ? "9% CGST + 9% SGST applied" : "18% IGST applied";
                }
                return undefined;
            };

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
                    helpText={getHelpText()}
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

    return (
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
                                        onClick={() => setDeleteChargeId(ec._id)}
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

                    {/* Calculation Breakdown Note */}
                    <div className="bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-[2rem] p-6 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                            <Calculator size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Calculation Guide</span>
                        </div>
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between text-[11px]">
                                <span className="text-slate-500 font-bold uppercase tracking-tighter">Sub Total</span>
                                <span className="text-slate-900 dark:text-slate-100 font-black">Rate + Extra Charges</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px]">
                                <span className="text-slate-500 font-bold uppercase tracking-tighter">Tax Applied</span>
                                <span className="text-slate-900 dark:text-slate-100 font-black">
                                    {state === "UP" ? "9% CGST + 9% SGST" : "18% IGST"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px]">
                                <span className="text-slate-500 font-bold uppercase tracking-tighter">Final Equation</span>
                                <span className="text-indigo-600 dark:text-indigo-400 font-black">SubTotal + Tax - Advance</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <Button
                            type="submit"
                            isLoading={isPending}
                            icon={<Save size={20} />}
                            className="py-5 shadow-blue-500/30"
                        >
                            Save Bill Entry
                        </Button>
                        <button
                            type="button"
                            onClick={onDiscard}
                            className="py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors uppercase tracking-widest text-[10px]"
                        >
                            Discard Changes
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default BillEntryForm;
