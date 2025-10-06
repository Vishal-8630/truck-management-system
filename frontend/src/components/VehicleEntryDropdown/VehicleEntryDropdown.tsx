import React, { useEffect, useRef, useState } from "react";
import {
  VEHICLE_ENTRY_LABELS,
  type VehicleEntryType,
} from "../../types/vehicleEntry";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { addMessage } from "../../features/message";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import styles from "./VehicleEntryDropdown.module.scss";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { formatDate } from "../../utils/formatDate";
import { selectVehicleEntryLoading, updateVehicleEntryAsync } from "../../features/vehicleEntry";
import type { AppDispatch } from "../../app/store";

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
}

const dropDownVariants: Variants = {
  hidden: { height: 0 },
  visible: (height: number) => ({
    height,
    transition: { duration: 0.3, ease: "easeInOut" },
  }),
  exit: { height: 0, transition: { duration: 0.3, ease: "easeInOut" } },
};

const VehicleEntryDropdown: React.FC<VehicleEntryDropdownProps> = ({
  vehicleEntry,
  itemState,
  updateItem,
  updateDraft,
  toggleEditing,
  toggleOpen,
}) => {
  const dispatch: AppDispatch = useDispatch();
  const loading = useSelector(selectVehicleEntryLoading);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  const isKeyDate = (key: keyof VehicleEntryType) =>
    key.toLowerCase().includes("date");

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  });

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
      const resultAction = await dispatch(updateVehicleEntryAsync(itemState.localItem));
      if (updateVehicleEntryAsync.fulfilled.match(resultAction)) {
        dispatch(addMessage({ type: "success", text: "Vehicle entry updated successfully" }));
      } else if (updateVehicleEntryAsync.rejected.match(resultAction)) {
        const errors = resultAction.payload;
        if (errors) {
          dispatch(addMessage({ type: "error", text: Object.entries(errors)[0][1] }));
        }
      }
    } catch {
      dispatch(addMessage({ type: "error", text: "Something went wrong" }));
    }
  };

  const hasChanges =
    JSON.stringify(itemState.localItem) !==
    JSON.stringify(vehicleEntry);

  return (
    <div className={styles.container}>
      <button
        className={styles.header}
        onClick={() => toggleOpen(vehicleEntry._id)}
      >
        <div className={styles.title}>
          <div>
            <span className={styles.headingLabel}>Date: </span>
            <span className={styles.headingValue}>
              {formatDate(new Date(itemState.localItem.date)) || "—"}
            </span>
            <span>|</span>
          </div>
          <div>
            <span className={styles.headingLabel}>Vehicle Number:</span>
            <span className={styles.headingValue}>
              {itemState.localItem.vehicle_no || "—"}
            </span>
            <span>|</span>
          </div>
          <div>
            <span className={styles.headingLabel}>From:</span>
            <span className={styles.headingValue}>
              {itemState.localItem.from || "—"}
            </span>
            <span>|</span>
          </div>
          <div>
            <span className={styles.headingLabel}>To: </span>
            <span className={styles.headingValue}>
              {itemState.localItem.to || "—"}
            </span>
          </div>
        </div>
        <span className={styles.icon}>
          {itemState.isOpen ? <FaChevronUp /> : <FaChevronDown />}
        </span>
      </button>

      {hasChanges && (
        <div className={styles.saveChangesWrapper}>
          <button className={styles.saveChangesBtn} onClick={handleSaveChanges}>
            {loading ? "Saving..." : "Save Changes"}
          </button>
          <button className={styles.abortChanges} onClick={handleAbortChanges}>
            Abort Changes
          </button>
        </div>
      )}

      <AnimatePresence>
        {itemState.isOpen && (
          <motion.div
            ref={contentRef}
            className={styles.content}
            variants={dropDownVariants}
            style={{ overflow: "hidden" }}
            initial="hidden"
            animate="visible"
            exit="exit"
            custom={height}
          >
            <div className={styles.list}>
              {(
                Object.entries(VEHICLE_ENTRY_LABELS) as [
                  keyof VehicleEntryType,
                  string
                ][]
              ).map(([key, label]) => {
                const isEditing = itemState.editing.has(key);
                const isBalanceParty = (key as string) === "balance_party";
                const value = isEditing
                  ? itemState.drafts[key] ?? ""
                  : isBalanceParty
                  ? itemState.localItem["balance_party"].party_name
                  : isKeyDate(key)
                  ? formatDate(
                      new Date(itemState.localItem[key] as string)
                    )
                  : itemState.localItem[key] ?? "—";

                return (
                  <div key={key} className={styles.row}>
                    <div className={styles.label}>{label} : -</div>

                    {isEditing ? (
                      <div className={styles.editArea}>
                        <input
                          className={styles.input}
                          value={value as string}
                          onChange={(e) =>
                            updateDraft(vehicleEntry._id, key, e.target.value)
                          }
                        />
                        <div className={styles.actions}>
                          <button
                            className={styles.saveBtn}
                            onClick={() => handleSave(key)}
                          >
                            Save
                          </button>
                          <button
                            className={styles.cancelBtn}
                            onClick={() => handleCancel(key)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.value}>{value as string}</div>
                    )}

                    <div className={styles.controls}>
                      {!isEditing && !isBalanceParty && (
                        <button
                          className={styles.editBtn}
                          onClick={() => handleEdit(key)}
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VehicleEntryDropdown;
