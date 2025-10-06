import { useEffect, useRef, useState } from "react";
import type { BalancePartyType } from "../../types/vehicleEntry";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { addMessage } from "../../features/message";
import styles from "./BalancePartyDropDown.module.scss";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
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
  hidden: { height: 0 },
  visible: (height: number) => ({
    height,
    transition: { duration: 0.3, ease: "easeInOut" },
  }),
  exit: { height: 0, transition: { duration: 0.3, ease: "easeInOut" } },
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
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [itemState.isOpen]);

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
        dispatch(
          addMessage({
            type: "success",
            text: "Balance Party updated successfully",
          })
        );
      } else if (updateBalancePartyAsync.rejected.match(resultAction)) {
        const errors = resultAction.payload;
        if (errors && Object.keys(errors).length > 0) {
          dispatch(addMessage({ type: "error", text: Object.entries(errors)[0][1] }));
        }
      }
    } catch {
      dispatch(
        addMessage({ type: "error", text: "Failed to update balance party" })
      );
    }
  };

  const hasChanges =
    JSON.stringify(itemState.localItem) !== JSON.stringify(balanceParty);

  return (
    <div className={styles.container}>
      <button
        className={styles.header}
        onClick={() => toggleOpen(balanceParty._id)}
      >
        <div className={styles.title}>
          <span className={styles.headingLabel}>PARTY NAME:</span>
          <span className={styles.headingValue}>
            {itemState.localItem.party_name || "—"}
          </span>
        </div>
        <span className={styles.icon}>
          {itemState.isOpen ? <FaChevronUp /> : <FaChevronDown />}
        </span>
      </button>

      {hasChanges && (
        <div className={styles.saveChangesWrapper}>
          <button
            className={styles.saveChangesBtn}
            onClick={handleSaveChanges}
            disabled={loading}
          >
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
                Object.entries(BALANCE_PARTY_LABELS) as [
                  keyof BalancePartyType,
                  string
                ][]
              ).map(([key, label]) => {
                const isEditing = itemState.editing.has(key);
                const value = isEditing
                  ? itemState.drafts[key] ?? ""
                  : itemState.localItem[key];

                return (
                  <div key={key} className={styles.row}>
                    <div className={styles.label}>{label}</div>
                    {isEditing ? (
                      <div className={styles.editArea}>
                        <input
                          className={styles.input}
                          value={value as string}
                          onChange={(e) =>
                            updateDraft(balanceParty._id, key, e.target.value)
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
                      {!isEditing && (
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

export default BalancePartyDropDown;
