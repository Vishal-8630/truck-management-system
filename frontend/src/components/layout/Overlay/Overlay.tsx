import React, { type ReactNode } from "react";
import { X } from "lucide-react";
import { motion } from "framer-motion";

type OverlayProps = {
  children: ReactNode;
  onCancel: () => void;
};


const Overlay: React.FC<OverlayProps> = ({ children, onCancel }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-h-[85vh] overflow-y-auto p-10 lg:p-14">
          {children}
        </div>

        <button
          onClick={onCancel}
          className="absolute top-6 right-6 p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200"
        >
          <X size={24} />
        </button>
      </motion.div>
    </motion.div>
  );
};

export default Overlay;

