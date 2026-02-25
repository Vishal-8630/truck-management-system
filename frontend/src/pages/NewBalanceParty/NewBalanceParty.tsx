import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import type { BalancePartyType } from "../../types/balanceParty";
import type { AppDispatch } from "../../app/store";

import FormSection from "../../components/FormSection";
import FormInput from "../../components/FormInput";
import Loading from "../../components/Loading";

import { EmptyBalanceParty } from "../../types/balanceParty";
import { addBalancePartyAsync, selectBalancePartyLoading } from "../../features/balanceParty";
import { addMessage } from "../../features/message";
import { UserSquare, Plus, ArrowLeft } from "lucide-react";

const NewBalanceParty: React.FC = () => {
  /* --------------------- Redux & Navigation --------------------- */
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector(selectBalancePartyLoading);

  /* -------------------- Local State ---------------------------- */
  const [balanceParty, setBalanceParty] = useState<Omit<BalancePartyType, "_id">>(EmptyBalanceParty);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /* ------------------- Handle Change -------------------------- */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setBalanceParty((prev) => ({ ...prev, [name]: value }));
  };

  /* ------------------ Handle form submit ----------------------- */
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const resultAction = await dispatch(addBalancePartyAsync(balanceParty));

    if (addBalancePartyAsync.fulfilled.match(resultAction)) {
      dispatch(addMessage({ type: "success", text: "Balance Party added successfully" }));
      navigate("/vehicle-entry/all-balance-parties");
    } else if (addBalancePartyAsync.rejected.match(resultAction)) {
      const errors = resultAction.payload as Record<string, string>;
      if (errors && Object.keys(errors).length > 0) {
        setErrors(errors);
      }
      dispatch(addMessage({
        type: "error",
        text: errors?.message || "Please fill all the required fields",
      }));
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="flex flex-col gap-10 pb-20 max-w-2xl mx-auto">
      <div className="flex flex-col gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest transition-colors w-fit"
        >
          <ArrowLeft size={14} />
          Back
        </button>
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight italic flex items-center gap-4">
            <UserSquare className="text-indigo-600 w-10 h-10 lg:w-12 lg:h-12" />
            New <span className="text-indigo-600">Party</span>
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
          <button
            type="submit"
            disabled={loading}
            className="w-full px-10 py-5 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:translate-y-0"
          >
            <Plus size={20} />
            Add Balance Party
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewBalanceParty;
