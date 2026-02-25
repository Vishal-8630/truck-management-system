import { useState, useEffect } from "react";
import { X, UploadCloud } from "lucide-react";

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
    <div className="flex flex-col gap-2 w-full">
      <label htmlFor={id} className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
        {label}
      </label>

      <div className="relative group">
        {preview ? (
          <div className="relative aspect-video lg:aspect-square w-full rounded-2xl overflow-hidden border-2 border-slate-100 shadow-sm transition-all group-hover:shadow-md group-hover:border-indigo-100">
            <img
              src={preview}
              alt="preview"
              className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-500"
              onClick={() => onFileClick?.(preview)}
            />
            {isEditMode && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm text-red-500 rounded-xl shadow-lg border border-slate-100 hover:bg-red-50 transition-all active:scale-90"
              >
                <X size={16} strokeWidth={3} />
              </button>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-end p-4">
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Selected Image</span>
            </div>
          </div>
        ) : (
          <label
            htmlFor={id}
            className="flex flex-col items-center justify-center gap-4 aspect-video lg:aspect-square w-full rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-indigo-50/30 hover:border-indigo-200 transition-all cursor-pointer group/label"
          >
            <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-300 group-hover/label:text-indigo-500 group-hover/label:scale-110 transition-all duration-300">
              <UploadCloud size={28} />
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-sm font-black text-slate-700 tracking-tight italic">Drop or Click to Upload</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">JPEG, PNG up to 5MB</span>
            </div>

            <input
              id={id}
              name={name}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        )}
      </div>
    </div>
  );
};

export default FormInputImage;
