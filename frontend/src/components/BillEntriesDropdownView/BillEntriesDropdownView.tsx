import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ENTRY_LABELS,
  EXTRA_CHARGE_LABELS,
  type BillEntryType,
  type ExtraCharge,
} from "@/types/billEntry";
import { ChevronDown, Edit3, Check, X, Trash2, Plus, Save, RotateCcw, Building2, Calculator, ExternalLink, History } from "lucide-react";
import { useMessageStore } from "@/store/useMessageStore";
import { useBillEntries } from "@/hooks/useLedgers";
import { PARTY_LABELS, type BillingPartyType } from "@/types/billingParty";
import { formatDate } from "@/utils/formatDate";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { useNavigate } from "react-router-dom";
import DeleteConfirm from "@/components/DeleteConfirm";
import HistoryDrawer from "@/components/ui/HistoryDrawer/HistoryDrawer";

interface DropdownViewProps {
  entry: BillEntryType;
  initiallyOpen?: boolean;
  disableToggle?: boolean;
}

const dropdownVariants: Variants = {
  hidden: { height: 0, opacity: 0 },
  visible: {
    height: "auto",
    opacity: 1,
    transition: { height: { duration: 0.4, ease: "easeOut" }, opacity: { duration: 0.3 } },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: { height: { duration: 0.3, ease: "easeIn" }, opacity: { duration: 0.2 } },
  },
};

interface FieldRowProps {
  label: string;
  value: string;
  editing: boolean;
  draftValue?: string;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onChange?: (val: string) => void;
  type?: string;
  options?: { label: string; value: string }[];
  helpText?: string;
  error?: string;
  rowId: string;
}

