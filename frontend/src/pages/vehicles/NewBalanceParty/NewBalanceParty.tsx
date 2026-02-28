import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import type { BalancePartyType } from "@/types/balanceParty";
import { useParties } from "@/hooks/useParties";
import { useMessageStore } from "@/store/useMessageStore";

import FormSection from "@/components/FormSection";
import FormInput from "@/components/FormInput";
import Button from "@/components/Button";

import { EmptyBalanceParty } from "@/types/balanceParty";
import { UserSquare, Plus, ArrowLeft } from "lucide-react";

const NewBalanceParty: React.FC = () => {
  const navigate = useNavigate();
  const { useAddBalancePartyMutation } = useParties();
  const addBalancePartyMutation = useAddBalancePartyMutation();
  const { addMessage } = useMessageStore();

  const [balanceParty, setBalanceParty] = useState<Omit<BalancePartyType, "_id">>(EmptyBalanceParty);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (value: string, name: string) => {
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setBalanceParty((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addBalancePartyMutation.mutateAsync(balanceParty);
      addMessage({ type: "success", text: "Balance Party added successfully" });
      navigate("/vehicle-entry/all-balance-parties");
    } catch (err: any) {
      const serverErrors = err.response?.data?.errors || err;
      if (serverErrors && Object.keys(serverErrors).length > 0) {
        setErrors(serverErrors);
      }
      addMessage({
        type: "error",
        text: serverErrors.message || serverErrors.general || "Please fill all the required fields",
      });
    }
  };

  return (
    <div className="flex flex-col gap-10 pb-20 max-w-2xl mx-auto">
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
            <UserSquare className="text-blue-600 w-10 h-10 lg:w-12 lg:h-12" />
            New <span className="text-blue-600">Party</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg">Create a new balance party for vehicle logs.</p>
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className="flex flex-col gap-8">
        <FormSection title="Party Information" icon={<UserSquare size={18} />}>
          <div className="flex flex-col gap-6">
            <FormInput
              type="text"
              id="party_name"
              name="party_name"
              label="Party Name"
              value={balanceParty.party_name}
              placeholder="Enter full party name..."
              error={errors.party_name}
              onChange={handleInputChange}
            />
          </div>
        </FormSection>

        <div className="flex justify-end pt-6 border-t border-slate-100">
          <Button
            type="submit"
            isLoading={addBalancePartyMutation.isPending}
            icon={<Plus size={20} />}
            className="w-full py-5"
          >
            Add Balance Party
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewBalanceParty;
