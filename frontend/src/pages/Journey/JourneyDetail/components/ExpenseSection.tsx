import styles from "../JourneyDetail.module.scss";
import { formatDate } from "../../../../utils/formatDate";

interface ExpenseSectionProps {
  title: string;
  data: any[];
  fields: { label: string; key: string }[];
  onAdd: () => void;
  onChange: (updatedData: any[]) => void;
  emptyValue?: string;
  isEditMode?: boolean;
}

const ExpenseSection = ({
  title,
  data = [],
  fields,
  onAdd,
  onChange,
  isEditMode = false,
  emptyValue = "----------",
}: ExpenseSectionProps) => {
  const handleFieldChange = (index: number, key: string, value: string) => {
    const updated = data.map((item, i) =>
      i === index ? { ...item, [key]: value } : item
    );
    onChange(updated);
  };

  const isDateField = (key: string) => key.toLowerCase().includes("date");

  const formatFieldValue = (key: string, value: any) => {
    if (isDateField(key) && value)
      return formatDate(new Date(value));
    return value || emptyValue;
  };

  return (
    <div className={`${styles.block} ${styles.flex_1}`}>
      <div className={styles.header}>
        <h1 className={styles.heading}>{title}</h1>
        {isEditMode && (
          <button className={styles.btn} onClick={onAdd}>
            Add {title.split(" ")[0]}
          </button>
        )}
      </div>

      <div className={styles.body}>
        {data.map((item, index) => (
          <div className={styles.card} key={`${title}-${index}`}>
            {isEditMode && (
              <div
                className={styles.deleteCard}
                onClick={() => onChange(data.filter((_, i) => i !== index))}
              >
                <span className={styles.cross}></span>
                <span className={styles.cross}></span>
              </div>
            )}
            {fields.map((f) => (
              <div key={f.key} className={styles.field}>
                <div className={styles.fieldLabel}>{f.label}</div>

                {isEditMode ? (
                  <input
                    type={isDateField(f.key) ? "date" : "text"}
                    className={`${styles.input} ${styles.value}`}
                    value={isDateField(f.key) ? new Date(item[f.key]).toISOString().split("T")[0] : item[f.key] || ""}
                    onChange={(e) =>
                      handleFieldChange(index, f.key, e.target.value)
                    }
                  />
                ) : (
                  <div className={styles.fieldValue}>
                    {formatFieldValue(f.key, item[f.key])}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpenseSection;
