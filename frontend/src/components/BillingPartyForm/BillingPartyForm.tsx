import type { BillingPartyType } from "@/types/billingParty";
import FormSection from "@/components/FormSection";
import FormInput from "@/components/FormInput";
import { UserPlus, Save, Building2 } from "lucide-react";

interface BillingPartyFormProps {
  handleInputChange: (value: string, name: string) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  party: Omit<BillingPartyType, "_id">;
  errors: Record<string, string>;
  isPending?: boolean;
}

const BillingPartyForm: React.FC<BillingPartyFormProps> = ({
  handleInputChange,
  handleSubmit,
  party,
  errors,
  isPending,
}) => {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <FormSection title="Company Registration" icon={<Building2 size={18} />}>
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2">
                <FormInput
                  type="text"
                  label="Legal Company Name"
                  id="name"
                  name="name"
                  value={party.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Divyanshi Road Lines Pvt Ltd"
                  error={errors.name}
                />
              </div>

              <FormInput
                type="text"
                label="GST Registration No"
                id="gst_no"
                name="gst_no"
                value={party.gst_no}
                onChange={handleInputChange}
                placeholder="e.g. 22AAAAA0000A1Z5"
                error={errors.gst_no}
              />
            </div>

            <FormInput
              type="textarea"
              label="Registered Office Address"
              id="address"
              name="address"
              value={party.address}
              onChange={handleInputChange}
              placeholder="Full building address, state, and pincode..."
              error={errors.address}
            />

            <div className="flex items-center justify-between pt-8 border-t border-slate-50 mt-4">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Action</span>
                <span className="text-[10px] font-medium text-slate-400">Ensure data matches GST records</span>
              </div>
              <button
                className="px-10 py-4 bg-blue-600 text-white rounded-[1.5rem] font-bold flex items-center gap-3 shadow-xl shadow-blue-100 hover:bg-blue-700 hover:-translate-y-1 transition-all active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wider text-xs"
                type="submit"
                disabled={isPending}
              >
                <Save size={18} />
                {isPending ? "Processing..." : "Register Entity"}
              </button>
            </div>
          </div>
        </FormSection>
      </form>
    </div>
  );
};

export default BillingPartyForm;
