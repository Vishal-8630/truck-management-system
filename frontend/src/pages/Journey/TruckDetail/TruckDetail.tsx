import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTrucks } from "@/hooks/useTrucks";
import { useMessageStore } from "@/store/useMessageStore";
import Loading from "@/components/Loading";
import type { TruckType } from "@/types/truck";
import { formatDate } from "@/utils/formatDate";
import EditHeader from "@/components/EditHeader";
import DetailBlock from "@/pages/Journey/JourneyDetail/components/DetailBlock";
import FormInputImage from "@/components/FormInputImage";
import Overlay from "@/components/Overlay";
import {
  ArrowLeft, Truck, FileText, ShieldCheck, Clock, Download,
} from "lucide-react";

const TruckDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const addMessage = useMessageStore((s) => s.addMessage);
  const { useTrucksQuery, useUpdateTruckMutation, useDeleteTruckMutation } = useTrucks();
  const { data: trucks = [], isLoading } = useTrucksQuery();
  const updateTruck = useUpdateTruckMutation();
  const deleteTruck = useDeleteTruckMutation();

  const truck = trucks.find((t) => t._id === id) ?? null;
  const [isEditMode, setIsEditMode] = useState(false);
  const [backupTruck, setBackupTruck] = useState<TruckType | null>(null);
  const [localTruck, setLocalTruck] = useState<TruckType | null>(null);
  const [changedDocuments, setChangedDocuments] = useState<Set<string>>(new Set());
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  // Sync localTruck when truck data loads
  const currentDisplay = localTruck ?? truck;

  if (isLoading || !currentDisplay) return <Loading />;

  const isDirty = JSON.stringify(truck) !== JSON.stringify(localTruck);
  const emptyFieldValue = "—";
  const safeDate = (date?: string) => date ? formatDate(new Date(date)) : emptyFieldValue;

  const handleFileSelect = (file: File | null, field: keyof TruckType) => {
    setLocalTruck((prev) => (prev ? { ...prev, [field]: file } : { ...currentDisplay, [field]: file }));
  };

  const handleSave = async () => {
    const src = localTruck ?? currentDisplay;
    try {
      const fd = new FormData();
      Object.entries(src).forEach(([key, value]) => {
        if (!value) return;
        if (value instanceof File) fd.append(key, value);
        else if (typeof value === "string") fd.append(key, value);
        else if (Array.isArray(value)) fd.append(key, JSON.stringify(value));
        else if (typeof value === "object") fd.append(key, JSON.stringify(value));
      });
      if (changedDocuments.size > 0) fd.append("changedDocuments", JSON.stringify([...changedDocuments]));
      await updateTruck.mutateAsync({ id: src._id, updatedTruck: fd });
      await queryClient.invalidateQueries({ queryKey: ["history", "truck", src._id] });
      addMessage({ type: "success", text: "Truck updated successfully" });
      setLocalTruck(null);
      setChangedDocuments(new Set());
    } catch {
      addMessage({ type: "error", text: "Failed to update truck" });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTruck.mutateAsync(currentDisplay._id);
      addMessage({ type: "success", text: "Truck deleted successfully" });
      navigate("/journey/all-truck-entries");
    } catch {
      addMessage({ type: "error", text: "Failed to delete truck" });
    }
  };

  const getExpiryStatus = (date?: string) => {
    if (!date) return "neutral";
    const diffDays = Math.ceil((new Date(date).getTime() - Date.now()) / 864e5);
    if (diffDays < 0) return "expired";
    if (diffDays < 30) return "warning";
    return "active";
  };

  return (
    <div className="flex flex-col gap-10 pb-20 max-w-7xl mx-auto">
      <div className="flex flex-col gap-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest transition-colors w-fit">
          <ArrowLeft size={14} /> Back to Fleet
        </button>
        <EditHeader
          heading="Vehicle Profile"
          isDirty={isDirty}
          historyEntityType="truck"
          historyEntityId={currentDisplay._id}
          onEditClick={() => { setBackupTruck(currentDisplay); setLocalTruck({ ...currentDisplay }); setIsEditMode(true); setChangedDocuments(new Set()); }}
          onCancelClick={() => { setLocalTruck(backupTruck); setIsEditMode(false); }}
          onSaveClick={() => { setIsEditMode(false); handleSave(); }}
          onDeleteClick={handleDelete}
          onDiscardClick={() => { setLocalTruck(backupTruck); setIsEditMode(false); }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 flex flex-col gap-8">
          <div className="card-premium p-8 flex flex-col items-center text-center gap-6 bg-slate-900 border-slate-800 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
            <div className="w-24 h-24 rounded-3xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <Truck size={40} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col gap-2 relative z-10">
              <h2 className="text-3xl font-black italic tracking-tight text-white uppercase">{currentDisplay.truck_no}</h2>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Heavy Load Carrier</div>
            </div>
          </div>

          <div className="card-premium p-6 flex flex-col gap-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
              <Clock size={14} className="text-indigo-500" /> Renewal Reminders
            </h3>
            <div className="flex flex-col gap-4">
              {[
                { label: "Insurance", date: currentDisplay.insurance_doc_expiry },
                { label: "National Permit", date: currentDisplay.national_permit_doc_expiry },
                { label: "Pollution (PUCC)", date: currentDisplay.pollution_doc_expiry },
              ].map((item, i) => {
                const status = getExpiryStatus(item.date);
                return (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-700">{item.label}</span>
                      <span className="text-[10px] font-medium text-slate-400 uppercase">{safeDate(item.date)}</span>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${status === "expired" ? "bg-red-500 animate-pulse" : status === "warning" ? "bg-amber-500" : "bg-emerald-500"}`} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 flex flex-col gap-10">
          <DetailBlock
            title="Operational Records"
            icon={<FileText size={18} />}
            isEditMode={isEditMode}
            onChange={(key, value) => setLocalTruck((prev) => (prev ? { ...prev, [key]: value } : prev))}
            fields={[
              { key: "truck_no", label: "Truck Registration", value: currentDisplay.truck_no, isEditable: true },
              { key: "fitness_doc_expiry", label: "Fitness Validity", value: safeDate(currentDisplay.fitness_doc_expiry), isEditable: true },
              { key: "insurance_doc_expiry", label: "Insurance Expiry", value: safeDate(currentDisplay.insurance_doc_expiry), isEditable: true },
              { key: "national_permit_doc_expiry", label: "National Permit", value: safeDate(currentDisplay.national_permit_doc_expiry), isEditable: true },
              { key: "state_permit_doc_expiry", label: "State Permit", value: safeDate(currentDisplay.state_permit_doc_expiry), isEditable: true },
              { key: "tax_doc_expiry", label: "Tax Validity", value: safeDate(currentDisplay.tax_doc_expiry), isEditable: true },
              { key: "pollution_doc_expiry", label: "Pollution (PUCC)", value: safeDate(currentDisplay.pollution_doc_expiry), isEditable: true },
            ]}
          />

          <DetailBlock
            title="Compliance Vault"
            icon={<ShieldCheck size={18} />}
            fields={[]}
            isEditMode={isEditMode}
            childs={
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {(["fitness_doc", "insurance_doc", "national_permit_doc", "state_permit_doc", "tax_doc", "pollution_doc"] as (keyof TruckType)[]).map((docKey) => (
                  <FormInputImage
                    key={docKey}
                    label={docKey.replace(/_doc$/, "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    id={docKey}
                    name={docKey}
                    isEditMode={isEditMode}
                    value={typeof currentDisplay[docKey] === "string" ? (currentDisplay[docKey] as string) : ""}
                    onFileSelect={(file) => { handleFileSelect(file, docKey); setChangedDocuments((p) => new Set([...p, docKey])); }}
                    onFileClick={(preview) => setPreviewImg(preview)}
                  />
                ))}
              </div>
            }
          />
        </div>
      </div>

      {previewImg && (
        <Overlay onCancel={() => setPreviewImg("")}>
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-[2.5rem] bg-white p-4 shadow-2xl">
            <img src={previewImg} alt="Preview" className="w-full h-full object-contain rounded-3xl" />
            <button
              className="absolute top-8 right-8 p-4 bg-indigo-600 text-white rounded-2xl shadow-xl hover:bg-indigo-700 transition-all flex items-center gap-2 font-black text-[10px] uppercase"
              onClick={() => { const a = document.createElement("a"); a.href = previewImg; a.download = "truck-document.jpg"; a.click(); }}
            >
              <Download size={18} /> Download
            </button>
          </div>
        </Overlay>
      )}
    </div>
  );
};

export default TruckDetail;