// --- Reusable Field Row Component ---
const FieldRow: React.FC<FieldRowProps> = ({
  label,
  value,
  editing,
  draftValue,
  onEdit,
  onSave,
  onCancel,
  onChange,
  type,
  options,
  helpText,
  error,
  rowId,
}) => (
  <div
    id={rowId}
    className={`flex flex-col sm:flex-row sm:items-baseline justify-between py-4 border-b border-slate-50 last:border-0 group transition-all duration-300 ${error ? 'bg-red-50/50 -mx-4 px-4 rounded-xl border-red-100' : ''}`}
  >
    <div className={`text-xs font-bold uppercase tracking-widest mb-1 sm:mb-0 sm:w-1/3 transition-colors ${error ? 'text-red-500' : 'text-slate-400'}`}>
      {label}
    </div>
    <div className="flex-1 flex flex-col">
      <div className="flex items-center justify-between gap-4">
        {editing ? (
          <div className="flex-1 flex items-center gap-2">
            {options ? (
              <select
                className={`flex-1 px-3 py-1.5 bg-white border rounded-lg text-sm font-semibold focus:outline-none focus:ring-4 transition-all ${error ? 'border-red-300 focus:ring-red-50' : 'border-blue-200 focus:ring-blue-50'}`}
                value={draftValue ?? ""}
                onChange={(e) => onChange?.(e.target.value)}
                autoFocus
              >
                {options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={type || "text"}
                className={`flex-1 px-3 py-1.5 bg-white border rounded-lg text-sm font-semibold focus:outline-none focus:ring-4 transition-all ${error ? 'border-red-300 focus:ring-red-50' : 'border-blue-200 focus:ring-blue-50'}`}
                value={draftValue ?? ""}
                onChange={(e) => onChange?.(e.target.value)}
                autoFocus
              />
            )}
            <div className="flex items-center gap-1">
              <button
                onClick={onSave}
                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                title="Save"
              >
                <Check size={18} />
              </button>
              <button
                onClick={onCancel}
                className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                title="Cancel"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div className={`text-sm font-bold transition-colors ${error ? 'text-red-700' : 'text-slate-700'}`}>
            {value || "—"}
          </div>
        )}

        {!editing && (
          <button
            onClick={onEdit}
            className={`p-1.5 rounded-lg transition-all duration-200 ${error ? 'text-red-400 hover:text-red-600 hover:bg-red-50' : 'text-blue-400 hover:text-blue-600 hover:bg-blue-50'}`}
            title="Edit field"
          >
            <Edit3 size={16} />
          </button>
        )}
      </div>
      {(error || (editing && helpText)) && (
        <p className={`mt-1.5 text-[10px] font-bold tracking-tight animate-in fade-in slide-in-from-top-1 ${error ? 'text-red-500' : 'text-blue-500'}`}>
          {error || helpText}
        </p>
      )}
    </div>
  </div>
);

// --- Extra Charge Row Component ---
interface ExtraChargeRowProps {
  charge: ExtraCharge;
  drafts: Record<string, Partial<ExtraCharge>>;
  editingSet: Set<string>;
  startEdit: (id: string, key: keyof ExtraCharge) => void;
  saveEdit: (id: string, key: keyof ExtraCharge) => void;
  cancelEdit: (id: string, key: keyof ExtraCharge) => void;
  setDraft: (id: string, key: keyof ExtraCharge, val: string) => void;
  onDelete: (_id: string) => void;
  confirmingDelete: boolean;
}

const ExtraChargeRow: React.FC<ExtraChargeRowProps> = ({
  charge,
  drafts,
  editingSet,
  startEdit,
  saveEdit,
  cancelEdit,
  setDraft,
  onDelete,
  confirmingDelete,
}) => (
  <div className="bg-white rounded-[2rem] border border-slate-100 p-6 mb-6 last:mb-0 shadow-sm hover:shadow-md transition-all duration-300 relative group/row overflow-hidden">
    <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500 opacity-20 group-hover/row:opacity-100 transition-opacity" />
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-10">
      {Object.entries(charge)
        .filter(([k]) => k !== "_id")
        .map(([subKey, subValue]) => {
          const editKey = `${charge._id}.${subKey}`;
          const isEditing = editingSet.has(editKey);
          return (
            <div key={editKey} className="flex flex-col gap-1.5 group/field min-w-0">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] leading-none mb-1 truncate">
                {EXTRA_CHARGE_LABELS[subKey]}
              </span>

              {isEditing ? (
                <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                  <input
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:bg-white focus:border-blue-300 transition-all min-w-0"
                    value={drafts?.[charge._id]?.[subKey as keyof ExtraCharge] ?? subValue ?? ""}
                    onChange={(e) => setDraft(charge._id, subKey as keyof ExtraCharge, e.target.value)}
                    autoFocus
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    <button 
                      onClick={() => saveEdit(charge._id, subKey as keyof ExtraCharge)} 
                      className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                      title="Confirm"
                    >
                      <Check size={14} />
                    </button>
                    <button 
                      onClick={() => cancelEdit(charge._id, subKey as keyof ExtraCharge)} 
                      className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Cancel"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between min-h-[36px] bg-slate-50/50 px-3 rounded-xl border border-transparent hover:border-slate-100 transition-all">
                  <span className="text-sm font-black text-slate-800 italic uppercase truncate">
                    {subValue || "—"}
                  </span>
                  <button
                    onClick={() => startEdit(charge._id, subKey as keyof ExtraCharge)}
                    className="p-2 text-blue-400 hover:text-blue-600 hover:bg-white hover:shadow-sm rounded-lg transition-all opacity-0 group-hover/field:opacity-100 shrink-0"
                    title="Edit Field"
                  >
                    <Edit3 size={12} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
    </div>
    <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
      <div className="flex items-center gap-2 text-slate-300">
        <Calculator size={12} />
        <span className="text-[10px] font-bold uppercase tracking-widest">Extra Item</span>
      </div>
      <button
        onClick={() => onDelete(charge._id)}
        className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-red-300 hover:text-rose-600 transition-colors px-3 py-1.5 rounded-xl hover:bg-rose-50"
      >
        <Trash2 size={12} />
        {confirmingDelete ? "REMOVING..." : "REMOVE CHARGE"}
      </button>
    </div>
  </div>
);

const QuickActionLink: React.FC<{ to: string; label: string; icon: React.ReactNode; color: string }> = ({ to, label, icon, color }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={(e) => { e.stopPropagation(); navigate(to); }}
      className={`flex items-center gap-3 px-6 py-4 rounded-2xl border bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group ${color}`}
    >
      <div className="p-2 rounded-lg bg-current/10 border border-current/20">
        {icon}
      </div>
      <div className="flex flex-col items-start">
        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Navigate to</span>
        <span className="text-sm font-bold tracking-tight">{label}</span>
      </div>
      <ExternalLink size={14} className="ml-2 opacity-0 group-hover:opacity-40 transition-opacity" />
    </button>
  );
};

// --- Main DropdownView ---
const BillEntriesDropdownView: React.FC<DropdownViewProps> = ({
  entry,
  initiallyOpen = false,
  disableToggle = false,
}) => {
  const [localEntry, setLocalEntry] = useState(entry);
  const [isOpen, setIsOpen] = useState(initiallyOpen);
  const [editing, setEditing] = useState<{
    fields: Set<keyof BillEntryType>;
    extra_charges: Set<string>;
  }>({
    fields: new Set(),
    extra_charges: new Set(),
  });
  const [drafts, setDrafts] = useState<{
    fields: Partial<BillEntryType>;
    extra_charges: Record<string, Partial<ExtraCharge>>;
  }>({
    fields: {},
    extra_charges: {},
  });

  const [hasInteracted, setHasInteracted] = useState(false);
  const [valErrors, setValErrors] = useState<Record<string, string>>({});
  const [showHistory, setShowHistory] = useState(false);

  const { useUpdateBillEntryMutation, useDeleteBillEntryMutation } = useBillEntries();
  const updateBillEntryMutation = useUpdateBillEntryMutation();
  const deleteBillEntryMutation = useDeleteBillEntryMutation();
  const queryClient = useQueryClient();
  const { addMessage } = useMessageStore();

  const hasChanges = useMemo(() => hasInteracted && JSON.stringify(localEntry) !== JSON.stringify(entry), [localEntry, entry, hasInteracted]);

  const loading = updateBillEntryMutation.isPending;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteChargeId, setDeleteChargeId] = useState<string | null>(null);

  const confirmDelete = async () => {
    try {
      await deleteBillEntryMutation.mutateAsync(entry._id);
      addMessage({ type: "success", text: "Bill entry deleted successfully" });
      setShowDeleteModal(false);
    } catch {
      addMessage({ type: "error", text: "Failed to delete bill entry" });
    }
  };

  const isKeyDate = useCallback(
    (key: keyof BillEntryType) => key.toLowerCase().includes("date"),
    []
  );

  useEffect(() => {
    setLocalEntry(entry);
    setDrafts({ fields: {}, extra_charges: {} });
    setEditing({ fields: new Set(), extra_charges: new Set() });
  }, [entry]);

  useEffect(() => {
    if (initiallyOpen) setIsOpen(true);
  }, [initiallyOpen]);

  // --- Calculation Logic ---
  useEffect(() => {
    const isUP = localEntry.gst_up === "UP";
    const gstRate = isUP ? 0.09 : 0.18;
    const rate = Number(localEntry.rate) || 0;
    const advance = Number(localEntry.advance) || 0;
    const extraTotal = (localEntry.extra_charges || []).reduce(
      (sum, ec) => sum + Number(ec.amount || 0),
      0
    );
    const gst = Math.round((rate + extraTotal) * gstRate * 100) / 100;
    const subTotal = rate + extraTotal;
    const grandTotal = (isUP ? subTotal + 2 * gst : subTotal + gst) - advance;

    const updated = {
      cgst: isUP ? String(gst) : "",
      sgst: isUP ? String(gst) : "",
      igst: !isUP ? String(gst) : "",
      sub_total: String(subTotal),
      grand_total: String(grandTotal),
    };

    // Only update if changed to avoid loop
    if (
      updated.cgst !== localEntry.cgst ||
      updated.sgst !== localEntry.sgst ||
      updated.igst !== localEntry.igst ||
      updated.sub_total !== localEntry.sub_total ||
      updated.grand_total !== localEntry.grand_total
    ) {
      setLocalEntry(prev => ({ ...prev, ...updated }));
    }
  }, [localEntry.rate, localEntry.extra_charges, localEntry.gst_up, localEntry.advance]);

  // --- Field Handlers ---
  const startEditField = (key: keyof BillEntryType) => {
    let initialValue = localEntry[key];

    if (isKeyDate(key) && initialValue && typeof initialValue === "string") {
      const date = new Date(initialValue);
      if (!isNaN(date.getTime())) {
        initialValue = date.toISOString().split("T")[0];
      }
    }

    setEditing((prev) => ({ ...prev, fields: new Set(prev.fields).add(key) }));
    setDrafts((prev) => ({
      ...prev,
      fields: {
        ...prev.fields,
        [key]: initialValue ?? "",
      },
    }));
  };
  const saveField = (key: keyof BillEntryType) => {
    setLocalEntry((prev) => ({ ...prev, [key]: drafts.fields[key] }));
    setHasInteracted(true);
    setEditing((prev) => ({
      ...prev,
      fields: new Set([...prev.fields].filter((k) => k !== key)),
    }));
    setDrafts((prev) => {
      const { [key]: _, ...rest } = prev.fields;
      return { ...prev, fields: rest };
    });
    // Clear error when field is saved
    setValErrors(prev => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });
  };
  const cancelField = (key: keyof BillEntryType) => {
    setEditing((prev) => ({
      ...prev,
      fields: new Set([...prev.fields].filter((k) => k !== key)),
    }));
    setDrafts((prev) => {
      const { [key]: _, ...rest } = prev.fields;
      return { ...prev, fields: rest };
    });
  };

  // --- Extra Charge Handlers ---
  const startEditCharge = (id: string, key: keyof ExtraCharge) => {
    setEditing((prev) => ({
      ...prev,
      extra_charges: new Set(prev.extra_charges).add(`${id}.${key}`),
    }));
    setDrafts((prev) => {
      const updated = { ...prev.extra_charges };
      if (!updated[id]) updated[id] = {};
      updated[id][key] =
        localEntry.extra_charges?.find((c) => c._id === id)?.[key] ?? "";
      return { ...prev, extra_charges: updated };
    });
  };

  const saveCharge = (id: string, key: keyof ExtraCharge) => {
    setLocalEntry((prev) => ({
      ...prev,
      extra_charges: (prev.extra_charges || []).map((c) => {
        if (c._id !== id) return c;
        const newVal = drafts.extra_charges?.[id]?.[key] ?? "";
        const updated = { ...c, [key]: newVal };
        
        // Auto-calculate amount if rate or per_amount changes
        if (key === "rate" || key === "per_amount") {
          const rate = Number(updated.rate || 0);
          const perAmount = Number(updated.per_amount || 0);
          updated.amount = (rate * perAmount).toString();
        }
        
        return updated;
      }),
    }));
    setHasInteracted(true);
    setEditing((prev) => ({
      ...prev,
      extra_charges: new Set(
        [...prev.extra_charges].filter((k) => k !== `${id}.${key}`)
      ),
    }));
    setDrafts((prev) => {
      const updated = { ...prev.extra_charges };
      if (updated[id]) {
        const { [key]: _, ...rest } = updated[id];
        if (Object.keys(rest).length === 0) delete updated[id];
        else updated[id] = rest;
      }
      return { ...prev, extra_charges: updated };
    });
  };

  const cancelCharge = (id: string, key: keyof ExtraCharge) => {
    setEditing((prev) => ({
      ...prev,
      extra_charges: new Set(
        [...prev.extra_charges].filter((k) => k !== `${id}.${key}`)
      ),
    }));
    setDrafts((prev) => {
      const updated = { ...prev.extra_charges };
      if (updated[id]) {
        const { [key]: _, ...rest } = updated[id];
        if (Object.keys(rest).length > 0) updated[id] = rest;
        else delete updated[id];
      }
      return { ...prev, extra_charges: updated };
    });
  };

  const setDraftCharge = (id: string, key: keyof ExtraCharge, val: string) => {
    setDrafts((prev) => ({
      ...prev,
      extra_charges: {
        ...(prev.extra_charges ?? {}),
        [id]: { ...(prev.extra_charges?.[id] ?? {}), [key]: val },
      },
    }));
  };

  const confirmDeleteCharge = () => {
    if (deleteChargeId) {
      deleteCharge(deleteChargeId);
      setDeleteChargeId(null);
    }
  };

  const deleteCharge = (_id: string) => {
    setLocalEntry((prev) => ({
      ...prev,
      extra_charges: (prev.extra_charges || []).filter((c) => c._id !== _id),
    }));
    setHasInteracted(true);
    setDrafts((prev) => {
      const updated = { ...prev.extra_charges };
      delete updated[_id];
      return { ...prev, extra_charges: updated };
    });
    setEditing((prev) => {
      const updated = new Set(
        [...prev.extra_charges].filter((k) => !k.startsWith(_id))
      );
      return { ...prev, extra_charges: updated };
    });
  };
  const addNewCharge = () => {
    const newId = crypto.randomUUID();
    const newCharge: ExtraCharge = {
      _id: newId,
      type: "",
      rate: "",
      amount: "",
      per_amount: "",
    };
    setLocalEntry((prev) => ({
      ...prev,
      extra_charges: [...(prev.extra_charges ?? []), newCharge],
    }));
    setHasInteracted(true);
    setEditing((prev) => ({
      ...prev,
      extra_charges: new Set([
        ...prev.extra_charges,
        `${newId}.type`,
        `${newId}.rate`,
        `${newId}.per_amount`,
        `${newId}.amount`,
      ]),
    }));
    setDrafts((prev) => ({
      ...prev,
      extra_charges: {
        ...prev.extra_charges,
        [newId]: { type: "", rate: "", per_amount: "", amount: "" },
      },
    }));
  };

  const abortChanges = () => {
    setLocalEntry(entry);
    setDrafts({ fields: {}, extra_charges: {} });
    setEditing({ fields: new Set(), extra_charges: new Set() });
    setHasInteracted(false);
    setValErrors({});
  };

  const saveChanges = async () => {
    try {
      setValErrors({});
      // Add aliases for backend validation consistency
      const dataToSend = {
        ...localEntry,
        date: localEntry.bill_date,
        consignor: localEntry.consignor_name,
      };
      await updateBillEntryMutation.mutateAsync(dataToSend as any);
      await queryClient.invalidateQueries({ queryKey: ["history", "bill_entry", entry._id] });
      addMessage({ type: "success", text: "Entry updated successfully" });
      setHasInteracted(false);
    } catch (err: any) {
      const errors = err.response?.data?.errors;
      if (errors && Object.keys(errors).length > 0) {
        setValErrors(errors);

        // Map backend errors back to our fields for scrolling if needed
        const errorFields = Object.keys(errors);
        const mappedKey = errorFields[0] === 'date' ? 'bill_date' : (errorFields[0] === 'consignor' ? 'consignor_name' : errorFields[0]);

        // Scroll to the first error
        const elementId = `field-${entry._id}-${mappedKey}`;
        setTimeout(() => {
          document.getElementById(elementId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);

        Object.keys(errors).forEach((key) => {
          addMessage({ type: "error", text: errors[key] || "Failed to update entry" });
        });
      } else {
        addMessage({ type: "error", text: "Failed to update entry" });
      }
    }
  };

  const handleDelete = async () => {
    setShowDeleteModal(true);
  };

  return (
    <div className={`
      card-premium overflow-hidden border-slate-100 transition-all duration-300
      ${isOpen ? 'ring-2 ring-blue-100 ring-offset-2' : ''}
    `}>
      <div
        className={`
          flex items-center justify-between p-6 cursor-pointer select-none
          ${isOpen ? 'bg-blue-50/50' : 'bg-white hover:bg-slate-50/80'}
          transition-colors duration-200
        `}
        onClick={() => {
          if (!disableToggle) setIsOpen((s) => !s);
        }}
      >
        <div className="flex items-center gap-6">
          <div className={`
              w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300
              ${isOpen ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-400'}
           `}>
            <Building2 size={22} />
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Bill Number</span>
            <span className="text-lg font-bold text-slate-900">{localEntry.bill_no || "N/A"}</span>
          </div>

          <div className="hidden sm:flex flex-col border-l border-slate-200 pl-6 ml-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Party Name</span>
            <span className="text-sm font-semibold text-slate-600 truncate max-w-[150px]">{localEntry.billing_party?.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {hasChanges && (
            <div className="hidden sm:flex items-center gap-2 mr-2">
              <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
              <span className="text-[10px] font-bold text-blue-500 uppercase">Pending Changes</span>
            </div>
          )}
          {!disableToggle && (
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              className={`
                w-10 h-10 rounded-xl flex items-center justify-center transition-colors
                ${isOpen ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-300'}
              `}
            >
              <ChevronDown size={20} />
            </motion.div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="border-t border-slate-100"
          >
            <div className="p-6 lg:p-10 flex flex-col gap-10">
              {/* Quick Actions Bar */}
              <div className="flex flex-wrap items-center gap-4 p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100">
                <QuickActionLink
                  to={`/bill-entry/lrcopy?lr_no=${localEntry.lr_no}`}
                  label="LR Copy Document"
                  icon={<Building2 size={18} />}
                  color="text-indigo-600 border-indigo-100"
                />
                <QuickActionLink
                  to={`/bill-entry/bill?bill_no=${localEntry.bill_no}`}
                  label="Generated Bill"
                  icon={<Calculator size={18} />}
                  color="text-amber-600 border-amber-100"
                />
                
                <button
                  onClick={() => setShowHistory(true)}
                  className="flex items-center gap-3 px-6 py-4 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group text-slate-600"
                >
                  <div className="p-2 rounded-lg bg-slate-100 border border-slate-200">
                    <History size={18} />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Audit Trail</span>
                    <span className="text-sm font-bold tracking-tight">View History</span>
                  </div>
                </button>
              </div>

              {hasChanges && (
                <div className="flex items-center justify-between bg-blue-600 p-4 rounded-2xl shadow-blue-100 shadow-lg">
                  <div className="flex items-center gap-3 text-white">
                    <Save size={20} className="opacity-80" />
                    <span className="text-sm font-bold tracking-tight">You have unsaved changes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={abortChanges}
                      className="px-4 py-2 text-xs font-bold text-white/70 hover:text-white transition-colors"
                    >
                      Discard
                    </button>
                    <button
                      onClick={saveChanges}
                      disabled={loading}
                      className="px-6 py-2 bg-white text-blue-600 rounded-xl text-xs font-bold shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-70"
                    >
                      {loading ? <RotateCcw size={14} className="animate-spin" /> : <Check size={14} />}
                      Update Database
                    </button>
                  </div>
                </div>
              )}

              <div className="grid lg:grid-cols-2 gap-12">
                <div className="flex flex-col gap-8">
                  <section>
                    <h3 className="text-lg font-bold text-slate-900 italic mb-4 flex items-center gap-2">
                      <Building2 size={18} className="text-blue-600" />
                      Party Details
                    </h3>
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                      {(Object.entries(PARTY_LABELS) as [keyof BillingPartyType, string][]).map(([subKey, subLabel]) => (
                        <div key={subKey} className="flex flex-col py-3 border-b border-slate-100 last:border-0">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{subLabel}</span>
                          <span className="text-sm font-bold text-slate-700">{localEntry.billing_party?.[subKey as keyof BillingPartyType] || "—"}</span>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold text-slate-900 italic mb-4 flex items-center gap-2">
                      <Calculator size={18} className="text-blue-600" />
                      Financial Calculation
                    </h3>
                    <div className="grid gap-2">
                      {(["rate", "sub_total", "advance", "gst_up", "cgst", "igst", "sgst", "grand_total"] as (keyof BillEntryType)[]).map((subKey) => {
                        const val = localEntry[subKey as keyof BillEntryType];

                        return (
                          <FieldRow
                            key={subKey}
                            rowId={`field-${entry._id}-${subKey}`}
                            label={ENTRY_LABELS[subKey as keyof BillEntryType]}
                            value={val as string}
                            editing={editing.fields.has(subKey as keyof BillEntryType)}
                            draftValue={drafts.fields[subKey as keyof BillEntryType] as string}
                            onEdit={() => startEditField(subKey as keyof BillEntryType)}
                            onSave={() => saveField(subKey as keyof BillEntryType)}
                            onCancel={() => cancelField(subKey as keyof BillEntryType)}
                            onChange={(val) => setDrafts(p => ({ ...p, fields: { ...p.fields, [subKey]: val } }))}
                            type={isKeyDate(subKey) ? "date" : "number"}
                            error={valErrors[subKey] || (subKey === 'bill_date' ? valErrors['date'] : undefined)}
                            options={subKey === "gst_up" ? [
                              { label: "UP", value: "UP" },
                              { label: "Not UP", value: "Not UP" }
                            ] : undefined}
                            helpText={subKey === "gst_up" ? (
                              (drafts.fields.gst_up || localEntry.gst_up) === "UP"
                                ? "9% CGST + 9% SGST applied"
                                : "18% IGST applied"
                            ) : undefined}
                          />
                        );
                      })}
                    </div>

                    {/* Calculation Guide Note */}
                    <div className="mt-6 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-3xl p-5 flex flex-col gap-3">
                      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                        <Calculator size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Calculation Guide</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-500 font-bold uppercase tracking-tighter">Sub Total</span>
                          <span className="text-slate-900 dark:text-slate-100 font-black">Rate + Extra Charges</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-500 font-bold uppercase tracking-tighter">Grand Total</span>
                          <span className="text-blue-600 dark:text-blue-400 font-black italic">SubTotal + GST - Advance</span>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>

                <div className="flex flex-col gap-10">
                  <section>
                    <h3 className="text-lg font-bold text-slate-900 italic mb-4 flex items-center gap-3">
                      <Plus size={18} className="text-blue-600" />
                      Extra Charges
                    </h3>
                    <div className="flex flex-col gap-6 p-2">
                      {localEntry.extra_charges?.map((charge) => (
                        <ExtraChargeRow
                          key={charge._id}
                          charge={charge}
                          drafts={drafts.extra_charges}
                          editingSet={editing.extra_charges}
                          startEdit={startEditCharge}
                          saveEdit={saveCharge}
                          cancelEdit={cancelCharge}
                          setDraft={setDraftCharge}
                          onDelete={setDeleteChargeId}
                          confirmingDelete={deleteChargeId === charge._id}
                        />
                      ))}
                      
                      {(!localEntry.extra_charges || localEntry.extra_charges.length === 0) && (
                        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/50 text-slate-300">
                           <Plus size={32} strokeWidth={1} className="mb-2 opacity-50" />
                           <p className="text-xs font-bold uppercase tracking-widest">No extra charges added</p>
                        </div>
                      )}

                      <button
                        onClick={addNewCharge}
                        className="mt-2 w-full flex items-center justify-center gap-3 py-6 border-2 border-dashed border-indigo-100 rounded-[2.5rem] text-indigo-400 font-black text-xs uppercase tracking-widest hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-300 group"
                      >
                        <div className="p-1 px-3 bg-indigo-50 border border-indigo-100 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          <Plus size={14} />
                        </div>
                        Add New Charge Entry
                      </button>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold text-slate-900 italic mb-4">Other Information</h3>
                    <div className="grid gap-2">
                      {(Object.entries(ENTRY_LABELS) as [keyof BillEntryType, string][])
                        .filter(([k]) => !["extra_charges", "billing_party", "rate", "advance", "sub_total", "grand_total", "bill_no", "cgst", "sgst", "igst", "gst_up"].includes(k))
                        .map(([subKey, subLabel]) => (
                          <FieldRow
                            key={subKey}
                            rowId={`field-${entry._id}-${subKey}`}
                            label={subLabel}
                            value={isKeyDate(subKey) ? formatDate(new Date(localEntry[subKey] as string)) : localEntry[subKey] as string}
                            editing={editing.fields.has(subKey)}
                            draftValue={drafts.fields[subKey] as string}
                            onEdit={() => startEditField(subKey)}
                            onSave={() => saveField(subKey)}
                            onCancel={() => cancelField(subKey)}
                            onChange={(val) => setDrafts(p => ({ ...p, fields: { ...p.fields, [subKey]: val } }))}
                            type={isKeyDate(subKey) ? "date" : "text"}
                            error={valErrors[subKey] || (subKey === 'consignor_name' ? valErrors['consignor'] : undefined)}
                          />
                        ))
                      }
                    </div>
                  </section>
                </div>
              </div>

              {!hasChanges && (
                <div className="flex items-center justify-end pt-4 border-t border-slate-100">
                  <button
                    onClick={handleDelete}
                    disabled={deleteBillEntryMutation.isPending}
                    className="flex items-center gap-2 px-6 py-3 text-red-500 hover:bg-red-50 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 active:scale-95"
                  >
                    <Trash2 size={16} />
                    Delete Bill Entry
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
        title="Delete Bill Entry?"
        message="This action is permanent and cannot be undone. Are you sure you want to remove this record?"
      />

      {showHistory && (
        <HistoryDrawer
          entityType="bill_entry"
          entityId={entry._id}
          onClose={() => setShowHistory(false)}
        />
      )}

      <DeleteConfirm
        isOpen={deleteChargeId !== null}
        onClose={() => setDeleteChargeId(null)}
        onConfirm={confirmDeleteCharge}
        title="Remove Charge?"
        message="Are you sure you want to remove this extra charge? This will recalculate the bill totals."
      />
    </div>
  );
};

export default BillEntriesDropdownView;
