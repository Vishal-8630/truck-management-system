import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Loading from "@/components/Loading";
import BillingPartyDropdown from "@/components/BillingPartyDropdown";
import { useParties } from "@/hooks/useParties";
import { useItemStates } from "@/hooks/useItemStates";
import type { BillingPartyType } from "@/types/billingParty";

const BillingPartyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useBillingPartiesQuery } = useParties();
  const { data: billingParties = [], isLoading } = useBillingPartiesQuery();

  const party = useMemo(
    () => billingParties.find((item: BillingPartyType) => item._id === id),
    [billingParties, id]
  );

  const singleItem = party ? [party] : [];
  const { itemStates, updateItem, updateDraft, toggleEditing, toggleOpen } =
    useItemStates<BillingPartyType>(singleItem);

  useEffect(() => {
    if (party && itemStates[party._id] && !itemStates[party._id].isOpen) {
      updateItem(party._id, { isOpen: true });
    }
  }, [party, itemStates, updateItem]);

  if (isLoading || !party || !itemStates[party._id]) return <Loading />;

  return (
    <div className="flex flex-col gap-8 pb-20">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest transition-colors w-fit"
      >
        <ArrowLeft size={14} /> Back to Billing Parties
      </button>

      <BillingPartyDropdown
        billingParty={party}
        itemState={itemStates[party._id]}
        updateItem={updateItem}
        updateDraft={updateDraft}
        toggleEditing={toggleEditing}
        toggleOpen={toggleOpen}
        disableToggle
      />
    </div>
  );
};

export default BillingPartyDetail;
