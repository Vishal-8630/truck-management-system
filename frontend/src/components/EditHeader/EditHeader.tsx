import type React from "react";
import { useState } from "react";
import Overlay from "@/components/Overlay";
import { Edit3, Save, X, Trash2, AlertCircle } from "lucide-react";
import DeleteConfirm from "@/components/DeleteConfirm";

interface EditHeaderProps {
  heading: string;
  description?: string;
  isDirty: boolean;
  onEditClick: () => void;
  onCancelClick: () => void;
  onSaveClick: () => any;
  onDeleteClick: () => void;
  onDiscardClick: () => void;
}

const EditHeader: React.FC<EditHeaderProps> = ({
  heading,
  description,
  isDirty,
  onEditClick,
  onCancelClick,
  onSaveClick,
  onDeleteClick,
  onDiscardClick,
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-10 border-b border-slate-100">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 uppercase leading-none">
          {heading}
        </h1>
        {description && (
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-1 italic">
            {description}
          </p>
        )}
        {isEditMode && (
          <div className="flex items-center gap-2 mt-2">
            <span className={`w-2 h-2 rounded-full ${isDirty ? 'bg-amber-400 animate-pulse' : 'bg-slate-300'}`}></span>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">
              {isDirty ? 'Unsaved Changes' : 'Editing Mode Enabled'}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {!isEditMode ? (
          <>
            <button
              onClick={() => {
                onEditClick();
                setIsEditMode(true);
              }}
              className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-100"
            >
              <Edit3 size={16} />
              Edit
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-95"
              title="Delete Record"
            >
              <Trash2 size={20} />
            </button>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                const result = await onSaveClick();
                if (result !== false) {
                  setIsEditMode(false);
                }
              }}
              disabled={!isDirty}
              className={`
                px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg
                ${isDirty
                  ? 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'}
              `}
            >
              <Save size={16} />
              Save Changes
            </button>
            <button
              onClick={() => {
                if (isDirty) {
                  setShowCancelConfirm(true);
                  return;
                }
                onCancelClick();
                setIsEditMode(false);
              }}
              className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-200 transition-all active:scale-95"
            >
              <X size={16} />
              Cancel
            </button>
          </div>
        )}
      </div>

      {showCancelConfirm && (
        <Overlay onCancel={() => setShowCancelConfirm(false)}>
          <div className="p-8 max-w-sm w-full bg-white rounded-[2rem] shadow-2xl flex flex-col items-center text-center gap-6">
            <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center">
              <AlertCircle size={32} />
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-bold text-slate-900">Discard changes?</h2>
              <p className="text-slate-500 text-sm leading-relaxed">You have unsaved changes that will be lost. Are you sure you want to proceed?</p>
            </div>
            <div className="flex flex-col w-full gap-2">
              <button
                onClick={() => {
                  setIsEditMode(false);
                  setShowCancelConfirm(false);
                  onDiscardClick();
                }}
                className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-100"
              >
                Discard Changes
              </button>
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="w-full py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors"
              >
                Keep Editing
              </button>
            </div>
          </div>
        </Overlay>
      )}

      <DeleteConfirm
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={onDeleteClick}
      />
    </div>
  );
};

export default EditHeader;

