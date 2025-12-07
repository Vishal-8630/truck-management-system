import { useState, useEffect, useRef } from "react";
import styles from "./MetaFields.module.scss";
import type { LedgerMeta } from "../../types/ledger";

interface MetaField {
  key: string;
  value: string;
}

interface MetaFieldsProps {
  value?: LedgerMeta;
  isEditMode: boolean;
  onChange: (meta: LedgerMeta) => void;
}

const MetaFields = ({ value, isEditMode, onChange }: MetaFieldsProps) => {
  const [fields, setFields] = useState<MetaField[]>([]);
  const firstLoad = useRef(true);

  /* ------------------------------------------
        LOAD INITIAL META (ONLY ON FIRST MOUNT)
     ------------------------------------------ */
  useEffect(() => {
    if (firstLoad.current) {
      if (value) {
        const initial = Object.entries(value).map(([k, v]) => ({
          key: k,
          value: String(v),
        }));
        setFields(initial);
      }
      firstLoad.current = false;
    }
  }, [value]);

  /* ------------------------------------------
        SYNC FIELDS → PARENT
     ------------------------------------------ */
  useEffect(() => {
    const metaObj: LedgerMeta = {};
    fields.forEach((f) => {
      if (f.key.trim()) metaObj[f.key] = f.value;
    });

    onChange(metaObj); // always push to parent
  }, [fields]);

  /* ------------------------------------------
        FIELD ACTIONS
     ------------------------------------------ */
  const addField = () => {
    setFields((prev) => [...prev, { key: "", value: "" }]);
  };

  const updateKey = (i: number, key: string) => {
    setFields((prev) => {
      const clone = [...prev];
      clone[i].key = key;
      return clone;
    });
  };

  const updateValue = (i: number, value: string) => {
    setFields((prev) => {
      const clone = [...prev];
      clone[i].value = value;
      return clone;
    });
  };

  const removeField = (i: number) => {
    setFields((prev) => prev.filter((_, idx) => idx !== i));
  };

  /* ------------------------------------------
        UI
     ------------------------------------------ */
  return (
    <div className={styles.metaContainer}>
      {fields.map((field, index) => (
        <div key={index} className={styles.metaRow}>
          <input
            type="text"
            placeholder="Key (e.g., pump_name)"
            value={field.key}
            onChange={(e) => updateKey(index, e.target.value)}
            className={styles.input}
          />

          <input
            type="text"
            placeholder="Value"
            value={field.value}
            onChange={(e) => updateValue(index, e.target.value)}
            className={styles.input}
          />

          {isEditMode && (
            <button
              type="button"
              className={styles.deleteBtn}
              onClick={() => removeField(index)}
            >
              ✕
            </button>
          )}
        </div>
      ))}

      {isEditMode && (
        <button type="button" className={styles.addBtn} onClick={addField}>
          + Add Field
        </button>
      )}
    </div>
  );
};

export default MetaFields;
