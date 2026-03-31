import React, { useState } from "react";
import {
  VEHICLE_ENTRY_LABELS,
  type VehicleEntryType,
} from "@/types/vehicleEntry";
import { useMessageStore } from "@/store/useMessageStore";
import { useVehicleEntries } from "@/hooks/useLedgers";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { ChevronDown, Edit3, Check, X, RotateCcw, Truck, MapPin, Calendar, Save, Trash2, Calculator } from "lucide-react";
import { formatDate } from "@/utils/formatDate";
import DeleteConfirm from "@/components/DeleteConfirm";

interface VehicleEntryDropdownProps {
  vehicleEntry: VehicleEntryType;
  itemState: {
    localItem: VehicleEntryType;
    drafts: Partial<VehicleEntryType>;
    editing: Set<keyof VehicleEntryType>;
    isOpen: boolean;
    hasInteracted: boolean;
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
  const [valErrors, setValErrors] = useState<Record<string, string>>({});

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
      hasInteracted: true,
    });
    toggleEditing(vehicleEntry._id, key);
    updateItem(vehicleEntry._id, {
      drafts: { ...itemState.drafts, [key]: undefined },
    });
    // Clear error when field is saved
    setValErrors((prev) => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleAbortChanges = () => {
    updateItem(vehicleEntry._id, {
      localItem: { ...vehicleEntry },
      drafts: {},
      editing: new Set(),
      hasInteracted: false,
    });
    setValErrors({});
  };

  const handleSaveChanges = async () => {
    try {
      setValErrors({});
      await updateVehicleEntryMutation.mutateAsync(itemState.localItem);
      addMessage({ type: "success", text: "Vehicle entry updated successfully" });
      onVehicleEntryUpdate(itemState.localItem);
      updateItem(vehicleEntry._id, { hasInteracted: false });
    } catch (err: any) {
      const errors = err.response?.data?.errors;
      if (errors && Object.keys(errors).length > 0) {
        setValErrors(errors);

        // Scroll to the first error
        const firstErrorKey = Object.keys(errors)[0];
        const elementId = `v-field-${vehicleEntry._id}-${firstErrorKey}`;
        setTimeout(() => {
          document.getElementById(elementId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);

        Object.keys(errors).forEach((key) => {
          addMessage({ type: "error", text: errors[key] || "Failed to update entry" });
        });
      } else {
        addMessage({ type: "error", text: "Something went wrong" });
      }
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

  const hasChanges = itemState.hasInteracted && JSON.stringify(itemState.localItem) !== JSON.stringify(vehicleEntry);
  const loading = updateVehicleEntryMutation.isPending;

  const tripInfoKeys: (keyof VehicleEntryType)[] = ["date", "vehicle_no", "from", "to"];
  const financialKeys: (keyof VehicleEntryType)[] = ["freight", "driver_cash", "dala", "kamisan", "in_ac", "halting", "balance"];
  const otherKeys: (keyof VehicleEntryType)[] = ["balance_party", "owner", "status", "halting_in_date", "halting_out_date", "pod_stock"];

  const renderField = (key: keyof VehicleEntryType) => {
    const label = VEHICLE_ENTRY_LABELS[key];
    const isEditing = itemState.editing.has(key);
    const isBalanceParty = (key as string) === "balance_party";
    const error = valErrors[key];
    const isCalculated = key === "balance";

    const value = isEditing
      ? itemState.drafts[key] ?? ""
      : isBalanceParty
        ? itemState.localItem["balance_party"]?.party_name ?? "-"
        : isKeyDate(key)
          ? formatDate(new Date(itemState.localItem[key] as string))
          : itemState.localItem[key] ?? "—";

    return (
      <div
        key={key}
        id={`v-field-${vehicleEntry._id}-${key}`}
        className={`flex flex-col gap-2 py-4 border-b border-slate-50 last:border-0 group transition-all duration-300 ${error ? 'bg-red-50/50 -mx-4 px-4 rounded-xl border-red-100' : ''}`}
      >
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-bold uppercase tracking-widest leading-none transition-colors ${error ? 'text-red-500' : 'text-slate-400'}`}>
            {label}
            {isCalculated && <span className="ml-2 text-[8px] px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded-full font-black uppercase tracking-tighter">Auto</span>}
          </span>
          {!isEditing && !isBalanceParty && !isCalculated && (
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
            {key === "status" ? (
              <select
                className={`flex-1 px-3 py-1.5 bg-white border rounded-lg text-sm font-bold focus:outline-none focus:ring-4 transition-all ${error ? 'border-red-300 focus:ring-red-50' : 'border-indigo-200 focus:ring-indigo-50'}`}
                value={value as string}
                onChange={(e) => updateDraft(vehicleEntry._id, key, e.target.value)}
                autoFocus
              >
                <option value="Pending">Pending</option>
                <option value="Received">Received</option>
              </select>
            ) : (
              <input
                type={isKeyDate(key) ? "date" : "text"}
                className={`flex-1 px-3 py-1.5 bg-white border rounded-lg text-sm font-bold focus:outline-none focus:ring-4 transition-all ${error ? 'border-red-300 focus:ring-red-50' : 'border-indigo-200 focus:ring-indigo-50'}`}
                value={value as string}
                onChange={(e) => updateDraft(vehicleEntry._id, key, e.target.value)}
                autoFocus
              />
            )}
            <div className="flex items-center gap-1">
              <button onClick={() => handleSave(key)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"><Check size={16} /></button>
              <button onClick={() => handleCancel(key)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg"><X size={16} /></button>
            </div>
          </div>
        ) : (
          <span className={`text-sm font-bold mt-1 min-h-[20px] transition-colors ${error ? 'text-red-700' : 'text-slate-700'} ${isCalculated ? 'text-blue-600' : ''}`}>
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
                      className="px-6 py-2 bg-white text-blue-600 rounded-xl text-xs font-bold shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-70"
                    >
                      {loading ? <RotateCcw size={14} className="animate-spin" /> : <Check size={14} />}
                      Update Records
                    </button>
                  </div>
                </div>
              )}

              {/* Grouped Content */}
              <div className="flex flex-col gap-12">
                {/* Trip & Vehicle Section */}
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                    <MapPin size={18} className="text-blue-500" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Trip & Vehicle Information</h3>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-12">
                    {tripInfoKeys.map(renderField)}
                  </div>
                </div>

                {/* Financial Section */}
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                    <Calculator size={18} className="text-emerald-500" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Financial Calculation</h3>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-12">
                    {financialKeys.map(renderField)}
                  </div>

                  {/* Calculation Breakdown Note */}
                  <div className="bg-indigo-50/50 border border-indigo-100 rounded-[2rem] p-6 mt-2 flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-indigo-600">
                      <Calculator size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Calculation Guide</span>
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-bold uppercase tracking-tighter">Gross Amount</span>
                        <span className="text-slate-900 font-black">Freight + Halting</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-bold uppercase tracking-tighter">Total Deductions</span>
                        <span className="text-slate-900 font-black">Cash + Dala + Kamisan + A/C</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-bold uppercase tracking-tighter">Net Balance</span>
                        <span className="text-indigo-600 font-black">Gross - Deductions</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Other Details Section */}
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                    <Save size={18} className="text-slate-400" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Other Information</h3>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-12">
                    {otherKeys.map(renderField)}
                  </div>
                </div>
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
      <DeleteConfirm
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Vehicle Entry?"
        message="This action is permanent and cannot be undone. Are you sure you want to remove this record?"
      />
    </div>
  );
};

export default VehicleEntryDropdown;
