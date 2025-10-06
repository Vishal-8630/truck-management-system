import React, { useEffect, useRef } from "react";
import { DatePickerComponent } from "@syncfusion/ej2-react-calendars";
import type { ChangedEventArgs, PopupEventArgs } from "@syncfusion/ej2-calendars";
import styles from "./CustomDatePicker.module.scss";

interface Props {
  label: string;
  value?: Date;
  placeholder?: string;
  onChange: (date: Date | undefined) => void;
}

const CustomDatePicker: React.FC<Props> = ({ label, value, placeholder = "Select Date", onChange }) => {
  const datePickerRef = useRef<DatePickerComponent>(null);

  useEffect(() => {
    if (datePickerRef.current) {
      // cast to `any` to access EJ2 instance event
      (datePickerRef.current as any).addEventListener("popupOpen", (args: PopupEventArgs) => {
        const todayBtn = document.querySelector(".e-popup-wrapper .e-footer .e-today") as HTMLElement;
        if (todayBtn) {
          todayBtn.style.backgroundColor = "#4a90e2";
          todayBtn.style.color = "#fff";
          todayBtn.style.borderRadius = "4px";
          todayBtn.style.padding = "0.25rem 0.5rem";
          todayBtn.onmouseover = () => (todayBtn.style.backgroundColor = "#357ab8");
          todayBtn.onmouseout = () => (todayBtn.style.backgroundColor = "#4a90e2");
        }
      });
    }
  }, []);

  return (
    <div className={styles.datePickerContainer}>
      <label>{label}</label>
      <DatePickerComponent
        ref={datePickerRef}
        value={value}
        placeholder={placeholder}
        onChange={(e: ChangedEventArgs) => onChange(e.value ?? undefined)}
        showClearButton={true}
        floatLabelType="Never"
        cssClass={styles.customDatePicker}
        style={{ width: "100%" }}
      />
    </div>
  );
};

export default CustomDatePicker;