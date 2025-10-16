import React, { type ReactNode } from "react";
import styles from "./FormSection.module.scss";

interface FormSectionProps {
  title: string;
  children: ReactNode;
}

const FormSection: React.FC<FormSectionProps> = ({ title, children }) => {
  return (
    <div className={styles.formSection}>
      <div className={styles.sectionTitle}>{title}</div>
      {children}
    </div>
  );
};

export default FormSection;
