import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { PARTY_LABELS, type BillingPartyType } from "../../types/billingParty";
import styles from "./BillingPartyDropdown.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { selectAuthLoading } from "../../features/auth/authSelectors";
import { addMessage } from "../../features/message";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
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

const dropDownVariants: Variants = {
  hidden: { height: 0 },
  visible: (height: number) => ({
    height,
    transition: { duration: 0.3, ease: "easeInOut" },
  }),
  exit: { height: 0, transition: { duration: 0.3, ease: "easeInOut" } },
};

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
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  });

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
            text: "Billing billingParty updated successfully",
          })
        );
      } else if (updateBillingPartyAsync.rejected.match(resultAction)) {
        const errors = resultAction.payload;
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
    <div className={styles.container}>
      <button className={styles.header} onClick={() => toggleOpen(billingParty._id)}>
        <div className={styles.title}>
          <span className={styles.headingLabel}>Billing Party Name</span>
          <span className={styles.headingValue}>
            {itemState.localItem.name || "—"}
          </span>
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
                Object.entries(PARTY_LABELS) as [
                  keyof BillingPartyType,
                  string
                ][]
              ).map(([key, label]) => {
                const isEditing = itemState.editing.has(key);
                const value = isEditing
                  ? itemState.drafts[key] ?? ""
                  : itemState.localItem[key] ?? "—";

                return (
                  <div key={key} className={styles.row}>
                    <div className={styles.label}>{label}</div>

                    {isEditing ? (
                      <div className={styles.editArea}>
                        <input
                          className={styles.input}
                          value={value as string}
                          onChange={(e) =>
                            updateDraft(billingParty._id, key, e.target.value)
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
                      <div className={styles.value}>{value}</div>
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

export default BillingPartyDropdown;
