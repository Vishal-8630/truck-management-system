import type React from "react";
import Overlay from "@/components/Overlay";
import { Trash2 } from "lucide-react";

interface DeleteConfirmProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
}

const DeleteConfirm: React.FC<DeleteConfirmProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Remove Record?",
    message = "This action is permanent and cannot be undone. All associated data will be removed.",
}) => {
    if (!isOpen) return null;

    return (
        <Overlay onCancel={onClose}>
            <div
                className="p-8 max-w-sm w-full rounded-[2rem] shadow-2xl flex flex-col items-center text-center gap-6"
                style={{
                    backgroundColor: 'var(--color-bg-surface)',
                    border: '1px solid var(--color-border-subtle)',
                }}
            >
                <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center">
                    <Trash2 size={32} />
                </div>
                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
                        {title}
                    </h2>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                        {message}
                    </p>
                </div>
                <div className="flex flex-col w-full gap-2">
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="w-full py-3 bg-red-600 dark:bg-red-500 text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-red-500/10 active:scale-95"
                    >
                        Confirm Delete
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full py-3 font-bold rounded-xl transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95"
                        style={{ color: 'var(--color-text-secondary)' }}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </Overlay>
    );
};

export default DeleteConfirm;
