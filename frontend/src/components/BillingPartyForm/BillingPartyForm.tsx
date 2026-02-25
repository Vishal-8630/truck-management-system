import type { BillingPartyType } from "../../types/billingParty";
import FormSection from "../FormSection";
import FormInput from "../FormInput";
import { UserPlus, Save } from "lucide-react";

interface BillingPartyFormProps {
  handleInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  party: Omit<BillingPartyType, "_id">;
  errors: Record<string, string>;
}

const BillingPartyForm: React.FC<BillingPartyFormProps> = ({
  handleInputChange,
  handleSubmit,
  party,
  errors,
}) => {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <FormSection title="Create Billing Party" icon={<UserPlus size={18} />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
              <FormInput
                type="text"
                label="Company / Party Name"
                id="name"
                name="name"
                value={party.name}
                onChange={handleInputChange}
                placeholder="Enter full legal name..."
                error={errors.name}
              />
            </div>

            <FormInput
              type="text"
              label="GST Registration Number"
              id="gst_no"
              name="gst_no"
              value={party.gst_no}
              onChange={handleInputChange}
              placeholder="e.g. 22AAAAA0000A1Z5"
              error={errors.gst_no}
            />

            <div className="md:col-span-2">
              <FormInput
                type="textarea"
                label="Registered Address"
                id="address"
                name="address"
                value={party.address}
                onChange={handleInputChange}
                placeholder="Enter complete office address..."
                error={errors.address}
              />
            </div>
          </div>

          <div className="flex justify-end pt-8 mt-4 border-t border-slate-50">
            <button
              className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center gap-3 shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:translate-y-0"
              type="submit"
            >
              <Save size={18} />
              Register Party
            </button>
          </div>
        </FormSection>
      </form>
    </div>
  );
};

export default BillingPartyForm;

