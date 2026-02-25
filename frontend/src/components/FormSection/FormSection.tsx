import React, { type ReactNode } from "react";

interface FormSectionProps {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
}

const FormSection: React.FC<FormSectionProps> = ({ title, children, icon }) => {
  return (
    <div className="card-premium h-full flex flex-col gap-6 overflow-hidden">
      <div className="flex items-center gap-3 border-b border-slate-50 pb-4 mb-2">
        {icon && <div className="text-indigo-600">{icon}</div>}
        <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest italic">{title}</h2>
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
};

export default FormSection;

