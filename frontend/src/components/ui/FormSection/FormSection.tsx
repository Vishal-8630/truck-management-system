import React, { type ReactNode } from "react";

interface FormSectionProps {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
}

const FormSection: React.FC<FormSectionProps> = ({ title, children, icon }) => {
  return (
    <div className="card-premium h-full flex flex-col gap-6 hover:border-blue-100/50 dark:hover:border-blue-900/30">
      <div className="flex items-center gap-4 border-b border-slate-50 dark:border-slate-800 pb-6">
        {icon && (
          <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-inner group-hover:bg-blue-50 dark:group-hover:bg-slate-700 transition-colors">
            {icon}
          </div>
        )}
        <div className="flex flex-col">
          <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider italic leading-none">{title}</h2>
          <span className="h-1 w-8 bg-blue-600/20 dark:bg-blue-400/20 rounded-full mt-2" />
        </div>
      </div>
      <div className="flex-1 px-1">
        {children}
      </div>
    </div>
  );
};

export default FormSection;
