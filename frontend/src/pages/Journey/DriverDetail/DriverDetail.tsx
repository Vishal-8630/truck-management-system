import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { useDrivers } from "@/hooks/useDrivers";
import { useSettlements } from "@/hooks/useSettlements";
import { useMessageStore } from "@/store/useMessageStore";
import Loading from "@/components/Loading";
import type { DriverType } from "@/types/driver";
import EditHeader from "@/components/EditHeader";
import DetailBlock from "@/pages/Journey/JourneyDetail/components/DetailBlock";
import FormInputImage from "@/components/FormInputImage";
import { formatDate } from "@/utils/formatDate";
import Overlay from "@/components/Overlay";
import {
  ArrowLeft, User, CreditCard, Image as ImageIcon, Calculator,
  Download, ChevronRight, ShieldCheck, Briefcase,
} from "lucide-react";

const DriverDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addMessage = useMessageStore((s) => s.addMessage);
  const { useDriversQuery, useUpdateDriverMutation, useDeleteDriverMutation } = useDrivers();
  const { useSettlementsQuery } = useSettlements();
  const { data: drivers = [], isLoading } = useDriversQuery();
  const { data: settlements = [] } = useSettlementsQuery();
  const updateDriver = useUpdateDriverMutation();
  const deleteDriver = useDeleteDriverMutation();

  const driver = drivers.find((d) => d._id === id) ?? null;
  const [isEditMode, setIsEditMode] = useState(false);
  const [localDriver, setLocalDriver] = useState<DriverType | null>(null);
  const [backupDriver, setBackupDriver] = useState<DriverType | null>(null);
  const [changedDocuments, setChangedDocuments] = useState<Set<string>>(new Set());
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  const currentDisplay = localDriver ?? driver;
  if (isLoading || !currentDisplay) return <Loading />;

  const driverSettlements = settlements.filter((s: any) => s.driver?._id === currentDisplay._id);
  const isDirty = JSON.stringify(localDriver) !== JSON.stringify(driver);
  const emptyFieldValue = "—";
  const safeDate = (date?: string) => date ? formatDate(new Date(date)) : emptyFieldValue;

  const handleFileSelect = (file: File | null, field: keyof DriverType) => {
    setLocalDriver((prev) => (prev ? { ...prev, [field]: file } : { ...currentDisplay, [field]: file }));
  };

  const handleDelete = async () => {
    try {
      await deleteDriver.mutateAsync(currentDisplay._id);
      addMessage({ type: "success", text: "Driver deleted successfully" });
      navigate("/journey/all-driver-entries");
    } catch {
      addMessage({ type: "error", text: "Failed to delete driver" });
    }
  };

  const handleSave = async () => {
    const src = localDriver ?? currentDisplay;
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
      await updateDriver.mutateAsync({ id: src._id, updatedDriver: fd });
      addMessage({ type: "success", text: "Driver updated successfully" });
      setLocalDriver(null);
    } catch {
      addMessage({ type: "error", text: "Failed to update driver" });
    }
  };

  return (
    <div className="flex flex-col gap-10 pb-20 max-w-7xl mx-auto">
      <div className="flex flex-col gap-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest transition-colors w-fit">
          <ArrowLeft size={14} /> Back to Drivers
        </button>
        <EditHeader
          heading="Driver Portfolio"
          isDirty={isDirty}
          onEditClick={() => { setIsEditMode(true); setBackupDriver(currentDisplay); setLocalDriver({ ...currentDisplay }); }}
          onCancelClick={() => { setLocalDriver(backupDriver); setIsEditMode(false); }}
          onDeleteClick={handleDelete}
          onDiscardClick={() => { setLocalDriver(backupDriver); setIsEditMode(false); }}
          onSaveClick={() => { handleSave(); setIsEditMode(false); }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 flex flex-col gap-8">
          <div className="card-premium p-8 flex flex-col items-center text-center gap-6 bg-slate-900 border-slate-800 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/10 shadow-2xl">
                <img
                  src={typeof currentDisplay.driver_img === "string" ? currentDisplay.driver_img : ""}
                  alt={currentDisplay.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-emerald-500 text-white rounded-full border-4 border-slate-900 flex items-center justify-center shadow-lg">
                <ShieldCheck size={18} />
              </div>
            </div>
            <div className="flex flex-col gap-2 relative z-10">
              <h2 className="text-3xl font-black italic tracking-tight text-white">{currentDisplay.name}</h2>
              <div className="flex items-center justify-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                <Briefcase size={12} className="text-indigo-400" /> Senior Logistics Associate
              </div>
            </div>
            <div className="w-full pt-6 border-t border-white/5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</span>
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest italic">On-Duty</span>
              </div>
            </div>
          </div>

          <DetailBlock
            title="Legal Credentials"
            icon={<CreditCard size={18} />}
            isEditMode={isEditMode}
            onChange={(key, value) => setLocalDriver((prev) => (prev ? { ...prev, [key]: value } : prev))}
            fields={[
              { key: "adhaar_no", label: "Adhaar Number", value: currentDisplay.adhaar_no, isEditable: true },
              { key: "dl", label: "Driving Licence (DL)", value: currentDisplay.dl, isEditable: true },
            ]}
          />
        </div>

        <div className="lg:col-span-8 flex flex-col gap-10">
          <DetailBlock
            title="Profile Specifications"
            icon={<User size={18} />}
            isEditMode={isEditMode}
            onChange={(key, value) => setLocalDriver((prev) => (prev ? { ...prev, [key]: value } : prev))}
            fields={[
              { key: "name", label: "Full Name", value: currentDisplay.name, isEditable: true },
              { key: "phone", label: "Mobile No.", value: currentDisplay.phone, isEditable: true },
              { key: "home_phone", label: "Home Contact", value: currentDisplay.home_phone, isEditable: true },
              { key: "address", label: "Address", value: currentDisplay.address, isEditable: true },
            ]}
          />

          <DetailBlock
            title="Digital Documentation"
            icon={<ImageIcon size={18} />}
            fields={[]}
            isEditMode={isEditMode}
            childs={
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {(["driver_img", "adhaar_front_img", "adhaar_back_img", "dl_front_img", "dl_back_img"] as (keyof DriverType)[]).map((docKey) => (
                  <FormInputImage
                    key={docKey}
                    label={docKey.replace(/_img$/, "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
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

      {/* Settlements Table */}
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h2 className="text-3xl font-black tracking-tight text-slate-900 leading-tight italic flex items-center gap-4">
            <Calculator className="text-indigo-600 w-8 h-8" /> Salary <span className="text-indigo-600">Settlements</span>
          </h2>
          <button
            className="flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl hover:bg-slate-800 hover:-translate-y-1 transition-all"
            onClick={() => navigate(`/journey/driver-detail/${currentDisplay._id}/settlement`)}
          >
            <Calculator size={18} /> Run New Settlement
          </button>
        </div>

        <div className="card-premium overflow-hidden border-slate-100 p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  {["S. No.", "Period From", "Period To", "Trips", "Distance", "Earnings", "Status", ""].map((h) => (
                    <th key={h} className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {driverSettlements.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-20 text-center">
                      <p className="text-slate-400 font-bold italic">No settlements found for this driver.</p>
                    </td>
                  </tr>
                ) : (
                  driverSettlements.map((settlement: any, index: number) => (
                    <tr
                      key={settlement._id}
                      onClick={() => navigate(`settlement/${settlement._id}`)}
                      className="hover:bg-indigo-50/30 cursor-pointer transition-colors group"
                    >
                      <td className="px-6 py-5 text-sm font-bold text-slate-400">#{(index + 1).toString().padStart(2, "0")}</td>
                      <td className="px-6 py-5 text-sm font-bold text-slate-700">{safeDate(settlement.period?.from)}</td>
                      <td className="px-6 py-5 text-sm font-bold text-slate-700">{safeDate(settlement.period?.to)}</td>
                      <td className="px-6 py-5 text-center">
                        <span className="inline-flex px-3 py-1 bg-white border border-slate-100 rounded-lg text-xs font-black text-slate-600">{settlement.journeys?.length ?? 0}</span>
                      </td>
                      <td className="px-6 py-5 text-sm font-black text-slate-700 text-right">{settlement.total_distance} km</td>
                      <td className="px-6 py-5 text-sm font-black text-indigo-600 text-right italic">₹{settlement.overall_total}</td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${settlement.status === "Paid to Driver" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${settlement.status === "Paid to Driver" ? "bg-emerald-500" : "bg-amber-500"}`} />
                          {settlement.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {previewImg && (
        <Overlay onCancel={() => setPreviewImg("")}>
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-[2.5rem] bg-white p-4 shadow-2xl">
            <img src={previewImg} alt="Preview" className="w-full h-full object-contain rounded-3xl" />
            <button
              className="absolute top-8 right-8 p-4 bg-indigo-600 text-white rounded-2xl shadow-xl hover:bg-indigo-700 transition-all flex items-center gap-2 font-black text-[10px] uppercase"
              onClick={() => { const a = document.createElement("a"); a.href = previewImg; a.download = "document.jpg"; a.click(); }}
            >
              <Download size={18} /> Download
            </button>
          </div>
        </Overlay>
      )}
    </div>
  );
};

export default DriverDetail;
