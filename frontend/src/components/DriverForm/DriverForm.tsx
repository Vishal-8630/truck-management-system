import React from "react";
import FormInput from "@/components/FormInput";
import FormSection from "@/components/FormSection";
import FormInputImage from "@/components/ui/FormInputImage";
import Button from "@/components/Button";
import { User, Save, ShieldCheck, FileText, Activity, Image as ImageIcon } from "lucide-react";

interface DriverFormProps {
    form: any;
    errors: Record<string, string>;
    isPending: boolean;
    fieldRefs: Record<string, React.RefObject<any>>;
    handleChange: (value: string, name: string) => void;
    onImageSelect: (file: File | null) => void;
    handleSubmit: (e: React.FormEvent) => void;
    onDiscard: () => void;
}

const DriverForm: React.FC<DriverFormProps> = ({
    form,
    errors,
    isPending,
    fieldRefs,
    handleChange,
    onImageSelect,
    handleSubmit,
    onDiscard,
}) => {
    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 flex flex-col gap-8">
                    <FormSection title="Personal Profile" icon={<User size={18} />}>
                        <div className="grid sm:grid-cols-2 gap-6">
                            <FormInput
                                type="input"
                                inputType="text"
                                label="Full Name"
                                name="name"
                                placeholder="e.g. Rajesh Kumar"
                                value={form.name}
                                onChange={handleChange}
                                error={errors.name}
                                inputRef={fieldRefs.name}
                            />
                            <FormInput
                                type="input"
                                inputType="tel"
                                label="Mobile Number"
                                name="phone"
                                placeholder="e.g. +91 98XXX XXXXX"
                                value={form.phone}
                                onChange={handleChange}
                                error={errors.phone}
                                inputRef={fieldRefs.phone}
                            />
                            <FormInput
                                type="input"
                                inputType="text"
                                label="Adhaar Card No."
                                name="adhaar_no"
                                placeholder="XXXX-XXXX-XXXX"
                                value={form.adhaar_no}
                                onChange={handleChange}
                                error={errors.adhaar_no}
                                inputRef={fieldRefs.adhaar_no}
                            />
                        </div>
                        <div className="mt-4">
                            <FormInput
                                type="textarea"
                                label="Permanent Address"
                                name="address"
                                placeholder="House no, street, city..."
                                value={form.address}
                                onChange={handleChange}
                                error={errors.address}
                                inputRef={fieldRefs.address}
                            />
                        </div>
                    </FormSection>

                    <FormSection title="Official Documents" icon={<ShieldCheck size={18} />}>
                        <div className="grid sm:grid-cols-2 gap-6">
                            <FormInput
                                type="input"
                                inputType="text"
                                label="Driving Licence No."
                                name="dl"
                                placeholder="e.g. DL-XXXXXXXXXXXXX"
                                value={form.dl}
                                onChange={handleChange}
                                error={errors.dl}
                                inputRef={fieldRefs.dl}
                            />
                            <FormInput
                                type="date"
                                label="Licence Expiry"
                                name="licence_expiry"
                                value={form.licence_expiry}
                                onChange={handleChange}
                                error={errors.licence_expiry}
                                inputRef={fieldRefs.licence_expiry}
                            />
                        </div>
                    </FormSection>

                    <FormSection title="Additional Notes" icon={<Activity size={18} />}>
                        <FormInput
                            type="textarea"
                            label="Experience & Notes"
                            name="notes"
                            placeholder="Years of experience, previous routes, etc..."
                            value={form.notes}
                            onChange={handleChange}
                            error={errors.notes}
                            inputRef={fieldRefs.notes}
                        />
                    </FormSection>
                </div>

                <div className="lg:col-span-4 flex flex-col gap-8 sticky top-24">
                    <FormSection title="Driver Photo" icon={<ImageIcon size={18} />}>
                        <FormInputImage
                            id="driver_img"
                            name="driver_img"
                            label="Profile Picture"
                            isEditMode={true}
                            onFileSelect={onImageSelect}
                        />
                    </FormSection>

                    <FormSection title="Confirm Entry" icon={<FileText size={18} />}>
                        <div className="flex flex-col gap-4">
                            <p className="text-xs text-slate-500 font-medium">Please ensure the driver's phone number and licence details match their official documents.</p>
                            <Button
                                type="submit"
                                isLoading={isPending}
                                icon={<Save size={20} />}
                                className="py-5 shadow-blue-500/30 w-full"
                            >
                                Register Driver
                            </Button>
                            <button
                                type="button"
                                onClick={onDiscard}
                                className="py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors uppercase tracking-widest text-[10px]"
                            >
                                Cancel Entry
                            </button>
                        </div>
                    </FormSection>
                </div>
            </div>
        </form>
    );
};

export default DriverForm;
