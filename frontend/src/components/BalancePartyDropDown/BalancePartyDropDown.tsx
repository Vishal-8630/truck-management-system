import React from "react";
import type { BalancePartyType } from "../../types/vehicleEntry";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { addMessage } from "../../features/message";
import { ChevronDown, Edit3, Check, X, RotateCcw, UserSquare, Save } from "lucide-react";
import {
  selectBalancePartyLoading,
  updateBalancePartyAsync,
} from "../../features/balanceParty";
import type { AppDispatch } from "../../app/store";
import { useItemActions } from "../../hooks/useItemActions";
import { BALANCE_PARTY_LABELS } from "../../types/balanceParty";

interface BalancePartyDropDownProps {
  balanceParty: BalancePartyType;
  itemState: {
    localItem: BalancePartyType;
    drafts: Partial<BalancePartyType>;
    editing: Set<keyof BalancePartyType>;
    isOpen: boolean;
  };
  updateItem: (id: string, newState: Partial<any>) => void;
  updateDraft: (id: string, key: keyof BalancePartyType, value: string) => void;
  toggleEditing: (id: string, key: keyof BalancePartyType) => void;
  toggleOpen: (id: string) => void;
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

const BalancePartyDropDown: React.FC<BalancePartyDropDownProps> = ({
  balanceParty,
  itemState,
  updateItem,
  updateDraft,
  toggleEditing,
  toggleOpen,
}) => {
  const dispatch: AppDispatch = useDispatch();
  const loading = useSelector(selectBalancePartyLoading);

  // Use the generic hook for all editing actions
  const { handleEdit, handleCancel, handleSave, handleAbortChanges } =
    useItemActions<BalancePartyType>(
      balanceParty,
      balanceParty._id,
      itemState,
      updateItem,
      updateDraft,
      toggleEditing
    );

  const handleSaveChanges = async () => {
    try {
      const resultAction = await dispatch(
        updateBalancePartyAsync(itemState.localItem)
      );
      if (updateBalancePartyAsync.fulfilled.match(resultAction)) {
        dispatch(addMessage({ type: "success", text: "Balance Party updated successfully" }));
      } else if (updateBalancePartyAsync.rejected.match(resultAction)) {
        const errors = resultAction.payload;
        if (errors && Object.keys(errors as object).length > 0) {
          dispatch(addMessage({ type: "error", text: Object.entries(errors as object)[0][1] as string }));
        }
      }
    } catch {
      dispatch(addMessage({ type: "error", text: "Failed to update balance party" }));
    }
  };

  const hasChanges = JSON.stringify(itemState.localItem) !== JSON.stringify(balanceParty);

  return (
    <div className={`
      card-premium overflow-hidden transition-all duration-300
      ${itemState.isOpen ? 'ring-2 ring-indigo-100 ring-offset-2' : ''}
    `}>
      <div
        className={`
          flex items-center justify-between p-6 cursor-pointer select-none
          ${itemState.isOpen ? 'bg-indigo-50/50' : 'bg-white hover:bg-slate-50/80'}
          transition-colors duration-200
        `}
        onClick={() => toggleOpen(balanceParty._id)}
      >
        <div className="flex items-center gap-6">
          <div className={`
              w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300
              ${itemState.isOpen ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-100 text-slate-400'}
           `}>
            <UserSquare size={22} />
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1 flex items-center gap-1">
              Balance Party
            </span>
            <span className="text-lg font-bold text-slate-900 leading-tight">
              {itemState.localItem.party_name || "—"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {hasChanges && (
            <div className="hidden sm:flex items-center gap-2 mr-2">
              <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
              <span className="text-[10px] font-bold text-indigo-500 uppercase">Changes Pending</span>
            </div>
          )}
          <motion.div
            animate={{ rotate: itemState.isOpen ? 180 : 0 }}
            className={`
              w-10 h-10 rounded-xl flex items-center justify-center transition-colors
              ${itemState.isOpen ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-300'}
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
                <div className="flex items-center justify-between bg-indigo-600 p-4 rounded-2xl shadow-indigo-100 shadow-lg">
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
                      className="px-6 py-2 bg-white text-indigo-600 rounded-xl text-xs font-bold shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2 active:scale-95"
                    >
                      {loading ? <RotateCcw size={14} className="animate-spin" /> : <Check size={14} />}
                      Update Account
                    </button>
                  </div>
                </div>
              )}

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-6">
                {(Object.entries(BALANCE_PARTY_LABELS) as [keyof BalancePartyType, string][]).map(([key, label]) => {
                  const isEditing = itemState.editing.has(key);
                  const value = isEditing
                    ? itemState.drafts[key] ?? ""
                    : itemState.localItem[key];

                  return (
                    <div key={key} className="flex flex-col gap-2 py-4 border-b border-slate-50 group">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                          {label}
                        </span>
                        {!isEditing && (
                          <button
                            onClick={() => handleEdit(key)}
                            className="p-1 text-slate-300 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Edit3 size={12} />
                          </button>
                        )}
                      </div>

                      {isEditing ? (
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            className="flex-1 px-3 py-1.5 bg-white border border-indigo-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-50"
                            value={value as string}
                            onChange={(e) => updateDraft(balanceParty._id, key, e.target.value)}
                            autoFocus
                          />
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleSave(key)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"><Check size={16} /></button>
                            <button onClick={() => handleCancel(key)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg"><X size={16} /></button>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm font-bold text-slate-700 mt-1 min-h-[20px]">
                          {value as string || "—"}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BalancePartyDropDown;

