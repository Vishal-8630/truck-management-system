import React from "react";
import Overlay from "@/components/layout/Overlay/Overlay";
import { AlertCircle, Trash2, X } from "lucide-react";
import Button from "@/components/ui/Button/Button";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    type?: "danger" | "warning" | "info";
    isLoading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    type = "danger",
    isLoading = false,
}) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case "danger": return <Trash2 size={32} />;
            case "warning": return <AlertCircle size={32} />;
            default: return <AlertCircle size={32} />;
        }
    };

    const getIconBg = () => {
        switch (type) {
            case "danger": return "bg-red-50 text-red-500";
            case "warning": return "bg-amber-50 text-amber-500";
            default: return "bg-blue-50 text-blue-500";
        }
    };

    const getConfirmBtnClass = () => {
        switch (type) {
            case "danger": return "bg-red-600 hover:bg-red-700 shadow-red-100";
            case "warning": return "bg-amber-500 hover:bg-amber-600 shadow-amber-100";
            default: return "bg-blue-600 hover:bg-blue-700 shadow-blue-100";
        }
    };

    return (
        <Overlay onCancel={onClose}>
            <div className="flex flex-col items-center text-center gap-6 max-w-sm mx-auto">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${getIconBg()}`}>
                    {getIcon()}
                </div>
                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h2>
                    <p className="text-slate-500 text-sm leading-relaxed">{message}</p>
                </div>
                <div className="flex flex-col w-full gap-2 mt-2">
                    <Button
                        onClick={onConfirm}
                        isLoading={isLoading}
                        className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg ${getConfirmBtnClass()}`}
                    >
                        {confirmText}
                    </Button>
                    <button
                        onClick={onClose}
                        className="w-full py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        <X size={18} />
                        Cancel
                    </button>
                </div>
            </div>
        </Overlay>
    );
};

export default ConfirmModal;
