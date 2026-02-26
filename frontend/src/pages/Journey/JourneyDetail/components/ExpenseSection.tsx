import { formatDate } from "../../../../utils/formatDate";
import { Plus, Trash2, Calendar, Receipt, AlertCircle, MapPin, MessageSquare, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

  const getSectionIcon = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes("driver")) return <Receipt size={18} />;
    if (lower.includes("diesel")) return <AlertCircle size={18} />;
    if (lower.includes("delay")) return <Calendar size={18} />;
    if (lower.includes("progress")) return <MapPin size={18} />;
    if (lower.includes("issue")) return <MessageSquare size={18} />;
    return <ChevronDown size={18} />;
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest italic flex items-center gap-2">
          <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">{getSectionIcon(title)}</span>
          {title}
        </h2>
        {isEditMode && (
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
            onClick={onAdd}
          >
            <Plus size={14} strokeWidth={3} />
            Add New
          </button>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <AnimatePresence>
          {data.length === 0 ? (
            <div className="col-span-full py-10 flex flex-col items-center justify-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest italic">No {title.toLowerCase()} recorded</p>
            </div>
          ) : (
            data.map((item, index) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative card-premium p-6 bg-white border-slate-100 group overflow-hidden"
                key={`${title}-${index}`}
              >
                {isEditMode && (
                  <button
                    type="button"
                    className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    onClick={() => onChange(data.filter((_, i) => i !== index))}
                  >
                    <Trash2 size={16} />
                  </button>
                )}

                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  {fields.map((f) => (
                    <div key={f.key} className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{f.label}</span>

                      {isEditMode ? (
                        <input
                          type={isDateField(f.key) ? "date" : "text"}
                          className="w-full px-3 py-1.5 bg-white border border-indigo-50 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all"
                          value={isDateField(f.key) ? (() => {
                            if (!item[f.key]) return "";
                            const date = new Date(item[f.key]);
                            return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
                          })() : item[f.key] || ""}
                          onChange={(e) =>
                            handleFieldChange(index, f.key, e.target.value)
                          }
                        />
                      ) : (
                        <div className="text-sm font-bold text-slate-700 truncate">
                          {formatFieldValue(f.key, item[f.key])}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ExpenseSection;
