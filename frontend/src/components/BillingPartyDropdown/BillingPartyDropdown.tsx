import React, { useState } from "react";
import { PARTY_LABELS, type BillingPartyType } from "@/types/billingParty";
import { useMessageStore } from "@/store/useMessageStore";
import { useParties } from "@/hooks/useParties";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { ChevronDown, Edit3, Check, X, RotateCcw, UserSquare, Save, Trash2, Building2 } from "lucide-react";
import DeleteConfirm from "@/components/DeleteConfirm";

interface PartyProps {
  billingParty: BillingPartyType;
  itemState: {
    localItem: BillingPartyType;
    drafts: Partial<BillingPartyType>;
    editing: Set<keyof BillingPartyType>;
    isOpen: boolean;
    hasInteracted: boolean;
  };
  updateItem: (partyId: string, newState: Partial<any>) => void;
  updateDraft: (
    partyId: string,
    key: keyof BillingPartyType,
    value: string
  ) => void;
  toggleEditing: (partyId: string, key: keyof BillingPartyType) => void;
  toggleOpen: (partyId: string) => void;
}

const dropDownVariants: Variants = {
  hidden: { height: 0, opacity: 0 },
  visible: {
    height: "auto",
    opacity: 1,
    transition: { height: { duration: 0.4, ease: "easeOut" }, opacity: { duration: 0.3 } }
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: { height: { duration: 0.3, ease: "easeIn" }, opacity: { duration: 0.2 } }
  },
};

