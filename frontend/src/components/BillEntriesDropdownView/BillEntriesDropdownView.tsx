import React, { useEffect, useState, useCallback, useRef } from "react";
import styles from "./BillEntriesDropdownView.module.scss";
import {
  ENTRY_LABELS,
  EXTRA_CHARGE_LABELS,
  type BillEntryType,
  type ExtraCharge,
} from "../../types/billEntry";
import { FaChevronDown } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../../app/store";
import { addMessage } from "../../features/message";
import { PARTY_LABELS, type BillingPartyType } from "../../types/billingParty";
import { formatDate } from "../../utils/formatDate";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import {
  selectBillEntryLoading,
  updateBillEntryAsync,
} from "../../features/billEntry";

// --- Props ---
interface DropdownViewProps {
  entry: BillEntryType;
}

const dropdownVariants: Variants = {
  hidden: { height: 0 },
  visible: (height: number) => ({
    height,
    transition: { duration: 0.8, ease: "easeInOut" },
  }),
  exit: {
    height: 0,
    transition: { duration: 0.8, ease: "easeInOut" },
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
}) => (
  <div className={styles.row}>
    <div className={styles.label}>{label}</div>
    {editing ? (
      <div className={styles.editArea}>
        <input
          className={styles.input}
          value={draftValue ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
        />
        <div className={styles.actions}>
          <button className={styles.saveBtn} onClick={onSave}>
            Save
          </button>
          <button className={styles.cancelBtn} onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    ) : (
      <div className={styles.value}>{value}</div>
    )}
    {!editing && (
      <div className={styles.controls}>
        <button className={styles.editBtn} onClick={onEdit}>
          Edit
        </button>
      </div>
    )}
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
  <div className={styles.chargeSection}>
    {Object.entries(charge)
      .filter(([k]) => k !== "_id")
      .map(([subKey, subValue]) => {
        const editKey = `${charge._id}.${subKey}`;
        return (
          <div key={editKey} className={styles.row}>
            <div className={styles.label}>{EXTRA_CHARGE_LABELS[subKey]}</div>
            {editingSet.has(editKey) ? (
              <div className={styles.editArea}>
                <input
                  className={styles.input}
                  value={
                    drafts?.[charge._id]?.[subKey as keyof ExtraCharge] ??
                    subValue ??
                    ""
                  }
                  onChange={(e) =>
                    setDraft(
                      charge._id,
                      subKey as keyof ExtraCharge,
                      e.target.value
                    )
                  }
                />
                <div className={styles.actions}>
                  <button
                    className={styles.saveBtn}
                    onClick={() =>
                      saveEdit(charge._id, subKey as keyof ExtraCharge)
                    }
                  >
                    Save
                  </button>
                  <button
                    className={styles.cancelBtn}
                    onClick={() =>
                      cancelEdit(charge._id, subKey as keyof ExtraCharge)
                    }
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.value}>{subValue || ""}</div>
            )}
            {!editingSet.has(editKey) && (
              <div className={styles.controls}>
                <button
                  className={styles.editBtn}
                  onClick={() =>
                    startEdit(charge._id, subKey as keyof ExtraCharge)
                  }
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        );
      })}
    <div className={styles.deleteSection}>
      <button className={styles.deleteBtn} onClick={() => onDelete(charge._id)}>
        Delete
      </button>
    </div>
  </div>
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

  const dispatch: AppDispatch = useDispatch();
  const loading = useSelector(selectBillEntryLoading);
  const isKeyDate = useCallback(
    (key: keyof BillEntryType) => key.toLowerCase().includes("date"),
    []
  );
  const [height, setHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalEntry(entry);
    setDrafts({ fields: {}, extra_charges: {} });
    setEditing({ fields: new Set(), extra_charges: new Set() });
  }, [entry]);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  });

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
    setEditing((prev) => ({
      ...prev,
      extra_charges: new Set([...prev.extra_charges, `${newId}.type`]),
    }));
  };

  const abortChanges = () => {
    setLocalEntry(entry);
    setDrafts({ fields: {}, extra_charges: {} });
    setEditing({ fields: new Set(), extra_charges: new Set() });
  };

  const saveChanges = async () => {
    try {
      const resultAction = await dispatch(updateBillEntryAsync(localEntry));
      if (updateBillEntryAsync.fulfilled.match(resultAction)) {
        dispatch(
          addMessage({ type: "success", text: "Entry updated successfully" })
        );
      } else if (updateBillEntryAsync.rejected.match(resultAction)) {
        const errors = resultAction.payload;
        if (errors && Object.keys(errors).length > 0) {
          Object.keys(errors).forEach((key) => {
            dispatch(
              addMessage({
                type: "error",
                text: errors[key] || "Failed to update entry",
              })
            );
          });
        }
      }
    } catch {
      dispatch(addMessage({ type: "error", text: "Failed to update entry" }));
    }
  };

  // --- Render ---
  return (
    <div className={styles.container}>
      <button className={styles.header} onClick={() => setIsOpen((s) => !s)}>
        <div className={styles.title}>
          <span className={styles.headingLabel}>Bill Number: </span>
          <span className={styles.headingValue}>
            {localEntry.bill_no || "—"}
          </span>
        </div>
        <motion.span
          className={styles.icon}
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <FaChevronDown />
        </motion.span>
      </button>

      {JSON.stringify(localEntry) !== JSON.stringify(entry) && (
        <div className={styles.saveChangesWrapper}>
          <button className={styles.saveChangesBtn} onClick={saveChanges}>
            {loading ? "Saving..." : "Save Changes"}
          </button>
          <button className={styles.abortChanges} onClick={abortChanges}>
            Abort Changes
          </button>
        </div>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={contentRef}
            className={styles.content}
            style={{ overflow: "hidden" }}
            variants={dropdownVariants}
            custom={height}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div className={styles.list}>
              {(
                Object.entries(ENTRY_LABELS) as [keyof BillEntryType, string][]
              ).map(([key, label]) => {
                if (key === "extra_charges") {
                  return (
                    <div key={key} className={styles.extraChargesSection}>
                      <div className={styles.chargeTitle}>Extra Charges</div>
                      {(localEntry.extra_charges ?? []).map((charge) => (
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
                      <div className={styles.addExtraCharge}>
                        <button
                          className={styles.addBtn}
                          onClick={addNewCharge}
                        >
                          ➕ Add Extra Charge
                        </button>
                      </div>
                    </div>
                  );
                }

                if (key === "billing_party") {
                  return (
                    <React.Fragment key={key}>
                      {(
                        Object.entries(PARTY_LABELS) as [
                          keyof BillingPartyType,
                          string
                        ][]
                      ).map(([subKey, subLabel]) => (
                        <div
                          key={`${subKey}-${subLabel}`}
                          className={styles.row}
                        >
                          <div className={styles.label}>{subLabel}</div>
                          <div className={styles.value}>
                            {localEntry[key][subKey]}
                          </div>
                        </div>
                      ))}
                    </React.Fragment>
                  );
                }

                return (
                  <FieldRow
                    key={key}
                    label={label}
                    value={
                      isKeyDate(key)
                        ? formatDate(new Date(localEntry[key]))
                        : (localEntry[key] as string)
                    }
                    editing={editing.fields.has(key)}
                    draftValue={drafts.fields[key] as string}
                    onEdit={() => startEditField(key)}
                    onSave={() => saveField(key)}
                    onCancel={() => cancelField(key)}
                    onChange={(val) =>
                      setDrafts((prev) => ({
                        ...prev,
                        fields: { ...prev.fields, [key]: val },
                      }))
                    }
                  />
                );
              })}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BillEntriesDropdownView;
