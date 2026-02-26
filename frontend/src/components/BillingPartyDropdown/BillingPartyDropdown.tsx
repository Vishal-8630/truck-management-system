import React, { useRef } from "react";
import { UserSquare, ChevronDown, ChevronUp, Edit3, Check, X, RotateCcw, Save, Trash2 } from "lucide-react";
import { PARTY_LABELS, type BillingPartyType } from "@/types/billingParty";
import { useMessageStore } from "@/store/useMessageStore";
import { useParties } from "@/hooks/useParties";
import { AnimatePresence, motion } from "framer-motion";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useState } from "react";

interface PartyProps {
  billingParty: BillingPartyType;
  itemState: {
    localItem: BillingPartyType;
    drafts: Partial<BillingPartyType>;
    editing: Set<keyof BillingPartyType>;
    isOpen: boolean;
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

  const confirmDelete = async () => {
    try {
      await deleteBillingPartyMutation.mutateAsync(billingParty._id);
      addMessage({ type: "success", text: "Billing party deleted successfully" });
      setShowDeleteModal(false);
    } catch {
      addMessage({ type: "error", text: "Failed to delete billing party" });
    }
  };
  const contentRef = useRef<HTMLDivElement>(null);

  const loading = updateBillingPartyMutation.isPending;

  const handleEdit = (key: keyof BillingPartyType) => {
    toggleEditing(billingParty._id, key);
    updateDraft(billingParty._id, key, itemState.localItem[key] ?? "");
  };

  const handleCancel = (key: keyof BillingPartyType) => {
    toggleEditing(billingParty._id, key);
    updateItem(billingParty._id, {
      drafts: { ...itemState.drafts, [key]: undefined },
    });
  };

  const handleSave = (key: keyof BillingPartyType) => {
    const updatedValue = itemState.drafts[key] ?? "";
    updateItem(billingParty._id, {
      localItem: { ...itemState.localItem, [key]: updatedValue },
    });
    toggleEditing(billingParty._id, key);
    updateItem(billingParty._id, {
      drafts: { ...itemState.drafts, [key]: undefined },
    });
  };

  const handleAbortChanges = () => {
    updateItem(billingParty._id, {
      localItem: { ...billingParty },
      drafts: {},
      editing: new Set(),
    });
  };

  const handleSaveChanges = async () => {
    try {
      await updateBillingPartyMutation.mutateAsync({
        id: billingParty._id,
        updatedParty: itemState.localItem,
      });
      addMessage({
        type: "success",
        text: "Billing party updated successfully",
      });
    } catch {
      addMessage({ type: "error", text: "Something went wrong" });
    }
  };

  const handleDelete = async () => {
    setShowDeleteModal(true);
  };

  const hasChanges =
    JSON.stringify(itemState.localItem) !== JSON.stringify(billingParty);

  return (
    <div className="group mb-4 transition-all duration-300">
      <button
        onClick={() => toggleOpen(billingParty._id)}
        className={`
          w-full text-left bg-white border border-slate-100 rounded-3xl p-5 flex items-center justify-between
          transition-all duration-300 hover:shadow-xl hover:shadow-blue-50/50 hover:border-blue-100
          ${itemState.isOpen ? 'shadow-2xl shadow-blue-100/40 border-blue-200 ring-4 ring-blue-50' : 'shadow-lg shadow-slate-100/50'}
        `}
      >
        <div className="flex items-center gap-6">
          <div className={`
            w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300
            ${itemState.isOpen ? 'bg-blue-600 text-white rotate-6' : 'bg-blue-50 text-blue-600'}
          `}>
            <UserSquare size={24} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest font-black text-slate-400 group-hover:text-blue-400">Billing Party</span>
            <span className="text-xl font-black text-slate-900 italic tracking-tight">{itemState.localItem.name || "Unnamed Party"}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {hasChanges && (
            <div className="px-4 py-1.5 bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
              Unsaved Changes
            </div>
          )}
          <div className={`
            w-10 h-10 rounded-xl flex items-center justify-center transition-colors
            ${itemState.isOpen ? 'bg-slate-100 text-slate-900' : 'bg-slate-50 text-slate-400'}
           `}>
            {itemState.isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>
      </button>

      <AnimatePresence>
        {itemState.isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 16 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="overflow-hidden bg-white/50 border border-slate-100 rounded-[2.5rem] backdrop-blur-xl"
          >
            <div ref={contentRef} className="p-8 flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {(Object.entries(PARTY_LABELS) as [keyof BillingPartyType, string][]).map(([key, label]) => {
                  const isEditing = itemState.editing.has(key);
                  const value = isEditing
                    ? itemState.drafts[key] ?? ""
                    : itemState.localItem[key] ?? "—";

                  return (
                    <div key={key} className="flex flex-col gap-2">
                      <div className="flex items-center justify-between group/row">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
                        {!isEditing && (
                          <button
                            onClick={() => handleEdit(key)}
                            className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-400 hover:text-blue-600 transition-all"
                          >
                            <Edit3 size={14} />
                          </button>
                        )}
                      </div>

                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            autoFocus
                            className="flex-1 bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all"
                            value={value as string}
                            onChange={(e) => updateDraft(billingParty._id, key, e.target.value)}
                          />
                          <button
                            onClick={() => handleSave(key)}
                            className="w-10 h-10 bg-green-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-green-100 hover:bg-green-600 transition-colors"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={() => handleCancel(key)}
                            className="w-10 h-10 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="text-sm font-bold text-slate-700 bg-white/50 px-4 py-3 rounded-2xl border border-slate-50 group-hover:bg-white group-hover:border-blue-50 transition-colors">
                          {value as string}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {hasChanges && (
                <div className="mt-4 pt-8 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Action Required</span>
                    <span className="text-xs font-bold text-slate-400">Please save or discard review modifications</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleAbortChanges}
                      className="px-6 py-3 bg-slate-50 text-slate-500 text-sm font-bold rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all flex items-center gap-2"
                    >
                      <RotateCcw size={16} />
                      Discard
                    </button>
                    <button
                      onClick={handleSaveChanges}
                      disabled={loading}
                      className="px-8 py-3 bg-blue-600 text-white text-sm font-bold rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-70"
                    >
                      <Save size={16} />
                      {loading ? "Saving..." : "Apply Changes"}
                    </button>
                  </div>
                </div>
              )}
              {!hasChanges && (
                <div className="flex items-center justify-end pt-4 border-t border-slate-100">
                  <button
                    onClick={handleDelete}
                    disabled={deleteBillingPartyMutation.isPending}
                    className="flex items-center gap-2 px-6 py-3 text-red-500 hover:bg-red-50 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 active:scale-95"
                  >
                    <Trash2 size={16} />
                    Delete Registration
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Billing Party?"
        message="This action is permanent and cannot be undone. Are you sure you want to remove this record?"
        confirmText="Confirm Delete"
        isLoading={deleteBillingPartyMutation.isPending}
      />
    </div>
  );
};

export default BillingPartyDropdown;