const BillingPartyDropdown: React.FC<PartyProps> = ({
  billingParty,
  itemState,
  updateItem,
  updateDraft,
  toggleEditing,
  toggleOpen,
}) => {
  const { useUpdateBillingPartyMutation, useDeleteBillingPartyMutation } = useParties();
  const updateBillingPartyMutation = useUpdateBillingPartyMutation();
  const deleteBillingPartyMutation = useDeleteBillingPartyMutation();
  const { addMessage } = useMessageStore();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [valErrors, setValErrors] = useState<Record<string, string>>({});

  const confirmDelete = async () => {
    try {
      await deleteBillingPartyMutation.mutateAsync(billingParty._id);
      addMessage({ type: "success", text: "Billing party deleted successfully" });
      setShowDeleteModal(false);
    } catch {
      addMessage({ type: "error", text: "Failed to delete billing party" });
    }
  };

  const loading = updateBillingPartyMutation.isPending;

  const handleEdit = (key: keyof BillingPartyType) => {
    toggleEditing(billingParty._id, key);
    updateDraft(billingParty._id, key, itemState.localItem[key] ?? "");
  };

  const handleCancel = (key: keyof BillingPartyType) => {
    toggleEditing(billingParty._id, key);
    updateDraft(billingParty._id, key, billingParty[key] ?? ""); // Revert to original
    updateItem(billingParty._id, {
      drafts: { ...itemState.drafts, [key]: undefined },
    });
  };

  const handleSave = (key: keyof BillingPartyType) => {
    const updatedValue = itemState.drafts[key] ?? "";
    updateItem(billingParty._id, {
      localItem: { ...itemState.localItem, [key]: updatedValue },
      hasInteracted: true,
    });
    toggleEditing(billingParty._id, key);
    updateItem(billingParty._id, {
      drafts: { ...itemState.drafts, [key]: undefined },
    });
    setValErrors((prev) => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleAbortChanges = () => {
    updateItem(billingParty._id, {
      localItem: { ...billingParty },
      drafts: {},
      editing: new Set(),
      hasInteracted: false,
    });
    setValErrors({});
  };

  const handleSaveChanges = async () => {
    try {
      setValErrors({});
      await updateBillingPartyMutation.mutateAsync({
        id: billingParty._id,
        updatedParty: itemState.localItem,
      });
      addMessage({ type: "success", text: "Billing party updated successfully" });
      updateItem(billingParty._id, { hasInteracted: false });
    } catch (err: any) {
      const errors = err.response?.data?.errors;
      if (errors && Object.keys(errors as object).length > 0) {
        setValErrors(errors);

        // Scroll to the first error
        const firstErrorKey = Object.keys(errors)[0];
        const elementId = `bp-field-${billingParty._id}-${firstErrorKey}`;
        setTimeout(() => {
          document.getElementById(elementId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);

        Object.keys(errors).forEach((key) => {
          addMessage({ type: "error", text: errors[key] || "Failed to update" });
        });
      } else {
        addMessage({ type: "error", text: "Something went wrong" });
      }
    }
  };

  const handleDelete = async () => {
    setShowDeleteModal(true);
  };

  const hasChanges = itemState.hasInteracted && JSON.stringify(itemState.localItem) !== JSON.stringify(billingParty);

  const renderField = (key: keyof BillingPartyType) => {
    const label = PARTY_LABELS[key];
    if (!label) return null;

    const isEditing = itemState.editing.has(key);
    const value = isEditing
      ? itemState.drafts[key] ?? ""
      : itemState.localItem[key] || "—";
    const error = valErrors[key];

    return (
      <div
        key={key}
        id={`bp-field-${billingParty._id}-${key}`}
        className={`flex flex-col gap-2 py-4 border-b border-slate-50 last:border-0 group transition-all duration-300 ${error ? 'bg-red-50/50 -mx-4 px-4 rounded-xl border-red-100' : ''}`}
      >
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-bold uppercase tracking-widest leading-none transition-colors ${error ? 'text-red-500' : 'text-slate-400'}`}>
            {label}
          </span>
          {!isEditing && (
            <button
              onClick={() => handleEdit(key)}
              className={`p-1.5 rounded-lg transition-all ${error ? 'text-red-400 hover:text-red-600 hover:bg-red-50' : 'text-blue-400 hover:text-blue-600 hover:bg-blue-50'}`}
            >
              <Edit3 size={12} />
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="flex items-center gap-2 mt-1">
            <input
              autoFocus
              className={`flex-1 px-3 py-1.5 bg-white border rounded-lg text-sm font-bold focus:outline-none focus:ring-4 transition-all ${error ? 'border-red-300 focus:ring-red-50' : 'border-blue-200 focus:ring-blue-50'}`}
              value={value as string}
              onChange={(e) => updateDraft(billingParty._id, key, e.target.value)}
            />
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleSave(key)}
                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
              >
                <Check size={16} />
              </button>
              <button
                onClick={() => handleCancel(key)}
                className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ) : (
          <span className={`text-sm font-bold mt-1 min-h-[20px] transition-colors ${error ? 'text-red-700' : 'text-slate-700'}`}>
            {value as string}
          </span>
        )}

        {error && (
          <p className="text-[10px] font-bold text-red-500 mt-1 animate-in fade-in slide-in-from-top-1">
            {error}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className={`
      card-premium overflow-hidden transition-all duration-300 mb-4
      ${itemState.isOpen ? 'ring-2 ring-blue-100 ring-offset-2' : ''}
    `}>
      <div
        className={`
          flex items-center justify-between p-6 cursor-pointer select-none
          ${itemState.isOpen ? 'bg-blue-50/50' : 'bg-white hover:bg-slate-50/80'}
          transition-colors duration-200
        `}
        onClick={() => toggleOpen(billingParty._id)}
      >
        <div className="flex items-center gap-6">
          <div className={`
              w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300
              ${itemState.isOpen ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-400'}
           `}>
            <Building2 size={22} />
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1 flex items-center gap-1">
              Billing Party
            </span>
            <span className="text-lg font-bold text-slate-900 leading-tight italic uppercase tracking-tight">
              {itemState.localItem.name || "—"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {hasChanges && (
            <div className="hidden sm:flex items-center gap-2 mr-2">
              <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
              <span className="text-[10px] font-bold text-blue-500 uppercase">Unsaved</span>
            </div>
          )}
          <motion.div
            animate={{ rotate: itemState.isOpen ? 180 : 0 }}
            className={`
              w-10 h-10 rounded-xl flex items-center justify-center transition-colors
              ${itemState.isOpen ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-300'}
            `}
          >
            <ChevronDown size={20} />
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {itemState.isOpen && (
          <motion.div
            variants={dropDownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="border-t border-slate-100"
          >
            <div className="p-6 lg:p-10 flex flex-col gap-10">
              {hasChanges && (
                <div className="flex items-center justify-between bg-blue-600 p-4 rounded-2xl shadow-blue-100 shadow-lg">
                  <div className="flex items-center gap-3 text-white">
                    <Save size={20} className="opacity-80" />
                    <span className="text-sm font-bold tracking-tight">You have unsaved changes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAbortChanges}
                      className="px-4 py-2 text-xs font-bold text-white/70 hover:text-white transition-colors"
                    >
                      Discard
                    </button>
                    <button
                      onClick={handleSaveChanges}
                      disabled={loading}
                      className="px-6 py-2 bg-white text-blue-600 rounded-xl text-xs font-bold shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-70"
                    >
                      {loading ? <RotateCcw size={14} className="animate-spin" /> : <Check size={14} />}
                      Update Account
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-12">
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                    <UserSquare size={18} className="text-blue-500" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Account Details</h3>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-12">
                    {Object.keys(PARTY_LABELS).map((key) => renderField(key as keyof BillingPartyType))}
                  </div>
                </div>
              </div>

              {!hasChanges && (
                <div className="flex items-center justify-end pt-4 border-t border-slate-50">
                  <button
                    onClick={handleDelete}
                    disabled={deleteBillingPartyMutation.isPending}
                    className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                    Delete Account
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <DeleteConfirm
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Billing Party?"
        message="This action is permanent and cannot be undone. Are you sure you want to remove this record?"
      />
    </div>
  );
};

export default BillingPartyDropdown;
