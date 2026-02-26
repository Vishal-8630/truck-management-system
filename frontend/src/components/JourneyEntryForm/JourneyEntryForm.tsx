import React from "react";
import { Save, Truck, MapPin, Calendar, Zap, FileText, Calculator } from "lucide-react";
import FormInput from "@/components/FormInput";
import FormSection from "@/components/FormSection";
import Button from "@/components/Button";

interface JourneyEntryFormProps {
    form: any;
    errors: Record<string, string>;
    isPending: boolean;
    truckRef: React.RefObject<any>;
    driverRef: React.RefObject<any>;
    truckOptions: { label: string; value: string }[];
    driverOptions: { label: string; value: string }[];
    handleChange: (val: string, name: string) => void;
    fetchOptions: (search: string, field: string) => any[];
    handleSubmit: (e: React.FormEvent) => void;
    onDiscard: () => void;
}

const JourneyEntryForm: React.FC<JourneyEntryFormProps> = ({
    form,
    errors,
    isPending,
    truckRef,
    driverRef,
    truckOptions,
    driverOptions,
    handleChange,
    fetchOptions,
    handleSubmit,
    onDiscard,
}) => {
    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 flex flex-col gap-8">
                    <FormSection title="Assignment" icon={<Truck size={18} />}>
                        <div className="grid sm:grid-cols-2 gap-6">
                            <FormInput
                                type="search"
                                selectMode="search"
                                label="Select Truck"
                                name="truck"
                                value={form.truck}
                                onChange={handleChange}
                                options={truckOptions}
                                fetchOptions={fetchOptions}
                                error={errors.truck}
                                inputRef={truckRef}
                            />
                            <FormInput
                                type="search"
                                selectMode="search"
                                label="Assigned Driver"
                                name="driver"
                                value={form.driver}
                                onChange={handleChange}
                                options={driverOptions}
                                fetchOptions={fetchOptions}
                                error={errors.driver}
                                inputRef={driverRef}
                            />
                        </div>
                    </FormSection>

                    <FormSection title="Route Details" icon={<MapPin size={18} />}>
                        <div className="grid sm:grid-cols-2 gap-6">
                            <FormInput
                                type="input"
                                inputType="text"
                                label="Starting Location"
                                name="from"
                                placeholder="e.g. Mumbai"
                                value={form.from}
                                onChange={handleChange}
                                error={errors.from}
                            />
                            <FormInput
                                type="input"
                                inputType="text"
                                label="Destination"
                                name="to"
                                placeholder="e.g. Delhi"
                                value={form.to}
                                onChange={handleChange}
                                error={errors.to}
                            />
                        </div>
                    </FormSection>

                    <FormSection title="Timelines & Funds" icon={<Calendar size={18} />}>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <FormInput type="date" label="Start Date" name="journey_start_date" value={form.journey_start_date} onChange={handleChange} error={errors.journey_start_date} />
                            <FormInput type="date" label="Estimated Arrival" name="journey_end_date" value={form.journey_end_date} onChange={handleChange} error={errors.journey_end_date} />
                            <FormInput type="number" label="Starting Cash (₹)" name="journey_starting_cash" value={form.journey_starting_cash} onChange={handleChange} error={errors.journey_starting_cash} />
                            <FormInput type="number" label="Planned Days" name="journey_days" value={form.journey_days} onChange={handleChange} error={errors.journey_days} />
                        </div>
                    </FormSection>

                    <FormSection title="Odometer & Payload" icon={<Zap size={18} />}>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <FormInput type="number" label="Starting KMs" name="starting_kms" value={form.starting_kms} onChange={handleChange} error={errors.starting_kms} />
                            <FormInput type="number" label="Target Distance (km)" name="distance_km" value={form.distance_km} onChange={handleChange} error={errors.distance_km} />
                            <FormInput type="number" label="Loaded Weight (kg)" name="loaded_weight" value={form.loaded_weight} onChange={handleChange} error={errors.loaded_weight} />
                            <FormInput type="number" label="Expected Mileage" name="average_mileage" value={form.average_mileage} onChange={handleChange} error={errors.average_mileage} />
                        </div>
                    </FormSection>

                    <FormSection title="Journey Summary" icon={<FileText size={18} />}>
                        <FormInput
                            type="textarea"
                            label="Brief Description"
                            name="journey_summary"
                            placeholder="Details about the trip, priority, or cargo..."
                            value={form.journey_summary}
                            onChange={handleChange}
                            error={errors.journey_summary}
                        />
                    </FormSection>
                </div>

                <div className="lg:col-span-4 flex flex-col gap-8 sticky top-24">
                    <FormSection title="Plan Actions" icon={<Calculator size={18} />}>
                        <div className="flex flex-col gap-4">
                            <p className="text-sm text-slate-500 font-medium">Verify truck compliance and driver availability before planning.</p>
                            <Button
                                type="submit"
                                isLoading={isPending}
                                icon={<Save size={20} />}
                                className="py-5 shadow-blue-500/30 w-full"
                            >
                                Create Journey
                            </Button>
                            <button
                                type="button"
                                onClick={onDiscard}
                                className="py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors uppercase tracking-widest text-[10px]"
                            >
                                Discard Plan
                            </button>
                        </div>
                    </FormSection>
                </div>
            </div>
        </form>
    );
};

export default JourneyEntryForm;
