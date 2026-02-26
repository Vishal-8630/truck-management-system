import React, { useState } from "react";
import {
  VEHICLE_ENTRY_LABELS,
  type VehicleEntryType,
} from "@/types/vehicleEntry";
import { useMessageStore } from "@/store/useMessageStore";
import { useVehicleEntries } from "@/hooks/useLedgers";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { ChevronDown, Edit3, Check, X, RotateCcw, Truck, MapPin, Calendar, Save, Trash2 } from "lucide-react";
import { formatDate } from "@/utils/formatDate";
import ConfirmModal from "@/components/ui/ConfirmModal";

interface VehicleEntryDropdownProps {
  vehicleEntry: VehicleEntryType;
  itemState: {
    localItem: VehicleEntryType;
    drafts: Partial<VehicleEntryType>;
    editing: Set<keyof VehicleEntryType>;
    isOpen: boolean;
  };
  updateItem: (id: string, newState: Partial<any>) => void;
  updateDraft: (id: string, key: keyof VehicleEntryType, value: string) => void;
  toggleEditing: (id: string, key: keyof VehicleEntryType) => void;
  toggleOpen: (id: string) => void;
  onVehicleEntryUpdate: (updatedVehicleEntry: VehicleEntryType) => void;
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

const VehicleEntryDropdown: React.FC<VehicleEntryDropdownProps> = ({
  vehicleEntry,
  itemState,
  updateItem,
  updateDraft,
  toggleEditing,
  toggleOpen,
  onVehicleEntryUpdate,
}) => {
  const { useUpdateVehicleEntryMutation, useDeleteVehicleEntryMutation } = useVehicleEntries();
  const updateVehicleEntryMutation = useUpdateVehicleEntryMutation();
  const deleteVehicleEntryMutation = useDeleteVehicleEntryMutation();
  const { addMessage } = useMessageStore();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const confirmDelete = async () => {
    try {
      await deleteVehicleEntryMutation.mutateAsync(vehicleEntry._id);
      addMessage({ type: "success", text: "Vehicle entry deleted successfully" });
      setShowDeleteModal(false);
    } catch {
      addMessage({ type: "error", text: "Failed to delete vehicle entry" });
    }
  };

  const isKeyDate = (key: keyof VehicleEntryType) =>
    key.toLowerCase().includes("date");

  const handleEdit = (key: keyof VehicleEntryType) => {
    toggleEditing(vehicleEntry._id, key);
    updateDraft(
      vehicleEntry._id,
      key,
      (itemState.localItem[key] as string) ?? ""
    );
  };

  const handleCancel = (key: keyof VehicleEntryType) => {
    toggleEditing(vehicleEntry._id, key);
    updateItem(vehicleEntry._id, {
      drafts: { ...itemState.drafts, [key]: undefined },
    });
  };

  const handleSave = (key: keyof VehicleEntryType) => {
    const updatedValue = itemState.drafts[key] ?? "";
    updateItem(vehicleEntry._id, {
      localItem: {
        ...itemState.localItem,
        [key]: updatedValue,
      },
    });
    toggleEditing(vehicleEntry._id, key);
    updateItem(vehicleEntry._id, {
      drafts: { ...itemState.drafts, [key]: undefined },
    });
  };

  const handleAbortChanges = () => {
    updateItem(vehicleEntry._id, {
      localItem: { ...vehicleEntry },
      drafts: {},
      editing: new Set(),
    });
  };

  const handleSaveChanges = async () => {
    try {
      await updateVehicleEntryMutation.mutateAsync(itemState.localItem);
      addMessage({ type: "success", text: "Vehicle entry updated successfully" });
      onVehicleEntryUpdate(itemState.localItem);
    } catch {
      addMessage({ type: "error", text: "Something went wrong" });
    }
  };

  // --- Calculation Logic ---
  React.useEffect(() => {
    const freight = Number(itemState.localItem.freight) || 0;
    const driver_cash = Number(itemState.localItem.driver_cash) || 0;
    const dala = Number(itemState.localItem.dala) || 0;
    const kamisan = Number(itemState.localItem.kamisan) || 0;
    const in_ac = Number(itemState.localItem.in_ac) || 0;
    const halting = Number(itemState.localItem.halting) || 0;
    const balance = freight - (driver_cash + dala + kamisan + in_ac) + halting;

    if (String(balance) !== itemState.localItem.balance) {
      updateItem(vehicleEntry._id, {
        localItem: { ...itemState.localItem, balance: String(balance) },
      });
    }
  }, [
    itemState.localItem.freight,
    itemState.localItem.driver_cash,
    itemState.localItem.dala,
    itemState.localItem.kamisan,
    itemState.localItem.in_ac,
    itemState.localItem.halting,
    vehicleEntry._id,
    updateItem,
    itemState.localItem.balance
  ]);

  const handleDelete = async () => {
    setShowDeleteModal(true);
  };

  const hasChanges = JSON.stringify(itemState.localItem) !== JSON.stringify(vehicleEntry);
  const loading = updateVehicleEntryMutation.isPending;

  return (
    <div className={`
      card-premium overflow-hidden transition-all duration-300
      ${itemState.isOpen ? 'ring-2 ring-blue-100 ring-offset-2' : ''}
    `}>
      <div
        className={`
          flex items-center justify-between p-6 cursor-pointer select-none
          ${itemState.isOpen ? 'bg-blue-50/50' : 'bg-white hover:bg-slate-50/80'}
          transition-colors duration-200
        `}
        onClick={() => toggleOpen(vehicleEntry._id)}
      >
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          <div className={`
              w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300
              ${itemState.isOpen ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-400'}
           `}>
            <Truck size={22} />
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1 flex items-center gap-1">
              <Calendar size={10} /> Date
            </span>
            <span className="text-sm font-bold text-slate-900">
              {formatDate(new Date(itemState.localItem.date)) || "—"}
            </span>
          </div>

          <div className="flex flex-col border-l border-slate-200 pl-6">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Vehicle No.</span>
            <span className="text-sm font-bold text-slate-900 leading-tight uppercase tracking-tight">
              {itemState.localItem.vehicle_no || "—"}
            </span>
          </div>

          <div className="hidden lg:flex flex-col border-l border-slate-200 pl-6">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1 flex items-center gap-1">
              <MapPin size={10} /> Route
            </span>
            <span className="text-sm font-semibold text-slate-600">
              {itemState.localItem.from || "—"} <span className="text-slate-300 mx-1">→</span> {itemState.localItem.to || "—"}
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
                      className="px-6 py-2 bg-white text-blue-600 rounded-xl text-xs font-bold shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2 active:scale-95"
                    >
                      {loading ? <RotateCcw size={14} className="animate-spin" /> : <Check size={14} />}
                      Update Records
                    </button>
                  </div>
                </div>
              )}

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-6">
                {(Object.entries(VEHICLE_ENTRY_LABELS) as [keyof VehicleEntryType, string][]).map(([key, label]) => {
                  const isEditing = itemState.editing.has(key);
                  const isBalanceParty = (key as string) === "balance_party";
                  const value = isEditing
                    ? itemState.drafts[key] ?? ""
                    : isBalanceParty
                      ? itemState.localItem["balance_party"]?.party_name ?? "-"
                      : isKeyDate(key)
                        ? formatDate(new Date(itemState.localItem[key] as string))
                        : itemState.localItem[key] ?? "—";

                  return (
                    <div key={key} className="flex flex-col gap-2 py-4 border-b border-slate-50 group">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                          {label}
                        </span>
                        {!isEditing && !isBalanceParty && (
                          <button
                            onClick={() => handleEdit(key)}
                            className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          >
                            <Edit3 size={12} />
                          </button>
                        )}
                      </div>

                      {isEditing ? (
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type={isKeyDate(key) ? "date" : "text"}
                            className="flex-1 px-3 py-1.5 bg-white border border-indigo-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-50"
                            value={value as string}
                            onChange={(e) => updateDraft(vehicleEntry._id, key, e.target.value)}
                            autoFocus
                          />
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleSave(key)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"><Check size={16} /></button>
                            <button onClick={() => handleCancel(key)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg"><X size={16} /></button>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm font-bold text-slate-700 mt-1 min-h-[20px]">
                          {value as string}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {!hasChanges && (
                <div className="flex items-center justify-end pt-4 border-t border-slate-50">
                  <button
                    onClick={handleDelete}
                    disabled={deleteVehicleEntryMutation.isPending}
                    className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                    Delete Record
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
        title="Delete Vehicle Entry?"
        message="This action is permanent and cannot be undone. Are you sure you want to remove this record?"
        confirmText="Confirm Delete"
        isLoading={deleteVehicleEntryMutation.isPending}
      />
    </div>
  );
};

export default VehicleEntryDropdown;
