// Overlay.tsx
import React, { type ReactNode } from "react";
import styles from "./Overlay.module.scss";
import { FaTimes } from "react-icons/fa";
import { motion } from "framer-motion";

type OverlayProps = {
  children: ReactNode;
  onCancel: () => void;
};

const Overlay: React.FC<OverlayProps> = ({ children, onCancel }) => {
  return (
      <motion.div
        className={styles.overlay}
        onClick={onCancel}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className={styles.content} onClick={(e) => e.stopPropagation()}>
          <div className={styles.scrollable}>{children}</div>
          <button className={styles.closeBtn} onClick={onCancel}>
            <FaTimes />
          </button>
        </div>
      </motion.div>
  );
};

export default Overlay;
