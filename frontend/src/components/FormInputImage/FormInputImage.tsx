import { useState, useEffect } from "react";
import styles from "./FormInputImage.module.scss";

interface FormInputImageProps {
  label: string;
  id: string;
  name: string;
  value?: string;
  isEditMode?: boolean;
  onFileSelect: (file: File | null) => void;
  onFileClick?: (file: string) => void;
}

const FormInputImage: React.FC<FormInputImageProps> = ({
  label,
  id,
  name,
  value,
  isEditMode,
  onFileSelect,
  onFileClick,
}) => {
  const [preview, setPreview] = useState<string | null>(value || null);

  useEffect(() => {
    if (value) setPreview(value);
  }, [value]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      onFileSelect(file);
    } else {
      setPreview(null);
      onFileSelect(null);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onFileSelect(null);
  };

  return (
    <div className={styles.formInputImage}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>

      <div className={styles.uploadContainer}>
        {preview ? (
          <div className={styles.previewWrapper}>
            <img
              src={preview}
              alt="preview"
              className={styles.previewImage}
              onClick={() => onFileClick?.(preview)}
            />
            {isEditMode && (
              <button
                type="button"
                className={styles.removeBtn}
                onClick={handleRemove}
              >
                ✕
              </button>
            )}
          </div>
        ) : (
          <label htmlFor={id} className={styles.uploadLabel}>
            <span>Click to upload</span>
            <input
              id={id}
              name={name}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className={styles.fileInput}
            />
          </label>
        )}
      </div>
    </div>
  );
};

export default FormInputImage;
