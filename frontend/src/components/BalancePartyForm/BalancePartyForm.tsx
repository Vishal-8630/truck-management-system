import type { BalancePartyType } from "@/types/vehicleEntry";
import FormSection from "@/components/FormSection";
import FormInput from "@/components/FormInput";
import { UserSquare, Plus } from "lucide-react";

interface BalancePartyFormProps {
    handleInputChange: (value: string, name: string) => void;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    party: Omit<BalancePartyType, "_id">;
    errors: Record<string, string>;
    isPending?: boolean;
}

const BalancePartyForm: React.FC<BalancePartyFormProps> = ({
    handleInputChange,
    handleSubmit,
    party,
    errors,
    isPending,
}) => {
    return (
        <div className="max-w-4xl mx-auto py-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                <FormSection title="Account Registration" icon={<UserSquare size={18} />}>
                    <div className="flex flex-col gap-8">
                        <div className="grid grid-cols-1 gap-8">
                            <FormInput
                                type="text"
                                label="Party Representative Name"
                                id="party_name"
                                name="party_name"
                                value={party.party_name}
                                onChange={handleInputChange}
                                placeholder="Name as it appears on records..."
                                error={errors.party_name}
                            />
                        </div>

                        <div className="flex items-center justify-between pt-8 border-t border-slate-50 mt-4">
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest text-left">Action</span>
                                <span className="text-[10px] font-medium text-slate-400">Add to active balance tracking</span>
                            </div>
                            <button
                                className="px-10 py-4 bg-blue-600 text-white rounded-[1.5rem] font-bold flex items-center gap-3 shadow-xl shadow-blue-100 hover:bg-blue-700 hover:-translate-y-1 transition-all active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wider text-xs"
                                type="submit"
                                disabled={isPending}
                            >
                                <Plus size={18} />
                                {isPending ? "Adding..." : "Register Acccount"}
                            </button>
                        </div>
                    </div>
                </FormSection>
            </form>
        </div>
    );
};

export default BalancePartyForm;
