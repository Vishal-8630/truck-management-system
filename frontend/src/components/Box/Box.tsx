import React from "react";
import styles from "./Box.module.scss";

type Row = {
  name: string;
  value: string | number | null | undefined;
};

interface BoxProps {
  rows: Row[];
  onClick: () => void;
}

const Box: React.FC<BoxProps> = ({ rows, onClick }) => {
  return (
    <div className={styles.boxContainer} onClick={() => onClick()}>
      {rows.map((row, index) => (
        <div key={index} className={styles.row}>
          <div className={styles.name}>{row.name}</div>
          <div className={styles.value}>{row.value}</div>
        </div>
      ))}
    </div>
  );
};

export default Box;
