import type React from "react";
import styles from "./EditHeader.module.scss";
import { useState } from "react";
import Overlay from "../Overlay";

interface EditHeaderProps {
  heading: string;
  isDirty: boolean;
  onEditClick: () => void;
  onCancelClick: () => void;
  onSaveClick: () => void;
  onDeleteClick: () => void;
  onDiscardClick: () => void;
}

const EditHeader: React.FC<EditHeaderProps> = ({
  heading,
  isDirty,
  onEditClick,
  onCancelClick,
  onSaveClick,
  onDeleteClick,
  onDiscardClick,
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div className={styles.editHeaderContainer}>
      <h1 className={styles.heading}>{heading}</h1>
      <div className={styles.controls}>
        <div className={styles.controls}>
          {!isEditMode ? (
            <button
              className={`${styles.controlBtn} ${styles.editBtn}`}
              onClick={() => {
                onEditClick();
                setIsEditMode(true);
              }}
            >
              Edit
            </button>
          ) : (
            <>
              <button
                className={`${styles.controlBtn} ${styles.saveBtn}`}
                disabled={!isDirty}
                onClick={() => {
                  onSaveClick();
                  setIsEditMode(false);
                }}
              >
                Save
              </button>
              <button
                className={`${styles.controlBtn} ${styles.cancelBtn}`}
                onClick={() => {
                  if (isDirty) {
                    setShowCancelConfirm(true);
                    return;
                  }
                  onCancelClick();
                  setIsEditMode(false);
                }}
              >
                Cancel
              </button>
            </>
          )}
          <button
            className={styles.controlBtn}
            onClick={() => {
              setShowDeleteConfirm(true);
            }}
          >
            Delete
          </button>
        </div>
      </div>
      {showCancelConfirm && (
        <Overlay
          onCancel={() => {
            setShowCancelConfirm(false);
          }}
        >
          <div className={styles.overlay}>
            <h1>Discard changes?</h1>
            <p>
              You have unsaved changes. Are you sure you want to discard them?
            </p>
            <div className={styles.popupControls}>
              <button
                className={styles.controlBtn}
                onClick={() => {
                  setIsEditMode(false);
                  setShowCancelConfirm(false);
                  onDiscardClick();
                }}
              >
                Discard
              </button>
            </div>
          </div>
        </Overlay>
      )}
      {showDeleteConfirm && (
        <Overlay
          onCancel={() => {
            setShowDeleteConfirm(false);
          }}
        >
          <div className={styles.overlay}>
            <h1>Delete Journey?</h1>
            <p>
              Are you sure you want to delete this journey? This action cannot
              be undone.
            </p>
            <div className={styles.popupControls}>
              <button
                className={styles.controlBtn}
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onDeleteClick();
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </Overlay>
      )}
    </div>
  );
};

export default EditHeader;
