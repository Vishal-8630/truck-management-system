import styles from "../JourneyDetail.module.scss";

interface DetailField {
  label: string;
  value?: string | number | null;
  key?: string; // internal field key (e.g. "journey_days" or "delivery_details.remarks")
  isEditable?: boolean;
}

interface DetailBlockProps {
  title: string;
  fields: DetailField[];
  onChange?: (key: string, value: string) => void;
  isEditMode?: boolean;
  emptyValue?: string;
}

const DetailBlock = ({
  title,
  fields,
  onChange,
  isEditMode = false,
  emptyValue = "----------",
}: DetailBlockProps) => {
  const handleChange = (key: string | undefined, value: string) => {
    if (key && onChange) onChange(key, value);
  };

  const isDateField = (key: string) => key.toLowerCase().includes("date");

  return (
    <div className={styles.block}>
      <h1 className={styles.heading}>{title}</h1>

      <div className={styles.detailBox}>
        {fields.map((f, i) => (
          <div className={styles.detailContainer} key={i}>
            <span className={styles.text}>{f.label}</span>

            {isEditMode && f.isEditable ? (
              <input
                type={isDateField(f.key || "") ? "date" : "text"}
                className={`${styles.input} ${styles.value}`}
                value={
                  isDateField(f.key || "")
                    ? new Date(f.value || new Date())
                        .toISOString()
                        .split("T")[0]
                    : f.value === null
                    ? ""
                    : f.value ?? ""
                }
                onChange={(e) => handleChange(f.key, e.target.value)}
              />
            ) : (
              <span className={styles.value}>{f.value ?? emptyValue}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DetailBlock;
