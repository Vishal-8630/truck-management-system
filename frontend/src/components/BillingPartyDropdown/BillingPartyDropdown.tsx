import { UserSquare, ChevronDown, ChevronUp, Edit3, Check, X, RotateCcw, Save } from "lucide-react";
import { PARTY_LABELS, type BillingPartyType } from "../../types/billingParty";
import { useDispatch, useSelector } from "react-redux";
import { selectAuthLoading } from "../../features/auth/authSelectors";
import { addMessage } from "../../features/message";
import { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { updateBillingPartyAsync } from "../../features/billingParty";
import type { AppDispatch } from "../../app/store";

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
  const dispatch: AppDispatch = useDispatch();
  const loading = useSelector(selectAuthLoading);
  const contentRef = useRef<HTMLDivElement>(null);

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
      const resultAction = await dispatch(
        updateBillingPartyAsync(itemState.localItem)
      );
      if (updateBillingPartyAsync.fulfilled.match(resultAction)) {
        dispatch(
          addMessage({
            type: "success",
            text: "Billing party updated successfully",
          })
        );
      } else if (updateBillingPartyAsync.rejected.match(resultAction)) {
        const errors = resultAction.payload as Record<string, string>;
        if (errors) {
          dispatch(
            addMessage({ type: "error", text: Object.entries(errors)[0][1] })
          );
        }
      }
    } catch {
      dispatch(addMessage({ type: "error", text: "Something went wrong" }));
    }
  };

  const hasChanges =
    JSON.stringify(itemState.localItem) !== JSON.stringify(billingParty);

  return (
    <div className="group mb-4 transition-all duration-300">
      <button
        onClick={() => toggleOpen(billingParty._id)}
        className={`
          w-full text-left bg-white border border-slate-100 rounded-3xl p-5 flex items-center justify-between
          transition-all duration-300 hover:shadow-xl hover:shadow-indigo-50/50 hover:border-indigo-100
          ${itemState.isOpen ? 'shadow-2xl shadow-indigo-100/40 border-indigo-200 ring-4 ring-indigo-50' : 'shadow-lg shadow-slate-100/50'}
        `}
      >
        <div className="flex items-center gap-6">
          <div className={`
            w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300
            ${itemState.isOpen ? 'bg-indigo-600 text-white rotate-6' : 'bg-indigo-50 text-indigo-600'}
          `}>
            <UserSquare size={24} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest font-black text-slate-400 group-hover:text-indigo-400">Billing Party</span>
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
                            className="opacity-0 group-hover/row:opacity-100 transition-all p-1 hover:bg-indigo-50 rounded-lg text-indigo-400 hover:text-indigo-600"
                          >
                            <Edit3 size={14} />
                          </button>
                        )}
                      </div>

                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            autoFocus
                            className="flex-1 bg-white border border-indigo-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all"
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
                        <div className="text-sm font-bold text-slate-700 bg-white/50 px-4 py-3 rounded-2xl border border-slate-50 group-hover:bg-white group-hover:border-indigo-50 transition-colors">
                          {value}
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
                      className="px-8 py-3 bg-indigo-600 text-white text-sm font-bold rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                    >
                      <Save size={16} />
                      {loading ? "Saving..." : "Apply Changes"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BillingPartyDropdown;

