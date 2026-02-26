import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  ENTRY_LABELS,
  EXTRA_CHARGE_LABELS,
  type BillEntryType,
  type ExtraCharge,
} from "@/types/billEntry";
import { ChevronDown, Edit3, Check, X, Trash2, Plus, Save, RotateCcw, Building2, User } from "lucide-react";
import { useMessageStore } from "@/store/useMessageStore";
import { useBillEntries } from "@/hooks/useLedgers";
import { PARTY_LABELS, type BillingPartyType } from "@/types/billingParty";
import { formatDate } from "@/utils/formatDate";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import ConfirmModal from "@/components/ui/ConfirmModal";

// --- Props ---
interface DropdownViewProps {
  entry: BillEntryType;
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
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-slate-50 last:border-0 group">
    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 sm:mb-0 sm:w-1/3">{label}</div>
    <div className="flex-1 flex items-center justify-between gap-4">
      {editing ? (
        <div className="flex-1 flex items-center gap-2">
          <input
            type={type || "text"}
            className="flex-1 px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-50"
            value={draftValue ?? ""}
            onChange={(e) => onChange?.(e.target.value)}
            autoFocus
          />
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
        <div className="text-sm font-bold text-slate-700">{value || "—"}</div>
      )}

      {!editing && (
        <button
          onClick={onEdit}
          className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
          title="Edit field"
        >
          <Edit3 size={16} />
        </button>
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
}) => (
  <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-4 mb-4 last:mb-0">
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4">
      {Object.entries(charge)
        .filter(([k]) => k !== "_id")
        .map(([subKey, subValue]) => {
          const editKey = `${charge._id}.${subKey}`;
          const isEditing = editingSet.has(editKey);
          return (
            <div key={editKey} className="flex flex-col gap-1 group/field">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                  {EXTRA_CHARGE_LABELS[subKey]}
                </span>
              </div>

              {isEditing ? (
                <div className="flex items-center gap-1">
                  <input
                    className="flex-1 px-2 py-1 bg-white border border-blue-200 rounded-md text-xs font-bold focus:outline-none"
                    value={drafts?.[charge._id]?.[subKey as keyof ExtraCharge] ?? subValue ?? ""}
                    onChange={(e) => setDraft(charge._id, subKey as keyof ExtraCharge, e.target.value)}
                    autoFocus
                  />
                  <button onClick={() => saveEdit(charge._id, subKey as keyof ExtraCharge)} className="p-1 text-emerald-600"><Check size={14} /></button>
                  <button onClick={() => cancelEdit(charge._id, subKey as keyof ExtraCharge)} className="p-1 text-slate-400"><X size={14} /></button>
                </div>
              ) : (
                <div className="flex items-center justify-between group/field">
                  <span className="text-sm font-bold text-slate-700">{subValue || "—"}</span>
                  <button
                    onClick={() => startEdit(charge._id, subKey as keyof ExtraCharge)}
                    className="p-1 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-all opacity-0 group-hover/field:opacity-100"
                  >
                    <Edit3 size={12} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
    </div>
    <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
      <button
        onClick={() => onDelete(charge._id)}
        className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-600 transition-colors px-2 py-1 rounded-md hover:bg-red-50"
      >
        <Trash2 size={14} />
        Remove Charge
      </button>
    </div>
  </div >
);

// --- Main DropdownView ---
const BillEntriesDropdownView: React.FC<DropdownViewProps> = ({ entry }) => {
  const [localEntry, setLocalEntry] = useState(entry);
  const [isOpen, setIsOpen] = useState(false);
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
  const { useUpdateBillEntryMutation, useDeleteBillEntryMutation } = useBillEntries();
  const updateBillEntryMutation = useUpdateBillEntryMutation();
  const deleteBillEntryMutation = useDeleteBillEntryMutation();
  const { addMessage } = useMessageStore();

  const hasChanges = useMemo(() => hasInteracted && JSON.stringify(localEntry) !== JSON.stringify(entry), [localEntry, entry, hasInteracted]);

  const loading = updateBillEntryMutation.isPending;
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
    setEditing((prev) => ({ ...prev, fields: new Set(prev.fields).add(key) }));
    setDrafts((prev) => ({
      ...prev,
      fields: {
        ...prev.fields,
        [key]:
          isKeyDate(key) && typeof localEntry[key] === "string"
            ? formatDate(new Date(localEntry[key]))
            : localEntry[key] ?? "",
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
      extra_charges: prev.extra_charges.map((c) =>
        c._id === id
          ? { ...c, [key]: drafts.extra_charges?.[id]?.[key] ?? c[key] }
          : c
      ),
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
  const deleteCharge = (_id: string) => {
    setLocalEntry((prev) => ({
      ...prev,
      extra_charges: prev.extra_charges.filter((c) => c._id !== _id),
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
  };

  const saveChanges = async () => {
    try {
      await updateBillEntryMutation.mutateAsync(localEntry);
      addMessage({ type: "success", text: "Entry updated successfully" });
    } catch (err: any) {
      const errors = err.response?.data?.errors;
      if (errors && Object.keys(errors).length > 0) {
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
        onClick={() => setIsOpen((s) => !s)}
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
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            className={`
              w-10 h-10 rounded-xl flex items-center justify-center transition-colors
              ${isOpen ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-300'}
            `}
          >
            <ChevronDown size={20} />
          </motion.div>
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
                      <User size={18} className="text-blue-600" />
                      Key Metrics
                    </h3>
                    <div className="grid gap-2">
                      {["rate", "advance", "sub_total", "grand_total"].map((key) => (
                        <FieldRow
                          key={key}
                          label={ENTRY_LABELS[key as keyof BillEntryType]}
                          value={localEntry[key as keyof BillEntryType] as string}
                          editing={editing.fields.has(key as keyof BillEntryType)}
                          draftValue={drafts.fields[key as keyof BillEntryType] as string}
                          onEdit={() => startEditField(key as keyof BillEntryType)}
                          onSave={() => saveField(key as keyof BillEntryType)}
                          onCancel={() => cancelField(key as keyof BillEntryType)}
                          onChange={(val) => setDrafts(p => ({ ...p, fields: { ...p.fields, [key]: val } }))}
                          type="number"
                        />
                      ))}
                    </div>
                  </section>
                </div>

                <div className="flex flex-col gap-10">
                  <section>
                    <h3 className="text-lg font-bold text-slate-900 italic mb-4 flex items-center gap-3">
                      <Plus size={18} className="text-blue-600" />
                      Extra Charges
                    </h3>
                    <div className="flex flex-col gap-4">
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
                          onDelete={deleteCharge}
                        />
                      ))}
                      <button
                        onClick={addNewCharge}
                        className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400 font-bold hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/50 transition-all duration-200 group"
                      >
                        <Plus size={18} className="group-hover:scale-110 transition-transform" />
                        Add New Charge
                      </button>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold text-slate-900 italic mb-4">Other Information</h3>
                    <div className="grid gap-2">
                      {(Object.entries(ENTRY_LABELS) as [keyof BillEntryType, string][])
                        .filter(([k]) => !["extra_charges", "billing_party", "rate", "advance", "sub_total", "grand_total", "bill_no"].includes(k))
                        .map(([key, label]) => (
                          <FieldRow
                            key={key}
                            label={label}
                            value={isKeyDate(key) ? formatDate(new Date(localEntry[key] as string)) : localEntry[key] as string}
                            editing={editing.fields.has(key)}
                            draftValue={drafts.fields[key] as string}
                            onEdit={() => startEditField(key)}
                            onSave={() => saveField(key)}
                            onCancel={() => cancelField(key)}
                            onChange={(val) => setDrafts(p => ({ ...p, fields: { ...p.fields, [key]: val } }))}
                            type={isKeyDate(key) ? "date" : (["rate", "advance", "sub_total", "grand_total"].includes(key) ? "number" : "text")}
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
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Bill Entry?"
        message="This action is permanent and cannot be undone. Are you sure you want to remove this record?"
        confirmText="Confirm Delete"
        isLoading={deleteBillEntryMutation.isPending}
      />
    </div>
  );
};

export default BillEntriesDropdownView;
