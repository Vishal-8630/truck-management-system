import { useState, useEffect, useRef } from "react";
import type { LedgerMeta } from "@/types/ledger";
import { Plus, Trash2, Tag, Hash } from "lucide-react";

interface MetaField {
  key: string;
  value: string;
}

interface MetaFieldsProps {
  value?: LedgerMeta;
  isEditMode: boolean;
  onChange: (meta: LedgerMeta) => void;
}

const MetaFields = ({ value, isEditMode, onChange }: MetaFieldsProps) => {
  const [fields, setFields] = useState<MetaField[]>([]);
  const firstLoad = useRef(true);

  /* ------------------------------------------
        LOAD INITIAL META (ONLY ON FIRST MOUNT)
     ------------------------------------------ */
  useEffect(() => {
    if (firstLoad.current) {
      if (value) {
        const initial = Object.entries(value).map(([k, v]) => ({
          key: k,
          value: String(v),
        }));
        setFields(initial);
      }
      firstLoad.current = false;
    }
  }, [value]);

  /* ------------------------------------------
        SYNC FIELDS → PARENT
     ------------------------------------------ */
  const fieldsRef = useRef<MetaField[]>(fields);
  useEffect(() => {
    fieldsRef.current = fields;
  }, [fields]);

  useEffect(() => {
    const metaObj: LedgerMeta = {};
    fields.forEach((f) => {
      if (f.key.trim()) metaObj[f.key] = f.value;
    });

    // ONLY call onChange if the data has actually changed
    // We compare with the prop 'value' to check if parent is already correct
    if (JSON.stringify(metaObj) !== JSON.stringify(value || {})) {
      onChange(metaObj);
    }
  }, [fields, onChange, value]);

  /* ------------------------------------------
        FIELD ACTIONS
     ------------------------------------------ */
  const addField = () => {
    setFields((prev) => [...prev, { key: "", value: "" }]);
  };

  const updateKey = (i: number, key: string) => {
    setFields((prev) => {
      const clone = [...prev];
      clone[i].key = key;
      return clone;
    });
  };

  const updateValue = (i: number, value: string) => {
    setFields((prev) => {
      const clone = [...prev];
      clone[i].value = value;
      return clone;
    });
  };

  const removeField = (i: number) => {
    setFields((prev) => prev.filter((_, idx) => idx !== i));
  };

  /* ------------------------------------------
        UI
     ------------------------------------------ */
  return (
    <div className="flex flex-col gap-4">
      {fields.length > 0 ? (
        <div className="flex flex-col gap-3">
          {fields.map((field, index) => (
            <div key={index} className="group flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
              <div className="relative flex-1">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-indigo-400 transition-colors">
                  <Tag size={14} />
                </div>
                <input
                  type="text"
                  placeholder="Field Key"
                  value={field.key}
                  disabled={!isEditMode}
                  onChange={(e) => updateKey(index, e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-100/50 focus:border-indigo-500 transition-all font-bold text-xs uppercase tracking-widest text-slate-700 placeholder:text-slate-300 disabled:bg-slate-50 disabled:text-slate-400 shadow-sm"
                />
              </div>

              <div className="relative flex-1">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-indigo-400 transition-colors">
                  <Hash size={14} />
                </div>
                <input
                  type="text"
                  placeholder="Value"
                  value={field.value}
                  disabled={!isEditMode}
                  onChange={(e) => updateValue(index, e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-100/50 focus:border-indigo-500 transition-all font-black text-sm text-slate-900 placeholder:text-slate-300 disabled:bg-slate-50 disabled:text-slate-500 shadow-sm"
                />
              </div>

              {isEditMode && (
                <button
                  type="button"
                  onClick={() => removeField(index)}
                  className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95"
                  title="Remove Field"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        !isEditMode && (
          <div className="text-center py-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">No additional data fields</span>
          </div>
        )
      )}

      {isEditMode && (
        <button
          type="button"
          onClick={addField}
          className="flex items-center gap-2 px-4 py-3 bg-indigo-50 text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-600 hover:text-white transition-all w-fit shadow-sm"
        >
          <Plus size={14} />
          Add Custom Field
        </button>
      )}
    </div>
  );
};

export default MetaFields;
