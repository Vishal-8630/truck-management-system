import React from "react";
import FormInput from "@/components/FormInput";
import FormSection from "@/components/FormSection";
import FormInputImage from "@/components/ui/FormInputImage";
import Button from "@/components/Button";
import { Save, FileText, ShieldCheck, Image as ImageIcon, Activity } from "lucide-react";

interface TruckFormProps {
    form: any;
    errors: Record<string, string>;
    isPending: boolean;
    fieldRefs: Record<string, React.RefObject<any>>;
    handleChange: (value: string, name: string) => void;
    handleFileSelect: (file: File | null, name: string) => void;
    handleSubmit: (e: React.FormEvent) => void;
    onDiscard: () => void;
}

const TruckForm: React.FC<TruckFormProps> = ({
    form,
    errors,
    isPending,
    fieldRefs,
    handleChange,
    handleFileSelect,
    handleSubmit,
    onDiscard,
}) => {
    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 flex flex-col gap-8">
                    <FormSection title="Truck Specifications" icon={<Activity size={18} />}>
                        <div className="grid sm:grid-cols-2 gap-6">
                            <FormInput
                                type="input"
                                inputType="text"
                                label="Registration No."
                                name="truck_no"
                                placeholder="e.g. UP 80 AX 1234"
                                value={form.truck_no}
                                onChange={handleChange}
                                error={errors.truck_no}
                                inputRef={fieldRefs.truck_no}
                            />
                            <FormInput
                                type="input"
                                inputType="text"
                                label="Model"
                                name="model"
                                placeholder="e.g. Tata Prima"
                                value={form.model}
                                onChange={handleChange}
                                error={errors.model}
                                inputRef={fieldRefs.model}
                            />
                            <FormInput
                                type="input"
                                inputType="text"
                                label="Year"
                                name="year"
                                placeholder="e.g. 2023"
                                value={form.year}
                                onChange={handleChange}
                                error={errors.year}
                                inputRef={fieldRefs.year}
                            />
                        </div>
                        <div className="mt-4">
                            <FormInput
                                type="textarea"
                                label="Additional Notes"
                                name="notes"
                                placeholder="Engine details, maintenance history, etc."
                                value={form.notes}
                                onChange={handleChange}
                                error={errors.notes}
                                inputRef={fieldRefs.notes}
                            />
                        </div>
                    </FormSection>

                    <FormSection title="Compliance Expiry Dates" icon={<ShieldCheck size={18} />}>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <FormInput type="date" label="Fitness Expiry" name="fitness_doc_expiry" value={form.fitness_doc_expiry} onChange={handleChange} error={errors.fitness_doc_expiry} inputRef={fieldRefs.fitness_doc_expiry} />
                            <FormInput type="date" label="Insurance Expiry" name="insurance_doc_expiry" value={form.insurance_doc_expiry} onChange={handleChange} error={errors.insurance_doc_expiry} inputRef={fieldRefs.insurance_doc_expiry} />
                            <FormInput type="date" label="National Permit" name="national_permit_doc_expiry" value={form.national_permit_doc_expiry} onChange={handleChange} error={errors.national_permit_doc_expiry} inputRef={fieldRefs.national_permit_doc_expiry} />
                            <FormInput type="date" label="State Permit" name="state_permit_doc_expiry" value={form.state_permit_doc_expiry} onChange={handleChange} error={errors.state_permit_doc_expiry} inputRef={fieldRefs.state_permit_doc_expiry} />
                            <FormInput type="date" label="Tax Expiry" name="tax_doc_expiry" value={form.tax_doc_expiry} onChange={handleChange} error={errors.tax_doc_expiry} inputRef={fieldRefs.tax_doc_expiry} />
                            <FormInput type="date" label="Pollution Expiry" name="pollution_doc_expiry" value={form.pollution_doc_expiry} onChange={handleChange} error={errors.pollution_doc_expiry} inputRef={fieldRefs.pollution_doc_expiry} />
                        </div>
                    </FormSection>

                    <FormSection title="Document Uploads" icon={<ImageIcon size={18} />}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {(["fitness_doc", "insurance_doc", "national_permit_doc", "state_permit_doc", "tax_doc", "pollution_doc"] as const).map((doc) => (
                                <FormInputImage
                                    key={doc}
                                    id={doc}
                                    name={doc}
                                    label={doc.replace(/_/g, " ")}
                                    isEditMode={true}
                                    onFileSelect={(file) => handleFileSelect(file, doc)}
                                />
                            ))}
                        </div>
                    </FormSection>
                </div>

                <div className="lg:col-span-4 flex flex-col gap-8 sticky top-24">
                    <FormSection title="Registry Actions" icon={<FileText size={18} />}>
                        <div className="flex flex-col gap-4">
                            <p className="text-sm text-slate-500 font-medium">Please ensure all compliance dates are accurate for automated alerts.</p>
                            <Button
                                type="submit"
                                isLoading={isPending}
                                icon={<Save size={20} />}
                                className="py-5 shadow-blue-500/30 w-full"
                            >
                                Register Truck
                            </Button>
                            <button
                                type="button"
                                onClick={onDiscard}
                                className="py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors uppercase tracking-widest text-[10px]"
                            >
                                Cancel Registration
                            </button>
                        </div>
                    </FormSection>
                </div>
            </div>
        </form>
    );
};

export default TruckForm;
